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

export async function GET() {
  try {
    // Authenticate user
    const { userId } = await auth();

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
    const stripeCustomerId = user.publicMetadata.stripeCustomerId as string | undefined;

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
  } catch (error: any) {
    console.error('Error fetching active subscription:', error);

    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch active subscription',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
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
