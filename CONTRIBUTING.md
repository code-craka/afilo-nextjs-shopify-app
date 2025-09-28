# Contributing to Afilo Digital Marketplace

Welcome to the Afilo Digital Marketplace contribution guide! This document outlines how to contribute to this cutting-edge headless e-commerce platform.

**Author**: Rihan (@code-craka)  
**Project**: [afilo-nextjs-shopify-app](https://github.com/code-craka/afilo-nextjs-shopify-app)  
**Live Demo**: [app.afilo.io](https://app.afilo.io)  

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 18.17+ or 20.3+ (LTS recommended)
- **pnpm**: 8.0+ (required - never use npm or yarn)
- **Git**: Latest version
- **Shopify Store**: Access to Shopify Storefront API

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/afilo-nextjs-shopify-app.git
   cd afilo-nextjs-shopify-app
   ```

2. **Install Dependencies** (MANDATORY: Use pnpm only)
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Configure your Shopify credentials
   ```

4. **Start Development** (CRITICAL: Run MCP Context7 first)
   ```bash
   /mcp context7  # MANDATORY first step
   pnpm dev --turbopack
   ```

## 📋 Contribution Guidelines

### Code Standards

- **TypeScript**: Strict mode required
- **ESLint**: Next.js configuration with custom rules  
- **Prettier**: Automatic code formatting
- **Package Manager**: pnpm exclusively (never npm/yarn)
- **MCP Protocol**: Always run `/mcp context7` before file operations

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
- **develop**: Development branch for features
- **feature/***: Feature branches
- **fix/***: Bug fix branches
- **docs/***: Documentation updates

### Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make Changes** following coding standards

3. **Test Thoroughly**
   ```bash
   pnpm run lint
   pnpm run type-check
   pnpm run build
   ```

4. **Commit Changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```

5. **Push Branch**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open Pull Request** using the provided template

## 🏗️ Project Architecture

### Core Components

- **ProductGrid**: Enhanced digital product display with tech stack detection
- **DigitalCartWidget**: Specialized cart for software products with license management
- **Shopify Integration**: GraphQL API client with comprehensive error handling
- **State Management**: Zustand stores for cart and license state

### File Structure

```
components/
├── ProductGrid.tsx          # Main product display component
├── DigitalCartWidget.tsx    # Cart UI with license management
└── ui/                      # ShadCN/UI components

lib/
├── shopify.ts              # Shopify API client & GraphQL queries
└── utils.ts                # Utility functions

store/
└── digitalCart.ts          # Cart & license state (Zustand)

hooks/
└── useDigitalCart.ts       # Cart operations hook
```

### Digital Commerce Focus

This isn't a typical e-commerce site. Afilo specializes in **digital software products**:

- AI tools, templates, scripts, plugins
- Tech stack detection from product metadata
- License type inference (Personal, Commercial, Extended, Enterprise)
- Educational discounts and team licensing
- Instant delivery system

## 🧪 Testing Guidelines

### Manual Testing Checklist

- [ ] API connectivity via `/test-shopify`
- [ ] ProductGrid renders correctly
- [ ] Tech stack detection works
- [ ] Digital cart operations function
- [ ] License type changes reflect pricing
- [ ] Responsive design on multiple devices
- [ ] Accessibility compliance

### Performance Standards

- **LCP**: < 2.5s (Largest Contentful Paint)
- **FID**: < 100ms (First Input Delay)
- **CLS**: < 0.1 (Cumulative Layout Shift)
- **Bundle Size**: < 250KB gzipped main bundle

## 🚀 Development Workflow

### Daily Development

1. **Start MCP Context7**: `/mcp context7` (mandatory first step)
2. **Pull latest changes**: `git pull origin main`
3. **Start development**: `pnpm dev --turbopack`
4. **Make changes** following guidelines
5. **Test thoroughly** before committing

### Before Submitting PR

- [ ] Code passes `pnpm run lint`
- [ ] TypeScript passes `pnpm run type-check`
- [ ] Build succeeds `pnpm run build`
- [ ] Manual testing completed
- [ ] Documentation updated if needed
- [ ] Commit messages follow conventions

## 🎯 Areas for Contribution

### High Priority
- **Performance Optimization**: Bundle size reduction, Core Web Vitals
- **Accessibility**: WCAG compliance, screen reader support
- **Testing**: Unit tests, integration tests, E2E tests
- **Documentation**: API docs, component documentation

### Medium Priority
- **UI/UX Improvements**: Enhanced product discovery, cart experience
- **Feature Additions**: Product comparison, wishlist, reviews
- **Shopify Integration**: Advanced filtering, customer accounts
- **Developer Experience**: Better error handling, debugging tools

### Low Priority
- **Localization**: Multi-language support
- **Analytics**: Enhanced tracking and reporting
- **Third-party Integrations**: Payment providers, marketing tools

## 🐛 Bug Reports

Use the bug report template with:
- Clear reproduction steps
- Environment details
- Expected vs actual behavior
- Screenshots if applicable

## 💡 Feature Requests

Use the feature request template with:
- Problem statement
- Proposed solution
- User experience impact
- Implementation suggestions

## 📖 Resources

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Shopify Storefront API](https://shopify.dev/docs/storefront-api)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [ShadCN/UI Components](https://ui.shadcn.com/)

## 🤝 Code Review Process

### Review Criteria

- **Functionality**: Does it work as expected?
- **Code Quality**: Follows project standards?
- **Performance**: No negative impact on Core Web Vitals?
- **Security**: No vulnerabilities introduced?
- **Documentation**: Changes documented appropriately?
- **Testing**: Adequate test coverage?

### Review Guidelines

- Be respectful and constructive
- Focus on code, not the person
- Provide specific, actionable feedback
- Approve when ready, request changes when needed
- Test the changes locally when possible

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/code-craka/afilo-nextjs-shopify-app/issues)
- **Discussions**: [GitHub Discussions](https://github.com/code-craka/afilo-nextjs-shopify-app/discussions)
- **Author**: [@code-craka](https://github.com/code-craka)

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

**Thank you for contributing to Afilo Digital Marketplace!** 

Built with ❤️ by Rihan | Powered by Next.js & Shopify | Deployed on Vercel