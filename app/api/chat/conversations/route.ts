/**
 * Chat Conversations API Route
 *
 * POST /api/chat/conversations - Create new conversation
 * GET /api/chat/conversations - List user's conversations
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import {
  requireAuth,
  badRequestResponse,
  serverErrorResponse,
  validateString,
} from '@/lib/chat-auth';
import {
  checkRateLimit,
  getRateLimitIdentifier,
  getClientIp,
  moderateBillingRateLimit,
  standardBillingRateLimit,
} from '@/lib/rate-limit';
import type {
  CreateConversationRequest,
  CreateConversationResponse,
  ListConversationsResponse,
} from '@/types/api';
// ChatConversation type not directly used in exports

const sql = neon(process.env.DATABASE_URL!);

// ====================================
// POST - Create Conversation
// ====================================

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await requireAuth();

    // PHASE 5: Rate limiting for conversation creation (moderate limits)
    const ip = getClientIp(request);
    const identifier = getRateLimitIdentifier(userId, ip);
    const rateLimitResult = await checkRateLimit(identifier, moderateBillingRateLimit);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded',
          message: 'Too many conversations created. Please wait before creating another conversation.',
        },
        {
          status: 429,
          headers: rateLimitResult.headers,
        }
      );
    }

    // Parse request body
    const body: CreateConversationRequest = await request.json();
    const { title, initialMessage } = body;

    // Validate title if provided
    let validatedTitle: string | null = null;
    if (title) {
      try {
        validatedTitle = validateString(title, 500);
      } catch (error) {
        return badRequestResponse(
          'Invalid title',
          error instanceof Error ? error.message : 'Title validation failed'
        );
      }
    }

    // Create conversation
    const conversationResult = await sql`
      INSERT INTO chat_conversations (
        clerk_user_id,
        title,
        status,
        created_at,
        updated_at,
        last_message_at
      )
      VALUES (
        ${userId},
        ${validatedTitle},
        'active',
        NOW(),
        NOW(),
        NOW()
      )
      RETURNING
        id,
        clerk_user_id,
        title,
        status,
        created_at,
        updated_at,
        last_message_at
    `;

    const conversation = conversationResult[0];

    const response: CreateConversationResponse = {
      conversation: {
        id: conversation.id,
        clerkUserId: conversation.clerk_user_id,
        title: conversation.title,
        status: conversation.status,
        createdAt: new Date(conversation.created_at),
        updatedAt: new Date(conversation.updated_at),
        lastMessageAt: new Date(conversation.last_message_at),
      },
    };

    // If initial message provided, create it
    if (initialMessage) {
      try {
        const validatedMessage = validateString(initialMessage, 5000);

        const messageResult = await sql`
          INSERT INTO chat_messages (
            conversation_id,
            role,
            content,
            metadata,
            created_at
          )
          VALUES (
            ${conversation.id},
            'user',
            ${validatedMessage},
            '{}'::jsonb,
            NOW()
          )
          RETURNING
            id,
            conversation_id,
            role,
            content,
            metadata,
            created_at
        `;

        const message = messageResult[0];

        response.message = {
          id: message.id,
          conversationId: message.conversation_id,
          role: message.role,
          content: message.content,
          metadata: message.metadata,
          createdAt: new Date(message.created_at),
        };
      } catch (error) {
        // Log error but don't fail the request
        console.error('[CHAT_API] Error creating initial message:', error);
      }
    }

    // Track analytics
    try {
      await sql`
        INSERT INTO bot_analytics (
          conversation_id,
          event_type,
          event_data,
          created_at
        )
        VALUES (
          ${conversation.id},
          'conversation_started',
          ${JSON.stringify({ userId, hasInitialMessage: !!initialMessage })},
          NOW()
        )
      `;
    } catch (error) {
      // Log but don't fail
      console.error('[CHAT_API] Error logging analytics:', error);
    }

    return NextResponse.json(
      {
        success: true,
        data: response,
      },
      { status: 201 }
    );
  } catch (error) {
    // Check if it's an auth error (Response object thrown)
    if (error instanceof Response) {
      return error;
    }

    return serverErrorResponse(error);
  }
}

// ====================================
// GET - List Conversations
// ====================================

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await requireAuth();

    // PHASE 5: Rate limiting for listing conversations (standard limits)
    const ip = getClientIp(request);
    const identifier = getRateLimitIdentifier(userId, ip);
    const rateLimitResult = await checkRateLimit(identifier, standardBillingRateLimit);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please wait before fetching conversations again.',
        },
        {
          status: 429,
          headers: rateLimitResult.headers,
        }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Validate parameters
    if (limit < 1 || limit > 100) {
      return badRequestResponse('Limit must be between 1 and 100');
    }

    if (offset < 0) {
      return badRequestResponse('Offset must be non-negative');
    }

    // Build query
    let conversationsQuery;
    if (status && ['active', 'resolved', 'archived'].includes(status)) {
      conversationsQuery = sql`
        SELECT
          c.id,
          c.clerk_user_id,
          c.title,
          c.status,
          c.created_at,
          c.updated_at,
          c.last_message_at,
          COUNT(m.id)::int as message_count,
          (
            SELECT content
            FROM chat_messages
            WHERE conversation_id = c.id
            ORDER BY created_at DESC
            LIMIT 1
          ) as last_message
        FROM chat_conversations c
        LEFT JOIN chat_messages m ON m.conversation_id = c.id
        WHERE c.clerk_user_id = ${userId}
          AND c.status = ${status}
        GROUP BY c.id, c.clerk_user_id, c.title, c.status, c.created_at, c.updated_at, c.last_message_at
        ORDER BY c.last_message_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;
    } else {
      conversationsQuery = sql`
        SELECT
          c.id,
          c.clerk_user_id,
          c.title,
          c.status,
          c.created_at,
          c.updated_at,
          c.last_message_at,
          COUNT(m.id)::int as message_count,
          (
            SELECT content
            FROM chat_messages
            WHERE conversation_id = c.id
            ORDER BY created_at DESC
            LIMIT 1
          ) as last_message
        FROM chat_conversations c
        LEFT JOIN chat_messages m ON m.conversation_id = c.id
        WHERE c.clerk_user_id = ${userId}
        GROUP BY c.id, c.clerk_user_id, c.title, c.status, c.created_at, c.updated_at, c.last_message_at
        ORDER BY c.last_message_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;
    }

    const conversations = await conversationsQuery;

    // Get total count
    let totalQuery;
    if (status && ['active', 'resolved', 'archived'].includes(status)) {
      totalQuery = sql`
        SELECT COUNT(*)::int as total
        FROM chat_conversations
        WHERE clerk_user_id = ${userId}
          AND status = ${status}
      `;
    } else {
      totalQuery = sql`
        SELECT COUNT(*)::int as total
        FROM chat_conversations
        WHERE clerk_user_id = ${userId}
      `;
    }

    const totalResult = await totalQuery;
    const total = totalResult[0]?.total || 0;

    const response: ListConversationsResponse = {
      conversations: conversations.map((conv) => ({
        id: conv.id,
        clerkUserId: conv.clerk_user_id,
        title: conv.title,
        status: conv.status,
        createdAt: new Date(conv.created_at),
        updatedAt: new Date(conv.updated_at),
        lastMessageAt: new Date(conv.last_message_at),
        messageCount: conv.message_count,
        lastMessage: conv.last_message,
      })),
      total,
      hasMore: offset + conversations.length < total,
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    // Check if it's an auth error
    if (error instanceof Response) {
      return error;
    }

    return serverErrorResponse(error);
  }
}
