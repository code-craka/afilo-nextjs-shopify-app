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
pnpm lighthouse              # Run Lighthouse CI performance tests
```

## Development Rules

1. **TypeScript Strict Mode**: Always enabled
2. **Package Manager**: Only pnpm (enforced in package.json)
3. **Dev Server**: Ask permission before running
4. **File Operations**: Prefer editing over creating new files

## Quality Standards (Lighthouse CI)

Performance benchmarks enforced via `.lighthouserc.json`:

- **Performance Score**: ≥90% (enforced)
- **Accessibility Score**: ≥90% (enforced)
- **Best Practices Score**: ≥90% (enforced)
- **SEO Score**: ≥90% (enforced)
- **First Contentful Paint (FCP)**: ≤2000ms
- **Largest Contentful Paint (LCP)**: ≤2500ms
- **Cumulative Layout Shift (CLS)**: ≤0.1

**Test Coverage**: Homepage + `/products` page (3 runs each)

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

- **Authentication**: Clerk + Google OAuth
- **Database**: Neon PostgreSQL (Prisma ORM)
- **Payments**: Stripe (Subscriptions + One-time) + Paddle
- **Products**: Digital products stored in Neon DB (synced with Stripe)
- **Analytics**: Real-time monitoring + Performance tracking

---

**Need more context?**
- Enterprise features: Load `.claude/CLAUDE-ENTERPRISE.md`
- Development workflows: Load `.claude/CLAUDE-WORKFLOWS.md`
