/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Stripe Subscriptions Utilities
 *
 * Manages customer subscriptions for Afilo Enterprise billing portal.
 * Supports:
 * - Professional: $499/month ($415/month annual)
 * - Business: $1,499/month ($1,244/month annual)
 * - Enterprise: $4,999/month ($4,149/month annual)
 * - Enterprise Plus: $9,999/month ($8,299/month annual)
 *
 * Functions:
 * - Get active subscription details
 * - List subscription history
 * - Change plan (upgrade/downgrade with prorated billing)
 * - Cancel subscription (with retention options)
 * - Reactivate canceled subscription
 */

import Stripe from 'stripe';
import { stripe } from '@/lib/stripe-server';

/**
 * Subscription Data Type
 */
export interface SubscriptionData {
  id: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete';
  planName: string;
  planId: string;
  amount: number; // Monthly amount in cents
  currency: string;
  interval: 'month' | 'year';
  currentPeriodStart: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  canceledAt: number | null;
  trialEnd: number | null;
  created: number;
}

/**
 * Plan Configuration
 */
export const PLAN_CONFIGS = {
  professional: {
    name: 'Professional',
    monthlyPriceId: 'price_1SE5j3FcrRhjqzak0S0YtNNF',
    annualPriceId: 'price_1SE5j4FcrRhjqzakCCTEIq5o',
    monthlyAmount: 49900,
    annualAmount: 41492, // $415/month billed annually ($4,988/year)
  },
  business: {
    name: 'Business',
    monthlyPriceId: 'price_1SE5j5FcrRhjqzakCZvxb66W',
    annualPriceId: 'price_1SE5j6FcrRhjqzakMLUcHBZG',
    monthlyAmount: 149900,
    annualAmount: 124417, // $1,244/month billed annually ($14,930/year)
  },
  enterprise: {
    name: 'Enterprise',
    monthlyPriceId: 'price_1SE5j7FcrRhjqzakIgQYqQ7W',
    annualPriceId: 'price_1SE5j9FcrRhjqzakVoNtLM1H',
    monthlyAmount: 499900,
    annualAmount: 414917, // $4,149/month billed annually ($49,790/year)
  },
  enterprisePlus: {
    name: 'Enterprise Plus',
    monthlyPriceId: 'price_1SE5jAFcrRhjqzak9J5AC3hc',
    annualPriceId: 'price_1SE5jBFcrRhjqzakqA3wW7vU',
    monthlyAmount: 999900,
    annualAmount: 829917, // $8,299/month billed annually ($99,590/year)
  },
} as const;

/**
 * Get Plan Name from Price ID
 */
export function getPlanNameFromPriceId(priceId: string): string {
  for (const [key, config] of Object.entries(PLAN_CONFIGS)) {
    if (config.monthlyPriceId === priceId || config.annualPriceId === priceId) {
      return config.name;
    }
  }
  return 'Unknown Plan';
}

/**
 * Get Active Subscription
 *
 * Retrieves the customer's active subscription.
 * Returns null if no active subscription exists.
 *
 * @param customerId - Stripe Customer ID
 * @returns Active subscription data or null
 */
export async function getActiveSubscription(
  customerId: string
): Promise<SubscriptionData | null> {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
      expand: ['data.default_payment_method'],
    });

    if (subscriptions.data.length === 0) {
      return null;
    }

    const sub = subscriptions.data[0];
    const priceId = sub.items.data[0].price.id;
    const planName = getPlanNameFromPriceId(priceId);

    return {
      id: sub.id,
      status: sub.status as SubscriptionData['status'],
      planName,
      planId: priceId,
      amount: sub.items.data[0].price.unit_amount || 0,
      currency: sub.items.data[0].price.currency,
      interval: sub.items.data[0].price.recurring?.interval as 'month' | 'year',
      currentPeriodStart: (sub as any).current_period_start,
      currentPeriodEnd: (sub as any).current_period_end,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      canceledAt: sub.canceled_at,
      trialEnd: sub.trial_end,
      created: sub.created,
    };
  } catch (error: unknown) {
    console.error('Error fetching active subscription:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch active subscription');
  }
}

/**
 * List Subscription History
 *
 * Retrieves all subscriptions (active, canceled, past) for a customer.
 *
 * @param customerId - Stripe Customer ID
 * @param limit - Maximum number of subscriptions to return
 * @returns Array of subscription data
 */
export async function listSubscriptionHistory(
  customerId: string,
  limit: number = 10
): Promise<SubscriptionData[]> {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit,
      expand: ['data.default_payment_method'],
    });

    return subscriptions.data.map((sub) => {
      const priceId = sub.items.data[0].price.id;
      const planName = getPlanNameFromPriceId(priceId);

      return {
        id: sub.id,
        status: sub.status as SubscriptionData['status'],
        planName,
        planId: priceId,
        amount: sub.items.data[0].price.unit_amount || 0,
        currency: sub.items.data[0].price.currency,
        interval: sub.items.data[0].price.recurring?.interval as 'month' | 'year',
        currentPeriodStart: (sub as any).current_period_start,
        currentPeriodEnd: (sub as any).current_period_end,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        canceledAt: sub.canceled_at,
        trialEnd: sub.trial_end,
        created: sub.created,
      };
    });
  } catch (error: unknown) {
    console.error('Error listing subscription history:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to list subscription history');
  }
}

