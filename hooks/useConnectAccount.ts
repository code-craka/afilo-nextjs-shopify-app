/**
 * useConnectAccount Hook
 *
 * Manages Connect account state and operations
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import type { ConnectAccount } from '@/types/stripe-connect';
import {
  getConnectAccount,
  createConnectAccount,
  updateConnectAccount,
  generateOnboardingLink,
  isAccountReady,
} from '@/lib/stripe/connect-client';
import { toast } from 'react-hot-toast';

interface UseConnectAccountOptions {
  accountId?: string;
  autoFetch?: boolean;
}

interface UseConnectAccountReturn {
  account: ConnectAccount | null;
  loading: boolean;
  error: string | null;
  isReady: boolean;
  fetchAccount: () => Promise<void>;
  createAccount: (type: 'express' | 'standard') => Promise<ConnectAccount | null>;
  updateAccount: (updates: {
    business_name?: string;
    email?: string;
    metadata?: Record<string, string>;
  }) => Promise<void>;
  startOnboarding: () => Promise<string | null>;
  refreshAccount: () => Promise<void>;
}

export function useConnectAccount(
  options: UseConnectAccountOptions = {}
): UseConnectAccountReturn {
  const { accountId, autoFetch = true } = options;
  const { user } = useUser();

  const [account, setAccount] = useState<ConnectAccount | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch account details
   */
  const fetchAccount = useCallback(async () => {
    if (!accountId) {
      setError('No account ID provided');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getConnectAccount(accountId);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch account');
      }

      setAccount(response.data.account);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch account';
      setError(message);
      console.error('[useConnectAccount] Error:', err);
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  /**
   * Create new Connect account
   */
  const createAccount = useCallback(async (
    type: 'express' | 'standard'
  ): Promise<ConnectAccount | null> => {
    if (!user?.primaryEmailAddress?.emailAddress) {
      toast.error('Please sign in to create an account');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await createConnectAccount({
        account_type: type,
        email: user.primaryEmailAddress.emailAddress,
        business_type: 'individual',
        country: 'US',
      });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to create account');
      }

      setAccount(response.data.account);
      toast.success('Account created successfully!');

      // Auto-redirect to onboarding if link provided
      if (response.data.onboarding?.url) {
        window.location.href = response.data.onboarding.url;
      }

      return response.data.account;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create account';
      setError(message);
      toast.error(message);
      console.error('[useConnectAccount] Create error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Update account information
   */
  const updateAccount = useCallback(async (updates: {
    business_name?: string;
    email?: string;
    metadata?: Record<string, string>;
  }) => {
    if (!accountId) {
      toast.error('No account ID provided');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await updateConnectAccount(accountId, updates);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to update account');
      }

      setAccount(response.data.account);
      toast.success('Account updated successfully!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update account';
      setError(message);
      toast.error(message);
      console.error('[useConnectAccount] Update error:', err);
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  /**
   * Start onboarding process
   */
  const startOnboarding = useCallback(async (): Promise<string | null> => {
    if (!accountId) {
      toast.error('No account ID provided');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await generateOnboardingLink(accountId);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to generate onboarding link');
      }

      // Redirect to onboarding
      window.location.href = response.data.url;
      return response.data.url;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start onboarding';
      setError(message);
      toast.error(message);
      console.error('[useConnectAccount] Onboarding error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  /**
   * Refresh account data (alias for fetchAccount)
   */
  const refreshAccount = useCallback(async () => {
    await fetchAccount();
  }, [fetchAccount]);

  /**
   * Auto-fetch on mount if enabled and accountId provided
   */
  useEffect(() => {
    if (autoFetch && accountId && !account) {
      fetchAccount();
    }
  }, [autoFetch, accountId, account, fetchAccount]);

  /**
   * Check if account is ready for payments
   */
  const isReady = account ? isAccountReady(account) : false;

  return {
    account,
    loading,
    error,
    isReady,
    fetchAccount,
    createAccount,
    updateAccount,
    startOnboarding,
    refreshAccount,
  };
}
