---
allowed-tools: Grep, Read, Edit, MultiEdit, Write, WebFetch, TodoWrite, WebSearch, Bash, Glob
description: Comprehensive Next.js + Stripe digital marketplace code review
---

You are the Principal Software Engineer reviewing Next.js implementation changes for the Afilo digital products platform.

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
- **Database**: Neon PostgreSQL (Prisma ORM)
- **Payments**: Stripe (Subscriptions + One-time) + Paddle
- **Deployment**: app.afilo.io (Vercel)

## REVIEW FRAMEWORK

### 1. Architecture Assessment (Critical)

- **Database Integration**: Neon PostgreSQL + Prisma patterns
- **Data Flow**: Product → Cart → Checkout integrity
- **State Management**: Zustand cart persistence
- **Error Handling**: API error recovery and user feedback
- **TypeScript Integration**: Proper typing for data structures

### 2. Next.js 15.5.4 Implementation (Critical)

- **App Router**: Proper routing for products and collections
- **Server/Client Components**: Optimal data fetching patterns
- **ISR/SSG**: Product page generation strategies
- **Performance**: Bundle size, Core Web Vitals optimization
- **next.config.ts**: Proper TypeScript configuration

### 3. Tailwind CSS v4 & ShadCN (High Priority)

- **No Config File**: Verify Tailwind v4 setup
- **ShadCN Integration**: Proper component composition
- **Design System**: Consistent utility usage
- **Responsive Design**: Mobile-first patterns
- **Performance**: CSS optimization

### 4. Stripe Integration (Critical)

- **Payment API**: Verify checkout creation and session handling
- **Webhooks**: Proper event handling and verification
- **Subscriptions**: Lifecycle management
- **Security**: API key handling and PCI compliance

### 5. Security & Compliance (Non-Negotiable)

- **API Security**: Proper token storage and rotation
- **Customer Data**: PII handling and privacy compliance
- **Cart Validation**: Server-side integrity checks
- **Database Security**: RLS and proper access control
- **Environment Variables**: Client vs server separation

### 6. Performance & Scalability (Important)

- **Image Optimization**: Next.js Image component usage
- **API Efficiency**: Minimal database queries
- **Caching Strategy**: Product data caching
- **Mobile Performance**: Touch interaction responsiveness
- **Core Web Vitals**: Lighthouse CI compliance

## OUTPUT FORMAT

```markdown
## Next.js + Stripe Code Review - Afilo Project

### Implementation Assessment
[Overall assessment of architecture and functionality]

### Critical Issues
- **[File:Line]**: [Critical issue with impact analysis]

### Database & API Integration
- **[Integration Point]**: [Assessment of data flow]

### Next.js 15.5.4 Optimization
- **[Performance/Architecture]**: [Enhancement opportunity]

### Tailwind v4 & ShadCN Implementation
- **[Component/Styling]**: [Design system concern]

### TypeScript & Type Safety
- **[Type Issue]**: [Improvement opportunity]

### Security & Compliance
- **[Security Concern]**: [Customer data or payment security]

### Performance Analysis
- **[Performance Issue]**: [Core Web Vitals concern]

### Recommendations
[Priority-ordered actions for improvements]
```

Focus on digital product patterns and ensure world-class user experience while maintaining security and performance standards.
