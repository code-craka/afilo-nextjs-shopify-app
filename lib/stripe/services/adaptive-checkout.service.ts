/**
 * Adaptive Checkout Service
 *
 * Provides intelligent checkout optimization based on:
 * - Geographic location (IP geolocation)
 * - Currency detection and localization
 * - Device type and capabilities
 * - Payment method availability
 * - Real-time exchange rates
 *
 * Features:
 * - Automatic currency detection and conversion
 * - Region-specific payment method prioritization
 * - Mobile-optimized checkout
 * - Dynamic pricing with localization
 */

import 'server-only';
import { stripe } from '@/lib/stripe/config/stripe-server-v2';
import { formatStripeAmount, formatDisplayAmount } from '@/lib/stripe/config/stripe-server-v2';
import { CURRENCIES, convertCurrency, getExchangeRate, formatCurrencyAmount } from '@/lib/stripe/config/currencies';
import {
  getPaymentMethodsForCountry,
  getOptimalPaymentMethods,
  isPaymentMethodSupported,
} from '@/lib/stripe/config/payment-methods';
import type {
  CurrencyCode,
  CountryCode,
  PaymentMethodType,
  AdaptiveCheckoutSessionParams,
  AdaptiveCheckoutSession,
  GeoLocation,
  LocalizedPrice,
  CheckoutRecommendations,
  OptimalPaymentMethodsRequest,
  OptimalPaymentMethodsResponse,
  DeviceDetection,
} from '@/lib/stripe/types/adaptive-checkout.types';

/**
 * Adaptive Checkout Service
 */
export class AdaptiveCheckoutService {
  /**
   * Detect user location from IP address
   *
   * In production, integrate with MaxMind GeoIP2 or IP2Location
   * For now, return defaults
   *
   * @param ipAddress - Client IP address
   * @returns Geolocation information
   */
  static async detectLocation(ipAddress?: string): Promise<GeoLocation> {
    try {
      // TODO: Integrate with MaxMind GeoIP2 API
      // For now, return US as default
      console.log('[Adaptive Checkout] Detecting location:', ipAddress);

      return {
        ip_address: ipAddress || '0.0.0.0',
        country_code: 'US',
        country_name: 'United States',
        region: 'US',
        timezone: 'America/Chicago',
        is_vpn: false,
      };
    } catch (error) {
      console.error('[Adaptive Checkout] Location detection failed:', error);

      // Fallback to US
      return {
        ip_address: ipAddress || '0.0.0.0',
        country_code: 'US',
        country_name: 'United States',
        is_vpn: false,
      };
    }
  }

  /**
   * Detect device type from user agent
   *
   * @param userAgent - User Agent string
   * @returns Device information
   */
  static detectDevice(userAgent?: string): DeviceDetection {
    try {
      const ua = userAgent || '';

      // Simplified device detection
      const isTouch = /touch/i.test(ua);
      const isTablet = /tablet|ipad|android/i.test(ua);
      const isMobile = /mobile|android|iphone/i.test(ua);

      const device_type = isMobile && !isTablet ? 'mobile' : isTablet ? 'tablet' : 'desktop';
      const os = /iphone|ipad|ios/i.test(ua)
        ? 'ios'
        : /android/i.test(ua)
          ? 'android'
          : /windows/i.test(ua)
            ? 'windows'
            : /mac/i.test(ua)
              ? 'macos'
              : 'linux';

      let browser = 'unknown';

      if (/chrome/i.test(ua) && !/edge|chromium/i.test(ua)) browser = 'Chrome';
      else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
      else if (/firefox/i.test(ua)) browser = 'Firefox';
      else if (/edge|edg/i.test(ua)) browser = 'Edge';

      return {
        device_type,
        os: os as any,
        browser,
        screen_size: device_type === 'mobile' ? 'small' : device_type === 'tablet' ? 'medium' : 'large',
        is_touch_capable: isTouch || isMobile,
        recommended_payment_method: device_type === 'mobile' ? 'google_pay' : undefined,
        recommended_layout: device_type === 'mobile' ? 'vertical' : 'horizontal',
      };
    } catch (error) {
      console.error('[Adaptive Checkout] Device detection failed:', error);

      return {
        device_type: 'desktop',
        os: 'windows',
        browser: 'unknown',
        screen_size: 'large',
        is_touch_capable: false,
        recommended_layout: 'horizontal',
      };
    }
  }

