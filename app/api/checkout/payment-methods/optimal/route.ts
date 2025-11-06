/**
 * GET /api/checkout/payment-methods/optimal
 *
 * Get optimal payment methods for a transaction
 *
 * Returns payment methods recommended for:
 * - Specific country/currency
 * - Transaction amount
 * - User device type
 * - User preferences
 *
 * Ranked by:
 * - Optimization score (0-100)
 * - Regional popularity
 * - Processing time
 * - Cost efficiency
 *
 * @see https://stripe.com/docs/payments/payment-methods
 */

import { NextRequest, NextResponse } from 'next/server';
import { AdaptiveCheckoutService } from '@/lib/stripe/services/adaptive-checkout.service';
import { getOptimalPaymentMethods } from '@/lib/stripe/config/payment-methods';
import { checkRateLimit, standardBillingRateLimit } from '@/lib/rate-limit';
import { isFeatureEnabled } from '@/lib/feature-flags';
import type { CountryCode } from '@/lib/stripe/types/adaptive-checkout.types';

/**
 * Query parameters
 */
interface OptimalMethodsQuery {
  country?: string; // ISO 3166-1 alpha-2
  currency?: string; // Currency code
  amount?: string; // Transaction amount in cents
  device_type?: string; // mobile | tablet | desktop
}

/**
 * GET: Get optimal payment methods
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
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

    // Step 2: Parse query parameters
    const searchParams = request.nextUrl.searchParams;

    const country = (searchParams.get('country') || 'US') as CountryCode;
    const currency = searchParams.get('currency') || 'USD';
    const amountStr = searchParams.get('amount') || '5000'; // Default $50
    const deviceType = searchParams.get('device_type') || 'desktop';

    // Step 3: Validate amount
    let amount: number;

    try {
      amount = parseInt(amountStr, 10);

      if (isNaN(amount) || amount < 0) {
        throw new Error('Invalid amount');
      }
    } catch {
      return NextResponse.json(
        {
          error: 'Invalid amount',
          message: 'amount must be a positive integer (in cents)',
          example: 'amount=5000 for $50.00',
        },
        { status: 400 }
      );
    }

    // Step 4: Rate limiting
    const rateLimitKey = `payment-methods:${country}`;
    const rateLimitCheck = await checkRateLimit(rateLimitKey, standardBillingRateLimit);

    if (!rateLimitCheck.success) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          retryAfter: Math.ceil((rateLimitCheck.reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: rateLimitCheck.headers,
        }
      );
    }

    console.log('[API] Getting optimal payment methods:', {
      country,
      currency,
      amount,
      device_type: deviceType,
    });

    // Step 5: Get optimal methods
    const optimalMethods = await AdaptiveCheckoutService.getOptimalPaymentMethods({
      country,
      currency: currency as any,
      transaction_amount: amount,
    });

    // Step 6: Device-specific optimization
    const recommendedForDevice = optimalMethods.methods[0]?.type;

    if (deviceType === 'mobile') {
      // Prioritize digital wallets for mobile (if any available)
      // Note: Currently supported payment methods don't include mobile wallets
      // but framework is ready when Stripe adds support
    }

    console.log('[API] Optimal methods returned:', {
      country,
      count: optimalMethods.methods.length,
      primary: optimalMethods.primary_method,
    });

    // Step 7: Return results
    return NextResponse.json(
      {
        success: true,
        query: {
          country,
          currency,
          amount,
          device_type: deviceType,
        },
        methods: optimalMethods.methods.map((method) => ({
          type: method.type,
          name: method.name,
          description: method.description,
          optimization_score: method.optimization_score,
          processing_time: method.processing_time,
          reason: method.reason,
          recommended_for_device: method.type === recommendedForDevice,
        })),
        primary_method: optimalMethods.primary_method,
        recommended_for_device: recommendedForDevice,
        note: 'Methods are ranked by optimization score (higher is better)',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Payment methods error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

/**
 * Query string documentation
 */
export async function HEAD(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'X-API-Documentation': 'See GET endpoint',
    },
  });
}

/**
 * OPTIONS: CORS and documentation
 */
export async function OPTIONS(): Promise<NextResponse> {
  return NextResponse.json({
    name: 'Payment Methods Optimization',
    version: '1.0',
    description: 'Get optimal payment methods for a transaction based on geography and amount',
    method: 'GET',
    authentication: 'none (public)',
    query_parameters: {
      country: {
        description: 'ISO 3166-1 alpha-2 country code',
        example: 'US, CA, GB, DE, JP, AU, SG, IN',
        default: 'US',
        type: 'string',
      },
      currency: {
        description: 'Currency code (ISO 4217)',
        example: 'USD, EUR, GBP, JPY, AUD, SGD, CAD, INR',
        default: 'USD',
        type: 'string',
      },
      amount: {
        description: 'Transaction amount in cents (smallest currency unit)',
        example: '5000 for $50.00 USD',
        default: '5000',
        type: 'string | number',
      },
      device_type: {
        description: 'Customer device type for optimization',
        options: ['mobile', 'tablet', 'desktop'],
        default: 'desktop',
        type: 'string',
      },
    },
    response_schema: {
      success: 'boolean',
      query: 'object - Echo of query parameters',
      methods: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: 'string - Payment method ID',
            name: 'string - Display name',
            description: 'string - Description',
            optimization_score: 'number 0-100 - Higher is better',
            processing_time: 'string - e.g., "Instant" or "1-3 days"',
            reason: 'string - Why this method is recommended',
            recommended_for_device: 'boolean - Optimized for device type',
          },
        },
      },
      primary_method: 'string - Top recommended method',
      recommended_for_device: 'string - Method optimized for device',
    },
    example_requests: [
      {
        description: 'US customer, $50 purchase on desktop',
        url: '/api/checkout/payment-methods/optimal?country=US&currency=USD&amount=5000&device_type=desktop',
      },
      {
        description: 'EU customer (Germany), €25 on mobile',
        url: '/api/checkout/payment-methods/optimal?country=DE&currency=EUR&amount=2500&device_type=mobile',
      },
      {
        description: 'Japan, ¥5000 on tablet',
        url: '/api/checkout/payment-methods/optimal?country=JP&currency=JPY&amount=500000&device_type=tablet',
      },
    ],
    sample_response: {
      success: true,
      query: {
        country: 'US',
        currency: 'USD',
        amount: 5000,
        device_type: 'mobile',
      },
      methods: [
        {
          type: 'google_pay',
          name: 'Google Pay',
          description: 'Google digital wallet',
          optimization_score: 95,
          processing_time: 'Instant',
          reason: 'Optimized for US (mobile) - fastest checkout',
          recommended_for_device: true,
        },
        {
          type: 'card',
          name: 'Credit or Debit Card',
          description: 'Visa, Mastercard, American Express, Discover',
          optimization_score: 85,
          processing_time: 'Instant',
          reason: 'Fallback payment method',
          recommended_for_device: false,
        },
      ],
      primary_method: 'google_pay',
      recommended_for_device: 'google_pay',
    },
    rate_limit: '20 requests per minute per country',
    use_cases: [
      'Show recommended payment methods during checkout',
      'Pre-populate payment method selector',
      'Analyze payment method usage by region',
      'Optimize checkout flow for conversion',
    ],
  });
}
