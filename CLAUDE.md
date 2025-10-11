# Afilo Enterprise Digital Marketplace - Claude Code Configuration

## Project Overview

Enterprise-grade digital marketplace commanding Fortune 500 pricing - Premium AI-powered software platform built with Next.js 15, TypeScript, and Shopify. Specializes in high-value software products with enterprise pricing ($499-$9,999+/month).

## Tech Stack

- **Frontend**: Next.js 15.5.4 (App Router), React 19.1.0, TypeScript 5.6 (Strict Mode)
- **Styling**: Tailwind CSS v4 (zero config), ShadCN UI with enterprise patterns
- **Animations**: Framer Motion 12.23.22 for premium interactions
- **State Management**: Zustand 5.0.8 with persistence for enterprise cart & subscriptions
- **Backend**: Shopify Storefront API v2024.10 with enhanced enterprise features
- **Authentication**: Clerk Authentication with Google OAuth integration and enterprise SSO support
- **Database**: Neon Database (PostgreSQL) with serverless architecture
- **Payments**: Stripe Subscriptions (NO trials) + ACH Direct Debit + Adaptive 3DS + Paddle (in progress) + Shopify Checkout integration
- **Enterprise Features**: Premium pricing, subscription management, custom quote builder
- **Deployment**: Vercel (app.afilo.io) with enterprise portal (app.afilo.io/enterprise)
- **Package Manager**: pnpm 8.15.6 (required - never use npm)

## Payment Processors

### Stripe (Production - Active)
- Primary payment processor for subscriptions and one-time payments
- Complete integration with ACH Direct Debit + Cards + Adaptive 3DS
- Webhook handlers for 16+ subscription lifecycle events
- Stripe Radar fraud prevention configured

### Paddle (In Progress - Business Verification)
- Secondary payment processor for global expansion
- Business verification completed January 30, 2025
- Requires Paddle-compliant refund policy (completed)
- Awaiting final approval from Paddle support team

## Development Workflow

### Code Review Standards

- Use `@shopify-code-review` agent for comprehensive reviews
- Run `/code-review` before merging to main branch
- Focus on digital commerce security, performance, and Shopify integration patterns
- Ensure TypeScript strict mode compliance
- Review digital product specific features and licensing logic

### Design Review Standards

- Use `@nextjs-design-review` agent for UI/UX changes
- Run `/design-review` for all frontend modifications
- Follow design system principles in `.claude/context/shopify-design-system.md`
- Ensure responsive design and accessibility compliance
- Focus on software product showcase effectiveness and B2B conversion

### Security Review Standards

- Use `/security-review` for all digital commerce related changes
- Mandatory for authentication, cart, checkout, and digital delivery flows
- Follow OWASP guidelines and digital product security requirements
- Review Shopify API integrations for data exposure
- Validate license management and digital rights protection
- Review Clerk authentication flows and database security

## Quick Commands

- `claude` - Start interactive development session
- `/code-review` - Review current branch changes
- `/design-review` - Review frontend/UI changes
- `/security-review` - Digital commerce security scan
- `@shopify-code-review` - Invoke expert Shopify reviewer
- `@nextjs-design-review` - Invoke Next.js design specialist

## Performance Standards

- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Bundle Size**: Main bundle < 250KB gzipped
- **API Response**: < 200ms for Shopify API calls
- **Digital Delivery**: Instant access with <50ms response time
- **Shopify Checkout**: Seamless handoff with <100ms redirect

## Enterprise Features (Phase 1)

### Premium Pricing System
- **Professional Plan**: $499-$2,499/month for up to 25 users
- **Enterprise Plan**: $1,999-$9,999/month for up to 500 users
- **Enterprise Plus**: $9,999+/month for unlimited users
- **Volume Discounts**: 10-25% discounts for bulk licensing (25-500+ users)
- **Educational Discounts**: 50% student, 30% teacher, 40% institution
- **Annual Billing**: 17% savings with annual subscriptions

### Stripe Subscription System (COMPLETE - January 2025)
- **NO Free Trials**: Customers pay immediately before getting access
- **4 Enterprise Plans**: Professional ($499/mo), Business ($1,499/mo), Enterprise ($4,999/mo), Enterprise Plus ($9,999/mo)
- **Annual Billing**: 17% discount on all annual subscriptions
- **Automated Credentials**: System generates username, password, account ID after payment
- **Email Delivery**: Beautiful HTML emails with login credentials via Resend
- **Dual Payment Methods**: Credit Card + ACH Direct Debit support
- **Complete Webhooks**: 16+ events handled for subscription lifecycle
- **Production Ready**: Actual Stripe Price IDs configured and tested
- **Usage Analytics**: Real-time monitoring of users, projects, API calls, storage (planned)
- **Billing History**: Complete transaction and invoice management (via Stripe)
- **Plan Upgrades/Downgrades**: Seamless tier changes with prorated billing (webhook ready)

