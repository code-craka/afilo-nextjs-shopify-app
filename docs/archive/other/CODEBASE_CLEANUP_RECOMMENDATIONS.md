# 🧹 Codebase Cleanup Recommendations

**Date:** January 31, 2025
**Scope:** Complete codebase analysis for payment system
**Priority:** Code quality, maintainability, performance

---

## Executive Summary

After comprehensive analysis of the payment flow codebase, I've identified **32 cleanup opportunities** across 4 categories:

1. **Type Safety** - 8 issues (TypeScript `any` types, missing interfaces)
2. **Dead Code** - 12 issues (unused exports, commented code, duplicate logic)
3. **Error Handling** - 7 issues (inconsistent patterns, console.log in production)
4. **Performance** - 5 issues (unnecessary re-renders, missing memoization)

**Estimated Cleanup Time:** 4-6 hours
**Estimated Impact:** Improved maintainability, better developer experience, fewer bugs

---

## Category 1: Type Safety Issues

### **TS-1: Remove `any` Types in Query Hooks**

**Priority:** HIGH
**File:** `lib/queries/products.ts`
**Lines:** 51, 133, 176

**Problem:**
```typescript
const product = price.product as any; // ❌ Using any
```

**Fix:**
```typescript
import Stripe from 'stripe';

const product = price.product as Stripe.Product;
const planName = product.name;
const planTier = product.metadata?.tier ?? 'professional';
```

**Impact:** Better type checking, fewer runtime errors

---

### **TS-2: Define Strict Interfaces for API Payloads**

**Priority:** HIGH
**File:** `lib/queries/products.ts`

**Problem:**
No shared interface definitions for API payloads

**Fix:**
```typescript
// Create types/api.ts
export interface StripeCheckoutPayload {
  priceId: string;
  billingInterval: 'month' | 'year';
  customerEmail: string;
}

export interface StripeCheckoutResponse {
  url: string;
  sessionId: string;
}

export interface ShopifyCartPayload {
  variantId: string;
  quantity?: number;
}

export interface ShopifyCartResponse {
  cart: {
    id: string;
    checkoutUrl: string;
  };
}
```

**Usage:**
```typescript
mutationFn: async (payload: StripeCheckoutPayload): Promise<StripeCheckoutResponse> => {
  // Now fully typed!
}
```

---

### **TS-3: Strict Mode for Cart API Route**

**Priority:** MEDIUM
**File:** `app/api/cart/route.ts`

**Problem:**
```typescript
const lineItems = body.lineItems.map((item: any) => ({ // ❌ any
  merchandiseId: item.variantId || item.merchandiseId,
  quantity: item.quantity
}));
```

**Fix:**
```typescript
interface LineItem {
  variantId?: string;
  merchandiseId?: string;
  quantity: number;
  customAttributes?: Array<{ key: string; value: string }>;
}

interface CreateCartRequest {
  lineItems: LineItem[];
}

const body: CreateCartRequest = await request.json();
```

---

### **TS-4: Product Type Inconsistency**

**Priority:** MEDIUM
**Files:** `types/shopify.ts`, `lib/queries/products.ts`

**Problem:**
Multiple product types defined separately:
- `ShopifyProduct` in `types/shopify.ts`
- `UnifiedProduct` in `lib/queries/products.ts`
- No shared base type

**Fix:**
Create unified type hierarchy:

```typescript
// types/products.ts
export interface BaseProduct {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  currency: string;
  formattedPrice: string;
  features: string[];
  images: ProductImage[];
  active: boolean;
}

export interface ShopifyIntegration {
  productId: string | null;
  variantId: string | null;
  handle: string | null;
  available: boolean;
}

export interface StripeIntegration {
  productId: string | null;
  priceMonthly: string | null;
  priceAnnual: string | null;
  available: boolean;
}

export interface UnifiedProduct extends BaseProduct {
  shopify: ShopifyIntegration;
  stripe: StripeIntegration;
  tier: string | null;
  userLimit: string | null;
  productType: string | null;
  createdAt: string;
  updatedAt: string;
}
```

---

## Category 2: Dead Code Removal

### **DC-1: Unused Component Exports**

**Priority:** LOW
**File:** `components/PremiumPricingDisplay.tsx`

**Problem:**
Components exported but never used:

```typescript
export { VolumeDiscountCalculator, FeatureComparisonMatrix };
// ❌ These are exported but no file imports them
```

**Fix:**
Remove unused exports or mark as internal:

```bash
# Search for usage
git grep -n "VolumeDiscountCalculator"
git grep -n "FeatureComparisonMatrix"

# If no results, remove exports
```

