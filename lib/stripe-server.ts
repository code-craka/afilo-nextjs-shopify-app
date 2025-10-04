import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

/**
 * Stripe Server Client for Afilo Enterprise Marketplace
 *
 * Features:
 * - ACH Direct Debit support for US customers
 * - Adaptive 3D Secure (automatic, not forced)
 * - Stripe Radar integration for fraud prevention
 * - Enterprise-grade payment processing
 *
 * @see https://stripe.com/docs/api
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
  appInfo: {
    name: 'Afilo Enterprise Marketplace',
    version: '1.0.0',
    url: 'https://app.afilo.io',
  },
});

/**
 * Product Value Tiers for Radar Risk Assessment
 *
 * Determines risk thresholds based on transaction amount:
 * - Low: Under $2,499 (Professional tier)
 * - Medium: $2,499-$4,999 (Mid-tier enterprise)
 * - High: $5,000-$9,999 (Premium enterprise)
 * - Enterprise: $10,000+ (Enterprise Plus)
 */
export function getProductTier(amount: number): 'low' | 'medium' | 'high' | 'enterprise' {
  if (amount < 249900) return 'low'; // <$2,499
  if (amount < 499900) return 'medium'; // $2,499-$4,999
  if (amount < 999900) return 'high'; // $5,000-$9,999
  return 'enterprise'; // $10,000+
}

/**
 * Risk Thresholds per Product Tier (OPTIMIZED FOR MAXIMUM ACCEPTANCE)
 *
 * Risk scores (0-100) determine actions:
 * - Below review threshold: Auto-approve
 * - Between review and block: Manual review
 * - Above block threshold: Auto-decline
 *
 * UPDATED: Increased thresholds to accept 95%+ of legitimate payments
 * Goal: Only block obvious fraud (risk score > 95)
 */
export const RISK_THRESHOLDS = {
  low: {
    review: 85,  // Review if risk score > 85 (increased from 60)
    block: 95    // Block if risk score > 95 (increased from 80)
  },
  medium: {
    review: 85,  // Review if risk score > 85 (increased from 70)
    block: 95    // Block if risk score > 95 (increased from 85)
  },
  high: {
    review: 90,  // Review if risk score > 90 (increased from 75)
    block: 95    // Block if risk score > 95 (increased from 85)
  },
  enterprise: {
    review: 90,  // Review if risk score > 90 (increased from 75)
    block: 95    // Block if risk score > 95 (only obvious fraud)
  },
} as const;

/**
 * Payment Method Types Supported
 *
 * - card: Credit/debit cards (Visa, Mastercard, Amex, Discover)
 * - us_bank_account: ACH Direct Debit (3-5 business days)
 */
export const PAYMENT_METHODS = ['card', 'us_bank_account'] as const;

/**
 * ACH Payment Status Flow
 *
 * 1. processing: Customer submits bank account (immediate)
 * 2. requires_action: Microdeposit verification needed (rare)
 * 3. succeeded: Payment cleared (3-5 business days later)
 * 4. failed: Insufficient funds or invalid account
 */
export type ACHPaymentStatus =
  | 'processing'
  | 'requires_action'
  | 'succeeded'
  | 'failed';

/**
 * 3D Secure Strategy: Adaptive (Not Forced)
 *
 * Stripe automatically triggers 3DS when:
 * - Card issuer requires Strong Customer Authentication (SCA)
 * - Transaction is flagged as high-risk by Radar
 * - Custom Radar rules request 3DS (risk score > 75 + amount > $500)
 *
 * Benefits:
 * - Reduces friction for low-risk transactions
 * - Improves conversion rates
 * - Maintains fraud protection
 * - Complies with card network requirements
 *
 * Configuration: Use automatic_payment_methods with allow_redirects: 'always'
 */
export const ADAPTIVE_3DS_CONFIG = {
  automatic_payment_methods: {
    enabled: true,
    allow_redirects: 'always', // Enable 3DS when required
  },
} as const;

/**
 * Helper: Format amount for Stripe API
 * Stripe uses smallest currency unit (cents for USD)
 *
 * @example
 * formatStripeAmount(499) // $499.00 → 49900 cents
 */
export function formatStripeAmount(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Helper: Format amount for display
 *
 * @example
 * formatDisplayAmount(49900) // 49900 cents → "$499.00"
 */
export function formatDisplayAmount(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Helper: Determine if payment is ACH
 */
export function isACHPayment(paymentMethod: string | null | undefined): boolean {
  return Boolean(
    paymentMethod?.startsWith('pm_') &&
    paymentMethod.includes('us_bank_account')
  );
}

/**
 * Helper: Get processing time estimate
 */
export function getProcessingTimeEstimate(
  paymentMethodType: string
): string {
  switch (paymentMethodType) {
    case 'card':
      return 'Instant (within seconds)';
    case 'us_bank_account':
      return '3-5 business days';
    default:
      return 'Unknown';
  }
}

/**
 * Stripe Event Types for Webhook Handling
 */
export const STRIPE_EVENTS = {
  // Payment Intent Events (CRITICAL for ACH)
  PAYMENT_INTENT_SUCCEEDED: 'payment_intent.succeeded',
  PAYMENT_INTENT_PROCESSING: 'payment_intent.processing',
  PAYMENT_INTENT_FAILED: 'payment_intent.payment_failed',
  PAYMENT_INTENT_CANCELED: 'payment_intent.canceled',

  // Fraud Prevention Events
  REVIEW_OPENED: 'review.opened',
  REVIEW_CLOSED: 'review.closed',
  EARLY_FRAUD_WARNING: 'radar.early_fraud_warning.created',

  // Charge Events (refunds, disputes)
  CHARGE_REFUNDED: 'charge.refunded',
  CHARGE_DISPUTED: 'charge.dispute.created',
  CHARGE_DISPUTE_CLOSED: 'charge.dispute.closed',

  // Subscription Events (NEW - NO TRIALS)
  CHECKOUT_SESSION_COMPLETED: 'checkout.session.completed',
  SUBSCRIPTION_CREATED: 'customer.subscription.created',
  SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  INVOICE_PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
  INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
} as const;
