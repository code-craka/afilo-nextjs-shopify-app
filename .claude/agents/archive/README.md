# Afilo Enterprise - Specialized Agents

Context-efficient expert agents for specific tasks. These agents are designed to minimize token usage by focusing only on relevant files and leveraging existing caching systems.

## Available Agents

### 1. Shopify API Expert (`shopify-api.md`)
**Use for**: Product management, cart operations, GraphQL queries, caching optimization

**Key capabilities**:
- Shopify Storefront API v2024.10 integration
- Cart CRUD with IDOR protection
- Rate limiting and request deduplication
- Server-side vs client-side API usage
- Cache manager integration

**Common commands**:
```bash
@shopify-api Help me optimize product fetching
@shopify-api Add new GraphQL field to products
@shopify-api Debug cart ownership validation issue
```

---

### 2. Stripe Payments Expert (`stripe-payments.md`)
**Use for**: Subscriptions, webhooks, payment methods, fraud prevention

**Key capabilities**:
- Stripe Subscriptions (NO free trials)
- 16+ webhook event handlers
- ACH + Card payments with Adaptive 3DS
- Credential generation and email delivery
- Stripe Radar fraud prevention

**Common commands**:
```bash
@stripe-payments Add new subscription plan
@stripe-payments Debug webhook event handling
@stripe-payments Setup ACH Direct Debit
```

---

### 3. Clerk Auth Expert (`clerk-auth.md`)
**Use for**: Authentication, user management, OAuth, database integration

**Key capabilities**:
- Clerk Authentication SDK
- Google OAuth integration
- User profile CRUD (Neon PostgreSQL)
- Route protection middleware
- Webhook verification

**Common commands**:
```bash
@clerk-auth Add protected route
@clerk-auth Setup new OAuth provider
@clerk-auth Debug user profile creation
```

---

### 4. Next.js Performance Expert (`nextjs-performance.md`)
**Use for**: Caching, optimization, Core Web Vitals, TanStack Query

**Key capabilities**:
- TanStack Query client-side caching
- Server-side cache manager (TTL-based)
- Request deduplication
- Core Web Vitals monitoring
- Image optimization

**Common commands**:
```bash
@nextjs-performance Optimize product grid caching
@nextjs-performance Debug slow API response
@nextjs-performance Improve LCP score
```

---

### 5. Security Audit Expert (`security-audit.md`)
**Use for**: Security fixes, IDOR prevention, rate limiting, compliance

**Key capabilities**:
- IDOR protection with ownership validation
- Distributed rate limiting (Upstash Redis)
- Security event logging
- Webhook signature verification
- Enterprise compliance (SOC 2, ISO 27001, HIPAA)

**Common commands**:
```bash
@security-audit Review cart API security
@security-audit Add rate limit to endpoint
@security-audit Run automated security tests
```

---

### 6. UI/UX Components Expert (`ui-components.md`)
**Use for**: React components, animations, design system, accessibility

**Key capabilities**:
- React 19 + TypeScript strict mode
- Framer Motion animations
- ShadCN UI components
- Glassmorphism design patterns
- WCAG 2.1 AA accessibility

**Common commands**:
```bash
@ui-components Create skeleton loader for pricing cards
@ui-components Add mobile navigation menu
@ui-components Fix layout shift issue
```

---

## How to Use Agents

### 1. Invoke an agent with @mention
```bash
@shopify-api Help me add a new product variant field
```

### 2. Multiple agents for complex tasks
```bash
@shopify-api Fetch products efficiently
@nextjs-performance Cache the results properly
```

### 3. Context-aware requests
Agents will:
- ✅ Read only relevant files (not entire codebase)
- ✅ Leverage existing caching systems
- ✅ Reference production Price IDs and environment variables
- ✅ Follow TypeScript strict mode and security best practices

---

## Benefits of Using Agents

### 🚀 Token Efficiency
- Agents read only 5-10 files (vs 50+ in full context)
- Focused expertise = faster responses
- Leverage cached knowledge from CLAUDE.md

### 🎯 Specialized Knowledge
- Each agent is an expert in their domain
- Pre-configured with project-specific details
- Know exactly which files to check

### 🔄 Caching Optimization
- Agents understand our caching layers:
  - TanStack Query (client-side)
  - Cache Manager (server-side)
  - Upstash Redis (rate limiting)
- Will suggest proper cache strategies

### 🛡️ Security First
- Security agent for all auth/payment changes
- Automatic IDOR and rate limit checks
- Compliance-aware recommendations

---

## Agent Selection Guide

| Task | Agent(s) |
|------|----------|
| Product catalog changes | `@shopify-api` |
| Subscription plan updates | `@stripe-payments` |
| User authentication flow | `@clerk-auth` |
| Slow page load | `@nextjs-performance` |
| Security vulnerability | `@security-audit` |
| UI component creation | `@ui-components` |
| New feature (complex) | Multiple agents sequentially |

---

## Example Workflows

### Add New Subscription Plan
```bash
# Step 1: Create Stripe product
@stripe-payments Create new "Pro Plus" plan at $2,999/month

# Step 2: Update UI
@ui-components Add pricing card for Pro Plus plan

# Step 3: Test security
@security-audit Verify webhook handling for new plan
```

### Optimize Product Loading
```bash
# Step 1: Analyze performance
@nextjs-performance Why is ProductGrid slow?

# Step 2: Implement caching
@shopify-api Add proper TanStack Query configuration

# Step 3: Verify results
@nextjs-performance Measure LCP improvement
```

### Fix Security Issue
```bash
# Step 1: Identify vulnerability
@security-audit Review /api/cart endpoint for IDOR

# Step 2: Implement fix
@security-audit Add ownership validation

# Step 3: Test
@security-audit Run automated security tests
```

---

## Tips for Maximum Efficiency

1. **Be Specific**: "Add ACH payment method" vs "Help with payments"
2. **Chain Agents**: Use multiple agents for complex tasks
3. **Reference Existing Code**: Agents know our architecture
4. **Trust the Cache**: Agents leverage our 3-layer caching
5. **Security First**: Always involve `@security-audit` for auth/payments

---

## Agent Maintenance

Agents are automatically updated when:
- New features are added (Stripe plans, Shopify fields, etc.)
- Architecture changes (new caching layer, database schema)
- Security policies update (rate limits, compliance standards)

**Last Updated**: January 2025
**Agent Version**: 1.0.0
**Total Agents**: 6
