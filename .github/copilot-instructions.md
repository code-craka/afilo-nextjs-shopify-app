# Afilo Next.js Shopify App - AI Coding Agent Instructions

## Project Architecture

This is Afilo's enterprise-grade headless e-commerce platform specializing in digital software products. The architecture delivers Fortune 500-level performance with advanced security, sophisticated license management, and AI-powered product intelligence.

### Core Stack
- **Frontend**: Next.js 15.5.4 (App Router), TypeScript strict mode, Tailwind CSS v4 (no config file)
- **UI Components**: ShadCN/UI with custom e-commerce patterns
- **Backend**: Shopify Storefront API (fzjdsw-ma.myshopify.com)
- **State**: Advanced Zustand digital cart with license management
- **Security**: Enterprise middleware with rate limiting and threat protection
- **Deployment**: app.afilo.io (frontend), account.afilo.io (customer accounts)

## Critical Understanding: Digital Commerce Focus

This isn't a typical e-commerce site. Afilo sells **digital software products** (AI tools, templates, scripts, plugins). This drives several architectural decisions:

### Digital Product Specialization
- ProductGrid automatically detects tech stacks from product metadata (React, Python, AI, etc.)
- License type detection and display (Personal, Commercial, Extended, Enterprise)
- Instant download indicators and digital delivery focus
- Software-specific product badges and categorization

### Enhanced ProductGrid Pattern (`components/ProductGrid.tsx`)
The ProductGrid is the heart of the application. It performs intelligent analysis on Shopify product data:
- Tech stack extraction from titles/descriptions/tags
- Product type classification (AI Tool, Template, Script, Plugin)
- License type inference from pricing and metadata
- Digital delivery indicators and documentation badges

## Development Workflows

### Development Workflow Protocol
**For AI-assisted development (optional enhancement):**
1. **MCP Context7 Server**: Development-time tool for AI assistants to gather project context
   - Not required for application functionality
   - Provides enhanced AI coding assistance when available
   - Execute `/mcp context7` when using compatible AI development tools

**MANDATORY for all development:**
2. **Use pnpm EXCLUSIVELY**: This project uses `pnpm` as the package manager - NEVER use `npm` or `yarn`

### Package Management
**Always use `pnpm`** - This project is configured for pnpm, not npm or yarn.

```bash
pnpm dev --turbopack    # Development with Turbopack
pnpm build              # Production build
pnpm lint               # ESLint with Next.js config
pnpm install            # Install dependencies
pnpm add <package>      # Add new package
pnpm remove <package>   # Remove package
```

**⚠️ CRITICAL: Never use `npm` commands in this project - always use `pnpm`**

### Enterprise Security Middleware (`middleware.ts`)
Military-grade security implementation with comprehensive threat protection:

**DoS & Attack Protection:**
- Advanced rate limiting with per-endpoint rules
- IP blocking and threat intelligence integration
- Suspicious pattern detection (bot, crawler, exploit attempts)
- Automatic request blocking for malicious patterns

**Security Headers:**
- Content Security Policy (CSP) with strict rules
- HTTP Strict Transport Security (HSTS) with preload
- X-Frame-Options, X-XSS-Protection, X-Content-Type-Options
- Enterprise-specific security indicators

**Rate Limiting Rules:**
- Cart operations: 100 requests/15 minutes
- License validation: 200 requests/15 minutes (higher for legitimate use)
- Checkout operations: 10 requests/15 minutes (strict security)
- General API: 1000 requests/15 minutes with success exemptions

**Performance Monitoring:**
- Request timing and performance metrics
- Security event logging with detailed context
- Automatic cleanup of expired rate limit records

### Shopify API Integration (`lib/shopify.ts`)
The Shopify client exceeds production requirements with enterprise-grade features:
- Automatic retry logic with exponential backoff
- Rate limiting protection integrated with middleware
- GraphQL fragment optimization for minimal API calls
- Custom ShopifyAPIError class with detailed debugging
- Connection validation and health checks

**Key Pattern**: Use `getProductsSimple()` for ProductGrid - it's optimized for the enhanced digital commerce display logic with comprehensive logging.

### Advanced Digital Cart System (`store/digitalCart.ts`)
Sophisticated license management system with enterprise features:

**License Management:**
- Multi-tier licensing: Personal, Commercial, Extended, Enterprise, Developer
- Automatic license detection from product pricing and metadata
- Team seat management with quantity validation
- License upgrade/downgrade with automatic seat adjustment

**Educational & Bulk Discounts:**
- Educational tiers: Student (50%), Teacher (30%), Institution (40%)
- Volume discounts for enterprise purchases
- Bundle detection and automatic discount application
- Real-time price calculation with tax handling

**Subscription Support:**
- Multiple billing intervals: monthly, yearly, lifetime, one-time
- Subscription interval management
- Premium product detection and specialized UI

**Enterprise Features:**
- Advanced validation and error handling
- Instant digital delivery preparation
- License key management and activation tracking
- Comprehensive cart analytics and metrics

### State Management Strategy
- **Digital Cart**: Advanced Zustand store with persistence and validation
- **API State**: Direct async calls with comprehensive error handling
- **UI State**: Component-local state with optimistic updates and real-time feedback

## File Structure Patterns

### App Router Organization
```
app/
├── page.tsx              # Homepage - featured digital products
├── products/page.tsx     # Full catalog with search/filters
└── test-shopify/page.tsx # API debugging (dev only)
```

### Component Architecture
```
components/
├── ProductGrid.tsx       # Enhanced digital product display
├── DigitalProductGrid.tsx # Alternative implementation
└── ui/                   # ShadCN components (Button, Dialog, etc.)
```

