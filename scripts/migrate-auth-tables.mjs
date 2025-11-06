#!/usr/bin/env node

import { neon } from '@neondatabase/serverless';

// Use your exact Neon URL
const NEON_DATABASE_URL = 'postgresql://neondb_owner:npg_CAu5dvmhGER1@ep-square-forest-a10q31a6-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function migrateAuthTables() {
  console.log('🚀 Creating Authentication Tables in Neon Database...\n');

  try {
    const sql = neon(NEON_DATABASE_URL);

    // Step 1: Create user_profiles table
    console.log('1. Creating user_profiles table...');
    await sql`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        clerk_user_id VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255),
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        oauth_signup BOOLEAN DEFAULT FALSE,
        subscription_tier VARCHAR(50) DEFAULT 'free',
        company VARCHAR(255),
        job_title VARCHAR(255),
        phone VARCHAR(50),
        avatar_url TEXT,
        last_login TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('   ✅ user_profiles table created');

    // Step 2: Create user_subscriptions table
    console.log('2. Creating user_subscriptions table...');
    await sql`
      CREATE TABLE IF NOT EXISTS user_subscriptions (
        id SERIAL PRIMARY KEY,
        user_profile_id INTEGER REFERENCES user_profiles(id) ON DELETE CASCADE,
        subscription_tier VARCHAR(50) NOT NULL,
        price_paid DECIMAL(10,2),
        billing_period VARCHAR(20),
        start_date TIMESTAMP WITH TIME ZONE NOT NULL,
        end_date TIMESTAMP WITH TIME ZONE,
        status VARCHAR(20) DEFAULT 'active',
        shopify_subscription_id VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('   ✅ user_subscriptions table created');

    // Step 3: Create user_activity_log table
    console.log('3. Creating user_activity_log table...');
    await sql`
      CREATE TABLE IF NOT EXISTS user_activity_log (
        id SERIAL PRIMARY KEY,
        user_profile_id INTEGER REFERENCES user_profiles(id) ON DELETE CASCADE,
        activity_type VARCHAR(50) NOT NULL,
        activity_data JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('   ✅ user_activity_log table created');

    // Step 4: Create indexes
    console.log('4. Creating indexes...');

    await sql`CREATE INDEX IF NOT EXISTS idx_user_profiles_clerk_user_id ON user_profiles(clerk_user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_tier ON user_profiles(subscription_tier)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at)`;

    await sql`CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_profile_id ON user_subscriptions(user_profile_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_subscriptions_shopify_id ON user_subscriptions(shopify_subscription_id)`;

    await sql`CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_profile_id ON user_activity_log(user_profile_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_activity_log_activity_type ON user_activity_log(activity_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON user_activity_log(created_at)`;

    console.log('   ✅ Indexes created');

    // Step 5: Create update function and triggers
    console.log('5. Creating update triggers...');

    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;

    // Drop existing triggers if they exist
    await sql`DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles`;
    await sql`DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON user_subscriptions`;

    // Create new triggers
    await sql`
      CREATE TRIGGER update_user_profiles_updated_at
        BEFORE UPDATE ON user_profiles
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `;

    await sql`
      CREATE TRIGGER update_user_subscriptions_updated_at
        BEFORE UPDATE ON user_subscriptions
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `;

    console.log('   ✅ Triggers created');

    // Step 6: Verify migration
    console.log('\n🔍 Verifying migration...');

    const tables = await sql`
      SELECT table_name,
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public'
      AND table_name IN ('user_profiles', 'user_subscriptions', 'user_activity_log')
      ORDER BY table_name
    `;

    console.log('✅ Authentication tables:');
    tables.forEach(table => {
      console.log(`   - ${table.table_name} (${table.column_count} columns)`);
    });

    const indexes = await sql`
      SELECT indexname, tablename
      FROM pg_indexes
      WHERE schemaname = 'public'
      AND tablename IN ('user_profiles', 'user_subscriptions', 'user_activity_log')
      ORDER BY tablename, indexname
    `;

    console.log(`✅ Indexes created: ${indexes.length}`);

    // Step 7: Test functionality
    console.log('\n🧪 Testing functionality...');

    const testResult = await sql`
      INSERT INTO user_profiles (clerk_user_id, email, first_name, last_name, oauth_signup)
      VALUES ('test_user_123', 'test@example.com', 'Test', 'User', true)
      RETURNING id, created_at, updated_at
    `;

    const userId = testResult[0].id;
    console.log(`✅ Test user created (ID: ${userId})`);

    // Test the trigger
    const beforeUpdate = testResult[0].updated_at;
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

    await sql`UPDATE user_profiles SET first_name = 'TestUpdated' WHERE id = ${userId}`;

    const afterUpdate = await sql`SELECT updated_at FROM user_profiles WHERE id = ${userId}`;
    const afterUpdateTime = afterUpdate[0].updated_at;

    if (afterUpdateTime > beforeUpdate) {
      console.log('✅ Update trigger working correctly');
    } else {
      console.log('⚠️  Update trigger may not be working');
    }

    // Test subscription table
    await sql`
      INSERT INTO user_subscriptions (user_profile_id, subscription_tier, start_date, status)
      VALUES (${userId}, 'professional', NOW(), 'active')
    `;
    console.log('✅ Subscription test successful');

    // Test activity log
    await sql`
      INSERT INTO user_activity_log (user_profile_id, activity_type, activity_data)
      VALUES (${userId}, 'account_created', '{"source": "migration_test"}')
    `;
    console.log('✅ Activity log test successful');

    // Clean up test data
    await sql`DELETE FROM user_profiles WHERE id = ${userId}`;
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 AUTHENTICATION SYSTEM MIGRATION COMPLETE! 🎉');
    console.log('✅ All tables, indexes, and triggers are ready');
    console.log('✅ Database is configured for your authentication system');

  } catch (error) {
    console.error('\n❌ Migration failed:');
    console.error('   Error:', error.message);
    console.error('   Stack:', error.stack);
  }
}

migrateAuthTables();