  /**
   * Get checkout recommendations based on user context
   *
   * @param country - Country code
   * @param currency - Currency code
   * @param device - Device information
   * @returns Checkout recommendations
   */
  static getCheckoutRecommendations(
    country: CountryCode,
    currency: CurrencyCode,
    device?: DeviceDetection
  ): CheckoutRecommendations {
    try {
      const paymentMethods = getOptimalPaymentMethods(country, 0, undefined, 5);

      return {
        recommended_currency: currency,
        recommended_payment_methods: paymentMethods,
        reasoning: {
          location: `Optimized for ${country}`,
          device: device ? `${device.device_type} (${device.os})` : 'desktop',
        },
        locale: this.getLocale(country),
        decimal_format: this.getDecimalFormat(currency),
      };
    } catch (error) {
      console.error('[Adaptive Checkout] Failed to get recommendations:', error);

      return {
        recommended_currency: currency,
        recommended_payment_methods: ['card'],
        reasoning: {},
        locale: 'en',
        decimal_format: 'en-US',
      };
    }
  }

  /**
   * Get locale for country
   *
   * @param country - Country code
   * @returns Locale string (e.g., 'en-US', 'de-DE')
   */
  private static getLocale(country: CountryCode): string {
    const localeMap: Record<CountryCode, string> = {
      US: 'en-US',
      CA: 'en-CA',
      GB: 'en-GB',
      DE: 'de-DE',
      FR: 'fr-FR',
      IT: 'it-IT',
      ES: 'es-ES',
      NL: 'nl-NL',
      BE: 'nl-BE',
      AT: 'de-AT',
      CH: 'de-CH',
      SE: 'sv-SE',
      NO: 'no-NO',
      DK: 'da-DK',
      FI: 'fi-FI',
      PL: 'pl-PL',
      IE: 'en-IE',
      LU: 'fr-LU',
      MT: 'en-MT',
      PT: 'pt-PT',
      SI: 'sl-SI',
      SK: 'sk-SK',
      JP: 'ja-JP',
      CN: 'zh-CN',
      IN: 'en-IN',
      AU: 'en-AU',
      SG: 'en-SG',
      HK: 'zh-HK',
      KR: 'ko-KR',
      TH: 'th-TH',
      MY: 'ms-MY',
      PH: 'en-PH',
      VN: 'vi-VN',
      ID: 'id-ID',
    };

    return localeMap[country] || 'en-US';
  }

  /**
   * Get decimal format for currency
   *
   * @param currency - Currency code
   * @returns Decimal format string
   */
  private static getDecimalFormat(currency: CurrencyCode): string {
    const formatMap: Record<CurrencyCode, string> = {
      USD: 'en-US',
      CAD: 'en-CA',
      EUR: 'de-DE',
      GBP: 'en-GB',
      JPY: 'ja-JP',
      AUD: 'en-AU',
      SGD: 'en-SG',
      INR: 'en-IN',
    };

    return formatMap[currency] || 'en-US';
  }

  /**
   * Calculate localized price
   *
   * @param basePriceCents - Base price in cents (USD)
   * @param fromCurrency - Source currency
   * @param toCurrency - Target currency
   * @returns Localized price information
   */
  static calculateLocalizedPrice(
    basePriceCents: number,
    fromCurrency: CurrencyCode = 'USD',
    toCurrency: CurrencyCode = 'USD'
  ): LocalizedPrice {
    try {
      const rate = getExchangeRate(fromCurrency, toCurrency);
      const convertedCents = Math.round((basePriceCents / 100) * rate * 100);

      return {
        base_price: basePriceCents,
        base_currency: fromCurrency,
        converted_price: convertedCents,
        converted_currency: toCurrency,
        exchange_rate: rate,
        exchange_rate_timestamp: new Date(),
        display_price: formatCurrencyAmount(convertedCents, toCurrency),
        display_base_price: formatCurrencyAmount(basePriceCents, fromCurrency),
        stripe_amount: convertedCents,
      };
    } catch (error) {
      console.error('[Adaptive Checkout] Price calculation failed:', error);

      // Fallback: no conversion
      return {
        base_price: basePriceCents,
        base_currency: fromCurrency,
        converted_price: basePriceCents,
        converted_currency: fromCurrency,
        exchange_rate: 1.0,
        exchange_rate_timestamp: new Date(),
        display_price: formatCurrencyAmount(basePriceCents, fromCurrency),
        display_base_price: formatCurrencyAmount(basePriceCents, fromCurrency),
        stripe_amount: basePriceCents,
      };
    }
  }

