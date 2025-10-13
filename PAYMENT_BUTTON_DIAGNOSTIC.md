# Payment Method Button Diagnostic Checklist

## Current Status
✅ Backend fix deployed (commit d1851d7)
❌ Button still not working in production

## Vercel Environment Variables to Check

### Required Variables
Go to: Vercel Dashboard → Your Project → Settings → Environment Variables

**Check these are set for Production, Preview, and Development:**

1. ✅ `STRIPE_SECRET_KEY` (starts with `sk_live_` or `sk_test_`)
2. ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (starts with `pk_live_` or `pk_test_`) ← **MOST LIKELY MISSING**

### How to Verify

```bash
# From your .env.local file:
STRIPE_SECRET_KEY=sk_live_51Mvv...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51Mvv...
```

**Important**: The `NEXT_PUBLIC_` prefix is required for client-side access!

## Browser Console Debugging

### Step 1: Open DevTools
1. Go to https://app.afilo.io/billing
2. Press F12 (or Cmd+Option+I on Mac)
3. Open **Console** tab

### Step 2: Check for Errors
Look for errors like:
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set`
- `Stripe publishable key must start with "pk_"`
- `Cannot read property 'xxx' of undefined`

### Step 3: Check Network Tab
1. Click **Network** tab
2. Filter by "Fetch/XHR"
3. Click "Add Payment Method" button
4. Look for request to `/api/billing/payment-methods/setup-intent`

**Expected Response (200 OK):**
```json
{
  "success": true,
  "clientSecret": "seti_xxxxx_secret_xxxxx",
  "customerId": "cus_xxxxx"
}
```

**Common Error Responses:**
- `401` - User not authenticated
- `500` - Server error (check Vercel logs)
- `Error: STRIPE_SECRET_KEY is not set` - Environment variable missing

## Vercel Deployment Check

### Verify Latest Code is Deployed
1. Go to Vercel Dashboard → Deployments
2. Check latest deployment shows commit **`d1851d7`** or later
3. Status should be **Ready** with green checkmark

### If Deployment is Old:
```bash
# Option 1: Push a new commit to trigger deployment
git commit --allow-empty -m "chore: trigger redeploy"
git push

# Option 2: Redeploy from Vercel Dashboard
Go to Deployments → Latest → ⋯ → Redeploy
```

## Quick Test Locally

To verify the fix works locally:

```bash
# 1. Pull latest code
git pull origin main

# 2. Check you have both Stripe keys in .env.local
grep STRIPE .env.local
# Should show:
# STRIPE_SECRET_KEY=sk_live_...
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# 3. Run dev server
pnpm dev

# 4. Test at http://localhost:3000/billing
# Click "Add Payment Method" - should show Stripe Elements form
```

## Most Likely Issue

🎯 **Missing `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in Vercel**

The `NEXT_PUBLIC_` prefix is required for environment variables that need to be available in the browser. Without it, the Stripe Elements form cannot initialize.

## Solution Steps

1. ✅ Go to Vercel → Settings → Environment Variables
2. ✅ Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. ✅ Value: `pk_live_51MvvjqFcrRhjqzakMQCafFqskzpLVl3pUnLVrFRrORMhrTihiWra59knuDM7C9uRcsjrmzsiIUqSsLcxX8XBaHyK00ZwNeD22W`
4. ✅ Check all environments (Production, Preview, Development)
5. ✅ Redeploy after adding the variable
6. ✅ Clear browser cache (Cmd+Shift+R or Ctrl+Shift+R)
7. ✅ Test again

## Still Not Working?

If the issue persists after checking all of the above, please provide:
- Screenshot of browser console errors
- Screenshot of Network tab showing the API request/response
- Confirmation that both Stripe keys are set in Vercel

---

**Next Steps**: Continue with cart system implementation while investigating payment button issue.
