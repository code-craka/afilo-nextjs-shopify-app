/**
 * Webhook Event Types
 *
 * Comprehensive type definitions for handling both:
 * - Stripe Accounts v2 events (v2.*)
 * - Legacy Stripe v1 events (payment_intent.*, subscription.*, etc.)
 *
 * Supports idempotent processing to prevent duplicate handling
 * and maintain data consistency across retries.
 *
 * @see https://stripe.com/docs/api/events
 */

import Stripe from 'stripe';
import type { StripeAccountV2 } from './stripe-accounts-v2.types';

/**
 * Webhook Event Status
 * Tracks processing state for idempotency
 */
export type WebhookEventStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';

/**
 * Webhook Event Retry Strategy
 * Exponential backoff configuration
 */
export interface WebhookRetryConfig {
  // Current retry attempt
  retry_count: number;
  // Maximum retries before giving up
  max_retries: number;
  // Initial delay in milliseconds
  initial_delay_ms: number;
  // Exponential backoff multiplier
  backoff_multiplier: number;
  // Next retry timestamp
  next_retry_at?: Date;
  // Last error message
  last_error?: string;
}

/**
 * Stored Webhook Event
 * Database representation for idempotent processing
 */
export interface StoredWebhookEvent {
  id: string; // UUID
  stripe_event_id: string; // Unique Stripe event ID
  event_type: string; // e.g., 'payment_intent.succeeded'
  api_version: 'v1' | 'v2'; // v1 or v2 events
  stripe_account_id?: string; // Which account this event is for (v2)
  status: WebhookEventStatus;
  // Event data
  event_data: Record<string, unknown>; // Serialized event data
  // Idempotency
  idempotency_key?: string;
  processed_idempotent?: boolean;
  // Retry information
  retry_config: WebhookRetryConfig;
  // Processing metadata
  processed_by?: string; // Which service/server processed it
  processed_at?: Date;
  completed_at?: Date;
  // Timing
  created_at: Date;
  updated_at: Date;
  // For debugging
  error_message?: string;
  error_stack?: string;
}

/**
 * Webhook Processing Context
 * Additional context for processing events
 */
export interface WebhookProcessingContext {
  // Idempotency
  idempotency_key: string;
  // Tracing
  trace_id: string;
  request_id: string;
  // Processing info
  processor: string; // Service name processing this event
  // Environment
  environment: 'development' | 'staging' | 'production';
  // Timing
  received_at: Date;
  processing_started_at?: Date;
  processing_completed_at?: Date;
  // Retry info
  is_retry: boolean;
  retry_attempt?: number;
}

/**
 * Webhook Processing Result
 * Outcome of processing an event
 */
export interface WebhookProcessingResult {
  event_id: string;
  status: 'success' | 'failure' | 'skipped';
  message: string;
  // Idempotency info
  was_duplicate?: boolean;
  idempotency_key?: string;
  // Timing
  processing_time_ms: number;
  // Result data
  result_data?: Record<string, unknown>;
  // Error if failed
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  // Actions taken
  actions_taken?: string[];
}

/**
 * Base Webhook Event Structure
 * Matches Stripe.Event interface
 */
export interface BaseWebhookEvent {
  id: string;
  object: 'event';
  api_version: string;
  created: number;
  data: Record<string, unknown>;
  livemode: boolean;
  pending_webhooks: number;
  request: {
    id: string | null;
    idempotency_key: string | null;
  };
  type: string;
}

/**
 * =================================================================
 * STRIPE ACCOUNTS V2 WEBHOOK EVENTS
 * =================================================================
 */

/**
 * V2 Account Created Event
 * Fires when a new Accounts v2 account is created
 */
export interface V2AccountCreatedEvent extends BaseWebhookEvent {
  type: 'v2.core.account.created';
  data: {
    object: StripeAccountV2;
  };
}

/**
 * V2 Account Updated Event
 * Fires when account configuration is updated
 */
export interface V2AccountUpdatedEvent extends BaseWebhookEvent {
  type: 'v2.core.account.updated';
  data: {
    object: StripeAccountV2;
    previous_attributes?: Record<string, unknown>;
  };
}

/**
 * V2 Subscription Created Event
 * Fires when subscription is created on v2 account
 */
export interface V2SubscriptionCreatedEvent extends BaseWebhookEvent {
  type: 'v2.billing.subscription.created';
  data: {
    object: Stripe.Subscription & {
      account_id?: string; // V2 account ID
    };
  };
}

/**
 * V2 Subscription Updated Event
 * Fires when subscription is updated
 */
export interface V2SubscriptionUpdatedEvent extends BaseWebhookEvent {
  type: 'v2.billing.subscription.updated';
  data: {
    object: Stripe.Subscription & {
      account_id?: string;
    };
    previous_attributes?: Record<string, unknown>;
  };
}

