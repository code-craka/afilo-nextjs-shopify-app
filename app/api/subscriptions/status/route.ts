import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
});

/**
 * GET /api/subscriptions/status
 *
 * Returns current user's subscription status from Stripe
 * Used by subscription-check.ts to verify access
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find customer by Clerk user ID (stored in Stripe metadata)
    const customers = await stripe.customers.list({
      limit: 1,
      expand: ['data.subscriptions'],
    });

    const customer = customers.data.find(
      (c) => c.metadata.clerk_user_id === userId
    );

    if (!customer) {
      // User has never subscribed
      return NextResponse.json({
        hasSubscription: false,
        status: null,
        plan: null,
        currentPeriodEnd: null,
      });
    }

    // Get active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1,
      expand: ['data.items.data.price.product'],
    });

    if (subscriptions.data.length === 0) {
      // Check for other statuses (trialing, past_due, etc.)
      const allSubscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        limit: 1,
        expand: ['data.items.data.price.product'],
      });

      if (allSubscriptions.data.length === 0) {
        return NextResponse.json({
          hasSubscription: false,
          status: null,
          plan: null,
          currentPeriodEnd: null,
        });
      }

      const subscription = allSubscriptions.data[0] as any;
      return NextResponse.json({
        hasSubscription: false,
        status: subscription.status,
        plan: mapPriceToPlan(subscription.items.data[0].price.id),
        currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
      });
    }

    const subscription = subscriptions.data[0] as any;
    const priceId = subscription.items.data[0].price.id;

    return NextResponse.json({
      hasSubscription: true,
      status: subscription.status,
      plan: mapPriceToPlan(priceId),
      currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
    });
  } catch (error) {
    console.error('Subscription status check failed:', error);
    return NextResponse.json(
      { error: 'Failed to check subscription status' },
      { status: 500 }
    );
  }
}

/**
 * Map Stripe Price ID to plan tier
 */
function mapPriceToPlan(priceId: string): 'professional' | 'business' | 'enterprise' | 'enterprise_plus' | null {
  const planMap: Record<string, 'professional' | 'business' | 'enterprise' | 'enterprise_plus'> = {
    // Professional Plan
    'price_1SE5j3FcrRhjqzak0S0YtNNF': 'professional', // Monthly
    'price_1SE5j4FcrRhjqzakFVaLCQOo': 'professional', // Annual

    // Business Plan
    'price_1SE5j5FcrRhjqzakCZvxb66W': 'business', // Monthly
    'price_1SE5j6FcrRhjqzakcykXemDQ': 'business', // Annual

    // Enterprise Plan
    'price_1SE5j7FcrRhjqzakIgQYqQ7W': 'enterprise', // Monthly
    'price_1SE5j8FcrRhjqzak41GYphlk': 'enterprise', // Annual

    // Enterprise Plus Plan
    'price_1SE5jAFcrRhjqzak9J5AC3hc': 'enterprise_plus', // Monthly
    'price_1SE5jAFcrRhjqzaknOHV8m6f': 'enterprise_plus', // Annual
  };

  return planMap[priceId] || null;
}
