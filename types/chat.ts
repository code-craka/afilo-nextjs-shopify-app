/**
 * Chat Bot Type Definitions
 *
 * Core types for the Enterprise Customer Support Chat Bot system.
 * Follows Afilo's TypeScript strict mode conventions.
 */

// ====================================
// Core Chat Types
// ====================================

export type MessageRole = 'user' | 'assistant' | 'system';

export type ConversationStatus = 'active' | 'resolved' | 'archived' | 'escalated';

export interface ChatConversation {
  id: string;
  clerkUserId: string;
  title: string | null;
  status: ConversationStatus;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt: Date;
  messageCount?: number; // Optional, computed from database
  lastMessage?: string | null; // Optional, last message preview
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  metadata: MessageMetadata;
  createdAt: Date;
}

export interface MessageMetadata {
  // Attachments (future)
  attachments?: Array<{
    id: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    url: string;
  }>;

  // Context used for AI response
  stripeContext?: CustomerContext;
  knowledgeBaseArticles?: Array<{
    id: string;
    title: string;
    url: string;
    similarity: number;
  }>;

  // Performance metrics
  responseTime?: number; // milliseconds
  tokensUsed?: number;

  // User feedback
  rating?: 'thumbs_up' | 'thumbs_down';
  feedbackNote?: string;

  // PHASE 5: Sentiment Analysis
  sentiment?: 'frustrated' | 'neutral' | 'satisfied' | 'angry' | 'confused';
}

// ====================================
// Customer Context (for Stripe integration)
// ====================================

export type SubscriptionTier = 'free' | 'professional' | 'enterprise' | 'enterprise_plus';

export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete';

export interface CustomerContext {
  userId: string; // Clerk user ID
  stripeCustomerId: string | null;
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: SubscriptionStatus | null;
  currentPeriodEnd: Date | null;
  paymentMethodValid: boolean;
  mrr: number; // Monthly recurring revenue in cents
  lifetimeValue: number; // Total spent in cents
  accountAge: number; // Days since signup
  supportTicketCount: number;
  lastLoginDate: Date;
}

// ====================================
// Knowledge Base Types
// ====================================

export type KnowledgeBaseContentType = 'page' | 'product' | 'faq' | 'documentation' | 'pricing';

export interface KnowledgeBaseEntry {
  id: string;
  url: string;
  title: string | null;
  content: string;
  contentType: KnowledgeBaseContentType | null;
  embedding: number[] | null;
  searchableText: string | null;
  metadata: KnowledgeBaseMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeBaseMetadata {
  lastCrawled?: Date;
  wordCount?: number;
  tags?: string[];
  priority?: 'high' | 'medium' | 'low';
  language?: string;
}

export interface SemanticSearchResult {
  id: string;
  url: string;
  title: string | null;
  content: string;
  contentType: KnowledgeBaseContentType | null;
  similarity: number; // 0-1, higher is better
}

export interface FullTextSearchResult {
  id: string;
  url: string;
  title: string | null;
  content: string;
  contentType: KnowledgeBaseContentType | null;
  rank: number; // PostgreSQL ts_rank score
}

// ====================================
// Analytics Types
// ====================================

export type BotAnalyticsEventType =
  | 'message_sent'
  | 'conversation_started'
  | 'conversation_resolved'
  | 'conversation_archived'
  | 'ticket_created'
  | 'upgrade_suggested'
  | 'knowledge_base_searched'
  | 'customer_context_fetched'
  | 'error_occurred';

export interface BotAnalyticsEvent {
  id: string;
  conversationId: string | null;
  eventType: BotAnalyticsEventType;
  eventData: Record<string, unknown>;
  createdAt: Date;
}

// ====================================
// UI State Types
// ====================================

export interface ChatWidgetState {
  isOpen: boolean;
  unreadCount: number;
  currentConversationId: string | null;
  isMinimized: boolean;
}

export interface ChatUIState {
  isLoading: boolean;
  isStreaming: boolean;
  isTyping: boolean;
  error: string | null;
  selectedConversationId: string | null;
}

// ====================================
// Streaming Types
// ====================================

export interface StreamingMessage {
  id: string;
  role: MessageRole;
  content: string; // Partial content that gets updated
  isComplete: boolean;
}

// ====================================
// Utility Types
// ====================================

export interface ConversationWithMessages extends ChatConversation {
  messages: ChatMessage[];
}

export interface ConversationSummary {
  id: string;
  title: string | null;
  lastMessage: string | null;
  lastMessageAt: Date;
  messageCount: number;
  status: ConversationStatus;
  unreadCount: number;
}

// ====================================
// Form Input Types
// ====================================

export interface SendMessageInput {
  conversationId: string;
  message: string;
  attachments?: File[];
}

export interface CreateConversationInput {
  title?: string;
  initialMessage?: string;
}

export interface UpdateConversationInput {
  title?: string;
  status?: ConversationStatus;
}
