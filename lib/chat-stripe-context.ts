/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Chat Stripe Context Utilities
 *
 * Fetches customer payment status and subscription data from Stripe.
 * Used to personalize AI bot responses based on customer tier and payment status.
 *
 * Phase 1: Setup only (structure and types)
 * Phase 3: Full implementation with Stripe API calls
 */

import { stripe } from '@/lib/stripe-server';
import { neon } from '@neondatabase/serverless';
import type { CustomerContext, SubscriptionTier, SubscriptionStatus } from '@/types/chat';
import Stripe from 'stripe';

const sql = neon(process.env.DATABASE_URL!);

// ====================================
// Customer Context Fetching
// ====================================

/**
 * Get comprehensive customer context for AI bot
 *
 * Fetches:
 * - Stripe customer data
 * - Active subscriptions
 * - Payment method status
 * - Lifetime value and MRR
 * - Account age and activity
 *
 * @param clerkUserId - Clerk user ID
 * @returns Customer context or null if not found
 */
export async function getCustomerContext(
  clerkUserId: string
): Promise<CustomerContext | null> {
  try {
    // Get basic user profile data
    const userProfile = await getUserProfileData(clerkUserId);

    if (!userProfile) {
      return null;
    }

    // Get Stripe customer ID from user_profiles
    const stripeCustomerId = userProfile.stripe_customer_id;

    // Build basic context
    const basicContext: CustomerContext = {
      userId: clerkUserId,
      stripeCustomerId: stripeCustomerId || '',
      subscriptionTier: mapSubscriptionTier(userProfile.subscription_tier),
      subscriptionStatus: null,
      currentPeriodEnd: null,
      paymentMethodValid: false,
      mrr: 0,
      lifetimeValue: 0,
      accountAge: calculateAccountAge(userProfile.created_at),
      supportTicketCount: 0,
      lastLoginDate: userProfile.last_login || new Date(),
    };

    // Phase 3: Fetch real Stripe data if customer ID exists
    if (stripeCustomerId) {
      try {
        const stripeData = await fetchStripeCustomerData(stripeCustomerId);
        return {
          ...basicContext,
          ...stripeData,
        };
      } catch (error) {
        console.error('[CHAT_STRIPE] Failed to fetch Stripe data:', error);
        // Return basic context if Stripe fetch fails
        return basicContext;
      }
    }

    return basicContext;
  } catch (error) {
    console.error('[CHAT_STRIPE] Error fetching customer context:', error);
    return null;
  }
}

// ====================================
// User Profile Data
// ====================================

/**
 * Get user profile from database
 */
async function getUserProfileData(clerkUserId: string) {
  try {
    const result = await sql`
      SELECT
        clerk_user_id,
        email,
        subscription_tier,
        stripe_customer_id,
        created_at,
        last_login
      FROM user_profiles
      WHERE clerk_user_id = ${clerkUserId}
      LIMIT 1
    `;

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('[CHAT_STRIPE] Error fetching user profile:', error);
    return null;
  }
}

// ====================================
// Stripe Data Fetching (Phase 3)
// ====================================

/**
 * Fetch Stripe customer data
 *
 * Phase 3: Full Stripe integration implemented
 */
async function fetchStripeCustomerData(stripeCustomerId: string) {
  try {
    console.log('[CHAT_STRIPE] Fetching Stripe data for customer:', stripeCustomerId);

    // Fetch customer with expanded subscriptions
    const customer = await stripe.customers.retrieve(stripeCustomerId, {
      expand: ['subscriptions'],
    }) as Stripe.Customer & { subscriptions?: Stripe.ApiList<Stripe.Subscription> };

    // Get subscriptions
    const subscriptions = customer.subscriptions?.data || [];

    // Get active subscription
    const activeSubscription = subscriptions.find(
      (sub) => sub.status === 'active' || sub.status === 'trialing'
    );

    // Calculate MRR (Monthly Recurring Revenue)
    let mrr = 0;
    if (activeSubscription) {
      for (const item of activeSubscription.items.data) {
        const amount = item.price.unit_amount || 0;
        const interval = item.price.recurring?.interval || 'month';

        if (interval === 'year') {
          mrr += amount / 12; // Convert annual to monthly
        } else {
          mrr += amount;
        }
      }
    }

    // Calculate lifetime value from paid invoices
    const invoices = await stripe.invoices.list({
      customer: stripeCustomerId,
      status: 'paid',
      limit: 100,
    });

    const lifetimeValue = invoices.data.reduce(
      (sum, invoice) => sum + (invoice.amount_paid || 0),
      0
    );

    // Check payment method validity
    const paymentMethodValid = Boolean(
      (customer as any).default_payment_method ||
      (customer as any).default_source ||
      customer.invoice_settings?.default_payment_method
    );

    // Determine subscription tier from price ID
    const priceId = activeSubscription?.items.data[0]?.price.id;
    const subscriptionTier = priceId ? mapStripePlanToTier(priceId) : 'free';

    console.log('[CHAT_STRIPE] ✓ Fetched Stripe data:', {
      tier: subscriptionTier,
      status: activeSubscription?.status,
      mrr: mrr / 100,
      ltv: lifetimeValue / 100,
    });

    return {
      subscriptionTier,
      subscriptionStatus: (activeSubscription?.status || null) as SubscriptionStatus,
      currentPeriodEnd: activeSubscription
        ? new Date((activeSubscription as any).current_period_end * 1000)
        : null,
      paymentMethodValid,
      mrr,
      lifetimeValue,
    };
  } catch (error) {
    console.error('[CHAT_STRIPE] Error fetching Stripe data:', error);

    // Return safe defaults on error
    return {
      subscriptionTier: 'free' as SubscriptionTier,
      subscriptionStatus: null as SubscriptionStatus | null,
      currentPeriodEnd: null as Date | null,
      paymentMethodValid: false,
      mrr: 0,
      lifetimeValue: 0,
    };
  }
}

