/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-expressions */
#!/usr/bin/env node

/**
 * Setup Admin Role Script
 *
 * This script:
 * 1. Adds role column to user_profiles (if not exists)
 * 2. Lists existing users to help identify clerk_user_id
 * 3. Sets admin role for specified user
 */

const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

async function setupAdminRole() {
  const prisma = new PrismaClient();

  try {
    console.log('✅ Connected to database via Prisma');

    // Step 1: Add role column using raw SQL (if not exists)
    console.log('\n🔧 Adding role column...');
    await prisma.$executeRaw`
      ALTER TABLE user_profiles
      ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'standard';
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
    `;
    console.log('✅ Role column added');

    // Step 2: List existing users
    console.log('\n👥 Current users in database:');
    const users = await prisma.$queryRaw`
      SELECT clerk_user_id, email, first_name, last_name, role, created_at
      FROM user_profiles
      ORDER BY created_at DESC
      LIMIT 10;
    `;

    if (users.length === 0) {
      console.log('❌ No users found in database');
      console.log('💡 Make sure you have logged into the app at least once');
      return;
    }

    console.table(users);

    // Step 3: Set admin role for first user (most recent)
    const mostRecentUser = users[0];
    console.log(`\n🚀 Setting admin role for user: ${mostRecentUser.email || mostRecentUser.clerk_user_id}`);

    await prisma.$executeRaw`
      UPDATE user_profiles
      SET role = 'admin'
      WHERE clerk_user_id = ${mostRecentUser.clerk_user_id};
    `;

    // Verify admin role was set
    const adminCheck = await prisma.$queryRaw`
      SELECT clerk_user_id, email, role, created_at
      FROM user_profiles
      WHERE role = 'admin';
    `;

    console.log('\n✅ Admin users:');
    console.table(adminCheck);

    if (adminCheck.length > 0) {
      console.log('\n🎉 Admin role setup complete!');
      console.log('📍 You can now access: /dashboard/admin/chat');
    } else {
      console.log('\n❌ Failed to set admin role');
    }

  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

setupAdminRole();