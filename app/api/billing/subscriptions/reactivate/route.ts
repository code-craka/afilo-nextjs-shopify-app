/**
 * Reactivate Subscription API
 *
 * POST /api/billing/subscriptions/reactivate
 *
 * Reactivates a subscription that was scheduled for cancellation.
 * Only works if subscription hasn't been canceled yet (cancel_at_period_end = true).
 *
 * Body:
 * {
 *   "subscriptionId": "sub_xxx"
 * }
 */

import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { reactivateSubscription } from '@/lib/billing/stripe-subscriptions';
import { stripe } from '@/lib/stripe-server';
import { createErrorResponse, logError } from '@/lib/utils/error-handling';

export async function POST(request: NextRequest) {
  let userId: string | null = null;
  let stripeCustomerId: string | undefined = undefined;
  let subscriptionId: string | undefined = undefined;

  try {
    // Authenticate user
    const authResult = await auth();
    userId = authResult.userId;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to reactivate subscription' },
        { status: 401 }
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
    stripeCustomerId = user.publicMetadata.stripeCustomerId as string | undefined;

    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: 'No Stripe customer found - please contact support' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    subscriptionId = body.subscriptionId;

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

    // Check if subscription is scheduled for cancellation
    if (!subscription.cancel_at_period_end) {
      return NextResponse.json(
        { error: 'Subscription is not scheduled for cancellation' },
        { status: 400 }
      );
    }

    // Reactivate subscription
    const reactivatedSubscription = await reactivateSubscription(subscriptionId);

    return NextResponse.json({
      success: true,
      subscription: reactivatedSubscription,
      message: 'Subscription reactivated successfully',
    });
  } catch (error: unknown) {
    logError('SUBSCRIPTION_REACTIVATE', error, { userId, stripeCustomerId, subscriptionId });
    return createErrorResponse(error);
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/billing/subscriptions/reactivate',
    method: 'POST',
    authentication: 'Clerk',
    description: 'Reactivates a subscription scheduled for cancellation',
  });
}
