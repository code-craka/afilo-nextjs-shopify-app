---
name: api-routes
description: Next.js API route development patterns for the digital marketplace including authentication, error handling, validation, and RESTful conventions. Use when creating new API endpoints or modifying existing routes.
---

# API Route Development

Next.js App Router API patterns for secure, scalable marketplace endpoints.

## Quick Start

**Basic API route structure:**
```typescript
// app/api/products/route.ts
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Your logic here
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

**Dynamic route with validation:**
```typescript
// app/api/products/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const productId = await params.id;
  // Validate UUID format, etc.
}
```

## Core Patterns

**Authentication**: See [auth-patterns.md](auth-patterns.md) for Clerk integration
**Validation**: See [validation.md](validation.md) for input sanitization
**Error Handling**: See [error-handling.md](error-handling.md) for consistent responses
**Rate Limiting**: See [rate-limiting.md](rate-limiting.md) for API protection

## API Structure

### Billing Routes (`/api/billing/`)
- `subscriptions/active` - Get active subscriptions
- `subscriptions/cancel` - Cancel subscription
- `subscriptions/change-plan` - Upgrade/downgrade
- `payment-methods/list` - List saved payment methods
- `invoices/list` - Billing history

### Chat Routes (`/api/chat/`)
- `conversations` - CRUD for chat sessions
- `conversations/[id]/messages` - Message management
- `admin/chat/analytics` - Usage metrics

### Product Routes (`/api/products/`)
- `route.ts` - List/create products
- `[handle]/route.ts` - Get specific product
- `sync-stripe` - Sync with Stripe catalog

### Admin Routes (`/api/admin/`)
- `knowledge-base/crawl` - Trigger website crawl
- `knowledge-base/[id]` - KB article management

## Request/Response Patterns

### Standard Success Response
```typescript
return NextResponse.json({
  success: true,
  data: result,
  meta: {
    timestamp: new Date().toISOString(),
    requestId: crypto.randomUUID()
  }
});
```

### Standard Error Response
```typescript
return NextResponse.json({
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid input data',
    details: validationErrors
  }
}, { status: 400 });
```

## Authentication Flow

Copy this checklist for protected routes:

```
API Authentication Checklist:
- [ ] Step 1: Import auth from @clerk/nextjs/server
- [ ] Step 2: Call await auth() to get user context
- [ ] Step 3: Check if userId exists
- [ ] Step 4: Verify user permissions if needed
- [ ] Step 5: Return 401 if unauthorized
- [ ] Step 6: Include user context in database queries
```

## Validation Patterns

### Input Validation
```typescript
import { z } from 'zod';

const createProductSchema = z.object({
  title: z.string().min(1).max(255),
  price: z.number().positive(),
  handle: z.string().regex(/^[a-z0-9-]+$/),
});

const body = createProductSchema.parse(await request.json());
```

### Parameter Validation
```typescript
// Validate UUID format
if (!isValidUUID(productId)) {
  return NextResponse.json(
    { error: 'Invalid product ID format' },
    { status: 400 }
  );
}
```

## Database Integration

### Prisma Usage Pattern
```typescript
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.products.findMany({
      where: { available_for_sale: true },
      include: { product_variants: true },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('[API] Database error:', error);
    return NextResponse.json(
      { error: 'Database operation failed' },
      { status: 500 }
    );
  }
}
```

## Error Handling Strategy

### Error Types
- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Missing/invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource doesn't exist
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Error**: Server-side errors

### Error Logging
```typescript
import { logger } from '@/lib/logger';

catch (error) {
  logger.error('[API] Operation failed', {
    error: error.message,
    stack: error.stack,
    userId,
    path: request.url
  });

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

## Performance Considerations

- **Database Queries**: Use indexes and limit results
- **Response Caching**: Set appropriate cache headers
- **Pagination**: Implement cursor-based pagination
- **Connection Pooling**: Reuse database connections

## Security Best Practices

- **Input Sanitization**: Validate all inputs
- **Rate Limiting**: Protect against abuse
- **CORS Headers**: Control cross-origin access
- **Audit Logging**: Track sensitive operations
- **Secrets Management**: Use environment variables

## Testing Patterns

```typescript
// Test authenticated endpoint
const response = await fetch('/api/products', {
  headers: {
    'Authorization': `Bearer ${testToken}`,
    'Content-Type': 'application/json'
  }
});

expect(response.status).toBe(200);
const data = await response.json();
expect(data.success).toBe(true);
```