  /**
   * Create adaptive checkout session
   *
   * @param params - Checkout parameters
   * @returns Checkout session with adaptive optimizations
   */
  static async createAdaptiveCheckoutSession(
    params: AdaptiveCheckoutSessionParams
  ): Promise<AdaptiveCheckoutSession> {
    try {
      console.log('[Adaptive Checkout] Creating adaptive session:', {
        price_id: params.price_id,
        customer_email: params.customer_email,
      });

      // Step 1: Detect location
      const location = await this.detectLocation(params.ip_address);
      const detectedCountry = params.country || location.country_code;

      // Step 2: Detect device
      const device = this.detectDevice();

      // Step 3: Determine currency
      const detectedCurrency = params.currency ||
        (CURRENCIES[location.country_code as CurrencyCode] ? location.country_code as CurrencyCode : 'USD');

      // Step 4: Get payment methods
      const recommendedMethods = getOptimalPaymentMethods(detectedCountry, 0, undefined, 5);

      // Apply restrictions if provided
      let enabledMethods = recommendedMethods;

      if (params.allowed_payment_methods) {
        enabledMethods = enabledMethods.filter((m) => params.allowed_payment_methods!.includes(m));
      }

      if (params.disallowed_payment_methods) {
        enabledMethods = enabledMethods.filter((m) => !params.disallowed_payment_methods!.includes(m));
      }

      // Ensure at least card is available
      if (!enabledMethods.includes('card')) {
        enabledMethods.unshift('card');
      }

      // Step 5: Get price details
      const price = await stripe.prices.retrieve(params.price_id, {
        expand: ['product'],
      });

      const basePriceCents = price.unit_amount || 0;

      // Step 6: Calculate localized price
      const localizedPrice = this.calculateLocalizedPrice(basePriceCents, 'USD', detectedCurrency);

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        mode: price.recurring ? 'subscription' : 'payment',
        customer_email: params.customer_email,
        line_items: [
          {
            price: params.price_id,
            quantity: 1,
          },
        ],
        success_url: params.success_url,
        cancel_url: params.cancel_url,
        payment_method_types: enabledMethods as any[],
        // TODO: locale parameter - Stripe SDK may require specific Locale type
        // locale: this.getLocale(detectedCountry),
        metadata: {
          ...params.metadata,
          detected_country: detectedCountry,
          detected_currency: detectedCurrency,
          device_type: device.device_type,
          requested_locale: this.getLocale(detectedCountry),
        },
      });

      console.log('[Adaptive Checkout] Session created:', session.id);

