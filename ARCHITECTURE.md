# Architecture Overview

**Afilo Enterprise Digital Marketplace** - Fortune 500 headless e-commerce platform specializing in digital software products (AI tools, templates, scripts, plugins) with enterprise-grade security and sophisticated license management.

## System Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  Next.js 15 App Router + React 19 + Tailwind CSS v4            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Pages      │  │  Components  │  │  State Mgmt  │         │
│  │ /products    │  │ ProductGrid  │  │   Zustand    │         │
│  │ /enterprise  │  │ Stripe UI    │  │ Digital Cart │         │
│  │ /dashboard   │  │ Auth UI      │  │   License    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MIDDLEWARE LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Clerk Auth   │  │ Rate Limit   │  │  Security    │         │
│  │ Protected    │  │ Upstash      │  │  Headers     │         │
│  │ Routes       │  │ Redis        │  │  IDOR Guard  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER                                   │
│  Server-Side API Routes (app/api/**)                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ /api/cart    │  │ /api/products│  │ /api/webhooks│         │
│  │ CRUD + IDOR  │  │ DB + Stripe  │  │ Clerk/Stripe │         │
│  │ Protection   │  │ Sync         │  │ Auto Profile │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    INTEGRATION LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │    Stripe    │  │    Clerk     │  │ Neon Database│         │
│  │   Payments   │  │ Google OAuth │  │  PostgreSQL  │         │
│  │ Subscriptions│  │ WebAuthN     │  │  Products +  │         │
│  │   Webhooks   │  │ WebAuthN     │  │  User Data   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Next.js 15.5.4**: App Router, React Server Components, streaming SSR
- **React 19.1.0**: Latest concurrent features, automatic batching
- **TypeScript 5.6**: Strict mode, path aliases (`@/*`), comprehensive types
- **Tailwind CSS v4**: Zero-config, CSS-first design system
- **Framer Motion 12**: Professional animations, stagger effects, page transitions

### Backend & Integration
- **Stripe 19.1.0**: Payment processing, subscriptions, webhooks
- **Clerk v6.34.0**: Enterprise authentication with Google OAuth
- **Neon PostgreSQL**: Serverless database for products, users, cart
- **Prisma 6.18.0**: Type-safe ORM with Neon adapter
- **Upstash Redis**: Distributed rate limiting across serverless instances
- **Resend**: Transactional email service

### State & Data
- **Zustand 5.0.8**: Cart state with persistence, license management
- **Prisma Client**: Type-safe database queries with connection pooling
- **Server-Only Pattern**: Token security with `server-only` package

## Core Architectural Patterns

### 1. Security-First Design (Score: 9/10)
**Enterprise-grade protection implemented Jan 30, 2025**

```typescript
// Cart Ownership Protection
validateCartOwnership(userId, cartItem) → Prevents unauthorized access
logSecurityEvent() → Audit trail for compliance

// lib/rate-limit.ts - Distributed Rate Limiting
productsApiRateLimit: 100 req/15min
cartRateLimit: 30 req/min per user/IP
checkoutRateLimit: 5 req/15min (prevents abuse)
```

**Security Layers:**
- IDOR vulnerability protection on all cart endpoints
- Server-only API tokens (Stripe, Clerk - never exposed to client)
- Clerk authentication with route protection middleware
- Rate limiting headers in all API responses
- Security event logging with user/IP tracking
- Stripe webhook signature verification

### 2. Digital Product Specialization
**Not typical e-commerce - software-focused architecture**

```typescript
// components/ProductGrid.tsx - Intelligent Categorization
getTechStackFromProduct() → Detects React, Python, AI, etc.
getLicenseType() → Infers from pricing and metadata
getDigitalProductType() → Template, Script, AI Tool, Plugin

// store/digitalCart.ts - Advanced Licensing
6 License Types: Free → Personal → Commercial → Extended → Enterprise → Developer
Educational Discounts: 50% student, 30% teacher, 40% institution
Volume Pricing: 10-25% discount for 25-500+ users
Regional Tax Calculation: US, CA, GB, DE, AU
```

### 3. Server/Client Separation
**Critical for token security and performance**

```
Server-Side Only:
├── lib/prisma.ts - Database client with Neon adapter
├── lib/stripe-server.ts - Stripe API client with secret key
├── app/api/** - All API routes with auth
└── Server Components - Product fetching, auth checks

Client-Side:
├── components/** - UI components with animations
├── store/cart.ts - Cart state (no API keys)
├── hooks/useDigitalCart.ts - Cart operations
└── Client Components - Interactive UI, forms
```

### 4. Performance Optimization
**Optimized database queries and caching**

- **Prisma Connection Pooling**: Efficient database connections with Neon adapter
- **Request Deduplication**: Prevent duplicate API calls (lib/request-manager.ts)
- **In-Memory Caching**: Product listings cached for 60s, search for 30s
- **Redis Rate Limiting**: Distributed, persistent across deployments
- **Batch Database Queries**: Fetch multiple products in single query
- **Optimistic Updates**: Instant UI feedback with background sync

## Data Flow

### Product Display Flow
```
1. User visits /products
2. Server Component queries Neon DB via Prisma
3. Products fetched from database with filters/pagination
4. ProductGrid displays products with:
   - Tech stack tags (from metadata)
   - License types (from product_variants)
   - Pricing (synced with Stripe)
5. Client renders with Framer Motion animations
6. "Add to Cart" → Zustand store update → API call to POST /api/cart/items
```

### Authentication Flow
```
1. User clicks "Sign In with Google"
2. Clerk OAuth redirect to Google
3. Google consent → Clerk callback
4. Webhook to /api/webhooks/clerk
5. Auto-create user_profiles in Neon DB
6. Redirect to /dashboard with session
7. Middleware protects all /dashboard, /enterprise, /api routes
```

### Cart & Checkout Flow
```
1. Add to cart → POST /api/cart/items (DB + Zustand update)
2. License selection → Price calculation with discounts
3. Cart stored in PostgreSQL cart_items table
   - User-scoped via Clerk user_id
   - Status tracking (active, abandoned, purchased)
   - Stripe session tracking
4. Checkout → POST /api/stripe/create-cart-checkout
   - Create Stripe Checkout Session
   - Redirect to Stripe-hosted checkout
   - IDOR protection validates cart ownership
5. Payment completion → Stripe webhook
   - checkout.session.completed event
   - Grant access, send credentials email
   - Update cart status to 'purchased'
```

## Database Schema (Neon PostgreSQL)

```sql
-- Products & Catalog
products (39 columns)
├── id, name, slug, description
├── stripe_product_id, stripe_price_id
├── price, currency, product_type
├── available_licenses (JSONB)
├── tech_stack (TEXT[])
└── images, metadata (JSONB)

product_variants (17 columns)
├── id, product_id, license_type
├── price, billing_interval
└── license_terms (JSONB)

-- Shopping Cart
cart_items (18 columns)
├── id, user_id (Clerk), product_id
├── quantity, license_type
├── status (active, abandoned, purchased)
├── stripe_session_id
└── created_at, updated_at

-- User Authentication & Profiles
user_profiles (18 columns)
├── id, clerk_user_id, email
├── subscription_tier, role
├── purchase_type, last_login
└── created_at, updated_at

-- Subscriptions
subscriptions (12 columns)
├── id, user_id, stripe_subscription_id
├── plan, status, billing_interval
└── current_period_start, current_period_end

-- Security & Compliance
user_activity_log
├── id, user_id, action
├── ip_address, timestamp
└── details (JSONB)
```

## API Endpoints

### Cart Operations (Protected)
- `GET /api/cart/items` - List cart items (IDOR protected)
- `POST /api/cart/items` - Add to cart (rate limited: 30/min)
- `PATCH /api/cart/items/[id]` - Update item (ownership validated)
- `DELETE /api/cart/items/[id]` - Remove item (ownership validated)
- `POST /api/cart/sync` - Sync cart with server
- `GET /api/cart/abandoned` - Get abandoned carts (admin)

### Product Management
- `GET /api/products` - List products (filters, pagination, search)
- `GET /api/products/[handle]` - Single product details
- `POST /api/products` - Create product (admin only)
- `POST /api/products/sync-stripe` - Sync with Stripe
- `GET /api/products/stripe-pricing` - Stripe-synced pricing

### Stripe Integration
- `POST /api/stripe/create-checkout-session` - Create checkout
- `POST /api/stripe/create-cart-checkout` - Cart checkout
- `POST /api/stripe/webhook` - Handle Stripe webhooks
- `POST /api/billing/create-portal-session` - Customer portal

### Webhooks & Auth
- `POST /api/webhooks/clerk` - User profile creation (Clerk)
- `GET /api/user/role` - Get user role

## Key Design Decisions

### Why Stripe + Neon PostgreSQL?
- **Direct Control**: Full ownership of product catalog and customer data
- **Lower Costs**: Avoid Shopify platform fees (2.9% payment + 2% platform vs 2.9% Stripe only)
- **Flexibility**: Complete customization of checkout flow and user experience
- **Serverless Scale**: Neon PostgreSQL scales automatically with demand
- **Modern Stack**: Type-safe Prisma ORM with bleeding-edge database features
- **No Lock-in**: Own your data, can migrate to any database if needed

### Why Clerk for Auth?
- **Enterprise Features**: SSO, MFA, user management out-of-box
- **Developer Experience**: Simple Next.js integration
- **Security**: SOC 2 Type II certified, GDPR compliant
- **Scalability**: Handles 500+ Fortune 500 clients

### Why Zustand for Cart?
- **Simplicity**: No boilerplate vs Redux
- **Performance**: Minimal re-renders, optimized selectors
- **Persistence**: localStorage integration for cart recovery
- **TypeScript**: Full type safety with strict mode

### Why Upstash Redis?
- **Serverless-First**: Designed for Edge/serverless environments
- **Global Distribution**: Low latency worldwide
- **Cost-Effective**: Pay-per-request pricing
- **Reliability**: 99.99% uptime SLA

## Deployment Architecture

```
Production: app.afilo.io (Vercel)
├── Edge Network: Global CDN with automatic caching
├── Serverless Functions: API routes with 10s timeout
├── Environment: Production secrets in Vercel dashboard
└── Monitoring: Real-time logs, analytics, error tracking

Database: Neon PostgreSQL
├── Serverless: Auto-scaling with WebSocket support
├── Connection Pooling: Prisma + Neon adapter
├── Global Regions: Multi-region deployment
└── Backups: Automatic daily backups

Payment Processing: Stripe
├── Checkout: Hosted checkout page (PCI-compliant)
├── Webhooks: Real-time payment notifications
├── Subscriptions: Automated billing and renewals
└── Customer Portal: Self-service billing management
```

## Security Posture

**Security Score: 9/10 (Enterprise-Grade)**

✅ IDOR protection with cart ownership validation
✅ API tokens never exposed to client (server-only pattern)
✅ Distributed rate limiting (Upstash Redis)
✅ Clerk authentication on all sensitive endpoints
✅ Stripe webhook signature verification
✅ Security event logging for compliance
✅ HSTS, XSS, CSRF protection headers

**Remaining Enhancements:**
- CSP headers for XSS prevention (planned)
- Penetration testing (recommended before IPO)
- SIEM integration (Sentry/DataDog for Fortune 500 clients)

## Performance Metrics

**Core Web Vitals Targets:**
- LCP: < 2.5s (homepage hero render)
- FID: < 100ms (interactive cart operations)
- CLS: < 0.1 (stable layout during loading)

**API Performance:**
- Database queries: < 100ms (Prisma + connection pooling)
- Cart operations: < 150ms (optimized batch queries)
- Stripe checkout: < 500ms (session creation)
- Rate limiting: < 10ms (Redis lookup)
- Digital delivery: < 50ms (instant access)

**Uptime SLA: 99.99%** (Fortune 500 requirement)

---

**Maintained with ❤️ by Rihan** | **Built for Fortune 500 Scale** | **Deployed on Vercel**
