# Afilo Core Configuration (Light Mode)

**Optimized for: Routine development, quick fixes, minimal context load**

## Essential Tech Stack

- **Frontend**: Next.js 15.5.4 (App Router), React 19.1.0, TypeScript 5.6 (Strict)
- **Styling**: Tailwind CSS v4, ShadCN UI
- **Package Manager**: **pnpm 8.15.6** (REQUIRED - never npm)
- **Deployment**: Vercel (app.afilo.io)

## Critical Commands

```bash
# NEVER run automatically - always ask first
pnpm dev --turbopack         # Development server (port 3000)
pnpm build                   # Production build
pnpm lint                    # Linting
```

## Development Rules

1. **TypeScript Strict Mode**: Always enabled
2. **Package Manager**: Only pnpm (enforced in package.json)
3. **Dev Server**: Ask permission before running
4. **File Operations**: Prefer editing over creating new files

## Project Structure (Key Paths)

```
app/                    # Next.js pages
├── page.tsx           # Homepage
├── pricing/           # Stripe pricing
├── dashboard/         # User dashboard
└── api/               # API routes

components/            # React components
lib/                   # Utilities & integrations
store/                 # Zustand state management
```

## Quick Reference

- Authentication: Clerk + Google OAuth
- Database: Neon PostgreSQL
- Payments: Stripe + Paddle
- E-commerce: Shopify Storefront API

---

**Need more context?**
- Enterprise features: Load `.claude/CLAUDE-ENTERPRISE.md`
- Shopify integration: Load `.claude/CLAUDE-SHOPIFY.md`
- Development workflows: Load `.claude/CLAUDE-WORKFLOWS.md`
