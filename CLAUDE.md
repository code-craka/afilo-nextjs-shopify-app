# Afilo Configuration

## 💡 Context Optimization Guidelines
**IMPORTANT**: To save context and tokens:
- Use `pnpm tsc` instead of `pnpm build` for TypeScript checks
- Reference file paths directly: `file_path:line_number` format
- For large tasks, break into smaller sessions
- Use `Glob` and `Grep` tools efficiently instead of reading multiple files
- Focus on specific issues rather than exploratory code reviews

## Stack & Commands
- **Next.js 16 + React 19 + TypeScript** | **pnpm only** | Hetzner + Vercel deploy
- **Auth**: Clerk + 2FA | **DB**: Neon PostgreSQL + Prisma (37 tables, 100% migrated) | **Pay**: Stripe + Stripe Connect
- **Dependencies**: @stripe/connect-js (3.3.31) for embedded marketplace components
- **Infrastructure**: Hetzner Cloud + Ubuntu 22.04/24.04 + PM2 + Nginx + SSL
- **Database**: Production-ready with 139 active records across all systems

```bash
pnpm dev --turbopack    # Ask first!
pnpm tsc               # TypeScript checks only
# Production deployment (see DEPLOYMENT_QUICKSTART.md)
./scripts/deploy.sh     # Full deployment with health checks
./scripts/quick-deploy.sh  # Fast deployment for minor updates
```

## Current Status ✅

### Database & TypeScript (100% Complete) ⭐ VERIFIED NOV 17, 2025
- ✅ **All 37 Database Tables Migrated** - 100% production ready
- ✅ **Build Success** - Zero TypeScript errors
- ✅ **Data Integrity** - 139 active records, all constraints enforced
- ✅ Next.js 16 + Clerk v6 compatibility with async patterns
- ✅ Stripe Connect Types - 24 files verified, all imports correct
- ✅ Zod v4 compatibility - Updated all z.record() calls
- ✅ Prisma Integration - JsonValue casting, proper snake_case model names
- 📊 **Verification Script**: `pnpm tsx scripts/verify-migrations.ts`
- 📖 **Full Report**: `DATABASE_MIGRATION_VERIFIED.md`

### Enterprise Services (Phase 3.0 Complete)
**Status**: ✅ PRODUCTION-READY - Real database integration complete

**4 Core Services** (All using Neon PostgreSQL):
- `lib/enterprise/api-monitor.middleware.ts` - Real-time API tracking (prisma.api_monitoring)
- `lib/enterprise/audit-logger.service.ts` - SOC 2 audit trails (prisma.audit_logs)
- `lib/enterprise/webhook-monitor.service.ts` - Webhook analytics (prisma.webhook_events)
- `lib/enterprise/rate-limiter.service.ts` - Rate limiting (prisma.rate_limit_tracking)

**Enterprise Admin APIs**:
- `/api/admin/enterprise/audit-summary` - Security audit overview
- `/api/admin/enterprise/rate-limit-summary` - Rate limiting analytics
- `/api/admin/enterprise/webhook-health` - Webhook system status
- `/api/admin/enterprise/api-health` - API performance metrics

**Dashboard**: `/dashboard/admin/enterprise`

### Recent Achievements (Nov 2025)

**Database Migration Complete** (Nov 17, 2025):
- ✅ **37/37 Tables Verified** - All systems operational
- ✅ Fixed TypeScript compatibility (`app/api/health/route.ts`)
- ✅ Data integrity fixes (audit_logs NULL values)
- ✅ Created missing payment_transactions table
- ✅ All indexes and constraints active
- 📊 Active: 12 users, 18 products, 43 variants, 129 total records

**Legal Policy Updates** (Jan 2025):
- ✅ 14-Day Money-Back Guarantee (updated from 30-day)
- ✅ FTC-compliant refund policy
- ✅ Updated Terms of Service
- ✅ Prominent disclosure on pricing page

**ACH Authorization System** (100% Migrated):
- ✅ 3 database tables: ach_authorizations, ach_authorization_evidence, ach_dispute_inquiries
- ✅ NACHA compliance (7-year retention)
- ✅ Zod validation schemas with routing number verification
- ✅ AES-256-GCM encryption utilities for PCI DSS compliance
- 📋 Next: API routes, React components, webhook integration
- 📖 Docs: `docs/LEGAL_POLICY_ACH_DEPLOYMENT.md`

