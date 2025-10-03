import { NextRequest, NextResponse } from 'next/server';
import { stripe, getProductTier, RISK_THRESHOLDS, formatDisplayAmount } from '@/lib/stripe-server';

/**
 * POST /api/stripe/create-payment-intent
 *
 * Creates a Stripe PaymentIntent with adaptive 3D Secure and ACH support.
 *
 * Features:
 * - Automatic payment methods (Card + ACH)
 * - Adaptive 3DS (only when required)
 * - Radar metadata for fraud prevention
 * - Risk-based thresholds per product tier
 * - Enterprise-grade validation
 *
 * Request Body:
 * - amount: number (in cents, minimum 50)
 * - currency: string (default: 'usd')
 * - customerEmail: string (optional, for receipts)
 * - productName: string (for metadata)
 * - productId: string (for tracking)
 *
 * Response:
 * - clientSecret: string (for Payment Element)
 * - paymentIntentId: string (for tracking)
 * - amount: number
 * - tier: string (product value tier)
 *
 * @see https://stripe.com/docs/api/payment_intents
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const {
      amount,
      currency = 'usd',
      customerEmail,
      productName,
      productId,
    } = body;

    // Validation: Amount
    if (!amount || typeof amount !== 'number') {
      return NextResponse.json(
        { error: 'Amount is required and must be a number.' },
        { status: 400 }
      );
    }

    if (amount < 50) {
      return NextResponse.json(
        {
          error: 'Invalid amount. Minimum payment is $0.50 (50 cents).',
          minimumAmount: 50,
        },
        { status: 400 }
      );
    }

    // Maximum amount check (prevent accidental large payments)
    const MAX_AMOUNT = 10000000; // $100,000
    if (amount > MAX_AMOUNT) {
      return NextResponse.json(
        {
          error: `Amount exceeds maximum limit of ${formatDisplayAmount(MAX_AMOUNT)}.`,
          maximumAmount: MAX_AMOUNT,
        },
        { status: 400 }
      );
    }

    // Validation: Currency
    const supportedCurrencies = ['usd'];
    if (!supportedCurrencies.includes(currency.toLowerCase())) {
      return NextResponse.json(
        {
          error: `Currency '${currency}' is not supported. Supported currencies: ${supportedCurrencies.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Determine product tier and risk thresholds
    const tier = getProductTier(amount);
    const thresholds = RISK_THRESHOLDS[tier];

    // Optional: Get user ID from authentication (Clerk)
    // const userId = request.headers.get('x-user-id');

    // Create PaymentIntent with adaptive 3DS
    const paymentIntent = await stripe.paymentIntents.create({
      // Amount and currency
      amount,
      currency: currency.toLowerCase(),

      // ADAPTIVE 3DS: Stripe automatically handles 3DS when required
      // This configuration allows redirects for 3DS but doesn't force it
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'always', // Allow 3DS redirects when needed
      },

      // Alternative: Explicit payment methods (if you want more control)
      // payment_method_types: ['card', 'us_bank_account'],

      // Capture method (automatic for both card and ACH)
      capture_method: 'automatic',

      // Confirmation method (manual - client confirms)
      confirmation_method: 'manual',

      // Receipt email (optional)
      ...(customerEmail && {
        receipt_email: customerEmail,
      }),

      // Metadata for Radar and tracking
      metadata: {
        // Product information
        product_id: productId || 'unknown',
        product_name: productName || 'Digital Product',
        product_tier: tier,

        // Risk thresholds
        risk_threshold_review: thresholds.review.toString(),
        risk_threshold_block: thresholds.block.toString(),

        // Customer information
        customer_email: customerEmail || 'guest',

        // Integration tracking
        integration_version: '2.0',
        integration_name: 'Afilo Enterprise Marketplace',
        timestamp: new Date().toISOString(),

        // Optional: Order tracking
        // order_id: orderId,
        // user_id: userId,
      },

      // Description (appears on credit card statements)
      description: productName
        ? `${productName} - Afilo Enterprise`
        : 'Afilo Enterprise Software License',

      // Statement descriptor (max 22 characters)
      statement_descriptor: 'AFILO SOFTWARE',

      // Expand related objects for additional data
      expand: ['latest_charge', 'latest_charge.balance_transaction'],
    });

    // Log creation (useful for debugging)
    console.log('PaymentIntent created:', {
      id: paymentIntent.id,
      amount: formatDisplayAmount(amount),
      tier,
      thresholds,
      customerEmail: customerEmail || 'none',
    });

    // Return client secret and metadata
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount,
      currency,
      tier,
      thresholds,
    });

  } catch (error: any) {
    // Stripe API errors
    if (error.type === 'StripeCardError') {
      console.error('Stripe card error:', error);
      return NextResponse.json(
        {
          error: error.message || 'Card error occurred.',
          code: error.code,
        },
        { status: 400 }
      );
    }

    if (error.type === 'StripeInvalidRequestError') {
      console.error('Stripe invalid request:', error);
      return NextResponse.json(
        {
          error: error.message || 'Invalid payment request.',
          code: error.code,
        },
        { status: 400 }
      );
    }

    if (error.type === 'StripeAPIError') {
      console.error('Stripe API error:', error);
      return NextResponse.json(
        {
          error: 'Payment service temporarily unavailable. Please try again.',
        },
        { status: 503 }
      );
    }

    // Generic error
    console.error('Error creating PaymentIntent:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to create payment intent.',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/stripe/create-payment-intent
 *
 * Returns API documentation and health check.
 */
export async function GET() {
  return NextResponse.json({
    name: 'Stripe Payment Intent API',
    version: '2.0',
    description: 'Creates PaymentIntents with adaptive 3DS and ACH support',
    features: [
      'Automatic payment methods (Card + ACH)',
      'Adaptive 3D Secure (only when required)',
      'Stripe Radar fraud prevention',
      'Risk-based thresholds per product tier',
      'Enterprise-grade validation',
    ],
    endpoints: {
      create: {
        method: 'POST',
        path: '/api/stripe/create-payment-intent',
        body: {
          amount: 'number (in cents, min 50)',
          currency: 'string (default: usd)',
          customerEmail: 'string (optional)',
          productName: 'string',
          productId: 'string',
        },
      },
    },
    supportedPaymentMethods: ['card', 'us_bank_account'],
    supportedCurrencies: ['usd'],
    minAmount: 50, // $0.50
    maxAmount: 10000000, // $100,000
  });
}
