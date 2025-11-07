/**
 * Connect Transfers Service
 *
 * Business logic layer for marketplace transfers and payouts
 * Following patterns from existing services
 *
 * Responsibilities:
 * - Transfer creation and management
 * - Transfer validation and authorization
 * - Database synchronization
 * - Transfer history and reporting
 */

import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import {
  createTransfer,
  getTransfer,
  listTransfers,
  reverseTransfer,
} from '@/lib/stripe/connect-server';
import type {
  CreateTransferRequest,
  MarketplaceTransfer,
  TransferStatus,
} from '@/types/stripe-connect';

/**
 * Convert Prisma transfer object to MarketplaceTransfer type
 * Handles Decimal to number conversion for amount fields
 */
function toMarketplaceTransfer(dbTransfer: any): MarketplaceTransfer {
  return {
    ...dbTransfer,
    amount: dbTransfer.amount instanceof Decimal ? dbTransfer.amount.toNumber() : dbTransfer.amount,
    application_fee_amount: dbTransfer.application_fee_amount instanceof Decimal
      ? dbTransfer.application_fee_amount.toNumber()
      : dbTransfer.application_fee_amount,
  };
}
import { createError } from '@/lib/utils/error-handling';

/**
 * Create a transfer and store in database
 *
 * @param request - Transfer creation request
 * @returns Promise<MarketplaceTransfer>
 */
export async function createAndStoreTransfer(
  request: CreateTransferRequest
): Promise<MarketplaceTransfer> {
  // Get destination account
  const destinationAccount = await prisma.stripe_connect_accounts.findUnique({
    where: { id: request.destination_account_id },
  });

  if (!destinationAccount) {
    throw createError.notFound('Destination account not found');
  }

  // Validate account is ready to receive funds
  if (!destinationAccount.charges_enabled || !destinationAccount.payouts_enabled) {
    throw createError.validation(
      'Destination account is not ready to receive transfers. Onboarding must be completed.'
    );
  }

  // Create transfer with Stripe
  const stripeTransfer = await createTransfer({
    ...request,
    destination_account_id: destinationAccount.stripe_account_id,
  });

  // Store in database
  const dbTransfer = await prisma.marketplace_transfers.create({
    data: {
      stripe_transfer_id: stripeTransfer.id,
      destination_account_id: request.destination_account_id,
      stripe_destination_id: destinationAccount.stripe_account_id,
      source_transaction: request.source_transaction || null,
      amount: request.amount,
      currency: request.currency || 'USD',
      application_fee_amount: request.application_fee_amount || null,
      transfer_group: request.transfer_group || null,
      description: request.description || null,
      status: 'pending',
      metadata: request.metadata || {},
    },
  });

  return toMarketplaceTransfer(dbTransfer);
}

/**
 * Get transfer from database
 *
 * @param transferId - Database transfer ID (UUID)
 * @returns Promise<MarketplaceTransfer | null>
 */
export async function getTransferFromDb(
  transferId: string
): Promise<MarketplaceTransfer | null> {
  const transfer = await prisma.marketplace_transfers.findUnique({
    where: { id: transferId },
    include: {
      destination_account: {
        select: {
          id: true,
          stripe_account_id: true,
          business_name: true,
          email: true,
          clerk_user_id: true,
        },
      },
    },
  });

  return transfer as any;
}

/**
 * Get transfer by Stripe transfer ID
 *
 * @param stripeTransferId - Stripe transfer ID
 * @returns Promise<MarketplaceTransfer | null>
 */
export async function getTransferByStripeId(
  stripeTransferId: string
): Promise<MarketplaceTransfer | null> {
  const transfer = await prisma.marketplace_transfers.findUnique({
    where: { stripe_transfer_id: stripeTransferId },
  });

  return transfer ? toMarketplaceTransfer(transfer) : null;
}

/**
 * List transfers for an account with pagination
 *
 * @param accountId - Database account ID
 * @param options - Pagination and filter options
 * @returns Promise with transfers and pagination
 */
export async function listTransfersForAccount(
  accountId: string,
  options: {
    status?: TransferStatus;
    limit?: number;
    cursor?: string;
  } = {}
): Promise<{
  transfers: MarketplaceTransfer[];
  has_more: boolean;
  next_cursor: string | null;
}> {
  const limit = options.limit || 20;
  const take = limit + 1; // Fetch one extra to check if there are more

  // Build where clause
  const where: any = {
    destination_account_id: accountId,
  };

  if (options.status) {
    where.status = options.status;
  }

  if (options.cursor) {
    where.id = {
      lt: options.cursor, // Cursor-based pagination
    };
  }

  // Fetch transfers
  const transfers = await prisma.marketplace_transfers.findMany({
    where,
    take,
    orderBy: { created_at: 'desc' },
    include: {
      destination_account: {
        select: {
          business_name: true,
          email: true,
        },
      },
    },
  });

  // Check if there are more results
  const hasMore = transfers.length > limit;
  const results = hasMore ? transfers.slice(0, -1) : transfers;
  const nextCursor = hasMore ? results[results.length - 1].id : null;

  return {
    transfers: results as any,
    has_more: hasMore,
    next_cursor: nextCursor,
  };
}

/**
 * List all transfers (admin only)
 *
 * @param options - Pagination and filter options
 * @returns Promise with transfers and pagination
 */
