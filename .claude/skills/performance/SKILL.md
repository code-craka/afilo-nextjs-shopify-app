---
name: performance
description: Performance optimization and analytics tracking for the Next.js marketplace. Use when optimizing performance, setting up monitoring, or analyzing user behavior and conversion metrics.
---

# Performance & Analytics

Comprehensive performance optimization and analytics tracking for Afilo's digital marketplace.

## Quick Start

**Run Lighthouse CI:**
```bash
pnpm lighthouse
```

**Check analytics data:**
```typescript
import { analytics } from '@/lib/analytics';
analytics.track('product_viewed', { productId, userId });
```

**Monitor API performance:**
```typescript
import { logger } from '@/lib/logger';
logger.info('[API] Operation completed', { duration: 145, endpoint: '/api/products' });
```

## Performance Standards

**Lighthouse CI requirements (enforced):**
- **Performance**: ≥90%
- **Accessibility**: ≥90%
- **Best Practices**: ≥90%
- **SEO**: ≥90%

**Core Web Vitals:**
- **FCP**: ≤2000ms
- **LCP**: ≤2500ms
- **CLS**: ≤0.1

## Optimization Strategies

**Frontend Performance**: See [frontend-optimization.md](frontend-optimization.md)
**Database Performance**: See [database-optimization.md](database-optimization.md)
**API Performance**: See [api-optimization.md](api-optimization.md)
**Monitoring**: See [monitoring.md](monitoring.md)

## Analytics Implementation

### Event Tracking
```typescript
// Product interactions
analytics.track('product_viewed', {
  productId: product.id,
  productTitle: product.title,
  price: product.base_price,
  category: product.product_type
});

// Conversion events
analytics.track('purchase_completed', {
  orderId: session.id,
  value: session.amount_total / 100,
  currency: session.currency,
  items: lineItems
});

// Chat bot usage
analytics.track('chat_message_sent', {
  conversationId,
  messageLength: content.length,
  hasKnowledgeBase: results.length > 0
});
```

### User Journey Tracking
```typescript
// Page views
analytics.page('Product Details', {
  productHandle: params.handle,
  referrer: document.referrer
});

// Feature usage
analytics.track('feature_used', {
  feature: 'adaptive_checkout',
  userId,
  context: { currency, country }
});
```

## Performance Monitoring

### API Performance Tracking
```typescript
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Your API logic
    const result = await someOperation();

    // Track success
    logger.info('[API] Operation successful', {
      endpoint: '/api/products',
      method: 'GET',
      duration: Date.now() - startTime,
      userId
    });

    return NextResponse.json(result);
  } catch (error) {
    // Track errors
    logger.error('[API] Operation failed', {
      endpoint: '/api/products',
      method: 'GET',
      duration: Date.now() - startTime,
      error: error.message,
      userId
    });

    throw error;
  }
}
```

### Database Query Performance
```typescript
import { performance } from 'perf_hooks';

const start = performance.now();
const products = await prisma.products.findMany({
  where: { available_for_sale: true },
  include: { product_variants: true }
});
const duration = performance.now() - start;

if (duration > 1000) {
  logger.warn('[DB] Slow query detected', {
    query: 'products.findMany',
    duration,
    recordCount: products.length
  });
}
```

## Optimization Checklist

Copy this checklist for performance reviews:

```
Performance Review Checklist:
- [ ] Step 1: Run Lighthouse CI and check all scores ≥90%
- [ ] Step 2: Analyze Core Web Vitals in production
- [ ] Step 3: Review database query performance
- [ ] Step 4: Check API response times (target <500ms)
- [ ] Step 5: Verify image optimization and lazy loading
- [ ] Step 6: Test bundle size and code splitting
- [ ] Step 7: Validate cache headers and CDN usage
```

## Common Performance Issues

### Database N+1 Queries
```typescript
// Bad: N+1 query
const products = await prisma.products.findMany();
for (const product of products) {
  const variants = await prisma.product_variants.findMany({
    where: { product_id: product.id }
  });
}

// Good: Single query with include
const products = await prisma.products.findMany({
  include: { product_variants: true }
});
```

### Bundle Size Optimization
```typescript
// Use dynamic imports for large components
const AdvancedChart = dynamic(() => import('@/components/AdvancedChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false
});
```

### Image Optimization
```typescript
import Image from 'next/image';

<Image
  src={product.featured_image_url}
  alt={product.title}
  width={400}
  height={300}
  priority={index < 3} // Only for above-fold images
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

## Analytics Dashboard

**Key Metrics to Track:**
- Product page views and conversion rates
- Chat bot usage and satisfaction scores
- API performance and error rates
- User journey drop-off points
- Subscription signup/churn rates

**Real-time Monitoring:**
- Active users and sessions
- Revenue and transaction volume
- System health and uptime
- Database performance metrics

## Error Tracking

```typescript
// Client-side error tracking
useEffect(() => {
  const handleError = (error: ErrorEvent) => {
    analytics.track('client_error', {
      message: error.message,
      filename: error.filename,
      lineno: error.lineno,
      url: window.location.href
    });
  };

  window.addEventListener('error', handleError);
  return () => window.removeEventListener('error', handleError);
}, []);
```

## Performance Testing

- **Load Testing**: Test with realistic user loads
- **Database Stress Testing**: Monitor query performance under load
- **Memory Profiling**: Check for memory leaks
- **Bundle Analysis**: Regular bundle size audits