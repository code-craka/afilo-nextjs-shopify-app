/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-expressions */
#!/usr/bin/env node

/**
 * Clear Clerk Session Helper
 *
 * This script provides instructions to clear Clerk session tokens
 * when encountering JWKS kid mismatch errors.
 */

console.log('\n🔧 Clerk Session Token Mismatch Fix\n');
console.log('The error indicates your browser has old Clerk session tokens.');
console.log('Please follow these steps:\n');

console.log('1️⃣  Clear Browser Data:');
console.log('   - Open DevTools (F12)');
console.log('   - Application > Cookies');
console.log('   - Delete all cookies for localhost:3000');
console.log('   - Clear "Local Storage" and "Session Storage"\n');

console.log('2️⃣  Sign Out:');
console.log('   - Visit: http://localhost:3000/sign-out');
console.log('   - Or click Sign Out in your app\n');

console.log('3️⃣  Restart Dev Server:');
console.log('   - Stop current server (Ctrl+C)');
console.log('   - Run: pnpm dev --turbopack\n');

console.log('4️⃣  Verify Environment Keys:');
console.log('   - Check .env.local has correct Clerk keys');
console.log('   - Publishable Key:', process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? '✅ Set' : '❌ Missing');
console.log('   - Secret Key:', process.env.CLERK_SECRET_KEY ? '✅ Set' : '❌ Missing');

console.log('\n📚 Additional Help:');
console.log('   - Clerk Dashboard: https://dashboard.clerk.com');
console.log('   - Support: support@clerk.com\n');