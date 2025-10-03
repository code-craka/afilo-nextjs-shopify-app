# 🚀 Next Steps - Dual-Domain Payment System

## ✅ What We Just Built

**Complete dual-domain architecture where users can choose their payment method!**

- ✅ Shopify → Stripe product sync API
- ✅ TanStack Query for performance
- ✅ PaymentMethodSelector component
- ✅ Unified products database
- ✅ Complete documentation
- ✅ All code committed and deployed

---

## 🎯 Immediate Next Steps (Do This Now!)

### Step 1: Run Database Migration (5 minutes)

```bash
# Connect to your Neon database
psql $DATABASE_URL

# Run the migration
\i prisma/migrations/create_unified_products.sql

# Verify
\dt unified_products
\d unified_products
```

**Expected Result:** `unified_products` table created with all columns and indexes

---

### Step 2: Sync Your First Products (10 minutes)

```bash
# Option A: Sync all products
curl -X POST https://app.afilo.io/api/sync/shopify-to-stripe \
  -H "Content-Type: application/json"

# Option B: Sync specific products
curl -X POST https://app.afilo.io/api/sync/shopify-to-stripe \
  -H "Content-Type: application/json" \
  -d '{"productIds": ["gid://shopify/Product/123"]}'
```

**Expected Result:**
```json
{
  "success": true,
  "synced": 10,
  "created": 8,
  "updated": 2
}
```

---

### Step 3: Verify Sync in Database (2 minutes)

```sql
-- Check synced products
SELECT
  name,
  base_price,
  shopify_product_id,
  stripe_product_id,
  stripe_price_monthly,
  stripe_price_annual
FROM unified_products
ORDER BY created_at DESC;
```

**Expected Result:** See your products with both Shopify and Stripe IDs

---

### Step 4: Test the UI (5 minutes)

Visit: https://app.afilo.io/products/unified

**You Should See:**
- Product grid with your synced products
- PaymentMethodSelector on each product
- Two payment options (Shopify and Stripe)
- Stripe pre-selected with "RECOMMENDED" badge

---

### Step 5: Test Checkout Flows (15 minutes)

**Test A: Stripe Checkout**
1. Select a product
2. Keep "Stripe Subscription" selected
3. Choose "Annual" billing
4. Click "Subscribe with Stripe"
5. Complete test payment (use card `4242 4242 4242 4242`)
6. Verify credentials email received

**Test B: Shopify Checkout**
1. Select a product
2. Switch to "Shopify Checkout"
3. Click "Proceed to Shopify Checkout"
4. Complete checkout flow
5. Verify order received

---

## 📊 Monitor Performance

### Check TanStack Query Caching

Open browser DevTools:
1. Look for React Query Devtools button (bottom-right)
2. Click to open panel
3. See cached queries: `unified-products`
4. Verify cache hits (should see green indicators)

### Check API Performance

```bash
# Products API should be fast (cached)
curl -w "\n%{time_total}\n" https://app.afilo.io/api/products/unified

# Should be < 100ms for cached responses
```

---

## 🎨 Customize the UI

### Update PaymentMethodSelector Colors

```typescript
// components/PaymentMethodSelector.tsx

// Change Stripe color from purple to your brand color
border-purple-600 → border-blue-600
bg-purple-50 → bg-blue-50

// Change Shopify color
border-blue-600 → border-green-600
bg-blue-50 → bg-green-50
```

### Add Your Logo

```typescript
// app/products/unified/page.tsx

<div className="text-center mb-12">
  <img src="/your-logo.svg" className="h-12 mx-auto mb-4" />
  <h1>Choose Your Subscription Plan</h1>
</div>
```

---

## 🔧 Configuration Options

### Change Default Payment Method

```typescript
// Make Shopify default instead of Stripe
<PaymentMethodSelector
  product={product}
  defaultMethod="shopify" // Changed from "stripe"
/>
```

### Adjust Cache Duration

```typescript
// lib/queries/products.ts

staleTime: 5 * 60 * 1000, // 5 minutes (change to 10 for longer cache)
```

### Customize Sync Frequency

```bash
# Add to Vercel Cron Jobs or crontab
# Sync every 6 hours
0 */6 * * * curl -X POST /api/sync/shopify-to-stripe
```

---

## 📈 Analytics Setup

### Track Payment Method Selection

```typescript
// Add to PaymentMethodSelector.tsx

const handleCheckout = () => {
  // Track which method user chose
  gtag('event', 'payment_method_selected', {
    method: method,
    product_id: product.id,
    product_name: product.name,
    billing_interval: billingInterval
  });

  // ... existing checkout code
};
```

### Monitor Conversion Rates

```sql
-- Daily conversion by payment method
SELECT
  DATE(created_at) as date,
  COUNT(*) FILTER (WHERE stripe_product_id IS NOT NULL) as stripe_sales,
  COUNT(*) FILTER (WHERE shopify_product_id IS NOT NULL) as shopify_sales
FROM orders -- Your orders table
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## 🚨 Troubleshooting

### Products Not Showing?

```sql
-- Check if products exist and are active
SELECT name, active, available_on_shopify, available_on_stripe
FROM unified_products;

-- If empty, run sync again
```

### Checkout Button Not Working?

1. Check browser console for errors
2. Verify environment variables:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PUBLISHABLE_KEY`
   - `DATABASE_URL`
3. Check `/api/auth/check` endpoint returns user

### TanStack Query Not Caching?

1. Verify `Providers` component wraps your app (app/layout.tsx)
2. Check React Query Devtools shows queries
3. Clear browser cache and reload

---

## 🎯 Success Metrics

**Track These KPIs:**

1. **Payment Method Split**
   - Target: 60%+ choose Stripe (higher margins)
   - Monitor: Weekly reports

2. **MRR Growth**
   - Stripe subscriptions = predictable revenue
   - Track month-over-month growth

3. **Conversion Rate**
   - Compare: Dual-choice vs single option
   - Expected: 15-25% improvement

4. **Average Transaction Value**
   - Annual subscriptions increase ATV
   - Track: Avg annual vs monthly selection

---

## 📞 Need Help?

### Common Questions

**Q: Can I add products directly in Stripe?**
A: Yes, but they won't have Shopify checkout option. Best to add in Shopify and sync.

**Q: How often should I sync?**
A: Every 6 hours is good. Daily if you don't update products often.

**Q: Can I hide one payment method for certain products?**
A: Yes! Update `available_on_shopify` or `available_on_stripe` flags in database.

**Q: Will this affect store.afilo.io?**
A: No! `store.afilo.io` continues working exactly as before.

---

## 🎉 You're All Set!

**What You Have Now:**

✅ Two-domain strategy (store + app)
✅ User choice (Shopify OR Stripe)
✅ Automatic product sync
✅ Blazing fast performance (TanStack Query)
✅ Beautiful payment selector UI
✅ Complete documentation

**Next Level Features (Optional):**

- [ ] Admin dashboard for managing sync
- [ ] Automatic scheduled sync (cron job)
- [ ] Analytics dashboard
- [ ] A/B testing payment methods
- [ ] Custom email templates
- [ ] Multi-currency support

---

**🚀 Go make those sales! Your customers now have the freedom to pay how they want!**
