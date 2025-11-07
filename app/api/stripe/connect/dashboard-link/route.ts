/**
 * POST /api/stripe/connect/dashboard-link
 *
 * Generate Express Dashboard link for Express accounts
 *
 * Flow:
 * 1. Authenticate with Clerk
 * 2. Rate limiting
 * 3. Validate request (Zod)
 * 4. Verify account ownership
 * 5. Validate account type (Express only)
 * 6. Generate dashboard link
 * 7. Audit logging
 *
 * @see https://stripe.com/docs/connect/express-dashboard
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { CreateDashboardLinkSchema } from '@/lib/validations/stripe-connect';
import {
  validateAccountOwnership,
  getConnectAccountFromDb,
  createDashboardLinkForAccount,
} from '@/lib/stripe/services/connect-accounts.service';
import { checkRateLimit, moderateBillingRateLimit } from '@/lib/rate-limit';
import { createErrorResponse, logError } from '@/lib/utils/error-handling';
import { AuditLoggerService } from '@/lib/enterprise/audit-logger.service';

/**
 * POST: Generate dashboard link
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
            message: 'Please sign in to access dashboard',
          },
        },
        { status: 401 }
      );
    }

    // Step 2: Rate limiting
    const rateLimitCheck = await checkRateLimit(
      `dashboard-link:${userId}`,
      moderateBillingRateLimit
    );

    if (!rateLimitCheck.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many dashboard link requests. Please try again later.',
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
    const validated = CreateDashboardLinkSchema.parse(body);

    accountId = validated.account_id;

    console.log('[API] Creating dashboard link:', {
      user_id: userId,
      account_id: accountId,
    });

    // Step 4: Verify account ownership
    const isOwner = await validateAccountOwnership(accountId, userId);
    if (!isOwner) {
      await AuditLoggerService.logSecurityEvent(
        'unauthorized_dashboard_access',
        {
          account_id: accountId,
          user_id: userId,
        },
        request
      );

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to access this dashboard',
          },
        },
        { status: 403 }
      );
    }

    // Step 5: Get account and validate type
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

    // Only Express accounts can use dashboard links
    if (account.account_type !== 'express') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_ACCOUNT_TYPE',
            message: 'Dashboard links are only available for Express accounts',
            details: {
              account_type: account.account_type,
              supported_types: ['express'],
            },
          },
        },
        { status: 400 }
      );
    }

    // Check if account is ready
    if (!account.charges_enabled || !account.payouts_enabled) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ACCOUNT_NOT_READY',
            message:
              'Account must complete onboarding before accessing dashboard',
            details: {
              charges_enabled: account.charges_enabled,
              payouts_enabled: account.payouts_enabled,
              onboarding_status: account.onboarding_status,
            },
          },
        },
        { status: 400 }
      );
    }

    // Step 6: Generate dashboard link
    const dashboardUrl = await createDashboardLinkForAccount(accountId);

    // Login links expire in 60 seconds
    const expiresAt = new Date(Date.now() + 60 * 1000);

    console.log('[API] Dashboard link created:', {
      account_id: accountId,
      user_id: userId,
      expires_at: expiresAt,
    });

    // Step 7: Audit logging
    await AuditLoggerService.log({
      action: 'dashboard_link_created',
      resource_type: 'stripe_connect_account',
      resource_id: accountId,
      clerk_user_id: userId,
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] ||
                   request.headers.get('x-real-ip') || undefined,
      user_agent: request.headers.get('user-agent') || undefined,
      metadata: {
        stripe_account_id: account.stripe_account_id,
        account_type: account.account_type,
      },
      severity: 'low',
      risk_score: 10
    });

    // Step 8: Return success response
    return NextResponse.json(
      {
        success: true,
        url: dashboardUrl,
        created: Date.now(),
        expires_at: expiresAt.getTime(),
        message:
          'Dashboard link created successfully. Redirect immediately - link expires in 60 seconds.',
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    logError('CREATE_DASHBOARD_LINK', error, { userId, accountId });
    return createErrorResponse(error);
  }
}

/**
 * GET: Documentation and health check
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    name: 'Create Dashboard Link',
    version: '1.0',
    description: 'Generate Express Dashboard link for Express accounts',
    method: 'POST',
    authentication: 'Clerk',
    authorization: 'Account owner only',
    request_body: {
      account_id: 'string - Database account ID (UUID) (required)',
    },
    response: {
      success: 'boolean',
      url: 'string - Dashboard URL to redirect user to',
      created: 'number - Unix timestamp',
      expires_at: 'number - Unix timestamp (60 seconds from creation)',
      message: 'string',
    },
    rate_limit: '5 requests per 15 minutes per user',
    expiration: '60 seconds - Must redirect immediately',
    limitations: {
      account_type: 'Express accounts only',
      standard_accounts: 'Use Stripe Dashboard directly (no login links)',
      custom_accounts: 'Build custom dashboard',
    },
    requirements: [
      'Account must be Express type',
      'Account must have completed onboarding',
      'charges_enabled must be true',
      'payouts_enabled must be true',
    ],
    security: {
      requires_authentication: true,
      requires_account_ownership: true,
      logs_unauthorized_attempts: true,
    },
    usage: [
      '1. Call this endpoint to get dashboard URL',
      '2. Immediately redirect user to the URL',
      '3. Link expires in 60 seconds',
      '4. User accesses Stripe Express Dashboard',
      '5. Can manage payouts, view transactions, etc.',
    ],
    notes: [
      'Link expires very quickly (60 seconds)',
      'Generate new link for each access attempt',
      'Do not cache or store dashboard URLs',
      'Only for Express accounts',
    ],
  });
}
