#!/usr/bin/env tsx
/**
 * Database Migration Verification Script
 * Verifies all tables from Prisma schema exist in the database
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// All tables from Prisma schema
const CORE_TABLES = [
  // Core Product & User Tables
  'user_profiles',
  'products',
  'product_variants',
  'product_collections',
  'product_collection_products',
  'product_pricing_tiers',
  'unified_products',

  // Cart & Subscriptions
  'cart_items',
  'subscriptions',
  'user_subscriptions',
  'downloads',

  // Social Proof & Marketing
  'product_social_proof',
  'product_testimonials',
  'product_sale_timers',

  // Cart Recovery System
  'cart_recovery_campaigns',
  'cart_recovery_sessions',
  'cart_recovery_email_logs',
  'cart_recovery_analytics',

  // Chat Bot System
  'chat_conversations',
  'chat_messages',
  'knowledge_base',
  'bot_analytics',

  // Enterprise Monitoring
  'api_monitoring',
  'audit_logs',
  'webhook_events',
  'rate_limit_tracking',

  // Cookie Consent
  'cookie_consent_records',
  'cookie_consent_audit_log',
  'cookie_policy_versions',

  // Stripe Connect Marketplace
  'stripe_connect_accounts',
  'marketplace_transfers',
  'connect_account_sessions',

  // ACH Authorization
  'ach_authorizations',
  'ach_authorization_evidence',
  'ach_dispute_inquiries',

  // Payments
  'payment_transactions',

  // Activity Logs
  'user_activity_log',
];

interface TableInfo {
  table: string;
  exists: boolean;
  count?: number;
  error?: string;
}

async function verifyTables(): Promise<void> {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🗄️  DATABASE MIGRATION VERIFICATION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  // Test connectivity
  console.log('Step 1: Testing Database Connectivity');
  try {
    await prisma.$queryRaw`SELECT 1 as health_check`;
    console.log('✅ Database connection: SUCCESS');
  } catch (error) {
    console.error('❌ Cannot connect to database:', error);
    process.exit(1);
  }
  console.log('');

  // Verify tables
  console.log(`Step 2: Verifying Tables (${CORE_TABLES.length} tables)`);
  console.log('');

  const results: TableInfo[] = [];
  const missingTables: string[] = [];
  const existingTables: string[] = [];
  let totalRecords = 0;

  for (const table of CORE_TABLES) {
    try {
      // Check if table exists
      const tableExists = await prisma.$queryRaw<Array<{ exists: boolean }>>`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_name = ${table}
        );
      `;

      const exists = tableExists[0]?.exists ?? false;

      if (exists) {
        try {
          // Get record count
          const countResult = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
            `SELECT COUNT(*) as count FROM "${table}";`
          );
          const count = Number(countResult[0]?.count ?? 0);

          console.log(`✅ ${table}: EXISTS (${count} records)`);
          existingTables.push(table);
          totalRecords += count;

          results.push({ table, exists: true, count });
        } catch (countError) {
          console.log(`✅ ${table}: EXISTS`);
          existingTables.push(table);
          results.push({ table, exists: true });
        }
      } else {
        console.log(`❌ ${table}: MISSING`);
        missingTables.push(table);
        results.push({ table, exists: false });
      }
    } catch (error) {
      console.log(`❌ ${table}: ERROR - ${error instanceof Error ? error.message : 'Unknown error'}`);
      results.push({
        table,
        exists: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  console.log(`ℹ️  Total Tables Expected: ${CORE_TABLES.length}`);
  console.log(`✅ Tables Found: ${existingTables.length}`);
  console.log(`ℹ️  Total Records: ${totalRecords}`);

  if (missingTables.length > 0) {
    console.log(`❌ Missing Tables: ${missingTables.length}`);
    console.log('');
    console.log('Missing tables:');
    missingTables.forEach((table) => console.log(`  - ${table}`));
    console.log('');
    console.log('ℹ️  To migrate missing tables, run:');
    console.log('  pnpm prisma db push');
    console.log('  OR');
    console.log('  psql "$DATABASE_URL" -f prisma/migrations/xxx_add_digital_products_ecosystem/migration.sql');
    console.log('');
    process.exit(1);
  } else {
    console.log('');
    console.log('✅ All database tables are migrated successfully!');
    console.log('');
  }

  // Check migration history
  console.log('Step 3: Checking Migration History');
  try {
    const migrationsTableExists = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = '_prisma_migrations'
      );
    `;

    if (migrationsTableExists[0]?.exists) {
      const migrationCount = await prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count FROM "_prisma_migrations";
      `;
      const count = Number(migrationCount[0]?.count ?? 0);
      console.log(`✅ Migration tracking: ENABLED (${count} migrations)`);

      // Get last migration
      const lastMigration = await prisma.$queryRaw<Array<{ migration_name: string }>>`
        SELECT migration_name
        FROM "_prisma_migrations"
        ORDER BY finished_at DESC
        LIMIT 1;
      `;

      if (lastMigration.length > 0) {
        console.log(`ℹ️  Last migration: ${lastMigration[0].migration_name}`);
      }
    } else {
      console.log('ℹ️  Migration tracking: Not using Prisma Migrate');
      console.log('ℹ️  (Using manual SQL migrations)');
    }
  } catch (error) {
    console.log('⚠️  Could not check migration history');
  }

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Database verification completed successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
}

async function main() {
  try {
    await verifyTables();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
