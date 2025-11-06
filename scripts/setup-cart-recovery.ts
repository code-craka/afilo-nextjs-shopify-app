/**
 * Cart Recovery Setup Script
 *
 * Phase 2 Feature: Enhanced E-commerce Features
 *
 * This script:
 * - Runs the cart recovery database migration
 * - Sets up default email campaigns
 * - Initializes the system
 *
 * Usage: pnpm tsx scripts/setup-cart-recovery.ts
 */

import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

async function setupCartRecovery() {
  try {
    console.log('🚀 Starting Cart Recovery System Setup...');

    // Step 1: Run the database migration
    console.log('📊 Running database migration...');

    const migrationPath = path.join(process.cwd(), 'prisma', 'migrations', 'add_cart_recovery_tables.sql');

    if (fs.existsSync(migrationPath)) {
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

      // Split SQL by statements and execute each one
      const statements = migrationSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      for (const statement of statements) {
        try {
          if (statement.toLowerCase().includes('create table') ||
              statement.toLowerCase().includes('create index') ||
              statement.toLowerCase().includes('create trigger') ||
              statement.toLowerCase().includes('create function') ||
              statement.toLowerCase().includes('insert into')) {
            await prisma.$executeRawUnsafe(statement);
            console.log('✅ Executed:', statement.substring(0, 50) + '...');
          }
        } catch (error) {
          if (error instanceof Error && error.message.includes('already exists')) {
            console.log('⚠️  Already exists:', statement.substring(0, 50) + '...');
          } else {
            console.error('❌ Error executing statement:', error);
          }
        }
      }
    } else {
      console.log('⚠️  Migration file not found, skipping...');
    }

    // Step 2: Verify tables exist
    console.log('🔍 Verifying cart recovery tables...');

    const tableChecks = [
      'cart_recovery_campaigns',
      'cart_recovery_sessions',
      'cart_recovery_email_logs',
      'cart_recovery_analytics'
    ];

    for (const table of tableChecks) {
      try {
        const result = await prisma.$queryRawUnsafe(`SELECT 1 FROM ${table} LIMIT 1`);
        console.log(`✅ Table ${table} exists and accessible`);
      } catch (error) {
        console.error(`❌ Table ${table} not accessible:`, error);
      }
    }

    // Step 3: Check for existing campaigns
    console.log('📧 Checking email campaigns...');

    const existingCampaigns = await prisma.cart_recovery_campaigns.findMany();
    console.log(`Found ${existingCampaigns.length} existing campaigns`);

    if (existingCampaigns.length === 0) {
      console.log('Creating default campaigns...');

      const defaultCampaigns = [
        {
          name: 'First Reminder - 24 Hours',
          description: 'Initial cart recovery email sent 24 hours after abandonment',
          trigger_delay_hours: 24,
          email_template: `<h2>You left something behind!</h2>
<p>Hi {{user_name}},</p>
<p>We noticed you left some great items in your cart. Don't miss out on these digital products!</p>

<div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0;">
    {{cart_items}}
</div>

<p><strong>Total: ${{cart_total}}</strong></p>

<p>Complete your purchase now and get instant access to your digital products.</p>

<a href="{{checkout_url}}" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Complete Purchase</a>

<p>This offer is valid for 7 days. Don't wait!</p>`,
          subject_line: 'You left something in your cart!',
          discount_percent: 0,
          discount_code: null,
        },
        {
          name: 'Second Reminder - 72 Hours',
          description: 'Follow-up cart recovery email with 10% discount',
          trigger_delay_hours: 72,
          email_template: `<h2>Still thinking it over?</h2>
<p>Hi {{user_name}},</p>
<p>Your cart is still waiting for you! As a special thank you for your interest, we're offering you 10% off your purchase.</p>

<div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0;">
    {{cart_items}}
</div>

<p><strong>Original Total: ${{cart_total}}</strong></p>
<p><strong>Your Price: ${{discounted_total}} (10% off!)</strong></p>

<p>Use code <strong>{{discount_code}}</strong> at checkout to get your discount.</p>

<a href="{{checkout_url}}" style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Get 10% Off Now</a>

<p>This exclusive offer expires in 3 days.</p>`,
          subject_line: 'Save 10% on your abandoned cart!',
          discount_percent: 10,
          discount_code: 'SAVE10NOW',
        },
        {
          name: 'Final Reminder - 168 Hours (7 days)',
          description: 'Last chance email with 15% discount',
          trigger_delay_hours: 168,
          email_template: `<h2>Last chance to save!</h2>
<p>Hi {{user_name}},</p>
<p>This is your final reminder about the items in your cart. We're offering our biggest discount - 15% off your entire purchase!</p>

<div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0;">
    {{cart_items}}
</div>

<p><strong>Original Total: ${{cart_total}}</strong></p>
<p><strong>Final Price: ${{discounted_total}} (15% off!)</strong></p>

<p>Use code <strong>{{discount_code}}</strong> at checkout.</p>

<a href="{{checkout_url}}" style="background: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Save 15% - Final Offer</a>

<p><em>This offer expires in 24 hours and won't be repeated.</em></p>`,
          subject_line: 'Final chance: 15% off your cart expires soon!',
          discount_percent: 15,
          discount_code: 'FINAL15OFF',
        },
      ];

      for (const campaign of defaultCampaigns) {
        try {
          await prisma.cart_recovery_campaigns.create({ data: campaign });
          console.log(`✅ Created campaign: ${campaign.name}`);
        } catch (error) {
          console.error(`❌ Failed to create campaign ${campaign.name}:`, error);
        }
      }
    }

    // Step 4: Initialize analytics table with today's data
    console.log('📈 Initializing analytics...');

    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    try {
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
    } catch (error) {
      console.error('❌ Failed to initialize analytics:', error);
    }

    // Step 5: Test database connectivity
    console.log('🧪 Testing cart recovery functionality...');

    try {
      const campaignCount = await prisma.cart_recovery_campaigns.count();
      const sessionCount = await prisma.cart_recovery_sessions.count();

      console.log(`✅ Found ${campaignCount} campaigns and ${sessionCount} cart sessions`);
    } catch (error) {
      console.error('❌ Database connectivity test failed:', error);
    }

    console.log('🎉 Cart Recovery System Setup Complete!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Set up email service integration in cart-recovery-service.ts');
    console.log('2. Configure CRON_SECRET environment variable');
    console.log('3. Set up automated cron job to call /api/cron/cart-recovery');
    console.log('4. Test the system with some abandoned carts');
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
setupCartRecovery().catch((error) => {
  console.error('Setup script failed:', error);
  process.exit(1);
});