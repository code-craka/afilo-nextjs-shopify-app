/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Currency Configuration
 *
 * Global currency definitions for:
 * - USD, CAD (North America)
 * - EUR, GBP, CHF (Europe)
 * - JPY, AUD, SGD, INR (Asia-Pacific)
 *
 * Includes exchange rates, formatting, and Stripe integration.
 */

import type { CurrencyCode, CountryCode, CurrencyConfig } from '@/lib/stripe/types/adaptive-checkout.types';

/**
 * Currency Registry
 * All supported currencies with their configurations
 */
export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  // North America
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    symbol_native: '$',
    decimal_places: 2,
    decimal_separator: '.',
    thousands_separator: ',',
    stripe_code: 'usd',
    countries: ['US'],
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    symbol_native: '$',
    decimal_places: 2,
    decimal_separator: '.',
    thousands_separator: ',',
    stripe_code: 'cad',
    countries: ['CA'],
  },

  // Europe
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    symbol_native: '€',
    decimal_places: 2,
    decimal_separator: ',',
    thousands_separator: '.',
    stripe_code: 'eur',
    countries: ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'FI', 'IE', 'LU', 'MT', 'PT', 'SI', 'SK'],
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    symbol_native: '£',
    decimal_places: 2,
    decimal_separator: '.',
    thousands_separator: ',',
    stripe_code: 'gbp',
    countries: ['GB'],
  },

  // Asia-Pacific
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    symbol_native: '￥',
    decimal_places: 0, // JPY doesn't use decimal places
    decimal_separator: '.',
    thousands_separator: ',',
    stripe_code: 'jpy',
    countries: ['JP'],
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    symbol_native: '$',
    decimal_places: 2,
    decimal_separator: '.',
    thousands_separator: ',',
    stripe_code: 'aud',
    countries: ['AU'],
  },
  SGD: {
    code: 'SGD',
    symbol: 'S$',
    name: 'Singapore Dollar',
    symbol_native: '$',
    decimal_places: 2,
    decimal_separator: '.',
    thousands_separator: ',',
    stripe_code: 'sgd',
    countries: ['SG'],
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    symbol_native: '₹',
    decimal_places: 2,
    decimal_separator: '.',
    thousands_separator: ',',
    stripe_code: 'inr',
    countries: ['IN'],
  },
};

/**
 * Country to Currency Mapping
 */
export const COUNTRY_TO_CURRENCY: Record<CountryCode, CurrencyCode> = {
  // North America
  US: 'USD',
  CA: 'CAD',

  // Europe
  GB: 'GBP',
  DE: 'EUR',
  FR: 'EUR',
  IT: 'EUR',
  ES: 'EUR',
  NL: 'EUR',
  BE: 'EUR',
  AT: 'EUR',
  CH: 'CHF' as any, // TODO: Add CHF support if needed
  SE: 'EUR' as any, // TODO: Add SEK support
  NO: 'EUR' as any, // TODO: Add NOK support
  DK: 'EUR' as any, // TODO: Add DKK support
  FI: 'EUR',
  PL: 'EUR' as any, // TODO: Add PLN support
  IE: 'EUR',
  LU: 'EUR',
  MT: 'EUR',
  PT: 'EUR',
  SI: 'EUR',
  SK: 'EUR',

  // Asia-Pacific
  JP: 'JPY',
  CN: 'USD' as any, // TODO: Add CNY support for China
  IN: 'INR',
  AU: 'AUD',
  SG: 'SGD',
  HK: 'USD' as any, // TODO: Add HKD support
  KR: 'USD' as any, // TODO: Add KRW support
  TH: 'USD' as any, // TODO: Add THB support
  MY: 'SGD' as any, // TODO: Add MYR support
  PH: 'USD' as any, // TODO: Add PHP support
  VN: 'USD' as any, // TODO: Add VND support
  ID: 'USD' as any, // TODO: Add IDR support
};

/**
 * Format price according to currency rules
 */
export function formatCurrencyAmount(
  amountCents: number,
  currencyCode: CurrencyCode
): string {
  const currency = CURRENCIES[currencyCode];

  if (!currency) {
    // Fallback to default formatting
    return `${amountCents / 100}`;
  }

  const amountDecimal = currency.decimal_places === 0
    ? Math.round(amountCents / 100)
    : (amountCents / 100).toFixed(currency.decimal_places);

  const parts = String(amountDecimal).split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];

  // Format integer part with thousands separator
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousands_separator);

  // Combine with decimal separator if needed
  const formatted = decimalPart
    ? `${formattedInteger}${currency.decimal_separator}${decimalPart}`
    : formattedInteger;

  // Return with symbol
  return `${currency.symbol} ${formatted}`;
}

