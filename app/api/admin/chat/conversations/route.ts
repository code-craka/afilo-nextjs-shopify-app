/**
 * Admin Chat Conversations API Route
 *
 * GET /api/admin/chat/conversations - List all conversations with filters
 *
 * Admin-only endpoint for managing and viewing all chat conversations.
 *
 * Phase 4: Admin Dashboard Implementation
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { requireAuth, serverErrorResponse, forbiddenResponse } from '@/lib/chat-auth';

const sql = neon(process.env.DATABASE_URL!);

// Type definitions for database query results
interface ConversationRow {
  id: string;
  clerk_user_id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  message_count: string;  // SQL returns string, we parseInt later
  subscription_tier: string;
  user_email: string;
  first_message: string | null;
  last_message: string | null;
}

interface TotalResultRow {
  total: string;
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
    console.error('[ADMIN_CONVERSATIONS] Admin check failed:', error);
    return false;
  }
}

/**
 * GET - List all conversations with filters
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);
    const status = searchParams.get('status'); // active, resolved, archived
    const tier = searchParams.get('tier'); // free, professional, enterprise, enterprise_plus
    const search = searchParams.get('search'); // Search in title or user email
    const sortBy = searchParams.get('sortBy') || 'last_message_at'; // created_at, last_message_at, message_count
    const sortOrder = searchParams.get('sortOrder') || 'DESC'; // ASC, DESC

    console.log('[ADMIN_CONVERSATIONS] Fetching conversations:', { limit, offset, status, tier, search, sortBy, sortOrder });

    // Build filters
    const filters: string[] = [];

    if (status) {
      filters.push(`c.status = '${status}'`);
    }

    if (search) {
      filters.push(`(c.title ILIKE '%${search}%' OR up.email ILIKE '%${search}%')`);
    }

    const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

    // Get conversations with user info and message count
    const conversations = await sql.unsafe(`
      SELECT
        c.id,
        c.clerk_user_id,
        c.title,
        c.status,
        c.created_at,
        c.updated_at,
        c.last_message_at,
        up.email as user_email,
        up.subscription_tier,
        COUNT(m.id) as message_count,
        (
          SELECT content
          FROM chat_messages
          WHERE conversation_id = c.id
            AND role = 'user'
          ORDER BY created_at ASC
          LIMIT 1
        ) as first_message,
        (
          SELECT content
          FROM chat_messages
          WHERE conversation_id = c.id
          ORDER BY created_at DESC
          LIMIT 1
        ) as last_message
      FROM chat_conversations c
      LEFT JOIN user_profiles up ON c.clerk_user_id = up.clerk_user_id
      LEFT JOIN chat_messages m ON c.id = m.conversation_id
      ${whereClause}
      GROUP BY c.id, up.email, up.subscription_tier
      ORDER BY ${sortBy === 'message_count' ? 'message_count' : `c.${sortBy}`} ${sortOrder}
      LIMIT ${limit}
      OFFSET ${offset}
    `);

    // Get total count
    const totalResult = await sql.unsafe(`
      SELECT COUNT(DISTINCT c.id) as total
      FROM chat_conversations c
      LEFT JOIN user_profiles up ON c.clerk_user_id = up.clerk_user_id
      ${whereClause}
    `);

    const total = parseInt((totalResult as unknown as TotalResultRow[])[0]?.total || '0');

    // Filter by tier if specified (done in post-processing since tier comes from metadata)
    const conversationsArray = conversations as unknown as ConversationRow[];
    let filteredConversations = conversationsArray;
    if (tier) {
      filteredConversations = conversationsArray.filter((conv: ConversationRow) =>
        conv.subscription_tier === tier
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        conversations: filteredConversations.map((conv: ConversationRow) => ({
          id: conv.id,
          userId: conv.clerk_user_id,
          userEmail: conv.user_email,
          title: conv.title,
          status: conv.status,
          tier: conv.subscription_tier || 'free',
          messageCount: parseInt(conv.message_count, 10),
          firstMessage: conv.first_message ? conv.first_message.substring(0, 200) : null,
          lastMessage: conv.last_message ? conv.last_message.substring(0, 200) : null,
          createdAt: conv.created_at,
          updatedAt: conv.updated_at,
          lastMessageAt: conv.last_message_at,
        })),
        pagination: {
          limit,
          offset,
          total,
          hasMore: offset + filteredConversations.length < total,
        },
      },
    });
  } catch (error) {
    console.error('[ADMIN_CONVERSATIONS] Error fetching conversations:', error);
    return serverErrorResponse(error);
  }
}