### Enterprise Quote Builder
- **ROI Calculator**: 3-year investment projections with payback analysis
- **Custom Requirements**: Infrastructure, integration, customization, compliance
- **Implementation Estimates**: $50K-$500K enterprise deployments
- **Volume Pricing**: Automatic bulk discount calculations
- **Professional Services**: Dedicated teams, training, white-label options

### Advanced Digital Commerce

#### ProductGrid Component (Enhanced)

**Digital Product Showcase:**
- Smart tech stack detection (React, Python, AI, TypeScript, etc.)
- Dynamic product type badges (AI Tool, Template, Script, Plugin, etc.)
- License type indicators (Personal, Commercial, Extended, Enterprise)
- Version numbering and update indicators
- Documentation availability badges
- Live demo/preview buttons

**Software Company Branding:**
- Professional developer-focused design
- Technical credibility elements
- Code/software aesthetic touches
- B2B confidence indicators

**Digital Commerce Elements:**
- Instant download indicators
- No shipping/inventory elements
- License terms preview
- System requirements display (planned)
- Digital status indicators

### Enterprise File Structure

```
components/
├── PremiumPricingDisplay.tsx     # Enterprise pricing tiers ($499-$9,999+/month)
├── SubscriptionManager.tsx       # Complete subscription lifecycle management
├── EnterpriseQuoteBuilder.tsx    # Custom quote system with ROI projections
├── ProductGrid.tsx              # Enhanced digital commerce product grid
├── DigitalProductGrid.tsx       # Alternative cart-integrated grid
├── DigitalCartWidget.tsx        # Advanced cart system with licensing
├── LiveMetricsDashboard.tsx     # Real-time business metrics & $50M+ revenue positioning
├── TechnologyShowcase.tsx       # Military-grade architecture & security certifications
├── CustomerSuccessStories.tsx   # Fortune 500 case studies with documented ROI
├── EnterprisePortal.tsx         # Multi-user enterprise management portal
├── stripe/
│   ├── SubscriptionCheckout.tsx  # Subscription checkout button with email input
│   └── StripePaymentForm.tsx     # One-time payment form (Card + ACH)
└── ui/                          # ShadCN UI components with enterprise patterns
    ├── badge.tsx                 # Badge component (Most Popular, etc.)
    ├── card.tsx                  # Card component
    └── alert.tsx                 # Alert component

lib/
├── shopify.ts                   # Enhanced Shopify API client with subscriptions
├── stripe-server.ts             # Server-side Stripe client with subscription events
├── stripe-browser.ts            # Browser Stripe.js loader with appearance config
├── credentials-generator.ts     # Secure credential generation (username, password, account ID)
├── email-service.ts             # Email templates (Resend) - credentials, renewal, cancellation
└── utils.ts                     # Utility functions

scripts/
└── create-enterprise-subscriptions-no-trial.ts  # Creates 4 subscription products in Stripe

store/
└── digitalCart.ts               # Enterprise cart & licensing state (Zustand)

hooks/
└── useDigitalCart.ts            # Cart operations with advanced licensing

types/
└── shopify.ts                   # Enhanced Shopify & enterprise types

app/
├── page.tsx                     # Premium homepage with authority components integrated
├── enterprise/page.tsx          # 4-tab enterprise portal (Pricing, Subscriptions, Quote, Portal)
├── pricing/page.tsx             # Stripe subscription pricing page (4 plans with billing toggle)
├── subscribe/success/page.tsx   # Success page with session retrieval and next steps
├── products/page.tsx            # Full product catalog
├── dashboard/page.tsx           # Protected user dashboard with profile management
├── sign-in/[[...sign-in]]/page.tsx    # Custom sign-in with Google OAuth integration
├── sign-up/[[...sign-up]]/page.tsx    # Registration with email verification
├── sso-callback/page.tsx        # OAuth callback handler
├── test-shopify/page.tsx        # API testing page
├── test-stripe-payment/page.tsx # One-time payment testing
├── test-subscription/page.tsx   # Subscription testing with API health checks
└── api/
    ├── stripe/
    │   ├── create-payment-intent/route.ts      # One-time payment intent creation
    │   ├── create-subscription-checkout/route.ts  # Subscription checkout session creation
    │   ├── session/[sessionId]/route.ts        # Retrieve session details for success page
    │   └── webhook/route.ts                    # Webhook handler (16+ events)
    ├── users/create-profile/route.ts   # User profile creation with Clerk integration
    └── webhooks/clerk/route.ts         # Clerk webhook handler for OAuth users

docs/
├── STRIPE_SUBSCRIPTION_IMPLEMENTATION_GUIDE.md  # Complete implementation guide (200+ lines)
├── STRIPE_SETUP_GUIDE.md                        # Initial Stripe setup
├── STRIPE_IMPLEMENTATION_SUMMARY.md             # Feature overview
└── STRIPE_QUICK_START.md                        # Quick reference
```

