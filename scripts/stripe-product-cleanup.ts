/**
 * Stripe Product Cleanup and Configuration Script
 *
 * This script will:
 * 1. List all existing products
 * 2. Archive/delete test products
 * 3. Create clean subscription products (4 enterprise plans)
 * 4. Create non-subscription products (one-time purchases)
 * 5. Verify everything is configured correctly
 *
 * Usage: npx tsx scripts/stripe-product-cleanup.ts
 */

import Stripe from 'stripe';
import * as readline from 'readline';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function listAllProducts() {
  console.log('\n📋 Listing all existing Stripe products...\n');

  const products = await stripe.products.list({ limit: 100 });

  if (products.data.length === 0) {
    console.log('   No products found.');
    return [];
  }

  console.log(`   Found ${products.data.length} products:\n`);

  for (const product of products.data) {
    const prices = await stripe.prices.list({ product: product.id, limit: 10 });
    console.log(`   📦 ${product.name}`);
    console.log(`      ID: ${product.id}`);
    console.log(`      Active: ${product.active}`);
    console.log(`      Prices: ${prices.data.length}`);
    prices.data.forEach((price) => {
      const amount = price.unit_amount ? `$${price.unit_amount / 100}` : 'Custom';
      const interval = price.recurring ? `/${price.recurring.interval}` : 'one-time';
      console.log(`         - ${price.id}: ${amount}${interval} (${price.active ? 'active' : 'archived'})`);
    });
    console.log('');
  }

  return products.data;
}

async function archiveProduct(productId: string) {
  try {
    // Archive all prices first
    const prices = await stripe.prices.list({ product: productId, limit: 100 });
    for (const price of prices.data) {
      if (price.active) {
        await stripe.prices.update(price.id, { active: false });
        console.log(`      ✅ Archived price: ${price.id}`);
      }
    }

    // Archive product
    await stripe.products.update(productId, { active: false });
    console.log(`   ✅ Archived product: ${productId}`);
    return true;
  } catch (error) {
    console.error(`   ❌ Failed to archive product: ${productId}`, error);
    return false;
  }
}

async function createSubscriptionProducts() {
  console.log('\n🔧 Creating Subscription Products (4 Enterprise Plans)...\n');

  const plans = [
    {
      name: 'Afilo Professional',
      description: 'Perfect for small teams getting started with enterprise software',
      monthlyPrice: 49900, // $499
      annualPrice: 499000, // $4,990 (17% discount)
      features: ['Up to 25 users', 'Basic analytics', 'Email support', '99.9% uptime SLA'],
      metadata: { tier: 'professional', max_users: '25' },
    },
    {
      name: 'Afilo Business',
      description: 'Ideal for growing companies with advanced needs',
      monthlyPrice: 149900, // $1,499
      annualPrice: 1499000, // $14,990 (17% discount)
      features: [
        'Up to 100 users',
        'Advanced analytics',
        'Priority support',
        '99.95% uptime SLA',
        'Custom integrations',
      ],
      metadata: { tier: 'business', max_users: '100' },
    },
    {
      name: 'Afilo Enterprise',
      description: 'For large organizations requiring maximum flexibility',
      monthlyPrice: 499900, // $4,999
      annualPrice: 4999000, // $49,990 (17% discount)
      features: [
        'Up to 500 users',
        'Enterprise analytics',
        'Dedicated account manager',
        '99.99% uptime SLA',
        'White-label options',
        'SSO integration',
      ],
      metadata: { tier: 'enterprise', max_users: '500' },
    },
    {
      name: 'Afilo Enterprise Plus',
      description: 'Ultimate solution for Fortune 500 companies',
      monthlyPrice: 999900, // $9,999
      annualPrice: 9999000, // $99,990 (17% discount)
      features: [
        'Unlimited users',
        'Custom everything',
        '24/7 dedicated support team',
        '99.999% uptime SLA',
        'On-premise deployment',
        'Custom SLA',
      ],
      metadata: { tier: 'enterprise_plus', max_users: 'unlimited' },
    },
  ];

  const createdProducts = [];

  for (const plan of plans) {
    try {
      // Create product
      const product = await stripe.products.create({
        name: plan.name,
        description: plan.description,
        metadata: {
          type: 'subscription',
          ...plan.metadata,
          features: JSON.stringify(plan.features),
        },
        tax_code: 'txcd_10103001', // Software as a Service
      });

      console.log(`   ✅ Created product: ${product.name} (${product.id})`);

      // Create monthly price
      const monthlyPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.monthlyPrice,
        currency: 'usd',
        recurring: {
          interval: 'month',
          interval_count: 1,
        },
        tax_behavior: 'exclusive',
        metadata: {
          billing_period: 'monthly',
        },
      });

      console.log(`      💵 Monthly: $${plan.monthlyPrice / 100}/mo (${monthlyPrice.id})`);

      // Create annual price
      const annualPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.annualPrice,
        currency: 'usd',
        recurring: {
          interval: 'year',
          interval_count: 1,
        },
        tax_behavior: 'exclusive',
        metadata: {
          billing_period: 'annual',
          discount: '17%',
        },
      });

      console.log(`      💵 Annual: $${plan.annualPrice / 100}/yr (${annualPrice.id})`);
      console.log(`      💰 Annual savings: $${(plan.monthlyPrice * 12 - plan.annualPrice) / 100}`);
      console.log('');

      createdProducts.push({
        product,
        monthlyPrice,
        annualPrice,
      });
    } catch (error) {
      console.error(`   ❌ Failed to create ${plan.name}:`, error);
    }
  }

  return createdProducts;
}

