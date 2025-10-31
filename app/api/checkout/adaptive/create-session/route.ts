/**
 * POST /api/checkout/adaptive/create-session
 *
 * Create adaptive checkout session with:
 * - Automatic currency detection from IP address
 * - Region-specific payment method optimization
 * - Device detection (mobile/tablet/desktop)
 * - Dynamic pricing with real-time conversion
 * - Localized checkout UI
 *
 * Features:
 * - Detects user location automatically (IP geolocation)
 * - Selects best payment methods for region
 * - Converts prices to local currency
 * - Optimizes for device type
 * - Handles multiple currencies seamlessly
 *
 * @see https://stripe.com/docs/payments/checkout
 */

import { NextRequest, NextResponse } from 'next/server';
import { AdaptiveCheckoutService } from '@/lib/stripe/services/adaptive-checkout.service';
import { checkRateLimit, standardBillingRateLimit } from '@/lib/rate-limit';
import { isFeatureEnabled } from '@/lib/feature-flags';

/**
 * Request body validation
 */
interface AdaptiveCheckoutRequest {
  price_id: string; // Stripe Price ID (required)
  customer_email: string; // Customer email (required)
  ip_address?: string; // Customer IP (auto-detected if not provided)
  country?: string; // ISO 3166-1 alpha-2 country code
  currency?: string; // Override currency detection
  locale?: string; // Portal locale override
  metadata?: Record<string, string>; // Custom metadata
}

/**
 * POST: Create adaptive checkout session
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Check if adaptive checkout is enabled
    if (!isFeatureEnabled('ADAPTIVE_CHECKOUT_ENABLED')) {
      return NextResponse.json(
        {
          error: 'Feature not available',
          message: 'Adaptive checkout is not enabled',
        },
        { status: 403 }
      );
    }

    // Step 2: Validate request body
    let body: AdaptiveCheckoutRequest;

    try {
      body = (await request.json()) as AdaptiveCheckoutRequest;
    } catch {
      return NextResponse.json(
        {
          error: 'Invalid request',
          message: 'Request body must be valid JSON',
        },
        { status: 400 }
      );
    }

    // Step 3: Validate required fields
    if (!body.price_id || typeof body.price_id !== 'string') {
      return NextResponse.json(
        {
          error: 'Invalid price_id',
          message: 'price_id is required and must be a string',
        },
        { status: 400 }
      );
    }

    if (!body.customer_email || typeof body.customer_email !== 'string') {
      return NextResponse.json(
        {
          error: 'Invalid customer_email',
          message: 'customer_email is required and must be a string',
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(body.customer_email)) {
      return NextResponse.json(
        {
          error: 'Invalid email',
          message: 'customer_email must be a valid email address',
        },
        { status: 400 }
      );
    }

    // Step 4: Rate limiting per email/IP
    const clientIp = body.ip_address ||
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const rateLimitKey = `checkout:${body.customer_email}:${clientIp}`;
    const rateLimitCheck = await checkRateLimit(rateLimitKey, standardBillingRateLimit);

    if (!rateLimitCheck.success) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Please try again later',
          retryAfter: Math.ceil((rateLimitCheck.reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: rateLimitCheck.headers,
        }
      );
    }

    console.log('[API] Creating adaptive checkout:', {
      price_id: body.price_id,
      customer_email: body.customer_email,
      ip_address: clientIp,
      country: body.country,
      currency: body.currency,
    });

    // Step 5: Create adaptive checkout session
    const session = await AdaptiveCheckoutService.createAdaptiveCheckoutSession({
      price_id: body.price_id,
      customer_email: body.customer_email,
      ip_address: body.ip_address || clientIp,
      country: body.country as any,
      currency: body.currency as any,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      enable_currency_auto_detect: true,
      enable_payment_method_optimization: true,
      metadata: body.metadata,
    });

    console.log('[API] Adaptive checkout created:', {
      session_id: session.session_id,
      detected_country: session.adaptive_settings.detected_country,
      detected_currency: session.adaptive_settings.detected_currency,
    });

    // Step 6: Return session details
    return NextResponse.json(
      {
        success: true,
        session: {
          id: session.session_id,
          url: session.checkout_url,
          created_at: new Date().toISOString(),
        },
        adaptive_info: {
          detected_country: session.adaptive_settings.detected_country,
          detected_currency: session.adaptive_settings.detected_currency,
          recommended_payment_methods: session.adaptive_settings.recommended_payment_methods,
          enabled_payment_methods: session.adaptive_settings.enabled_payment_methods,
        },
        pricing: {
          base_amount: session.pricing.base_amount,
          base_currency: session.pricing.base_currency,
          localized_amount: session.pricing.localized_amount,
          localized_currency: session.pricing.localized_currency,
          display: session.pricing.display_prices,
        },
        device_type: session.device_type,
        message: 'Checkout session created with adaptive optimization',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API] Adaptive checkout error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET: Documentation
 */