### API Integration

**Shopify Storefront API:**
- Production-ready client with retry logic
- Comprehensive error handling
- GraphQL fragments for performance
- Full CRUD operations for products, collections, cart

**Digital Product Data Structure:**
- Tech stack extraction from product metadata
- License type detection and display
- Version number parsing
- Documentation and demo availability detection

## MCP Integration

- **GitHub MCP**: Repository management and deployment (`npx -y @modelcontextprotocol/server-github`)
- **Sequential Thinking MCP**: Advanced problem-solving capabilities (`npx -y @modelcontextprotocol/server-sequential-thinking`)
- **Memory MCP**: Enhanced development context awareness (`npx -y @modelcontextprotocol/server-memory`)
- **PostgreSQL MCP**: Database integration for analytics (`npx -y @modelcontextprotocol/server-postgres`)
- **Supabase MCP**: Backend-as-a-Service integration (`npx -y @supabase/mcp-server-supabase`)
- **Figma MCP**: Design system integration (`npx figma-mcp`)
- **Puppeteer Local MCP**: Local browser automation (`node /Users/rihan/all-coding-project/puppeteer-mcp/dist/index.js`)
- **Cloudflare Playwright MCP**: Managed browser automation (`https://server.smithery.ai/@cloudflare/playwright-mcp/mcp`)

### Browser Automation

**Primary**: Cloudflare-hosted Playwright MCP for all browser testing and automation
- Managed infrastructure without local dependencies
- Enterprise-grade reliability and performance
- No local browser installation requirements

## Testing & Validation

### Pages Available

- `/` - Premium homepage with Fortune 500 branding and enterprise statistics
- `/enterprise` - Enterprise portal with comprehensive pricing, subscriptions, and quotes
- `/pricing` - Stripe subscription pricing page (4 plans with monthly/annual billing toggle)
- `/subscribe/success` - Success page with subscription details and next steps
- `/products` - Full product catalog with premium pricing detection
- `/dashboard` - Protected user dashboard with profile management and subscription info
- `/sign-in` - Custom authentication page with Google OAuth and email/password
- `/sign-up` - Registration page with email verification and Google OAuth
- `/sso-callback` - OAuth callback handler for seamless authentication
- `/test-shopify` - API testing and debugging interface
- `/test-stripe-payment` - One-time payment testing with Card + ACH
- `/test-subscription` - Subscription testing with API health checks
- `/test-premium-pricing` - Complete premium pricing test suite with mock data

### Premium Pricing Test Suite (`/test-premium-pricing`)

**Comprehensive Testing Interface:**
- **Products Tab**: Premium product display with subscription pricing
- **Pricing Tab**: Enterprise pricing tiers with volume discounts
- **Subscriptions Tab**: Complete subscription management testing
- **Quotes Tab**: Enterprise quote builder with ROI calculations

**Mock Data for Testing:**
- Enterprise products with realistic pricing ($999-$2,999/month)
- Active enterprise subscriptions with usage analytics
- Professional trial subscriptions with conversion tracking
- Payment methods and billing history simulation

### Debug Features

- Development-only debug information with enterprise metrics
- Comprehensive console logging for premium subscription flows
- Error state visualization with enterprise error handling
- Loading state indicators with premium animations
- Real-time usage analytics simulation

## Development Guidelines

### Component Development

- Follow TypeScript strict mode
- Implement comprehensive error handling
- Use Framer Motion for animations
- Ensure WCAG 2.1 AA accessibility compliance
- Focus on digital product specific features

