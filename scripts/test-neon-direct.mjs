#!/usr/bin/env node

import { neon } from '@neondatabase/serverless';

// Use your exact Neon URL from .env.local
const NEON_DATABASE_URL = 'postgresql://neondb_owner:npg_CAu5dvmhGER1@ep-square-forest-a10q31a6-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function testNeonConnection() {
  console.log('🔍 Testing Direct Neon Database Connection...\n');

  try {
    const sql = neon(NEON_DATABASE_URL);

    // Test basic connection
    console.log('1. Testing basic connection...');
    const result = await sql`SELECT NOW() as current_time, version() as db_version`;
    console.log('✅ Database connected successfully');
    console.log(`   Time: ${result[0].current_time}`);
    console.log(`   Version: ${result[0].db_version.split(' ')[0]}\n`);

    // Check existing tables
    console.log('2. Checking existing tables...');
    const allTables = await sql`
      SELECT table_name, table_type
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    console.log(`✅ Found ${allTables.length} tables in database:`);
    allTables.forEach(table => {
      console.log(`   - ${table.table_name} (${table.table_type})`);
    });
    console.log('');

    // Check specifically for authentication tables
    console.log('3. Checking authentication tables...');
    const authTables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('user_profiles', 'user_subscriptions', 'user_activity_log')
      ORDER BY table_name
    `;

    if (authTables.length === 0) {
      console.log('❌ Authentication tables not found');
      console.log('   Status: NEEDS MIGRATION');
      console.log('   Run: pnpm run db:setup\n');
    } else {
      console.log('✅ Found authentication tables:');
      authTables.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
      console.log('   Status: MIGRATION COMPLETE\n');
    }

    // Check if we can create a test table (to verify write permissions)
    console.log('4. Testing write permissions...');
    try {
      await sql`CREATE TABLE IF NOT EXISTS test_permissions (id SERIAL PRIMARY KEY, created_at TIMESTAMP DEFAULT NOW())`;
      await sql`DROP TABLE test_permissions`;
      console.log('✅ Write permissions confirmed\n');
    } catch (error) {
      console.log('❌ Write permissions failed:', error.message, '\n');
    }

    console.log('🎉 Database Status Summary:');
    console.log('   Connection: ✅ Working');
    console.log('   Database: neondb');
    console.log('   SSL: Required & Working');
    console.log(`   Migration Status: ${authTables.length === 3 ? '✅ Complete' : '❌ Needed'}`);

  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('   Error:', error.message);
    console.log('\n💡 Possible issues:');
    console.log('   1. Network connectivity to Neon');
    console.log('   2. Database credentials expired');
    console.log('   3. SSL certificate issues');
  }
}

testNeonConnection();