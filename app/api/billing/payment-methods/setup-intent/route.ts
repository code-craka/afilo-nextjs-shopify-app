/**
 * Create Setup Intent API
 *
 * POST /api/billing/payment-methods/setup-intent
 *
 * Creates a SetupIntent for collecting payment method details.
 * Used when adding a new card or bank account via Stripe Elements.
 */

import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createSetupIntent } from '@/lib/billing/stripe-payment-methods';
import { stripe } from '@/lib/stripe-server';
import { updateUserStripeCustomerId } from '@/lib/clerk-utils';
import { checkRateLimit, moderateBillingRateLimit } from '@/lib/rate-limit';

export async function POST() {
  try {
    // Authenticate user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to add payment methods' },
        { status: 401 }
      );
    }

    // SECURITY FIX: Rate limiting for setup operations
    const rateLimitCheck = await checkRateLimit(`billing-setup:${userId}`, moderateBillingRateLimit);

    if (!rateLimitCheck.success) {
      console.warn(`[SECURITY] Rate limit exceeded for user ${userId} on setup intent`);
      return NextResponse.json(
        {
          error: 'Too many setup requests. Please try again later.',
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

    const email = user.emailAddresses[0]?.emailAddress;

    if (!email) {
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 400 }
      );
    }

    // Get or create Stripe Customer
    let stripeCustomerId = user.publicMetadata.stripeCustomerId as string | undefined;

    if (!stripeCustomerId) {
      console.log('Creating new Stripe customer for setup intent:', email);

      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || undefined,
        metadata: {
          clerkUserId: userId,
          authMethod: user.externalAccounts?.[0]?.provider || 'email',
          createdAt: new Date().toISOString(),
          purpose: 'billing_portal',
        },
      });

      stripeCustomerId = customer.id;

      // SECURITY FIX: Update Clerk user metadata to prevent race conditions
      const updated = await updateUserStripeCustomerId(userId, stripeCustomerId);

      if (!updated) {
        console.warn(`[SECURITY WARNING] Failed to update Clerk metadata for user ${userId}`);
        // Continue anyway - customer was created in Stripe
        // This will be retried on next request
      }

      console.log('Created Stripe Customer:', stripeCustomerId);
    }

    // Create SetupIntent
    const clientSecret = await createSetupIntent(stripeCustomerId);

    return NextResponse.json({
      success: true,
      clientSecret,
      customerId: stripeCustomerId,
      message: 'SetupIntent created successfully',
    });
  } catch (error: any) {
    console.error('Error creating setup intent:', error);

    return NextResponse.json(
      {
        error: error.message || 'Failed to create setup intent',
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
    endpoint: '/api/billing/payment-methods/setup-intent',
    method: 'POST',
    authentication: 'Clerk',
    description: 'Creates SetupIntent for adding new payment methods',
  });
}
