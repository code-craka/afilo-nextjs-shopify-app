/**
 * GET /api/stripe/connect/transfers
 *
 * List transfers with pagination and filters
 *
 * Flow:
 * 1. Authenticate with Clerk
 * 2. Rate limiting
 * 3. Parse query parameters
 * 4. Check permissions (admin or account owner)
 * 5. Fetch transfers with pagination
 * 6. Return results
 *
 * @see https://stripe.com/docs/connect/charges-transfers
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import {
  listTransfersForAccount,
  listAllTransfers,
} from '@/lib/stripe/services/connect-transfers.service';
import { validateAccountOwnership } from '@/lib/stripe/services/connect-accounts.service';
import { checkRateLimit, moderateBillingRateLimit } from '@/lib/rate-limit';
import { createErrorResponse, logError } from '@/lib/utils/error-handling';
import { prisma } from '@/lib/prisma';
import type { TransferStatus } from '@/types/stripe-connect';

/**
 * GET: List transfers
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  let userId: string | null = null;

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
            message: 'Please sign in to view transfers',
          },
        },
        { status: 401 }
      );
    }

    // Step 2: Rate limiting
    const rateLimitCheck = await checkRateLimit(
      `list-transfers:${userId}`,
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

    // Step 3: Parse query parameters
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('account_id');
    const status = searchParams.get('status') as TransferStatus | null;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const cursor = searchParams.get('cursor');

    // Validate limit
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_LIMIT',
            message: 'Limit must be between 1 and 100',
          },
        },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (status && !['pending', 'paid', 'failed', 'canceled'].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: 'Status must be: pending, paid, failed, or canceled',
          },
        },
        { status: 400 }
      );
    }

    console.log('[API] Listing transfers:', {
      user_id: userId,
      account_id: accountId,
      status,
      limit,
      cursor,
    });

    // Step 4: Check permissions
    const userProfile = await prisma.user_profiles.findFirst({
      where: { clerk_user_id: userId },
      select: { role: true },
    });

    const isAdmin = userProfile?.role === 'admin';

    let result;

    if (accountId) {
      // Listing transfers for specific account
      // Verify ownership or admin
      const isOwner = await validateAccountOwnership(accountId, userId);

      if (!isAdmin && !isOwner) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'You do not have permission to view these transfers',
            },
          },
          { status: 403 }
        );
      }

      // Step 5: Fetch transfers for account
      result = await listTransfersForAccount(accountId, {
        status: status || undefined,
        limit,
        cursor: cursor || undefined,
      });
    } else {
      // Listing all transfers (admin only)
      if (!isAdmin) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Only administrators can view all transfers',
            },
          },
          { status: 403 }
        );
      }

      // Step 5: Fetch all transfers
      result = await listAllTransfers({
        status: status || undefined,
        limit,
        cursor: cursor || undefined,
      });
    }

    // Step 6: Format response
    const transfers = result.transfers.map((transfer) => ({
      id: transfer.id,
      stripe_transfer_id: transfer.stripe_transfer_id,
      destination_account_id: transfer.destination_account_id,
      amount: Number(transfer.amount),
      currency: transfer.currency,
      application_fee_amount: transfer.application_fee_amount
        ? Number(transfer.application_fee_amount)
        : null,
      status: transfer.status,
      description: transfer.description,
      transfer_group: transfer.transfer_group,
      source_transaction: transfer.source_transaction,
      created_at: transfer.created_at.toISOString(),
      destination_account: (transfer as any).destination_account
        ? {
            business_name: (transfer as any).destination_account.business_name,
            email: (transfer as any).destination_account.email,
          }
        : undefined,
    }));

    console.log('[API] Transfers retrieved:', {
      count: transfers.length,
      has_more: result.has_more,
      user_id: userId,
    });

    // Step 7: Return success response
    return NextResponse.json(
      {
        success: true,
        transfers,
        pagination: {
          has_more: result.has_more,
          next_cursor: result.next_cursor,
          limit,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    logError('LIST_TRANSFERS', error, { userId });
    return createErrorResponse(error);
  }
}

/**
 * OPTIONS: Documentation
 */
export async function OPTIONS(): Promise<NextResponse> {
  return NextResponse.json({
    name: 'List Transfers',
    version: '1.0',
    description: 'List transfers with pagination and filters',
    method: 'GET',
    authentication: 'Clerk',
    authorization: 'Account owner or admin',
    query_parameters: {
      account_id: 'string - Filter by account ID (UUID) (optional, admin can omit)',
      status: 'string - Filter by status: pending | paid | failed | canceled (optional)',
      limit: 'number - Results per page (1-100, default: 20)',
      cursor: 'string - Pagination cursor from previous response (optional)',
    },
    response: {
      success: 'boolean',
      transfers: [
        {
          id: 'string - Database transfer ID',
          stripe_transfer_id: 'string - Stripe transfer ID',
          destination_account_id: 'string - Destination account ID',
          amount: 'number - Transfer amount',
          currency: 'string - Currency code',
          application_fee_amount: 'number | null - Platform fee',
          status: 'string - Transfer status',
          description: 'string | null - Transfer description',
          transfer_group: 'string | null - Transfer group',
          source_transaction: 'string | null - Source payment',
          created_at: 'string - ISO timestamp',
          destination_account: {
            business_name: 'string | null',
            email: 'string | null',
          },
        },
      ],
      pagination: {
        has_more: 'boolean - More results available',
        next_cursor: 'string | null - Cursor for next page',
        limit: 'number - Current page size',
      },
    },
    rate_limit: '5 requests per 15 minutes per user',
    pagination: {
      type: 'cursor-based',
      max_limit: 100,
      default_limit: 20,
    },
    security: {
      requires_authentication: true,
      account_owner_sees_own_transfers: true,
      admin_sees_all_transfers: true,
    },
    examples: [
      'GET /api/stripe/connect/transfers?account_id=abc-123&limit=20',
      'GET /api/stripe/connect/transfers?status=paid&limit=50',
      'GET /api/stripe/connect/transfers?cursor=xyz-789&limit=20',
      'GET /api/stripe/connect/transfers (admin only - all transfers)',
    ],
  });
}
