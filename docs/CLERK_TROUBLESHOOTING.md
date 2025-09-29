# Clerk Authentication Troubleshooting Guide

## Common Issues and Solutions

### 1. JWKS Kid Mismatch Error

**Error Message:**
```
Clerk: Handshake token verification failed: Unable to find a signing key in JWKS
that matches the kid='ins_32hgBjWvj0zAutdSo2kRlPvxzBh'
```

**Root Cause:**
Your browser has cached session tokens from a previous Clerk instance or outdated keys.

**Solutions:**

#### Quick Fix (Recommended)
1. **Clear Browser Cookies:**
   ```bash
   # Open DevTools (F12)
   # Application > Cookies > Delete all for localhost:3000
   ```

2. **Clear Storage:**
   - Local Storage
   - Session Storage
   - IndexedDB

3. **Restart Dev Server:**
   ```bash
   # Stop server (Ctrl+C)
   pnpm dev --turbopack
   ```

#### Automatic Fix (Built-in)
The middleware now automatically detects this error and:
- Clears invalid session cookies
- Redirects to sign-in page with helpful message
- Shows: "⚠️ Your session has expired. Please sign in again."

### 2. SyntaxError: Unexpected token '<'

**Error Message:**
```
SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

**Root Cause:**
The application is receiving HTML (404 or error page) when expecting JSON.

**Common Causes:**
- API route not found
- Server error returning HTML error page
- CORS issues

**Solutions:**

1. **Check API Routes:**
   ```bash
   # Verify route exists
   ls app/api/[your-route]/route.ts
   ```

2. **Check Browser Network Tab:**
   - Look for failed API requests
   - Check response content type
   - Verify response is JSON, not HTML

3. **Clear Cache:**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   pnpm dev --turbopack
   ```

### 3. Verifying Clerk Configuration

**Check Environment Variables:**
```bash
# Run the verification script
node scripts/clear-clerk-session.js
```

**Required Variables:**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
```

**Verify in Clerk Dashboard:**
1. Go to: https://dashboard.clerk.com
2. Select your application
3. Navigate to: API Keys
4. Compare keys with your `.env.local`

### 4. Session Management Best Practices

**Development:**
- Use incognito/private browsing for testing
- Clear cookies between major auth changes
- Use different browsers for different accounts

**Production:**
- Never commit `.env.local` to Git
- Rotate keys regularly
- Use different keys for dev/staging/prod

### 5. Middleware Error Handling

The middleware now includes comprehensive error handling:

```typescript
// Automatic cookie clearing on JWKS mismatch
if (error.message.includes('jwk-kid-mismatch')) {
  response.cookies.delete('__session');
  response.cookies.delete('__clerk_db_jwt');
  return redirect('/sign-in?error=session_expired');
}
```

### 6. Testing Authentication Flow

**Test Checklist:**
- [ ] Sign in with email/password
- [ ] Sign in with Google OAuth
- [ ] Protected route access (/dashboard)
- [ ] Public route access (/)
- [ ] Session persistence after refresh
- [ ] Sign out functionality
- [ ] Expired session handling

### 7. Debug Mode

**Enable Clerk Debug Logging:**
```typescript
// Add to app/layout.tsx
<ClerkProvider
  publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
  debug={process.env.NODE_ENV === 'development'}
>
```

### 8. Common Patterns

**Protected Route Pattern:**
```typescript
// middleware.ts
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/enterprise(.*)',
  '/api/users(.*)',
]);

if (isProtectedRoute(req)) {
  await auth.protect();
}
```

**Public Route Pattern:**
```typescript
const isPublicRoute = createRouteMatcher([
  '/',
  '/products(.*)',
  '/sign-in(.*)',
  '/api/webhooks(.*)',
]);
```

### 9. When to Contact Support

Contact Clerk Support (support@clerk.com) if:
- Keys are correct but still getting JWKS errors
- Persistent authentication failures
- Webhook verification issues
- Rate limiting concerns

### 10. Additional Resources

- **Clerk Documentation:** https://clerk.com/docs
- **Next.js Integration:** https://clerk.com/docs/quickstarts/nextjs
- **GitHub Issues:** https://github.com/clerk/javascript/issues
- **Community Discord:** https://clerk.com/discord

## Prevention

**Best Practices:**
1. Use environment-specific Clerk instances
2. Document key rotation procedures
3. Implement proper error boundaries
4. Monitor authentication metrics
5. Test auth flows in CI/CD

## Quick Commands

```bash
# Clear all cookies and restart
rm -rf .next && pnpm dev --turbopack

# Run verification script
node scripts/clear-clerk-session.js

# Check environment variables
grep CLERK .env.local

# View middleware logs
# Check terminal for middleware error messages
```

## Status Indicators

- ✅ Green: Authentication working correctly
- ⚠️ Yellow: Session expired, need to re-authenticate
- ❌ Red: Critical authentication error

---

**Last Updated:** January 2025
**Maintainer:** Afilo Development Team