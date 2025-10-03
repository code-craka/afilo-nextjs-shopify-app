# Architecture Recommendation: Unified Product & Subscription System

## Current Problems

### 1. **Dual Payment Systems (Conflicting)**
- ❌ Shopify Checkout for digital products
- ❌ Stripe Subscriptions for enterprise plans
- ❌ No synchronization between them
- ❌ Cart validation fails for Stripe products

### 2. **No Data Caching Strategy**
- ❌ Every page load hits Shopify API
- ❌ Rate limiting causing 429 errors
- ❌ Slow page loads
- ❌ Poor user experience

### 3. **Product Data Mismatch**
- ❌ Shopify products have different structure than Stripe products
- ❌ No single source of truth
- ❌ Price synchronization issues

---

## Recommended Architecture: **Stripe-First with TanStack Query**

### Why Stripe-First?

✅ **You already have Stripe subscriptions configured** (4 plans with 8 Price IDs)
✅ **No trial periods** - immediate payment matches Stripe's model better
✅ **Enterprise focus** - Stripe is better for B2B/SaaS
✅ **Better subscription management** - Built-in billing, invoices, webhooks
✅ **Lower fees** - 2.9% + 30¢ vs Shopify's additional fees

---

## Solution 1: **Pure Stripe Architecture** (RECOMMENDED)

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Product Data Layer                       │
│  (Database: Neon PostgreSQL - you already have this!)       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ├─────────────────────────────────┐
                           ▼                                 ▼
        ┌──────────────────────────────┐   ┌────────────────────────────┐
        │    TanStack Query Cache      │   │   Stripe Products API      │
        │  (Client-side caching)       │   │   (Source of truth)        │
        └──────────────────┬───────────┘   └────────────┬───────────────┘
                           │                             │
                           ├─────────────────────────────┤
                           ▼                             ▼
                ┌────────────────────────────────────────────────┐
                │       Next.js API Routes (Server)              │
                │  - /api/stripe/products (cached)               │
                │  - /api/stripe/checkout (direct session)       │
                │  - /api/stripe/webhook (automated delivery)    │
                └────────────────────────────────────────────────┘
