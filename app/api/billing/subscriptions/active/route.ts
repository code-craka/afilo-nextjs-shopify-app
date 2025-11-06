/**
 * Get Active Subscription API
 *
 * GET /api/billing/subscriptions/active
 *
 * Retrieves the authenticated user's active subscription.
 * Returns null if no active subscription exists.
 */

import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getActiveSubscription } from '@/lib/billing/stripe-subscriptions';
import { createErrorResponse, logError } from '@/lib/utils/error-handling';

export async function GET() {
  let userId: string | null = null;
  let stripeCustomerId: string | undefined = undefined;

  try {
    // Authenticate user
    const authResult = await auth();
    userId = authResult.userId;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to view subscription' },
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
        {
          success: true,
          subscription: null,
          message: 'No Stripe customer found',
        },
        { status: 200 }
      );
    }

    // Get active subscription
    const subscription = await getActiveSubscription(stripeCustomerId);

    return NextResponse.json({
      success: true,
      subscription,
      message: subscription ? 'Active subscription found' : 'No active subscription',
    });
  } catch (error: unknown) {
    logError('SUBSCRIPTION_ACTIVE', error, { userId, stripeCustomerId });

    return createErrorResponse(error);
  }
}

// Health check
export async function POST() {
  return NextResponse.json({
    status: 'error',
    message: 'Use GET method to fetch active subscription',
    endpoint: '/api/billing/subscriptions/active',
  }, { status: 405 });
}
