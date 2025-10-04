import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

interface CartItem {
  productId: string;
  variantId: string;
  title: string;
  price: number;
  quantity: number;
  licenseType: string;
  image?: string;
}

interface CheckoutRequest {
  items: CartItem[];
  userEmail?: string;
}

/**
 * Create Stripe Checkout Session for Cart Items
 *
 * Bypasses Shopify cart entirely - uses Stripe as payment processor
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body: CheckoutRequest = await request.json();
    const { items, userEmail } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Build Stripe line items from cart
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${item.title} - ${item.licenseType} License`,
          description: `${item.licenseType} license for ${item.title}`,
          images: item.image ? [item.image] : undefined,
          metadata: {
            shopify_product_id: item.productId,
            shopify_variant_id: item.variantId,
            license_type: item.licenseType,
          },
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card', 'us_bank_account'], // Card + ACH
      line_items: lineItems,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/products`,
      customer_email: userEmail,
      client_reference_id: userId, // Track which user made the purchase
      metadata: {
        clerk_user_id: userId,
        source: 'digital_cart',
        item_count: items.length.toString(),
      },
      // Enable automatic tax calculation
      automatic_tax: {
        enabled: true,
      },
      // Billing address collection
      billing_address_collection: 'required',
      // Custom fields for digital delivery
      custom_fields: [
        {
          key: 'delivery_email',
          label: {
            type: 'custom',
            custom: 'Email for digital delivery',
          },
          type: 'text',
          optional: true,
        },
      ],
      // Payment intent data for metadata
      payment_intent_data: {
        metadata: {
          clerk_user_id: userId,
          product_titles: items.map(i => i.title).join(', '),
          license_types: items.map(i => i.licenseType).join(', '),
        },
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });

  } catch (error) {
    console.error('Error creating cart checkout session:', error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
