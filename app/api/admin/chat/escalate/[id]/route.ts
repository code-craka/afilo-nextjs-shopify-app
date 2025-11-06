/**
 * Chat Escalation API Route
 *
 * POST /api/admin/chat/escalate/[id] - Escalate conversation to human support
 *
 * Admin-only endpoint for escalating bot conversations to human agents.
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
    console.error('[ESCALATE] Admin check failed:', error);
    return false;
  }
}

/**
 * POST - Escalate conversation to human support
 */
export async function POST(
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

    // Parse request body
    const body = await request.json();
    const { reason, priority, assignTo } = body;

    // Check if conversation exists
    const conversation = await sql`
      SELECT
        c.id,
        c.clerk_user_id,
        c.title,
        c.status,
        up.email as user_email
      FROM chat_conversations c
      LEFT JOIN user_profiles up ON c.clerk_user_id = up.clerk_user_id
      WHERE c.id = ${conversationId}
      LIMIT 1
    `;

    if (conversation.length === 0) {
      return notFoundResponse('Conversation not found');
    }

    const conv = conversation[0];

    // Update conversation status to 'escalated'
    await sql`
      UPDATE chat_conversations
      SET
        status = 'escalated',
        updated_at = NOW()
      WHERE id = ${conversationId}
    `;

    // Add system message about escalation
    await sql`
      INSERT INTO chat_messages (
        conversation_id,
        role,
        content,
        metadata,
        created_at
      )
      VALUES (
        ${conversationId},
        'system',
        ${`This conversation has been escalated to human support. Reason: ${reason || 'Not specified'}`},
        ${JSON.stringify({
          escalatedBy: userId,
          escalatedAt: new Date().toISOString(),
          reason,
          priority: priority || 'normal',
          assignTo: assignTo || null,
        })}::jsonb,
        NOW()
      )
    `;

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
        'conversation_escalated',
        ${JSON.stringify({
          escalatedBy: userId,
          reason,
          priority: priority || 'normal',
          assignTo: assignTo || null,
          userId: conv.clerk_user_id,
          userEmail: conv.user_email,
        })}::jsonb,
        NOW()
      )
    `;

    console.log('[ESCALATE] ✓ Conversation escalated:', conversationId);

    // In production, you would also:
    // 1. Send notification to support team (email, Slack, etc.)
    // 2. Create ticket in support system (Zendesk, Intercom, etc.)
    // 3. Notify customer about escalation

    return NextResponse.json({
      success: true,
      message: 'Conversation escalated to human support',
      data: {
        conversationId,
        escalatedBy: userId,
        escalatedAt: new Date().toISOString(),
        priority: priority || 'normal',
      },
    });
  } catch (error) {
    console.error('[ESCALATE] Error escalating conversation:', error);
    return serverErrorResponse(error);
  }
}
