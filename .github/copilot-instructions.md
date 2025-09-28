# Afilo Next.js Shopify App - AI Coding Agent Instructions

## Project Architecture

This is Afilo's headless e-commerce platform specializing in digital software products. The architecture centers around Next.js 15 (App Router) as frontend with Shopify as the backend commerce engine.

### Core Stack
- **Frontend**: Next.js 15.5.4 (App Router), TypeScript strict mode, Tailwind CSS v4 (no config file)
- **UI Components**: ShadCN/UI with custom e-commerce patterns
- **Backend**: Shopify Storefront API (fzjdsw-ma.myshopify.com)
- **State**: Zustand for cart management, React Query planned
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

### Critical Pre-Command Protocol
**ALWAYS follow this sequence before executing any commands:**
1. **Run MCP Context7 Server**: Execute `/mcp context7` to get the latest information about files and project state
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

### Shopify API Integration (`lib/shopify.ts`)
The Shopify client is production-ready with comprehensive error handling:
- Automatic retry logic for network failures
- Rate limiting protection with exponential backoff
- GraphQL fragment optimization for performance
- Custom error types with detailed debugging

**Key Pattern**: Use `getProductsSimple()` for ProductGrid - it's optimized for the enhanced digital commerce display logic.

### State Management Strategy
- **Cart State**: Zustand store in `store/digitalCart.ts`
- **API State**: Direct async calls with error handling (React Query planned)
- **UI State**: Component-local state with optimistic updates

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

## Claude Code Integration

### MCP Server Configuration
The project includes several MCP servers for enhanced development:
- **afilo-storefront**: Direct Shopify store access
- **context7-mcp**: Documentation and examples ⚠️ **RUN FIRST ALWAYS**
- **shadcn**: Component library integration
- **mem0-memory-mcp**: Development context memory

**⚠️ MANDATORY: Always run `/mcp context7` before any file operations or commands to ensure you have the latest project context and file information.**

### Code Review Agents
Use the specialized review agents in `.claude/agents/`:
- `@shopify-code-review` - Shopify integration and e-commerce patterns
- `@nextjs-design-review` - UI/UX and design system compliance
- `@ecommerce-security-review` - Digital commerce security

### Quick Commands
```bash
/mcp context7            # ⚠️ RUN THIS FIRST - Get latest file context
claude                   # Start interactive session
pnpm dev --turbopack     # Start development server
pnpm build               # Build for production
/code-review             # Review current changes
/design-review           # UI/UX review
/security-review         # Security scan
```

**⚠️ WORKFLOW REMINDER: `/mcp context7` → `pnpm <command>` → Never use `npm`**

## Testing & Debugging

### API Testing Page
Visit `/test-shopify` in development for:
- Shopify API connectivity testing
- Product data structure inspection  
- Environment variable validation
- GraphQL query debugging

### Development Debug Features
The ProductGrid includes comprehensive console logging in development mode. Check browser console for:
- API call details and performance
- Product transformation logic
- Digital commerce feature detection

## Performance Standards

- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Bundle Size**: Main bundle < 250KB gzipped  
- **API Response**: < 200ms for Shopify API calls
- **Digital Delivery**: < 50ms response time for instant access

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