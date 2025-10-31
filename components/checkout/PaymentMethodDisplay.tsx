'use client';

/**
 * PaymentMethodDisplay Component
 *
 * Shows optimal payment methods ranked by:
 * - Optimization score (0-100, higher is better)
 * - Regional availability
 * - Processing time
 * - Device compatibility
 *
 * Features:
 * - Auto-loads optimal methods via API
 * - Shows optimization scores with visual indicators
 * - Highlights recommended method
 * - Mobile-optimized display
 * - Error handling and loading states
 *
 * Usage:
 * ```tsx
 * <PaymentMethodDisplay
 *   country="US"
 *   currency="USD"
 *   amount={5000}
 *   deviceType="mobile"
 * />
 * ```
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { CountryCode, CurrencyCode } from '@/lib/stripe/types/adaptive-checkout.types';

/**
 * Payment method with optimization details
 */
interface PaymentMethod {
  type: string;
  name: string;
  description: string;
  optimization_score: number;
  processing_time: string;
  reason: string;
  recommended_for_device: boolean;
}

/**
 * API Response structure
 */
interface PaymentMethodsResponse {
  success: boolean;
  query: {
    country: string;
    currency: string;
    amount: number;
    device_type: string;
  };
  methods: PaymentMethod[];
  primary_method: string;
  recommended_for_device: string;
}

/**
 * Component Props
 */
interface PaymentMethodDisplayProps {
  /** ISO country code */
  country: CountryCode;
  /** Currency code */
  currency: CurrencyCode;
  /** Amount in cents */
  amount: number;
  /** Device type (mobile, tablet, desktop) */
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  /** Custom className */
  className?: string;
  /** Show detailed descriptions (optional) */
  showDetails?: boolean;
  /** Max methods to display (optional) */
  maxMethods?: number;
  /** Callback when primary method changes */
  onPrimaryMethodChange?: (method: string) => void;
}

/**
 * Get color based on optimization score
 */
function getScoreColor(score: number): string {
  if (score >= 90) return '#10b981'; // green
  if (score >= 70) return '#3b82f6'; // blue
  if (score >= 50) return '#f59e0b'; // amber
  return '#ef4444'; // red
}

/**
 * Get badge for device recommendation
 */
function getDeviceBadge(deviceType: string): string {
  switch (deviceType) {
    case 'mobile':
      return '📱';
    case 'tablet':
      return '📊';
    case 'desktop':
      return '🖥️';
    default:
      return '💳';
  }
}

/**
 * PaymentMethodDisplay Component
 *
 * Fetches and displays optimal payment methods for a transaction
 * based on geography, currency, and device type.
 *
 * @component
 */
