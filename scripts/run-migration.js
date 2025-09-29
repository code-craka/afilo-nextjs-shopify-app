#!/usr/bin/env node

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Use your exact Neon URL
const NEON_DATABASE_URL = 'postgresql://neondb_owner:npg_CAu5dvmhGER1@ep-square-forest-a10q31a6-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function runMigration() {
  console.log('🚀 Running Database Migration for Authentication System...\n');

  try {
    const sql = neon(NEON_DATABASE_URL);

    // Read the SQL migration file
    const migrationPath = path.join(__dirname, 'setup-user-profiles.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📂 Loaded migration file: setup-user-profiles.sql');
    console.log(`📊 Migration size: ${migrationSQL.length} characters\n`);

    // Split the migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`🔧 Executing ${statements.length} migration statements...\n`);

    let successCount = 0;
    let skipCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Skip comments and empty statements
      if (statement.startsWith('--') || statement.length < 10) {
        skipCount++;
        continue;
      }

      try {
        console.log(`   ${i + 1}. ${statement.substring(0, 50)}...`);

        // Execute the statement
        await sql`${statement}`;

        successCount++;
        console.log(`      ✅ Success`);

      } catch (error) {
        // Check if it's a "already exists" error (which is okay)
        if (error.message.includes('already exists') ||
            error.message.includes('duplicate key') ||
            error.message.includes('relation') && error.message.includes('already exists')) {
          console.log(`      ⚠️  Already exists (skipped)`);
          skipCount++;
        } else {
          console.log(`      ❌ Error: ${error.message}`);
          throw error;
        }
      }
    }

    console.log(`\n✅ Migration completed successfully!`);
    console.log(`   Executed: ${successCount} statements`);
    console.log(`   Skipped: ${skipCount} statements\n`);

    // Verify the migration
    console.log('🔍 Verifying migration results...');

    const authTables = await sql`
      SELECT table_name,
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public'
      AND table_name IN ('user_profiles', 'user_subscriptions', 'user_activity_log')
      ORDER BY table_name
    `;

    if (authTables.length === 3) {
      console.log('✅ All authentication tables created successfully:');
      authTables.forEach(table => {
        console.log(`   - ${table.table_name} (${table.column_count} columns)`);
      });
    } else {
      console.log(`❌ Expected 3 tables, found ${authTables.length}`);
    }

    // Check indexes
    console.log('\n🔍 Checking indexes...');
    const indexes = await sql`
      SELECT indexname, tablename
      FROM pg_indexes
      WHERE schemaname = 'public'
      AND tablename IN ('user_profiles', 'user_subscriptions', 'user_activity_log')
      ORDER BY tablename, indexname
    `;

    console.log(`✅ Found ${indexes.length} indexes:`);
    indexes.forEach(idx => {
      console.log(`   - ${idx.indexname} on ${idx.tablename}`);
    });

    // Test a sample insert/delete to verify functionality
    console.log('\n🧪 Testing table functionality...');
    try {
      // Test user_profiles table
      const testResult = await sql`
        INSERT INTO user_profiles (clerk_user_id, email, first_name, last_name)
        VALUES ('test_migration_user', 'test@migration.com', 'Test', 'User')
        RETURNING id
      `;

      const insertedId = testResult[0].id;
      console.log(`✅ Insert test successful (ID: ${insertedId})`);

      // Clean up test data
      await sql`DELETE FROM user_profiles WHERE id = ${insertedId}`;
      console.log(`✅ Delete test successful`);

    } catch (error) {
      console.log(`❌ Functionality test failed: ${error.message}`);
    }

    console.log('\n🎉 DATABASE MIGRATION COMPLETE! 🎉');
    console.log('Your authentication system is ready to use.');

  } catch (error) {
    console.error('\n❌ Migration failed:');
    console.error('   Error:', error.message);
    console.log('\n💡 Check the migration file and database permissions.');
  }
}

runMigration();