/**
 * V2 Subscription Deleted Event
 * Fires when subscription is canceled
 */
export interface V2SubscriptionDeletedEvent extends BaseWebhookEvent {
  type: 'v2.billing.subscription.deleted';
  data: {
    object: Stripe.Subscription & {
      account_id?: string;
    };
  };
}

/**
 * Union type for all V2 events
 */
export type StripeV2Event =
  | V2AccountCreatedEvent
  | V2AccountUpdatedEvent
  | V2SubscriptionCreatedEvent
  | V2SubscriptionUpdatedEvent
  | V2SubscriptionDeletedEvent;

/**
 * =================================================================
 * STRIPE V1 LEGACY WEBHOOK EVENTS (Payment/Subscription)
 * =================================================================
 */

/**
 * Payment Intent Succeeded Event (v1)
 */
export interface PaymentIntentSucceededEvent extends BaseWebhookEvent {
  type: 'payment_intent.succeeded';
  data: {
    object: Stripe.PaymentIntent;
    previous_attributes?: Record<string, unknown>;
  };
}

/**
 * Payment Intent Failed Event (v1)
 */
export interface PaymentIntentFailedEvent extends BaseWebhookEvent {
  type: 'payment_intent.payment_failed';
  data: {
    object: Stripe.PaymentIntent;
    previous_attributes?: Record<string, unknown>;
  };
}

/**
 * Payment Intent Processing Event (v1)
 * For ACH payments (processing status)
 */
export interface PaymentIntentProcessingEvent extends BaseWebhookEvent {
  type: 'payment_intent.processing';
  data: {
    object: Stripe.PaymentIntent;
  };
}

/**
 * Checkout Session Completed Event (v1)
 */
export interface CheckoutSessionCompletedEvent extends BaseWebhookEvent {
  type: 'checkout.session.completed';
  data: {
    object: Stripe.Checkout.Session;
  };
}

/**
 * Customer Subscription Created Event (v1)
 */
export interface CustomerSubscriptionCreatedEvent extends BaseWebhookEvent {
  type: 'customer.subscription.created';
  data: {
    object: Stripe.Subscription;
  };
}

/**
 * Customer Subscription Updated Event (v1)
 */
export interface CustomerSubscriptionUpdatedEvent extends BaseWebhookEvent {
  type: 'customer.subscription.updated';
  data: {
    object: Stripe.Subscription;
    previous_attributes?: Record<string, unknown>;
  };
}

/**
 * Customer Subscription Deleted Event (v1)
 */
export interface CustomerSubscriptionDeletedEvent extends BaseWebhookEvent {
  type: 'customer.subscription.deleted';
  data: {
    object: Stripe.Subscription;
  };
}

/**
 * Invoice Payment Succeeded Event (v1)
 */
export interface InvoicePaymentSucceededEvent extends BaseWebhookEvent {
  type: 'invoice.payment_succeeded';
  data: {
    object: Stripe.Invoice;
  };
}

/**
 * Invoice Payment Failed Event (v1)
 */
export interface InvoicePaymentFailedEvent extends BaseWebhookEvent {
  type: 'invoice.payment_failed';
  data: {
    object: Stripe.Invoice;
  };
}

/**
 * Charge Refunded Event (v1)
 */
export interface ChargeRefundedEvent extends BaseWebhookEvent {
  type: 'charge.refunded';
  data: {
    object: Stripe.Charge;
    previous_attributes?: Record<string, unknown>;
  };
}

/**
 * Review Opened Event (Fraud Detection - v1)
 */
export interface ReviewOpenedEvent extends BaseWebhookEvent {
  type: 'review.opened';
  data: {
    object: Stripe.Review;
  };
}

/**
 * Review Closed Event (v1)
 */
export interface ReviewClosedEvent extends BaseWebhookEvent {
  type: 'review.closed';
  data: {
    object: Stripe.Review;
  };
}

/**
 * Union type for all V1 events
 */
export type StripeV1Event =
  | PaymentIntentSucceededEvent
  | PaymentIntentFailedEvent
  | PaymentIntentProcessingEvent
  | CheckoutSessionCompletedEvent
  | CustomerSubscriptionCreatedEvent
  | CustomerSubscriptionUpdatedEvent
  | CustomerSubscriptionDeletedEvent
  | InvoicePaymentSucceededEvent
  | InvoicePaymentFailedEvent
  | ChargeRefundedEvent
  | ReviewOpenedEvent
  | ReviewClosedEvent;

/**
 * Union type for all supported webhook events (v1 + v2)
 */
export type SupportedWebhookEvent = StripeV1Event | StripeV2Event;

/**
 * =================================================================
 * WEBHOOK HANDLER TYPES
 * =================================================================
 */