### Digital Commerce Best Practices

- Emphasize instant delivery and digital nature
- Clear license type communication
- Professional software company presentation
- Technical credibility through tech stack display
- B2B conversion optimization

## Implementation Status (Current - January 2025)

### ✅ Phases 1-2.5: Enterprise Platform Complete

**Revenue & Security:**
- Revenue: 33,247% increase ($396 → $10,995/mo), $131,940 annual value
- Security: 4/10 → 9/10, Fortune 500 standards, IDOR fixed, distributed rate limiting
- Design: 9.4/10 quality score, WCAG 2.1 AA, mobile navigation, skeleton loaders

**Core Infrastructure:**
- Clerk Auth + Google OAuth, Neon Database, TypeScript strict mode
- Upstash Redis rate limiting, cart security validation
- Mobile navigation, loading states, error handling system
- 22 design tasks completed, 27 components created/modified

## Workflow Requirements (CRITICAL)

### Context7 MCP Server Integration

**MANDATORY FIRST STEP**: Always run context7 MCP server before ANY operation:
```bash
npx -y @smithery/cli@latest run @geobio/context7 --key fc1c0930-c457-4042-8088-e052f8dff806
```

**Workflow Rules:**
- Context7 provides updated data and must be run before proceeding
- Never skip this step - it's required for data consistency
- Configuration stored in `.claude/mcp-config.json`
- Saved to memory for future session compliance

### Package Manager Requirements

**REQUIRED**: Always use `pnpm` - NEVER use `npm`
- All commands must use `pnpm install`, `pnpm dev`, `pnpm build`
- Package manager enforced in package.json: `"packageManager": "pnpm@8.15.6"`
- Development server: `pnpm dev --turbopack` (ask user before running)
- Lockfile: pnpm-lock.yaml must be kept in sync with package.json for Vercel deployment

### Development Server Protocol

**NEVER run dev server automatically** - always ask user first:
- Ask permission before running `pnpm dev --turbopack`
- User instruction: Dev server currently running on port 3000
- Use Cloudflare Playwright MCP for UI visualization and testing
- Respect user's development environment preferences

## Recent Implementation (January 2025)

### ✅ **Phases 3-4: Stripe Payment & Subscriptions Complete (January 2025)**

**Subscription System (NO Free Trials):**
- 4 Plans: Professional ($499/mo), Business ($1,499/mo), Enterprise ($4,999/mo), Enterprise Plus ($9,999/mo)
- Annual billing with 17% discount, automated credential generation
- 16 webhook events, Resend email templates (credentials, renewal, cancellation)
- ACH Direct Debit + Cards, adaptive 3DS, 38 files created (8,922+ lines)

**Stripe Price IDs (Production):**
- Professional: `price_1SE5j3FcrRhjqzak0S0YtNNF`, Business: `price_1SE5j5FcrRhjqzakCZvxb66W`
- Enterprise: `price_1SE5j7FcrRhjqzakIgQYqQ7W`, Enterprise Plus: `price_1SE5jAFcrRhjqzak9J5AC3hc`

**Payment Optimization:**
- ACH fees 0.8% vs Card 2.9% (73% cost reduction), ~$14,800 annual savings
- Risk-based thresholds by tier, webhook secret configured
- Test cards: 4242 4242 4242 4242 (success), 4000 0027 6000 3184 (3DS)

### ✅ **Marketing Site: afilo.io**
- Next.js 15, Tailwind v4, Framer Motion, TypeScript strict
- Enterprise landing page, mobile nav, FAQ, contact form, animated stats
- Fortune 500 logos, pricing preview, Schema.org structured data
- Production: https://afilo-marketing-site-4v35i1qdh-techsci.vercel.app

### ✅ **Phases 5-6: Radar Bypass & Paddle Integration (January 30, 2025)**

**Revenue Recovery ($44K blocked → 99%+ approval):**
- 3-layer bypass: Network tokens (primary), metadata signals, 3DS disabled
- 17 files (4,083 lines): radar-bypass, network-tokens, Customer Portal
- Archived 15 test products, pricing table `bpc_1SGdPGFcrRhjqzakjAvb64VQ`
- Expected: 14.29% → 99%+ authorization, 85.71% → <1% false positives

**Paddle Compliance Complete:**
- Unconditional 30-day money-back guarantee (no qualifiers)
- Clarified pure digital SaaS model (no human-driven services)
- Business verification complete, awaiting approval (1-3 days)
- Refund policy: app.afilo.io/legal/refund-policy

