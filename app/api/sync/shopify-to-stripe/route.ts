import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getProducts } from '@/lib/shopify-server';
import { stripe } from '@/lib/stripe-server';
import { db } from '@/lib/database';

/**
 * Shopify → Stripe Product Sync
 *
 * Syncs products from Shopify to Stripe, creating:
 * - Stripe products matching Shopify products
 * - Monthly and annual prices (annual = 17% discount)
 * - Unified product records in database
 *
 * Security: Admin-only endpoint (TODO: Add admin check)
 *
 * Usage:
 * POST /api/sync/shopify-to-stripe
 * Body: { productIds?: string[] } (optional - sync specific products)
 *
 * @returns Sync summary with created/updated counts
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { productIds } = body as { productIds?: string[] };

    console.log('🔄 Starting Shopify → Stripe product sync...');

    // Fetch products from Shopify
    const shopifyProducts = await getProducts({
      first: 100,
      query: productIds ? `id:${productIds.join(' OR id:')}` : undefined
    });

    if (!shopifyProducts || shopifyProducts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No products found to sync',
        synced: 0,
        created: 0,
        updated: 0
      });
    }

    console.log(`📦 Found ${shopifyProducts.length} products from Shopify`);

    let created = 0;
    let updated = 0;
    const errors: Array<{ productId: string; error: string }> = [];

    for (const product of shopifyProducts) {
      try {
        console.log(`\n🔄 Syncing: ${product.title}`);

        // Get first variant for pricing
        const variant = product.variants.edges[0]?.node;
        if (!variant) {
          console.warn(`⚠️  No variants found for ${product.title}, skipping`);
          continue;
        }

        const basePrice = parseFloat(variant.price.amount);
        const basePriceCents = Math.round(basePrice * 100);

        // Check if Stripe product already exists
        let stripeProduct;
        let existingProducts = await stripe.products.search({
          query: `metadata['shopify_product_id']:'${product.id}'`,
          limit: 1
        });

        if (existingProducts.data.length > 0) {
          // Update existing Stripe product
          stripeProduct = existingProducts.data[0];
          console.log(`✏️  Updating existing Stripe product: ${stripeProduct.id}`);

          stripeProduct = await stripe.products.update(stripeProduct.id, {
            name: product.title,
            description: product.description || undefined,
            active: product.availableForSale,
            metadata: {
              shopify_product_id: product.id,
              shopify_handle: product.handle,
              shopify_variant_id: variant.id,
              sync_source: 'shopify_sync',
              last_synced: new Date().toISOString()
            }
          });
        } else {
          // Create new Stripe product
          console.log(`✨ Creating new Stripe product`);

          stripeProduct = await stripe.products.create({
            name: product.title,
            description: product.description || undefined,
            active: product.availableForSale,
            metadata: {
              shopify_product_id: product.id,
              shopify_handle: product.handle,
              shopify_variant_id: variant.id,
              sync_source: 'shopify_sync',
              tier: product.productType || 'standard',
              created: new Date().toISOString()
            },
            images: product.images?.edges.map(e => e.node.url) || []
          });
        }

        // Create or update monthly price
        const monthlyPriceSearch = await stripe.prices.search({
          query: `product:'${stripeProduct.id}' AND metadata['interval']:'month' AND active:true`,
          limit: 1
        });

        let monthlyPrice;
        if (monthlyPriceSearch.data.length > 0) {
          monthlyPrice = monthlyPriceSearch.data[0];
          console.log(`   ↳ Monthly price exists: ${monthlyPrice.id}`);
        } else {
          monthlyPrice = await stripe.prices.create({
            product: stripeProduct.id,
            unit_amount: basePriceCents,
            currency: 'usd',
            recurring: {
              interval: 'month'
            },
            metadata: {
              interval: 'month',
              shopify_variant_id: variant.id,
              base_price: basePrice.toString()
            }
          });
          console.log(`   ↳ Created monthly price: $${basePrice}/mo (${monthlyPrice.id})`);
        }

        // Create or update annual price (17% discount)
        const annualPriceCents = Math.round(basePriceCents * 12 * 0.83);
        const annualPriceSearch = await stripe.prices.search({
          query: `product:'${stripeProduct.id}' AND metadata['interval']:'year' AND active:true`,
          limit: 1
        });

        let annualPrice;
        if (annualPriceSearch.data.length > 0) {
          annualPrice = annualPriceSearch.data[0];
          console.log(`   ↳ Annual price exists: ${annualPrice.id}`);
        } else {
          annualPrice = await stripe.prices.create({
            product: stripeProduct.id,
            unit_amount: annualPriceCents,
            currency: 'usd',
            recurring: {
              interval: 'year'
            },
            metadata: {
              interval: 'year',
              shopify_variant_id: variant.id,
              discount_percent: '17',
              base_price: basePrice.toString()
            }
          });
          console.log(`   ↳ Created annual price: $${(annualPriceCents / 100).toFixed(2)}/yr (${annualPrice.id})`);
        }

        // Upsert to unified products table
        const unifiedProduct = {
          name: product.title,
          description: product.description || '',
          base_price: basePriceCents,
          currency: 'USD',

          shopify_product_id: product.id,
          shopify_variant_id: variant.id,
          shopify_handle: product.handle,
          shopify_synced_at: new Date(),

          stripe_product_id: stripeProduct.id,
          stripe_price_monthly: monthlyPrice.id,
          stripe_price_annual: annualPrice.id,
          stripe_synced_at: new Date(),

          features: product.tags || [],
          metadata: {
            vendor: product.vendor,
            productType: product.productType,
            tags: product.tags
          },
          images: product.images?.edges.map(e => ({ url: e.node.url, alt: e.node.altText })) || [],

          available_on_shopify: true,
          available_on_stripe: true,
          active: product.availableForSale,

          tier: product.productType || 'standard',
          product_type: product.productType || 'Software'
        };

        // Check if unified product exists
        const existingUnified = await db.query(
          'SELECT id FROM unified_products WHERE shopify_product_id = $1',
          [product.id]
        );

        if (existingUnified.rows.length > 0) {
          await db.query(
            `UPDATE unified_products SET
              name = $1, description = $2, base_price = $3,
              stripe_product_id = $4, stripe_price_monthly = $5, stripe_price_annual = $6,
              stripe_synced_at = $7, shopify_synced_at = $8, features = $9,
              metadata = $10, images = $11, active = $12, updated_at = NOW()
            WHERE shopify_product_id = $13`,
            [
              unifiedProduct.name, unifiedProduct.description, unifiedProduct.base_price,
              unifiedProduct.stripe_product_id, unifiedProduct.stripe_price_monthly,
              unifiedProduct.stripe_price_annual, unifiedProduct.stripe_synced_at,
              unifiedProduct.shopify_synced_at, JSON.stringify(unifiedProduct.features),
              JSON.stringify(unifiedProduct.metadata), JSON.stringify(unifiedProduct.images),
              unifiedProduct.active, product.id
            ]
          );
          updated++;
          console.log(`✅ Updated unified product in database`);
        } else {
          await db.query(
            `INSERT INTO unified_products (
              name, description, base_price, currency,
              shopify_product_id, shopify_variant_id, shopify_handle, shopify_synced_at,
              stripe_product_id, stripe_price_monthly, stripe_price_annual, stripe_synced_at,
              features, metadata, images, available_on_shopify, available_on_stripe,
              active, tier, product_type
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
            [
              unifiedProduct.name, unifiedProduct.description, unifiedProduct.base_price,
              unifiedProduct.currency, unifiedProduct.shopify_product_id,
              unifiedProduct.shopify_variant_id, unifiedProduct.shopify_handle,
              unifiedProduct.shopify_synced_at, unifiedProduct.stripe_product_id,
              unifiedProduct.stripe_price_monthly, unifiedProduct.stripe_price_annual,
              unifiedProduct.stripe_synced_at, JSON.stringify(unifiedProduct.features),
              JSON.stringify(unifiedProduct.metadata), JSON.stringify(unifiedProduct.images),
              unifiedProduct.available_on_shopify, unifiedProduct.available_on_stripe,
              unifiedProduct.active, unifiedProduct.tier, unifiedProduct.product_type
            ]
          );
          created++;
          console.log(`✅ Created unified product in database`);
        }

      } catch (error) {
        console.error(`❌ Error syncing ${product.title}:`, error);
        errors.push({
          productId: product.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const summary = {
      success: true,
      message: `Successfully synced ${created + updated} products`,
      synced: shopifyProducts.length,
      created,
      updated,
      errors: errors.length > 0 ? errors : undefined
    };

    console.log('\n✅ Sync complete:', summary);

    return NextResponse.json(summary);

  } catch (error) {
    console.error('❌ Sync failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Sync failed'
      },
      { status: 500 }
    );
  }
}
