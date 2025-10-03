import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { checkRateLimit, shopifyApiRateLimit, getClientIp } from '@/lib/rate-limit';

/**
 * Unified Products API
 *
 * Returns products from unified_products table
 * Includes both Shopify and Stripe product IDs
 *
 * Query Parameters:
 * - active: true/false (filter by active status)
 * - tier: professional|business|enterprise (filter by tier)
 * - shopify: true/false (available on Shopify)
 * - stripe: true/false (available on Stripe)
 *
 * Response includes all necessary data for dual checkout flow
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(request);
    const rateLimit = await checkRateLimit(ip, shopifyApiRateLimit);

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: rateLimit.headers
        }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');
    const tier = searchParams.get('tier');
    const shopify = searchParams.get('shopify');
    const stripe = searchParams.get('stripe');

    // Build filters
    const filters: any = {};
    if (active !== null) filters.active = active === 'true';
    if (tier) filters.tier = tier;
    if (shopify !== null) filters.availableOnShopify = shopify === 'true';
    if (stripe !== null) filters.availableOnStripe = stripe === 'true';

    // Fetch from database
    const products = await db.getUnifiedProducts(filters);

    // Transform to frontend format
    const transformedProducts = products.map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,

      // Pricing
      basePrice: p.base_price,
      currency: p.currency,
      formattedPrice: `$${(p.base_price / 100).toFixed(2)}`,

      // Shopify Integration
      shopify: {
        productId: p.shopify_product_id,
        variantId: p.shopify_variant_id,
        handle: p.shopify_handle,
        available: p.available_on_shopify
      },

      // Stripe Integration
      stripe: {
        productId: p.stripe_product_id,
        priceMonthly: p.stripe_price_monthly,
        priceAnnual: p.stripe_price_annual,
        available: p.available_on_stripe
      },

      // Product Details
      features: p.features || [],
      images: p.images || [],
      metadata: p.metadata || {},

      // Categorization
      tier: p.tier,
      userLimit: p.user_limit,
      productType: p.product_type,

      // Status
      active: p.active,
      createdAt: p.created_at,
      updatedAt: p.updated_at
    }));

    return NextResponse.json(
      {
        products: transformedProducts,
        total: transformedProducts.length
      },
      { headers: rateLimit.headers }
    );

  } catch (error) {
    console.error('Unified products API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch products',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
