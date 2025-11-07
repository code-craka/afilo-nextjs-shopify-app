/**
 * POST /api/stripe/connect/transfer
 *
 * Create a transfer to a Connected account (Admin only)
 *
 * Flow:
 * 1. Authenticate with Clerk
 * 2. Verify admin role
 * 3. Rate limiting
 * 4. Validate request (Zod)
 * 5. Validate destination account
 * 6. Create transfer with Stripe
 * 7. Store in database
 * 8. Audit logging
 *
 * @see https://stripe.com/docs/connect/charges-transfers
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { CreateTransferSchema } from '@/lib/validations/stripe-connect';
import { createAndStoreTransfer } from '@/lib/stripe/services/connect-transfers.service';
import { checkRateLimit, moderateBillingRateLimit, transferRateLimit } from '@/lib/rate-limit';
import { createErrorResponse, logError, createError } from '@/lib/utils/error-handling';
import { AuditLoggerService } from '@/lib/enterprise/audit-logger.service';
import { prisma } from '@/lib/prisma';

/**
 * POST: Create transfer
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  let userId: string | null = null;
  let transferId: string | undefined = undefined;

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
            message: 'Please sign in to create transfers',
          },
        },
        { status: 401 }
      );
    }

    // Step 2: Verify admin role
    const userProfile = await prisma.user_profiles.findFirst({
      where: { clerk_user_id: userId },
      select: { role: true },
    });

    if (userProfile?.role !== 'admin') {
      await AuditLoggerService.logSecurityEvent(
        'unauthorized_transfer_attempt',
        {
          user_id: userId,
          user_role: userProfile?.role || 'unknown',
        },
        request
      );

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Only administrators can create transfers',
          },
        },
        { status: 403 }
      );
    }

    // Step 3: Rate limiting (stricter for financial operations)
    const rateLimitCheck = await checkRateLimit(
      `create-transfer:${userId}`,
      transferRateLimit
    );

    if (!rateLimitCheck.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many transfer requests. Please try again later.',
          },
        },
        {
          status: 429,
          headers: rateLimitCheck.headers,
        }
      );
    }

    // Step 4: Validate request body
    const body = await request.json();
    const validated = CreateTransferSchema.parse(body);

    console.log('[API] Creating transfer:', {
      user_id: userId,
      destination_account_id: validated.destination_account_id,
      amount: validated.amount,
      currency: validated.currency,
    });

    // Step 5: Create transfer and store in database
    const transfer = await createAndStoreTransfer(validated);

    transferId = transfer.id;

    console.log('[API] Transfer created:', {
      transfer_id: transfer.id,
      stripe_transfer_id: transfer.stripe_transfer_id,
      amount: transfer.amount,
      destination: transfer.destination_account_id,
    });

    // Step 6: Audit logging
    await AuditLoggerService.log({
      action: 'transfer_created',
      resource_type: 'marketplace_transfer',
      resource_id: transfer.id,
      clerk_user_id: userId,
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] ||
                   request.headers.get('x-real-ip') || undefined,
      user_agent: request.headers.get('user-agent') || undefined,
      metadata: {
        stripe_transfer_id: transfer.stripe_transfer_id,
        destination_account_id: validated.destination_account_id,
        amount: validated.amount,
        currency: validated.currency,
        application_fee_amount: validated.application_fee_amount,
        source_transaction: validated.source_transaction,
      },
      severity: 'medium',
      risk_score: 30
    });

    // Step 7: Log security event for financial transaction
    await AuditLoggerService.logSecurityEvent(
      'financial_transfer_created',
      {
        transfer_id: transfer.id,
        stripe_transfer_id: transfer.stripe_transfer_id,
        amount: transfer.amount,
        currency: transfer.currency,
        admin_user_id: userId,
      },
      request
    );

    // Step 8: Return success response
    return NextResponse.json(
      {
        success: true,
        transfer: {
          id: transfer.id,
          stripe_transfer_id: transfer.stripe_transfer_id,
          amount: Number(transfer.amount),
          currency: transfer.currency,
          status: transfer.status,
          application_fee_amount: transfer.application_fee_amount
            ? Number(transfer.application_fee_amount)
            : null,
          created_at: transfer.created_at.toISOString(),
        },
        message: 'Transfer created successfully',
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    logError('CREATE_TRANSFER', error, { userId, transferId });
    return createErrorResponse(error);
  }
}

/**
 * GET: Documentation and health check
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    name: 'Create Transfer',
    version: '1.0',
    description: 'Create a transfer to a Connected account',
    method: 'POST',
    authentication: 'Clerk',
    authorization: 'Admin only',
    request_body: {
      destination_account_id: 'string - Database account ID (UUID) (required)',
      amount: 'number - Amount in dollars (required, max $999,999.99)',
      currency: 'string - Currency code (optional, defaults to USD)',
      source_transaction: 'string - Payment intent or charge ID (optional)',
      application_fee_amount: 'number - Platform fee in dollars (optional)',
      transfer_group: 'string - Group related transfers (optional)',
      description: 'string - Transfer description (optional)',
      metadata: 'object - Additional metadata (optional)',
    },
    response: {
      success: 'boolean',
      transfer: {
        id: 'string - Database transfer ID (UUID)',
        stripe_transfer_id: 'string - Stripe transfer ID',
        amount: 'number - Transfer amount',
        currency: 'string - Currency code',
        status: 'string - pending | paid | failed | canceled',
        application_fee_amount: 'number | null - Platform fee',
        created_at: 'string - ISO timestamp',
      },
      message: 'string',
    },
    rate_limit: '10 transfers per minute (admin only)',
    side_effects: [
      'Creates Stripe transfer',
      'Stores transfer in database',
      'Creates audit log entry',
      'Creates security log entry',
    ],
    security: {
      requires_authentication: true,
      requires_admin_role: true,
      logs_all_attempts: true,
      high_security_level: true,
    },
    validation: [
      'Amount must be positive and <= $999,999.99',
      'Destination account must be ready (charges & payouts enabled)',
      'Application fee must be less than transfer amount',
      'Currency must be valid ISO code',
    ],
    notes: [
      'Only administrators can create transfers',
      'Transfers are asynchronous and may take time to complete',
      'Monitor transfer status via webhook or GET /api/stripe/connect/transfers',
      'Application fees are automatically collected by platform',
    ],
  });
}
