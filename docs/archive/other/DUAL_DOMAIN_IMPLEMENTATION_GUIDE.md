# Dual-Domain Implementation Guide

## 🎯 Architecture Overview

**Two-Domain Strategy:**
- `store.afilo.io` → Shopify-only checkout (simple e-commerce)
- `app.afilo.io` → **Payment choice** (Shopify OR Stripe)

---

## 🚀 Setup Instructions

### Step 1: Run Database Migration

```bash
# Connect to Neon Database
psql $DATABASE_URL

# Run the migration
\i prisma/migrations/create_unified_products.sql

# Verify table created
\dt unified_products
```

### Step 2: Sync Products from Shopify to Stripe

```bash
# Method 1: Using API endpoint
curl -X POST https://app.afilo.io/api/sync/shopify-to-stripe \
  -H "Authorization: Bearer YOUR_TOKEN"

# Method 2: Using admin UI (create this later)
# Navigate to https://app.afilo.io/admin/sync-products
```

**What this does:**
1. Fetches all products from Shopify
2. Creates matching Stripe products
3. Creates monthly + annual prices (annual = 17% discount)
4. Stores in `unified_products` table

### Step 3: Verify Sync

```sql
-- Check synced products
SELECT
  name,
  shopify_product_id,
  stripe_product_id,
  stripe_price_monthly,
  stripe_price_annual,
  available_on_shopify,
  available_on_stripe
FROM unified_products;
```

### Step 4: Configure Domains

**For `store.afilo.io`:**
- No changes needed
- Continues using existing Shopify checkout
- Products displayed from Shopify

**For `app.afilo.io`:**
- Update product pages to use `/products/unified`
- Shows PaymentMethodSelector component
- Users choose Shopify or Stripe

---

## 📦 How to Add New Products

### Option A: Add in Shopify, Then Sync

```bash
# 1. Add product in Shopify admin
# 2. Run sync
curl -X POST /api/sync/shopify-to-stripe

# 3. Verify in database
# Product now available on both payment methods
```

### Option B: Create Directly in Stripe

```bash
# If you want Stripe-only products
# Create product in Stripe dashboard
# Add to database manually
```

---

## 🔧 Component Usage

### PaymentMethodSelector

```typescript
import { PaymentMethodSelector } from '@/components/PaymentMethodSelector';
import { useUnifiedProducts } from '@/lib/queries/products';

function ProductPage() {
  const { data } = useUnifiedProducts();

  return (
    <div>
      {data?.products.map(product => (
        <PaymentMethodSelector
          key={product.id}
          product={product}
          defaultMethod="stripe" // Pre-select Stripe
        />
      ))}
    </div>
  );
}
```

### useUnifiedProducts Hook

```typescript
// Fetch all active products
const { data, isLoading } = useUnifiedProducts({ active: true });

// Fetch only Stripe-available products
const { data } = useUnifiedProducts({
  active: true,
  stripe: true
});

// Fetch by tier
const { data } = useUnifiedProducts({
  tier: 'enterprise'
});
```

---

## 💳 Checkout Flows

### Flow 1: Shopify Checkout

```
User clicks PaymentMethodSelector (Shopify selected)
      ↓
Create Shopify cart via /api/cart
      ↓
Redirect to Shopify checkout URL
      ↓
Shopify processes payment
      ↓
Shopify webhook delivers product
```

### Flow 2: Stripe Subscription

```
User clicks PaymentMethodSelector (Stripe selected)
      ↓
Create Stripe Checkout Session via /api/stripe/create-subscription-checkout
      ↓
Redirect to Stripe checkout
      ↓
Stripe processes subscription
      ↓
Stripe webhook sends credentials email
      ↓
User gets instant access
```

---

## 🎨 UI Recommendations

### On `store.afilo.io`
- **Keep existing design**
- Standard Shopify product pages
- "Buy Now" button → Shopify cart
- No payment method choice

### On `app.afilo.io`
- **New design with PaymentMethodSelector**
- Highlight Stripe as "RECOMMENDED"
- Show pricing for both monthly/annual
- Trust indicators (secure payment, instant access)

---

## 📊 Analytics & Tracking

### Track Payment Method Selection

```typescript
// In PaymentMethodSelector component
const trackSelection = (method: 'shopify' | 'stripe') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'payment_method_selected', {
      method: method,
      product_id: product.id,
      product_name: product.name
    });
  }
};
```

### Monitor Sync Health

