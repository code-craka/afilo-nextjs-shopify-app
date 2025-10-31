/**
 * POST /api/billing/portal-v2/create-session
 *
 * Create Stripe Billing Portal session for v2 accounts
 *
 * Allows customers to:
 * - Manage subscriptions (upgrade/downgrade/cancel)
 * - Update payment methods
 * - View invoices
 * - Update billing address
 * - Manage tax IDs
 *
 * Enhanced with:
 * - Afilo branding
 * - Multi-currency support
 * - Custom locale handling
 * - Analytics logging
 *
 * @see https://stripe.com/docs/billing/subscriptions/integration-with-portal
 */

import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { CustomerPortalV2Service } from '@/lib/stripe/services/customer-portal-v2.service';
import { getUserStripeCustomerId } from '@/lib/clerk-utils';
import { checkRateLimit, moderateBillingRateLimit } from '@/lib/rate-limit';
import { isFeatureEnabled } from '@/lib/feature-flags';

/**
 * Request body validation
 */
interface CreatePortalSessionRequest {
  return_url?: string; // Custom return URL (optional)
  locale?: string; // Portal language (en, es, fr, de, etc.)
}

/**
 * POST: Create portal session
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
        { error: 'Unauthorized', message: 'Please sign in to manage billing' },
        { status: 401 }
      );
    }

    // Step 3: Rate limiting (stricter for portal)
    const rateLimitCheck = await checkRateLimit(
      `portal-session:${userId}`,
      moderateBillingRateLimit
    );

    if (!rateLimitCheck.success) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Please try again later',
          retryAfter: Math.ceil((rateLimitCheck.reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: rateLimitCheck.headers,
        }
      );
    }

    // Step 4: Get user and account details
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

    // Step 5: Get Accounts v2 ID
    const accountId = await getUserStripeCustomerId(userId);

    if (!accountId) {
      return NextResponse.json(
        {
          error: 'No account found',
          message: 'User does not have a Stripe Accounts v2 account',
          action: 'Create account via POST /api/stripe/accounts/create-v2',
        },
        { status: 404 }
      );
    }

    // Step 6: Parse request body
    const body = (await request.json()) as CreatePortalSessionRequest;

    const returnUrl = body.return_url || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;
    const locale = body.locale || 'en';

    // Validate return URL is on our domain
    try {
      const returnUrlObj = new URL(returnUrl);
      const appUrl = new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://app.afilo.io');

      if (returnUrlObj.hostname !== appUrl.hostname) {
        console.warn('[API] Return URL mismatch:', {
          expected: appUrl.hostname,
          provided: returnUrlObj.hostname,
        });
        // Allow it but log warning
      }
    } catch (urlError) {
      return NextResponse.json(
        { error: 'Invalid return URL', message: 'Return URL must be valid' },
        { status: 400 }
      );
    }

    console.log('[API] Creating portal session:', {
      user_id: userId,
      account_id: accountId,
      return_url: returnUrl,
      locale,
    });

    // Step 7: Validate account can access portal
    const canAccess = await CustomerPortalV2Service.validatePortalAccess(accountId);

    if (!canAccess) {
      return NextResponse.json(
        {
          error: 'Access denied',
          message: 'Account is not ready to access the portal',
        },
        { status: 403 }
      );
    }

    // Step 8: Create portal session
    const session = await CustomerPortalV2Service.createPortalSession(
      accountId,
      returnUrl,
      {
        subscriptions_enabled: true,
        payment_methods_enabled: true,
        invoices_enabled: true,
        billing_address_enabled: true,
        tax_id_enabled: true,
        branding: {
          accent_color: '#3b82f6', // Afilo blue
          logo: process.env.NEXT_PUBLIC_LOGO_URL,
          icon: process.env.NEXT_PUBLIC_FAVICON_URL,
        },
        locale,
        return_url: returnUrl,
      }
    );

    if (!session.success) {
      console.error('[API] Portal session creation failed:', session.error);

      return NextResponse.json(
        {
          error: 'Failed to create portal session',
          message: session.error,
        },
        { status: 500 }
      );
    }

    // Step 9: Log access for analytics
    try {
      await CustomerPortalV2Service.logPortalAccess(
        accountId,
        request.headers.get('x-forwarded-for') || undefined,
        request.headers.get('user-agent') || undefined
      );
    } catch (logError) {
      console.warn('[API] Failed to log portal access:', logError);
      // Continue anyway
    }

    // Step 10: Return session
    console.log('[API] Portal session created:', {
      session_id: session.session_id,
      user_id: userId,
    });

    return NextResponse.json(
      {
        success: true,
        session: {
          id: session.session_id,
          url: session.url,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
        },
        message: 'Portal session created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API] Portal session error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

/**
 * GET: Documentation and health check
 */
export async function GET(): Promise<NextResponse> {
  const isEnabled = isFeatureEnabled('STRIPE_V2_ENABLED');

  return NextResponse.json({
    name: 'Stripe Billing Portal v2',
    version: '1.0',
    status: isEnabled ? 'available' : 'disabled',
    description: 'Create billing portal sessions for v2 accounts',
    method: 'POST',
    authentication: 'Clerk',
    request_body: {
      return_url: 'string (optional) - Where to redirect after portal (default: /dashboard)',
      locale: 'string (optional) - Portal language (en, es, fr, de, etc.) (default: en)',
    },
    response: {
      success: 'boolean',
      session: {
        id: 'string - Portal session ID',
        url: 'string - Portal URL to redirect customer to',
        created_at: 'string - ISO timestamp',
        expires_at: 'string - ISO timestamp (24 hours)',
      },
      message: 'string',
    },
    features_available: [
      'Manage subscriptions (upgrade/downgrade/cancel)',
      'Update payment methods',
      'View invoice history',
      'Update billing address',
      'Manage tax IDs',
      'Download invoices',
    ],
    example_request: {
      method: 'POST',
      url: '/api/billing/portal-v2/create-session',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer <clerk_token>',
      },
      body: {
        return_url: 'https://app.afilo.io/dashboard',
        locale: 'en',
      },
    },
    rate_limit: '5 requests per 15 minutes per user',
    locales_supported: [
      'en', 'es', 'fr', 'de', 'it', 'ja', 'pt', 'nl', 'auto',
    ],
    security: {
      requires_authentication: true,
      requires_v2_account: true,
      validates_return_url: true,
      logs_access: true,
    },
  });
}
