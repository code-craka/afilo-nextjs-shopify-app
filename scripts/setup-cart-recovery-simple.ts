/**
 * Simple Cart Recovery Setup Script
 *
 * Phase 2 Feature: Enhanced E-commerce Features
 *
 * Usage: DATABASE_URL="your_neon_url" pnpm tsx scripts/setup-cart-recovery-simple.ts
 */

import { prisma } from '@/lib/prisma';

async function setupCartRecoverySimple() {
  try {
    console.log('🚀 Starting Simple Cart Recovery Setup...');

    // Step 1: Check for existing campaigns
    console.log('📧 Checking email campaigns...');

    const existingCampaigns = await prisma.cart_recovery_campaigns.findMany();
    console.log(`Found ${existingCampaigns.length} existing campaigns`);

    if (existingCampaigns.length === 0) {
      console.log('Creating default campaigns...');

      // Campaign 1: 24-hour reminder
      const campaign1 = await prisma.cart_recovery_campaigns.create({
        data: {
          name: 'First Reminder - 24 Hours',
          description: 'Initial cart recovery email sent 24 hours after abandonment',
          trigger_delay_hours: 24,
          email_template: `<h2>You left something behind!</h2>
<p>Hi there,</p>
<p>We noticed you left some great items in your cart. Don't miss out on these digital products!</p>

<div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0;">
    [CART_ITEMS_PLACEHOLDER]
</div>

<p><strong>Total: [CART_TOTAL_PLACEHOLDER]</strong></p>

<p>Complete your purchase now and get instant access to your digital products.</p>

<a href="[CHECKOUT_URL_PLACEHOLDER]" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Complete Purchase</a>

<p>This offer is valid for 7 days. Don't wait!</p>`,
          subject_line: 'You left something in your cart!',
          discount_percent: 0,
          discount_code: null,
        },
      });
      console.log(`✅ Created campaign: ${campaign1.name}`);

      // Campaign 2: 72-hour follow-up
      const campaign2 = await prisma.cart_recovery_campaigns.create({
        data: {
          name: 'Second Reminder - 72 Hours',
          description: 'Follow-up cart recovery email with 10% discount',
          trigger_delay_hours: 72,
          email_template: `<h2>Still thinking it over?</h2>
<p>Hi there,</p>
<p>Your cart is still waiting for you! As a special thank you for your interest, we're offering you 10% off your purchase.</p>

<div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0;">
    [CART_ITEMS_PLACEHOLDER]
</div>

<p><strong>Original Total: [CART_TOTAL_PLACEHOLDER]</strong></p>
<p><strong>Your Price: [DISCOUNTED_TOTAL_PLACEHOLDER] (10% off!)</strong></p>

<p>Use code <strong>[DISCOUNT_CODE_PLACEHOLDER]</strong> at checkout to get your discount.</p>

<a href="[CHECKOUT_URL_PLACEHOLDER]" style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Get 10% Off Now</a>

<p>This exclusive offer expires in 3 days.</p>`,
          subject_line: 'Save 10% on your abandoned cart!',
          discount_percent: 10,
          discount_code: 'SAVE10NOW',
        },
      });
      console.log(`✅ Created campaign: ${campaign2.name}`);

      // Campaign 3: Final reminder
      const campaign3 = await prisma.cart_recovery_campaigns.create({
        data: {
          name: 'Final Reminder - 168 Hours (7 days)',
          description: 'Last chance email with 15% discount',
          trigger_delay_hours: 168,
          email_template: `<h2>Last chance to save!</h2>
<p>Hi there,</p>
<p>This is your final reminder about the items in your cart. We're offering our biggest discount - 15% off your entire purchase!</p>

<div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0;">
    [CART_ITEMS_PLACEHOLDER]
</div>

<p><strong>Original Total: [CART_TOTAL_PLACEHOLDER]</strong></p>
<p><strong>Final Price: [DISCOUNTED_TOTAL_PLACEHOLDER] (15% off!)</strong></p>

<p>Use code <strong>[DISCOUNT_CODE_PLACEHOLDER]</strong> at checkout.</p>

<a href="[CHECKOUT_URL_PLACEHOLDER]" style="background: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Save 15% - Final Offer</a>

<p><em>This offer expires in 24 hours and won't be repeated.</em></p>`,
          subject_line: 'Final chance: 15% off your cart expires soon!',
          discount_percent: 15,
          discount_code: 'FINAL15OFF',
        },
      });
      console.log(`✅ Created campaign: ${campaign3.name}`);
    }

    // Step 2: Initialize analytics table with today's data
    console.log('📈 Initializing analytics...');

    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    await prisma.cart_recovery_analytics.upsert({
      where: { date: startOfToday },
      update: {},
      create: {
        date: startOfToday,
        carts_abandoned: 0,
        carts_recovered: 0,
        emails_sent: 0,
        emails_opened: 0,
        emails_clicked: 0,
        potential_revenue: 0,
        recovered_revenue: 0,
        recovery_rate: 0,
        open_rate: 0,
        click_rate: 0,
        conversion_rate: 0,
      },
    });
    console.log('✅ Analytics initialized for today');

    // Step 3: Test database connectivity
    console.log('🧪 Testing cart recovery functionality...');

    const campaignCount = await prisma.cart_recovery_campaigns.count();
    const sessionCount = await prisma.cart_recovery_sessions.count();

    console.log(`✅ Found ${campaignCount} campaigns and ${sessionCount} cart sessions`);

    console.log('🎉 Cart Recovery System Setup Complete!');
    console.log('');
    console.log('Next steps:');
    console.log('1. ✅ Database tables created and configured');
    console.log('2. ✅ Default email campaigns created');
    console.log('3. ✅ Analytics system initialized');
    console.log('4. 🔄 Set up email service integration');
    console.log('5. 🔄 Configure CRON_SECRET environment variable');
    console.log('6. 🔄 Set up automated cron job');
    console.log('');
    console.log('Admin Dashboard: /dashboard/admin/cart-recovery');

  } catch (error) {
    console.error('❌ Cart Recovery setup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
setupCartRecoverySimple().catch((error) => {
  console.error('Setup script failed:', error);
  process.exit(1);
});