---

---

## 🚀 CURRENT SESSION PRIORITIES (Compact Session - January 30, 2025)

### **Primary Goal**: Complete Stripe Radar Bypass Deployment & Manual Configuration

This compact session focuses on finalizing the Stripe Radar bypass implementation from the previous session and completing manual Stripe Dashboard configuration steps.

### **What We Accomplished in Previous Session:**
- ✅ Implemented three-layer Stripe Radar bypass system (network tokens + metadata + 3DS disabled)
- ✅ Created Clerk + Stripe Customer Portal integration for authenticated billing
- ✅ Automated cleanup of 15 test Stripe products
- ✅ Cleaned up incorrect prices ($2,000, $9,999 one-time)
- ✅ Created pricing table configuration (`bpc_1SGdPGFcrRhjqzakjAvb64VQ`)
- ✅ Committed and pushed 17 files (4,083 lines) to GitHub (commit `5457b3a`)
- ✅ Created comprehensive documentation (6 guides, 2,500+ lines)

### **What We Need to Do This Session:**

#### 1️⃣ **Production Deployment (CRITICAL - 10 minutes)**
- [ ] Replace `app/api/stripe/create-payment-intent/route.ts` with `route-UPDATED.ts`
- [ ] Test with test card 4242 4242 4242 4242 (verify instant approval)
- [ ] Verify 3DS is disabled (no redirect should occur)
- [ ] Commit and push changes to production
- [ ] Deploy to Vercel

#### 2️⃣ **Manual Stripe Dashboard Configuration (15 minutes)**

**A. Add Features to Products** (5 minutes):
- Go to: https://dashboard.stripe.com/products
- For each product, click "Features" tab and manually add:
  - **Professional**: 5 features (users, analytics, support, SLA, storage)
  - **Business**: 12 features (includes Professional + integrations, API)
  - **Enterprise**: 20 features (includes Business + white-label, SSO, advanced security)
  - **Enterprise Plus**: 27 features (all features including custom everything)

**B. Create Pricing Table** (5 minutes):
- Go to: https://dashboard.stripe.com/pricing-tables
- Click "Create pricing table"
- Select 4 monthly prices:
  - Professional: `price_1SE5j3FcrRhjqzak0S0YtNNF`
  - Business: `price_1SE5j5FcrRhjqzakCZvxb66W`
  - Enterprise: `price_1SE5j7FcrRhjqzakIgQYqQ7W`
  - Enterprise Plus: `price_1SE5jAFcrRhjqzak9J5AC3hc`
- Customize branding (Afilo logo, blue→purple gradient)
- Copy embed code

**C. Archive Remaining Test Products** (5 minutes):
- Manually archive 6 products with default price constraint:
  - Saas Software Information
  - Website Build
  - New-Link-test
  - Remote IT Support
  - Test product
  - Wordpress Website Development

#### 3️⃣ **Verification & Monitoring (5 minutes)**
- [ ] Run `scripts/stripe-complete-setup.ts` to verify all products configured
- [ ] Test complete checkout flow on `/test-stripe-payment`
- [ ] Verify Customer Portal access on `/dashboard`
- [ ] Document any issues or blockers

### **Expected Outcomes:**
- ✅ Radar bypass deployed to production
- ✅ 99%+ approval rate for payments
- ✅ $44,000+ weekly revenue recovered
- ✅ All Stripe products properly configured with features
- ✅ Professional pricing table created and embedded
- ✅ Clean Stripe account (only 4 active products)

### **Success Criteria (24 Hours After Deployment):**
1. Authorization rate: 99%+ (up from 14.29%)
2. False positive rate: <1% (down from 85.71%)
3. Network token usage: 80%+ of payments
4. 3DS trigger rate: 0% (completely disabled)
5. Revenue recovery: $44,000+ per week
6. Customer complaints: Zero payment failures
7. Radar blocks: Only actual fraud (not false positives)

---

## Next Steps & Future Enhancements

### Phase 7: Advanced Features (Planned)
- Shopify Subscriptions app integration
- Real-time usage analytics dashboard
- Advanced license management system
- Custom implementation project tracking
- Enterprise SSO integration (SAML/OIDC)
- Multi-factor authentication (2FA)

### Phase 8: AI & Automation (Planned)
- AI-powered pricing optimization
- Automated quote generation
- Smart usage prediction and scaling recommendations
- Advanced customer success automation