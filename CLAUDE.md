# Afilo Configuration (Token-Optimized)

## 💡 Context Guidelines
**SAVE TOKENS**:
- Use `pnpm tsc` over `pnpm build`
- Reference: `file_path:line_number` format
- Break large tasks into sessions
- Use `Glob/Grep` efficiently
- Focus on specific issues

## Stack & Commands
- **Stack**: Next.js 16 + React 19 + TypeScript | pnpm | Hetzner + Vercel
- **Auth**: Clerk + 2FA | **DB**: Neon PostgreSQL + Prisma (37 tables, 100% migrated) | **Pay**: Stripe Connect
- **Security**: Client Trust credential stuffing protection + Enterprise 2FA
- **Infrastructure**: Hetzner Cloud + Ubuntu 22.04/24.04 + PM2 + Nginx + SSL
- **Database**: Production-ready with 139 active records across all systems

```bash
pnpm dev --turbopack    # Ask first!
pnpm tsc               # TypeScript checks only
./scripts/deploy.sh     # Full deployment with health checks
```

## ✅ Production Status (VERIFIED NOV 17, 2025)
- **Database**: 37 tables migrated, 139 active records, zero TypeScript errors
- **Enterprise Services**: 4 services production-ready with real database integration
- **Security**: Clerk Client Trust + 2FA + CCPA/GDPR compliance
- **Features**: Cart recovery, marketplace, chat bot, enterprise monitoring
- **Performance**: 70-95% query improvements, Redis caching, cursor pagination

## 🏢 Enterprise Services (PRODUCTION)
**4 Core Services** (Neon PostgreSQL):
- `api-monitor.middleware.ts` → prisma.api_monitoring (real-time API tracking)
- `audit-logger.service.ts` → prisma.audit_logs (SOC 2 compliance)
- `webhook-monitor.service.ts` → prisma.webhook_events (Stripe analytics)
- `rate-limiter.service.ts` → prisma.rate_limit_tracking (sliding window)

**Admin APIs**: `/api/admin/enterprise/{audit,rate-limit,webhook,api}-{summary,health}`

## 🔐 Security & Compliance
**Clerk Client Trust** (Nov 2025):
```bash
CLERK_CLIENT_TRUST_ENABLED=true
CLERK_CREDENTIAL_STUFFING_PROTECTION=true
CLERK_EMAIL_OTP_ENABLED=true
CLERK_PHONE_OTP_ENABLED=true
```
**Files**: `components/auth/TwoFactorVerification.tsx`, `.env.*.updated`

## 🏪 Major Features (Complete)
**Stripe Connect Marketplace**:
- 3 tables: stripe_connect_accounts, marketplace_transfers, connect_account_sessions
- 8 API routes with rate limiting, 11 React components
- Express/Standard accounts, platform fees (2-10%)

**Cart Recovery System**:
- 4 tables: campaigns, sessions, email_logs, analytics
- 12 API routes, 3-tier campaigns (24h/72h/168h)
- Expected: 15-25% recovery rate

**Chat Bot System**:
- Claude Sonnet 4 streaming + OpenAI embeddings
- 18 API routes, admin dashboard, Stripe-aware context
- Knowledge base crawler + semantic search

## 🏛️ ACH Authorization (Infrastructure Ready)
**Created**: 3 tables, Zod validation, AES-256-GCM encryption, NACHA compliance
**Deployment**: Requires ENCRYPTION_KEY (32 bytes hex)

## 🚀 Deployment (Complete)
**Scripts**: 8 automated scripts for Ubuntu deployment
- `deploy.sh`, `quick-deploy.sh`, SSL (A+), monitoring, PM2 cluster

**Environment**:
```bash
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-proj-...
NEXT_PUBLIC_CHAT_BOT_ENABLED=true
```

## Development Status
**Complete Phases**: Infrastructure, performance (70-95% faster), cart recovery, marketplace, chat bot, cookie consent (CCPA/GDPR)

**Quick Commands**:
```bash
# Health check
curl -s https://app.afilo.io/api/health | jq .

# Admin role setup
UPDATE user_profiles SET role = 'admin' WHERE clerk_user_id = 'YOUR_ID';

# Production deploy
cp .env.production.updated .env.production.local && pm2 restart afilo-app
```

**Context auto-loads based on your questions** 💰