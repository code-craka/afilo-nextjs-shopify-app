/**
 * Chat Messages API Route
 *
 * POST /api/chat/conversations/[id]/messages - Send message with AI streaming response
 * GET /api/chat/conversations/[id]/messages - Get messages with pagination
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import {
  requireAuth,
  requireConversationOwnership,
  badRequestResponse,
  serverErrorResponse,
  isValidUUID,
  validateString,
  getUserDisplayName,
} from '@/lib/chat-auth';
import { getCustomerContext, formatContextForAI, getTierGreeting } from '@/lib/chat-stripe-context';
import { hybridSearch, formatResultsForAI } from '@/lib/semantic-search';
import {
  checkRateLimit,
  getRateLimitIdentifier,
  getClientIp,
  getChatRateLimit
} from '@/lib/rate-limit';
import type { GetMessagesResponse } from '@/types/api';
import type { ChatMessage } from '@/types/chat';

const sql = neon(process.env.DATABASE_URL!);

// ====================================
// PHASE 5: Sentiment Analysis Helpers
// ====================================

/**
 * Handle sentiment-based escalation
 * Tracks consecutive negative sentiments and auto-escalates if threshold is reached
 */
async function handleSentimentEscalation(
  conversationId: string,
  userId: string,
  sentiment: string,
  userMessage: string
) {
  try {
    console.log(`[SENTIMENT] Processing ${sentiment} sentiment for conversation ${conversationId}`);

    // Get recent messages to check for consecutive negative sentiment
    const recentMessages = await sql`
      SELECT role, metadata
      FROM chat_messages
      WHERE conversation_id = ${conversationId}
        AND role = 'assistant'
      ORDER BY created_at DESC
      LIMIT 5
    `;

    // Count consecutive negative sentiments (including current)
    let consecutiveNegative = 1; // Current message
    for (const msg of recentMessages) {
      const msgSentiment = msg.metadata?.sentiment;
      if (msgSentiment && ['frustrated', 'angry'].includes(msgSentiment)) {
        consecutiveNegative++;
      } else {
        break; // Stop at first non-negative sentiment
      }
    }

    console.log(`[SENTIMENT] Consecutive negative sentiments: ${consecutiveNegative}`);

    // Auto-escalate after 3 consecutive frustrated/angry messages
    const escalationThreshold = parseInt(process.env.SENTIMENT_ESCALATION_THRESHOLD || '3', 10);

    if (consecutiveNegative >= escalationThreshold) {
      console.log(`[SENTIMENT] Auto-escalating conversation ${conversationId} - ${consecutiveNegative} negative sentiments`);

      // Update conversation status to require human intervention
      await sql`
        UPDATE chat_conversations
        SET
          status = 'escalated',
          updated_at = NOW()
        WHERE id = ${conversationId}
      `;

      // Log escalation event
      await sql`
        INSERT INTO bot_analytics (
          conversation_id,
          event_type,
          event_data,
          created_at
        )
        VALUES (
          ${conversationId},
          'auto_escalation_triggered',
          ${JSON.stringify({
            userId,
            sentiment,
            consecutiveNegative,
            userMessage: userMessage.substring(0, 200), // Truncate for logging
            reason: 'consecutive_negative_sentiment',
          })},
          NOW()
        )
      `;

      // PHASE 5: Send real-time alert to support team
      const customerContextForEscalation = await getCustomerContext(userId);
      await sendSupportAlert({
        type: 'escalation',
        conversationId,
        userId,
        sentiment,
        consecutiveNegative,
        userMessage: userMessage.substring(0, 300),
        customerTier: customerContextForEscalation?.subscriptionTier || 'free',
      });
    }
  } catch (error) {
    console.error('[SENTIMENT] Error handling escalation:', error);
  }
}

/**
 * Send real-time alerts to support team via webhook
 */
