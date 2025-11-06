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
import { checkRateLimit, strictBillingRateLimit } from '@/lib/rate-limit';
import { validatePriceId, getPriceMetadata } from '@/lib/billing/price-validation';
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
        { error: 'Unauthorized - Please sign in to change subscription plan' },
        { status: 401 }
      );
    }

    // SECURITY FIX: Rate limiting to prevent fraud
    const rateLimitCheck = await checkRateLimit(`billing-change:${userId}`, strictBillingRateLimit);

    if (!rateLimitCheck.success) {
      console.warn(`[SECURITY] Rate limit exceeded for user ${userId} on plan change`);
      return NextResponse.json(
        {
          error: 'Too many plan change requests. Please try again later.',
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
    stripeCustomerId = user.publicMetadata.stripeCustomerId as string | undefined;

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

    // SECURITY FIX: Validate price ID against whitelist
    const priceValidation = validatePriceId(newPriceId);

    if (!priceValidation.valid) {
      console.warn(
        `[SECURITY] Invalid price ID attempted by user ${userId}: ${newPriceId}`,
        getPriceMetadata(newPriceId as string)
      );
      return NextResponse.json(
        { error: priceValidation.error || 'Invalid price ID' },
        { status: 400 }
      );
    }

    // Use the sanitized price ID
    const sanitizedPriceId = priceValidation.sanitized!;

    // Get active subscription
    const activeSubscription = await getActiveSubscription(stripeCustomerId);

    if (!activeSubscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    subscriptionId = activeSubscription.id;

    // Check if trying to change to the same plan
    if (activeSubscription.planId === sanitizedPriceId) {
      return NextResponse.json(
        { error: 'You are already subscribed to this plan' },
        { status: 400 }
      );
    }

    // Change subscription plan with sanitized price ID
    const updatedSubscription = await changeSubscriptionPlan(
      activeSubscription.id,
      sanitizedPriceId
    );

    console.log(`[SECURITY] Plan changed successfully for user ${userId} to price ${sanitizedPriceId}`);

    return NextResponse.json({
      success: true,
      subscription: updatedSubscription,
      message: 'Subscription plan changed successfully',
    });
  } catch (error: unknown) {
    logError('SUBSCRIPTION_CHANGE_PLAN', error, { userId, stripeCustomerId, subscriptionId });
    return createErrorResponse(error);
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
