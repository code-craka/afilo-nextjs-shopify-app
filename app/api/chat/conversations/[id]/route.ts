/**
 * Chat Conversation Detail API Route
 *
 * GET /api/chat/conversations/[id] - Get conversation with messages
 * DELETE /api/chat/conversations/[id] - Archive conversation
 * PATCH /api/chat/conversations/[id] - Update conversation (title, status)
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import {
  requireAuth,
  requireConversationOwnership,
  badRequestResponse,
  notFoundResponse,
  serverErrorResponse,
  isValidUUID,
  validateString,
} from '@/lib/chat-auth';
import type {
  GetConversationResponse,
  ArchiveConversationResponse,
  UpdateConversationResponse,
} from '@/types/api';
import type { ChatMessage, ConversationStatus } from '@/types/chat';

const sql = neon(process.env.DATABASE_URL!);

// ====================================
// GET - Get Conversation with Messages
// ====================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const { userId } = await requireAuth();

    // Await params (Next.js 16 requirement)
    const { id } = await params;

    // Validate conversation ID
    const conversationId = id;
    if (!isValidUUID(conversationId)) {
      return badRequestResponse('Invalid conversation ID format');
    }

    // Verify ownership
    await requireConversationOwnership(conversationId, userId);

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const includeMessages = searchParams.get('includeMessages') !== 'false';
    const messageLimit = Math.min(
      parseInt(searchParams.get('messageLimit') || '50', 10),
      100
    );

    // Fetch conversation
    const conversationResult = await sql`
      SELECT
        id,
        clerk_user_id,
        title,
        status,
        created_at,
        updated_at,
        last_message_at
      FROM chat_conversations
      WHERE id = ${conversationId}
      LIMIT 1
    `;

    if (conversationResult.length === 0) {
      return notFoundResponse('Conversation not found');
    }

    const conversation = conversationResult[0];

    // Fetch messages if requested
    let messages: ChatMessage[] = [];
    if (includeMessages) {
      const messagesResult = await sql`
        SELECT
          id,
          conversation_id,
          role,
          content,
          metadata,
          created_at
        FROM chat_messages
        WHERE conversation_id = ${conversationId}
        ORDER BY created_at ASC
        LIMIT ${messageLimit}
      `;

      messages = messagesResult.map((msg) => ({
        id: msg.id,
        conversationId: msg.conversation_id,
        role: msg.role,
        content: msg.content,
        metadata: msg.metadata,
        createdAt: new Date(msg.created_at),
      }));
    }

    const response: GetConversationResponse = {
      conversation: {
        id: conversation.id,
        clerkUserId: conversation.clerk_user_id,
        title: conversation.title,
        status: conversation.status,
        createdAt: new Date(conversation.created_at),
        updatedAt: new Date(conversation.updated_at),
        lastMessageAt: new Date(conversation.last_message_at),
        messages,
      },
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    return serverErrorResponse(error);
  }
}

// ====================================
// DELETE - Archive Conversation
// ====================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const { userId } = await requireAuth();

    // Await params (Next.js 16 requirement)
    const { id } = await params;

    // Validate conversation ID
    const conversationId = id;
    if (!isValidUUID(conversationId)) {
      return badRequestResponse('Invalid conversation ID format');
    }

    // Verify ownership
    await requireConversationOwnership(conversationId, userId);

    // Archive conversation (set status to 'archived')
    const result = await sql`
      UPDATE chat_conversations
      SET
        status = 'archived',
        updated_at = NOW()
      WHERE id = ${conversationId}
      RETURNING
        id,
        clerk_user_id,
        title,
        status,
        created_at,
        updated_at,
        last_message_at
    `;

    if (result.length === 0) {
      return notFoundResponse('Conversation not found');
    }

    const conversation = result[0];

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
          ${conversationId},
          'conversation_archived',
          ${JSON.stringify({ userId })},
          NOW()
        )
      `;
    } catch (error) {
      console.error('[CHAT_API] Error logging analytics:', error);
    }

    const response: ArchiveConversationResponse = {
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

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    return serverErrorResponse(error);
  }
}

// ====================================
// PATCH - Update Conversation
// ====================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const { userId } = await requireAuth();

    // Await params (Next.js 16 requirement)
    const { id } = await params;

    // Validate conversation ID
    const conversationId = id;
    if (!isValidUUID(conversationId)) {
      return badRequestResponse('Invalid conversation ID format');
    }

    // Verify ownership
    await requireConversationOwnership(conversationId, userId);

    // Parse request body
    const body = await request.json();
    const { title, status } = body;

    // Validate at least one field is provided
    if (!title && !status) {
      return badRequestResponse('At least one field (title or status) must be provided');
    }

    // Validate title if provided
    let validatedTitle: string | undefined;
    if (title !== undefined) {
      try {
        validatedTitle = validateString(title, 500);
      } catch (error) {
        return badRequestResponse(
          'Invalid title',
          error instanceof Error ? error.message : 'Title validation failed'
        );
      }
    }

    // Validate status if provided
    if (status && !['active', 'resolved', 'archived'].includes(status)) {
      return badRequestResponse('Invalid status. Must be: active, resolved, or archived');
    }

    // Build update query dynamically
    const updates: string[] = ['updated_at = NOW()'];
    const values: (string | undefined)[] = [];

    if (validatedTitle !== undefined) {
      updates.push(`title = $${values.length + 1}`);
      values.push(validatedTitle);
    }

    if (status) {
      updates.push(`status = $${values.length + 1}`);
      values.push(status as ConversationStatus);
    }

    // Execute update
    const result = await sql`
      UPDATE chat_conversations
      SET
        title = COALESCE(${validatedTitle}, title),
        status = COALESCE(${status || null}, status),
        updated_at = NOW()
      WHERE id = ${conversationId}
      RETURNING
        id,
        clerk_user_id,
        title,
        status,
        created_at,
        updated_at,
        last_message_at
    `;

    if (result.length === 0) {
      return notFoundResponse('Conversation not found');
    }

    const conversation = result[0];

    const response: UpdateConversationResponse = {
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

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    return serverErrorResponse(error);
  }
}
