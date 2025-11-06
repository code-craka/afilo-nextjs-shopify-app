---
name: database-ops
description: Manages Prisma schema operations, database migrations, and data relationships for the digital marketplace. Use when working with database schema changes, product data models, or subscription management tables.
---

# Database Operations

Comprehensive database management for Afilo's digital marketplace using Prisma ORM with Neon PostgreSQL.

## Quick Start

**Generate Prisma client:**
```bash
pnpm prisma generate
```

**Apply schema changes:**
```bash
pnpm prisma db push
```

**View database:**
```bash
pnpm prisma studio
```

## Core Models

**Products Ecosystem**: See [products-schema.md](products-schema.md) for digital product relationships
**User Management**: See [users-schema.md](users-schema.md) for authentication and subscriptions
**Chat System**: See [chat-schema.md](chat-schema.md) for knowledge base and conversations
**Analytics**: See [analytics-schema.md](analytics-schema.md) for tracking and reporting

## Schema Patterns

### Product Hierarchy
```
products (base product)
├── product_variants (licensing options)
├── product_pricing_tiers (tiered pricing)
└── product_collection_products (categorization)
```

### Subscription Management
```
user_profiles (customer data)
├── user_subscriptions (billing history)
└── user_activity_log (audit trail)
```

### Chat Bot System
```
chat_conversations (user sessions)
├── chat_messages (conversation history)
├── knowledge_base (searchable content)
└── bot_analytics (performance metrics)
```

## Migration Workflow

Copy this checklist for schema changes:

```
Schema Migration Checklist:
- [ ] Step 1: Update schema.prisma with changes
- [ ] Step 2: Generate migration with descriptive name
- [ ] Step 3: Review generated SQL carefully
- [ ] Step 4: Test migration on development database
- [ ] Step 5: Backup production data before applying
- [ ] Step 6: Apply migration to production
- [ ] Step 7: Generate new Prisma client
- [ ] Step 8: Update application code to use new schema
```

## Important Indexes

**Performance-critical indexes:**
- `products`: handle, stripe_product_id, tags (GIN), tech_stack (GIN)
- `product_variants`: sku, license_type, stripe_price_id
- `user_profiles`: clerk_user_id, email, subscription_tier
- `knowledge_base`: content_type, embedding (vector), searchable_text (GIN)
- `chat_messages`: conversation_id, created_at

## Data Relationships

### Products and Variants
- One product → Many variants (different license types)
- Each variant has unique pricing and terms
- Stripe integration via stripe_product_id/stripe_price_id

### Users and Subscriptions
- One user → Many subscription records (history)
- Clerk authentication integration
- Activity logging for compliance

### Knowledge Base
- Vector embeddings for semantic search
- Full-text search with tsvector
- Content type categorization

## Prisma Best Practices

### Query Optimization
```typescript
// Include related data efficiently
const product = await prisma.products.findUnique({
  where: { handle: 'premium-toolkit' },
  include: {
    product_variants: {
      where: { available_for_sale: true },
      orderBy: { price: 'asc' }
    }
  }
});
```

### Batch Operations
```typescript
// Use transactions for consistency
await prisma.$transaction([
  prisma.products.update({ ... }),
  prisma.product_variants.updateMany({ ... }),
]);
```

### Connection Management
```typescript
// Use singleton pattern for Prisma client
export const prisma = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
```

## Data Validation

**Required validations:**
- Email format validation
- Price amounts (positive decimals)
- License type consistency
- Stripe ID format validation
- UUID format for primary keys

## Row Level Security

Several tables use RLS for data isolation:
- `cart_items`: User can only access their own items
- `downloads`: Subscription-based access control
- `user_profiles`: Self-access only
- `chat_conversations`: User owns conversations

## Backup and Recovery

- **Neon automatic backups**: Point-in-time recovery
- **Manual backups**: Before major migrations
- **Data export**: Regular exports for compliance
- **Testing restores**: Verify backup integrity