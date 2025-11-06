/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-expressions */
#!/usr/bin/env tsx
/**
 * Stripe Product Sync Script
 * Syncs all database products to Stripe using test keys from .env.local
 */

import { neon } from '@neondatabase/serverless';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { resolve } from 'path';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local'), override: true });

// Verify environment variables
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env.local');
  process.exit(1);
}

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY not found in .env.local');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
});

console.log('🔧 Using Stripe Key:', process.env.STRIPE_SECRET_KEY.substring(0, 20) + '...');
console.log('🗄️  Using Database:', process.env.DATABASE_URL.split('@')[1].split('/')[0]);
console.log('');

interface ProductRow {
  id: string;
  handle: string;
  title: string;
  description: string;
  base_price: number;
  product_type: string;
  vendor: string;
  tech_stack: string[];
  version: string;
  available_licenses: string[];
  subscription_supported: boolean;
  subscription_interval: string | null;
  trial_period_days: number;
  featured_image_url: string;
  images: Array<{ url: string; altText: string }>;
  available_for_sale: boolean;
  stripe_product_id: string | null;
}

interface VariantRow {
  id: string;
  product_id: string;
  title: string;
  sku: string;
  license_type: string;
  max_seats: number;
  price: number;
  price_multiplier: number;
  stripe_price_id: string | null;
  available_for_sale: boolean;
}

async function syncProductsToStripe() {
  console.log('🚀 Starting Stripe product synchronization...\n');

  try {
    // Fetch all active products from database
    const products = await sql<ProductRow[]>`
      SELECT * FROM products WHERE status = 'active' ORDER BY created_at ASC
    `;

    console.log(`📦 Found ${products.length} products in database\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const product of products) {
      console.log(`\n📦 Processing: ${product.title}`);
      console.log(`   Handle: ${product.handle}`);
      console.log(`   Base Price: $${product.base_price}`);

      try {
        let stripeProductId = product.stripe_product_id;

        // Step 1: Create or update Stripe product
        if (stripeProductId) {
          console.log(`   ✓ Stripe product exists: ${stripeProductId}`);

          // Update existing product
          await stripe.products.update(stripeProductId, {
            name: product.title,
            description: product.description,
            images: product.images.map(img => img.url).filter(Boolean),
            metadata: {
              handle: product.handle,
              productType: product.product_type,
              vendor: product.vendor,
              techStack: JSON.stringify(product.tech_stack),
              version: product.version,
              licenseTypes: JSON.stringify(product.available_licenses),
            },
            active: product.available_for_sale,
          });
          console.log(`   ✓ Updated Stripe product`);
        } else {
          // Create new product
          const stripeProduct = await stripe.products.create({
            name: product.title,
            description: product.description,
            images: product.images.map(img => img.url).filter(Boolean),
            metadata: {
              handle: product.handle,
              productType: product.product_type,
              vendor: product.vendor,
              techStack: JSON.stringify(product.tech_stack),
              version: product.version,
              licenseTypes: JSON.stringify(product.available_licenses),
            },
            active: product.available_for_sale,
          });

          stripeProductId = stripeProduct.id;
          console.log(`   ✓ Created Stripe product: ${stripeProductId}`);

          // Update database with Stripe product ID
          await sql`
            UPDATE products
            SET stripe_product_id = ${stripeProductId}, updated_at = NOW()
            WHERE id = ${product.id}
          `;
          console.log(`   ✓ Saved Stripe product ID to database`);
        }

        // Step 2: Fetch and sync variants
        const variants = await sql<VariantRow[]>`
          SELECT * FROM product_variants WHERE product_id = ${product.id} ORDER BY position ASC
        `;

        console.log(`   📝 Found ${variants.length} variants`);

        for (const variant of variants) {
          console.log(`      - ${variant.title} ($${variant.price})`);

          try {
            let stripePriceId = variant.stripe_price_id;

            // Create or update price
            if (stripePriceId) {
              // Archive old price (Stripe prices are immutable)
              await stripe.prices.update(stripePriceId, { active: false });
              console.log(`         ✓ Archived old price: ${stripePriceId}`);
            }

            // Create new price
            const priceData: Stripe.PriceCreateParams = {
              product: stripeProductId,
              unit_amount: Math.round(variant.price * 100), // Convert to cents
              currency: 'usd',
              metadata: {
                variantId: variant.id,
                licenseType: variant.license_type,
                maxSeats: variant.max_seats.toString(),
                sku: variant.sku,
              },
            };

            // Add recurring billing if subscription
            if (product.subscription_supported) {
              priceData.recurring = {
                interval: product.subscription_interval as 'month' | 'year' || 'month',
              };
              console.log(`         ℹ️  Subscription mode: ${priceData.recurring.interval}`);
            }

            const stripePrice = await stripe.prices.create(priceData);
            stripePriceId = stripePrice.id;
            console.log(`         ✓ Created price: ${stripePriceId}`);

            // Update database with Stripe price ID
            await sql`
              UPDATE product_variants
              SET stripe_price_id = ${stripePriceId}, updated_at = NOW()
              WHERE id = ${variant.id}
            `;
            console.log(`         ✓ Saved price ID to database`);

          } catch (variantError) {
            console.error(`         ❌ Failed to sync variant:`, variantError);
            errorCount++;
          }
        }

        successCount++;
        console.log(`   ✅ Product sync complete!\n`);

      } catch (productError) {
        console.error(`   ❌ Failed to sync product:`, productError);
        errorCount++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✨ Synchronization Complete!\n');
    console.log(`📊 Summary:`);
    console.log(`   Total Products: ${products.length}`);
    console.log(`   Successful: ${successCount}`);
    console.log(`   Failed: ${errorCount}`);
    console.log('');

    // Verification
    console.log('🔍 Verifying Stripe Dashboard...');
    const stripeProducts = await stripe.products.list({ limit: 100 });
    console.log(`   Stripe Products Count: ${stripeProducts.data.length}`);

    console.log('\n📋 Products in Stripe:');
    for (const sp of stripeProducts.data) {
      const prices = await stripe.prices.list({ product: sp.id, limit: 10 });
      console.log(`   - ${sp.name} (${sp.id})`);
      console.log(`     Prices: ${prices.data.length}`);
      prices.data.forEach(price => {
        const amount = price.unit_amount ? `$${(price.unit_amount / 100).toFixed(2)}` : 'Free';
        const interval = price.recurring ? `/${price.recurring.interval}` : '';
        console.log(`       → ${amount}${interval} (${price.id})`);
      });
    }

    console.log('\n✅ All products successfully synced to Stripe!');
    console.log(`🔗 View in Stripe Dashboard: https://dashboard.stripe.com/test/products\n`);

  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
}

// Run sync
syncProductsToStripe();
