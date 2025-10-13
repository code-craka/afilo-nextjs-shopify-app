# Billing Portal Troubleshooting Guide

## Issue: "Add Payment Method" Button Not Working

### Symptoms

1. Modal opens but Stripe Elements form doesn't load
2. Only shows "Payment Method" label with no input fields
3. May show "Failed to Load Form" error

### Root Cause

**Fixed in commit `d1851d7`**: Stripe SetupIntent configuration conflict

The `createSetupIntent` function was trying to use both `payment_method_types` and `automatic_payment_methods` simultaneously, which Stripe API doesn't allow.

### Solution Status

✅ **FIXED** - Backend code has been corrected and pushed to GitHub

### Deployment Checklist

To verify the fix is deployed on Vercel:

#### 1. Check Vercel Deployment Status

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `afilo-nextjs-shopify-app`
3. Check **Deployments** tab
4. Verify commit `d1851d7` or later is deployed
5. Look for status: **Ready** ✅

#### 2. Verify Environment Variables in Vercel

The following environment variables MUST be set in Vercel:

**Required for Payment Methods:**
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (starts with `pk_live_` or `pk_test_`)
- `STRIPE_SECRET_KEY` (starts with `sk_live_` or `sk_test_`)

**How to check:**
1. Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Verify both keys are present
3. If missing, add them from your `.env.local` file

#### 3. Force Redeploy (if needed)

If the fix isn't working after deployment:

1. Go to Vercel Dashboard → Deployments
2. Find the latest deployment
3. Click **⋯ (three dots)** → **Redeploy**
4. Or push a new commit to trigger automatic deployment

#### 4. Clear Browser Cache

After redeployment:

1. Open DevTools (F12 or Cmd+Option+I)
2. Right-click the refresh button → **Empty Cache and Hard Reload**
3. Or use Incognito/Private mode to test

### Testing the Fix

Once deployed, test the payment method addition:

1. **Navigate** to `https://app.afilo.io/billing`
2. **Click** "Add Payment Method" button
3. **Verify** you see:
   - Modal opens ✅
   - Loading spinner appears briefly ✅
   - Stripe Elements form loads with Card/Bank tabs ✅
   - Can interact with payment form ✅

### Expected Behavior After Fix

**What you should see:**

```
┌─────────────────────────────────────────┐
│  Add Payment Method                  ×  │
│  Add a card or bank account...          │
├─────────────────────────────────────────┤
│                                          │
│  Payment Method                          │
│  ┌───────────┬───────────┐              │
│  │   Card    │   Bank    │  ← Tabs      │
│  └───────────┴───────────┘              │
│  ┌─────────────────────────────────┐    │
│  │  Card number                     │    │
│  │  [                              ]│    │
│  └─────────────────────────────────┘    │
│  ┌──────────────┬──────────────────┐    │
│  │  MM / YY     │  CVC             │    │
│  └──────────────┴──────────────────┘    │
│                                          │
│  [Cancel]  [Add Payment Method]          │
│                                          │
│  🔒 Your payment information is secure   │
└─────────────────────────────────────────┘
```

### Debugging Steps

If the issue persists after deployment:

#### 1. Check Browser Console

1. Open DevTools (F12)
2. Go to **Console** tab
3. Look for errors related to:
   - `setup-intent`
   - `Stripe`
   - `PaymentElement`

**Common errors and solutions:**

| Error | Solution |
|-------|----------|
| `STRIPE_SECRET_KEY is not set` | Add to Vercel environment variables |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set` | Add to Vercel environment variables |
| `Failed to load form` | Check Network tab for API errors |
| `automatic_payment_methods` error | Verify latest code is deployed |

#### 2. Check Network Tab

1. Open DevTools → **Network** tab
2. Filter by **Fetch/XHR**
3. Click "Add Payment Method"
4. Check request to `/api/billing/payment-methods/setup-intent`

**Expected response:**
```json
{
  "success": true,
  "clientSecret": "seti_xxxxxxxxxxxxx_secret_xxxxxxxxxxxxx",
  "customerId": "cus_xxxxxxxxxxxxx",
  "message": "SetupIntent created successfully"
}
```

**Error responses to check:**
- `401 Unauthorized` → User not logged in
- `429 Too Many Requests` → Rate limit exceeded (wait and retry)
- `500 Internal Server Error` → Check Vercel logs

#### 3. Check Vercel Logs

1. Vercel Dashboard → Your Project → **Logs**
2. Filter by Function: `/api/billing/payment-methods/setup-intent`
3. Look for errors in the logs
4. Common issues:
   - Missing environment variables
   - Stripe API errors
   - Database connection issues

### Manual Verification (For Developers)

To test the fix locally:

```bash
# 1. Pull latest code
git pull origin main

# 2. Verify you have the fix
git log --oneline | grep "d1851d7"
# Should show: d1851d7 fix: Resolve Stripe SetupIntent configuration conflict

# 3. Install dependencies
pnpm install

# 4. Check environment variables
grep "STRIPE" .env.local
# Should show both NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY and STRIPE_SECRET_KEY

# 5. Run dev server
pnpm dev

# 6. Test at http://localhost:3000/billing
```

### What Changed in the Fix

**File**: `lib/billing/stripe-payment-methods.ts:276-296`

**Before (❌ Broken)**:
```typescript
const setupIntent = await stripe.setupIntents.create({
  customer: customerId,
  payment_method_types: ['card', 'us_bank_account'], // ❌ Conflicts
  automatic_payment_methods: {
    enabled: true,
    allow_redirects: 'never',
  },
});
```

**After (✅ Fixed)**:
```typescript
const setupIntent = await stripe.setupIntents.create({
  customer: customerId,
  usage: 'off_session',
  automatic_payment_methods: {
    enabled: true,
    allow_redirects: 'never',
  },
  // Removed payment_method_types to avoid conflict
});
```

### Still Having Issues?

If the payment method form still doesn't work after:
- ✅ Verifying deployment is complete
- ✅ Checking environment variables are set
- ✅ Clearing browser cache
- ✅ Reviewing console/network errors

**Next Steps:**

1. **Check your screenshot again** and take note of:
   - Any error messages in the modal
   - Browser console errors (F12 → Console)
   - Network tab errors (F12 → Network → Fetch/XHR)

2. **Share with developer**:
   - Screenshot of the error
   - Browser console logs
   - Network tab response from setup-intent API

3. **Temporary workaround**:
   - Payment methods can be added via Stripe Dashboard
   - Or use direct checkout flow (bypasses portal)

### Related Documentation

- [Stripe SetupIntent API](https://stripe.com/docs/api/setup_intents)
- [Stripe Payment Element](https://stripe.com/docs/payments/payment-element)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

### Commit History

- `d1851d7` - **Fix: Resolve Stripe SetupIntent configuration conflict** (Latest)
- `c843aa1` - Fix: Resolve CircleCI dependency availability issues
- `44b5821` - Fix: Resolve CircleCI pnpm installation shell detection error
- `3c9dd81` - Fix: Configure GitHub Actions CI with proper environment variables
- `2ca7a9c` - Fix: Implement lazy Stripe initialization to prevent build errors

---

**Last Updated**: 2025-10-13
**Status**: ✅ Fixed and deployed
**Next Review**: Monitor Vercel deployment logs for 24 hours
