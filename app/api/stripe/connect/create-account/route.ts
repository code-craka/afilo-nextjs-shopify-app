/**
 * POST /api/stripe/connect/create-account
 *
 * Create a new Stripe Connect account for marketplace vendors
 *
 * Flow:
 * 1. Authenticate with Clerk
 * 2. Rate limiting
 * 3. Validate request (Zod)
 * 4. Create Stripe account
 * 5. Store in database
 * 6. Update user role to 'merchant'
 * 7. Audit logging
 * 8. Generate onboarding link
 *
 * @see https://stripe.com/docs/connect/accounts
 */

import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { CreateConnectAccountSchema } from '@/lib/validations/stripe-connect';
import {
  createAndStoreConnectAccount,
  createOnboardingLink,
} from '@/lib/stripe/services/connect-accounts.service';
import { checkRateLimit, moderateBillingRateLimit } from '@/lib/rate-limit';
import { createErrorResponse, logError, createError } from '@/lib/utils/error-handling';
import { AuditLoggerService } from '@/lib/enterprise/audit-logger.service';
import { prisma } from '@/lib/prisma';
import { DEFAULT_RETURN_URL, DEFAULT_REFRESH_URL } from '@/lib/stripe/connect-server';

/**
 * POST: Create Connect account
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
            message: 'Please sign in to create a Connect account',
          },
        },
        { status: 401 }
      );
    }

    // Step 2: Rate limiting
    const rateLimitCheck = await checkRateLimit(
      `create-connect-account:${userId}`,
      moderateBillingRateLimit
    );

    if (!rateLimitCheck.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many account creation attempts. Please try again later.',
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

    // Step 3: Get user details
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        },
        { status: 404 }
      );
    }

    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'EMAIL_REQUIRED',
            message: 'User must have a verified email address',
          },
        },
        { status: 400 }
      );
    }

    // Step 4: Validate request body
    const body = await request.json();
    const validated = CreateConnectAccountSchema.parse(body);

    console.log('[API] Creating Connect account:', {
      user_id: userId,
      account_type: validated.account_type,
      business_type: validated.business_type,
      country: validated.country,
    });

    // Step 5: Check if user already has a Connect account
    const existingAccount = await prisma.stripe_connect_accounts.findFirst({
      where: { clerk_user_id: userId },
    });

    if (existingAccount) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ACCOUNT_EXISTS',
            message: 'You already have a Connect account',
            details: {
              account_id: existingAccount.id,
              stripe_account_id: existingAccount.stripe_account_id,
            },
          },
        },
        { status: 409 }
      );
    }

    // Step 6: Create Connect account and store in database
    const account = await createAndStoreConnectAccount(userId, {
      ...validated,
      email,
    });

    accountId = account.id;

    console.log('[API] Connect account created:', {
      account_id: account.id,
      stripe_account_id: account.stripe_account_id,
      user_id: userId,
    });

    // Step 7: Update user role to 'merchant'
    try {
      await prisma.user_profiles.updateMany({
        where: { clerk_user_id: userId },
        data: { role: 'merchant' },
      });
      console.log('[API] User role updated to merchant:', userId);
    } catch (roleError) {
      console.warn('[API] Failed to update user role:', roleError);
      // Don't fail the request if role update fails
    }

    // Step 8: Audit logging
    await AuditLoggerService.log({
      action: 'connect_account_created',
      resource_type: 'stripe_connect_account',
      resource_id: account.id,
      clerk_user_id: userId,
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] ||
                   request.headers.get('x-real-ip') || undefined,
      user_agent: request.headers.get('user-agent') || undefined,
      metadata: {
        stripe_account_id: account.stripe_account_id,
        account_type: account.account_type,
        business_type: account.business_type,
        country: account.country,
      },
      severity: 'low',
      risk_score: 10
    });

    // Step 9: Generate onboarding link
    let onboardingUrl: string | undefined;
    let onboardingExpiresAt: Date | undefined;

    try {
      onboardingUrl = await createOnboardingLink(account.id, {
        account_id: account.id,
        return_url: DEFAULT_RETURN_URL,
        refresh_url: DEFAULT_REFRESH_URL,
      });
      // Account links expire in 30 minutes
      onboardingExpiresAt = new Date(Date.now() + 30 * 60 * 1000);

      console.log('[API] Onboarding link created:', {
        account_id: account.id,
        expires_at: onboardingExpiresAt,
      });
    } catch (onboardingError) {
      console.warn('[API] Failed to create onboarding link:', onboardingError);
      // Don't fail the request, user can generate link later
    }

    // Step 10: Return success response
    return NextResponse.json(
      {
        success: true,
        account: {
          id: account.id,
          stripe_account_id: account.stripe_account_id,
          account_type: account.account_type,
          onboarding_status: account.onboarding_status,
          created_at: account.created_at.toISOString(),
        },
        onboarding: onboardingUrl
          ? {
              url: onboardingUrl,
              expires_at: onboardingExpiresAt!.toISOString(),
            }
          : undefined,
        message: 'Connect account created successfully. Complete onboarding to start receiving payments.',
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    logError('CREATE_CONNECT_ACCOUNT', error, { userId, accountId });
    return createErrorResponse(error);
  }
}

/**
 * GET: Documentation and health check
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    name: 'Create Connect Account',
    version: '1.0',
    description: 'Create a new Stripe Connect account for marketplace vendors',
    method: 'POST',
    authentication: 'Clerk',
    request_body: {
      account_type: 'enum - standard | express | custom (required)',
      business_type: 'enum - individual | company (optional)',
      country: 'string - ISO 3166-1 alpha-2 country code (optional, defaults to US)',
      email: 'string - Business email (optional, uses Clerk email if not provided)',
      business_name: 'string - Business name (optional)',
      metadata: 'object - Additional metadata (optional)',
    },
    response: {
      success: 'boolean',
      account: {
        id: 'string - Database account ID (UUID)',
        stripe_account_id: 'string - Stripe account ID',
        account_type: 'string - Account type',
        onboarding_status: 'string - Onboarding status',
        created_at: 'string - ISO timestamp',
      },
      onboarding: {
        url: 'string - Onboarding URL (30 minutes expiration)',
        expires_at: 'string - ISO timestamp',
      },
      message: 'string',
    },
    rate_limit: '5 requests per 15 minutes per user',
    side_effects: [
      'Creates Stripe Connect account',
      'Stores account in database',
      'Updates user role to "merchant"',
      'Generates onboarding link',
      'Creates audit log entry',
    ],
    next_steps: [
      '1. Redirect user to onboarding.url',
      '2. User completes Stripe onboarding',
      '3. Stripe redirects to return_url',
      '4. Call GET /api/stripe/connect/account/[id] to check status',
    ],
  });
}
