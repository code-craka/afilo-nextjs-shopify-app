# Afilo Next.js Shopify App - Claude Code Configuration

## Project Overview

Digital commerce platform specializing in software products, using Next.js 15 as frontend and Shopify as backend for digital goods, licensing, and instant downloads.

## Tech Stack

- **Frontend**: Next.js 15.5.4 (App Router), TypeScript, Tailwind CSS v4, ShadCN UI, Framer Motion
- **Backend**: Shopify (Storefront API, Customer Account API, Webhooks)
- **State Management**: Zustand + React Query (planned)
- **Styling**: Tailwind CSS v4 (no config file needed), ShadCN components
- **Animations**: Framer Motion for micro-interactions
- **Deployment**: Vercel (frontend), Shopify (backend)
- **Authentication**: Shopify Customer Account API
- **Payments**: Shopify Checkout
- **Domain**: app.afilo.io (frontend), account.afilo.io (customer accounts)

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

## Digital Commerce Features

### ProductGrid Component (Enhanced)

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

### File Structure

```
components/
├── ProductGrid.tsx          # Enhanced digital commerce product grid
└── ui/                      # ShadCN UI components

lib/
├── shopify.ts              # Shopify API client with error handling
└── utils.ts                # Utility functions

types/
└── shopify.ts              # Comprehensive TypeScript interfaces

app/
├── page.tsx                # Homepage with featured products
├── products/page.tsx       # Full product catalog
└── test-shopify/page.tsx   # API testing page
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

## Testing

### Pages Available

- `/` - Homepage with featured products showcase
- `/products` - Full product catalog with search/sort
- `/test-shopify` - API testing and debugging interface

### Debug Features

- Development-only debug information
- Comprehensive console logging
- Error state visualization
- Loading state indicators

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