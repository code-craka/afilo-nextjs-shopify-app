/**
 * POST /api/stripe/connect/account/[accountId]/update
 *
 * Update Connect account information
 *
 * Flow:
 * 1. Authenticate with Clerk
 * 2. Rate limiting
 * 3. Validate request (Zod)
 * 4. Verify account ownership
 * 5. Update Stripe account
 * 6. Update database
 * 7. Audit logging
 *
 * @see https://stripe.com/docs/connect/accounts
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { UpdateConnectAccountSchema } from '@/lib/validations/stripe-connect';
import {
  validateAccountOwnership,
  getConnectAccountFromDb,
  updateConnectAccountInDb,
} from '@/lib/stripe/services/connect-accounts.service';
import { updateConnectAccount } from '@/lib/stripe/connect-server';
import { checkRateLimit, moderateBillingRateLimit } from '@/lib/rate-limit';
import { createErrorResponse, logError } from '@/lib/utils/error-handling';
import { AuditLoggerService } from '@/lib/enterprise/audit-logger.service';

/**
 * POST: Update account
 */
export async function POST(
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
            message: 'Please sign in to update account',
          },
        },
        { status: 401 }
      );
    }

    // Step 2: Rate limiting
    const rateLimitCheck = await checkRateLimit(
      `update-account:${userId}`,
      moderateBillingRateLimit
    );

    if (!rateLimitCheck.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many update requests. Please try again later.',
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
    const validated = UpdateConnectAccountSchema.parse(body);

    console.log('[API] Updating Connect account:', {
      user_id: userId,
      account_id: accountId,
      updates: Object.keys(validated),
    });

    // Step 4: Verify account ownership
    const isOwner = await validateAccountOwnership(accountId, userId);
    if (!isOwner) {
      await AuditLoggerService.logSecurityEvent(
        'unauthorized_account_modification',
        {
          account_id: accountId,
          user_id: userId,
          attempted_updates: validated,
        },
        request
      );

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to update this account',
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

    // Step 6: Update Stripe account
    const updateParams: any = {};

    if (validated.business_name) {
      updateParams.business_profile = {
        name: validated.business_name,
      };
    }

    if (validated.email) {
      updateParams.email = validated.email;
    }

    if (validated.metadata) {
      updateParams.metadata = {
        ...validated.metadata,
        updated_at: new Date().toISOString(),
        updated_by: userId,
      };
    }

    let stripeAccount;
    if (Object.keys(updateParams).length > 0) {
      try {
        stripeAccount = await updateConnectAccount(account.stripe_account_id, updateParams);
        console.log('[API] Stripe account updated:', {
          account_id: accountId,
          stripe_account_id: account.stripe_account_id,
        });
      } catch (stripeError) {
        console.error('[API] Failed to update Stripe account:', stripeError);
        throw stripeError;
      }
    }

    // Step 7: Update database
    const dbUpdates: any = {};

    if (validated.business_name) {
      dbUpdates.business_name = validated.business_name;
    }

    if (validated.email) {
      dbUpdates.email = validated.email;
    }

    if (validated.metadata) {
      dbUpdates.metadata = validated.metadata;
    }

    // Sync capabilities and requirements from Stripe if available
    if (stripeAccount) {
      dbUpdates.capabilities = (stripeAccount.capabilities || account.capabilities) as Prisma.JsonValue;
      dbUpdates.requirements = (stripeAccount.requirements || account.requirements) as Prisma.JsonValue;
      dbUpdates.charges_enabled = stripeAccount.charges_enabled ?? account.charges_enabled;
      dbUpdates.payouts_enabled = stripeAccount.payouts_enabled ?? account.payouts_enabled;
      dbUpdates.details_submitted = stripeAccount.details_submitted ?? account.details_submitted;
    }

    const updatedAccount = await updateConnectAccountInDb(accountId, dbUpdates);

    console.log('[API] Database account updated:', {
      account_id: accountId,
      updated_fields: Object.keys(dbUpdates),
    });

    // Step 8: Audit logging
    await AuditLoggerService.log({
      action: 'connect_account_updated',
      resource_type: 'stripe_connect_account',
      resource_id: accountId,
      clerk_user_id: userId,
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] ||
                   request.headers.get('x-real-ip') || undefined,
      user_agent: request.headers.get('user-agent') || undefined,
      metadata: {
        stripe_account_id: account.stripe_account_id,
        updated_fields: Object.keys(validated),
        updates: validated,
      },
      severity: 'low',
      risk_score: 10
    });

    // Step 9: Return success response
    return NextResponse.json(
      {
        success: true,
        account: {
          id: updatedAccount.id,
          stripe_account_id: updatedAccount.stripe_account_id,
          business_name: updatedAccount.business_name,
          email: updatedAccount.email,
          charges_enabled: updatedAccount.charges_enabled,
          payouts_enabled: updatedAccount.payouts_enabled,
          updated_at: updatedAccount.updated_at.toISOString(),
        },
        message: 'Account updated successfully',
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    logError('UPDATE_CONNECT_ACCOUNT', error, { userId, accountId });
    return createErrorResponse(error);
  }
}

/**
 * OPTIONS: Documentation
 */
export async function OPTIONS(): Promise<NextResponse> {
  return NextResponse.json({
    name: 'Update Connect Account',
    version: '1.0',
    description: 'Update Connect account information',
    method: 'POST',
    authentication: 'Clerk',
    authorization: 'Account owner only',
    path_parameters: {
      accountId: 'string - Database account ID (UUID)',
    },
    request_body: {
      business_name: 'string - Business name (optional)',
      email: 'string - Business email (optional)',
      metadata: 'object - Additional metadata (optional)',
    },
    response: {
      success: 'boolean',
      account: {
        id: 'string - Database account ID',
        stripe_account_id: 'string - Stripe account ID',
        business_name: 'string | null - Business name',
        email: 'string | null - Business email',
        charges_enabled: 'boolean - Can accept payments',
        payouts_enabled: 'boolean - Can receive payouts',
        updated_at: 'string - ISO timestamp',
      },
      message: 'string',
    },
    rate_limit: '5 requests per 15 minutes per user',
    side_effects: [
      'Updates Stripe account',
      'Updates database record',
      'Creates audit log entry',
    ],
    security: {
      requires_authentication: true,
      requires_account_ownership: true,
      logs_unauthorized_attempts: true,
    },
    notes: [
      'Only account owner can update',
      'Admins cannot update accounts they do not own',
      'Some fields may require additional Stripe verification',
    ],
  });
}
