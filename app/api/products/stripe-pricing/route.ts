import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
});

export async function GET() {
  try {
    // Fetch all active products
    const products = await stripe.products.list({
      active: true,
      limit: 100,
      expand: ['data.default_price'],
    });

    // Fetch prices for each product
    const productsWithPricing = await Promise.all(
      products.data.map(async product => {
        // Get all prices for this product
        const prices = await stripe.prices.list({
          product: product.id,
          active: true,
        });

        // Parse features from metadata
        const features: string[] = product.metadata?.features
          ? JSON.parse(product.metadata.features)
          : [];

        // Determine if subscription or one-time
        const isSubscription = prices.data.some(p => p.recurring !== null);

        return {
          id: product.id,
          name: product.name,
          description: product.description || '',
          features,
          prices: prices.data.map(price => ({
            id: price.id,
            amount: price.unit_amount || 0,
            currency: price.currency,
            interval: price.recurring?.interval,
            nickname: price.nickname || price.metadata?.variantName,
          })),
          type: isSubscription ? 'subscription' : 'one-time',
        };
      })
    );

    // Sort: subscriptions first, then by price
    const sorted = productsWithPricing.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'subscription' ? -1 : 1;
      }
      const aPrice = a.prices[0]?.amount || 0;
      const bPrice = b.prices[0]?.amount || 0;
      return aPrice - bPrice;
    });

    return NextResponse.json({
      products: sorted,
      total: sorted.length,
    });
  } catch (error) {
    console.error('Failed to fetch Stripe pricing:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
