/**
 * POST /api/stripe/accounts/create-v2
 *
 * Create a new Stripe Accounts v2 for authenticated user
 *
 * Supports three account types:
 * - "customer": Can purchase products (most common)
 * - "merchant": Can sell products (for marketplace, future)
 * - "both": Can buy AND sell (future)
 *
 * This endpoint:
 * 1. Authenticates with Clerk
 * 2. Creates Stripe Accounts v2
 * 3. Links with Clerk user metadata
 * 4. Stores in database (optional)
 * 5. Returns account details
 *
 * @see https://stripe.com/docs/api/accounts/create
 */

import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { StripeAccountsV2Service } from '@/lib/stripe/services/accounts-v2.service';
import { checkRateLimit, standardBillingRateLimit } from '@/lib/rate-limit';
import { isFeatureEnabled } from '@/lib/feature-flags';
import type { CreateAccountV2Response } from '@/lib/stripe/types/stripe-accounts-v2.types';

/**
 * Request body validation
 */
interface CreateAccountRequest {
  account_type?: 'customer' | 'merchant' | 'both';
  country?: string;
  currency?: string;
}

/**
 * POST: Create new Accounts v2
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Check if v2 is enabled
    if (!isFeatureEnabled('STRIPE_V2_ENABLED')) {
      return NextResponse.json(
        {
          error: 'Feature not available',
          message: 'Stripe Accounts v2 is not enabled',
        },
        { status: 403 }
      );
    }

    // Step 2: Authenticate with Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in to create an account' },
        { status: 401 }
      );
    }

    // Step 3: Rate limiting
    const rateLimitCheck = await checkRateLimit(`account-create:${userId}`, standardBillingRateLimit);

    if (!rateLimitCheck.success) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          retryAfter: Math.ceil((rateLimitCheck.reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: rateLimitCheck.headers,
        }
      );
    }

    // Step 4: Get user details
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
        { error: 'Email required', message: 'User must have a verified email' },
        { status: 400 }
      );
    }

    // Step 5: Parse and validate request body
    const body = (await request.json()) as CreateAccountRequest;

    const accountType = body.account_type || 'customer';
    const country = body.country || 'US';
    const currency = body.currency || 'usd';

    console.log('[API] Creating account:', {
      user_id: userId,
      email,
      account_type: accountType,
      country,
    });

    // Step 6: Create Accounts v2
    const response = await StripeAccountsV2Service.createAccount({
      type: accountType,
      email,
      country,
      currency,
      metadata: {
        clerk_user_id: userId,
        signup_method: (user.externalAccounts?.[0]?.provider || 'email') as any,
        signup_date: new Date().toISOString(),
      },
    });

    if (!response.success) {
      console.error('[API] Account creation failed:', response.error);

      return NextResponse.json(
        {
          error: 'Failed to create account',
          message: response.error || 'Unknown error',
        },
        { status: 500 }
      );
    }

    // Step 7: Link with Clerk user
    try {
      await StripeAccountsV2Service.linkAccountWithClerk(userId, response.account_id);
      console.log('[API] Linked account with Clerk:', response.account_id);
    } catch (linkError) {
      console.warn('[API] Failed to link with Clerk:', linkError);
      // Continue anyway - account was created successfully
    }

    // Step 8: Return success response
    console.log('[API] Account created successfully:', {
      account_id: response.account_id,
      user_id: userId,
    });

    return NextResponse.json(
      {
        success: true,
        account: response.account,
        account_id: response.account_id,
        message: 'Account created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API] Account creation error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        ...(process.env.NODE_ENV === 'development' && { details: error }),
      },
      { status: 500 }
    );
  }
}

/**
 * GET: Health check and documentation
 */
export async function GET(): Promise<NextResponse> {
  const isEnabled = isFeatureEnabled('STRIPE_V2_ENABLED');

  return NextResponse.json({
    name: 'Stripe Accounts v2 Creation',
    version: '1.0',
    status: isEnabled ? 'available' : 'disabled',
    description: 'Create new Stripe Accounts v2 for authenticated users',
    method: 'POST',
    authentication: 'Clerk',
    request_body: {
      account_type: 'string (customer | merchant | both) - Default: customer',
      country: 'string (ISO 3166-1 alpha-2) - Default: US',
      currency: 'string (lowercase) - Default: usd',
    },
    response: {
      success: 'boolean',
      account_id: 'string - Stripe Account ID (acct_xxxxx)',
      account_type: 'string',
      email: 'string',
      country: 'string',
      currency: 'string',
      message: 'string',
      created_at: 'string - ISO timestamp',
    },
    example_request: {
      method: 'POST',
      url: '/api/stripe/accounts/create-v2',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer <clerk_token>',
      },
      body: {
        account_type: 'customer',
        country: 'US',
        currency: 'usd',
      },
    },
    rate_limit: '10 requests per 15 minutes per user',
    feature_flag: 'ENABLE_STRIPE_V2',
  });
}
