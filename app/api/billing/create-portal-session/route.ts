/**
 * Stripe Customer Portal Session API
 *
 * Creates a Stripe Billing Portal session for authenticated users.
 * This allows customers to manage their subscriptions, payment methods,
 * invoices, and billing details through Stripe's hosted portal.
 *
 * Flow:
 * 1. User authenticates with Clerk (Google OAuth or email)
 * 2. System retrieves or creates Stripe Customer ID
 * 3. API creates billing portal session
 * 4. User redirects to Stripe-hosted portal
 * 5. After completion, user returns to app
 */

import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { updateUserStripeCustomerId } from '@/lib/clerk-utils';
import { checkRateLimit, moderateBillingRateLimit } from '@/lib/rate-limit';
import { createErrorResponse, logError } from '@/lib/utils/error-handling';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
});

export async function POST() {
  let userId: string | null = null;

  try {
    // Step 1: Authenticate user with Clerk
    const authResult = await auth();
    userId = authResult.userId;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to manage billing' },
        { status: 401 }
      );
    }

    // SECURITY FIX: Rate limiting for portal session creation
    const rateLimitCheck = await checkRateLimit(`billing-portal:${userId}`, moderateBillingRateLimit);

    if (!rateLimitCheck.success) {
      console.warn(`[SECURITY] Rate limit exceeded for user ${userId} on portal session`);
      return NextResponse.json(
        {
          error: 'Too many portal session requests. Please try again later.',
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

    // Step 2: Get user details from Clerk
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

    // Step 3: Get or create Stripe Customer
    let stripeCustomerId = user.publicMetadata.stripeCustomerId as string | undefined;

    if (!stripeCustomerId) {
      console.log('Creating new Stripe customer for:', email);

      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || undefined,
        metadata: {
          clerkUserId: userId,
          authMethod: user.externalAccounts?.[0]?.provider || 'email',
          createdAt: new Date().toISOString(),
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

    // Step 4: Create Billing Portal Session
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session=billing_portal`,
    });

    // Step 5: Return portal URL
    return NextResponse.json({
      success: true,
      url: session.url,
      customerId: stripeCustomerId,
    });

  } catch (error: unknown) {
    logError('BILLING_PORTAL_SESSION', error, { userId });

    return createErrorResponse(error);
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/billing/create-portal-session',
    method: 'POST',
    authentication: 'Clerk',
    description: 'Creates Stripe Billing Portal session for authenticated users',
  });
}
