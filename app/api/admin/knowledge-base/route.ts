/**
 * Knowledge Base Management API Route
 *
 * GET /api/admin/knowledge-base - List all KB entries with pagination
 * POST /api/admin/knowledge-base - Create new KB entry manually
 *
 * Admin-only endpoints for managing knowledge base content.
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
  validateString,
} from '@/lib/chat-auth';
import { generateEmbedding, prepareTextForEmbedding } from '@/lib/embeddings';

const sql = neon(process.env.DATABASE_URL!);

// Type definitions for database query results
interface KnowledgeBaseEntry {
  id: string;
  url: string;
  title: string;
  content: string;
  content_type: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

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
    console.error('[KB_API] Admin check failed:', error);
    return false;
  }
}

/**
 * GET - List all KB entries
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await requireAuth();

    // Check admin permissions
    const adminStatus = await isAdmin(userId);
    if (!adminStatus) {
      return forbiddenResponse('Admin access required');
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);
    const contentType = searchParams.get('contentType') || null;
    const searchQuery = searchParams.get('search') || null;

    // Build filters
    let contentTypeFilter = '';
    if (contentType) {
      contentTypeFilter = `AND content_type = '${contentType}'`;
    }

    let searchFilter = '';
    if (searchQuery) {
      searchFilter = `AND (title ILIKE '%${searchQuery}%' OR content ILIKE '%${searchQuery}%')`;
    }

    // Get entries
    const entries = await sql`
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
      WHERE 1=1
      ${contentTypeFilter ? sql.unsafe(contentTypeFilter) : sql``}
      ${searchFilter ? sql.unsafe(searchFilter) : sql``}
      ORDER BY updated_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    // Get total count
    const countResult = await sql`
      SELECT COUNT(*) as total
      FROM knowledge_base
      WHERE 1=1
      ${contentTypeFilter ? sql.unsafe(contentTypeFilter) : sql``}
      ${searchFilter ? sql.unsafe(searchFilter) : sql``}
    `;

    const total = parseInt(countResult[0]?.total || '0');

    return NextResponse.json({
      success: true,
      data: {
        entries: (entries as KnowledgeBaseEntry[]).map((entry: KnowledgeBaseEntry) => ({
          id: entry.id,
          url: entry.url,
          title: entry.title,
          content: entry.content.slice(0, 200) + '...', // Preview only
          contentType: entry.content_type,
          metadata: entry.metadata,
          createdAt: entry.created_at,
          updatedAt: entry.updated_at,
        })),
        pagination: {
          limit,
          offset,
          total,
          hasMore: offset + limit < total,
        },
      },
    });
  } catch (error) {
    console.error('[KB_API] Error listing entries:', error);
    return serverErrorResponse(error);
  }
}

/**
 * POST - Create new KB entry manually
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await requireAuth();

    // Check admin permissions
    const adminStatus = await isAdmin(userId);
    if (!adminStatus) {
      return forbiddenResponse('Admin access required');
    }

    // Parse request body
    const body = await request.json();
    const { url, title, content, contentType, tags } = body;

    // Validate required fields
    try {
      validateString(url, 2000);
      validateString(title, 500);
      validateString(content, 50000);
    } catch (error) {
      return badRequestResponse(
        'Invalid input',
        error instanceof Error ? error.message : 'Validation failed'
      );
    }

    // Validate content type
    const validContentTypes = ['page', 'product', 'faq', 'documentation'];
    if (!validContentTypes.includes(contentType)) {
      return badRequestResponse(
        'Invalid content type',
        `Must be one of: ${validContentTypes.join(', ')}`
      );
    }

    // Check if URL already exists
    const existing = await sql`
      SELECT id
      FROM knowledge_base
      WHERE url = ${url}
      LIMIT 1
    `;

    if (existing.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'URL already exists in knowledge base',
        },
        { status: 409 }
      );
    }

    // Generate embedding
    console.log('[KB_API] Generating embedding for new entry...');
    const preparedText = prepareTextForEmbedding(`${title}\n\n${content}`);
    const embedding = await generateEmbedding(preparedText);

    // Calculate word count
    const wordCount = content.split(/\s+/).filter(Boolean).length;

    // Create metadata
    const metadata = {
      wordCount,
      tags: tags || [],
      lastCrawled: new Date(),
      manuallyAdded: true,
      addedBy: userId,
    };

    // Insert entry
    const result = await sql`
      INSERT INTO knowledge_base (
        url,
        title,
        content,
        content_type,
        embedding,
        metadata,
        created_at,
        updated_at
      )
      VALUES (
        ${url},
        ${title},
        ${content},
        ${contentType},
        ${JSON.stringify(embedding)}::vector,
        ${JSON.stringify(metadata)}::jsonb,
        NOW(),
        NOW()
      )
      RETURNING
        id,
        url,
        title,
        content_type,
        metadata,
        created_at,
        updated_at
    `;

    console.log('[KB_API] ✓ Created new KB entry:', url);

    // Track analytics
    await sql`
      INSERT INTO bot_analytics (
        event_type,
        event_data,
        created_at
      )
      VALUES (
        'knowledge_base_manual_add',
        ${JSON.stringify({ url, title, contentType, userId })}::jsonb,
        NOW()
      )
    `;

    return NextResponse.json({
      success: true,
      data: {
        entry: result[0],
      },
      message: 'Knowledge base entry created successfully',
    });
  } catch (error) {
    console.error('[KB_API] Error creating entry:', error);
    return serverErrorResponse(error);
  }
}
