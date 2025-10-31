/**
 * Stripe Server Client Configuration - v2 API Support
 *
 * Enhanced configuration supporting both:
 * - Legacy v1 API (existing functionality)
 * - New v2 API (Accounts, advanced features)
 *
 * This maintains compatibility with existing code while adding v2 support.
 *
 * @see https://stripe.com/docs/api/accounts
 */

import Stripe from 'stripe';

/**
 * Get Stripe Secret Key
 * Validates environment configuration
 */
function getStripeSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    throw new Error(
      'STRIPE_SECRET_KEY is not set. ' +
      'Please add STRIPE_SECRET_KEY to your environment variables.'
    );
  }

  if (!key.startsWith('sk_')) {
    throw new Error(
      'STRIPE_SECRET_KEY appears invalid. ' +
      'It should start with "sk_".'
    );
  }

  return key;
}

/**
 * Get Stripe Webhook Secret
 * Required for webhook signature verification
 */
function getStripeWebhookSecret(): string | undefined {
  return process.env.STRIPE_WEBHOOK_SECRET;
}

/**
 * Stripe Client Configuration
 * Supports both v1 and v2 APIs
 */
interface StripeClientConfig {
  apiVersion: Stripe.LatestApiVersion;
  typescript: true;
  appInfo: Stripe.AppInfo;
}

/**
 * Create Stripe Client Configuration
 */
function createStripeConfig(): StripeClientConfig {
  return {
    apiVersion: '2025-09-30.clover' as Stripe.LatestApiVersion,
    typescript: true as const,
    appInfo: {
      name: 'Afilo Digital Marketplace',
      version: '2.2.0',
      url: 'https://app.afilo.io',
    },
  };
}

/**
 * Lazy-loaded Stripe instance
 * Only initialized when actually needed (API routes)
 */
let stripeInstance: Stripe | null = null;

/**
 * Get singleton Stripe instance
 */
function getStripeInstance(): Stripe {
  if (!stripeInstance) {
    const secretKey = getStripeSecretKey();
    const config = createStripeConfig();

    stripeInstance = new Stripe(secretKey, config);
  }

  return stripeInstance;
}

/**
 * Export Stripe client as Proxy
 * This maintains backward compatibility while supporting new features
 */
export const stripe = new Proxy({} as Stripe, {
  get: (_target, prop) => {
    const instance = getStripeInstance();
    const value = instance[prop as keyof Stripe];

    // Bind methods to preserve 'this' context
    if (typeof value === 'function') {
      return value.bind(instance);
    }

    return value;
  },
});

/**
 * ============================================================
 * PAYMENT CONFIGURATION (Legacy - Maintained for Compatibility)
 * ============================================================
 */

/**
 * Product Value Tiers for Radar Risk Assessment
 */
export function getProductTier(amountCents: number): 'low' | 'medium' | 'high' | 'enterprise' | 'ultra' {
  const amountUsd = amountCents / 100;

  if (amountUsd < 2499) return 'low';
  if (amountUsd < 4999) return 'medium';
  if (amountUsd < 9999) return 'high';
  if (amountUsd < 50000) return 'enterprise';
  return 'ultra';
}

/**
 * Risk Thresholds per Product Tier
 * Optimized for maximum payment acceptance
 */
export const RISK_THRESHOLDS = {
  low: { review: 85, block: 95 },
  medium: { review: 85, block: 95 },
  high: { review: 90, block: 95 },
  enterprise: { review: 92, block: 98 },
  ultra: { review: 95, block: 99 },
} as const;

/**
 * Supported Payment Methods
 */
export const PAYMENT_METHODS = ['card', 'us_bank_account', 'google_pay', 'apple_pay'] as const;

/**
 * Digital Wallet Configuration
 */
export const DIGITAL_WALLET_CONFIG = {
  requestPayerName: true,
  requestPayerEmail: true,
  requestPayerPhone: false,
} as const;

/**
 * 2D Authentication Configuration
 * Disables 3DS for better conversion (Radar still protects fraud)
 */
export const DISABLE_3DS_CONFIG = {
  automatic_payment_methods: {
    enabled: true,
    allow_redirects: 'never',
  },
  payment_method_options: {
    card: {
      request_three_d_secure: 'any',
    },
  },
} as const;

/**
 * ============================================================
 * AMOUNT FORMATTING UTILITIES
 * ============================================================
 */

/**
 * Format amount from dollars to Stripe cents
 */
