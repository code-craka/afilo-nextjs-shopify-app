# Contributing to Afilo Digital Marketplace

Welcome to Afilo! This guide covers everything you need to contribute to our enterprise-grade digital marketplace.

## 🎯 Quick Start

### Prerequisites
- **Node.js**: 18.17+ or 20.3+ required
- **pnpm**: 8.15.6+ (required - not npm/yarn)
- **Git**: Latest version recommended
- **TypeScript**: Experience with strict mode preferred

### Development Setup
```bash
# 1. Fork and clone
git clone https://github.com/your-username/afilo-nextjs-shopify-app
cd afilo-nextjs-shopify-app

# 2. Install dependencies (pnpm required)
pnpm install

# 3. Environment setup
cp .env.example .env.local
# Configure your environment variables

# 4. Start development
pnpm dev --turbopack
```

## 📋 Development Standards

### Code Quality Requirements
- **TypeScript**: Strict mode required for all new code
- **ESLint**: Next.js configuration with enterprise patterns
- **Prettier**: Automatic code formatting enforced
- **Package Manager**: pnpm exclusively (never npm/yarn)

### Commit Conventions
We use [Conventional Commits](https://www.conventionalcommits.org/):
```
feat: add new digital cart feature
fix: resolve GraphQL fragment duplication
docs: update API documentation
style: improve ProductGrid styling
refactor: optimize Shopify API calls
test: add cart functionality tests
chore: update dependencies
```

### Branching Strategy
- **main**: Production-ready code
- **feature/***: New features
- **fix/***: Bug fixes
- **docs/***: Documentation updates

## 🏗️ Architecture Guidelines

### File Organization
```
components/           # Reusable UI components
├── ProductGrid.tsx  # Core product display (1,076 lines)
├── Premium*.tsx     # Enterprise features
└── ui/              # ShadCN base components

lib/                 # Core utilities
├── shopify-server.ts # Server-only client (700+ lines)
├── cart-security.ts # IDOR protection
└── rate-limit.ts    # Distributed rate limiting

store/               # State management
└── digitalCart.ts   # Zustand cart (652 lines)

types/               # TypeScript definitions
└── shopify.ts       # Comprehensive types (395 lines)
```

### Component Patterns
- **Server Components**: Use for data fetching and server-side logic
- **Client Components**: Only when interactivity required
- **TypeScript Strict**: All new code must pass strict mode
- **ShadCN/UI**: Follow established component patterns

### API Guidelines
- Implement **rate limiting** on all new endpoints
- Add **security event logging** for critical operations
- Use **server-only** imports for sensitive data
- Include comprehensive **error handling**

## 🔐 Security Requirements

### Critical Security Rules
1. **Never expose Shopify tokens** to client-side code
2. **Validate cart ownership** (IDOR protection)
3. **Implement rate limiting** with Upstash Redis
4. **Log security events** for audit compliance
5. **Use Clerk authentication** for protected routes

### Security Testing
All contributions must pass security validation:
```bash
curl http://localhost:3000/api/security/test
# Must return: ✅ 7/7 tests passing
```

## 🧪 Testing & Quality Assurance

### Before Submitting PR
- [ ] `pnpm run lint` passes
- [ ] `pnpm run type-check` passes
- [ ] `pnpm run build` succeeds
- [ ] Manual testing on `/test-shopify`
- [ ] Security tests pass at `/api/security/test`

### Testing Focus Areas
- Digital cart operations with license management
- Enterprise pricing calculations (6 license types)
- Educational discounts (50%/30%/40%)
- Volume pricing (10-25% discounts)
- API endpoints with authentication

## 🎨 UI/UX Standards

### Design Principles
- **Enterprise-First**: Professional B2B aesthetics
- **Digital-Native**: Optimized for software products
- **Performance**: Core Web Vitals < 2.5s LCP
- **Accessibility**: WCAG compliance preferred

### Animation Guidelines
- Use **Framer Motion** for complex animations
- **Stagger effects** for product grids
- **Subtle hover** interactions
- **Loading states** for all async operations

## 🚀 Development Workflow

### Daily Development Process
1. **Pull latest changes**: `git pull origin main`
2. **Start development**: `pnpm dev --turbopack`
3. **Make changes** following guidelines
4. **Test thoroughly** before committing
5. **Run quality checks** before push

### PR Submission Checklist
- [ ] Descriptive PR title and description
- [ ] Screenshots for UI changes
- [ ] Code passes all quality checks
- [ ] Documentation updated if needed
- [ ] Commit messages follow conventions
- [ ] CI/CD pipeline passes

## 📚 Documentation Standards

### Code Documentation
```typescript
/**
 * Validates cart ownership to prevent IDOR attacks
 * @param cartId - Shopify cart ID to validate
 * @param userId - Clerk user ID for ownership check
 * @returns Promise<boolean> - true if user owns cart
 */
export async function validateCartOwnership(
  cartId: string, 
  userId: string | null
): Promise<boolean>
```

### Documentation Requirements
- **JSDoc comments** for complex functions
- **README updates** for new features  
- **API documentation** for new endpoints
- **Type definitions** for new interfaces

## 🤝 Community Guidelines

### Communication Standards
- **Be respectful** and inclusive in all interactions
- **Ask questions** if requirements are unclear
- **Share knowledge** with fellow contributors
- **Provide constructive feedback** in code reviews

### Issue Reporting
- Use **issue templates** when available
- Provide **minimal reproduction** cases
- Include **environment details** (OS, Node version, etc.)
- Tag with **appropriate labels**

## 🏆 Recognition & Support

### Contributor Levels
- **First-time**: Welcome package and mentorship
- **Regular**: Recognition in release notes
- **Core**: Direct repository access
- **Enterprise**: Access to enterprise features

---

## 🚀 Ready to Contribute?

1. **Read this guide** completely
2. **Check open issues** for good first contributions
3. **Set up development environment** following setup guide
4. **Submit your first PR** using our guidelines

### Key Resources
- **Main App**: [app.afilo.io](https://app.afilo.io)
- **Enterprise Portal**: [app.afilo.io/enterprise](https://app.afilo.io/enterprise)
- **API Testing**: [app.afilo.io/test-shopify](https://app.afilo.io/test-shopify)
- **Repository**: [GitHub Issues](https://github.com/code-craka/afilo-nextjs-shopify-app/issues)

**Thank you for helping build the best enterprise digital marketplace! 🎉**

---

Questions? Open an issue or check our documentation | Built with ❤️ by the community