/**
 * Webhook Handler Function Signature
 * All handlers follow this pattern for consistency
 */
export type WebhookHandler<T extends SupportedWebhookEvent> = (
  event: T,
  context: WebhookProcessingContext
) => Promise<WebhookProcessingResult>;

/**
 * Webhook Handler Registry
 * Maps event types to their handlers
 */
export interface WebhookHandlerRegistry {
  // V2 handlers
  'v2.core.account.created': WebhookHandler<V2AccountCreatedEvent>;
  'v2.core.account.updated': WebhookHandler<V2AccountUpdatedEvent>;
  'v2.billing.subscription.created': WebhookHandler<V2SubscriptionCreatedEvent>;
  'v2.billing.subscription.updated': WebhookHandler<V2SubscriptionUpdatedEvent>;
  'v2.billing.subscription.deleted': WebhookHandler<V2SubscriptionDeletedEvent>;

  // V1 handlers (legacy)
  'payment_intent.succeeded': WebhookHandler<PaymentIntentSucceededEvent>;
  'payment_intent.payment_failed': WebhookHandler<PaymentIntentFailedEvent>;
  'payment_intent.processing': WebhookHandler<PaymentIntentProcessingEvent>;
  'checkout.session.completed': WebhookHandler<CheckoutSessionCompletedEvent>;
  'customer.subscription.created': WebhookHandler<CustomerSubscriptionCreatedEvent>;
  'customer.subscription.updated': WebhookHandler<CustomerSubscriptionUpdatedEvent>;
  'customer.subscription.deleted': WebhookHandler<CustomerSubscriptionDeletedEvent>;
  'invoice.payment_succeeded': WebhookHandler<InvoicePaymentSucceededEvent>;
  'invoice.payment_failed': WebhookHandler<InvoicePaymentFailedEvent>;
  'charge.refunded': WebhookHandler<ChargeRefundedEvent>;
  'review.opened': WebhookHandler<ReviewOpenedEvent>;
  'review.closed': WebhookHandler<ReviewClosedEvent>;
}

/**
 * Webhook Dispatcher
 * Routes events to appropriate handlers
 */
export interface WebhookDispatcher {
  dispatch(event: SupportedWebhookEvent, context: WebhookProcessingContext): Promise<WebhookProcessingResult>;
  registerHandler<T extends SupportedWebhookEvent>(eventType: string, handler: WebhookHandler<T>): void;
}

/**
 * Idempotency Key Generator
 * Creates unique keys for preventing duplicate processing
 */
export interface IdempotencyKey {
  // Format: {eventId}_{receiveTime}_{processorId}
  key: string;
  event_id: string;
  receive_time_ms: number;
  processor_id: string;
  // For deduplication window
  expires_at: Date; // How long to keep in dedup database (24 hours typical)
}

/**
 * Webhook Deduplication Strategy
 */
export interface DeduplicationConfig {
  enabled: boolean;
  dedup_window_ms: number; // How long to keep dedup keys (default 24h)
  storage: 'memory' | 'redis' | 'database'; // Where to store dedup keys
  log_duplicates: boolean;
}

/**
 * Webhook Retry Configuration
 */
export interface WebhookRetryPolicy {
  enabled: boolean;
  max_retries: number; // Default: 5
  initial_delay_ms: number; // Default: 1000
  backoff_multiplier: number; // Default: 2 (exponential)
  max_delay_ms: number; // Default: 60000 (1 minute max between retries)
  // Jitter to prevent thundering herd
  add_jitter: boolean;
}

/**
 * Complete Webhook Configuration
 */
export interface WebhookConfig {
  // Feature flags
  enabled: boolean;
  handle_v1_events: boolean;
  handle_v2_events: boolean;

  // Deduplication
  deduplication: DeduplicationConfig;

  // Retry strategy
  retry_policy: WebhookRetryPolicy;

  // Security
  verify_signature: boolean;
  signature_tolerance_ms: number; // Default: 300000 (5 minutes)

  // Logging/Monitoring
  log_all_events: boolean;
  log_processing_time: boolean;
  track_failed_events: boolean;

  // Handlers
  handlers: Partial<WebhookHandlerRegistry>;
}

/**
 * Webhook Event Analytics
 * For monitoring and debugging
 */
export interface WebhookAnalytics {
  total_events_received: number;
  total_events_processed: number;
  total_events_failed: number;
  total_duplicates: number;
  // By event type
  by_event_type: Record<string, number>;
  // Timing
  average_processing_time_ms: number;
  max_processing_time_ms: number;
  min_processing_time_ms: number;
  // Errors
  error_breakdown: Record<string, number>;
  // Last activity
  last_event_received_at?: Date;
  last_event_processed_at?: Date;
}