export function formatStripeAmount(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Format amount from Stripe cents to display string
 */
export function formatDisplayAmount(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * ============================================================
 * PAYMENT METHOD UTILITIES
 * ============================================================
 */

/**
 * Check if payment method is ACH
 */
export function isACHPayment(paymentMethodId: string | null | undefined): boolean {
  return Boolean(
    paymentMethodId?.startsWith('pm_') &&
    paymentMethodId.includes('us_bank_account')
  );
}

/**
 * Get processing time estimate
 */
export function getProcessingTimeEstimate(paymentMethodType: string): string {
  switch (paymentMethodType) {
    case 'card':
      return 'Instant (within seconds)';
    case 'us_bank_account':
      return '3-5 business days';
    case 'sepa_debit':
      return '1-3 days';
    case 'ideal':
      return 'Instant';
    default:
      return 'Varies by payment method';
  }
}

/**
 * ============================================================
 * STRIPE EVENTS - V1 (Legacy)
 * ============================================================
 */

export const STRIPE_V1_EVENTS = {
  // Payment Intent Events
  PAYMENT_INTENT_SUCCEEDED: 'payment_intent.succeeded',
  PAYMENT_INTENT_PROCESSING: 'payment_intent.processing',
  PAYMENT_INTENT_FAILED: 'payment_intent.payment_failed',
  PAYMENT_INTENT_CANCELED: 'payment_intent.canceled',

  // Fraud Prevention Events
  REVIEW_OPENED: 'review.opened',
  REVIEW_CLOSED: 'review.closed',
  EARLY_FRAUD_WARNING: 'radar.early_fraud_warning.created',

  // Charge Events
  CHARGE_REFUNDED: 'charge.refunded',
  CHARGE_DISPUTED: 'charge.dispute.created',
  CHARGE_DISPUTE_CLOSED: 'charge.dispute.closed',

  // Subscription Events
  CHECKOUT_SESSION_COMPLETED: 'checkout.session.completed',
  SUBSCRIPTION_CREATED: 'customer.subscription.created',
  SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  INVOICE_PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
  INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
} as const;

/**
 * ============================================================
 * STRIPE EVENTS - V2 (New)
 * ============================================================
 */

export const STRIPE_V2_EVENTS = {
  // Account Events
  ACCOUNT_CREATED: 'v2.core.account.created',
  ACCOUNT_UPDATED: 'v2.core.account.updated',

  // Subscription Events on V2 Accounts
  SUBSCRIPTION_CREATED: 'v2.billing.subscription.created',
  SUBSCRIPTION_UPDATED: 'v2.billing.subscription.updated',
  SUBSCRIPTION_DELETED: 'v2.billing.subscription.deleted',
} as const;

/**
 * All supported webhook events
 */
export const ALL_STRIPE_EVENTS = {
  ...STRIPE_V1_EVENTS,
  ...STRIPE_V2_EVENTS,
} as const;

/**
 * ============================================================
 * WEBHOOK CONFIGURATION
 * ============================================================
 */

/**
 * Construct webhook event from request
 */
export function constructWebhookEvent(
  body: string,
  signature: string
): Stripe.Event {
  const secret = getStripeWebhookSecret();

  if (!secret) {
    throw new Error('STRIPE_WEBHOOK_SECRET not configured');
  }

  return stripe.webhooks.constructEvent(body, signature, secret);
}

/**
 * ============================================================
 * API VERSION INFORMATION
 * ============================================================
 */

/**
 * API Version Details
 */
export const API_VERSIONS = {
  current: '2025-09-30.clover' as Stripe.LatestApiVersion,
  // Support both old and new event formats
  supports: {
    v1_events: true,
    v2_events: true,
  },
} as const;

/**
 * ============================================================
 * FEATURE FLAGS FOR V2 API
 * ============================================================
 */

/**
 * Check if v2 API features are enabled
 */
export function isV2Enabled(): boolean {
  return process.env.ENABLE_STRIPE_V2 === 'true';
}

/**
 * Check if adaptive checkout is enabled
 */
export function isAdaptiveCheckoutEnabled(): boolean {
  return process.env.ENABLE_ADAPTIVE_CHECKOUT === 'true';
}

/**
 * Check if merchant/marketplace features are enabled
 */
export function isMerchantFeaturesEnabled(): boolean {
  return process.env.ENABLE_MERCHANT_FEATURES === 'true';
}

/**
 * ============================================================
 * ENVIRONMENT VALIDATION
 * ============================================================
 */

/**
 * Validate Stripe configuration
 */
export function validateStripeConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check secret key
  try {
    getStripeSecretKey();
  } catch (error) {
    errors.push((error as Error).message);
  }

  // Check webhook secret (for webhook endpoints)
  if (!process.env.STRIPE_WEBHOOK_SECRET && process.env.NODE_ENV === 'production') {
    errors.push('STRIPE_WEBHOOK_SECRET should be set in production');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * ============================================================
 * INITIALIZATION & HEALTH CHECK
 * ============================================================
 */

/**
 * Test Stripe connection
 */
export async function testStripeConnection(): Promise<{ connected: boolean; error?: string }> {
  try {
    // Try to retrieve account info
    const account = await stripe.accounts.retrieve();

    return {
      connected: true,
    };
  } catch (error) {
    return {
      connected: false,
      error: (error as Error).message,
    };
  }
}

/**
 * Initialize and validate Stripe configuration on startup
 */
export function initializeStripeConfig(): void {
  const validation = validateStripeConfig();

  if (!validation.valid) {
    console.error('❌ Stripe configuration errors:', validation.errors);
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Invalid Stripe configuration in production');
    }
  } else {
    console.log('✅ Stripe configuration validated');
  }

  // Test connection
  testStripeConnection().then((result) => {
    if (result.connected) {
      console.log('✅ Stripe API connection successful');
    } else {
      console.warn('⚠️ Stripe API connection failed:', result.error);
    }
  });
}
