/**
 * useTransfers Hook
 *
 * Manages marketplace transfers with pagination
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { MarketplaceTransfer, TransferStatus } from '@/types/stripe-connect';
import { listTransfers, createTransfer } from '@/lib/stripe/connect-client';
import { toast } from 'react-hot-toast';

interface UseTransfersOptions {
  accountId?: string;
  status?: TransferStatus;
  limit?: number;
  autoFetch?: boolean;
}

interface PaginationInfo {
  has_more: boolean;
  next_cursor: string | null;
  limit: number;
}

interface UseTransfersReturn {
  transfers: MarketplaceTransfer[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  fetchTransfers: () => Promise<void>;
  loadMore: () => Promise<void>;
  createNewTransfer: (params: {
    destination_account_id: string;
    amount: number;
    currency?: string;
    description?: string;
    application_fee_amount?: number;
  }) => Promise<MarketplaceTransfer | null>;
  refreshTransfers: () => Promise<void>;
}

export function useTransfers(
  options: UseTransfersOptions = {}
): UseTransfersReturn {
  const {
    accountId,
    status,
    limit = 20,
    autoFetch = true,
  } = options;

  const [transfers, setTransfers] = useState<MarketplaceTransfer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  /**
   * Fetch transfers
   */
  const fetchTransfers = useCallback(async (cursor?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await listTransfers({
        account_id: accountId,
        status,
        limit,
        cursor,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch transfers');
      }

      if (cursor) {
        // Append to existing transfers (pagination)
        setTransfers((prev) => [...prev, ...response.data!.transfers]);
      } else {
        // Replace transfers (initial fetch or refresh)
        setTransfers(response.data.transfers);
      }

      setPagination(response.data.pagination);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch transfers';
      setError(message);
      console.error('[useTransfers] Error:', err);
    } finally {
      setLoading(false);
    }
  }, [accountId, status, limit]);

  /**
   * Load more transfers (pagination)
   */
  const loadMore = useCallback(async () => {
    if (!pagination?.has_more || !pagination.next_cursor) {
      return;
    }

    await fetchTransfers(pagination.next_cursor);
  }, [pagination, fetchTransfers]);

  /**
   * Create new transfer (Admin only)
   */
  const createNewTransfer = useCallback(async (params: {
    destination_account_id: string;
    amount: number;
    currency?: string;
    description?: string;
    application_fee_amount?: number;
  }): Promise<MarketplaceTransfer | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await createTransfer(params);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to create transfer');
      }

      toast.success('Transfer created successfully!');

      // Refresh transfers list
      await fetchTransfers();

      return response.data.transfer;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create transfer';
      setError(message);
      toast.error(message);
      console.error('[useTransfers] Create error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchTransfers]);

  /**
   * Refresh transfers (re-fetch from start)
   */
  const refreshTransfers = useCallback(async () => {
    await fetchTransfers();
  }, [fetchTransfers]);

  /**
   * Auto-fetch on mount if enabled
   */
  useEffect(() => {
    if (autoFetch && transfers.length === 0) {
      fetchTransfers();
    }
  }, [autoFetch, transfers.length, fetchTransfers]);

  return {
    transfers,
    loading,
    error,
    pagination,
    fetchTransfers,
    loadMore,
    createNewTransfer,
    refreshTransfers,
  };
}