      return {
        session_id: session.id,
        checkout_url: session.url!,
        adaptive_settings: {
          detected_country: detectedCountry,
          detected_currency: detectedCurrency,
          selected_currency: detectedCurrency,
          recommended_payment_methods: recommendedMethods,
          enabled_payment_methods: enabledMethods,
        },
        pricing: {
          base_amount: basePriceCents,
          base_currency: 'USD',
          localized_amount: localizedPrice.converted_price,
          localized_currency: detectedCurrency,
          total_amount: localizedPrice.converted_price,
          display_prices: {
            base: formatCurrencyAmount(basePriceCents, 'USD'),
            localized: formatCurrencyAmount(localizedPrice.converted_price, detectedCurrency),
            total: formatCurrencyAmount(localizedPrice.converted_price, detectedCurrency),
          },
        },
        device_type: device.device_type,
      };
    } catch (error) {
      console.error('[Adaptive Checkout] Failed to create session:', error);

      throw new Error(
        `Failed to create adaptive checkout session: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Get optimal payment methods for transaction
   *
   * @param request - Request parameters
   * @returns Optimized payment methods with scores
   */
  static async getOptimalPaymentMethods(
    request: OptimalPaymentMethodsRequest
  ): Promise<OptimalPaymentMethodsResponse> {
    try {
      const country = request.country || 'US';
      const currency = request.currency || 'USD';

      // Get available methods for country
      const methods = getPaymentMethodsForCountry(country);

      // Score and sort methods
      const scored = methods
        .map((method) => ({
          method,
          score: this.calculatePaymentMethodScore(method, request.transaction_amount, country),
        }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score);

      const response: OptimalPaymentMethodsResponse = {
        country,
        currency,
        methods: scored.slice(0, 5).map((item) => ({
          type: item.method,
          name: this.getPaymentMethodName(item.method),
          description: this.getPaymentMethodDescription(item.method),
          optimization_score: item.score,
          processing_time: this.getProcessingTime(item.method),
          reason: `Optimized for ${country} (${currency})`,
        })),
        primary_method: scored[0]?.method || 'card',
      };

      return response;
    } catch (error) {
      console.error('[Adaptive Checkout] Failed to get optimal methods:', error);

      throw new Error(
        `Failed to get optimal payment methods: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Calculate payment method score
   *
   * @param method - Payment method type
   * @param transactionAmount - Amount in cents
   * @param country - Country code
   * @returns Score (0-100)
   */
  private static calculatePaymentMethodScore(
    method: PaymentMethodType,
    transactionAmount: number,
    country: CountryCode
  ): number {
    let score = 70; // Base score

    // Check if supported
    if (!isPaymentMethodSupported(method, country)) {
      return 0;
    }

    // Boost common methods
    if (method === 'card') score += 20;
    if (method === 'google_pay' || method === 'apple_pay') score += 15;

    // Boost local methods
    const localMethods = getPaymentMethodsForCountry(country);

    if (localMethods.includes(method)) {
      score += 10;
    }

    return Math.min(100, score);
  }

  /**
   * Get payment method display name
   *
   * @param method - Method type
   * @returns Display name
   */
  private static getPaymentMethodName(method: PaymentMethodType): string {
    const names: Record<PaymentMethodType, string> = {
      card: 'Credit or Debit Card',
      us_bank_account: 'ACH Direct Debit',
      sepa_debit: 'SEPA Direct Debit',
      ideal: 'iDEAL',
      giropay: 'giropay',
      eps: 'EPS',
      bancontact: 'Bancontact',
      klarna: 'Klarna',
      afterpay: 'Afterpay',
      alipay: 'Alipay',
      wechat_pay: 'WeChat Pay',
      paypay: 'PayPay',
      google_pay: 'Google Pay',
      apple_pay: 'Apple Pay',
    };

    return names[method] || method;
  }

  /**
   * Get payment method description
   *
   * @param method - Method type
   * @returns Description
   */
  private static getPaymentMethodDescription(method: PaymentMethodType): string {
    const descriptions: Record<PaymentMethodType, string> = {
      card: 'Visa, Mastercard, American Express, Discover',
      us_bank_account: 'Bank account transfer (3-5 days)',
      sepa_debit: 'Bank account transfer (1-3 days)',
      ideal: 'Netherlands bank transfer',
      giropay: 'German online banking',
      eps: 'Austrian online banking',
      bancontact: 'Belgian online banking',
      klarna: 'Buy now, pay later',
      afterpay: 'Pay in 4 installments',
      alipay: 'Chinese digital wallet',
      wechat_pay: 'Chinese mobile payment',
      paypay: 'Japanese mobile payment',
      google_pay: 'Google digital wallet',
      apple_pay: 'Apple digital wallet',
    };

    return descriptions[method] || '';
  }

  /**
   * Get processing time
   *
   * @param method - Method type
   * @returns Processing time estimate
   */
  private static getProcessingTime(method: PaymentMethodType): string {
    const times: Record<PaymentMethodType, string> = {
      card: 'Instant',
      us_bank_account: '3-5 business days',
      sepa_debit: '1-3 days',
      ideal: 'Instant',
      giropay: 'Instant',
      eps: 'Instant',
      bancontact: 'Instant',
      klarna: 'Instant',
      afterpay: 'Instant',
      alipay: 'Instant',
      wechat_pay: 'Instant',
      paypay: 'Instant',
      google_pay: 'Instant',
      apple_pay: 'Instant',
    };

    return times[method] || 'Unknown';
  }
}

/**
 * Export singleton instance
 */
export const adaptiveCheckoutService = AdaptiveCheckoutService;