### Type Safety (`types/shopify.ts`)
Comprehensive TypeScript interfaces for all Shopify data. Always use these types - they include proper error handling and optional field management.

## Shopify-Specific Conventions

### Environment Variables (Required)
```env
# Publicly accessible Shopify domain
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=fzjdsw-ma.myshopify.com

# Server-side only Shopify Storefront Access Token
# This is a secret and MUST NOT be exposed to the client
SHOPIFY_STOREFRONT_ACCESS_TOKEN=<your_server_side_token>

# Publicly accessible Customer Account Client ID
NEXT_PUBLIC_CUSTOMER_ACCOUNT_CLIENT_ID=<client-id>
```

### GraphQL Query Pattern
Always use the fragment-based queries from `lib/shopify.ts`. They're optimized for:
- Minimal API calls with maximum data efficiency
- Proper error boundaries and retry logic
- Performance optimization for digital product metadata

### Digital Product Data Flow
1. Shopify product data → GraphQL fetch
2. ProductGrid analysis → Tech stack/license detection  
3. Enhanced display → Digital-specific UI elements
4. Cart integration → Instant delivery focus

## Tailwind CSS v4 Guidelines

This project uses **Tailwind CSS v4 without a config file**. Key differences:
- No `tailwind.config.js` - configuration is automatic
- Use `@tailwindcss/postcss` in PostCSS config
- Standard utility classes work as expected
- Custom design tokens through CSS custom properties

## AI-Enhanced Development (Optional)

### MCP Server Integration (Development Tools)
Optional AI development enhancement servers:
- **afilo-storefront**: Direct Shopify store access for AI assistants
- **context7-mcp**: Documentation and examples for enhanced AI coding
- **shadcn**: Component library integration for AI-assisted development
- **mem0-memory-mcp**: Development context memory for AI workflows

**Note**: These are development-time AI enhancement tools, not application dependencies.

### Code Review & Quality Assurance
Enterprise-grade quality standards:
- **TypeScript Strict Mode**: Comprehensive type checking and validation
- **ESLint**: Next.js optimized linting with TypeScript support
- **Security Middleware**: Automated threat detection and prevention
- **Manual Testing**: Comprehensive testing via `/test-shopify` endpoint
- **Performance Monitoring**: Real-time metrics and security event logging

### Quick Commands
```bash
# Core Development Commands (Required)
pnpm dev --turbopack     # Start development server with Turbopack
pnpm build               # Build for production
pnpm lint                # ESLint with Next.js config
pnpm type-check          # TypeScript validation

# AI Enhancement Commands (Optional)
/mcp context7            # Get latest file context for AI assistants
claude                   # Start interactive AI session
/code-review             # AI-assisted code review
/design-review           # AI-assisted UI/UX review
/security-review         # AI-assisted security scan
```

**⚠️ WORKFLOW REMINDER: `pnpm <command>` → Never use `npm` or `yarn`**
**📝 AI ENHANCEMENT: `/mcp context7` (optional for AI-assisted development)**

## Testing & Quality Assurance

### Current Testing Strategy
**Manual Testing & Validation:**
- **API Testing Page**: Visit `/test-shopify` for comprehensive API testing
  - Shopify API connectivity validation
  - Product data structure inspection and debugging
  - Environment variable validation
  - GraphQL query performance testing
  - Connection health checks and error analysis

**Security Testing:**
- **Middleware Validation**: Rate limiting and security header verification
- **Threat Detection**: Malicious pattern detection testing
- **Performance Testing**: Load testing and DoS protection validation

### Development Debug Features
**Enhanced Debug Logging:**
- ProductGrid: Comprehensive console logging in development mode
- API calls: Detailed performance metrics and error tracking
- Digital cart: Real-time state changes and validation logging
- Security events: Threat detection and rate limiting logs
- License management: Validation and calculation debugging

### Future Testing Implementation
**Planned Testing Framework:**
- Unit tests: Jest + React Testing Library (not yet implemented)
- Integration tests: Shopify API and cart functionality
- E2E tests: Digital commerce workflows
- Security tests: Penetration testing and vulnerability assessment

**Current Quality Assurance:**
- TypeScript strict mode: Compile-time error prevention
- ESLint: Code quality and consistency enforcement
- Manual testing: Comprehensive workflow validation
- Production monitoring: Real-time performance and security tracking

## Performance Standards

**Enterprise Performance Metrics:**
- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Bundle Size**: Main bundle < 250KB gzipped
- **API Response**: < 200ms for Shopify API calls with retry logic
- **Digital Delivery**: < 50ms response time for instant access
- **Security Response**: < 10ms for rate limiting and threat detection
- **Cart Operations**: < 100ms for license calculations and validations

**Enterprise Reliability:**
- **Uptime**: 99.97% availability with failover protection
- **Error Rates**: < 0.1% for critical cart and checkout operations
- **Security Events**: Real-time threat detection and automatic mitigation
- **Scalability**: Handles 10,000+ concurrent users with rate limiting

## Common Patterns to Follow

### Error Handling
Always use the ShopifyAPIError class for API errors. Include retry logic and user-friendly messages.

### Image Optimization
Use Next.js Image component with Shopify CDN URLs. The images are configured for responsive sizing.

### Digital Commerce UI
Focus on instant delivery, license clarity, and technical credibility. Avoid physical commerce patterns (shipping, inventory).

### TypeScript Strictness
All new code must pass TypeScript strict mode. Use the comprehensive Shopify types from `types/shopify.ts`.

---

*This codebase is optimized for digital software commerce. Always consider the software developer audience and instant delivery model when making changes.*