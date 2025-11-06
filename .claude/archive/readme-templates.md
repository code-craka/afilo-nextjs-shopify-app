# README Templates

Standardized README.md templates for consistent project documentation.

## Main Project README Template

```markdown
# Afilo Digital Marketplace

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-purple)](https://stripe.com/)
[![Lighthouse](https://img.shields.io/badge/Lighthouse-90%2B-green)](https://developers.google.com/web/tools/lighthouse)

**Production-ready digital marketplace with AI chat support and adaptive payments**

## 🌟 Features

### 💳 Payments & Billing
- **Adaptive Checkout**: Auto-detects currency, location, and optimal payment methods
- **Subscription Management**: Flexible billing with Stripe integration
- **Multi-Currency**: Real-time conversion and localized pricing

### 🤖 AI Chat Bot
- **Claude Sonnet 4**: Advanced AI with streaming responses
- **Knowledge Base**: Semantic search with website crawling
- **Admin Dashboard**: Conversation management and analytics

### 🛍 Digital Marketplace
- **Product Catalog**: Complex licensing and tiered pricing
- **User Management**: Clerk authentication with role-based access
- **Analytics**: Real-time performance and conversion tracking

## 📊 Project Stats

- **API Routes**: 45+ REST endpoints
- **Database Tables**: 15 optimized schemas
- **Components**: 50+ React components
- **Skills**: 5 Claude Code skills
- **Lighthouse Score**: 95%+ average

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm 8.15.6
- PostgreSQL (or Neon DB)

### Installation
```bash
git clone https://github.com/your-org/afilo-nextjs-shopify-app
cd afilo-nextjs-shopify-app
pnpm install
```

### Environment Setup
```bash
cp .env.example .env.local
# Configure required environment variables
```

### Development
```bash
pnpm dev --turbopack    # Start development server
pnpm build             # Build for production
pnpm lighthouse        # Run performance tests
```

## 🏗 Architecture

### Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, ShadCN UI
- **Database**: Neon PostgreSQL, Prisma ORM, pgvector
- **Payments**: Stripe, adaptive checkout
- **Auth**: Clerk with Google OAuth
- **AI**: Anthropic Claude, semantic search
- **Deployment**: Vercel

### Project Structure
```
├── app/                 # Next.js app directory
├── components/          # React components
├── lib/                 # Utilities and integrations
├── .claude/skills/      # Claude Code skills
├── prisma/              # Database schema
└── docs/               # Project documentation
```

## 📈 Performance

- **Lighthouse Scores**: Performance 95%, Accessibility 100%, Best Practices 95%, SEO 100%
- **Core Web Vitals**: LCP <1.5s, FCP <1.2s, CLS <0.1
- **Bundle Size**: <250KB gzipped

## 🔧 Configuration

### Required Environment Variables
```bash
# Database
DATABASE_URL=

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Payments
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# AI Chat
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
```

## 📚 Documentation

- [API Reference](docs/API.md)
- [Database Schema](docs/DATABASE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Skills System](.claude/skills/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Stripe](https://stripe.com/) for payment processing
- [Anthropic](https://anthropic.com/) for Claude AI
- [Vercel](https://vercel.com/) for deployment platform
```

## Feature-Specific README Sections

### Skills System Section
```markdown
## 🧠 Claude Code Skills

This project includes 5 comprehensive skills for development workflow optimization:

- **`stripe-payments`**: Payment integration and billing workflows
- **`chatbot-kb`**: AI chat system and knowledge base management
- **`database-ops`**: Database schema and migration operations
- **`api-routes`**: REST API development patterns
- **`performance`**: Optimization and analytics tracking

Skills automatically activate with relevant keywords and provide:
- Workflow checklists for complex operations
- Real code examples from the codebase
- Error handling and troubleshooting guides
- Best practices and security guidelines

**Location**: `.claude/skills/` directory
```

### API Documentation Section
```markdown
## 📡 API Reference

### Authentication
All API routes require authentication via Clerk. Include the session token in requests.

### Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://app.afilo.io/api`

### Endpoints

#### Products
- `GET /api/products` - List all products
- `GET /api/products/[handle]` - Get product by handle
- `POST /api/products/sync-stripe` - Sync with Stripe catalog

#### Chat
- `POST /api/chat/conversations` - Create conversation
- `GET /api/chat/conversations/[id]` - Get conversation with messages
- `POST /api/chat/conversations/[id]/messages` - Send message

#### Admin
- `GET /api/admin/chat/analytics` - Get bot analytics
- `POST /api/admin/knowledge-base/crawl` - Trigger website crawl

**Full API documentation**: [docs/API.md](docs/API.md)
```

### Performance Section
```markdown
## ⚡ Performance

### Lighthouse CI
Automated performance testing enforces these standards:
- Performance: ≥90%
- Accessibility: ≥90%
- Best Practices: ≥90%
- SEO: ≥90%

### Core Web Vitals
- **LCP** (Largest Contentful Paint): ≤2.5s
- **FCP** (First Contentful Paint): ≤2.0s
- **CLS** (Cumulative Layout Shift): ≤0.1

### Optimization Features
- Next.js Image optimization
- Dynamic imports for code splitting
- Bundle analysis and monitoring
- Database query optimization
- CDN and caching strategies

**Run performance tests**: `pnpm lighthouse`
```

## Dynamic Content Placeholders

Template supports these dynamic replacements:
- `{VERSION}`: Current package.json version
- `{BUILD_STATUS}`: CI/CD build status
- `{TEST_COVERAGE}`: Test coverage percentage
- `{API_COUNT}`: Number of API endpoints
- `{TABLE_COUNT}`: Database tables count
- `{COMPONENT_COUNT}`: React components count
- `{SKILLS_COUNT}`: Number of Claude skills
- `{LIGHTHOUSE_SCORE}`: Average Lighthouse score
- `{LCP}`, `{FCP}`, `{CLS}`: Core Web Vitals metrics