export async function listAllTransfers(options: {
  status?: TransferStatus;
  limit?: number;
  cursor?: string;
} = {}): Promise<{
  transfers: MarketplaceTransfer[];
  has_more: boolean;
  next_cursor: string | null;
}> {
  const limit = options.limit || 20;
  const take = limit + 1;

  const where: any = {};

  if (options.status) {
    where.status = options.status;
  }

  if (options.cursor) {
    where.id = {
      lt: options.cursor,
    };
  }

  const transfers = await prisma.marketplace_transfers.findMany({
    where,
    take,
    orderBy: { created_at: 'desc' },
    include: {
      destination_account: {
        select: {
          id: true,
          stripe_account_id: true,
          business_name: true,
          email: true,
          clerk_user_id: true,
        },
      },
    },
  });

  const hasMore = transfers.length > limit;
  const results = hasMore ? transfers.slice(0, -1) : transfers;
  const nextCursor = hasMore ? results[results.length - 1].id : null;

  return {
    transfers: results as any,
    has_more: hasMore,
    next_cursor: nextCursor,
  };
}

/**
 * Sync transfer status from Stripe to database
 *
 * @param transferId - Database transfer ID
 * @returns Promise<MarketplaceTransfer>
 */
export async function syncTransferStatus(transferId: string): Promise<MarketplaceTransfer> {
  // Get transfer from database
  const dbTransfer = await getTransferFromDb(transferId);
  if (!dbTransfer) {
    throw createError.notFound('Transfer not found');
  }

  // Get latest data from Stripe
  const stripeTransfer = await getTransfer(dbTransfer.stripe_transfer_id);

  // Determine status
  let status: TransferStatus = 'pending';
  if (stripeTransfer.reversed) {
    status = 'canceled';
  } else if (stripeTransfer.amount_reversed > 0) {
    status = 'failed';
  } else {
    status = 'paid';
  }

  // Update database
  const updatedTransfer = await prisma.marketplace_transfers.update({
    where: { id: transferId },
    data: {
      status,
    },
  });

  return toMarketplaceTransfer(updatedTransfer);
}

/**
 * Reverse a transfer
 *
 * @param transferId - Database transfer ID
 * @param amount - Amount to reverse (optional)
 * @returns Promise<MarketplaceTransfer>
 */
export async function reverseTransferById(
  transferId: string,
  amount?: number
): Promise<MarketplaceTransfer> {
  const dbTransfer = await getTransferFromDb(transferId);
  if (!dbTransfer) {
    throw createError.notFound('Transfer not found');
  }

  // Reverse with Stripe
  await reverseTransfer(dbTransfer.stripe_transfer_id, amount);

  // Update database
  const updatedTransfer = await prisma.marketplace_transfers.update({
    where: { id: transferId },
    data: {
      status: 'canceled',
    },
  });

  return toMarketplaceTransfer(updatedTransfer);
}

/**
 * Calculate total transferred amount for an account
 *
 * @param accountId - Database account ID
 * @param status - Filter by status (optional)
 * @returns Promise<number>
 */
export async function getTotalTransferredAmount(
  accountId: string,
  status?: TransferStatus
): Promise<number> {
  const where: any = {
    destination_account_id: accountId,
  };

  if (status) {
    where.status = status;
  }

  const result = await prisma.marketplace_transfers.aggregate({
    where,
    _sum: {
      amount: true,
    },
  });

  return Number(result._sum.amount) || 0;
}

/**
 * Calculate total application fees collected
 *
 * @param accountId - Database account ID (optional, for specific account)
 * @returns Promise<number>
 */
export async function getTotalApplicationFees(accountId?: string): Promise<number> {
  const where: any = {
    status: 'paid',
  };

  if (accountId) {
    where.destination_account_id = accountId;
  }

  const result = await prisma.marketplace_transfers.aggregate({
    where,
    _sum: {
      application_fee_amount: true,
    },
  });

  return Number(result._sum.application_fee_amount) || 0;
}

/**
 * Get transfer statistics for an account
 *
 * @param accountId - Database account ID
 * @returns Promise with statistics
 */
export async function getTransferStatistics(accountId: string): Promise<{
  total_transfers: number;
  total_amount: number;
  total_fees: number;
  pending_amount: number;
  paid_amount: number;
  failed_count: number;
}> {
  const [total, totalAmount, totalFees, pendingAmount, paidAmount, failedCount] =
    await Promise.all([
      prisma.marketplace_transfers.count({
        where: { destination_account_id: accountId },
      }),
      getTotalTransferredAmount(accountId),
      getTotalApplicationFees(accountId),
      getTotalTransferredAmount(accountId, 'pending'),
      getTotalTransferredAmount(accountId, 'paid'),
      prisma.marketplace_transfers.count({
        where: { destination_account_id: accountId, status: 'failed' },
      }),
    ]);

  return {
    total_transfers: total,
    total_amount: totalAmount,
    total_fees: totalFees,
    pending_amount: pendingAmount,
    paid_amount: paidAmount,
    failed_count: failedCount,
  };
}

/**
 * Get transfers by transfer group
 *
 * @param transferGroup - Transfer group ID
 * @returns Promise<MarketplaceTransfer[]>
 */
export async function getTransfersByGroup(
  transferGroup: string
): Promise<MarketplaceTransfer[]> {
  const transfers = await prisma.marketplace_transfers.findMany({
    where: { transfer_group: transferGroup },
    orderBy: { created_at: 'asc' },
    include: {
      destination_account: {
        select: {
          business_name: true,
          email: true,
        },
      },
    },
  });

  return transfers as any;
}

/**
 * Validate user can create transfer to account
 *
 * @param accountId - Destination account ID
 * @returns Promise<boolean>
 */
export async function canTransferToAccount(accountId: string): Promise<boolean> {
  const account = await prisma.stripe_connect_accounts.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    return false;
  }

  return account.charges_enabled && account.payouts_enabled;
}
