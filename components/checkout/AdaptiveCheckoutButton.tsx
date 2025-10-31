'use client';

/**
 * AdaptiveCheckoutButton Component
 *
 * Intelligent checkout button that:
 * - Detects user location from IP
 * - Auto-selects optimal payment methods
 * - Converts prices to local currency
 * - Creates adaptive checkout sessions
 * - Shows loading and error states
 *
 * Usage:
 * ```tsx
 * <AdaptiveCheckoutButton
 *   priceId="price_xxx"
 *   email="customer@example.com"
 *   country="US"      // optional, auto-detected if not provided
 *   currency="USD"    // optional, auto-detected if not provided
 * />
 * ```
 */

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { CurrencyCode, CountryCode } from '@/lib/stripe/types/adaptive-checkout.types';

/**
 * Component Props
 */
interface AdaptiveCheckoutButtonProps {
  /** Stripe Price ID (required) */
  priceId: string;
  /** Customer email (required) */
  email: string;
  /** Override detected country (optional) */
  country?: CountryCode;
  /** Override detected currency (optional) */
  currency?: CurrencyCode;
  /** Custom button label (optional) */
  label?: string;
  /** Custom button className for styling (optional) */
  className?: string;
  /** Callback fired on successful checkout creation */
  onSuccess?: (sessionId: string) => void;
  /** Callback fired on error */
  onError?: (error: string) => void;
  /** Callback fired when loading state changes */
  onLoadingChange?: (isLoading: boolean) => void;
  /** Disable button (optional) */
  disabled?: boolean;
  /** Show currency and country in button text (optional) */
  showDetectionInfo?: boolean;
}

/**
 * Adaptive Checkout Session Response
 */
interface AdaptiveCheckoutResponse {
  success: boolean;
  session: {
    id: string;
    url: string;
    created_at: string;
  };
  adaptive_info: {
    detected_country: string;
    detected_currency: string;
    recommended_payment_methods: string[];
    enabled_payment_methods: string[];
  };
  pricing: {
    base_amount: number;
    base_currency: string;
    localized_amount: number;
    localized_currency: string;
    display: {
      base: string;
      localized: string;
      total: string;
    };
  };
  device_type: 'mobile' | 'tablet' | 'desktop';
}

/**
 * AdaptiveCheckoutButton Component
 *
 * Handles intelligent checkout with automatic adaptation based on:
 * - User's geographic location (IP geolocation)
 * - Local currency and payment method availability
 * - Device type (mobile/tablet/desktop)
 *
 * @component
 */
export const AdaptiveCheckoutButton: React.FC<AdaptiveCheckoutButtonProps> = ({
  priceId,
  email,
  country,
  currency,
  label = 'Proceed to Checkout',
  className = '',
  onSuccess,
  onError,
  onLoadingChange,
  disabled = false,
  showDetectionInfo = false,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedInfo, setDetectedInfo] = useState<{
    country: string;
    currency: string;
    paymentMethods: string[];
  } | null>(null);

  /**
   * Handle checkout button click
   *
   * 1. Validate inputs
   * 2. Call adaptive checkout API
   * 3. Get session details with auto-detected currency
   * 4. Redirect to Stripe checkout
   */
  const handleCheckout = useCallback(async () => {
    // Clear previous error
    setError(null);

    // Validate inputs
    if (!priceId || !email) {
      const errorMsg = 'Price ID and email are required';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const errorMsg = 'Invalid email address';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    try {
      setIsLoading(true);
      onLoadingChange?.(true);

      console.log('[AdaptiveCheckoutButton] Creating checkout session:', {
        priceId,
        email,
        country,
        currency,
      });

      // Call adaptive checkout API
      const response = await fetch('/api/checkout/adaptive/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_id: priceId,
          customer_email: email,
          country,
          currency,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data: AdaptiveCheckoutResponse = await response.json();

      if (!data.success || !data.session?.url) {
        throw new Error('Failed to create checkout session');
      }

      // Store detected info for display
      setDetectedInfo({
        country: data.adaptive_info.detected_country,
        currency: data.adaptive_info.detected_currency,
        paymentMethods: data.adaptive_info.recommended_payment_methods,
      });

      console.log('[AdaptiveCheckoutButton] Checkout created:', {
        sessionId: data.session.id,
        detectedCountry: data.adaptive_info.detected_country,
        detectedCurrency: data.adaptive_info.detected_currency,
        url: data.session.url,
      });

      // Fire success callback
      onSuccess?.(data.session.id);

      // Redirect to Stripe checkout
      window.location.href = data.session.url;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('[AdaptiveCheckoutButton] Checkout error:', errorMsg);

      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsLoading(false);
      onLoadingChange?.(false);
    }
  }, [priceId, email, country, currency, onSuccess, onError, onLoadingChange]);

  /**
   * Render button with detection info if enabled
   */
  const buttonLabel = showDetectionInfo && detectedInfo
    ? `${label} (${detectedInfo.currency})`
    : label;

  return (
    <div className="adaptive-checkout-button-container">
      <button
        onClick={handleCheckout}
        disabled={isLoading || disabled}
        className={`adaptive-checkout-button ${isLoading ? 'loading' : ''} ${error ? 'error' : ''} ${className}`}
        aria-label={buttonLabel}
        aria-busy={isLoading}
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
            Processing...
          </span>
        ) : (
          buttonLabel
        )}
      </button>

      {error && (
        <div
          className="adaptive-checkout-error mt-2 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm"
          role="alert"
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {showDetectionInfo && detectedInfo && (
        <div className="adaptive-checkout-info mt-2 p-3 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm">
          <p>
            <strong>Location:</strong> {detectedInfo.country} • <strong>Currency:</strong> {detectedInfo.currency}
          </p>
          {detectedInfo.paymentMethods.length > 0 && (
            <p className="mt-1 text-xs">
              <strong>Payment Methods:</strong> {detectedInfo.paymentMethods.slice(0, 3).join(', ')}
              {detectedInfo.paymentMethods.length > 3 && ` +${detectedInfo.paymentMethods.length - 3} more`}
            </p>
          )}
        </div>
      )}

      <style jsx>{`
        .adaptive-checkout-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1.5rem;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.375rem;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 200px;
        }

        .adaptive-checkout-button:hover:not(:disabled) {
          background-color: #2563eb;
          box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
        }

        .adaptive-checkout-button:disabled {
          background-color: #9ca3af;
          cursor: not-allowed;
          opacity: 0.7;
        }

        .adaptive-checkout-button.loading {
          opacity: 0.9;
        }

        .adaptive-checkout-button.error {
          background-color: #ef4444;
        }
      `}</style>
    </div>
  );
};

export default AdaptiveCheckoutButton;