export const PaymentMethodDisplay: React.FC<PaymentMethodDisplayProps> = ({
  country,
  currency,
  amount,
  deviceType = 'desktop',
  className = '',
  showDetails = true,
  maxMethods = 5,
  onPrimaryMethodChange,
}) => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [primaryMethod, setPrimaryMethod] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch optimal payment methods from API
   */
  const fetchPaymentMethods = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        country,
        currency,
        amount: amount.toString(),
        device_type: deviceType,
      });

      const response = await fetch(`/api/checkout/payment-methods/optimal?${params}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data: PaymentMethodsResponse = await response.json();

      if (!data.success || !data.methods) {
        throw new Error('No payment methods available');
      }

      // Limit displayed methods
      setMethods(data.methods.slice(0, maxMethods));
      setPrimaryMethod(data.primary_method);
      onPrimaryMethodChange?.(data.primary_method);

      console.log('[PaymentMethodDisplay] Methods loaded:', {
        country,
        currency,
        amount,
        methodCount: data.methods.length,
        primaryMethod: data.primary_method,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load payment methods';
      console.error('[PaymentMethodDisplay] Error:', errorMsg);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [country, currency, amount, deviceType, maxMethods, onPrimaryMethodChange]);

  // Load payment methods on mount or when dependencies change
  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  if (isLoading) {
    return (
      <div className={`payment-methods-loader ${className}`}>
        <div className="loader-spinner">
          <svg
            className="animate-spin h-6 w-6"
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
        </div>
        <p className="text-gray-600">Loading payment methods...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`payment-methods-error ${className}`}>
        <div className="error-content">
          <p className="error-message">⚠️ {error}</p>
          <button onClick={fetchPaymentMethods} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!methods || methods.length === 0) {
    return (
      <div className={`payment-methods-empty ${className}`}>
        <p>No payment methods available for your location</p>
      </div>
    );
  }

  return (
    <div className={`payment-methods-container ${className}`}>
      <div className="payment-methods-header">
        <h3>Payment Methods</h3>
        <p className="text-xs text-gray-500">
          Optimized for {country} • {deviceType}
        </p>
      </div>

      <div className="payment-methods-list">
        {methods.map((method, index) => (
          <div
            key={method.type}
            className={`payment-method-card ${method.type === primaryMethod ? 'primary' : ''} ${
              method.recommended_for_device ? 'recommended' : ''
            }`}
          >
            {/* Rank Badge */}
            <div className="rank-badge">#{index + 1}</div>

            {/* Primary Method Indicator */}
            {method.type === primaryMethod && (
              <div className="primary-badge" title="Recommended for your location">
                ✓ Best
              </div>
            )}

            {/* Device Recommendation Badge */}
            {method.recommended_for_device && (
              <div className="device-badge" title={`Optimized for ${deviceType}`}>
                {getDeviceBadge(deviceType)}
              </div>
            )}

            {/* Content */}
            <div className="method-content">
              <h4 className="method-name">{method.name}</h4>

              {showDetails && <p className="method-description">{method.description}</p>}

              {/* Score Bar */}
              <div className="score-container">
                <div className="score-label">
                  <span>Optimization Score</span>
                  <span className="score-value">{method.optimization_score}%</span>
                </div>
                <div className="score-bar">
                  <div
                    className="score-fill"
                    style={{
                      width: `${method.optimization_score}%`,
                      backgroundColor: getScoreColor(method.optimization_score),
                    }}
                  />
                </div>
              </div>

              {/* Details Row */}
              <div className="method-details">
                <div className="detail-item">
                  <span className="detail-label">Processing:</span>
                  <span className="detail-value">{method.processing_time}</span>
                </div>
              </div>

              {/* Reason */}
              {showDetails && (
                <p className="method-reason">💡 {method.reason}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="payment-methods-footer">
        <p className="text-xs text-gray-500">
          All payment methods are secured and encrypted. Rates may vary by location.
        </p>
      </div>

      <style jsx>{`
        .payment-methods-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .payment-methods-header {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .payment-methods-header h3 {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0;
        }

        .payment-methods-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .payment-method-card {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding: 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          background-color: #fafafa;
          transition: all 0.2s ease;
        }

        .payment-method-card:hover {
          border-color: #d1d5db;
          background-color: white;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .payment-method-card.primary {
          border-color: #3b82f6;
          background-color: #f0f9ff;
          box-shadow: 0 0 0 1px #3b82f6;
        }

        .payment-method-card.primary:hover {
          box-shadow: 0 0 0 1px #3b82f6, 0 4px 6px -1px rgba(59, 130, 246, 0.2);
        }

        .rank-badge {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 1.75rem;
          height: 1.75rem;
          background-color: #3b82f6;
          color: white;
          border-radius: 50%;
          font-weight: 700;
          font-size: 0.75rem;
        }

        .primary-badge {
          position: absolute;
          top: 0.5rem;
          left: 0.5rem;
          padding: 0.25rem 0.5rem;
          background-color: #10b981;
          color: white;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .device-badge {
          position: absolute;
          top: 0.5rem;
          left: 3.5rem;
          font-size: 1rem;
        }

        .method-content {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding-right: 2rem;
        }

        .method-name {
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
        }

        .method-description {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
        }

        .score-container {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .score-label {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .score-value {
          color: #3b82f6;
          font-weight: 700;
        }

        .score-bar {
          display: flex;
          height: 0.5rem;
          background-color: #e5e7eb;
          border-radius: 0.25rem;
          overflow: hidden;
        }

        .score-fill {
          transition: width 0.3s ease;
        }

        .method-details {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
        }

        .detail-item {
          display: flex;
          gap: 0.5rem;
        }

        .detail-label {
          color: #6b7280;
          font-weight: 500;
        }

        .detail-value {
          color: #111827;
          font-weight: 600;
        }

        .method-reason {
          font-size: 0.875rem;
          color: #3b82f6;
          margin: 0;
          padding: 0.5rem;
          background-color: #eff6ff;
          border-left: 2px solid #3b82f6;
          border-radius: 0.25rem;
        }

        .payment-methods-footer {
          text-align: center;
          padding: 0.5rem;
        }

        .payment-methods-loader,
        .payment-methods-error,
        .payment-methods-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          text-align: center;
        }

        .loader-spinner {
          margin-bottom: 1rem;
          color: #3b82f6;
        }

        .error-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          align-items: center;
        }

        .error-message {
          color: #dc2626;
          margin: 0;
        }

        .retry-button {
          padding: 0.5rem 1rem;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.375rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .retry-button:hover {
          background-color: #2563eb;
        }
      `}</style>
    </div>
  );
};

export default PaymentMethodDisplay;
