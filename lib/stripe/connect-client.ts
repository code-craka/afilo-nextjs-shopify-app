/**
 * Stripe Connect Client Utilities
 *
 * Client-side helper functions for Stripe Connect operations
 */

'use client';

import type {
  ConnectAccount,
  MarketplaceTransfer,
  CreateConnectAccountRequest,
  UpdateConnectAccountRequest,
  CreateTransferRequest,
} from '@/types/stripe-connect';

/**
 * API Response wrapper
 */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Fetch wrapper with error handling
 */
async function fetchApi<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || {
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred',
        },
      };
    }

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('[ConnectClient] API Error:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Network error',
      },
    };
  }
}

/**
 * Create a new Connect account
 */
export async function createConnectAccount(
  request: CreateConnectAccountRequest
): Promise<ApiResponse<{ account: ConnectAccount; onboarding?: { url: string; expires_at: string } }>> {
  return fetchApi('/api/stripe/connect/create-account', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Generate onboarding link
 */
export async function generateOnboardingLink(
  accountId: string
): Promise<ApiResponse<{ url: string; expires_at: string }>> {
  return fetchApi('/api/stripe/connect/onboard', {
    method: 'POST',
    body: JSON.stringify({ account_id: accountId }),
  });
}

/**
 * Get Connect account details
 */
export async function getConnectAccount(
  accountId: string
): Promise<ApiResponse<{ account: ConnectAccount }>> {
  return fetchApi(`/api/stripe/connect/account/${accountId}`, {
    method: 'GET',
  });
}

/**
 * Update Connect account
 */
export async function updateConnectAccount(
  accountId: string,
  updates: UpdateConnectAccountRequest
): Promise<ApiResponse<{ account: ConnectAccount }>> {
  return fetchApi(`/api/stripe/connect/account/${accountId}/update`, {
    method: 'POST',
    body: JSON.stringify(updates),
  });
}

/**
 * Create transfer (Admin only)
 */
export async function createTransfer(
  request: CreateTransferRequest
): Promise<ApiResponse<{ transfer: MarketplaceTransfer }>> {
  return fetchApi('/api/stripe/connect/transfer', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * List transfers
 */
export async function listTransfers(params?: {
  account_id?: string;
  status?: string;
  limit?: number;
  cursor?: string;
}): Promise<ApiResponse<{
  transfers: MarketplaceTransfer[];
  pagination: {
    has_more: boolean;
    next_cursor: string | null;
    limit: number;
  };
}>> {
  const searchParams = new URLSearchParams();
  if (params?.account_id) searchParams.set('account_id', params.account_id);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.cursor) searchParams.set('cursor', params.cursor);

  return fetchApi(`/api/stripe/connect/transfers?${searchParams.toString()}`, {
    method: 'GET',
  });
}

/**
 * Generate Express Dashboard link
 */
export async function generateDashboardLink(
  accountId: string
): Promise<ApiResponse<{ url: string; expires_at: number }>> {
  return fetchApi('/api/stripe/connect/dashboard-link', {
    method: 'POST',
    body: JSON.stringify({ account_id: accountId }),
  });
}

/**
 * Format currency for display
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD'
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
}

/**
 * Get onboarding status display
 */
export function getOnboardingStatusDisplay(
  status: string
): { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } {
  switch (status) {
    case 'completed':
      return { label: 'Complete', variant: 'default' };
    case 'pending':
      return { label: 'Pending', variant: 'secondary' };
    case 'restricted':
      return { label: 'Restricted', variant: 'destructive' };
    default:
      return { label: 'Unknown', variant: 'outline' };
  }
}

/**
 * Get transfer status display
 */
export function getTransferStatusDisplay(
  status: string
): { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } {
  switch (status) {
    case 'paid':
      return { label: 'Paid', variant: 'default' };
    case 'pending':
      return { label: 'Pending', variant: 'secondary' };
    case 'failed':
      return { label: 'Failed', variant: 'destructive' };
    case 'canceled':
      return { label: 'Canceled', variant: 'outline' };
    default:
      return { label: 'Unknown', variant: 'outline' };
  }
}

/**
 * Check if account is ready for payments
 */
export function isAccountReady(account: ConnectAccount): boolean {
  return (
    account.charges_enabled &&
    account.payouts_enabled &&
    account.onboarding_status === 'completed'
  );
}

/**
 * Get account readiness message
 */
export function getAccountReadinessMessage(account: ConnectAccount): string {
  if (isAccountReady(account)) {
    return 'Your account is ready to accept payments and receive payouts.';
  }

  if (!account.details_submitted) {
    return 'Please complete onboarding to start accepting payments.';
  }

  if (!account.charges_enabled) {
    return 'Your account cannot accept payments yet. Please complete verification.';
  }

  if (!account.payouts_enabled) {
    return 'Your account cannot receive payouts yet. Please complete verification.';
  }

  return 'Please complete all verification requirements.';
}
