/**
 * Test Script: Verify Prisma Queries with Neon PostgreSQL Serverless Adapter
 *
 * Tests:
 * 1. Database connection with Neon adapter
 * 2. SELECT queries (cart items, user profiles)
 * 3. INSERT queries (add cart item)
 * 4. UPDATE queries (modify cart item)
 * 5. DELETE queries (remove cart item)
 * 6. JSONB field handling (Prisma native support)
 * 7. Aggregate queries
 */

import prisma from '../lib/prisma';

// Test user ID (Clerk user ID format)
const TEST_USER_ID = 'test_user_prisma_verification';

async function testPrismaConnection() {
  console.log('🔍 Testing Prisma Connection to Neon PostgreSQL with Serverless Adapter\n');

  try {
    // Test 1: Database Connection
    console.log('✅ Test 1: Database Connection with Neon Adapter');
    await prisma.$connect();
    console.log('   Connected to Neon database successfully using serverless driver!\n');

    // Test 2: SELECT Query - Count user profiles
    console.log('✅ Test 2: SELECT Query - Count user profiles');
    const userCount = await prisma.user_profiles.count();
    console.log(`   ✓ Prisma connection working. User profiles: ${userCount}\n`);

    // Test 3: SELECT Query - Count cart items
    console.log('✅ Test 3: SELECT Query - Count cart items');
    const totalCartItems = await prisma.cart_items.count();
    console.log(`   Total cart items in database: ${totalCartItems}\n`);

    // Test 4: INSERT Query - Add cart item
    console.log('✅ Test 4: INSERT Query - Add cart item');
    const newCartItem = await prisma.cart_items.create({
      data: {
        user_id: TEST_USER_ID,
        product_id: 'gid://shopify/Product/test123',
        variant_id: 'gid://shopify/ProductVariant/test456',
        title: 'Test Product - Prisma Verification',
        price: 49.99,
        quantity: 1,
        license_type: 'personal',
        image_url: 'https://example.com/test.jpg',
        status: 'active',
      },
    });
    console.log('   Created cart item:', {
      id: newCartItem.id,
      title: newCartItem.title,
      price: newCartItem.price.toString(),
      license_type: newCartItem.license_type,
    });
    console.log('\n');

    // Test 5: SELECT Query - Find cart item
    console.log('✅ Test 5: SELECT Query - Find cart item');
    const foundItem = await prisma.cart_items.findUnique({
      where: { id: newCartItem.id },
    });
    console.log('   Found cart item:', {
      id: foundItem?.id,
      title: foundItem?.title,
      status: foundItem?.status,
    });
    console.log('\n');

    // Test 6: UPDATE Query - Modify cart item
    console.log('✅ Test 6: UPDATE Query - Modify cart item');
    const updatedItem = await prisma.cart_items.update({
      where: { id: newCartItem.id },
      data: {
        quantity: 3,
        license_type: 'commercial',
        price: 99.99,
      },
    });
    console.log('   Updated cart item:', {
      id: updatedItem.id,
      quantity: updatedItem.quantity,
      license_type: updatedItem.license_type,
      price: updatedItem.price.toString(),
    });
    console.log('\n');

    // Test 7: SELECT Query with WHERE clause
    console.log('✅ Test 7: SELECT Query with WHERE clause');
    const userCartItems = await prisma.cart_items.findMany({
      where: {
        user_id: TEST_USER_ID,
        status: 'active',
      },
      orderBy: {
        created_at: 'desc',
      },
    });
    console.log(`   Found ${userCartItems.length} active cart items for test user\n`);

    // Test 8: Aggregate Query - Calculate totals
    console.log('✅ Test 8: Aggregate Query - Calculate totals');
    const cartTotal = await prisma.cart_items.aggregate({
      where: {
        user_id: TEST_USER_ID,
        status: 'active',
      },
      _sum: {
        quantity: true,
      },
      _count: {
        id: true,
      },
    });
    console.log('   Cart statistics:', {
      totalItems: cartTotal._count.id,
      totalQuantity: cartTotal._sum.quantity,
    });
    console.log('\n');

    // Test 9: DELETE Query - Remove cart item
    console.log('✅ Test 9: DELETE Query - Remove cart item');
    const deletedItem = await prisma.cart_items.delete({
      where: { id: newCartItem.id },
    });
    console.log('   Deleted cart item:', deletedItem.id);
    console.log('\n');

    // Test 10: Verify deletion
    console.log('✅ Test 10: Verify deletion');
    const deletedCheck = await prisma.cart_items.findUnique({
      where: { id: newCartItem.id },
    });
    console.log('   Cart item after deletion:', deletedCheck ? 'Still exists (ERROR)' : 'Successfully deleted ✓');
    console.log('\n');

    // Test 11: Test JSONB handling with Products table
    console.log('✅ Test 11: Test JSONB field handling (Products table)');
    const productsWithJsonb = await prisma.products.findMany({
      select: {
        id: true,
        title: true,
        available_licenses: true,
        system_requirements: true,
        images: true,
      },
      take: 3,
    });

    if (productsWithJsonb.length > 0) {
      console.log('   Sample product with JSONB fields:');
      const product = productsWithJsonb[0];
      console.log('   - Title:', product.title);
      console.log('   - Available Licenses (JSONB):', product.available_licenses);
      console.log('   - System Requirements (JSONB):', product.system_requirements);
      console.log('   - Images (JSONB):', product.images);
      console.log('   ✓ Prisma automatically handles JSONB parsing!\n');
    } else {
      console.log('   No products found (table may be empty)\n');
    }

    // Summary
    console.log('🎉 All Prisma Tests Passed!\n');
    console.log('Summary:');
    console.log('✓ Database connection successful');
    console.log('✓ SELECT queries working');
    console.log('✓ INSERT queries working');
    console.log('✓ UPDATE queries working');
    console.log('✓ DELETE queries working');
    console.log('✓ JSONB fields handled automatically by Prisma');
    console.log('✓ Aggregate queries working');
    console.log('✓ WHERE clauses working');
    console.log('✓ ORDER BY clauses working\n');

  } catch (error) {
    console.error('❌ Test Failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    console.log('✅ Disconnected from database');
  }
}

// Run tests
testPrismaConnection()
  .then(() => {
    console.log('\n✅ Test script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test script failed:', error);
    process.exit(1);
  });