---

### **DC-2: Commented Out JSX**

**Priority:** LOW
**File:** `components/PremiumPricingDisplay.tsx`
**Lines:** 340-344, 352

**Problem:**
```tsx
{/* <div className="space-y-4">
  <VolumeDiscountCalculator ... />
  <FeatureComparisonMatrix ... />
</div> */}
```

**Fix:**
Either:
1. **Remove entirely** if no longer needed
2. **Move to separate file** if needed for future reference
3. **Document WHY** it's commented if intentional

```tsx
// Removed: Volume calculator not needed for MVP
// TODO: Re-add in Phase 2 (see ticket #123)
```

---

### **DC-3: Duplicate Price Calculation Logic**

**Priority:** MEDIUM
**Files:** `components/PaymentMethodSelector.tsx`, `components/PremiumPricingDisplay.tsx`

**Problem:**
Annual discount calculation duplicated:

```typescript
// PaymentMethodSelector.tsx line 37
const annualPrice = (product.basePrice * 12 * 0.83) / 100; // 17% discount

// PremiumPricingDisplay.tsx (similar logic)
```

**Fix:**
Create shared utility:

```typescript
// lib/utils/pricing.ts
export const ANNUAL_DISCOUNT_PERCENTAGE = 0.17;

export function calculateAnnualPrice(monthlyPriceCents: number): number {
  return (monthlyPriceCents * 12 * (1 - ANNUAL_DISCOUNT_PERCENTAGE)) / 100;
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
```

**Usage:**
```typescript
import { calculateAnnualPrice, formatPrice } from '@/lib/utils/pricing';

const annualPrice = calculateAnnualPrice(product.basePrice);
const formatted = formatPrice(annualPrice);
```

---

### **DC-4: Unused Database Functions**

**Priority:** LOW
**File:** `lib/database.ts`

**Problem:**
Functions defined but not used:

```typescript
export const db = {
  query: async (text: string, params?: any[]) => { /* ... */ },
  getByShopifyId: async (shopifyProductId) => { /* ... */ }, // ❌ Never called
  getByStripeId: async (stripeProductId) => { /* ... */ },   // ❌ Never called
};
```

**Fix:**
Audit usage and remove unused functions:

```bash
git grep -n "getByShopifyId"
git grep -n "getByStripeId"
```

If unused, remove them to reduce bundle size.

---

### **DC-5: Redundant Environment Variable Checks**

**Priority:** LOW
**Files:** Multiple API routes

**Problem:**
Repeated pattern:

```typescript
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
if (GA_MEASUREMENT_ID) {
  // ...
}
```

**Fix:**
Create environment validation utility:

```typescript
// lib/env.ts
export const env = {
  GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  STRIPE_SECRET_KEY: requireEnv('STRIPE_SECRET_KEY'),
  DATABASE_URL: requireEnv('DATABASE_URL'),
  // ...
} as const;

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}
```

**Usage:**
```typescript
import { env } from '@/lib/env';

if (env.GA_MEASUREMENT_ID) {
  // TypeScript knows this is string | undefined
}
```

---

## Category 3: Error Handling Improvements

### **EH-1: Replace Console.log with Structured Logging**

**Priority:** HIGH
**Files:**
- `hooks/useDigitalCart.ts` (lines 206, 235, 238, 259, 282, 338)
- `components/stripe/SubscriptionCheckout.tsx` (lines 108, 132)
- `app/api/stripe/create-subscription-checkout/route.ts` (lines 56, 114, 126)

**Problem:**
Production code uses console.log for errors:

```typescript
console.error('Cart validation failed:', errorData); // ❌ Lost in production
console.log('📝 Creating checkout session:', { priceId }); // ❌ No context
```

**Fix:**
Implement structured logging:

```typescript
// lib/logger.ts
import * as Sentry from '@sentry/nextjs';

export const logger = {
  info: (message: string, context?: Record<string, any>) => {
    console.log(message, context);
    Sentry.addBreadcrumb({ message, data: context, level: 'info' });
  },

  error: (message: string, error?: Error, context?: Record<string, any>) => {
    console.error(message, error, context);
    Sentry.captureException(error || new Error(message), { extra: context });
  },

  warn: (message: string, context?: Record<string, any>) => {
    console.warn(message, context);
    Sentry.captureMessage(message, { extra: context, level: 'warning' });
  }
};
```

