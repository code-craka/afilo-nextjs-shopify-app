/**
 * Payment Methods Configuration
 *
 * Region-specific payment method definitions, priorities, and support
 * for optimizing checkout based on geography.
 *
 * Supports:
 * - Cards (Visa, Mastercard, Amex, Discover)
 * - ACH Direct Debit (US)
 * - SEPA Direct Debit (EU)
 * - Local payment methods (iDEAL, Giropay, etc.)
 * - Digital wallets (Apple Pay, Google Pay)
 * - Buy now, pay later (Klarna, Afterpay)
 */

import type {
  PaymentMethodType,
  PaymentMethodConfig,
  CountryCode,
  CountryConfig,
} from '@/lib/stripe/types/adaptive-checkout.types';

/**
 * Payment Method Definitions
 */
export const PAYMENT_METHODS: Record<PaymentMethodType, PaymentMethodConfig> = {
  // Cards - Universal
  card: {
    type: 'card',
    name: 'Credit or Debit Card',
    description: 'Visa, Mastercard, American Express, Discover',
    supported_countries: [
      'US', 'CA', 'GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'CH',
      'JP', 'AU', 'SG', 'IN', 'HK', 'KR', 'MY', 'PH', 'TH', 'VN', 'ID',
    ],
    processing_time: 'Instant (within seconds)',
    requires_setup: false,
    fee_percentage: 2.9,
    enabled: true,
  },

  // ACH Direct Debit - US Only
  us_bank_account: {
    type: 'us_bank_account',
    name: 'ACH Direct Debit',
    description: 'Bank account transfer (US only)',
    supported_countries: ['US'],
    processing_time: '3-5 business days',
    requires_setup: true,
    fee_percentage: 0.8,
    minimum_amount: 50, // Minimum $0.50 (50 cents)
    maximum_amount: 999999900, // $9,999,999
    enabled: true,
  },

  // SEPA Direct Debit - EU Only
  sepa_debit: {
    type: 'sepa_debit',
    name: 'SEPA Direct Debit',
    description: 'Bank account transfer (Europe)',
    supported_countries: ['GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'FI', 'IE', 'LU', 'MT', 'PT', 'SI', 'SK'],
    processing_time: '1-3 days',
    requires_setup: true,
    fee_percentage: 1.5,
    enabled: true,
  },

  // iDEAL - Netherlands
  ideal: {
    type: 'ideal',
    name: 'iDEAL',
    description: 'Netherlands bank transfer',
    supported_countries: ['NL'],
    processing_time: 'Instant',
    requires_setup: false,
    fee_percentage: 1.8,
    minimum_amount: 100, // €1.00
    maximum_amount: 50000000, // €500,000
    enabled: true,
  },

  // Giropay - Germany
  giropay: {
    type: 'giropay',
    name: 'giropay',
    description: 'German online bank transfer',
    supported_countries: ['DE'],
    processing_time: 'Instant',
    requires_setup: false,
    fee_percentage: 1.8,
    minimum_amount: 100,
    maximum_amount: 50000000,
    enabled: true,
  },

  // EPS - Austria
  eps: {
    type: 'eps',
    name: 'EPS',
    description: 'Austrian online banking',
    supported_countries: ['AT'],
    processing_time: 'Instant',
    requires_setup: false,
    fee_percentage: 1.8,
    enabled: true,
  },

  // Bancontact - Belgium
  bancontact: {
    type: 'bancontact',
    name: 'Bancontact',
    description: 'Belgian online banking',
    supported_countries: ['BE'],
    processing_time: 'Instant',
    requires_setup: false,
    fee_percentage: 1.8,
    enabled: true,
  },

  // Klarna - Buy Now, Pay Later
  klarna: {
    type: 'klarna',
    name: 'Klarna',
    description: 'Buy now, pay later',
    supported_countries: [
      'US', 'CA', 'GB', 'DE', 'FR', 'IT', 'ES', 'SE', 'NO', 'DK', 'FI', 'AU',
    ],
    processing_time: 'Instant / Pay later',
    requires_setup: false,
    fee_percentage: 2.5,
    enabled: true,
  },

  // Afterpay - Australia/NZ
  afterpay: {
    type: 'afterpay',
    name: 'Afterpay',
    description: 'Pay in 4 installments',
    supported_countries: ['AU'],
    processing_time: 'Instant / Pay later',
    requires_setup: false,
    fee_percentage: 0.0, // Covered by Afterpay
    minimum_amount: 1000, // $10.00 AUD
    maximum_amount: 200000, // $2,000 AUD
    enabled: true,
  },

  // Alipay - China/Asia
  alipay: {
    type: 'alipay',
    name: 'Alipay',
    description: 'Chinese digital wallet',
    supported_countries: ['CN', 'SG', 'HK', 'JP', 'TH', 'MY', 'PH'],
    processing_time: 'Instant',
    requires_setup: false,
    fee_percentage: 3.6,
    enabled: true,
  },

  // WeChat Pay - China
  wechat_pay: {
    type: 'wechat_pay',
    name: 'WeChat Pay',
    description: 'Chinese mobile payment',
    supported_countries: ['CN', 'SG', 'HK', 'JP', 'TH'],
    processing_time: 'Instant',
    requires_setup: false,
    fee_percentage: 3.6,
    enabled: true,
  },

  // PayPay - Japan
  paypay: {
    type: 'paypay',
    name: 'PayPay',
    description: 'Japanese mobile payment',
    supported_countries: ['JP', 'SG'],
    processing_time: 'Instant',
    requires_setup: false,
    fee_percentage: 2.0,
    enabled: true,
  },

  // Google Pay (handled by card network)
  google_pay: {
    type: 'google_pay',
    name: 'Google Pay',
    description: 'Google digital wallet',
    supported_countries: [
      'US', 'CA', 'GB', 'DE', 'FR', 'IT', 'ES', 'JP', 'AU', 'SG', 'IN',
    ],
    processing_time: 'Instant',
    requires_setup: false,
    fee_percentage: 2.9, // Same as card
    enabled: true,
  },

  // Apple Pay (handled by card network)
  apple_pay: {
    type: 'apple_pay',
    name: 'Apple Pay',
    description: 'Apple digital wallet',
    supported_countries: [
      'US', 'CA', 'GB', 'DE', 'FR', 'IT', 'ES', 'JP', 'AU', 'SG', 'IN',
    ],
    processing_time: 'Instant',
    requires_setup: false,
    fee_percentage: 2.9, // Same as card
    enabled: true,
  },
};

/**
 * Country-specific payment method priorities
 * Ordered by user preference and success rate
 */
export const COUNTRY_PAYMENT_METHODS: Record<CountryCode, PaymentMethodType[]> = {
  // North America
  US: ['card', 'google_pay', 'apple_pay', 'us_bank_account'],
  CA: ['card', 'google_pay', 'apple_pay'],

  // Europe - UK
  GB: ['card', 'google_pay', 'apple_pay', 'sepa_debit'],

  // Europe - Euro Zone
  DE: ['card', 'google_pay', 'apple_pay', 'sepa_debit', 'giropay'],
  FR: ['card', 'google_pay', 'apple_pay', 'sepa_debit'],
  IT: ['card', 'google_pay', 'apple_pay', 'sepa_debit'],
  ES: ['card', 'google_pay', 'apple_pay', 'sepa_debit'],
  NL: ['ideal', 'card', 'google_pay', 'apple_pay', 'sepa_debit'],
  BE: ['bancontact', 'card', 'google_pay', 'apple_pay', 'sepa_debit'],
  AT: ['card', 'google_pay', 'apple_pay', 'sepa_debit', 'eps'],
  LU: ['card', 'google_pay', 'apple_pay', 'sepa_debit'],
  MT: ['card', 'google_pay', 'apple_pay', 'sepa_debit'],
  PT: ['card', 'google_pay', 'apple_pay', 'sepa_debit'],
  SI: ['card', 'google_pay', 'apple_pay', 'sepa_debit'],
  SK: ['card', 'google_pay', 'apple_pay', 'sepa_debit'],

  // Europe - Other
  CH: ['card', 'google_pay', 'apple_pay'],
  SE: ['card', 'google_pay', 'apple_pay', 'sepa_debit'],
  NO: ['card', 'google_pay', 'apple_pay'],
  DK: ['card', 'google_pay', 'apple_pay', 'sepa_debit'],
  FI: ['card', 'google_pay', 'apple_pay', 'sepa_debit'],
  PL: ['card', 'google_pay', 'apple_pay'],
  IE: ['card', 'google_pay', 'apple_pay', 'sepa_debit'],

  // Asia-Pacific
  JP: ['card', 'google_pay', 'apple_pay', 'paypay'],
  CN: ['alipay', 'wechat_pay', 'card'],
  IN: ['card', 'google_pay', 'apple_pay'],
  AU: ['card', 'google_pay', 'apple_pay', 'afterpay'],
  SG: ['card', 'google_pay', 'apple_pay', 'alipay'],
  HK: ['card', 'google_pay', 'apple_pay', 'alipay'],
  KR: ['card', 'google_pay', 'apple_pay'],
  TH: ['card', 'google_pay', 'apple_pay', 'alipay'],
  MY: ['card', 'google_pay', 'apple_pay'],
  PH: ['card', 'google_pay', 'apple_pay'],
  VN: ['card', 'google_pay', 'apple_pay'],
  ID: ['card', 'google_pay', 'apple_pay'],
};

/**
 * Get payment methods for a country
 */
export function getPaymentMethodsForCountry(countryCode: CountryCode): PaymentMethodType[] {
  return COUNTRY_PAYMENT_METHODS[countryCode] || ['card'];
}

/**
 * Get payment method config
 */
export function getPaymentMethodConfig(type: PaymentMethodType): PaymentMethodConfig | undefined {
  return PAYMENT_METHODS[type];
}

/**
 * Check if payment method is supported in country
 */
export function isPaymentMethodSupported(
  method: PaymentMethodType,
  countryCode: CountryCode
): boolean {
  const config = PAYMENT_METHODS[method];

  if (!config) {
    return false;
  }

  return config.supported_countries.includes(countryCode) && config.enabled;
}

/**
 * Get supported payment methods for country
 */
export function getSupportedPaymentMethods(countryCode: CountryCode): PaymentMethodConfig[] {
  return getPaymentMethodsForCountry(countryCode)
    .map((method) => PAYMENT_METHODS[method])
    .filter((config) => config && config.enabled) as PaymentMethodConfig[];
}

/**
 * Optimization score for payment method
 * Higher score = better for this transaction
 */
export function calculatePaymentMethodScore(
  method: PaymentMethodType,
  countryCode: CountryCode,
  transactionAmountCents: number,
  userPreference?: PaymentMethodType
): number {
  const config = PAYMENT_METHODS[method];

  if (!config || !isPaymentMethodSupported(method, countryCode)) {
    return -1; // Not supported
  }

  let score = 100; // Base score

  // Prioritize user preference
  if (userPreference === method) {
    score += 20;
  }

  // Prioritize primary method for country
  const countryMethods = getPaymentMethodsForCountry(countryCode);
  const position = countryMethods.indexOf(method);

  if (position !== -1) {
    score += Math.max(0, 15 - position * 2); // First method gets most points
  }

  // Instant methods scored higher
  if (config.processing_time === 'Instant') {
    score += 10;
  }

  // Lower fees scored higher
  score += Math.max(0, 10 - config.fee_percentage * 2);

  // Check amount limits
  if (config.minimum_amount && transactionAmountCents < config.minimum_amount) {
    score = -1; // Not available for this amount
  }

  if (config.maximum_amount && transactionAmountCents > config.maximum_amount) {
    score = -1; // Not available for this amount
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Get optimal payment methods for a transaction
 */
export function getOptimalPaymentMethods(
  countryCode: CountryCode,
  transactionAmountCents: number,
  userPreference?: PaymentMethodType,
  limit: number = 5
): PaymentMethodType[] {
  return getPaymentMethodsForCountry(countryCode)
    .map((method) => ({
      method,
      score: calculatePaymentMethodScore(method, countryCode, transactionAmountCents, userPreference),
    }))
    .filter((item) => item.score >= 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.method);
}

/**
 * Get fallback payment method
 * Always returns 'card' for universal support
 */
export function getFallbackPaymentMethod(): PaymentMethodType {
  return 'card';
}

/**
 * List all enabled payment methods
 */
export function listEnabledPaymentMethods(): PaymentMethodType[] {
  return Object.values(PAYMENT_METHODS)
    .filter((config) => config.enabled)
    .map((config) => config.type);
}

/**
 * Check if payment method requires setup
 */
export function paymentMethodRequiresSetup(method: PaymentMethodType): boolean {
  const config = PAYMENT_METHODS[method];
  return config?.requires_setup || false;
}

/**
 * Get payment method fee percentage
 */
export function getPaymentMethodFeePercentage(method: PaymentMethodType): number {
  const config = PAYMENT_METHODS[method];
  return config?.fee_percentage || 0;
}

/**
 * Calculate fee amount for transaction
 */
export function calculatePaymentMethodFee(
  method: PaymentMethodType,
  transactionAmountCents: number
): number {
  const feePercentage = getPaymentMethodFeePercentage(method);
  return Math.round((transactionAmountCents * feePercentage) / 100);
}

/**
 * Get processing time estimate
 */
export function getProcessingTime(method: PaymentMethodType): string {
  const config = PAYMENT_METHODS[method];
  return config?.processing_time || 'Unknown';
}

/**
 * Format payment method name for display
 */
export function formatPaymentMethodName(method: PaymentMethodType): string {
  const config = PAYMENT_METHODS[method];
  return config?.name || method;
}

/**
 * Format payment method description
 */
export function formatPaymentMethodDescription(method: PaymentMethodType): string {
  const config = PAYMENT_METHODS[method];
  return config?.description || '';
}
