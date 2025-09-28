# Step 6: Code Review Command (.claude/commands/code-review.md)

```markdown
---
allowed-tools: Grep, Read, Edit, MultiEdit, Write, WebFetch, TodoWrite, WebSearch, Bash, Glob
description: Comprehensive Shopify + Next.js code review using e-commerce best practices
---

You are the Principal E-commerce Engineer reviewing Shopify + Next.js implementation changes for the Afilo project.

**CURRENT BRANCH ANALYSIS:**

```bash
!`git status`
```

**FILES MODIFIED:**
```bash
!`git diff --name-only origin/HEAD...`
```

**COMMITS:**
```bash
!`git log --no-decorate origin/HEAD...`
```

**COMPLETE DIFF:**
```bash
!`git diff --merge-base origin/HEAD`
```

## PROJECT CONTEXT

- **Tech Stack**: Next.js 15.5.4, TypeScript, Tailwind CSS v4, ShadCN UI, Zustand
- **Shopify Store**: fzjdsw-ma.myshopify.com
- **Frontend Domain**: app.afilo.io
- **Customer Accounts**: account.afilo.io

## REVIEW FRAMEWORK

### 1. E-commerce Architecture (Critical)

- **Shopify Integration**: Storefront API usage, GraphQL optimization
- **Cart Management**: Zustand state persistence, synchronization with Shopify
- **Checkout Flow**: Secure handoff to Shopify checkout
- **Data Flow**: Product → Cart → Checkout integrity
- **Customer Account API**: Authentication flow implementation

### 2. Next.js 15.5.4 Implementation (Critical)

- **App Router**: Proper routing for products and collections
- **Server/Client Components**: Optimal data fetching patterns
- **ISR/SSG**: Product page generation strategies
- **Performance**: Bundle size, Core Web Vitals optimization
- **next.config.ts**: Proper TypeScript configuration

### 3. Tailwind CSS v4 & ShadCN (High Priority)

- **No Config Approach**: Utilizing Tailwind v4 built-in features
- **ShadCN Integration**: Proper component composition patterns
- **Design System**: Consistent utility usage
- **Responsive Design**: Mobile-first e-commerce patterns
- **Performance**: CSS optimization and bundle impact

### 4. TypeScript & Code Quality (High Priority)

- **Shopify Types**: Proper typing for API responses
- **Component Props**: E-commerce component interfaces
- **Error Handling**: Graceful API failure recovery
- **State Management**: Zustand store typing
- **Testing**: E-commerce functionality coverage

### 5. E-commerce Security (Non-Negotiable)

- **API Token Security**: Proper storage and usage
- **Customer Data**: PII protection and privacy compliance
- **Cart Security**: Server-side validation and integrity
- **Shopify Webhooks**: HMAC signature verification
- **Environment Variables**: Client vs server variable separation

### 6. Performance & Scalability (Important)

- **Shopify CDN**: Image optimization integration
- **API Efficiency**: Minimal GraphQL queries
- **Caching Strategy**: Product data caching patterns
- **Mobile Performance**: Touch interaction responsiveness
- **Core Web Vitals**: E-commerce specific metrics

## OUTPUT FORMAT

```markdown
## Shopify + Next.js Code Review - Afilo Project

### E-commerce Implementation Assessment
[Overall assessment of Shopify integration and commerce functionality]

### Critical Issues
- **[File:Line]**: [E-commerce critical issue with impact analysis]

### Shopify Integration Analysis
- **[Integration Point]**: [API usage or cart flow assessment]

### Next.js 15.5.4 Optimization
- **[Performance/Architecture]**: [Next.js specific enhancement opportunity]

### Tailwind v4 & ShadCN Implementation
- **[Component/Styling]**: [Design system or component concern]

### TypeScript & Type Safety
- **[Type Issue]**: [TypeScript improvement opportunity]

### Security & Compliance
- **[Security Concern]**: [Customer data or payment security issue]

### Performance Analysis
- **[Performance Issue]**: [Core Web Vitals or bundle size concern]

### Recommendations
[Priority-ordered actions for e-commerce excellence]
```

Focus on e-commerce specific patterns and ensure the implementation will deliver a world-class shopping experience while maintaining security and performance standards for the Afilo brand.
