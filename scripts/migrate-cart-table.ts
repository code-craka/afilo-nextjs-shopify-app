/**
 * Run Cart Items Table Migration
 *
 * This script creates the cart_items table in the Neon PostgreSQL database.
 *
 * Usage:
 *   pnpm tsx scripts/migrate-cart-table.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { Pool } from '@neondatabase/serverless';

async function runMigration() {
  console.log('🚀 Starting cart_items table migration...\n');

  // Check DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL environment variable is not set');
    console.log('Please add DATABASE_URL to your .env.local file');
    process.exit(1);
  }

  // Create database pool
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    // Read migration file
    const migrationPath = join(process.cwd(), 'prisma', 'migrations', 'create_cart_items.sql');
    console.log(`📄 Reading migration file: ${migrationPath}`);
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    // Execute migration
    console.log('🔧 Executing migration...\n');
    await pool.query(migrationSQL);

    console.log('✅ Migration completed successfully!\n');

    // Verify table exists
    console.log('🔍 Verifying table creation...');
    const verifyResult = await pool.query(`
      SELECT
        table_name,
        column_name,
        data_type,
        is_nullable
      FROM information_schema.columns
      WHERE table_name = 'cart_items'
      ORDER BY ordinal_position;
    `);

    if (verifyResult.rows.length === 0) {
      throw new Error('Table cart_items was not created');
    }

    console.log(`✅ Table cart_items created with ${verifyResult.rows.length} columns:\n`);
    verifyResult.rows.forEach((row: any) => {
      console.log(`   - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'NO' ? '🔒 NOT NULL' : ''}`);
    });

    // Verify indexes
    console.log('\n🔍 Verifying indexes...');
    const indexResult = await pool.query(`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = 'cart_items';
    `);

    console.log(`✅ Created ${indexResult.rows.length} indexes:`);
    indexResult.rows.forEach((row: any) => {
      console.log(`   - ${row.indexname}`);
    });

    console.log('\n🎉 Cart items table is ready to use!');
    console.log('\nNext steps:');
    console.log('1. Build Zustand cart store');
    console.log('2. Create cart API endpoints');
    console.log('3. Build cart UI components\n');

  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);

    // Provide helpful error messages
    if (error.message.includes('already exists')) {
      console.log('\n💡 The table already exists. If you want to recreate it:');
      console.log('   1. Run: DROP TABLE cart_items CASCADE;');
      console.log('   2. Re-run this migration script');
    } else if (error.message.includes('permission denied')) {
      console.log('\n💡 Database permission error. Check your DATABASE_URL credentials.');
    } else if (error.message.includes('could not connect')) {
      console.log('\n💡 Cannot connect to database. Check your DATABASE_URL and internet connection.');
    }

    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migration
runMigration();