export async function GET(): Promise<NextResponse> {
  const isEnabled = isFeatureEnabled('ADAPTIVE_CHECKOUT_ENABLED');

  return NextResponse.json({
    name: 'Adaptive Checkout',
    version: '1.0',
    status: isEnabled ? 'available' : 'disabled',
    description: 'Create intelligent checkout sessions with currency detection and payment optimization',
    method: 'POST',
    authentication: 'none (public)',
    request_body: {
      price_id: 'string (required) - Stripe Price ID',
      customer_email: 'string (required) - Customer email',
      ip_address: 'string (optional) - Customer IP (auto-detected if not provided)',
      country: 'string (optional) - ISO 3166-1 alpha-2 country code',
      currency: 'string (optional) - Override currency (USD, EUR, GBP, JPY, AUD, SGD, CAD, INR)',
      locale: 'string (optional) - Portal locale (en, es, fr, de, etc.)',
      metadata: 'object (optional) - Custom metadata to store',
    },
    response: {
      success: 'boolean',
      session: {
        id: 'string - Checkout session ID',
        url: 'string - Checkout URL to redirect to',
        created_at: 'string - ISO timestamp',
      },
      adaptive_info: {
        detected_country: 'string',
        detected_currency: 'string',
        recommended_payment_methods: 'string[]',
        enabled_payment_methods: 'string[]',
      },
      pricing: {
        base_amount: 'number - Original price in cents',
        base_currency: 'string',
        localized_amount: 'number - In cents',
        localized_currency: 'string',
        display: {
          base: 'string - Formatted display price',
          localized: 'string - Formatted localized price',
          total: 'string - Total with any adjustments',
        },
      },
      device_type: 'string - mobile | tablet | desktop',
    },
    features: [
      'Automatic currency detection from IP',
      'Region-specific payment method prioritization',
      'Real-time exchange rate calculation',
      'Device-optimized checkout',
      'Localized checkout UI',
      'Mobile-first design',
    ],
    supported_currencies: [
      'USD (US Dollar)',
      'CAD (Canadian Dollar)',
      'EUR (Euro)',
      'GBP (British Pound)',
      'JPY (Japanese Yen)',
      'AUD (Australian Dollar)',
      'SGD (Singapore Dollar)',
      'INR (Indian Rupee)',
    ],
    payment_methods: [
      'Card (Visa, Mastercard, Amex, Discover)',
      'ACH Direct Debit (US)',
      'SEPA Direct Debit (EU)',
      'iDEAL (Netherlands)',
      'giropay (Germany)',
      'EPS (Austria)',
      'Bancontact (Belgium)',
      'Klarna (Buy Now Pay Later)',
      'Afterpay (Australia)',
      'Alipay (China)',
      'WeChat Pay (China)',
      'PayPay (Japan)',
      'Google Pay',
      'Apple Pay',
    ],
    example_request: {
      method: 'POST',
      url: '/api/checkout/adaptive/create-session',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        price_id: 'price_1234567890',
        customer_email: 'customer@example.com',
        country: 'US', // optional
        currency: 'USD', // optional
      },
    },
    rate_limit: '10 requests per minute per email+IP',
  });
}