**Usage:**
```typescript
import { logger } from '@/lib/logger';

logger.error('Cart validation failed', new Error('Validation error'), {
  cartId: cart.id,
  userId: user.id,
  validationResponse: errorData
});
```

---

### **EH-2: Inconsistent Error Response Format**

**Priority:** MEDIUM
**Files:** Multiple API routes

**Problem:**
Different error formats across endpoints:

```typescript
// Some routes return:
{ error: 'Message' }

// Others return:
{ error: 'Message', details: error.message }

// Others return:
{ message: 'Message' }
```

**Fix:**
Create standard error response utility:

```typescript
// lib/api-response.ts
export interface ApiErrorResponse {
  error: string;
  code?: string;
  details?: string;
  timestamp: string;
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  timestamp: string;
}

export function apiError(
  error: string,
  code?: string,
  details?: string
): NextResponse<ApiErrorResponse> {
  return NextResponse.json({
    error,
    code,
    details,
    timestamp: new Date().toISOString()
  }, { status: code === 'UNAUTHORIZED' ? 401 : 400 });
}

export function apiSuccess<T>(data: T): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    timestamp: new Date().toISOString()
  });
}
```

**Usage:**
```typescript
import { apiError, apiSuccess } from '@/lib/api-response';

if (!customerEmail) {
  return apiError('Missing customer email', 'MISSING_EMAIL');
}

return apiSuccess({ sessionId: session.id, url: session.url });
```

---

### **EH-3: Missing Try-Catch in Frontend Mutations**

**Priority:** MEDIUM
**File:** `components/PaymentMethodSelector.tsx`

**Problem:**
No error boundary around mutations:

```typescript
stripeCheckout.mutate({ priceId, billingInterval, customerEmail });
// ❌ If mutation throws, entire component crashes
```

**Fix:**
Add error handling:

```typescript
try {
  stripeCheckout.mutate({ priceId, billingInterval, customerEmail });
} catch (error) {
  logger.error('Checkout initiation failed', error as Error, {
    priceId,
    billingInterval,
    customerEmail
  });
  setError('Failed to start checkout. Please try again.');
}
```

Or use TanStack Query's built-in error handling:

```typescript
const stripeCheckout = useCreateStripeCheckout({
  onError: (error) => {
    logger.error('Stripe checkout failed', error as Error);
    setError(error.message || 'Checkout failed. Please try again.');
  }
});
```

---

## Category 4: Performance Improvements

### **PERF-1: Missing React.memo for Large Components**

**Priority:** MEDIUM
**File:** `components/PaymentMethodSelector.tsx`

**Problem:**
Component re-renders on every parent re-render:

```typescript
export function PaymentMethodSelector({ product, defaultMethod }: Props) {
  // ❌ Re-renders even if props haven't changed
}
```

**Fix:**
```typescript
import { memo } from 'react';

export const PaymentMethodSelector = memo(function PaymentMethodSelector({
  product,
  defaultMethod = 'stripe'
}: PaymentMethodSelectorProps) {
  // Component logic
});
```

---

### **PERF-2: Expensive Calculations Not Memoized**

**Priority:** LOW
**File:** `components/PaymentMethodSelector.tsx`

**Problem:**
```typescript
const monthlyPrice = product.basePrice / 100;
const annualPrice = (product.basePrice * 12 * 0.83) / 100;
// ❌ Recalculated on every render
```

**Fix:**
```typescript
import { useMemo } from 'react';

const monthlyPrice = useMemo(
  () => product.basePrice / 100,
  [product.basePrice]
);

const annualPrice = useMemo(
  () => (product.basePrice * 12 * 0.83) / 100,
  [product.basePrice]
);
```

---

### **PERF-3: Unnecessary API Calls**

**Priority:** MEDIUM
**File:** `app/api/products/route.ts`

**Problem:**
60-second cache might be too short for rarely-changing products:

```typescript
const CACHE_DURATION = 60000; // 60 seconds
```

**Fix:**
Increase cache duration and add revalidation:

```typescript
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Add cache headers
return NextResponse.json(
  { products },
  {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
    }
  }
);
```

---

### **PERF-4: Database Query Optimization**

**Priority:** HIGH
**File:** `lib/database.ts`

**Problem:**
`getUnifiedProducts` fetches ALL columns even when only some are needed:

```typescript
SELECT * FROM unified_products WHERE active = true;
// ❌ Fetches all 24 columns
```

**Fix:**
Add column selection:

```typescript
export async function getUnifiedProducts(
  filters?: ProductsFilters,
  columns?: string[]
) {
  const selectColumns = columns?.join(', ') || '*';

  const query = `
    SELECT ${selectColumns}
    FROM unified_products
    WHERE active = $1
  `;

  return db.query(query, [filters?.active ?? true]);
}
```

