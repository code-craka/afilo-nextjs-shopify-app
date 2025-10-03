import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe-server';

/**
 * GET /api/stripe/session/[sessionId]
 *
 * Retrieve Stripe Checkout Session Details
 *
 * Used on success page to display:
 * - Customer email
 * - Plan name and pricing
 * - Subscription ID
 * - Next billing date
 * - Payment status
 *
 * Security: No authentication required (session ID is secret)
 * Stripe session IDs are cryptographically secure and unguessable.
 *
 * @see https://stripe.com/docs/api/checkout/sessions/retrieve
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;

    // Validate session ID format
    if (!sessionId || !sessionId.startsWith('cs_')) {
      return NextResponse.json(
        { error: 'Invalid session ID format' },
        { status: 400 }
      );
    }

    console.log('📝 Retrieving session:', sessionId);

    // Retrieve session with expanded data
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer', 'line_items.data.price.product'],
    });

    // Verify session was for subscription (not one-time payment)
    if (session.mode !== 'subscription') {
      return NextResponse.json(
        { error: 'Session is not for subscription' },
        { status: 400 }
      );
    }

    // Extract subscription details
    const subscription = session.subscription as any;
    const customer = session.customer as any;
    const lineItems = session.line_items?.data || [];
    const firstItem = lineItems[0];
    const price = firstItem?.price;
    const product = price?.product as any;

    // Format session data for frontend
    const sessionData = {
      // Session details
      sessionId: session.id,
      status: session.status,
      paymentStatus: session.payment_status,

      // Customer details
      customerEmail: session.customer_details?.email || customer?.email || 'N/A',
      customerName: session.customer_details?.name || customer?.name || null,

      // Subscription details
      subscriptionId: subscription?.id || null,
      subscriptionStatus: subscription?.status || null,

      // Plan details
      planName: product?.name || 'Unknown Plan',
      planTier: product?.metadata?.tier || 'professional',
      userLimit: product?.metadata?.user_limit || '25',

      // Pricing details
      amount: session.amount_total || 0,
      currency: session.currency?.toUpperCase() || 'USD',
      formattedAmount: `$${((session.amount_total || 0) / 100).toFixed(2)}`,
      billingInterval: price?.recurring?.interval === 'month' ? 'monthly' : 'annual',

      // Billing dates
      currentPeriodStart: subscription?.current_period_start
        ? new Date(subscription.current_period_start * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : null,
      currentPeriodEnd: subscription?.current_period_end
        ? new Date(subscription.current_period_end * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : null,

      // Features from product metadata
      features: product?.metadata?.features?.split('|') || [],

      // Payment method
      paymentMethodTypes: session.payment_method_types || [],

      // Timestamps
      createdAt: new Date(session.created * 1000).toISOString(),
    };

    console.log('✅ Session retrieved successfully:', {
      sessionId: session.id,
      customerEmail: sessionData.customerEmail,
      planName: sessionData.planName,
      status: sessionData.status,
    });

    return NextResponse.json(sessionData);

  } catch (error: any) {
    console.error('❌ Error retrieving session:', error);

    // Handle specific Stripe errors
    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: 'Session not found', details: error.message },
        { status: 404 }
      );
    }

    if (error.type === 'StripeAPIError') {
      return NextResponse.json(
        { error: 'Stripe API error', details: error.message },
        { status: 502 }
      );
    }

    // Generic error
    return NextResponse.json(
      { error: 'Failed to retrieve session', details: error.message },
      { status: 500 }
    );
  }
}
