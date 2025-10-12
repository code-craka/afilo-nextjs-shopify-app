# Afilo Development Workflows Module

**Load this when: Planning features, code reviews, deployments, testing**

## Code Review Standards

### Specialized Agents
- `@shopify-code-review`: E-commerce, Shopify integration, digital products
- `@nextjs-design-review`: UI/UX, responsive design, accessibility
- `@ecommerce-security-review`: Payment security, customer data, API security

### Commands
```bash
/code-review           # Comprehensive code review
/design-review         # Frontend/UI review
/security-review       # Security scan
```

### Review Checklist
- TypeScript strict mode compliance
- Digital product specific features
- License management logic
- Payment flow security
- Responsive design (mobile-first)
- WCAG 2.1 AA accessibility
- Performance optimization

## Performance Standards

- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Bundle Size**: Main bundle < 250KB gzipped
- **API Response**: < 200ms for Shopify API calls
- **Digital Delivery**: Instant access with <50ms response

## Git Workflow

### Branching Strategy
- `main` - Production branch
- Feature branches for new work
- Never commit directly to main

### Commit Standards
- Descriptive commit messages
- Reference issue numbers
- Group related changes

## Testing Strategy

### Test Pages
```
/test-shopify           # Shopify API testing
/test-stripe-payment    # One-time payment testing
/test-subscription      # Subscription testing
/test-premium-pricing   # Premium pricing suite
```

### Manual Testing Checklist
- [ ] Authentication flow (Clerk + Google OAuth)
- [ ] Product catalog loading
- [ ] Cart operations (add/remove/update)
- [ ] Checkout flow (Stripe + Shopify)
- [ ] Subscription creation and management
- [ ] Email delivery (Resend)
- [ ] Mobile responsive design
- [ ] Error handling and loading states

## Deployment Workflow

### Pre-Deployment
1. Run `pnpm build` locally
2. Test production build with `pnpm start`
3. Review environment variables
4. Run security scan

### Vercel Deployment
- Auto-deploy on push to main
- Preview deployments for branches
- Environment variables configured
- Custom domains: app.afilo.io

### Post-Deployment
1. Verify production URLs
2. Test critical user flows
3. Monitor error tracking (Sentry planned)
4. Check Stripe webhook delivery

## Development Environment

### Environment Variables (.env.local)
```env
# Shopify
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Database
DATABASE_URL=
```

## Troubleshooting Common Issues

### Build Failures
- Check TypeScript errors: `pnpm tsc --noEmit`
- Verify dependencies: `pnpm install`
- Clear cache: `rm -rf .next`

### API Issues
- Test Shopify connection on `/test-shopify`
- Verify environment variables loaded
- Check network tab for API errors

### Payment Issues
- Verify Stripe keys (test vs production)
- Check webhook delivery in Stripe Dashboard
- Test with Stripe test cards

---

**Related Modules:**
- Enterprise features: `.claude/CLAUDE-ENTERPRISE.md`
- Shopify integration: `.claude/CLAUDE-SHOPIFY.md`