// ====================================
// Helper Functions
// ====================================

/**
 * Map database subscription tier to typed enum
 */
function mapSubscriptionTier(tier: string | null): SubscriptionTier {
  switch (tier) {
    case 'professional':
      return 'professional';
    case 'enterprise':
      return 'enterprise';
    case 'enterprise_plus':
      return 'enterprise_plus';
    default:
      return 'free';
  }
}

/**
 * Map Stripe price ID to subscription tier
 *
 * Updated with actual Stripe price IDs from production
 */
function mapStripePlanToTier(priceId: string | undefined): SubscriptionTier {
  if (!priceId) return 'free';

  // Map Stripe price IDs to subscription tiers (from lib/billing/stripe-subscriptions.ts)
  const tierMap: Record<string, SubscriptionTier> = {
    // Professional tier ($499/month or $415/month annual)
    'price_1SE5j3FcrRhjqzak0S0YtNNF': 'professional', // Monthly
    'price_1SE5j4FcrRhjqzakCCTEIq5o': 'professional', // Annual

    // Business tier ($1,499/month or $1,244/month annual)
    // Note: Mapping "business" to "professional" tier since chat types only have 4 tiers
    'price_1SE5j5FcrRhjqzakCZvxb66W': 'professional', // Monthly
    'price_1SE5j6FcrRhjqzakMLUcHBZG': 'professional', // Annual

    // Enterprise tier ($4,999/month or $4,149/month annual)
    'price_1SE5j7FcrRhjqzakIgQYqQ7W': 'enterprise', // Monthly
    'price_1SE5j9FcrRhjqzakVoNtLM1H': 'enterprise', // Annual

    // Enterprise Plus tier ($9,999/month or $8,299/month annual)
    'price_1SE5jAFcrRhjqzak9J5AC3hc': 'enterprise_plus', // Monthly
    'price_1SE5jBFcrRhjqzakqA3wW7vU': 'enterprise_plus', // Annual

    // Legacy/test price IDs (from price-validation.ts)
    'price_1QvsfCFcrRhjqzak6x0vr3I4': 'free',         // $9/month (starter)
    'price_1QvsfCFcrRhjqzakikGk7yiY': 'professional', // $29/month
    'price_1QvsfCFcrRhjqzakuZ7VGGQw': 'enterprise',   // $99/month
  };

  const tier = tierMap[priceId];

  if (!tier) {
    console.warn(`[CHAT_STRIPE] Unknown Stripe price ID: ${priceId}, defaulting to free`);
    return 'free';
  }

  console.log(`[CHAT_STRIPE] Mapped price ID ${priceId} to tier: ${tier}`);
  return tier;
}

/**
 * Calculate account age in days
 */
function calculateAccountAge(createdAt: Date | string | null): number {
  if (!createdAt) return 0;

  const created = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - created.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

// ====================================
// Formatted Context for AI Prompts
// ====================================

/**
 * Format customer context for AI prompt injection
 *
 * Converts CustomerContext into natural language for Claude.
 *
 * @param context - Customer context
 * @returns Formatted string for AI prompt
 */
export function formatContextForAI(context: CustomerContext | null): string {
  if (!context) {
    return 'Customer context unavailable.';
  }

  const parts: string[] = [];

  // Subscription tier
  parts.push(`Subscription Tier: ${context.subscriptionTier}`);

  // Subscription status
  if (context.subscriptionStatus) {
    parts.push(`Status: ${context.subscriptionStatus}`);
  }

  // Payment method
  if (context.paymentMethodValid) {
    parts.push('Payment Method: Valid');
  } else {
    parts.push('Payment Method: None on file');
  }

  // Account age
  parts.push(`Account Age: ${context.accountAge} days`);

  // MRR (if applicable)
  if (context.mrr > 0) {
    parts.push(`Monthly Revenue: $${(context.mrr / 100).toFixed(2)}`);
  }

  // Lifetime value
  if (context.lifetimeValue > 0) {
    parts.push(`Lifetime Value: $${(context.lifetimeValue / 100).toFixed(2)}`);
  }

  // Current period end
  if (context.currentPeriodEnd) {
    const renewalDate = context.currentPeriodEnd.toLocaleDateString();
    parts.push(`Next Renewal: ${renewalDate}`);
  }

  return parts.join('\n');
}

/**
 * Get tier-specific greeting
 */
export function getTierGreeting(tier: SubscriptionTier): string {
  switch (tier) {
    case 'enterprise_plus':
      return 'As our valued Enterprise Plus customer, you have access to premium support and all features.';
    case 'enterprise':
      return 'As an Enterprise customer, you have access to advanced features and priority support.';
    case 'professional':
      return 'As a Professional subscriber, you have access to premium features.';
    case 'free':
      return 'Welcome! You are currently on our Free plan.';
    default:
      return 'Welcome to Afilo support!';
  }
}
