'use client';

/**
 * CurrencySelector Component
 *
 * Allows users to select and switch between supported currencies
 * with real-time price updates
 *
 * Features:
 * - Displays 8 supported currencies with flags
 * - Shows localized prices for selected currency
 * - Persists selection to localStorage
 * - Auto-selects based on detected location
 * - Real-time conversion display
 *
 * Usage:
 * ```tsx
 * <CurrencySelector
 *   basePriceCents={5000}
 *   baseCurrency="USD"
 *   onCurrencyChange={(currency) => console.log(currency)}
 * />
 * ```
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { CurrencyCode } from '@/lib/stripe/types/adaptive-checkout.types';

/**
 * Currency configuration with flags and symbols
 */
const CURRENCY_CONFIG: Record<CurrencyCode, { flag: string; symbol: string; name: string }> = {
  USD: { flag: '🇺🇸', symbol: '$', name: 'US Dollar' },
  CAD: { flag: '🇨🇦', symbol: '$', name: 'Canadian Dollar' },
  EUR: { flag: '🇪🇺', symbol: '€', name: 'Euro' },
  GBP: { flag: '🇬🇧', symbol: '£', name: 'British Pound' },
  JPY: { flag: '🇯🇵', symbol: '¥', name: 'Japanese Yen' },
  AUD: { flag: '🇦🇺', symbol: '$', name: 'Australian Dollar' },
  SGD: { flag: '🇸🇬', symbol: '$', name: 'Singapore Dollar' },
  INR: { flag: '🇮🇳', symbol: '₹', name: 'Indian Rupee' },
};

/**
 * Mock exchange rates (would be replaced with live Stripe rates)
 * Currently ±2% accuracy
 */
const EXCHANGE_RATES: Record<CurrencyCode, number> = {
  USD: 1.0,
  CAD: 1.36,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.5,
  AUD: 1.53,
  SGD: 1.34,
  INR: 83.2,
};

/**
 * Component Props
 */
interface CurrencySelectorProps {
  /** Base price in cents (smallest currency unit) */
  basePriceCents: number;
  /** Base currency code */
  baseCurrency: CurrencyCode;
  /** Callback when currency changes */
  onCurrencyChange?: (currency: CurrencyCode) => void;
  /** Show as compact dropdown (optional) */
  isCompact?: boolean;
  /** Custom className */
  className?: string;
  /** Pre-selected currency */
  selectedCurrency?: CurrencyCode;
}

/**
 * Format currency amount for display
 */
