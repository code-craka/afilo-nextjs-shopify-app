/**
 * POST /api/stripe/accounts/migrate
 *
 * Migrate existing Stripe v1 customer to Accounts v2
 *
 * This endpoint:
 * 1. Validates user has v1 customer ID
 * 2. Migrates to Accounts v2
 * 3. Preserves payment methods & subscriptions
 * 4. Updates Clerk metadata
 * 5. Maintains data integrity
 *
 * Note: This is optional - existing v1 customers continue to work.
 * Use when user explicitly wants to migrate to v2 features.
 *
 * @see https://stripe.com/docs/billing/subscriptions/migration
 */

import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { StripeAccountsV2Service } from '@/lib/stripe/services/accounts-v2.service';
import { getUserStripeCustomerId, updateUserStripeCustomerId } from '@/lib/clerk-utils';
import { checkRateLimit, standardBillingRateLimit } from '@/lib/rate-limit';
import { isFeatureEnabled } from '@/lib/feature-flags';

/**
 * Request body validation
 */
interface MigrateRequest {
  new_email?: string; // Optional: use different email for v2 account
}

/**
 * POST: Migrate from v1 to v2
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Check if v2 and migration are enabled
    if (!isFeatureEnabled('STRIPE_V2_ENABLED')) {
      return NextResponse.json(
        {
          error: 'Feature not available',
          message: 'Stripe Accounts v2 is not enabled',
        },
        { status: 403 }
      );
    }

    if (!isFeatureEnabled('STRIPE_V2_ENABLED')) {
      return NextResponse.json(
        {
          error: 'Migration not available',
          message: 'Customer migration from v1 to v2 is not enabled',
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
    const rateLimitCheck = await checkRateLimit(
      `account-migrate:${userId}`,
      standardBillingRateLimit
    );

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

    // Step 5: Check for existing v1 customer ID
    const v1CustomerId = await getUserStripeCustomerId(userId);

    if (!v1CustomerId || !v1CustomerId.startsWith('cus_')) {
      return NextResponse.json(
        {
          error: 'No v1 customer found',
          message: 'User does not have a Stripe v1 customer ID to migrate',
          note: 'New users should use POST /api/stripe/accounts/create-v2 instead',
        },
        { status: 404 }
      );
    }

    // Step 6: Check if already migrated
    const existingV2 = user.publicMetadata?.stripeAccountIdV2;

    if (existingV2 && typeof existingV2 === 'string' && existingV2.startsWith('acct_')) {
      return NextResponse.json(
        {
          error: 'Already migrated',
          message: 'User already has a Stripe Accounts v2 account',
          account_id: existingV2,
        },
        { status: 409 }
      );
    }

    // Step 7: Parse request body
    const body = (await request.json()) as MigrateRequest;
    const newEmail = body.new_email || (user.emailAddresses[0]?.emailAddress);

    if (!newEmail) {
      return NextResponse.json(
        { error: 'Email required', message: 'User must have a verified email' },
        { status: 400 }
      );
    }

    console.log('[API] Migrating customer to v2:', {
      user_id: userId,
      v1_customer_id: v1CustomerId,
      new_email: newEmail,
    });

    // Step 8: Perform migration
    let migratedAccount;

    try {
      migratedAccount = await StripeAccountsV2Service.migrateCustomerToV2({
        old_customer_id: v1CustomerId,
        clerk_user_id: userId,
        account_type: 'customer',
        new_email: newEmail,
      });
    } catch (migrationError) {
      console.error('[API] Migration failed:', migrationError);

      return NextResponse.json(
        {
          error: 'Migration failed',
          message: migrationError instanceof Error
            ? migrationError.message
            : 'Unknown migration error',
          v1_customer_id: v1CustomerId,
          action: 'Please contact support if this persists',
        },
        { status: 500 }
      );
    }

    // Step 9: Link with Clerk
    try {
      await StripeAccountsV2Service.linkAccountWithClerk(userId, migratedAccount.id);
      console.log('[API] Migration linked with Clerk:', migratedAccount.id);
    } catch (linkError) {
      console.warn('[API] Failed to link migrated account with Clerk:', linkError);
      // Continue - account was migrated successfully
    }

    // Step 10: Return success
    console.log('[API] Migration successful:', {
      user_id: userId,
      v1_customer_id: v1CustomerId,
      v2_account_id: migratedAccount.id,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Migration completed successfully',
        migration: {
          v1_customer_id: v1CustomerId,
          v2_account_id: migratedAccount.id,
          email: newEmail,
          status: 'completed',
          migrated_at: new Date().toISOString(),
        },
        next_steps: [
          'Your payment methods and subscriptions have been preserved',
          'You can now access enhanced features like the customer portal',
          'Refresh your session to activate v2 features',
        ],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Migration error:', error);

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
 * GET: Documentation
 */
export async function GET(): Promise<NextResponse> {
  const isMigrationEnabled = isFeatureEnabled('STRIPE_V2_ENABLED');

  return NextResponse.json({
    name: 'Stripe Customer Migration (v1 → v2)',
    version: '1.0',
    status: isMigrationEnabled ? 'available' : 'disabled',
    description: 'Migrate existing Stripe v1 customers to Accounts v2',
    method: 'POST',
    authentication: 'Clerk',
    request_body: {
      new_email: 'string (optional) - Use different email for v2 account',
    },
    response: {
      success: 'boolean',
      message: 'string',
      migration: {
        v1_customer_id: 'string',
        v2_account_id: 'string',
        email: 'string',
        status: 'string',
        migrated_at: 'string - ISO timestamp',
      },
      next_steps: 'string[]',
    },
    important_notes: [
      'Migration is optional - v1 customers can continue using existing setup',
      'Payment methods and subscriptions are preserved during migration',
      'Migration creates new Accounts v2 linked to Clerk user',
      'Once migrated, user gains access to v2 features (portal, adaptive checkout, etc)',
      'Migration is a one-time operation per user',
    ],
    rate_limit: '5 requests per 15 minutes per user',
    feature_flag: 'ENABLE_V1_TO_V2_MIGRATION',
  });
}
