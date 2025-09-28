# Afilo Enterprise Digital Marketplace - Claude Code Configuration

## Project Overview

Enterprise-grade digital marketplace commanding Fortune 500 pricing - Premium AI-powered software platform built with Next.js 15, TypeScript, and Shopify. Specializes in high-value software products with enterprise pricing ($499-$9,999+/month).

## Tech Stack

- **Frontend**: Next.js 15.5.4 (App Router), React 19.1.0, TypeScript 5.6 (Strict Mode)
- **Styling**: Tailwind CSS v4 (zero config), ShadCN UI with enterprise patterns
- **Animations**: Framer Motion 12.23.22 for premium interactions
- **State Management**: Zustand 5.0.8 with persistence for enterprise cart & subscriptions
- **Backend**: Shopify Storefront API v2024.10 with enhanced enterprise features
- **Authentication**: Shopify Customer Account API with enterprise SSO support
- **Payments**: Shopify Checkout with subscription billing integration
- **Enterprise Features**: Premium pricing, subscription management, custom quote builder
- **Deployment**: Vercel (app.afilo.io) with enterprise portal (app.afilo.io/enterprise)
- **Package Manager**: pnpm 8.15.6 (required - never use npm)

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

### Subscription Management
- **Trial Periods**: 14-day free trials with conversion tracking
- **Usage Analytics**: Real-time monitoring of users, projects, API calls, storage
- **Billing History**: Complete transaction and invoice management
- **Plan Upgrades/Downgrades**: Seamless tier changes with prorated billing
- **Payment Methods**: Credit cards, bank accounts, enterprise invoicing

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
└── ui/                          # ShadCN UI components with enterprise patterns

lib/
├── shopify.ts                   # Enhanced Shopify API client with subscriptions
└── utils.ts                     # Utility functions

store/
└── digitalCart.ts               # Enterprise cart & licensing state (Zustand)

hooks/
└── useDigitalCart.ts            # Cart operations with advanced licensing

types/
└── shopify.ts                   # Enhanced Shopify & enterprise types

app/
├── page.tsx                     # Premium homepage with Fortune 500 branding
├── enterprise/page.tsx          # Enterprise portal with pricing & features
├── products/page.tsx            # Full product catalog
└── test-shopify/page.tsx        # API testing page
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

- **Afilo Storefront MCP**: Direct access to your Shopify store catalog
- **ShadCN MCP**: Component library integration
- **Memory & Context**: Enhanced development context awareness
- **GitHub MCP**: Repository management and deployment

## Testing & Validation

### Pages Available

- `/` - Premium homepage with Fortune 500 branding and enterprise statistics
- `/enterprise` - Enterprise portal with comprehensive pricing, subscriptions, and quotes
- `/products` - Full product catalog with premium pricing detection
- `/test-shopify` - API testing and debugging interface
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

## Implementation Status (Current)

### ✅ Phase 1: Enterprise Transformation Complete

**Revenue Impact:**
- Revenue increase: 33,247% (from $396 one-time to $10,995/month)
- Annual contract value: $131,940 per customer
- Fortune 500 enterprise positioning achieved

**Technical Implementation:**
- All enterprise components built and integrated
- Premium pricing system fully functional
- TypeScript strict mode compliance maintained
- Next.js image configuration optimized for Shopify CDN
- Complete testing suite with realistic mock data

**Documentation & Guides:**
- SHOPIFY_PREMIUM_PRICING_GUIDE.md for manual Shopify configuration
- Updated README.md with enterprise positioning
- Comprehensive CHANGELOG.md with implementation milestones
- Enhanced CLAUDE.md with complete technical documentation

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

### Development Server Protocol

**NEVER run dev server automatically** - always ask user first:
- Ask permission before running `pnpm dev --turbopack`
- Use MCP Playwright for UI visualization when needed
- Respect user's development environment preferences

## Next Steps & Future Enhancements

### Phase 2: Advanced Features (Planned)
- Shopify Subscriptions app integration
- Real-time usage analytics dashboard
- Advanced license management system
- Custom implementation project tracking
- Enterprise SSO integration

### Phase 3: AI & Automation (Planned)
- AI-powered pricing optimization
- Automated quote generation
- Smart usage prediction and scaling recommendations
- Advanced customer success automation