/**
 * Cancel Subscription API
 *
 * POST /api/billing/subscriptions/cancel
 *
 * Cancels the customer's active subscription.
 * Can cancel immediately or at the end of the billing period.
 *
 * Body:
 * {
 *   "subscriptionId": "sub_xxx",
 *   "cancelImmediately": false // Optional, defaults to false
 * }
 */

import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { cancelSubscription } from '@/lib/billing/stripe-subscriptions';
import { stripe } from '@/lib/stripe-server';
import { checkRateLimit, strictBillingRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to cancel subscription' },
        { status: 401 }
      );
    }

    // SECURITY FIX: Rate limiting to prevent abuse
    const rateLimitCheck = await checkRateLimit(`billing-cancel:${userId}`, strictBillingRateLimit);

    if (!rateLimitCheck.success) {
      console.warn(`[SECURITY] Rate limit exceeded for user ${userId} on subscription cancel`);
      return NextResponse.json(
        {
          error: 'Too many cancellation requests. Please try again later.',
          retryAfter: Math.ceil((rateLimitCheck.reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            ...rateLimitCheck.headers,
            'Retry-After': Math.ceil((rateLimitCheck.reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Get user details
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get Stripe Customer ID
    const stripeCustomerId = user.publicMetadata.stripeCustomerId as string | undefined;

    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: 'No Stripe customer found - please contact support' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { subscriptionId, cancelImmediately = false } = body;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Missing required field: subscriptionId' },
        { status: 400 }
      );
    }

    // Security check: Verify subscription belongs to customer
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const subCustomerId = typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id;

    if (subCustomerId !== stripeCustomerId) {
      return NextResponse.json(
        { error: 'Unauthorized - This subscription does not belong to you' },
        { status: 403 }
      );
    }

    // Cancel subscription
    const canceledSubscription = await cancelSubscription(
      subscriptionId,
      cancelImmediately
    );

    return NextResponse.json({
      success: true,
      subscription: canceledSubscription,
      message: cancelImmediately
        ? 'Subscription canceled immediately'
        : 'Subscription scheduled for cancellation at end of billing period',
    });
  } catch (error: any) {
    console.error('Error canceling subscription:', error);

    return NextResponse.json(
      {
        error: error.message || 'Failed to cancel subscription',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/billing/subscriptions/cancel',
    method: 'POST',
    authentication: 'Clerk',
    description: 'Cancels subscription immediately or at period end',
  });
}
