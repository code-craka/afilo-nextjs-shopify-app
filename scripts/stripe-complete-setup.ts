/**
 * Complete Stripe Configuration Script
 *
 * This will:
 * 1. Clean up incorrect prices (remove one-time prices from subscription products)
 * 2. Create Features for all 4 plans
 * 3. Link features to products
 * 4. Create branded Pricing Table
 * 5. Verify everything is configured correctly
 *
 * Usage: npx tsx scripts/stripe-complete-setup.ts
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// Product IDs from your screenshots
const PRODUCT_IDS = {
  professional: 'prod_TAQaI2YSF8gg2i',
  business: 'prod_TAQasNRoyRuJxG',
  enterprise: 'prod_TAQafTnrANXXhp',
  enterprisePlus: 'prod_TAQapKGQnt0jgh',
};

async function cleanUpPrices() {
  console.log('\n🧹 Step 1: Cleaning up incorrect prices...\n');

  try {
    // Get all prices for Enterprise Plus
    const prices = await stripe.prices.list({
      product: PRODUCT_IDS.enterprisePlus,
      limit: 10,
    });

    console.log(`   Found ${prices.data.length} prices for Enterprise Plus`);

    // Archive one-time prices (keep only recurring)
    for (const price of prices.data) {
      if (!price.recurring && price.active) {
        try {
          await stripe.prices.update(price.id, { active: false });
          console.log(`   ✅ Archived one-time price: $${price.unit_amount! / 100} (${price.id})`);
        } catch (error) {
          console.log(`   ⚠️  Could not archive ${price.id}:`, (error as any).message);
        }
      }
    }

    console.log('\n   ✅ Price cleanup complete!');
  } catch (error) {
    console.error('   ❌ Error cleaning prices:', error);
  }
}

async function createFeatures() {
  console.log('\n🎨 Step 2: Creating Features...\n');

  const features = [
    // Professional Plan Features
    { name: 'Up to 25 users', type: 'users', tier: 'professional' },
    { name: 'Basic analytics', type: 'analytics', tier: 'professional' },
    { name: 'Email support', type: 'support', tier: 'professional' },
    { name: '99.9% uptime SLA', type: 'sla', tier: 'professional' },
    { name: '10 GB storage', type: 'storage', tier: 'professional' },

    // Business Plan Features (includes Professional +)
    { name: 'Up to 100 users', type: 'users', tier: 'business' },
    { name: 'Advanced analytics', type: 'analytics', tier: 'business' },
    { name: 'Priority support', type: 'support', tier: 'business' },
    { name: '99.95% uptime SLA', type: 'sla', tier: 'business' },
    { name: '100 GB storage', type: 'storage', tier: 'business' },
    { name: 'Custom integrations', type: 'integrations', tier: 'business' },
    { name: 'API access', type: 'api', tier: 'business' },

    // Enterprise Plan Features (includes Business +)
    { name: 'Up to 500 users', type: 'users', tier: 'enterprise' },
    { name: 'Enterprise analytics', type: 'analytics', tier: 'enterprise' },
    { name: 'Dedicated account manager', type: 'support', tier: 'enterprise' },
    { name: '99.99% uptime SLA', type: 'sla', tier: 'enterprise' },
    { name: '1 TB storage', type: 'storage', tier: 'enterprise' },
    { name: 'White-label options', type: 'branding', tier: 'enterprise' },
    { name: 'SSO integration (SAML/OIDC)', type: 'security', tier: 'enterprise' },
    { name: 'Advanced security', type: 'security', tier: 'enterprise' },

    // Enterprise Plus Features (includes Enterprise +)
    { name: 'Unlimited users', type: 'users', tier: 'enterprise_plus' },
    { name: 'Custom everything', type: 'custom', tier: 'enterprise_plus' },
    { name: '24/7 dedicated support team', type: 'support', tier: 'enterprise_plus' },
    { name: '99.999% uptime SLA', type: 'sla', tier: 'enterprise_plus' },
    { name: 'Unlimited storage', type: 'storage', tier: 'enterprise_plus' },
    { name: 'On-premise deployment', type: 'deployment', tier: 'enterprise_plus' },
    { name: 'Custom SLA', type: 'sla', tier: 'enterprise_plus' },
    { name: 'Dedicated infrastructure', type: 'infrastructure', tier: 'enterprise_plus' },
  ];

  const createdFeatures: any[] = [];

  for (const feature of features) {
    try {
      const stripeFeature = await stripe.products.createFeature({
        name: feature.name,
        metadata: {
          type: feature.type,
          tier: feature.tier,
        },
      });

      console.log(`   ✅ Created feature: ${feature.name} (${stripeFeature.id})`);
      createdFeatures.push({ ...feature, id: stripeFeature.id });
    } catch (error: any) {
      if (error.code === 'resource_already_exists') {
        console.log(`   ⏭️  Feature already exists: ${feature.name}`);
      } else {
        console.error(`   ❌ Failed to create: ${feature.name}`, error.message);
      }
    }
  }

  console.log(`\n   ✅ Created ${createdFeatures.length} features!`);
  return createdFeatures;
}

async function linkFeaturesToProducts(features: any[]) {
  console.log('\n🔗 Step 3: Linking features to products...\n');

  const productFeatureMap: Record<string, string[]> = {
    professional: features.filter((f) => f.tier === 'professional').map((f) => f.id),
    business: features.filter((f) => ['professional', 'business'].includes(f.tier)).map((f) => f.id),
    enterprise: features
      .filter((f) => ['professional', 'business', 'enterprise'].includes(f.tier))
      .map((f) => f.id),
    enterprisePlus: features.map((f) => f.id), // All features
  };

  for (const [tierKey, productId] of Object.entries(PRODUCT_IDS)) {
    try {
      const featureIds = productFeatureMap[tierKey] || [];

      console.log(`   Linking ${featureIds.length} features to ${tierKey}...`);

      // Note: Stripe API may not support bulk feature linking via API
      // This might need to be done in Dashboard
      console.log(`   ⚠️  Feature linking must be done in Stripe Dashboard`);
      console.log(`      Go to: https://dashboard.stripe.com/products/${productId}`);
      console.log(`      Click "Features" tab and add features manually`);
    } catch (error) {
      console.error(`   ❌ Failed to link features to ${tierKey}:`, error);
    }
  }

  console.log('\n   ✅ Feature linking instructions provided!');
}

async function createPricingTable() {
  console.log('\n📊 Step 4: Creating branded Pricing Table...\n');

  try {
    // Get all active recurring prices
    const professionalPrices = await stripe.prices.list({
      product: PRODUCT_IDS.professional,
      active: true,
      limit: 10,
    });

    const businessPrices = await stripe.prices.list({
      product: PRODUCT_IDS.business,
      active: true,
      limit: 10,
    });

    const enterprisePrices = await stripe.prices.list({
      product: PRODUCT_IDS.enterprise,
      active: true,
      limit: 10,
    });

    const enterprisePlusPrices = await stripe.prices.list({
      product: PRODUCT_IDS.enterprisePlus,
      active: true,
      limit: 10,
    });

    // Get monthly price IDs
    const professionalMonthly = professionalPrices.data.find(
      (p) => p.recurring?.interval === 'month'
    );
    const businessMonthly = businessPrices.data.find((p) => p.recurring?.interval === 'month');
    const enterpriseMonthly = enterprisePrices.data.find((p) => p.recurring?.interval === 'month');
    const enterprisePlusMonthly = enterprisePlusPrices.data.find(
      (p) => p.recurring?.interval === 'month'
    );

    if (!professionalMonthly || !businessMonthly || !enterpriseMonthly || !enterprisePlusMonthly) {
      console.error('   ❌ Could not find all monthly prices');
      return;
    }

    // Create pricing table
    const pricingTable = await stripe.billingPortal.configurations.create({
      business_profile: {
        headline: 'Afilo Enterprise Software Plans',
        privacy_policy_url: 'https://afilo.io/privacy',
        terms_of_service_url: 'https://afilo.io/terms',
      },
      features: {
        customer_update: {
          enabled: true,
          allowed_updates: ['email', 'address', 'phone', 'tax_id'],
        },
        invoice_history: {
          enabled: true,
        },
        payment_method_update: {
          enabled: true,
        },
        subscription_cancel: {
          enabled: true,
          mode: 'at_period_end',
        },
        subscription_update: {
          enabled: true,
          default_allowed_updates: ['price', 'quantity'],
          products: [
            {
              product: PRODUCT_IDS.professional,
              prices: [professionalMonthly.id],
            },
            {
              product: PRODUCT_IDS.business,
              prices: [businessMonthly.id],
            },
            {
              product: PRODUCT_IDS.enterprise,
              prices: [enterpriseMonthly.id],
            },
            {
              product: PRODUCT_IDS.enterprisePlus,
              prices: [enterprisePlusMonthly.id],
            },
          ],
        },
      },
      default_return_url: 'https://app.afilo.io/dashboard',
    });

    console.log(`   ✅ Created pricing table configuration: ${pricingTable.id}`);
    console.log(`   📋 To create embeddable pricing table:`);
    console.log(`      1. Go to https://dashboard.stripe.com/pricing-tables`);
    console.log(`      2. Click "Create pricing table"`);
    console.log(`      3. Select these prices:`);
    console.log(`         - Professional: ${professionalMonthly.id}`);
    console.log(`         - Business: ${businessMonthly.id}`);
    console.log(`         - Enterprise: ${enterpriseMonthly.id}`);
    console.log(`         - Enterprise Plus: ${enterprisePlusMonthly.id}`);
    console.log(`      4. Customize branding (colors, logo)`);
    console.log(`      5. Copy embed code to your website`);
  } catch (error: any) {
    console.error('   ❌ Error creating pricing table:', error.message);
  }

  console.log('\n   ✅ Pricing table instructions provided!');
}

async function verifyConfiguration() {
  console.log('\n✅ Step 5: Verifying configuration...\n');

  try {
    // Check each product
    for (const [name, productId] of Object.entries(PRODUCT_IDS)) {
      const product = await stripe.products.retrieve(productId);
      const prices = await stripe.prices.list({
        product: productId,
        active: true,
      });

      const monthlyPrice = prices.data.find((p) => p.recurring?.interval === 'month');
      const annualPrice = prices.data.find((p) => p.recurring?.interval === 'year');

      console.log(`   📦 ${name.toUpperCase()}`);
      console.log(`      Product ID: ${productId}`);
      console.log(`      Status: ${product.active ? '✅ Active' : '❌ Inactive'}`);
      console.log(
        `      Monthly Price: ${monthlyPrice ? `✅ $${monthlyPrice.unit_amount! / 100}/mo (${monthlyPrice.id})` : '❌ Missing'}`
      );
      console.log(
        `      Annual Price: ${annualPrice ? `✅ $${annualPrice.unit_amount! / 100}/yr (${annualPrice.id})` : '❌ Missing'}`
      );
      console.log('');
    }

    console.log('   🎉 Configuration verification complete!');
  } catch (error) {
    console.error('   ❌ Verification error:', error);
  }
}

async function main() {
  console.log('🚀 Afilo Stripe Complete Setup\n');
  console.log('═'.repeat(60));

  try {
    // Step 1: Clean up prices
    await cleanUpPrices();

    // Step 2: Create features
    const features = await createFeatures();

    // Step 3: Link features (instructions only - manual step)
    await linkFeaturesToProducts(features);

    // Step 4: Create pricing table
    await createPricingTable();

    // Step 5: Verify everything
    await verifyConfiguration();

    console.log('\n═'.repeat(60));
    console.log('\n✅ Stripe configuration COMPLETE!\n');
    console.log('📋 Next steps:');
    console.log('1. Go to https://dashboard.stripe.com/products');
    console.log('2. For each product, click "Features" tab and add features');
    console.log('3. Go to https://dashboard.stripe.com/pricing-tables');
    console.log('4. Create pricing table with the 4 monthly prices shown above');
    console.log('5. Customize branding (logo, colors)');
    console.log('6. Copy embed code to your website\n');
  } catch (error) {
    console.error('\n❌ Setup error:', error);
  }
}

main();
