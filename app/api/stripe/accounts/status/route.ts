/**
 * GET /api/stripe/accounts/status
 *
 * Get Stripe Accounts v2 status for authenticated user
 *
 * Returns:
 * - Account ID and type
 * - Payment capabilities status
 * - Verification requirements
 * - Configuration details
 *
 * @see https://stripe.com/docs/api/accounts/retrieve
 */

import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { StripeAccountsV2Service } from '@/lib/stripe/services/accounts-v2.service';
import { getUserStripeCustomerId } from '@/lib/clerk-utils';
import { checkRateLimit, standardBillingRateLimit } from '@/lib/rate-limit';
import { isFeatureEnabled } from '@/lib/feature-flags';

/**
 * Query parameters
 */
interface StatusQuery {
  account_id?: string; // If not provided, use Clerk metadata
}

/**
 * GET: Get account status
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
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
        { error: 'Unauthorized', message: 'Please sign in' },
        { status: 401 }
      );
    }

    // Step 3: Rate limiting
    const rateLimitCheck = await checkRateLimit(`account-status:${userId}`, standardBillingRateLimit);

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

    // Step 4: Get account ID from query or Clerk metadata
    const searchParams = request.nextUrl.searchParams;
    let accountId = searchParams.get('account_id');

    if (!accountId) {
      // Try to get from Clerk metadata (v2 account ID)
      accountId = await getUserStripeCustomerId(userId);

      if (!accountId) {
        return NextResponse.json(
          {
            error: 'No account found',
            message: 'User does not have a Stripe Accounts v2 account yet',
            next_step: 'Create account via POST /api/stripe/accounts/create-v2',
          },
          { status: 404 }
        );
      }
    }

    console.log('[API] Getting account status:', {
      user_id: userId,
      account_id: accountId,
    });

    // Step 5: Get account status
    const status = await StripeAccountsV2Service.getAccountStatus(accountId);

    console.log('[API] Account status retrieved:', {
      account_id: accountId,
      status: status.status,
    });

    // Step 6: Return status
    return NextResponse.json({
      success: true,
      account: {
        id: status.account_id,
        type: status.account_type,
        status: status.status,
        capabilities: {
          payments_enabled: status.capabilities.payments_enabled,
          payouts_enabled: status.capabilities.payouts_enabled,
        },
        verification: {
          status: status.verification.status,
          missing_fields: status.verification.missing_fields,
          deadline: status.verification.deadline,
          restrictions: status.verification.restrictions,
        },
        configuration: status.configuration,
        created_at: status.created_at.toISOString(),
        updated_at: status.updated_at.toISOString(),
      },
    });
  } catch (error) {
    console.error('[API] Account status error:', error);

    return NextResponse.json(
      {
        error: 'Failed to get account status',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

/**
 * GET: Health check and documentation
 */
export function GET_DOCS(): NextResponse {
  return NextResponse.json({
    name: 'Stripe Accounts v2 Status',
    version: '1.0',
    description: 'Get account status for authenticated user',
    method: 'GET',
    authentication: 'Clerk',
    query_params: {
      account_id: 'string (optional) - Specific account ID to check',
    },
    response: {
      success: 'boolean',
      account: {
        id: 'string - Stripe Account ID',
        type: 'string - Account type (customer | merchant | both)',
        status: 'string - Account status (active | pending | restricted | closed)',
        capabilities: {
          payments_enabled: 'boolean',
          payouts_enabled: 'boolean',
        },
        verification: {
          status: 'string',
          missing_fields: 'string[]',
          deadline: 'string | null',
          restrictions: 'string[] | null',
        },
        configuration: 'object - Account configuration',
        created_at: 'string - ISO timestamp',
        updated_at: 'string - ISO timestamp',
      },
    },
    rate_limit: '20 requests per 15 minutes per user',
  });
}
