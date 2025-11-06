#!/usr/bin/env node

/**
 * Simple Admin Setup Script (ES Module)
 *
 * Connects directly to Neon database and sets admin role
 */

import pkg from 'pg';
const { Client } = pkg;
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

async function setupAdmin() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to Neon database');

    // Check if user_profiles table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'user_profiles'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ user_profiles table does not exist');
      console.log('💡 Run the user profiles setup script first');
      return;
    }

    // List existing users
    console.log('\n👥 Existing users:');
    const users = await client.query(`
      SELECT clerk_user_id, email, first_name, last_name, role, created_at
      FROM user_profiles
      ORDER BY created_at DESC
      LIMIT 10;
    `);

    if (users.rows.length === 0) {
      console.log('❌ No users found in database');
      console.log('💡 Please log into the app at least once to create your user profile');
      return;
    }

    console.table(users.rows);

    // Set admin role for the most recent user
    const mostRecentUser = users.rows[0];
    console.log(`\n🚀 Setting admin role for: ${mostRecentUser.email || mostRecentUser.clerk_user_id}`);

    await client.query(`
      UPDATE user_profiles
      SET role = 'admin'
      WHERE clerk_user_id = $1;
    `, [mostRecentUser.clerk_user_id]);

    // Verify admin role was set
    const adminUsers = await client.query(`
      SELECT clerk_user_id, email, role, created_at
      FROM user_profiles
      WHERE role = 'admin';
    `);

    console.log('\n✅ Admin users:');
    console.table(adminUsers.rows);

    if (adminUsers.rows.length > 0) {
      console.log('\n🎉 SUCCESS! Admin role setup complete!');
      console.log('🔗 Access admin dashboard: https://app.afilo.io/dashboard/admin/chat');
      console.log('🔗 Or locally: http://localhost:3000/dashboard/admin/chat');
    } else {
      console.log('\n❌ Failed to set admin role');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);

    if (error.message.includes('relation "user_profiles" does not exist')) {
      console.log('\n💡 Solution: Run the user profiles setup first:');
      console.log('   node scripts/setup-user-profiles.sql');
    }
  } finally {
    await client.end();
  }
}

setupAdmin();