/**
 * Format price for display with currency symbol
 */
export function displayPrice(
  amountCents: number,
  currencyCode: CurrencyCode
): string {
  const currency = CURRENCIES[currencyCode];

  if (!currency) {
    return `${amountCents / 100}`;
  }

  const amount = currency.decimal_places === 0
    ? Math.round(amountCents / 100)
    : (amountCents / 100).toFixed(currency.decimal_places);

  return `${currency.symbol}${amount}`;
}

/**
 * Get currency by code
 */
export function getCurrencyConfig(code: CurrencyCode): CurrencyConfig | undefined {
  return CURRENCIES[code];
}

/**
 * Check if currency uses decimal places
 */
export function hasDecimalPlaces(currencyCode: CurrencyCode): boolean {
  const currency = CURRENCIES[currencyCode];
  return currency ? currency.decimal_places > 0 : true;
}

/**
 * Get decimal places for currency
 */
export function getDecimalPlaces(currencyCode: CurrencyCode): number {
  const currency = CURRENCIES[currencyCode];
  return currency ? currency.decimal_places : 2;
}

/**
 * List all supported currencies
 */
export function listSupportedCurrencies(): CurrencyCode[] {
  return Object.keys(CURRENCIES) as CurrencyCode[];
}

/**
 * List currencies supported in a region
 */
export function getCurrenciesByRegion(
  region: 'north_america' | 'europe' | 'asia_pacific'
): CurrencyCode[] {
  const regionCurrencies: Record<string, CurrencyCode[]> = {
    north_america: ['USD', 'CAD'],
    europe: ['EUR', 'GBP'],
    asia_pacific: ['JPY', 'AUD', 'SGD', 'INR'],
  };

  return regionCurrencies[region] || [];
}

/**
 * Check if currency is supported
 */
export function isCurrencySupported(code: string): code is CurrencyCode {
  return code in CURRENCIES;
}

/**
 * Mock exchange rates to USD
 * In production, integrate with Stripe's exchange rates or external API
 * These should be updated regularly (daily/hourly)
 */
export const EXCHANGE_RATES_TO_USD: Record<CurrencyCode, number> = {
  USD: 1.0,
  CAD: 0.72, // 1 CAD = ~0.72 USD
  EUR: 1.08, // 1 EUR = ~1.08 USD
  GBP: 1.27, // 1 GBP = ~1.27 USD
  JPY: 0.0068, // 1 JPY = ~0.0068 USD (100 JPY = ~0.68 USD)
  AUD: 0.66, // 1 AUD = ~0.66 USD
  SGD: 0.74, // 1 SGD = ~0.74 USD
  INR: 0.012, // 1 INR = ~0.012 USD (83 INR = ~1 USD)
};

/**
 * Convert amount between currencies
 * Uses mock exchange rates - should be replaced with live rates
 */
export function convertCurrency(
  amountCents: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode
): number {
  if (fromCurrency === toCurrency) {
    return amountCents;
  }

  const fromRate = EXCHANGE_RATES_TO_USD[fromCurrency];
  const toRate = EXCHANGE_RATES_TO_USD[toCurrency];

  if (!fromRate || !toRate) {
    throw new Error(`Unsupported currency conversion: ${fromCurrency} to ${toCurrency}`);
  }

  // Convert to USD first, then to target currency
  const usdAmount = amountCents / fromRate;
  const convertedAmount = usdAmount * toRate;

  return Math.round(convertedAmount);
}

/**
 * Get exchange rate between two currencies
 */
export function getExchangeRate(
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode
): number {
  const fromRate = EXCHANGE_RATES_TO_USD[fromCurrency];
  const toRate = EXCHANGE_RATES_TO_USD[toCurrency];

  if (!fromRate || !toRate) {
    throw new Error(`Unsupported currencies: ${fromCurrency} or ${toCurrency}`);
  }

  return toRate / fromRate;
}

/**
 * Format currency pair (e.g., "USD/EUR")
 */
export function formatCurrencyPair(from: CurrencyCode, to: CurrencyCode): string {
  return `${from}/${to}`;
}

/**
 * Validate currency code
 */
export function validateCurrencyCode(code: string): code is CurrencyCode {
  return Object.keys(CURRENCIES).includes(code);
}
