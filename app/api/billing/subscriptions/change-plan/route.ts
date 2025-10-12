/**
 * Change Subscription Plan API
 *
 * POST /api/billing/subscriptions/change-plan
 *
 * Changes the customer's subscription to a different plan.
 * Handles prorated billing automatically.
 *
 * Body:
 * {
 *   "newPriceId": "price_xxx" // Stripe Price ID for the new plan
 * }
 */

import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { getActiveSubscription, changeSubscriptionPlan } from '@/lib/billing/stripe-subscriptions';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to change subscription plan' },
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
        { error: 'No Stripe customer found - please contact support' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { newPriceId } = body;

    if (!newPriceId) {
      return NextResponse.json(
        { error: 'Missing required field: newPriceId' },
        { status: 400 }
      );
    }

    // Get active subscription
    const activeSubscription = await getActiveSubscription(stripeCustomerId);

    if (!activeSubscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Check if trying to change to the same plan
    if (activeSubscription.planId === newPriceId) {
      return NextResponse.json(
        { error: 'You are already subscribed to this plan' },
        { status: 400 }
      );
    }

    // Change subscription plan
    const updatedSubscription = await changeSubscriptionPlan(
      activeSubscription.id,
      newPriceId
    );

    return NextResponse.json({
      success: true,
      subscription: updatedSubscription,
      message: 'Subscription plan changed successfully',
    });
  } catch (error: any) {
    console.error('Error changing subscription plan:', error);

    return NextResponse.json(
      {
        error: error.message || 'Failed to change subscription plan',
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
    endpoint: '/api/billing/subscriptions/change-plan',
    method: 'POST',
    authentication: 'Clerk',
    description: 'Changes subscription plan with prorated billing',
  });
}
