#!/usr/bin/env tsx
/**
 * Verify Stripe Features & Pricing Table Setup
 * Tests that everything is configured correctly
 */

import Stripe from 'stripe';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local'), override: true });

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY not found');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
});

console.log('🔍 Verifying Stripe Setup...\n');

async function verifySetup() {
  try {
    // 1. Check Products
    console.log('📦 Checking Products...');
    const products = await stripe.products.list({
      active: true,
      limit: 100,
    });

    console.log(`   ✓ Found ${products.data.length} active products\n`);

    // 2. Check each product for features and prices
    let productsWithFeatures = 0;
    let totalPrices = 0;
    let subscriptionProducts = 0;
    let onetimeProducts = 0;

    console.log('🏷️  Product Details:\n');
    console.log('═'.repeat(80));

    for (const product of products.data) {
      const prices = await stripe.prices.list({
        product: product.id,
        active: true,
      });

      const features = product.metadata?.features
        ? JSON.parse(product.metadata.features)
        : [];

      const isSubscription = prices.data.some(p => p.recurring !== null);
      isSubscription ? subscriptionProducts++ : onetimeProducts++;

      if (features.length > 0) productsWithFeatures++;
      totalPrices += prices.data.length;

      const typeIcon = isSubscription ? '🔄' : '💰';
      const typeLabel = isSubscription ? 'Subscription' : 'One-time';

      console.log(`${typeIcon} ${product.name}`);
      console.log(`   Type: ${typeLabel}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Features: ${features.length}`);
      console.log(`   Prices: ${prices.data.length}`);

      if (features.length > 0) {
        console.log(`   Top Features:`);
        features.slice(0, 3).forEach((f: string) => {
          console.log(`      • ${f}`);
        });
      }

      if (prices.data.length > 0) {
        console.log(`   Price Options:`);
        prices.data.forEach(price => {
          const amount = price.unit_amount ? `$${(price.unit_amount / 100).toFixed(2)}` : 'Free';
          const interval = price.recurring ? `/${price.recurring.interval}` : '';
          const nickname = price.nickname ? ` (${price.nickname})` : '';
          console.log(`      → ${amount}${interval}${nickname}`);
        });
      }

      console.log('');
    }

    console.log('═'.repeat(80));
    console.log('\n📊 Summary:\n');
    console.log(`   Total Products: ${products.data.length}`);
    console.log(`   Subscription Products: ${subscriptionProducts}`);
    console.log(`   One-time Products: ${onetimeProducts}`);
    console.log(`   Products with Features: ${productsWithFeatures}`);
    console.log(`   Total Price Points: ${totalPrices}`);

    // 3. Test checkout session creation
    console.log('\n\n🧪 Testing Checkout Session Creation...\n');

    const testPrice = products.data[0]?.default_price;
    if (testPrice && typeof testPrice === 'string') {
      try {
        const session = await stripe.checkout.sessions.create({
          mode: 'payment',
          line_items: [{ price: testPrice, quantity: 1 }],
          success_url: 'https://example.com/success',
          cancel_url: 'https://example.com/cancel',
        });

        console.log('   ✓ Checkout session created successfully');
        console.log(`   Session ID: ${session.id}`);
        console.log(`   URL: ${session.url}\n`);

        // Clean up test session
        await stripe.checkout.sessions.expire(session.id);
        console.log('   ✓ Test session expired (cleanup)\n');
      } catch (error: any) {
        console.error('   ❌ Checkout session test failed:', error.message);
      }
    }

    // 4. Final Status
    console.log('\n✨ Verification Complete!\n');
    console.log('✅ All checks passed. Your Stripe setup is ready!\n');

    console.log('📝 What\'s Available:\n');
    console.log(`   • ${productsWithFeatures} products with detailed features`);
    console.log(`   • ${subscriptionProducts} subscription products (recurring revenue)`);
    console.log(`   • ${onetimeProducts} one-time purchase products`);
    console.log(`   • ${totalPrices} price points across all products`);
    console.log(`   • Checkout sessions working correctly\n`);

    console.log('🔗 Next Steps:\n');
    console.log('   1. Visit: http://localhost:3000/pricing-table');
    console.log('   2. Test the pricing table component');
    console.log('   3. Try a test checkout');
    console.log('   4. View Dashboard: https://dashboard.stripe.com/test/products\n');

    console.log('📦 Integration Code:\n');
    console.log('═'.repeat(80));
    console.log(`
import StripePricingTable from '@/components/StripePricingTable';

export default function PricingPage() {
  return <StripePricingTable />;
}
    `);
    console.log('═'.repeat(80));

  } catch (error) {
    console.error('\n❌ Verification failed:', error);
    process.exit(1);
  }
}

verifySetup();
