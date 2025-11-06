/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-expressions */
#!/usr/bin/env tsx
/**
 * Stripe Features & Pricing Table Setup
 * Creates product features and pricing tables in Stripe
 */

import { neon } from '@neondatabase/serverless';
import Stripe from 'stripe';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local'), override: true });

if (!process.env.DATABASE_URL || !process.env.STRIPE_SECRET_KEY) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
});

console.log('🚀 Starting Stripe Features & Pricing Table Setup...\n');
console.log('🔧 Using Stripe Key:', process.env.STRIPE_SECRET_KEY.substring(0, 20) + '...\n');

interface ProductRow {
  id: string;
  handle: string;
  title: string;
  stripe_product_id: string;
  subscription_supported: boolean;
}

interface PricingTierRow {
  tier_name: string;
  features: string[];
  price: number;
}

async function setupFeaturesAndPricing() {
  try {
    // Step 1: Fetch all products with Stripe IDs
    const products = await sql<ProductRow[]>`
      SELECT id, handle, title, stripe_product_id, subscription_supported
      FROM products
      WHERE status = 'active' AND stripe_product_id IS NOT NULL
      ORDER BY subscription_supported DESC, base_price ASC
    `;

    console.log(`📦 Found ${products.length} products with Stripe integration\n`);

    // Step 2: Update each product with features metadata
    let featuresUpdated = 0;
    const priceIdsByProduct: { [key: string]: string[] } = {};

    for (const product of products) {
      console.log(`\n🏷️  Processing: ${product.title}`);

      // Get pricing tiers with features
      const tiers = await sql<PricingTierRow[]>`
        SELECT tier_name, features, price
        FROM product_pricing_tiers
        WHERE product_id = ${product.id}
        ORDER BY price ASC
      `;

      if (tiers.length === 0) {
        console.log('   ⚠️  No pricing tiers found, skipping...');
        continue;
      }

      // Combine all unique features from all tiers
      const allFeatures = [...new Set(tiers.flatMap(t => t.features))];
      console.log(`   📝 Features (${allFeatures.length}):`, allFeatures.slice(0, 3).join(', '), '...');

      // Update Stripe product with features in metadata
      try {
        await stripe.products.update(product.stripe_product_id, {
          metadata: {
            features: JSON.stringify(allFeatures),
            feature_count: allFeatures.length.toString(),
          },
        });
        console.log(`   ✅ Updated product features in Stripe`);
        featuresUpdated++;
      } catch (error) {
        console.error(`   ❌ Failed to update features:`, error);
      }

      // Get all price IDs for this product
      const variants = await sql<{ stripe_price_id: string }[]>`
        SELECT stripe_price_id
        FROM product_variants
        WHERE product_id = ${product.id} AND stripe_price_id IS NOT NULL
      `;

      priceIdsByProduct[product.stripe_product_id] = variants
        .map(v => v.stripe_price_id)
        .filter(Boolean);
    }

    console.log(`\n✨ Features updated for ${featuresUpdated} products\n`);

    // Step 3: Create Pricing Table
    console.log('📊 Creating Stripe Pricing Table...\n');

    // Get all active price IDs for the pricing table
    const allPriceIds = Object.values(priceIdsByProduct).flat();
    console.log(`   Found ${allPriceIds.length} prices across all products`);

    // Create pricing table (Stripe Checkout Session for now, as Pricing Tables are dashboard-only)
    // We'll output configuration for manual setup
    console.log('\n📋 Pricing Table Configuration:\n');
    console.log('═'.repeat(60));
    console.log('To create a Pricing Table in Stripe Dashboard:');
    console.log('1. Go to: https://dashboard.stripe.com/test/pricing-tables');
    console.log('2. Click "Create pricing table"');
    console.log('3. Add these products:\n');

    let subscriptionCount = 0;
    let onetimeCount = 0;

    for (const product of products) {
      const priceIds = priceIdsByProduct[product.stripe_product_id] || [];
      if (priceIds.length === 0) continue;

      const type = product.subscription_supported ? '(Subscription)' : '(One-time)';
      product.subscription_supported ? subscriptionCount++ : onetimeCount++;

      console.log(`   ${product.subscription_supported ? '🔄' : '💰'} ${product.title} ${type}`);
      console.log(`      Product ID: ${product.stripe_product_id}`);
      console.log(`      Price IDs: ${priceIds.slice(0, 3).join(', ')}${priceIds.length > 3 ? '...' : ''}`);
      console.log('');
    }

    console.log('═'.repeat(60));
    console.log(`\n📊 Summary:`);
    console.log(`   Subscription Products: ${subscriptionCount}`);
    console.log(`   One-time Products: ${onetimeCount}`);
    console.log(`   Total Products: ${products.length}`);
    console.log(`   Features Updated: ${featuresUpdated}`);

    // Step 4: Verify features in Stripe
    console.log('\n🔍 Verifying features in Stripe...\n');

    for (const product of products.slice(0, 3)) {
      const stripeProduct = await stripe.products.retrieve(product.stripe_product_id);
      const features = JSON.parse(stripeProduct.metadata?.features || '[]');
      console.log(`   ✓ ${product.title}: ${features.length} features`);
      if (features.length > 0) {
        features.slice(0, 3).forEach((f: string) => console.log(`     - ${f}`));
      }
    }

    // Output pricing table embed code example
    console.log('\n\n🎨 Example Pricing Table Component:\n');
    console.log('═'.repeat(60));
    console.log(`
const PricingTable = () => {
  const handleCheckout = async (priceId: string, mode: 'payment' | 'subscription') => {
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId, mode }),
    });

    const { url } = await response.json();

    // Modern approach: redirect directly to checkout URL
    if (url) window.location.href = url;
  };

  return (
    <div className="pricing-grid">
      {/* Render your products here with checkout buttons */}
    </div>
  );
};
    `);
    console.log('═'.repeat(60));

    console.log('\n✅ Setup complete!\n');
    console.log('📝 Next steps:');
    console.log('   1. Create Pricing Table in Stripe Dashboard');
    console.log('   2. Use the product/price IDs shown above');
    console.log('   3. Features are now stored in product metadata');
    console.log('   4. Test checkout flow with the example component\n');

    console.log('🔗 Useful links:');
    console.log('   Products: https://dashboard.stripe.com/test/products');
    console.log('   Pricing Tables: https://dashboard.stripe.com/test/pricing-tables');
    console.log('   Checkout: https://dashboard.stripe.com/test/payments\n');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setupFeaturesAndPricing();