```sql
-- Products missing Stripe sync
SELECT name, shopify_product_id
FROM unified_products
WHERE shopify_product_id IS NOT NULL
  AND stripe_product_id IS NULL;

-- Products with stale sync (> 7 days)
SELECT name, stripe_synced_at
FROM unified_products
WHERE stripe_synced_at < NOW() - INTERVAL '7 days';
```

---

## 🔒 Security Considerations

### Admin-Only Endpoints

```typescript
// app/api/sync/shopify-to-stripe/route.ts
const { userId } = await auth();

// TODO: Add admin role check
const user = await db.getUser(userId);
if (user.role !== 'admin') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
}
```

### Rate Limiting

- Product sync: Limit to 1 request/hour per user
- Unified products API: 200 requests/minute (already implemented)

---

## 🧪 Testing Checklist

### Before Going Live

- [ ] Run database migration successfully
- [ ] Sync at least 3 test products
- [ ] Verify products appear in `/products/unified`
- [ ] Test Shopify checkout flow end-to-end
- [ ] Test Stripe checkout flow end-to-end
- [ ] Verify emails are sent (Stripe credentials email)
- [ ] Check both monthly and annual pricing
- [ ] Test on mobile devices
- [ ] Verify analytics tracking

### Stripe Test Mode

```bash
# Use Stripe test keys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Test card numbers
4242 4242 4242 4242 # Succeeds
4000 0000 0000 0002 # Declined
```

---

## 🐛 Troubleshooting

### Problem: Products not showing

```sql
-- Check if products exist
SELECT COUNT(*) FROM unified_products;

-- Check availability flags
SELECT name, available_on_shopify, available_on_stripe
FROM unified_products
WHERE active = true;
```

### Problem: Sync fails

```typescript
// Check logs in sync endpoint
console.log('Shopify products:', shopifyProducts.length);
console.log('Stripe creation:', stripeProduct.id);

// Common issues:
// - Stripe API keys not set
// - Database connection failed
// - Shopify product missing variants
```

### Problem: Checkout redirect fails

```typescript
// Verify Stripe session created
console.log('Session URL:', session.url);

// Verify Shopify cart created
console.log('Checkout URL:', cart.checkoutUrl);

// Check browser console for errors
```

---

## 📈 Performance Optimizations

### TanStack Query Caching

```typescript
// Products cached for 5 minutes
staleTime: 5 * 60 * 1000

// Automatic background refetch when stale
refetchOnReconnect: true

// Manual cache invalidation after sync
queryClient.invalidateQueries({ queryKey: ['unified-products'] });
```

### Database Indexes

Already created in migration:
- `idx_unified_shopify_id` - Fast Shopify product lookup
- `idx_unified_stripe_id` - Fast Stripe product lookup
- `idx_unified_active` - Filter active products

---

## 🔄 Maintenance

### Regular Sync Schedule

```bash
# Recommended: Sync every 6 hours
# Add to cron or Vercel Cron Jobs

0 */6 * * * curl -X POST /api/sync/shopify-to-stripe
```

### Monitor Sync Health

```sql
-- Weekly check: Products synced in last 7 days
SELECT
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE stripe_synced_at > NOW() - INTERVAL '7 days') as recently_synced,
  COUNT(*) FILTER (WHERE stripe_product_id IS NULL) as missing_stripe
FROM unified_products;
```

---

## 🎉 Success Metrics

### Key Metrics to Track

1. **Payment Method Split**
   - % choosing Shopify
   - % choosing Stripe
   - Target: 60%+ Stripe (higher margins)

2. **Conversion Rates**
   - Shopify checkout conversion
   - Stripe checkout conversion
   - Overall conversion improvement

3. **Revenue Impact**
   - MRR from Stripe subscriptions
   - One-time revenue from Shopify
   - Average transaction value

---

## 📞 Support

### Issues with Sync
- Check Stripe Dashboard → Events
- Check database `unified_products` table
- Review sync endpoint logs

### Issues with Checkout
- Verify environment variables set
- Check browser console for errors
- Test with Stripe test mode first

---

## 🚦 Go-Live Checklist

- [ ] Database migration complete
- [ ] Initial product sync successful
- [ ] Test checkout flows (both methods)
- [ ] Analytics tracking configured
- [ ] Email delivery tested (Stripe webhooks)
- [ ] Admin access configured for sync endpoint
- [ ] Monitoring and alerts set up
- [ ] Documentation shared with team
- [ ] Backup plan if rollback needed

---

**🎯 You're Ready!** Users on `app.afilo.io` can now choose their preferred payment method!