async function createOneTimeProducts() {
  console.log('\n🔧 Creating One-Time Purchase Products...\n');

  const products = [
    {
      name: 'Afilo Software License (Lifetime)',
      description: 'One-time purchase with lifetime updates',
      price: 999900, // $9,999
      metadata: { type: 'one_time', license_type: 'lifetime' },
    },
    {
      name: 'Afilo Custom Implementation',
      description: 'Custom implementation and integration services',
      price: 4999900, // $49,999
      metadata: { type: 'service', service_type: 'implementation' },
    },
    {
      name: 'Afilo Premium Support (Annual)',
      description: 'Premium support package for one year',
      price: 999900, // $9,999
      metadata: { type: 'support', duration: '1_year' },
    },
  ];

  const createdProducts = [];

  for (const productData of products) {
    try {
      // Create product
      const product = await stripe.products.create({
        name: productData.name,
        description: productData.description,
        metadata: productData.metadata,
        tax_code: 'txcd_10103001', // Software as a Service
      });

      console.log(`   ✅ Created product: ${product.name} (${product.id})`);

      // Create one-time price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: productData.price,
        currency: 'usd',
        tax_behavior: 'exclusive',
      });

      console.log(`      💵 Price: $${productData.price / 100} (${price.id})`);
      console.log('');

      createdProducts.push({ product, price });
    } catch (error) {
      console.error(`   ❌ Failed to create ${productData.name}:`, error);
    }
  }

  return createdProducts;
}

async function verifyConfiguration() {
  console.log('\n✅ Verifying Configuration...\n');

  const products = await stripe.products.list({ active: true, limit: 100 });

  console.log(`   Total active products: ${products.data.length}`);

  const subscriptionProducts = products.data.filter((p) => p.metadata.type === 'subscription');
  const oneTimeProducts = products.data.filter(
    (p) => p.metadata.type === 'one_time' || p.metadata.type === 'service' || p.metadata.type === 'support'
  );

  console.log(`   Subscription products: ${subscriptionProducts.length} (expected: 4)`);
  console.log(`   One-time products: ${oneTimeProducts.length} (expected: 3)`);

  // Check prices
  let totalPrices = 0;
  for (const product of products.data) {
    const prices = await stripe.prices.list({ product: product.id, active: true });
    totalPrices += prices.data.length;
  }

  console.log(`   Total active prices: ${totalPrices} (expected: 11 = 8 subscription + 3 one-time)`);

  if (subscriptionProducts.length === 4 && oneTimeProducts.length === 3 && totalPrices === 11) {
    console.log('\n   🎉 Configuration is PERFECT!');
    return true;
  } else {
    console.log('\n   ⚠️  Configuration needs adjustment');
    return false;
  }
}

async function main() {
  console.log('🚀 Stripe Product Cleanup and Configuration\n');
  console.log('═'.repeat(60));

  try {
    // Step 1: List all existing products
    const existingProducts = await listAllProducts();

    if (existingProducts.length > 0) {
      const answer = await askQuestion(
        '\n⚠️  Found existing products. Do you want to ARCHIVE them all? (yes/no): '
      );

      if (answer.toLowerCase() === 'yes') {
        console.log('\n🗑️  Archiving existing products...\n');
        for (const product of existingProducts) {
          await archiveProduct(product.id);
        }
        console.log('\n   ✅ All existing products archived!');
      } else {
        console.log('\n   ⏭️  Skipping archive step (keeping existing products)');
      }
    }

    // Step 2: Create subscription products
    const confirm1 = await askQuestion('\n📦 Create subscription products (4 plans)? (yes/no): ');
    if (confirm1.toLowerCase() === 'yes') {
      await createSubscriptionProducts();
    }

    // Step 3: Create one-time products
    const confirm2 = await askQuestion('\n💰 Create one-time purchase products? (yes/no): ');
    if (confirm2.toLowerCase() === 'yes') {
      await createOneTimeProducts();
    }

    // Step 4: Verify configuration
    await verifyConfiguration();

    console.log('\n═'.repeat(60));
    console.log('\n✅ Stripe product cleanup and configuration COMPLETE!\n');
    console.log('Next steps:');
    console.log('1. Go to https://dashboard.stripe.com/products');
    console.log('2. Verify all products look correct');
    console.log('3. Update your frontend with new Price IDs');
    console.log('4. Test checkout flows\n');
  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    rl.close();
  }
}

main();
