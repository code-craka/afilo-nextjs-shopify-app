/**
 * Verify Database Tables
 *
 * Checks if all required tables exist in Neon database
 */

import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';

// Load .env.local
config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not set in .env.local');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function verifyDatabase() {
  console.log('🔍 Checking database connection...\n');

  try {
    // Check connection
    const result = await sql`SELECT NOW() as current_time`;
    console.log('✅ Database connected:', result[0].current_time);
    console.log('');

    // Check tables
    console.log('📊 Checking tables...\n');

    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    console.log('Found tables:', tables.length);
    tables.forEach(t => console.log('  ✓', t.table_name));
    console.log('');

    // Required tables
    const requiredTables = [
      'user_profiles',
      'user_subscriptions',
      'user_activity_log'
    ];

    console.log('🔎 Verifying required tables...\n');

    const tableNames = tables.map(t => t.table_name);
    const missing = requiredTables.filter(t => !tableNames.includes(t));

    if (missing.length > 0) {
      console.log('❌ Missing tables:', missing.join(', '));
      console.log('\n📝 To create missing tables, run:');
      console.log('   psql $DATABASE_URL -f scripts/setup-user-profiles.sql');
      process.exit(1);
    } else {
      console.log('✅ All required tables exist!');
    }

    // Check user_profiles structure
    console.log('\n📋 user_profiles columns:');
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'user_profiles'
      ORDER BY ordinal_position
    `;

    columns.forEach(c => {
      console.log(`  ${c.column_name} (${c.data_type}) ${c.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Check indexes
    console.log('\n🔗 Indexes:');
    const indexes = await sql`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = 'user_profiles'
    `;

    indexes.forEach(idx => console.log('  ✓', idx.indexname));

    console.log('\n✅ Database verification complete!');

  } catch (error) {
    console.error('❌ Database error:', error.message);
    process.exit(1);
  }
}

verifyDatabase();
