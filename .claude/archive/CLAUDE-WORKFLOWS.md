# Afilo Development Workflows Module

**Load this when: Planning features, code reviews, deployments, testing**

## Code Review Standards

### Specialized Agents
- `@nextjs-design-review`: UI/UX, responsive design, accessibility
- `@ecommerce-security-review`: Payment security, customer data, API security
- `@nextjs-performance`: Performance optimization, Core Web Vitals

### Commands
```bash
/code-review           # Comprehensive code review
/design-review         # Frontend/UI review
/security-review       # Security scan
```

### Review Checklist
- TypeScript strict mode compliance
- Digital product features
- Payment flow security (Stripe + Paddle)
- Responsive design (mobile-first)
- WCAG 2.1 AA accessibility
- Performance optimization (Lighthouse CI)

## Performance Standards

### Lighthouse CI Benchmarks (Enforced)
- **Performance Score**: ≥90%
- **Accessibility Score**: ≥90%
- **Best Practices Score**: ≥90%
- **SEO Score**: ≥90%
- **First Contentful Paint (FCP)**: ≤2000ms
- **Largest Contentful Paint (LCP)**: ≤2500ms
- **Cumulative Layout Shift (CLS)**: ≤0.1

### API Performance
- **Stripe API**: < 200ms for checkout creation
- **Neon Database**: < 100ms for product queries
- **Digital Delivery**: < 50ms response time

## Git Workflow

### Branching Strategy
- `main` - Production branch (protected)
- Feature branches: `feature/name`
- Bugfix branches: `fix/name`
- Never commit directly to main

### Commit Standards
- Descriptive commit messages
- Reference issue numbers when applicable
- Group related changes logically

## Testing Strategy

### Manual Testing Checklist
- [ ] Authentication flow (Clerk + Google OAuth)
- [ ] Product catalog loading
- [ ] Cart operations (add/remove/update)
- [ ] Stripe checkout flow
- [ ] Subscription creation and management
- [ ] Digital product delivery
- [ ] Email delivery (Resend)
- [ ] Mobile responsive design
- [ ] Error handling and loading states
- [ ] Analytics tracking

## Deployment Workflow

### Pre-Deployment
1. Run `pnpm build` locally
2. Test production build
3. Review environment variables
4. Run security scan
5. Run Lighthouse CI tests

### Vercel Deployment
- Auto-deploy on push to main
- Preview deployments for branches
- Custom domain: app.afilo.io
- Environment variables configured

### Post-Deployment
1. Verify production URLs
2. Test critical user flows
3. Monitor error tracking
4. Check Stripe webhook delivery
5. Verify analytics collection

## Development Environment

### Required Environment Variables
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Stripe Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Neon Database
DATABASE_URL=
DIRECT_URL=

# Resend Email
RESEND_API_KEY=
```

## Troubleshooting

### Build Failures
- Check TypeScript errors: `pnpm tsc --noEmit`
- Verify dependencies: `pnpm install`
- Clear cache: `rm -rf .next`

### Database Issues
- Verify connection string
- Check Prisma schema
- Run migrations: `pnpm prisma migrate dev`

### Payment Issues
- Verify Stripe keys (test vs production)
- Check webhook delivery in Stripe Dashboard
- Test with Stripe test cards
- Review webhook event logs

---

**Related Modules:**
- Enterprise features: `.claude/CLAUDE-ENTERPRISE.md`
