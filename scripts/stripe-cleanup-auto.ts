/**
 * Automatic Stripe Product Cleanup (Non-Interactive)
 *
 * This will:
 * 1. List all products
 * 2. Archive test products (keeps the 4 main subscription plans)
 * 3. Show summary
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
});

// Products to KEEP (do not archive)
const KEEP_PRODUCT_NAMES = [
  'Professional Plan',
  'Business Plan',
  'Enterprise Plan',
  'Enterprise Plus',
];

async function main() {
  console.log('🚀 Automatic Stripe Product Cleanup\n');
  console.log('═'.repeat(60));

  try {
    // List all products
    console.log('\n📋 Listing all products...\n');
    const products = await stripe.products.list({ limit: 100 });

    const toKeep: any[] = [];
    const toArchive: any[] = [];

    for (const product of products.data) {
      if (KEEP_PRODUCT_NAMES.includes(product.name) && product.active) {
        toKeep.push(product);
        console.log(`   ✅ KEEP: ${product.name} (${product.id})`);
      } else if (product.active) {
        toArchive.push(product);
        console.log(`   🗑️  ARCHIVE: ${product.name} (${product.id})`);
      } else {
        console.log(`   ⏭️  SKIP (already archived): ${product.name}`);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Products to keep: ${toKeep.length}`);
    console.log(`   Products to archive: ${toArchive.length}`);
    console.log(`   Already archived: ${products.data.length - toKeep.length - toArchive.length}`);

    if (toArchive.length === 0) {
      console.log('\n✅ No products need archiving. Everything is clean!');
      return;
    }

    console.log(`\n🗑️  Archiving ${toArchive.length} test products...`);

    for (const product of toArchive) {
      try {
        // Archive all prices first
        const prices = await stripe.prices.list({ product: product.id });
        for (const price of prices.data) {
          if (price.active) {
            await stripe.prices.update(price.id, { active: false });
          }
        }

        // Archive product
        await stripe.products.update(product.id, { active: false });
        console.log(`   ✅ Archived: ${product.name}`);
      } catch (error) {
        console.error(`   ❌ Failed: ${product.name}`, error);
      }
    }

    console.log('\n✅ Cleanup complete!');
    console.log('\n📋 Remaining active products:');
    toKeep.forEach((p) => console.log(`   - ${p.name} (${p.id})`));

  } catch (error) {
    console.error('\n❌ Error:', error);
  }
}

main();
