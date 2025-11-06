/**
 * Individual Knowledge Base Entry API Route
 *
 * GET /api/admin/knowledge-base/[id] - Get single entry
 * PUT /api/admin/knowledge-base/[id] - Update entry
 * DELETE /api/admin/knowledge-base/[id] - Delete entry
 *
 * Admin-only endpoints for managing individual KB entries.
 *
 * Phase 2: Knowledge Base Implementation
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import {
  requireAuth,
  serverErrorResponse,
  forbiddenResponse,
  badRequestResponse,
  notFoundResponse,
  isValidUUID,
  validateString,
} from '@/lib/chat-auth';
import { generateEmbedding, prepareTextForEmbedding } from '@/lib/embeddings';

const sql = neon(process.env.DATABASE_URL!);

/**
 * Check if user is admin
 */
async function isAdmin(userId: string): Promise<boolean> {
  try {
    const result = await sql`
      SELECT role
      FROM user_profiles
      WHERE clerk_user_id = ${userId}
      LIMIT 1
    `;

    if (result.length === 0) {
      return false;
    }

    return result[0].role === 'admin' || result[0].role === 'owner';
  } catch (error) {
    console.error('[KB_ENTRY] Admin check failed:', error);
    return false;
  }
}

/**
 * GET - Get single KB entry
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const { userId } = await requireAuth();

    // Check admin permissions
    const adminStatus = await isAdmin(userId);
    if (!adminStatus) {
      return forbiddenResponse('Admin access required');
    }

    // Await params (Next.js 16 requirement)
    const { id } = await params;

    // Validate entry ID
    const entryId = id;
    if (!isValidUUID(entryId)) {
      return badRequestResponse('Invalid entry ID format');
    }

    // Get entry
    const result = await sql`
      SELECT
        id,
        url,
        title,
        content,
        content_type,
        metadata,
        created_at,
        updated_at
      FROM knowledge_base
      WHERE id = ${entryId}
      LIMIT 1
    `;

    if (result.length === 0) {
      return notFoundResponse('Knowledge base entry not found');
    }

    return NextResponse.json({
      success: true,
      data: {
        entry: result[0],
      },
    });
  } catch (error) {
    console.error('[KB_ENTRY] Error getting entry:', error);
    return serverErrorResponse(error);
  }
}

/**
 * PUT - Update KB entry
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const { userId } = await requireAuth();

    // Check admin permissions
    const adminStatus = await isAdmin(userId);
    if (!adminStatus) {
      return forbiddenResponse('Admin access required');
    }

    // Await params (Next.js 16 requirement)
    const { id } = await params;

    // Validate entry ID
    const entryId = id;
    if (!isValidUUID(entryId)) {
      return badRequestResponse('Invalid entry ID format');
    }

    // Parse request body
    const body = await request.json();
    const { title, content, contentType, tags } = body;

    // Check if entry exists
    const existing = await sql`
      SELECT id
      FROM knowledge_base
      WHERE id = ${entryId}
      LIMIT 1
    `;

    if (existing.length === 0) {
      return notFoundResponse('Knowledge base entry not found');
    }

    // Validate fields if provided
    if (title !== undefined) {
      try {
        validateString(title, 500);
      } catch (error) {
        return badRequestResponse(
          'Invalid title',
          error instanceof Error ? error.message : 'Validation failed'
        );
      }
    }

    if (content !== undefined) {
      try {
        validateString(content, 50000);
      } catch (error) {
        return badRequestResponse(
          'Invalid content',
          error instanceof Error ? error.message : 'Validation failed'
        );
      }
    }

    if (contentType !== undefined) {
      const validContentTypes = ['page', 'product', 'faq', 'documentation'];
      if (!validContentTypes.includes(contentType)) {
        return badRequestResponse(
          'Invalid content type',
          `Must be one of: ${validContentTypes.join(', ')}`
        );
      }
    }

    // Build update query
    const updates: string[] = [];
    const values: Record<string, unknown> = {};

    if (title !== undefined) {
      updates.push('title = ${title}');
      values.title = title;
    }

    if (content !== undefined) {
      updates.push('content = ${content}');
      values.content = content;
    }

    if (contentType !== undefined) {
      updates.push('content_type = ${contentType}');
      values.contentType = contentType;
    }

    // Regenerate embedding if title or content changed
    if (title !== undefined || content !== undefined) {
      // Get current values
      const current = await sql`
        SELECT title, content
        FROM knowledge_base
        WHERE id = ${entryId}
        LIMIT 1
      `;

      const finalTitle = title !== undefined ? title : current[0].title;
      const finalContent = content !== undefined ? content : current[0].content;

      console.log('[KB_ENTRY] Regenerating embedding...');
      const preparedText = prepareTextForEmbedding(`${finalTitle}\n\n${finalContent}`);
      const embedding = await generateEmbedding(preparedText);

      updates.push('embedding = ${embedding}');
      values.embedding = JSON.stringify(embedding) + '::vector';
    }

    // Update metadata if tags changed
    if (tags !== undefined) {
      const currentMetadata = existing[0].metadata || {};
      const newMetadata = {
        ...currentMetadata,
        tags,
        lastUpdated: new Date(),
        updatedBy: userId,
      };

      updates.push('metadata = ${metadata}');
      values.metadata = JSON.stringify(newMetadata) + '::jsonb';
    }

    // Always update timestamp
    updates.push('updated_at = NOW()');

    if (updates.length === 1) {
      // Only timestamp update, no actual changes
      return badRequestResponse('No valid updates provided');
    }

    // Execute update
    const result = await sql`
      UPDATE knowledge_base
      SET ${sql.unsafe(updates.join(', '))}
      WHERE id = ${entryId}
      RETURNING
        id,
        url,
        title,
        content_type,
        metadata,
        updated_at
    `;

    console.log('[KB_ENTRY] ✓ Updated KB entry:', entryId);

    // Track analytics
    await sql`
      INSERT INTO bot_analytics (
        event_type,
        event_data,
        created_at
      )
      VALUES (
        'knowledge_base_update',
        ${JSON.stringify({ entryId, userId, updates: Object.keys(values) })}::jsonb,
        NOW()
      )
    `;

    return NextResponse.json({
      success: true,
      data: {
        entry: result[0],
      },
      message: 'Knowledge base entry updated successfully',
    });
  } catch (error) {
    console.error('[KB_ENTRY] Error updating entry:', error);
    return serverErrorResponse(error);
  }
}

/**
 * DELETE - Delete KB entry
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const { userId } = await requireAuth();

    // Check admin permissions
    const adminStatus = await isAdmin(userId);
    if (!adminStatus) {
      return forbiddenResponse('Admin access required');
    }

    // Await params (Next.js 16 requirement)
    const { id } = await params;

    // Validate entry ID
    const entryId = id;
    if (!isValidUUID(entryId)) {
      return badRequestResponse('Invalid entry ID format');
    }

    // Check if entry exists
    const existing = await sql`
      SELECT id, url
      FROM knowledge_base
      WHERE id = ${entryId}
      LIMIT 1
    `;

    if (existing.length === 0) {
      return notFoundResponse('Knowledge base entry not found');
    }

    // Delete entry
    await sql`
      DELETE FROM knowledge_base
      WHERE id = ${entryId}
    `;

    console.log('[KB_ENTRY] ✓ Deleted KB entry:', entryId);

    // Track analytics
    await sql`
      INSERT INTO bot_analytics (
        event_type,
        event_data,
        created_at
      )
      VALUES (
        'knowledge_base_delete',
        ${JSON.stringify({ entryId, url: existing[0].url, userId })}::jsonb,
        NOW()
      )
    `;

    return NextResponse.json({
      success: true,
      message: 'Knowledge base entry deleted successfully',
    });
  } catch (error) {
    console.error('[KB_ENTRY] Error deleting entry:', error);
    return serverErrorResponse(error);
  }
}
