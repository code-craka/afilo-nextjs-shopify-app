/**
 * API Type Definitions
 *
 * Request and response types for Chat Bot API routes.
 * Ensures type safety for all API interactions.
 */

import type {
  ChatConversation,
  ChatMessage,
  ConversationStatus,
  ConversationWithMessages,
  MessageRole,
} from './chat';

// ====================================
// Generic API Response Types
// ====================================

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: string;
  code?: string;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// ====================================
// Conversations API
// ====================================

// POST /api/chat/conversations - Create conversation
export interface CreateConversationRequest {
  title?: string;
  initialMessage?: string;
}

export interface CreateConversationResponse {
  conversation: ChatConversation;
  message?: ChatMessage; // If initialMessage was provided
}

// GET /api/chat/conversations - List conversations
export interface ListConversationsRequest {
  status?: ConversationStatus;
  limit?: number;
  offset?: number;
}

export interface ListConversationsResponse {
  conversations: Array<
    ChatConversation & {
      messageCount: number;
      lastMessage: string | null;
    }
  >;
  total: number;
  hasMore: boolean;
}

// GET /api/chat/conversations/[id] - Get conversation
export interface GetConversationRequest {
  conversationId: string;
  includeMessages?: boolean;
  messageLimit?: number;
}

export interface GetConversationResponse {
  conversation: ConversationWithMessages;
}

// DELETE /api/chat/conversations/[id] - Archive conversation
export interface ArchiveConversationRequest {
  conversationId: string;
}

export interface ArchiveConversationResponse {
  conversation: ChatConversation;
}

// PATCH /api/chat/conversations/[id] - Update conversation
export interface UpdateConversationRequest {
  conversationId: string;
  title?: string;
  status?: ConversationStatus;
}

export interface UpdateConversationResponse {
  conversation: ChatConversation;
}

// ====================================
// Messages API
// ====================================

// POST /api/chat/conversations/[id]/messages - Send message (streaming)
export interface SendMessageRequest {
  conversationId: string;
  message: string;
  attachments?: Array<{
    fileName: string;
    fileSize: number;
    mimeType: string;
    base64Data: string;
  }>;
}

export interface SendMessageResponse {
  userMessage: ChatMessage;
  // Assistant response comes via streaming
}

// Streaming response chunks
export interface StreamingChunk {
  type: 'content' | 'metadata' | 'error' | 'done';
  content?: string;
  metadata?: {
    messageId?: string;
    tokensUsed?: number;
    responseTime?: number;
  };
  error?: string;
}

// GET /api/chat/conversations/[id]/messages - Get messages
export interface GetMessagesRequest {
  conversationId: string;
  limit?: number;
  before?: string; // Message ID for pagination
  after?: string; // Message ID for pagination
}

export interface GetMessagesResponse {
  messages: ChatMessage[];
  hasMore: boolean;
  nextCursor?: string;
}

// ====================================
// Knowledge Base API (Admin)
// ====================================

// POST /api/admin/knowledge-base/crawl
export interface TriggerCrawlRequest {
  urls?: string[];
  crawlType: 'full' | 'incremental';
}

export interface TriggerCrawlResponse {
  crawlId: string;
  status: 'queued' | 'in_progress';
  estimatedDuration: number; // seconds
}

// GET /api/admin/knowledge-base/status
export interface CrawlStatusRequest {
  crawlId: string;
}

export interface CrawlStatusResponse {
  crawlId: string;
  status: 'queued' | 'in_progress' | 'completed' | 'failed';
  progress: number; // 0-100
  pagesProcessed: number;
  totalPages: number;
  errors: Array<{
    url: string;
    error: string;
  }>;
}

// GET /api/admin/knowledge-base/search
export interface SearchKnowledgeBaseRequest {
  query: string;
  searchType: 'semantic' | 'fulltext' | 'hybrid';
  limit?: number;
}

export interface SearchKnowledgeBaseResponse {
  results: Array<{
    id: string;
    url: string;
    title: string | null;
    content: string;
    score: number; // Similarity or rank
  }>;
  total: number;
}

// ====================================
// Analytics API (Admin)
// ====================================

// GET /api/admin/chat/analytics
export interface GetAnalyticsRequest {
  startDate?: string; // ISO date
  endDate?: string; // ISO date
  metrics?: Array<'conversations' | 'messages' | 'satisfaction' | 'response_time'>;
}

export interface GetAnalyticsResponse {
  dateRange: {
    start: string;
    end: string;
  };
  metrics: {
    totalConversations: number;
    totalMessages: number;
    avgMessagesPerConversation: number;
    avgResponseTime: number; // milliseconds
    satisfactionScore: number; // 0-100
    escalationRate: number; // percentage
    topQuestions: Array<{
      question: string;
      count: number;
    }>;
    tierBreakdown: {
      free: number;
      professional: number;
      enterprise: number;
      enterprise_plus: number;
    };
  };
}

// ====================================
// Customer Context API
// ====================================

// GET /api/chat/customer-context
export interface GetCustomerContextRequest {
  userId: string; // Clerk user ID
}

export interface GetCustomerContextResponse {
  userId: string;
  stripeCustomerId: string | null;
  subscriptionTier: string;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null; // ISO date
  paymentMethodValid: boolean;
  mrr: number;
  lifetimeValue: number;
  accountAge: number;
  supportTicketCount: number;
  lastLoginDate: string; // ISO date
}

// ====================================
// Webhook Types
// ====================================

// POST /api/webhooks/stripe-sync
export interface StripeSyncWebhookPayload {
  type: string; // Stripe event type
  data: {
    object: {
      id: string;
      customer?: string;
      status?: string;
      // ... other Stripe object properties
    };
  };
}

// ====================================
// Validation Error Types
// ====================================

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationErrorResponse extends ApiErrorResponse {
  errors: ValidationError[];
}

// ====================================
// Rate Limit Error
// ====================================

export interface RateLimitErrorResponse extends ApiErrorResponse {
  retryAfter: number; // seconds
  limit: number;
  remaining: number;
}

// ====================================
// Helper Type Guards
// ====================================

export function isApiError(response: ApiResponse): response is ApiErrorResponse {
  return !response.success;
}

export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
  return response.success;
}

export function isValidationError(response: ApiErrorResponse): response is ValidationErrorResponse {
  return 'errors' in response;
}

export function isRateLimitError(response: ApiErrorResponse): response is RateLimitErrorResponse {
  return 'retryAfter' in response;
}
