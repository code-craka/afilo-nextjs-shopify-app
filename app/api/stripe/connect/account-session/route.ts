/**
 * POST /api/stripe/connect/account-session
 *
 * Create an AccountSession for embedded components
 *
 * Flow:
 * 1. Authenticate with Clerk
 * 2. Rate limiting
 * 3. Validate request (Zod)
 * 4. Verify account ownership
 * 5. Create AccountSession with Stripe
 * 6. Store session in database
 * 7. Return client_secret
 *
 * @see https://docs.stripe.com/api/account_sessions/create
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { CreateAccountSessionSchema } from '@/lib/validations/stripe-connect';
import {
  validateAccountOwnership,
  getConnectAccountFromDb,
  storeAccountSession,
} from '@/lib/stripe/services/connect-accounts.service';
import { createAccountSession } from '@/lib/stripe/connect-server';
import { checkRateLimit, moderateBillingRateLimit } from '@/lib/rate-limit';
import { createErrorResponse, logError } from '@/lib/utils/error-handling';

/**
 * POST: Create account session
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  let userId: string | null = null;
  let accountId: string | undefined = undefined;

  try {
    // Step 1: Authenticate with Clerk
    const authResult = await auth();
    userId = authResult.userId;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Please sign in to access embedded components',
          },
        },
        { status: 401 }
      );
    }

    // Step 2: Rate limiting
    const rateLimitCheck = await checkRateLimit(
      `account-session:${userId}`,
      moderateBillingRateLimit
    );

    if (!rateLimitCheck.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many session requests. Please try again later.',
          },
        },
        {
          status: 429,
          headers: rateLimitCheck.headers,
        }
      );
    }

    // Step 3: Validate request body
    const body = await request.json();
    const validated = CreateAccountSessionSchema.parse(body);

    accountId = validated.account_id;

    console.log('[API] Creating account session:', {
      user_id: userId,
      account_id: accountId,
      components: validated.components,
    });

    // Step 4: Verify account ownership
    const isOwner = await validateAccountOwnership(accountId, userId);
    if (!isOwner) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to access this account',
          },
        },
        { status: 403 }
      );
    }

    // Step 5: Get account from database
    const account = await getConnectAccountFromDb(accountId);
    if (!account) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ACCOUNT_NOT_FOUND',
            message: 'Connect account not found',
          },
        },
        { status: 404 }
      );
    }

    // Step 6: Create AccountSession with Stripe
    const session = await createAccountSession({
      account_id: account.stripe_account_id,
      components: validated.components || [
        'account_onboarding',
        'account_management',
        'payments',
        'payouts',
        'documents',
      ],
    });

    // Step 7: Store session in database
    await storeAccountSession({
      account_id: accountId,
      stripe_account_id: account.stripe_account_id,
      client_secret: session.client_secret,
      expires_at: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      components: validated.components || [],
    });

    console.log('[API] Account session created:', {
      account_id: accountId,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    });

    // Step 8: Return client_secret (NOT the full session object)
    return NextResponse.json(
      {
        success: true,
        client_secret: session.client_secret,
        expires_at: Date.now() + 30 * 60 * 1000, // 30 minutes in ms
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    logError('CREATE_ACCOUNT_SESSION', error, { userId, accountId });
    return createErrorResponse(error);
  }
}

/**
 * GET: Documentation
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    name: 'Create Account Session',
    version: '1.0',
    description: 'Create an AccountSession for embedded components',
    method: 'POST',
    authentication: 'Clerk',
    authorization: 'Account owner only',
    request_body: {
      account_id: 'string - Database account ID (UUID) (required)',
      components: 'string[] - Components to enable (optional)',
    },
    available_components: [
      'account_onboarding',
      'account_management',
      'payments',
      'payouts',
      'documents',
      'notification_banner',
      'balances',
      'payment_details',
      'payout_list',
    ],
    response: {
      success: 'boolean',
      client_secret: 'string - Use with StripeConnectProvider',
      expires_at: 'number - Unix timestamp (30 minutes)',
    },
    rate_limit: '5 requests per 15 minutes per user',
    expiration: '30 minutes - Create new session after expiration',
    security: {
      requires_authentication: true,
      requires_account_ownership: true,
      client_secret_is_sensitive: true,
    },
    usage: [
      '1. Call this endpoint to get client_secret',
      '2. Pass to StripeConnectProvider',
      '3. Embedded components will initialize',
      '4. Session expires in 30 minutes',
      '5. Create new session when expired',
    ],
    notes: [
      'Do not expose client_secret publicly',
      'Sessions expire after 30 minutes',
      'One session can enable multiple components',
      'Account must complete onboarding for some components',
    ],
  });
}
