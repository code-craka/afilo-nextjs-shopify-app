'use client';

/**
 * CustomerPortalButtonV2 Component
 *
 * Provides access to enhanced Stripe Billing Portal with:
 * - Subscription management (upgrade/downgrade/cancel)
 * - Payment method updates
 * - Invoice history and downloads
 * - Billing address management
 * - Tax ID configuration
 * - Afilo branding and custom styling
 * - Multi-language support
 *
 * Features:
 * - Requires Clerk authentication
 * - Rate-limited to 5 requests per 15 minutes
 * - Custom return URL support
 * - Error handling and loading states
 * - Analytics logging
 *
 * Usage:
 * ```tsx
 * <CustomerPortalButtonV2
 *   label="Manage Billing"
 *   returnUrl="/dashboard"
 *   locale="en"
 * />
 * ```
 */

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

/**
 * Portal session response from API
 */
interface PortalSessionResponse {
  success: boolean;
  session: {
    id: string;
    url: string;
    created_at: string;
    expires_at: string;
  };
  message: string;
}

/**
 * Component Props
 */
interface CustomerPortalButtonV2Props {
  /** Custom button label (optional) */
  label?: string;
  /** Custom return URL (optional, defaults to /dashboard) */
  returnUrl?: string;
  /** Portal language (optional, defaults to 'en') */
  locale?: string;
  /** Custom button className (optional) */
  className?: string;
  /** Button variant: primary, secondary, outline (optional) */
  variant?: 'primary' | 'secondary' | 'outline';
  /** Button size: sm, md, lg (optional) */
  size?: 'sm' | 'md' | 'lg';
  /** Show icon in button (optional) */
  showIcon?: boolean;
  /** Disable button (optional) */
  disabled?: boolean;
  /** Callback on successful portal creation */
  onSuccess?: (sessionId: string) => void;
  /** Callback on error */
  onError?: (error: string) => void;
  /** Callback when loading state changes */
  onLoadingChange?: (isLoading: boolean) => void;
  /** Show full button text or icon only (optional) */
  fullText?: boolean;
}

/**
 * Supported portal languages
 */
const SUPPORTED_LOCALES = [
  'en', 'es', 'fr', 'de', 'it', 'ja', 'pt', 'nl', 'auto',
] as const;

/**
 * CustomerPortalButtonV2 Component
 *
 * Provides authenticated access to the enhanced Stripe Billing Portal
 * with full management capabilities for subscriptions, payments, and billing.
 *
 * Requires Clerk authentication. Will show authentication prompt if user is not signed in.
 *
 * @component
 */
export const CustomerPortalButtonV2: React.FC<CustomerPortalButtonV2Props> = ({
  label = 'Manage Billing',
  returnUrl = '/dashboard',
  locale = 'en',
  className = '',
  variant = 'primary',
  size = 'md',
  showIcon = true,
  disabled = false,
  onSuccess,
  onError,
  onLoadingChange,
  fullText = true,
}) => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  /**
   * Handle portal button click
   *
   * 1. Check authentication
   * 2. Call portal session API
   * 3. Redirect to Stripe portal
   */
  const handlePortalAccess = useCallback(async () => {
    // Clear previous errors
    setError(null);

    // Check authentication
    if (!isLoaded) {
      const errorMsg = 'Loading authentication...';
      setError(errorMsg);
      return;
    }

    if (!user) {
      const errorMsg = 'Please sign in to manage billing';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    try {
      setIsLoading(true);
      onLoadingChange?.(true);

      console.log('[CustomerPortalButtonV2] Creating portal session:', {
        userId: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        locale,
        returnUrl,
      });

      // Validate locale
      if (!SUPPORTED_LOCALES.includes(locale as any)) {
        console.warn('[CustomerPortalButtonV2] Unsupported locale:', locale, 'falling back to en');
      }

      // Call portal session API
      const response = await fetch('/api/billing/portal-v2/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          return_url: returnUrl,
          locale: SUPPORTED_LOCALES.includes(locale as any) ? locale : 'en',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle specific error cases
        if (response.status === 401) {
          throw new Error('Please sign in to access the portal');
        }

        if (response.status === 404) {
          throw new Error('Billing account not found. Please create an account first.');
        }

        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data: PortalSessionResponse = await response.json();

      if (!data.success || !data.session?.url) {
        throw new Error('Failed to create portal session');
      }

      setSessionId(data.session.id);
      onSuccess?.(data.session.id);

      console.log('[CustomerPortalButtonV2] Portal session created:', {
        sessionId: data.session.id,
        expiresAt: data.session.expires_at,
      });

      // Redirect to Stripe portal
      window.location.href = data.session.url;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('[CustomerPortalButtonV2] Portal error:', errorMsg);

      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsLoading(false);
      onLoadingChange?.(false);
    }
  }, [user, isLoaded, locale, returnUrl, onSuccess, onError, onLoadingChange]);

  /**
   * Get button size classes
   */
  const getSizeClasses = (): string => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-6 py-3 text-lg';
      case 'md':
      default:
        return 'px-4 py-2 text-base';
    }
  };

  /**
   * Get variant classes
   */
  const getVariantClasses = (): string => {
    switch (variant) {
      case 'secondary':
        return 'bg-gray-200 text-gray-900 hover:bg-gray-300';
      case 'outline':
        return 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50';
      case 'primary':
      default:
        return 'bg-blue-600 text-white hover:bg-blue-700';
    }
  };

  // Show loading state if authentication is still loading
  if (!isLoaded) {
    return (
      <button
        disabled
        className={`customer-portal-button loading ${className}`}
        aria-busy="true"
      >
        <span className="flex items-center justify-center gap-2">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </span>
      </button>
    );
  }

  return (
    <div className="customer-portal-container">
      <button
        onClick={handlePortalAccess}
        disabled={isLoading || disabled || !user}
        className={`
          customer-portal-button
          ${getSizeClasses()}
          ${getVariantClasses()}
          ${isLoading ? 'loading' : ''}
          ${error ? 'error' : ''}
          ${!user ? 'unauthorized' : ''}
          ${className}
        `}
        aria-label={label}
        aria-busy={isLoading}
        title={!user ? 'Please sign in first' : label}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {fullText ? 'Opening...' : ''}
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            {showIcon && (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            )}
            {fullText && label}
          </span>
        )}
      </button>

      {error && (
        <div
          className="customer-portal-error mt-2 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm"
          role="alert"
        >
          <strong>Error:</strong> {error}
          {!user && (
            <p className="mt-2 text-xs">
              <a href="/sign-in" className="underline hover:no-underline">
                Sign in
              </a>{' '}
              to access the billing portal
            </p>
          )}
        </div>
      )}

      {user && !error && (
        <div className="customer-portal-info mt-2 p-2 text-xs text-gray-600">
          <p>Signed in as {user.primaryEmailAddress?.emailAddress}</p>
        </div>
      )}

      <style jsx>{`
        .customer-portal-container {
          display: inline-block;
        }

        .customer-portal-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          border: none;
          border-radius: 0.375rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .customer-portal-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .customer-portal-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .customer-portal-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .customer-portal-button.loading {
          opacity: 0.9;
        }

        .customer-portal-button.error {
          background-color: #ef4444;
          color: white;
        }

        .customer-portal-button.unauthorized {
          opacity: 0.5;
        }

        .customer-portal-info {
          color: #6b7280;
        }
      `}</style>
    </div>
  );
};

export default CustomerPortalButtonV2;
