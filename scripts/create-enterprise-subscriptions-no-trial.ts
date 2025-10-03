/**
 * Create Enterprise Subscription Products - IMMEDIATE PAYMENT (NO TRIALS)
 * Customers pay first, get instant access via email credentials
 *
 * Usage: pnpm tsx scripts/create-enterprise-subscriptions-no-trial.ts
 */

import Stripe from 'stripe';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
});

interface SubscriptionPlan {
  name: string;
  description: string;
  monthly: number;
  annual: number;
  users: string;
  features: string[];
  metadata: Record<string, string>;
}

const ENTERPRISE_PLANS: SubscriptionPlan[] = [
  {
    name: 'Professional Plan',
    description: 'Perfect for growing teams and small businesses',
    monthly: 49900, // $499/month
    annual: 498300, // $4,983/year (17% discount)
    users: '25',
    features: [
      'Up to 25 users',
      'Advanced analytics',
      'Priority support',
      'API access',
      'Custom integrations',
      'Instant access via email',
    ],
    metadata: {
      tier: 'professional',
      user_limit: '25',
      popular: 'false',
      access_type: 'instant_email_credentials',
    },
  },
  {
    name: 'Business Plan',
    description: 'Advanced features for scaling businesses',
    monthly: 149900, // $1,499/month
    annual: 1494300, // $14,943/year (17% discount)
    users: '100',
    features: [
      'Up to 100 users',
      'Advanced security',
      'Dedicated support',
      'Custom SLA',
      'SSO integration',
      'Instant access via email',
    ],
    metadata: {
      tier: 'business',
      user_limit: '100',
      popular: 'true',
      access_type: 'instant_email_credentials',
    },
  },
  {
    name: 'Enterprise Plan',
    description: 'Full-scale solution for large organizations',
    monthly: 499900, // $4,999/month
    annual: 4974300, // $49,743/year (17% discount)
    users: '500',
    features: [
      'Up to 500 users',
      'Enterprise security',
      'Account manager',
      'Custom onboarding',
      'White-label options',
      'Instant access via email',
    ],
    metadata: {
      tier: 'enterprise',
      user_limit: '500',
      popular: 'false',
      access_type: 'instant_email_credentials',
    },
  },
  {
    name: 'Enterprise Plus',
    description: 'Unlimited scale for Fortune 500 companies',
    monthly: 999900, // $9,999/month
    annual: 9954300, // $99,543/year (17% discount)
    users: 'unlimited',
    features: [
      'Unlimited users',
      'Premium security',
      'Dedicated team',
      'Custom development',
      'Full white-label',
      'Instant access via email',
    ],
    metadata: {
      tier: 'enterprise_plus',
      user_limit: 'unlimited',
      popular: 'false',
      access_type: 'instant_email_credentials',
    },
  },
];

async function createEnterpriseSubscriptions() {
  console.log('🚀 Creating Enterprise Subscription Products (NO TRIALS)...\n');

  for (const plan of ENTERPRISE_PLANS) {
    try {
      // Check if product already exists
      const existingProducts = await stripe.products.search({
        query: `name:'${plan.name}'`,
      });

      let product: Stripe.Product;

      if (existingProducts.data.length > 0) {
        product = existingProducts.data[0];
        console.log(`✅ Found existing: ${plan.name}`);

        // Update metadata to ensure correct settings
        await stripe.products.update(product.id, {
          description: plan.description,
          metadata: plan.metadata,
        });
      } else {
        // Create new product
        product = await stripe.products.create({
          name: plan.name,
          description: plan.description,
          metadata: {
            ...plan.metadata,
            features: plan.features.join('|'),
          },
        });
        console.log(`✅ Created product: ${plan.name}`);
      }

      // Create MONTHLY price (NO TRIAL)
      const monthlyPrices = await stripe.prices.list({
        product: product.id,
        active: true,
        recurring: { interval: 'month' },
      });

      if (monthlyPrices.data.length === 0) {
        const monthlyPrice = await stripe.prices.create({
          product: product.id,
          unit_amount: plan.monthly,
          currency: 'usd',
          recurring: {
            interval: 'month',
            // NO trial_period_days - immediate payment required
          },
          metadata: {
            billing_type: 'monthly',
            no_trial: 'true',
          },
        });
        console.log(`  ↳ Created monthly price: $${plan.monthly / 100}/month (NO TRIAL)`);
        console.log(`     Price ID: ${monthlyPrice.id}`);
      } else {
        console.log(`  ↳ Monthly price exists: ${monthlyPrices.data[0].id}`);
      }

      // Create ANNUAL price (NO TRIAL)
      const annualPrices = await stripe.prices.list({
        product: product.id,
        active: true,
        recurring: { interval: 'year' },
      });

      if (annualPrices.data.length === 0) {
        const annualPrice = await stripe.prices.create({
          product: product.id,
          unit_amount: plan.annual,
          currency: 'usd',
          recurring: {
            interval: 'year',
            // NO trial_period_days - immediate payment required
          },
          metadata: {
            billing_type: 'annual',
            discount_percentage: '17',
            no_trial: 'true',
          },
        });
        console.log(`  ↳ Created annual price: $${plan.annual / 100}/year (17% savings, NO TRIAL)`);
        console.log(`     Price ID: ${annualPrice.id}`);
      } else {
        console.log(`  ↳ Annual price exists: ${annualPrices.data[0].id}`);
      }

      console.log('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Error creating ${plan.name}:`, errorMessage);
    }
  }

  console.log('✅ Enterprise subscription products created!');
  console.log('📧 All plans configured for IMMEDIATE PAYMENT → EMAIL CREDENTIALS');
  console.log('\n📋 Next Steps:');
  console.log('1. Copy the Price IDs above');
  console.log('2. Update app/pricing/page.tsx with the actual Price IDs');
  console.log('3. Configure webhooks in Stripe Dashboard');
  console.log('4. Set RESEND_API_KEY in .env.local for email delivery');
}

createEnterpriseSubscriptions().catch(console.error);