async function sendSupportAlert(alertData: {
  type: 'escalation' | 'angry_customer' | 'high_value_issue';
  conversationId: string;
  userId: string;
  sentiment: string;
  consecutiveNegative: number;
  userMessage: string;
  customerTier: string;
}) {
  try {
    const webhookUrl = process.env.SENTIMENT_ALERTS_WEBHOOK_URL;

    if (!webhookUrl) {
      console.log('[ALERTS] No webhook URL configured, skipping alert');
      return;
    }

    // Create rich notification payload (Slack/Discord compatible)
    const payload = {
      username: 'Afilo Support Bot',
      avatar_url: 'https://app.afilo.io/favicon.ico',
      embeds: [
        {
          title: '🚨 Customer Escalation Alert',
          description: `Customer conversation requires immediate attention`,
          color: alertData.sentiment === 'angry' ? 0xff0000 : 0xff9900, // Red for angry, Orange for frustrated
          fields: [
            {
              name: '👤 Customer Info',
              value: `ID: \`${alertData.userId}\`\nTier: **${alertData.customerTier.toUpperCase()}**`,
              inline: true,
            },
            {
              name: '😤 Sentiment Analysis',
              value: `Current: **${alertData.sentiment.toUpperCase()}**\nConsecutive: ${alertData.consecutiveNegative} negative`,
              inline: true,
            },
            {
              name: '💬 Latest Message',
              value: `"${alertData.userMessage}${alertData.userMessage.length >= 300 ? '...' : ''}"`,
              inline: false,
            },
            {
              name: '🔗 Actions',
              value: `[View Conversation](https://app.afilo.io/dashboard/admin/chat?conversation=${alertData.conversationId})`,
              inline: false,
            },
          ],
          timestamp: new Date().toISOString(),
          footer: {
            text: 'Afilo Chat Bot • Phase 5 Sentiment Analysis',
          },
        },
      ],
    };

    // Send webhook notification
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log(`[ALERTS] ✓ Support alert sent for conversation ${alertData.conversationId}`);
    } else {
      console.error(`[ALERTS] ✗ Failed to send alert: ${response.status} ${response.statusText}`);
    }

    // Log alert in analytics
    await sql`
      INSERT INTO bot_analytics (
        conversation_id,
        event_type,
        event_data,
        created_at
      )
      VALUES (
        ${alertData.conversationId},
        'support_alert_sent',
        ${JSON.stringify({
          alertType: alertData.type,
          sentiment: alertData.sentiment,
          customerTier: alertData.customerTier,
          webhookResponse: response.ok,
        })},
        NOW()
      )
    `;
  } catch (error) {
    console.error('[ALERTS] Error sending support alert:', error);
  }
}

// ====================================
// POST - Send Message with AI Streaming
// ====================================

export async function POST(
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

    // PHASE 5: Rate limiting based on subscription tier
    // Get customer context first to determine subscription tier
    const customerContext = await getCustomerContext(userId);
    const subscriptionTier = customerContext?.subscriptionTier || null;

    // Apply rate limiting
    const ip = getClientIp(request);
    const identifier = getRateLimitIdentifier(userId, ip);
    const rateLimiter = getChatRateLimit(subscriptionTier);
    const rateLimitResult = await checkRateLimit(identifier, rateLimiter);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded',
          message: subscriptionTier === 'enterprise' || subscriptionTier === 'enterprise_plus'
            ? 'You have reached your message limit of 100 messages per 5 minutes. Please wait before sending another message.'
            : 'You have reached your message limit of 30 messages per 5 minutes. Please wait before sending another message.',
          rateLimitInfo: {
            limit: rateLimitResult.limit,
            remaining: rateLimitResult.remaining,
            reset: rateLimitResult.reset,
          }
        },
        {
          status: 429,
          headers: rateLimitResult.headers,
        }
      );
    }

    // Parse request body
    const body = await request.json();
    const { message } = body;

    // Validate message
    let validatedMessage: string;
    try {
      validatedMessage = validateString(message, 5000);
    } catch (error) {
      return badRequestResponse(
        'Invalid message',
        error instanceof Error ? error.message : 'Message validation failed'
      );
    }

    // Save user message to database
    const userMessageResult = await sql`
      INSERT INTO chat_messages (
        conversation_id,
        role,
        content,
        metadata,
        created_at
      )
      VALUES (
        ${conversationId},
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

    const userMessage = userMessageResult[0];

    // Update conversation last_message_at
    await sql`
      UPDATE chat_conversations
      SET
        last_message_at = NOW(),
        updated_at = NOW()
      WHERE id = ${conversationId}
    `;

    // Get conversation history (last 10 messages for context)
    const historyResult = await sql`
      SELECT role, content
      FROM chat_messages
      WHERE conversation_id = ${conversationId}
      ORDER BY created_at DESC
      LIMIT 10
    `;

    const conversationHistory = historyResult.reverse().map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    // Get user display name (customerContext already fetched for rate limiting)
    const userName = await getUserDisplayName(userId);

    // Search knowledge base for relevant content
    console.log('[CHAT_API] Searching knowledge base for:', validatedMessage);
    const kbResults = await hybridSearch(validatedMessage, {
      limit: 3, // Top 3 most relevant articles
      threshold: 0.3, // Minimum similarity score
    });

    const knowledgeBaseContext = formatResultsForAI(kbResults);
    console.log(`[CHAT_API] Found ${kbResults.length} relevant KB articles`);

    // Build system prompt
    const systemPrompt = `You are BenZo, Afilo's premium AI assistant and enterprise support specialist for the Afilo Digital Marketplace platform.