## Features Complete ✅

### Phase 1 - Foundation (100%)
- 🔐 Enterprise 2FA, admin role protection, enhanced middleware
- 🎨 Dark mode, responsive design, accessibility
- 📊 GA4 enterprise tracking, conversion metrics
- 🖼️ Next.js Image optimization, lazy loading
- 🔍 SEO metadata, sitemap, robots.txt
- 💳 Stripe production pricing, webhook handlers

### Phase 1.75 - Performance (100%)
- 🚀 Database composite indexes (70-95% faster queries)
- 💾 Redis caching with ProductCache (5-min TTL)
- 🏗️ Hybrid SSR/ISR + Client Components
- 📄 Cursor-based pagination
- 🔗 Dynamic `/products/[handle]` routing

### Phase 2 - E-commerce & Enterprise (100%)

**Cart Recovery System** (`/dashboard/admin/cart-recovery`):
- 3-tier email campaigns (24h, 72h, 168h) with progressive discounts
- Expected: 15-25% recovery rate, $500-2000/month recovered
- 4 database tables, 12 API routes, automated Vercel cron
- ✅ Active: 3 campaigns, 1 analytics record

**Enterprise Monitoring** (`/dashboard/admin/enterprise`):
- Real-time webhook, API performance, security audit
- Rate limiting (configurable IP/user-based)
- SOC 2 ready, GDPR compliant
- 4 database tables (api_monitoring, audit_logs, webhook_events, rate_limit_tracking)
- ✅ Active: 8 audit logs, 3 rate limit tracking records

### Phase 2.0 - Stripe Connect Marketplace (100%)

**Status**: ✅ PRODUCTION-READY - Complete multi-vendor platform

**Infrastructure**:
- 3 database tables: stripe_connect_accounts, marketplace_transfers, connect_account_sessions
- 8 API routes with full security and rate limiting
- 11 React components with Radix UI + CVA + TailwindCSS v4
- 5 pages with server-side auth and role-based access

**Merchant Features**:
- Express & Standard account onboarding
- Embedded Stripe dashboard (payments, payouts, documents)
- `/dashboard/merchant/onboarding` - Onboarding flow
- `/dashboard/merchant` - Account dashboard

**Admin Features**:
- Transfer management with 2-10% platform fees
- Account overview and management
- `/dashboard/admin/connect` - Overview dashboard
- `/dashboard/admin/connect/accounts` - Account management
- `/dashboard/admin/connect/transfers` - Transfer history

**Quick Start**:
```bash
# All tables already migrated ✅
UPDATE user_profiles SET role = 'merchant' WHERE clerk_user_id = 'YOUR_USER_ID';
```

**Docs**: `docs/STRIPE_CONNECT_COMPLETE.md`

### Phase 3 - Cookie Consent (100%)
- ✅ CCPA/PIPEDA/UK GDPR/Australia Privacy Act compliant
- ✅ 3 database tables (cookie_consent_records, cookie_consent_audit_log, cookie_policy_versions)
- ✅ 2 active consent records, 7 audit logs
- ✅ 5 API routes
- ✅ CookieConsentBanner component
- ✅ Cross-device consent sync for authenticated users
- ✅ Consent-aware GA4 and Vercel Analytics

### Phase 4 - Enterprise Chat Bot (100%)

**Status**: ✅ PRODUCTION-READY - All features complete

**Capabilities**:
- Claude Sonnet 4 streaming responses
- OpenAI embeddings + semantic search + website crawler
- Stripe-aware (subscription status, payment detection)
- Smart context (last 10 messages + top 3 KB articles + customer data)
- Admin dashboard with analytics, conversation management, KB editor

**Backend**:
- 18 API routes (7 chat, 7 KB admin, 4 chat admin)
- 4 database tables (chat_conversations, chat_messages, knowledge_base, bot_analytics)
- ✅ Active: 3 conversations, 8 messages, 7 analytics records
- Clerk auth, IDOR protection, XSS prevention

**Frontend**:
- 6 chat UI components + 3 admin dashboard components
- `/dashboard/admin/chat` - Analytics, conversations, KB management

