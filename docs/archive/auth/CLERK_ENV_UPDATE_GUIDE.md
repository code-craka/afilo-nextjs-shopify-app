# Clerk Environment Variables Update Guide

## Issue

Clerk is showing deprecation warnings:
```
Clerk: The prop "afterSignInUrl" is deprecated and should be replaced
with the new "fallbackRedirectUrl" or "forceRedirectUrl" props instead.
```

## Fix Required

Update your `.env.local` file with the new Clerk redirect environment variables.

---

## Step 1: Update .env.local

Open `/Users/rihan/all-coding-project/afilo-nextjs-shopify-app/.env.local` and make these changes:

### ❌ Remove These (Deprecated):
```bash
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### ✅ Add These (New):
```bash
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
```

---

## Step 2: Update Vercel Environment Variables

If you're deploying to Vercel, update these in your Vercel dashboard as well:

1. Go to: https://vercel.com/your-project/settings/environment-variables
2. Delete:
   - `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`
   - `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`
3. Add:
   - `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` = `/dashboard`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` = `/dashboard`

---

## Step 3: Restart Development Server

After updating `.env.local`:

```bash
# Stop the dev server (Ctrl+C)
# Then restart it
pnpm dev
```

---

## Complete .env.local Clerk Section

Your Clerk environment variables should look like this:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_c2FjcmVkLWFtb2ViYS03Mi5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Clerk Redirect URLs (NEW - replaces deprecated AFTER_* variables)
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
```

---

## What's the Difference?

### Old Behavior (Deprecated):
- `AFTER_SIGN_IN_URL` - **Always** redirects to `/dashboard` after sign-in
- Ignores `redirect_url` parameter in URL
- Can't override redirect destination

### New Behavior (Recommended):
- `SIGN_IN_FALLBACK_REDIRECT_URL` - **Only** redirects to `/dashboard` if no other redirect is specified
- Respects `redirect_url` parameter in URL (e.g., `/sign-in?redirect_url=/pricing`)
- Allows custom redirects (needed for subscription checkout flow!)

---

## Why This Matters for Subscription Flow

**With OLD deprecated variables:**
```
User clicks "Subscribe" on /pricing
  ↓
Redirects to /sign-in?redirect_url=/pricing
  ↓
User signs in
  ↓
❌ WRONG: Redirects to /dashboard (ignores redirect_url parameter)
  ↓
User stuck, checkout never opens
```

**With NEW variables:**
```
User clicks "Subscribe" on /pricing
  ↓
Redirects to /sign-in?redirect_url=/pricing
  ↓
User signs in
  ↓
✅ CORRECT: Redirects to /pricing (respects redirect_url parameter)
  ↓
Email auto-populated, clicks "Subscribe" again
  ↓
Opens Stripe Checkout successfully!
```

---

## Testing After Update

1. **Sign Out** (if currently logged in)
2. Go to: http://localhost:3000/pricing
3. Click **"Subscribe Now"** on Business Plan
4. Should redirect to `/sign-in?redirect_url=%2Fpricing`
5. Sign in with email/password or Google
6. Should redirect **back to /pricing** (not /dashboard!)
7. Email should be auto-populated
8. Click **"Subscribe Now"** again
9. Should open Stripe Checkout at `pay.techsci.io/c/...`

---

## Additional Notes

### Custom Stripe Domain (Already Configured):
- ✅ Your Stripe checkout uses: `pay.techsci.io/c/...`
- ✅ This is configured in Stripe Dashboard → Settings → Branding
- ✅ This is **good** - provides branded checkout experience
- ✅ No changes needed for Stripe domain

### Forgot Password Page (404 Error):
The `/forgot-password` link in your sign-in page returns 404. You can either:
- Remove the link (Clerk handles password reset via email)
- Create a forgot-password page using Clerk's password reset component

---

## Summary

**Action Required:**
1. ✅ Update `.env.local` (replace 2 deprecated variables with 2 new ones)
2. ✅ Update Vercel environment variables (if deployed)
3. ✅ Restart dev server
4. ✅ Test subscription checkout flow

**Expected Result:**
- ❌ No more Clerk deprecation warnings
- ✅ Subscription checkout flow works correctly
- ✅ Users redirected back to pricing page after sign-in
- ✅ Email auto-populated from Clerk user data

---

Last updated: 2025-01-05
Version: 1.0
