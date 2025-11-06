/**
 * Chat Bot Analytics API Route
 *
 * GET /api/admin/chat/analytics - Get comprehensive bot performance metrics
 *
 * Admin-only endpoint for monitoring chat bot health and performance.
 *
 * Phase 4: Admin Dashboard Implementation
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { requireAuth, serverErrorResponse, forbiddenResponse } from '@/lib/chat-auth';

const sql = neon(process.env.DATABASE_URL!);

// Type definitions for database query results
interface RecentActivityRow {
  id: string;
  clerk_user_id: string;
  title: string;
  status: string;
  created_at: string;
  last_message_at: string;
  message_count: string;
}

interface MessagesByDayRow {
  date: string;
  count: string;
}

interface ConversationsByStatusRow {
  status: string;
  count: string;
}

interface TierBreakdownRow {
  tier: string | null;
  count: string;
}

interface TopQuestionsRow {
  question: string;
  count: string;
}

// PHASE 5: Sentiment Analysis Interfaces
interface SentimentBreakdownRow {
  sentiment: string;
  count: string;
}

interface SentimentByDayRow {
  date: string;
  frustrated: string;
  neutral: string;
  satisfied: string;
  angry: string;
  confused: string;
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
    console.error('[CHAT_ANALYTICS] Admin check failed:', error);
    return false;
  }
}

/**
 * GET - Get chat bot analytics
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

    // Parse query parameters for date range
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30', 10);
    const since = new Date();
    since.setDate(since.getDate() - days);

    console.log(`[CHAT_ANALYTICS] Fetching analytics for last ${days} days`);

    // Get overall statistics
    const [
      totalConversations,
      totalMessages,
      activeUsers,
      avgMessagesPerConv,
      messagesByDay,
      conversationsByStatus,
      tierBreakdown,
      topQuestions,
      kbUsage,
      recentActivity,
      sentimentBreakdown,
      sentimentByDay,
      escalationStats,
    ] = await Promise.all([
      // Total conversations
      sql`
        SELECT COUNT(*) as count
        FROM chat_conversations
        WHERE created_at >= ${since.toISOString()}
      `,

      // Total messages
      sql`
        SELECT COUNT(*) as count
        FROM chat_messages
        WHERE created_at >= ${since.toISOString()}
      `,

      // Active users (unique clerk_user_ids)
      sql`
        SELECT COUNT(DISTINCT clerk_user_id) as count
        FROM chat_conversations
        WHERE created_at >= ${since.toISOString()}
      `,

      // Average messages per conversation
      sql`
        SELECT
          AVG(message_count)::float as avg_messages
        FROM (
          SELECT
            conversation_id,
            COUNT(*) as message_count
          FROM chat_messages
          WHERE created_at >= ${since.toISOString()}
          GROUP BY conversation_id
        ) subquery
      `,

      // Messages by day (last 30 days)
      sql`
        SELECT
          DATE(created_at) as date,
          COUNT(*) as count
        FROM chat_messages
        WHERE created_at >= ${since.toISOString()}
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 30
      `,

      // Conversations by status
      sql`
        SELECT
          status,
          COUNT(*) as count
        FROM chat_conversations
        WHERE created_at >= ${since.toISOString()}
        GROUP BY status
      `,

      // Conversations by subscription tier (from metadata)
      sql`
        SELECT
          metadata->'customerContext'->>'tier' as tier,
          COUNT(DISTINCT conversation_id) as count
        FROM chat_messages
        WHERE created_at >= ${since.toISOString()}
          AND role = 'assistant'
          AND metadata->'customerContext'->>'tier' IS NOT NULL
        GROUP BY tier
        ORDER BY count DESC
      `,

      // Top questions (first user message in conversation)
      sql`
        WITH first_messages AS (
          SELECT DISTINCT ON (conversation_id)
            conversation_id,
            content,
            created_at
          FROM chat_messages
          WHERE role = 'user'
            AND created_at >= ${since.toISOString()}
          ORDER BY conversation_id, created_at ASC
        )
        SELECT
          SUBSTRING(content, 1, 100) as question,
          COUNT(*) as count
        FROM first_messages
        GROUP BY SUBSTRING(content, 1, 100)
        ORDER BY count DESC
        LIMIT 10
      `,

      // Knowledge base usage
      sql`
        SELECT
          COUNT(*) as total_responses,
          COUNT(CASE WHEN metadata->'knowledgeBaseArticles' IS NOT NULL AND jsonb_array_length(metadata->'knowledgeBaseArticles') > 0 THEN 1 END) as kb_used,
          AVG(CASE WHEN metadata->'knowledgeBaseArticles' IS NOT NULL THEN jsonb_array_length(metadata->'knowledgeBaseArticles') ELSE 0 END)::float as avg_articles_per_response
        FROM chat_messages
        WHERE role = 'assistant'
          AND created_at >= ${since.toISOString()}
      `,

      // Recent activity (last 10 conversations)
      sql`
        SELECT
          c.id,
          c.clerk_user_id,
          c.title,
          c.status,
          c.created_at,
          c.last_message_at,
          COUNT(m.id) as message_count
        FROM chat_conversations c
        LEFT JOIN chat_messages m ON c.id = m.conversation_id
        WHERE c.created_at >= ${since.toISOString()}
        GROUP BY c.id
        ORDER BY c.last_message_at DESC
        LIMIT 10
      `,

      // PHASE 5: Sentiment breakdown
      sql`
        SELECT
          metadata->>'sentiment' as sentiment,
          COUNT(*) as count
        FROM chat_messages
        WHERE role = 'assistant'
          AND created_at >= ${since.toISOString()}
          AND metadata->>'sentiment' IS NOT NULL
        GROUP BY metadata->>'sentiment'
        ORDER BY count DESC
      `,

      // PHASE 5: Sentiment by day
      sql`
        SELECT
          DATE(created_at) as date,
          COUNT(CASE WHEN metadata->>'sentiment' = 'frustrated' THEN 1 END) as frustrated,
          COUNT(CASE WHEN metadata->>'sentiment' = 'neutral' THEN 1 END) as neutral,
          COUNT(CASE WHEN metadata->>'sentiment' = 'satisfied' THEN 1 END) as satisfied,
          COUNT(CASE WHEN metadata->>'sentiment' = 'angry' THEN 1 END) as angry,
          COUNT(CASE WHEN metadata->>'sentiment' = 'confused' THEN 1 END) as confused
        FROM chat_messages
        WHERE role = 'assistant'
          AND created_at >= ${since.toISOString()}
          AND metadata->>'sentiment' IS NOT NULL
        GROUP BY DATE(created_at)
        ORDER BY date
      `,

      // PHASE 5: Escalation statistics
      sql`
        SELECT COUNT(*) as total_escalations
        FROM bot_analytics
        WHERE event_type = 'auto_escalation_triggered'
          AND created_at >= ${since.toISOString()}
      `,
    ]);

    // Calculate KB usage percentage
    const kbStats = kbUsage[0];
    const kbUsagePercentage = kbStats.total_responses > 0
      ? (parseFloat(kbStats.kb_used) / parseFloat(kbStats.total_responses)) * 100
      : 0;

    // Format response
    const analytics = {
      overview: {
        totalConversations: parseInt(totalConversations[0]?.count || '0'),
        totalMessages: parseInt(totalMessages[0]?.count || '0'),
        activeUsers: parseInt(activeUsers[0]?.count || '0'),
        avgMessagesPerConversation: parseFloat(avgMessagesPerConv[0]?.avg_messages || '0').toFixed(1),
      },
      messagesByDay: (messagesByDay as MessagesByDayRow[]).map((row) => ({
        date: row.date,
        count: parseInt(row.count),
      })),
      conversationsByStatus: (conversationsByStatus as ConversationsByStatusRow[]).map((row) => ({
        status: row.status,
        count: parseInt(row.count),
      })),
      tierBreakdown: (tierBreakdown as TierBreakdownRow[]).map((row) => ({
        tier: row.tier || 'unknown',
        count: parseInt(row.count),
      })),
      topQuestions: (topQuestions as TopQuestionsRow[]).map((row) => ({
        question: row.question,
        count: parseInt(row.count),
      })),
      knowledgeBase: {
        totalResponses: parseInt(kbStats.total_responses || '0'),
        responsesWithKB: parseInt(kbStats.kb_used || '0'),
        usagePercentage: parseFloat(kbUsagePercentage.toFixed(1)),
        avgArticlesPerResponse: parseFloat(kbStats.avg_articles_per_response || '0').toFixed(2),
      },
      recentActivity: (recentActivity as RecentActivityRow[]).map((row) => ({
        id: row.id,
        userId: row.clerk_user_id,
        title: row.title,
        status: row.status,
        createdAt: row.created_at,
        lastMessageAt: row.last_message_at,
        messageCount: parseInt(row.message_count, 10),
      })),
      // PHASE 5: Sentiment Analytics
      sentimentBreakdown: (sentimentBreakdown as SentimentBreakdownRow[]).map((row) => ({
        sentiment: row.sentiment,
        count: parseInt(row.count),
      })),
      sentimentByDay: (sentimentByDay as SentimentByDayRow[]).map((row) => ({
        date: row.date,
        frustrated: parseInt(row.frustrated),
        neutral: parseInt(row.neutral),
        satisfied: parseInt(row.satisfied),
        angry: parseInt(row.angry),
        confused: parseInt(row.confused),
      })),
      escalationStats: {
        totalEscalations: parseInt(escalationStats[0]?.total_escalations || '0'),
        escalationRate: parseInt(totalConversations[0]?.count || '0') > 0
          ? (parseInt(escalationStats[0]?.total_escalations || '0') / parseInt(totalConversations[0]?.count || '0')) * 100
          : 0,
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        periodDays: days,
        periodStart: since.toISOString(),
      },
    };

    console.log('[CHAT_ANALYTICS] ✓ Analytics generated successfully');

    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error('[CHAT_ANALYTICS] Error generating analytics:', error);
    return serverErrorResponse(error);
  }
}