```

### Implementation Steps

#### Step 1: Install TanStack Query

```bash
pnpm add @tanstack/react-query
```

#### Step 2: Product Data in PostgreSQL (Neon)

```sql
CREATE TABLE products (
  id VARCHAR(255) PRIMARY KEY,
  stripe_price_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_product_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price_monthly INTEGER NOT NULL, -- in cents
  price_annual INTEGER NOT NULL,  -- in cents
  tier VARCHAR(50) NOT NULL, -- professional, business, enterprise, enterprise_plus
  user_limit VARCHAR(50) NOT NULL,
  features JSONB NOT NULL,
  metadata JSONB,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_products_tier ON products(tier);
CREATE INDEX idx_products_stripe_price ON products(stripe_price_id);
CREATE INDEX idx_products_active ON products(active);
```

#### Step 3: Stripe Product Sync API

```typescript
// app/api/stripe/sync-products/route.ts
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe-server';
import { db } from '@/lib/database';

/**
 * Sync Stripe products to local database
 * Run this when you update products in Stripe
 */
export async function POST() {
  try {
    // Fetch all products from Stripe
    const products = await stripe.products.list({ limit: 100 });
    const prices = await stripe.prices.list({ limit: 100 });

    // Group prices by product
    const pricesByProduct = new Map();
    for (const price of prices.data) {
      if (!pricesByProduct.has(price.product)) {
        pricesByProduct.set(price.product, []);
      }
      pricesByProduct.get(price.product).push(price);
    }

    // Sync to database
    for (const product of products.data) {
      const productPrices = pricesByProduct.get(product.id) || [];
      const monthlyPrice = productPrices.find(p => p.recurring?.interval === 'month');
      const annualPrice = productPrices.find(p => p.recurring?.interval === 'year');

      await db.product.upsert({
        where: { stripe_product_id: product.id },
        create: {
          id: product.id,
          stripe_product_id: product.id,
          stripe_price_id: monthlyPrice?.id || annualPrice?.id!,
          name: product.name,
          description: product.description,
          price_monthly: monthlyPrice?.unit_amount || 0,
          price_annual: annualPrice?.unit_amount || 0,
          tier: product.metadata.tier || 'professional',
          user_limit: product.metadata.user_limit || '25',
          features: product.metadata.features?.split('|') || [],
          metadata: product.metadata,
          active: product.active
        },
        update: {
          name: product.name,
          description: product.description,
          price_monthly: monthlyPrice?.unit_amount || 0,
          price_annual: annualPrice?.unit_amount || 0,
          tier: product.metadata.tier,
          user_limit: product.metadata.user_limit,
          features: product.metadata.features?.split('|') || [],
          metadata: product.metadata,
          active: product.active,
          updated_at: new Date()
        }
      });
    }

    return NextResponse.json({
      success: true,
      synced: products.data.length
    });
  } catch (error) {
    console.error('Product sync error:', error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
```

#### Step 4: TanStack Query Implementation

```typescript
// lib/queries/products.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface StripeProduct {
  id: string;
  stripe_price_id: string;
  stripe_product_id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_annual: number;
  tier: string;
  user_limit: string;
  features: string[];
  metadata: Record<string, any>;
  active: boolean;
}

// Fetch products with caching
export function useProducts() {
  return useQuery({
    queryKey: ['stripe-products'],
    queryFn: async () => {
      const response = await fetch('/api/stripe/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json() as Promise<{ products: StripeProduct[] }>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Don't refetch on tab switch
    refetchOnMount: false // Don't refetch on component mount if cached
  });
}

// Create checkout session
export function useCreateCheckout() {
  return useMutation({
    mutationFn: async ({
      priceId,
      billingInterval
    }: {
      priceId: string;
      billingInterval: 'month' | 'year'
    }) => {
      const response = await fetch('/api/stripe/create-subscription-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, billingInterval })
      });

      if (!response.ok) throw new Error('Checkout creation failed');
      return response.json();
    },
    onSuccess: (data) => {
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    }
  });
}
```

#### Step 5: Provider Setup

```typescript
// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

#### Step 6: Updated Pricing Page

```typescript
// app/pricing/page.tsx
'use client';

import { useProducts, useCreateCheckout } from '@/lib/queries/products';
import { Loader2 } from 'lucide-react';

export default function PricingPage() {
  const { data, isLoading, error } = useProducts();
  const createCheckout = useCreateCheckout();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div>Error loading products</div>;
  }

  const handleSubscribe = (priceId: string, interval: 'month' | 'year') => {
    createCheckout.mutate({ priceId, billingInterval: interval });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {data?.products.map((product) => (
          <div key={product.id} className="border rounded-lg p-6">
            <h3 className="text-2xl font-bold">{product.name}</h3>
            <p className="text-gray-600 mt-2">{product.description}</p>

            <div className="mt-6">
              <div className="text-4xl font-bold">
                ${(product.price_monthly / 100).toFixed(0)}
                <span className="text-lg text-gray-600">/month</span>
              </div>
            </div>

            <button
              onClick={() => handleSubscribe(product.stripe_price_id, 'month')}
              disabled={createCheckout.isPending}
              className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {createCheckout.isPending ? 'Processing...' : 'Subscribe Now'}
            </button>

            <ul className="mt-6 space-y-2">
              {product.features.map((feature, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Solution 2: **Hybrid Approach** (If you want to keep Shopify)

### Use Case: One-time products on Shopify, Subscriptions on Stripe

```typescript
// Unified product type
interface UnifiedProduct {
  id: string;
  name: string;
  price: number;
  type: 'subscription' | 'one-time';
  provider: 'stripe' | 'shopify';
  // ... common fields
}

// Smart checkout router
function handleCheckout(product: UnifiedProduct) {
  if (product.type === 'subscription') {
    // Stripe subscription flow
    createStripeCheckout(product.stripe_price_id);
  } else {
    // Shopify checkout flow
    addToShopifyCart(product.shopify_variant_id);
  }
}
```

---

## Migration Plan

### Phase 1: Setup (1-2 hours)
1. ✅ Install TanStack Query
2. ✅ Create product sync API
3. ✅ Set up QueryClient provider
4. ✅ Update database schema

### Phase 2: Implementation (2-3 hours)
1. ✅ Convert pricing page to use TanStack Query
2. ✅ Remove Shopify cart for subscriptions
3. ✅ Update enterprise page
4. ✅ Test checkout flow

### Phase 3: Optimization (1 hour)
1. ✅ Configure cache strategies
2. ✅ Add loading states
3. ✅ Error handling
4. ✅ Performance monitoring

---

## Benefits of This Approach

### 1. **Performance**
- ✅ Client-side caching (TanStack Query)
- ✅ Server-side caching (60s cache)
- ✅ Database caching (Neon)
- ✅ No more 429 errors

### 2. **Single Source of Truth**
- ✅ Stripe products → Database → React Query
- ✅ Automatic synchronization
- ✅ No price mismatches

### 3. **Better UX**
- ✅ Instant page loads (cached data)
- ✅ Optimistic updates
- ✅ Smart refetching
- ✅ Loading states

### 4. **Maintainability**
- ✅ One payment system (Stripe)
- ✅ Clear data flow
- ✅ Easy to debug
- ✅ TypeScript safety

---

## Cost Comparison

### Current: Shopify + Stripe
- Shopify: 2.9% + 30¢ + Shopify fees
- Stripe: 2.9% + 30¢
- **Total**: ~6-7% per transaction

### Recommended: Stripe Only
- Stripe: 2.9% + 30¢
- **Total**: 2.9% per transaction
- **Savings**: ~3-4% per transaction

---

## Next Steps

**Option A: Pure Stripe (Recommended)**
1. I'll implement TanStack Query
2. Create product sync system
3. Remove Shopify cart
4. Direct Stripe checkout

**Option B: Keep Shopify + Add TanStack Query**
1. Add TanStack Query for caching
2. Keep both systems
3. Smart routing between them

**Which approach do you prefer?**
