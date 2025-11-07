/**
 * GET /api/stripe/connect/account/[accountId]
 *
 * Get Connect account details and sync status from Stripe
 *
 * Flow:
 * 1. Authenticate with Clerk
 * 2. Rate limiting
 * 3. Validate account ID
 * 4. Verify account ownership or admin role
 * 5. Sync account status from Stripe
 * 6. Return account details
 *
 * @see https://stripe.com/docs/connect/accounts
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import {
  syncAccountStatus,
  validateAccountOwnership,
  getConnectAccountFromDb,
} from '@/lib/stripe/services/connect-accounts.service';
import { checkRateLimit, moderateBillingRateLimit } from '@/lib/rate-limit';
import { createErrorResponse, logError } from '@/lib/utils/error-handling';
import { prisma } from '@/lib/prisma';

/**
 * GET: Get account details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
): Promise<NextResponse> {
  let userId: string | null = null;
  const { accountId } = await params;

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
            message: 'Please sign in to view account details',
          },
        },
        { status: 401 }
      );
    }

    // Step 2: Rate limiting
    const rateLimitCheck = await checkRateLimit(
      `get-account:${userId}`,
      moderateBillingRateLimit
    );

    if (!rateLimitCheck.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please try again later.',
          },
        },
        {
          status: 429,
          headers: rateLimitCheck.headers,
        }
      );
    }

    // Step 3: Validate account ID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(accountId)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_ACCOUNT_ID',
            message: 'Invalid account ID format',
          },
        },
        { status: 400 }
      );
    }

    console.log('[API] Fetching Connect account:', {
      user_id: userId,
      account_id: accountId,
    });

    // Step 4: Check if user is admin or account owner
    const userProfile = await prisma.user_profiles.findFirst({
      where: { clerk_user_id: userId },
      select: { role: true },
    });

    const isAdmin = userProfile?.role === 'admin';
    const isOwner = await validateAccountOwnership(accountId, userId);

    if (!isAdmin && !isOwner) {
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

    // Step 5: Sync account status from Stripe
    let account;
    try {
      account = await syncAccountStatus(accountId);
      console.log('[API] Account status synced:', {
        account_id: accountId,
        onboarding_status: account.onboarding_status,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
      });
    } catch (syncError) {
      // If sync fails, get from database
      console.warn('[API] Failed to sync account status, using cached data:', syncError);
      account = await getConnectAccountFromDb(accountId);

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
    }

    // Step 6: Return account details
    return NextResponse.json(
      {
        success: true,
        account: {
          id: account.id,
          stripe_account_id: account.stripe_account_id,
          account_type: account.account_type,
          business_type: account.business_type,
          country: account.country,
          default_currency: account.default_currency,
          email: account.email,
          business_name: account.business_name,
          capabilities: account.capabilities,
          requirements: account.requirements,
          charges_enabled: account.charges_enabled,
          payouts_enabled: account.payouts_enabled,
          details_submitted: account.details_submitted,
          onboarding_status: account.onboarding_status,
          is_ready:
            account.charges_enabled &&
            account.payouts_enabled &&
            account.onboarding_status === 'completed',
          created_at: account.created_at.toISOString(),
          updated_at: account.updated_at.toISOString(),
        },
        message: 'Account details retrieved successfully',
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    logError('GET_CONNECT_ACCOUNT', error, { userId, accountId });
    return createErrorResponse(error);
  }
}

/**
 * OPTIONS: Documentation
 */
export async function OPTIONS(): Promise<NextResponse> {
  return NextResponse.json({
    name: 'Get Connect Account',
    version: '1.0',
    description: 'Get Connect account details and sync status from Stripe',
    method: 'GET',
    authentication: 'Clerk',
    authorization: 'Account owner or admin',
    path_parameters: {
      accountId: 'string - Database account ID (UUID)',
    },
    response: {
      success: 'boolean',
      account: {
        id: 'string - Database account ID',
        stripe_account_id: 'string - Stripe account ID',
        account_type: 'string - standard | express | custom',
        business_type: 'string | null - individual | company',
        country: 'string | null - ISO country code',
        default_currency: 'string - Currency code',
        email: 'string | null - Business email',
        business_name: 'string | null - Business name',
        capabilities: 'object - Account capabilities',
        requirements: 'object - Outstanding requirements',
        charges_enabled: 'boolean - Can accept payments',
        payouts_enabled: 'boolean - Can receive payouts',
        details_submitted: 'boolean - Onboarding details submitted',
        onboarding_status: 'string - pending | in_progress | completed | restricted',
        is_ready: 'boolean - Fully operational',
        created_at: 'string - ISO timestamp',
        updated_at: 'string - ISO timestamp',
      },
      message: 'string',
    },
    rate_limit: '5 requests per 15 minutes per user',
    side_effects: ['Syncs account status from Stripe', 'Updates database cache'],
    security: {
      requires_authentication: true,
      requires_ownership_or_admin: true,
    },
  });
}