/**
 * Change Subscription Plan
 *
 * Upgrades or downgrades a subscription to a different plan.
 * Handles prorated billing automatically.
 *
 * @param subscriptionId - Stripe Subscription ID
 * @param newPriceId - New Stripe Price ID
 * @returns Updated subscription data
 */
export async function changeSubscriptionPlan(
  subscriptionId: string,
  newPriceId: string
): Promise<SubscriptionData> {
  try {
    // Retrieve current subscription
    const currentSub = await stripe.subscriptions.retrieve(subscriptionId);
    const currentItemId = currentSub.items.data[0].id;

    // Update subscription with new price
    const updatedSub = await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: currentItemId,
          price: newPriceId,
        },
      ],
      proration_behavior: 'always_invoice', // Create immediate invoice for proration
      billing_cycle_anchor: 'unchanged', // Keep current billing cycle
    });

    const priceId = updatedSub.items.data[0].price.id;
    const planName = getPlanNameFromPriceId(priceId);

    console.log(`✅ Subscription plan changed: ${subscriptionId} to ${planName} (${newPriceId})`);

    return {
      id: updatedSub.id,
      status: updatedSub.status as SubscriptionData['status'],
      planName,
      planId: priceId,
      amount: updatedSub.items.data[0].price.unit_amount || 0,
      currency: updatedSub.items.data[0].price.currency,
      interval: updatedSub.items.data[0].price.recurring?.interval as 'month' | 'year',
      currentPeriodStart: (updatedSub as any).current_period_start,
      currentPeriodEnd: (updatedSub as any).current_period_end,
      cancelAtPeriodEnd: updatedSub.cancel_at_period_end,
      canceledAt: updatedSub.canceled_at,
      trialEnd: updatedSub.trial_end,
      created: updatedSub.created,
    };
  } catch (error: unknown) {
    console.error('Error changing subscription plan:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to change subscription plan');
  }
}

/**
 * Cancel Subscription
 *
 * Cancels a subscription at the end of the current billing period.
 * Customer retains access until period ends.
 *
 * @param subscriptionId - Stripe Subscription ID
 * @param cancelImmediately - If true, cancel immediately instead of at period end
 * @returns Updated subscription data
 */
export async function cancelSubscription(
  subscriptionId: string,
  cancelImmediately: boolean = false
): Promise<SubscriptionData> {
  try {
    let updatedSub: Stripe.Subscription;

    if (cancelImmediately) {
      // Cancel immediately (customer loses access now)
      updatedSub = await stripe.subscriptions.cancel(subscriptionId);
    } else {
      // Cancel at period end (customer retains access until period ends)
      updatedSub = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    }

    const priceId = updatedSub.items.data[0].price.id;
    const planName = getPlanNameFromPriceId(priceId);

    console.log(
      `✅ Subscription ${cancelImmediately ? 'canceled immediately' : 'scheduled for cancellation'}: ${subscriptionId}`
    );

    return {
      id: updatedSub.id,
      status: updatedSub.status as SubscriptionData['status'],
      planName,
      planId: priceId,
      amount: updatedSub.items.data[0].price.unit_amount || 0,
      currency: updatedSub.items.data[0].price.currency,
      interval: updatedSub.items.data[0].price.recurring?.interval as 'month' | 'year',
      currentPeriodStart: (updatedSub as any).current_period_start,
      currentPeriodEnd: (updatedSub as any).current_period_end,
      cancelAtPeriodEnd: updatedSub.cancel_at_period_end,
      canceledAt: updatedSub.canceled_at,
      trialEnd: updatedSub.trial_end,
      created: updatedSub.created,
    };
  } catch (error: unknown) {
    console.error('Error canceling subscription:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to cancel subscription');
  }
}

/**
 * Reactivate Subscription
 *
 * Reactivates a subscription that was scheduled for cancellation.
 * Only works if subscription hasn't been canceled yet (cancel_at_period_end = true).
 *
 * @param subscriptionId - Stripe Subscription ID
 * @returns Updated subscription data
 */
export async function reactivateSubscription(
  subscriptionId: string
): Promise<SubscriptionData> {
  try {
    const updatedSub = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });

    const priceId = updatedSub.items.data[0].price.id;
    const planName = getPlanNameFromPriceId(priceId);

    console.log(`✅ Subscription reactivated: ${subscriptionId}`);

    return {
      id: updatedSub.id,
      status: updatedSub.status as SubscriptionData['status'],
      planName,
      planId: priceId,
      amount: updatedSub.items.data[0].price.unit_amount || 0,
      currency: updatedSub.items.data[0].price.currency,
      interval: updatedSub.items.data[0].price.recurring?.interval as 'month' | 'year',
      currentPeriodStart: (updatedSub as any).current_period_start,
      currentPeriodEnd: (updatedSub as any).current_period_end,
      cancelAtPeriodEnd: updatedSub.cancel_at_period_end,
      canceledAt: updatedSub.canceled_at,
      trialEnd: updatedSub.trial_end,
      created: updatedSub.created,
    };
  } catch (error: unknown) {
    console.error('Error reactivating subscription:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to reactivate subscription');
  }
}

/**
 * Format Currency
 */
export function formatCurrency(cents: number, currency: string = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

/**
 * Format Date
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Get Status Badge Color
 */
export function getStatusColor(status: SubscriptionData['status']): {
  bg: string;
  text: string;
  dot: string;
} {
  switch (status) {
    case 'active':
      return { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' };
    case 'trialing':
      return { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' };
    case 'past_due':
      return { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' };
    case 'canceled':
      return { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500' };
    case 'unpaid':
      return { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500' };
  }
}