ABOUT BENZO:
- You are BenZo (pronounced "Ben-Zo"), Afilo's advanced AI assistant
- Premium enterprise support specialist with deep platform expertise
- Expert in all Afilo products, pricing, features, and technical capabilities
- Modern, intelligent, and designed for Fortune 500 enterprises

ROLE & PERSONALITY:
- Professional yet approachable with a premium, modern edge
- Empathetic problem-solver focused on enterprise customer success
- Proactive in suggesting solutions, optimizations, and strategic upgrades
- Slightly more personality than typical chatbots - you're BenZo, not just "an AI"

CUSTOMER CONTEXT:
${customerContext ? formatContextForAI(customerContext) : 'Customer information unavailable'}

${customerContext ? getTierGreeting(customerContext.subscriptionTier) : ''}

${knowledgeBaseContext}

RESPONSE GUIDELINES:
- Introduce yourself as BenZo when greeting new customers
- Greet the customer by name: ${userName}
- Provide specific, actionable answers with premium-level clarity and precision
- Use rich formatting (bold, lists, code blocks, strategic emojis) for enhanced readability
- Be concise yet comprehensive - premium support means thorough solutions
- If uncertain, clearly state limitations and offer escalation to human specialists
- Never make up information - accuracy and trust are paramount
- Focus on helping enterprise customers succeed and scale efficiently

TONE & COMMUNICATION STYLE:
- Enterprise B2B professional with a modern, premium edge
- Confident, knowledgeable, and approachable (you're premium AI, not corporate robot)
- Patient and thorough in explanations with strategic detail
- Proactively address follow-up questions and potential concerns
- Show expertise while remaining humble and helpful

PHASE 5 - SENTIMENT ANALYSIS:
After providing your complete response, analyze the customer's sentiment based on their message and append the following metadata line:
[SENTIMENT: frustrated|neutral|satisfied|angry|confused]

Choose the most appropriate sentiment:
- frustrated: Customer is having issues, blocked, or expressing mild frustration
- neutral: Normal support request, informational questions, or standard inquiries
- satisfied: Customer is happy, expressing gratitude, or problem is resolved
- angry: Customer is expressing strong negative emotions, threats, or extreme dissatisfaction
- confused: Customer seems lost, unclear about processes, or asking basic questions

This sentiment data will be used for customer support optimization and escalation triggers.

Current date: ${new Date().toLocaleDateString()}`;

    // Stream AI response using Vercel AI SDK
    // Note: maxTokens is controlled by the model's default limits in AI SDK v5
    const result = await streamText({
      model: anthropic(process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514'),
      system: systemPrompt,
      messages: conversationHistory,
      temperature: parseFloat(process.env.CHAT_BOT_TEMPERATURE || '0.7'),
    });

    // Save assistant response to database after streaming completes
    // We'll do this in the background
    (async () => {
      try {
        // Collect the full response
        let fullResponse = '';
        for await (const chunk of result.textStream) {
          fullResponse += chunk;
        }

        // PHASE 5: Extract sentiment from AI response
        const sentimentMatch = fullResponse.match(/\[SENTIMENT:\s*(frustrated|neutral|satisfied|angry|confused)\]/i);
        const extractedSentiment = sentimentMatch ? sentimentMatch[1].toLowerCase() : null;

        // Remove the sentiment marker from the user-facing response
        const cleanedResponse = fullResponse.replace(/\[SENTIMENT:\s*(frustrated|neutral|satisfied|angry|confused)\]/i, '').trim();

        console.log(`[CHAT_API] Extracted sentiment: ${extractedSentiment || 'none'}`);

        // Save to database
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
            'assistant',
            ${cleanedResponse},
            ${JSON.stringify({
              model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
              sentiment: extractedSentiment,
              customerContext: customerContext ? {
                tier: customerContext.subscriptionTier,
                status: customerContext.subscriptionStatus,
              } : null,
              knowledgeBaseArticles: kbResults.map(r => ({ url: r.url, title: r.title, score: r.relevanceScore })),
            })},
            NOW()
          )
        `;

        // PHASE 5: Check for auto-escalation based on sentiment
        if (extractedSentiment && ['frustrated', 'angry'].includes(extractedSentiment)) {
          await handleSentimentEscalation(conversationId, userId, extractedSentiment, validatedMessage);
        }

        // Track analytics with sentiment
        await sql`
          INSERT INTO bot_analytics (
            conversation_id,
            event_type,
            event_data,
            created_at
          )
          VALUES (
            ${conversationId},
            'message_sent',
            ${JSON.stringify({
              userId,
              messageLength: validatedMessage.length,
              responseLength: cleanedResponse.length,
              sentiment: extractedSentiment,
            })},
            NOW()
          )
        `;
      } catch (error) {
        console.error('[CHAT_API] Error saving AI response:', error);
      }
    })();

    // Return streaming response using the correct Vercel AI SDK method
    return result.toTextStreamResponse();

  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    return serverErrorResponse(error);
  }
}

