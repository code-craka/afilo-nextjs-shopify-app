#!/usr/bin/env node

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function testDatabaseConnection() {
  console.log('🔍 Testing Neon Database Connection...\n');

  // Debug environment loading
  console.log('📊 Environment Debug:');
  console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`   DATABASE_URL exists: ${!!process.env.DATABASE_URL}`);
  if (process.env.DATABASE_URL) {
    const url = process.env.DATABASE_URL;
    const maskedUrl = url.replace(/(postgresql:\/\/[^:]+:)[^@]+(@.+)/, '$1***$2');
    console.log(`   DATABASE_URL: ${maskedUrl}`);
  }
  console.log('');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in environment variables');
    console.log('💡 Make sure .env.local exists and contains DATABASE_URL');
    return;
  }

  try {
    // Test basic connection
    console.log('1. Testing basic connection...');
    const result = await sql`SELECT NOW() as current_time, version() as db_version`;
    console.log('✅ Database connected successfully');
    console.log(`   Time: ${result[0].current_time}`);
    console.log(`   Version: ${result[0].db_version.split(' ')[0]}\n`);

    // Check if authentication tables exist
    console.log('2. Checking authentication tables...');
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('user_profiles', 'user_subscriptions', 'user_activity_log')
      ORDER BY table_name
    `;

    if (tables.length === 0) {
      console.log('❌ Authentication tables not found');
      console.log('   Run: pnpm run db:setup\n');
    } else {
      console.log('✅ Found authentication tables:');
      tables.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
      console.log('');
    }

    // Check table structures if they exist
    if (tables.length > 0) {
      console.log('3. Checking table structures...');

      for (const table of tables) {
        const columns = await sql`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns
          WHERE table_name = ${table.table_name}
          ORDER BY ordinal_position
        `;

        console.log(`   📋 ${table.table_name} (${columns.length} columns):`);
        columns.slice(0, 5).forEach(col => {
          console.log(`      - ${col.column_name} (${col.data_type})`);
        });
        if (columns.length > 5) {
          console.log(`      ... and ${columns.length - 5} more columns`);
        }
        console.log('');
      }
    }

    // Test sample operations
    if (tables.some(t => t.table_name === 'user_profiles')) {
      console.log('4. Testing sample operations...');
      const profileCount = await sql`SELECT COUNT(*) as count FROM user_profiles`;
      console.log(`✅ user_profiles table accessible (${profileCount[0].count} records)`);
    }

    console.log('🎉 Database migration status: READY');

  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('   Error:', error.message);

    if (error.message.includes('does not exist')) {
      console.log('\n💡 Next steps:');
      console.log('   1. Run: pnpm run db:setup');
      console.log('   2. Verify DATABASE_URL in .env.local');
    }
  }
}

testDatabaseConnection();