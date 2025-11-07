/**
 * POST /api/stripe/connect/onboard
 *
 * Generate an onboarding AccountLink for a Connect account
 *
 * Flow:
 * 1. Authenticate with Clerk
 * 2. Rate limiting
 * 3. Validate request (Zod)
 * 4. Verify account ownership
 * 5. Generate onboarding link
 * 6. Update database
 * 7. Audit logging
 *
 * @see https://stripe.com/docs/connect/account-links
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { CreateOnboardingLinkSchema } from '@/lib/validations/stripe-connect';
import {
  createOnboardingLink,
  validateAccountOwnership,
  getConnectAccountFromDb,
} from '@/lib/stripe/services/connect-accounts.service';
import { checkRateLimit, moderateBillingRateLimit } from '@/lib/rate-limit';
import { createErrorResponse, logError, createError } from '@/lib/utils/error-handling';
import { AuditLoggerService } from '@/lib/enterprise/audit-logger.service';

/**
 * POST: Generate onboarding link
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
            message: 'Please sign in to generate onboarding link',
          },
        },
        { status: 401 }
      );
    }

    // Step 2: Rate limiting
    const rateLimitCheck = await checkRateLimit(
      `onboarding-link:${userId}`,
      moderateBillingRateLimit
    );

    if (!rateLimitCheck.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many onboarding link requests. Please try again later.',
            details: {
              retryAfter: Math.ceil((rateLimitCheck.reset - Date.now()) / 1000),
            },
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
    const validated = CreateOnboardingLinkSchema.parse(body);

    accountId = validated.account_id;

    console.log('[API] Creating onboarding link:', {
      user_id: userId,
      account_id: accountId,
      return_url: validated.return_url,
    });

    // Step 4: Verify account ownership
    const isOwner = await validateAccountOwnership(accountId, userId);
    if (!isOwner) {
      await AuditLoggerService.logSecurityEvent(
        'unauthorized_account_access',
        {
          account_id: accountId,
          user_id: userId,
          action: 'onboarding_link_generation',
        },
        request
      );

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

    // Step 5: Check if account is already fully onboarded
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

    if (
      account.onboarding_status === 'completed' &&
      account.charges_enabled &&
      account.payouts_enabled
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ALREADY_ONBOARDED',
            message: 'Account onboarding is already complete',
            details: {
              charges_enabled: account.charges_enabled,
              payouts_enabled: account.payouts_enabled,
            },
          },
        },
        { status: 400 }
      );
    }

    // Step 6: Generate onboarding link
    const onboardingUrl = await createOnboardingLink(accountId, validated);

    // Calculate expiration (Account links expire in 30 minutes)
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    console.log('[API] Onboarding link created:', {
      account_id: accountId,
      user_id: userId,
      expires_at: expiresAt,
    });

    // Step 7: Audit logging
    await AuditLoggerService.log({
      action: 'onboarding_link_created',
      resource_type: 'stripe_connect_account',
      resource_id: accountId,
      clerk_user_id: userId,
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] ||
                   request.headers.get('x-real-ip') || undefined,
      user_agent: request.headers.get('user-agent') || undefined,
      metadata: {
        stripe_account_id: account.stripe_account_id,
        return_url: validated.return_url,
        refresh_url: validated.refresh_url,
      },
      severity: 'low',
      risk_score: 10
    });

    // Step 8: Return success response
    return NextResponse.json(
      {
        success: true,
        url: onboardingUrl,
        expires_at: expiresAt.toISOString(),
        created: Date.now(),
        message: 'Onboarding link created successfully. Link expires in 30 minutes.',
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    logError('CREATE_ONBOARDING_LINK', error, { userId, accountId });
    return createErrorResponse(error);
  }
}

/**
 * GET: Documentation and health check
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    name: 'Create Onboarding Link',
    version: '1.0',
    description: 'Generate an AccountLink for Connect account onboarding',
    method: 'POST',
    authentication: 'Clerk',
    request_body: {
      account_id: 'string - Database account ID (UUID) (required)',
      refresh_url: 'string - URL to redirect if link expires (optional)',
      return_url: 'string - URL to redirect after onboarding (optional)',
    },
    response: {
      success: 'boolean',
      url: 'string - Onboarding URL to redirect user to',
      expires_at: 'string - ISO timestamp (30 minutes from creation)',
      created: 'number - Unix timestamp',
      message: 'string',
    },
    rate_limit: '5 requests per 15 minutes per user',
    expiration: '30 minutes',
    security: {
      requires_authentication: true,
      requires_account_ownership: true,
      logs_access_attempts: true,
    },
    usage: [
      '1. Call this endpoint to get onboarding URL',
      '2. Redirect user to the returned URL',
      '3. User completes Stripe onboarding form',
      '4. Stripe redirects to return_url',
      '5. If link expires, Stripe redirects to refresh_url',
    ],
    notes: [
      'Link expires after 30 minutes',
      'Can generate new link if expired',
      'Account must not be fully onboarded',
      'Only account owner can generate link',
    ],
  });
}