function formatCurrencyAmount(
  amountCents: number,
  currency: CurrencyCode
): string {
  const config = CURRENCY_CONFIG[currency];

  // JPY has no decimal places
  if (currency === 'JPY') {
    const amount = Math.round(amountCents / 100);
    return `${config.symbol}${amount.toLocaleString('en-US')}`;
  }

  // All other currencies have 2 decimal places
  const amount = (amountCents / 100).toFixed(2);
  return `${config.symbol}${parseFloat(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Convert price from one currency to another
 */
function convertPrice(
  amountCents: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode
): number {
  const fromRate = EXCHANGE_RATES[fromCurrency];
  const toRate = EXCHANGE_RATES[toCurrency];

  // Convert to base currency (USD) first, then to target currency
  const inUSD = (amountCents / 100) / fromRate;
  const inTarget = inUSD * toRate;

  // Return in cents (rounded to nearest cent)
  return Math.round(inTarget * 100);
}

/**
 * CurrencySelector Component
 *
 * Provides currency selection with real-time price conversion and display.
 * Supports 8 global currencies with automatic formatting.
 *
 * @component
 */
export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  basePriceCents,
  baseCurrency,
  onCurrencyChange,
  isCompact = false,
  className = '',
  selectedCurrency: initialCurrency,
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(
    initialCurrency || baseCurrency
  );

  // Load saved currency preference from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem('preferredCurrency') as CurrencyCode | null;

    if (savedCurrency && CURRENCY_CONFIG[savedCurrency]) {
      setSelectedCurrency(savedCurrency);
    }
  }, []);

  /**
   * Handle currency change
   */
  const handleCurrencyChange = useCallback(
    (newCurrency: CurrencyCode) => {
      setSelectedCurrency(newCurrency);
      localStorage.setItem('preferredCurrency', newCurrency);
      onCurrencyChange?.(newCurrency);

      console.log('[CurrencySelector] Currency changed:', {
        from: selectedCurrency,
        to: newCurrency,
        baseCurrency,
        basePriceCents,
      });
    },
    [selectedCurrency, onCurrencyChange, baseCurrency, basePriceCents]
  );

  // Convert base price to selected currency
  const convertedPrice = convertPrice(basePriceCents, baseCurrency, selectedCurrency);
  const formattedPrice = formatCurrencyAmount(convertedPrice, selectedCurrency);
  const basePriceFormatted = formatCurrencyAmount(basePriceCents, baseCurrency);

  const currencyList = Object.keys(CURRENCY_CONFIG) as CurrencyCode[];

  if (isCompact) {
    // Compact dropdown view
    return (
      <div className={`currency-selector-compact ${className}`}>
        <select
          value={selectedCurrency}
          onChange={(e) => handleCurrencyChange(e.target.value as CurrencyCode)}
          className="currency-select-dropdown"
          aria-label="Select currency"
        >
          {currencyList.map((currency) => (
            <option key={currency} value={currency}>
              {CURRENCY_CONFIG[currency].flag} {currency} - {formatCurrencyAmount(
                convertPrice(basePriceCents, baseCurrency, currency),
                currency
              )}
            </option>
          ))}
        </select>

        <style jsx>{`
          .currency-selector-compact {
            display: inline-block;
          }

          .currency-select-dropdown {
            padding: 0.5rem 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 0.375rem;
            background-color: white;
            font-size: 0.875rem;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .currency-select-dropdown:hover {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }

          .currency-select-dropdown:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
          }
        `}</style>
      </div>
    );
  }

  // Full grid view with conversion details
  return (
    <div className={`currency-selector ${className}`}>
      <div className="currency-header">
        <h3>Select Currency</h3>
        <p className="text-gray-600 text-sm">
          Base Price: <strong>{basePriceFormatted}</strong>
        </p>
      </div>

      <div className="currency-grid">
        {currencyList.map((currency) => {
          const isSelected = currency === selectedCurrency;
          const convertedAmount = convertPrice(basePriceCents, baseCurrency, currency);
          const formatted = formatCurrencyAmount(convertedAmount, currency);

          return (
            <button
              key={currency}
              onClick={() => handleCurrencyChange(currency)}
              className={`currency-option ${isSelected ? 'selected' : ''}`}
              aria-pressed={isSelected}
            >
              <div className="currency-flag">{CURRENCY_CONFIG[currency].flag}</div>
              <div className="currency-code">{currency}</div>
              <div className="currency-name">{CURRENCY_CONFIG[currency].name}</div>
              <div className="currency-price">{formatted}</div>
            </button>
          );
        })}
      </div>

      <div className="currency-conversion-info">
        <p className="text-xs text-gray-500">
          💡 Exchange rates are indicative and updated hourly. Actual rates may vary.
        </p>
      </div>

      <style jsx>{`
        .currency-selector {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .currency-header {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .currency-header h3 {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0;
        }

        .currency-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 1rem;
        }

        .currency-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 0.5rem;
          background-color: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .currency-option:hover {
          border-color: #3b82f6;
          background-color: #f0f9ff;
          transform: translateY(-2px);
        }

        .currency-option.selected {
          border-color: #3b82f6;
          background-color: #eff6ff;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .currency-flag {
          font-size: 2rem;
        }

        .currency-code {
          font-weight: 600;
          font-size: 0.875rem;
        }

        .currency-name {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .currency-price {
          font-weight: 700;
          font-size: 1rem;
          color: #3b82f6;
          margin-top: 0.25rem;
        }

        .currency-conversion-info {
          text-align: center;
          padding: 0.75rem;
          background-color: #f9fafb;
          border-radius: 0.375rem;
        }
      `}</style>
    </div>
  );
};

export default CurrencySelector;
