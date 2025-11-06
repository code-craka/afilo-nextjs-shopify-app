/**
 * Chat Export API Route
 *
 * GET /api/admin/chat/export/[id] - Export conversation transcript (TXT or JSON)
 *
 * Admin-only endpoint for exporting chat transcripts.
 *
 * Phase 4: Admin Dashboard Implementation
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
} from '@/lib/chat-auth';

const sql = neon(process.env.DATABASE_URL!);

// Type definitions for database query results
interface KnowledgeBaseArticle {
  title: string;
  url: string;
  score: number;
}

interface MessageRow {
  id: string;
  role: string;
  content: string;
  metadata: {
    knowledgeBaseArticles?: KnowledgeBaseArticle[];
    [key: string]: unknown;
  } | null;
  created_at: string;
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
    console.error('[EXPORT] Admin check failed:', error);
    return false;
  }
}

/**
 * GET - Export conversation transcript
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

    // Validate conversation ID
    const conversationId = id;
    if (!isValidUUID(conversationId)) {
      return badRequestResponse('Invalid conversation ID format');
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'txt'; // txt, json

    // Get conversation with messages
    const conversation = await sql`
      SELECT
        c.id,
        c.clerk_user_id,
        c.title,
        c.status,
        c.created_at,
        c.updated_at,
        c.last_message_at,
        up.email as user_email,
        up.subscription_tier
      FROM chat_conversations c
      LEFT JOIN user_profiles up ON c.clerk_user_id = up.clerk_user_id
      WHERE c.id = ${conversationId}
      LIMIT 1
    `;

    if (conversation.length === 0) {
      return notFoundResponse('Conversation not found');
    }

    const conv = conversation[0];

    // Get all messages
    const messages = await sql`
      SELECT
        id,
        role,
        content,
        metadata,
        created_at
      FROM chat_messages
      WHERE conversation_id = ${conversationId}
      ORDER BY created_at ASC
    `;

    console.log('[EXPORT] Exporting conversation:', conversationId, `(${format})`);

    // Export as JSON
    if (format === 'json') {
      const exportData = {
        conversation: {
          id: conv.id,
          userId: conv.clerk_user_id,
          userEmail: conv.user_email,
          title: conv.title,
          status: conv.status,
          tier: conv.subscription_tier || 'free',
          createdAt: conv.created_at,
          updatedAt: conv.updated_at,
          lastMessageAt: conv.last_message_at,
        },
        messages: (messages as MessageRow[]).map((msg: MessageRow) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          metadata: msg.metadata,
          createdAt: msg.created_at,
        })),
        exportedAt: new Date().toISOString(),
        exportedBy: userId,
      };

      // Track analytics
      await sql`
        INSERT INTO bot_analytics (
          conversation_id,
          event_type,
          event_data,
          created_at
        )
        VALUES (
          ${conversationId},
          'conversation_exported',
          ${JSON.stringify({ format: 'json', exportedBy: userId })}::jsonb,
          NOW()
        )
      `;

      return NextResponse.json(exportData, {
        headers: {
          'Content-Disposition': `attachment; filename="conversation-${conversationId}.json"`,
        },
      });
    }

    // Export as TXT (default)
    const lines: string[] = [];

    // Header
    lines.push('='.repeat(80));
    lines.push(`AFILO SUPPORT CHAT TRANSCRIPT`);
    lines.push('='.repeat(80));
    lines.push('');
    lines.push(`Conversation ID: ${conv.id}`);
    lines.push(`Title: ${conv.title || 'Untitled'}`);
    lines.push(`User: ${conv.user_email || conv.clerk_user_id}`);
    lines.push(`Tier: ${conv.subscription_tier || 'free'}`);
    lines.push(`Status: ${conv.status}`);
    lines.push(`Created: ${new Date(conv.created_at).toLocaleString()}`);
    lines.push(`Last Activity: ${new Date(conv.last_message_at).toLocaleString()}`);
    lines.push('');
    lines.push('='.repeat(80));
    lines.push('');

    // Messages
    (messages as MessageRow[]).forEach((msg: MessageRow) => {
      const timestamp = new Date(msg.created_at).toLocaleString();
      const role = msg.role.toUpperCase();

      lines.push(`[${timestamp}] ${role}:`);
      lines.push(msg.content);

      // Add KB articles if available
      if (msg.role === 'assistant' && msg.metadata?.knowledgeBaseArticles) {
        const articles = msg.metadata.knowledgeBaseArticles;
        if (articles.length > 0) {
          lines.push('');
          lines.push('  Referenced Articles:');
          articles.forEach((article: KnowledgeBaseArticle) => {
            lines.push(`  - ${article.title} (${article.url}) [Score: ${(article.score * 100).toFixed(1)}%]`);
          });
        }
      }

      lines.push('');
      lines.push('-'.repeat(80));
      lines.push('');
    });

    // Footer
    lines.push('='.repeat(80));
    lines.push(`Exported: ${new Date().toLocaleString()}`);
    lines.push(`Total Messages: ${messages.length}`);
    lines.push('='.repeat(80));

    const transcript = lines.join('\n');

    // Track analytics
    await sql`
      INSERT INTO bot_analytics (
        conversation_id,
        event_type,
        event_data,
        created_at
      )
      VALUES (
        ${conversationId},
        'conversation_exported',
        ${JSON.stringify({ format: 'txt', exportedBy: userId })}::jsonb,
        NOW()
      )
    `;

    return new NextResponse(transcript, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="conversation-${conversationId}.txt"`,
      },
    });
  } catch (error) {
    console.error('[EXPORT] Error exporting conversation:', error);
    return serverErrorResponse(error);
  }
}