**Quick Start**:
```bash
# Set admin role
UPDATE user_profiles SET role = 'admin' WHERE clerk_user_id = 'YOUR_USER_ID';

# Trigger KB crawl via admin UI or API
curl -X POST https://app.afilo.io/api/admin/knowledge-base/crawl \
  -H "Cookie: __session=YOUR_ADMIN_SESSION"
```

**Env Variables**:
```bash
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-20250514
OPENAI_API_KEY=sk-proj-...
NEXT_PUBLIC_CHAT_BOT_ENABLED=true
```

**Docs**: `docs/IMPLEMENTATION_COMPLETE_SUMMARY.md`

## Deployment 🚀

### Hetzner Cloud Production (Complete)

**Status**: ✅ PRODUCTION-READY - Enterprise deployment package

**8 Automated Scripts**:
- `scripts/server-setup.sh` - Ubuntu config + security
- `scripts/app-setup.sh` - App install + PM2
- `scripts/setup-env.sh` - Interactive env config
- `scripts/db-setup.sh` - Migrations + health checks
- `scripts/deploy.sh` - Full deployment with rollback
- `scripts/quick-deploy.sh` - Fast minor updates
- `scripts/setup-ssl.sh` - Let's Encrypt A+ SSL
- `scripts/setup-monitoring.sh` - System monitoring

**Infrastructure**:
- Hetzner CPX31+ (4 vCPU, 8GB RAM, 160GB SSD)
- Ubuntu 22.04/24.04 + Node.js 20 + pnpm + PM2
- Nginx with HTTP/2, gzip, rate limiting
- Let's Encrypt SSL (A+ grade)
- Automated backups (7-day retention)

**Quick Deploy (30 min)**:
```bash
ssh root@YOUR_SERVER_IP
curl -fsSL https://raw.githubusercontent.com/your-repo/afilo/main/scripts/server-setup.sh | bash
# Follow prompts for steps 2-7
```

**Management**:
```bash
./scripts/deploy.sh              # Full deployment
./scripts/quick-deploy.sh        # Fast deployment
./scripts/deploy.sh --rollback   # Emergency rollback
./status-dashboard.sh            # System status
pm2 monit                       # Live monitoring
```

**Docs**: `docs/HETZNER_DEPLOYMENT.md`, `DEPLOYMENT_QUICKSTART.md`

## Context System 🧠
- **Auto-loading**: Stripe/Auth/Chat contexts load automatically
- **Cache**: 85% cost reduction via Redis + PostgreSQL
- **Hooks**: 3 active (load/save/context-detect)
- **Archived Docs**: `.claude/archive/` for detailed feature specs

## Quick Reference

**Database Management**:
```bash
pnpm tsx scripts/verify-migrations.ts  # Verify all 37 tables
pnpm prisma db push                    # Push schema changes
pnpm prisma generate                   # Regenerate Prisma client
```

**Admin Dashboards**:
- `/dashboard/admin/cart-recovery` - Cart recovery campaigns
- `/dashboard/admin/enterprise` - Webhook, API, security monitoring
- `/dashboard/admin/connect` - Stripe Connect marketplace
- `/dashboard/admin/chat` - Chat bot analytics and KB management

**Environment Variables** (GA4):
```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
NEXT_PUBLIC_GA_TRACKING_ID="G-XXXXXXXXXX"
DATABASE_URL="postgresql://..."  # Neon PostgreSQL (production)
```

**Key File Patterns**:
- Database verification: `scripts/verify-migrations.ts`
- Enterprise services: `lib/enterprise/*.service.ts`
- API routes: `app/api/**/*.ts`
- Components: `components/**/*.tsx`
- Chat bot: `types/chat.ts`, `store/chat-store.ts`, `lib/chat-*.ts`
- Stripe Connect: `lib/stripe/connect-*.ts`, `components/stripe/connect/*.tsx`

**Prisma Model Naming** (IMPORTANT):
- ✅ Use snake_case: `prisma.user_profiles`, `prisma.audit_logs`, `prisma.api_monitoring`
- ✅ Field names: `created_at`, `updated_at` (not `createdAt`, `updatedAt`)
- ❌ Avoid camelCase: `prisma.userProfile`, `prisma.auditLog` (will fail)

**Performance Expectations**:
- Response time: <200ms cached, <500ms dynamic
- Database queries: 70-95% faster with optimizations
- Uptime: 99.9% with health checks
- SSL: A+ grade security
- Database: 37 tables, 139 active records