// ====================================
// GET - Get Messages with Pagination
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

    // PHASE 5: Rate limiting for message retrieval (more generous than sending)
    // Use standard billing rate limiter (60 requests/minute) for read operations
    const ip = getClientIp(request);
    const identifier = getRateLimitIdentifier(userId, ip);
    const rateLimitResult = await checkRateLimit(identifier, getChatRateLimit(null));

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please wait before fetching messages again.',
        },
        {
          status: 429,
          headers: rateLimitResult.headers,
        }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const before = searchParams.get('before'); // Message ID
    const after = searchParams.get('after'); // Message ID

    // Validate cursor IDs if provided
    if (before && !isValidUUID(before)) {
      return badRequestResponse('Invalid before cursor');
    }

    if (after && !isValidUUID(after)) {
      return badRequestResponse('Invalid after cursor');
    }

    // Build query based on pagination type
    let messagesQuery;

    if (before) {
      // Get messages before a specific message (older messages)
      messagesQuery = sql`
        SELECT
          id,
          conversation_id,
          role,
          content,
          metadata,
          created_at
        FROM chat_messages
        WHERE conversation_id = ${conversationId}
          AND created_at < (
            SELECT created_at
            FROM chat_messages
            WHERE id = ${before}
          )
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    } else if (after) {
      // Get messages after a specific message (newer messages)
      messagesQuery = sql`
        SELECT
          id,
          conversation_id,
          role,
          content,
          metadata,
          created_at
        FROM chat_messages
        WHERE conversation_id = ${conversationId}
          AND created_at > (
            SELECT created_at
            FROM chat_messages
            WHERE id = ${after}
          )
        ORDER BY created_at ASC
        LIMIT ${limit}
      `;
    } else {
      // Get most recent messages
      messagesQuery = sql`
        SELECT
          id,
          conversation_id,
          role,
          content,
          metadata,
          created_at
        FROM chat_messages
        WHERE conversation_id = ${conversationId}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    }

    const messagesResult = await messagesQuery;

    // Reverse if we fetched in descending order (to show chronologically)
    const messages: ChatMessage[] = (before || (!before && !after)
      ? messagesResult.reverse()
      : messagesResult
    ).map((msg) => ({
      id: msg.id,
      conversationId: msg.conversation_id,
      role: msg.role,
      content: msg.content,
      metadata: msg.metadata,
      createdAt: new Date(msg.created_at),
    }));

    // Check if there are more messages
    const hasMore = messages.length === limit;

    // Get next cursor (ID of last message)
    const nextCursor = hasMore && messages.length > 0
      ? messages[messages.length - 1].id
      : undefined;

    const response: GetMessagesResponse = {
      messages,
      hasMore,
      nextCursor,
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
