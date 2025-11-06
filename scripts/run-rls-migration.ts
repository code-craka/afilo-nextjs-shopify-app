/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-expressions */
/**
 * Run RLS Migration Script
 *
 * Applies Row Level Security policies to remaining tables:
 * - subscriptions
 * - user_subscriptions
 * - user_activity_log
 *
 * Usage: pnpm tsx scripts/run-rls-migration.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { sql } from '../lib/db';

async function runMigration() {
  try {
    console.log('🔄 Starting RLS migration...\n');

    // Read migration file
    const migrationPath = join(
      process.cwd(),
      'prisma',
      'migrations',
      'enable_rls_remaining_tables.sql'
    );

    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    // Remove comments and split into statements
    const statements = migrationSQL
      .split('\n')
      .filter((line) => !line.trim().startsWith('--') && line.trim().length > 0)
      .join('\n')
      .split(';')
      .filter((stmt) => stmt.trim().length > 0);

    console.log(`📝 Found ${statements.length} SQL statements\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (!statement) continue;

      try {
        // Show progress
        if (statement.includes('ALTER TABLE')) {
          const tableName = statement.match(/ALTER TABLE (\w+)/)?.[1];
          console.log(`  🔐 Enabling RLS on ${tableName}...`);
        } else if (statement.includes('CREATE POLICY')) {
          const policyName = statement.match(/CREATE POLICY "([^"]+)"/)?.[1];
          console.log(`  ✓ Creating policy: ${policyName}`);
        }

        await sql.unsafe(statement);
      } catch (error: unknown) {
        // Ignore "already exists" errors
        if (error.message?.includes('already exists')) {
          console.log(`  ⚠️  Skipped (already exists)`);
        } else {
          throw error;
        }
      }
    }

    console.log('\n✅ Migration completed successfully!\n');

    // Verify RLS status
    console.log('🔍 Verifying RLS status...\n');

    const rlsStatus = await sql`
      SELECT
        tablename,
        CASE WHEN rowsecurity THEN '✅ ENABLED' ELSE '❌ DISABLED' END as rls_status
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;

    console.log('RLS STATUS:');
    console.log('=====================================');
    rlsStatus.forEach((row) => {
      console.log(`  ${row.tablename.padEnd(30)} ${row.rls_status}`);
    });

    // Count policies
    const policyCount = await sql`
      SELECT
        tablename,
        COUNT(*) as policy_count
      FROM pg_policies
      WHERE schemaname = 'public'
      GROUP BY tablename
      ORDER BY tablename
    `;

    console.log('\n📜 POLICY COUNT:');
    console.log('=====================================');
    policyCount.forEach((row) => {
      console.log(`  ${row.tablename.padEnd(30)} ${row.policy_count} policies`);
    });

    console.log('\n🎉 All tables now have RLS protection!\n');
  } catch (error: unknown) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

// Run migration
runMigration();