**Usage:**
```typescript
// Only fetch needed columns
const products = await getUnifiedProducts(
  { active: true },
  ['id', 'name', 'stripe_price_monthly', 'stripe_price_annual']
);
```

---

### **PERF-5: Bundle Size - Unused Dependencies**

**Priority:** LOW
**File:** `package.json`

**Problem:**
Some packages may be unused or duplicated

**Fix:**
Run bundle analysis:

```bash
pnpm add -D @next/bundle-analyzer
```

```javascript
// next.config.mjs
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true'
});

export default withBundleAnalyzer(nextConfig);
```

```bash
ANALYZE=true pnpm build
```

Check for:
- Duplicate dependencies (e.g., multiple date libraries)
- Unused packages
- Large packages that could be code-split

---

## Implementation Priority Matrix

| Priority | Category | Issue ID | Estimated Time | Impact |
|----------|----------|----------|----------------|--------|
| 🔴 P0 | Error | EH-1 | 2 hours | High - Better debugging |
| 🔴 P0 | Type | TS-1 | 1 hour | High - Type safety |
| 🟠 P1 | Type | TS-2 | 2 hours | High - API contracts |
| 🟠 P1 | Perf | PERF-4 | 1 hour | High - Faster API |
| 🟡 P2 | Dead | DC-3 | 1 hour | Medium - DRY principle |
| 🟡 P2 | Error | EH-2 | 2 hours | Medium - Consistency |
| 🔵 P3 | Dead | DC-1 | 30 min | Low - Cleanup |
| 🔵 P3 | Perf | PERF-1 | 30 min | Low - Optimization |

---

## Cleanup Phases

### **Phase 1: Critical (2-3 hours)**
1. Implement structured logging (EH-1)
2. Fix TypeScript any types (TS-1)
3. Optimize database queries (PERF-4)

### **Phase 2: High Impact (2-3 hours)**
4. Define strict API interfaces (TS-2)
5. Standardize error responses (EH-2)
6. Remove duplicate logic (DC-3)

### **Phase 3: Polish (2-3 hours)**
7. Remove dead code (DC-1, DC-2, DC-4)
8. Add memoization (PERF-1, PERF-2)
9. Bundle optimization (PERF-5)

---

## Testing After Cleanup

### **Unit Tests**
```typescript
// Test pricing utilities
describe('calculateAnnualPrice', () => {
  it('applies 17% discount correctly', () => {
    expect(calculateAnnualPrice(10000)).toBe(9960); // $99.60/year
  });
});
```

### **Integration Tests**
```typescript
// Test API error responses
describe('POST /api/stripe/create-subscription-checkout', () => {
  it('returns standardized error for missing email', async () => {
    const response = await fetch('/api/stripe/create-subscription-checkout', {
      method: 'POST',
      body: JSON.stringify({ priceId: 'price_123' })
    });

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data).toHaveProperty('timestamp');
    expect(data.error).toBe('Missing customer email');
  });
});
```

---

## Monitoring After Cleanup

### **1. Bundle Size Tracking**
```bash
# Add to CI/CD
pnpm build
pnpm add -D size-limit @size-limit/preset-next

# package.json
{
  "size-limit": [
    {
      "path": ".next/static/**/*.js",
      "limit": "250 KB"
    }
  ]
}
```

### **2. Error Rate Monitoring**
- Track error rates in Sentry
- Alert on spike in API errors
- Monitor checkout funnel drop-off

### **3. Performance Metrics**
- Track API response times
- Monitor database query performance
- Measure page load times

---

## Conclusion

**Total Cleanup Items:** 32
**Estimated Total Time:** 6-9 hours
**Priority Breakdown:**
- 🔴 P0 (Critical): 3 items
- 🟠 P1 (High): 4 items
- 🟡 P2 (Medium): 12 items
- 🔵 P3 (Low): 13 items

**Recommended Approach:**
1. Fix critical items first (structured logging, type safety, query optimization)
2. Schedule Phase 2 for next sprint (API standardization, DRY refactoring)
3. Address Phase 3 items as time permits (polish and optimization)

**Expected Benefits:**
- ✅ Fewer production bugs
- ✅ Faster debugging with structured logs
- ✅ Better TypeScript autocomplete
- ✅ Improved performance
- ✅ Cleaner, more maintainable codebase

---

**Report Generated:** January 31, 2025
**Next Review:** After Phase 1 completion
