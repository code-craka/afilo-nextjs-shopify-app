/**
 * Alternative Cart Items Table Migration (Fetch-based)
 *
 * Uses neonConfig.fetchConnectionCache = true for better serverless compatibility
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { Pool, neonConfig } from '@neondatabase/serverless';

// Enable fetch for better serverless compatibility
neonConfig.fetchConnectionCache = true;

async function runMigration() {
  console.log('🚀 Starting cart_items table migration (alternative method)...\n');

  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 10000,
  });

  try {
    // First, test connection
    console.log('🔌 Testing database connection...');
    await pool.query('SELECT 1');
    console.log('✅ Connection successful!\n');

    // Read migration file
    const migrationPath = join(process.cwd(), 'prisma', 'migrations', 'create_cart_items.sql');
    console.log(`📄 Reading migration: ${migrationPath}`);
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    // Execute migration
    console.log('🔧 Creating cart_items table...\n');
    await pool.query(migrationSQL);
    console.log('✅ Migration executed!\n');

    // Verify
    const result = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'cart_items'
      ORDER BY ordinal_position;
    `);

    console.log(`✅ Table created with ${result.rows.length} columns:\n`);
    result.rows.forEach((row: any) => {
      console.log(`   - ${row.column_name} (${row.data_type})`);
    });

    console.log('\n🎉 Success! Cart system database is ready.\n');

  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);

    if (error.message.includes('already exists')) {
      console.log('\n✅ Table already exists! You can skip this migration.');
    } else if (error.message.includes('network')) {
      console.log('\n💡 Network error. Possible solutions:');
      console.log('   1. Check your internet connection');
      console.log('   2. Neon database may be sleeping - try again in 30 seconds');
      console.log('   3. Verify DATABASE_URL in .env.local');
      console.log('   4. Run migration manually via Neon dashboard SQL editor');
    }

    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
