/**
 * Adaptive Checkout Type Definitions
 *
 * Supports dynamic payment method selection, currency localization,
 * and geographic-based checkout optimization.
 *
 * Features:
 * - Automatic currency detection from IP address
 * - Region-specific payment method prioritization
 * - Localized pricing with real-time conversion
 * - Mobile-optimized checkout UI
 */

export type CurrencyCode = 'USD' | 'CAD' | 'EUR' | 'GBP' | 'JPY' | 'AUD' | 'SGD' | 'INR';

/**
 * Country Code (ISO 3166-1 alpha-2)
 */
export type CountryCode =
  | 'US' | 'CA' // North America
  | 'GB' | 'DE' | 'FR' | 'IT' | 'ES' | 'NL' | 'BE' | 'AT' | 'CH' | 'SE' | 'NO' | 'DK' | 'FI' | 'PL' | 'IE' | 'LU' | 'MT' | 'PT' | 'SI' | 'SK' // Europe
  | 'JP' | 'CN' | 'IN' | 'AU' | 'SG' | 'HK' | 'KR' | 'TH' | 'MY' | 'PH' | 'VN' | 'ID'; // Asia-Pacific

/**
 * Payment Method Type
 */
export type PaymentMethodType =
  | 'card' // Credit/Debit cards (Visa, MC, Amex, Discover)
  | 'us_bank_account' // ACH Direct Debit (US only)
  | 'sepa_debit' // SEPA Direct Debit (EU only)
  | 'ideal' // iDEAL (Netherlands)
  | 'giropay' // giropay (Germany)
  | 'eps' // EPS (Austria)
  | 'bancontact' // Bancontact (Belgium)
  | 'klarna' // Klarna (Buy now, pay later)
  | 'afterpay' // Afterpay (Australia, NZ)
  | 'alipay' // Alipay (China, Asia)
  | 'wechat_pay' // WeChat Pay (China)
  | 'paypay' // PayPay (Japan)
  | 'google_pay' // Google Pay (Digital wallet)
  | 'apple_pay'; // Apple Pay (Digital wallet)

/**
 * Currency Configuration
 */
export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string; // $, €, £, ¥, etc.
  name: string; // "US Dollar", "Euro", etc.
  symbol_native: string;
  decimal_places: number; // 2 for most, 0 for JPY
  decimal_separator: string;
  thousands_separator: string;
  // Stripe settings
  stripe_code: string; // lowercase: usd, eur, etc.
  // Exchange rate to USD (updated regularly)
  exchange_rate_to_usd?: number;
  // Countries using this currency
  countries: CountryCode[];
}

/**
 * Country Configuration
 * Maps country to currency, preferred payment methods, region
 */
export interface CountryConfig {
  code: CountryCode;
  name: string;
  currency: CurrencyCode;
  region: 'north_america' | 'europe' | 'asia_pacific';
  // Payment methods prioritized for this country (in order)
  preferred_payment_methods: PaymentMethodType[];
  // Regions requiring specific handling
  requires_tax_id?: boolean; // VAT, GST, etc.
  requires_billing_address?: boolean;
  // Payment method fees (percentage) - for pricing adjustments
  payment_method_fees?: Record<PaymentMethodType, number>;
  // Stripe-specific settings
  stripe_restrictions?: string[];
}

/**
 * Payment Method Configuration
 * Details about supporting a specific payment method
 */
export interface PaymentMethodConfig {
  type: PaymentMethodType;
  name: string; // "Credit Card", "SEPA Direct Debit", etc.
  description: string;
  // Which countries support this method
  supported_countries: CountryCode[];
  // Payment processing time
  processing_time: string; // "instant", "1-3 days", etc.
  // Setup required on first use
  requires_setup?: boolean;
  // Fees (percentage of transaction)
  fee_percentage: number;
  // Minimum transaction amount
  minimum_amount?: number;
  // Maximum transaction amount
  maximum_amount?: number;
  // Icon/image URL
  icon_url?: string;
  // Whether it's enabled globally
  enabled: boolean;
}

/**
 * Geolocation result from IP address
 */
export interface GeoLocation {
  ip_address: string;
  country_code: CountryCode;
  country_name: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  is_vpn?: boolean; // Flag suspicious IPs
}

/**
 * Adaptive Checkout Recommendations
 * Based on user location, device, etc.
 */
export interface CheckoutRecommendations {
  // Recommended currency for this location
  recommended_currency: CurrencyCode;
  // Recommended payment methods (in priority order)
  recommended_payment_methods: PaymentMethodType[];
  // Reason for recommendations
  reasoning: {
    location?: string;
    device?: string;
    user_history?: string;
  };
  // Localization
  locale: string; // en-US, de-DE, ja-JP, etc.
  decimal_format: string; // How to format decimal amounts
}

/**
 * Localized Price
 * Shows product price in multiple currencies
 */
export interface LocalizedPrice {
  // Original price
  base_price: number; // In cents
  base_currency: CurrencyCode;
  // Converted price
  converted_price: number; // In cents
  converted_currency: CurrencyCode;
  // Conversion details
  exchange_rate: number;
  exchange_rate_timestamp: Date;
  // Display formatting
  display_price: string; // Formatted with symbol and decimal
  display_base_price: string; // Base price formatted
  // Stripe amounts
  stripe_amount: number; // In smallest currency unit (cents for most, no decimal for JPY)
}

/**
 * Checkout Session Configuration
 * Enhanced with adaptive features
 */
export interface AdaptiveCheckoutSessionParams {
  // Required
  price_id: string;
  customer_email: string;

  // Geographic/Adaptive settings
  ip_address?: string; // Auto-detect if not provided
  country?: CountryCode; // Override auto-detection
  currency?: CurrencyCode; // Override auto-detection
  locale?: string; // Override auto-detection

  // Adaptive behavior
  enable_currency_auto_detect?: boolean; // Default: true
  enable_payment_method_optimization?: boolean; // Default: true

  // Payment method restrictions
  allowed_payment_methods?: PaymentMethodType[];
  disallowed_payment_methods?: PaymentMethodType[];

  // Pricing adjustments
  apply_currency_conversion?: boolean; // Apply real-time rates
  apply_payment_method_fees?: boolean; // Add method-specific fees
  apply_regional_discounts?: boolean; // Regional promotions

  // Success/Cancel URLs
  success_url: string;
  cancel_url: string;

  // Subscription-specific
  is_subscription?: boolean;
  subscription_interval?: 'month' | 'year';

  // Custom metadata
  metadata?: Record<string, string>;
}

/**
 * Adaptive Checkout Session Response
 */
export interface AdaptiveCheckoutSession {
  session_id: string;
  checkout_url: string;
  // Adaptive info used
  adaptive_settings: {
    detected_country: CountryCode;
    detected_currency: CurrencyCode;
    selected_currency: CurrencyCode;
    recommended_payment_methods: PaymentMethodType[];
    enabled_payment_methods: PaymentMethodType[];
  };
  // Pricing
  pricing: {
    base_amount: number; // Original price in cents
    base_currency: CurrencyCode;
    localized_amount: number; // In selected currency, in cents
    localized_currency: CurrencyCode;
    total_amount: number; // After fees/adjustments
    fees?: {
      currency_conversion_fee?: number;
      payment_method_fee?: number;
    };
    display_prices: {
      base: string;
      localized: string;
      total: string;
    };
  };
  // Device detection
  device_type: 'desktop' | 'tablet' | 'mobile';
  user_agent?: string;
}

/**
 * Payment Method Optimization Request
 */
export interface OptimalPaymentMethodsRequest {
  country?: CountryCode;
  currency?: CurrencyCode;
  customer_email?: string;
  transaction_amount: number; // In cents
  // Filter by user preferences
  user_preferred_methods?: PaymentMethodType[];
  // Restrictions
  exclude_methods?: PaymentMethodType[];
}

/**
 * Payment Method Optimization Response
 */
export interface OptimalPaymentMethodsResponse {
  country: CountryCode;
  currency: CurrencyCode;
  // Sorted by optimization score (highest first)
  methods: Array<{
    type: PaymentMethodType;
    name: string;
    description: string;
    optimization_score: number; // 0-100
    processing_time: string;
    // Cost to customer (if applicable)
    fee?: {
      amount: number; // In cents
      percentage: number;
      total_with_fee: number; // Transaction amount + fee
    };
    icon_url?: string;
    // Why this method is recommended
    reason: string;
  }>;
  // Top recommendation
  primary_method: PaymentMethodType;
}

/**
 * Device Detection Result
 */
export interface DeviceDetection {
  device_type: 'mobile' | 'tablet' | 'desktop';
  os: 'ios' | 'android' | 'windows' | 'macos' | 'linux';
  browser: string; // Chrome, Safari, etc.
  screen_size: 'small' | 'medium' | 'large';
  is_touch_capable: boolean;
  // Optimization hints
  recommended_payment_method?: PaymentMethodType; // Optimized for device
  recommended_layout: 'vertical' | 'horizontal';
}

/**
 * Checkout Optimization Metadata
 * Tracks what optimizations were applied
 */
export interface CheckoutOptimizationMetadata {
  // Detected attributes
  detected_country: CountryCode;
  detected_currency: CurrencyCode;
  detected_device: DeviceDetection;
  // Applied optimizations
  optimizations_applied: string[]; // e.g., ["currency_auto_detect", "payment_method_optimization"]
  // Alternative options available
  alternatives?: {
    currencies_available: CurrencyCode[];
    payment_methods_available: PaymentMethodType[];
  };
  // Timestamp for tracking
  generated_at: Date;
}

/**
 * Currency Conversion Request
 * For converting prices between currencies in real-time
 */
export interface CurrencyConversionRequest {
  amount: number; // In cents
  from_currency: CurrencyCode;
  to_currency: CurrencyCode;
  use_stripe_rates?: boolean; // Use Stripe's exchange rates (default) vs external source
}

/**
 * Currency Conversion Response
 */
export interface CurrencyConversionResponse {
  original_amount: number;
  original_currency: CurrencyCode;
  converted_amount: number;
  converted_currency: CurrencyCode;
  exchange_rate: number;
  rate_timestamp: Date;
  // Fee information
  conversion_fee?: number; // In converted currency
  fee_percentage?: number;
  total_amount: number; // Amount + fee
  // Display formatting
  display_original: string;
  display_converted: string;
}

/**
 * Pricing Strategy
 * Controls how pricing is calculated for different regions/payment methods
 */
export type PricingStrategy = 'flat' | 'regional_tiered' | 'payment_method_adjusted' | 'dynamic';

/**
 * Regional Pricing
 * Allows different prices for different regions
 */
export interface RegionalPricing {
  base_price: number; // In USD cents
  regions: {
    [key in string]: {
      currency: CurrencyCode;
      price: number; // In regional currency cents
      markup_percentage?: number; // Mark up from base price
    };
  };
  strategy: PricingStrategy;
}

/**
 * Feature Flag Configuration
 * Controls which adaptive features are enabled
 */
export interface AdaptiveCheckoutFeatureFlags {
  enabled: boolean;
  auto_currency_detection: boolean;
  payment_method_optimization: boolean;
  device_optimization: boolean;
  regional_pricing: boolean;
  multi_currency_display: boolean;
  // A/B testing
  ab_test?: {
    enabled: boolean;
    variant: 'control' | 'treatment';
  };
}
