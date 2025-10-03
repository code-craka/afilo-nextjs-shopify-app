# CircleCI Configuration - Afilo Enterprise Marketplace

## Overview

This directory contains the CircleCI configuration for the Afilo Next.js Shopify application.

**Pipeline Status**: [![CircleCI](https://dl.circleci.com/status-badge/img/circleci/YOUR_PROJECT_ID/tree/main.svg?style=shield)](https://dl.circleci.com/status-badge/link/circleci/YOUR_PROJECT_ID/tree/main)

## Pipeline Architecture

```
┌─────────────┐
│   Install   │  (All branches)
└──────┬──────┘
       │
       ├─────────────┬──────────────┬──────────────┬──────────────┐
       ▼             ▼              ▼              ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────────┐  ┌──────────────┐
│Type Check│  │   Lint   │  │Prettier Check│  │Security Audit│
└─────┬────┘  └─────┬────┘  └──────┬───────┘  └──────────────┘
      │             │              │
      └─────────────┴──────────────┘
                    │
                    ▼
              ┌──────────┐
              │  Build   │
              └─────┬────┘
                    │
                    ▼
              ┌──────────┐
              │   Test   │
              └─────┬────┘
                    │
       ┌────────────┴────────────┐
       ▼                         ▼
┌────────────┐          ┌──────────────┐
│Deploy Stage│          │Deploy Prod   │
│(staging)   │          │(main only)   │
└────────────┘          └──────────────┘
```

## Workflows

### 1. Main CI/CD Pipeline (`build-test-deploy`)

**Runs on**: All branches (main, staging, develop, feature/*)

**Jobs**:
1. **install** - Install dependencies with pnpm
2. **type-check** - TypeScript strict mode validation
3. **lint** - ESLint code quality check
4. **prettier-check** - Code formatting validation
5. **security-audit** - npm/pnpm audit for vulnerabilities
6. **build** - Next.js production build
7. **test** - Run test suite (when implemented)
8. **deploy-staging** - Deploy to Vercel staging (staging branch only)
9. **deploy-production** - Deploy to Vercel production (main branch only)

### 2. Nightly Security Audit

**Runs**: Daily at 2:00 AM UTC
**Branch**: main only
**Purpose**: Monitor for new security vulnerabilities

### 3. Weekly Dependency Check

**Runs**: Every Monday at 3:00 AM UTC
**Branch**: main only
**Purpose**: Check for outdated dependencies and security updates

## Environment Variables

### Required Environment Variables (Set in CircleCI Project Settings)

Navigate to: **Project Settings → Environment Variables**

#### Build-Time Variables (Public - NEXT_PUBLIC_*)
```bash
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
NEXT_PUBLIC_APP_URL=https://app.afilo.io
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

#### Server-Side Variables (Private - Keep Secret!)
```bash
# Shopify
SHOPIFY_STOREFRONT_ACCESS_TOKEN=xxxxx

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Clerk Authentication
CLERK_SECRET_KEY=sk_test_xxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxx

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Email (Resend)
RESEND_API_KEY=re_xxxxx

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxx
```

## Setup Instructions

### 1. Connect Repository to CircleCI

1. Go to [CircleCI Dashboard](https://app.circleci.com/)
2. Click "Projects" → "Set Up Project"
3. Select your repository: `code-craka/afilo-nextjs-shopify-app`
4. Click "Use Existing Config" (we have `.circleci/config.yml`)
5. Click "Start Building"

### 2. Configure Environment Variables

1. Go to **Project Settings → Environment Variables**
2. Add all required variables listed above
3. Click "Add Environment Variable" for each one

### 3. Configure Contexts (Optional - For Shared Secrets)

1. Go to **Organization Settings → Contexts**
2. Create context: `afilo-production`
3. Add production secrets
4. Create context: `afilo-staging`
5. Add staging secrets

### 4. Enable Workflows

Workflows are automatically enabled. To customize:

1. Go to **Project Settings → Advanced**
2. Configure workflow settings as needed

## Local Validation

### Validate CircleCI Config Locally

```bash
# Install CircleCI CLI
curl -fLSs https://raw.githubusercontent.com/CircleCI-Public/circleci-cli/master/install.sh | bash

# Validate config
circleci config validate

# Run job locally (requires Docker)
circleci local execute --job install
circleci local execute --job type-check
circleci local execute --job build
```

### Test Pipeline Commands Locally

```bash
# Install dependencies
pnpm install --frozen-lockfile

# Type check
pnpm type-check

# Lint
pnpm lint

# Prettier check
pnpm prettier:check

# Security audit
pnpm audit --audit-level=moderate

# Build
pnpm build

# Test
pnpm test
```

## Branch Strategy

### Protected Branches

- **main** - Production branch
  - Deploys to: `https://app.afilo.io`
  - Requires: All checks passing
  - Merge: Via pull request only

- **staging** - Staging branch
  - Deploys to: Vercel preview (staging)
  - Requires: All checks passing
  - Merge: Via pull request from develop

- **develop** - Development branch
  - Runs: CI checks only (no deployment)
  - Merge: Feature branches via pull request

- **feature/** - Feature branches
  - Runs: CI checks only
  - Merge: Into develop via pull request

## Pipeline Performance

### Job Execution Times (Approximate)

| Job             | Duration | Resource Class |
|-----------------|----------|----------------|
| install         | ~45s     | medium         |
| type-check      | ~15s     | medium         |
| lint            | ~10s     | medium         |
| prettier-check  | ~8s      | medium         |
| security-audit  | ~20s     | medium         |
| build           | ~90s     | large          |
| test            | ~30s     | medium         |

**Total Pipeline Time**: ~3-4 minutes (with parallelization)

### Optimization Tips

1. **Cache Dependencies**: pnpm cache is saved/restored automatically
2. **Parallel Execution**: Quality checks run in parallel
3. **Workspace Persistence**: Build artifacts shared between jobs
4. **Resource Classes**: Build job uses "large" for faster builds

## Troubleshooting

### Common Issues

#### 1. pnpm Installation Fails
```bash
# Check pnpm version in config.yml matches package.json
# Current version: 8.15.6
```

#### 2. Build Fails - Environment Variables Missing
```bash
# Verify all NEXT_PUBLIC_* variables are set in CircleCI
# Check: Project Settings → Environment Variables
```

#### 3. Type Check Fails
```bash
# Run locally first:
pnpm type-check

# Fix TypeScript errors before pushing
```

#### 4. Cache Issues
```bash
# Clear cache in CircleCI:
# Project Settings → Advanced → Clear Cache
```

## Notifications

### Slack Integration (Optional)

Add to `.circleci/config.yml`:

```yaml
orbs:
  slack: circleci/slack@4.12.0

# In each job:
- slack/notify:
    event: fail
    channel: ci-notifications
    custom: |
      {
        "text": "Build failed on ${CIRCLE_BRANCH}",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*Build Failed* :x:\nBranch: ${CIRCLE_BRANCH}\nJob: ${CIRCLE_JOB}"
            }
          }
        ]
      }
```

## Status Badges

Add to your README.md:

```markdown
[![CircleCI](https://dl.circleci.com/status-badge/img/circleci/YOUR_PROJECT_ID/tree/main.svg?style=shield)](https://dl.circleci.com/status-badge/link/circleci/YOUR_PROJECT_ID/tree/main)
```

## Security Best Practices

✅ **DO**:
- Store secrets in CircleCI environment variables
- Use contexts for shared secrets across projects
- Rotate secrets regularly (every 90 days)
- Enable "Pass secrets to builds from forked pull requests" ONLY if needed

❌ **DON'T**:
- Commit secrets to `.circleci/config.yml`
- Print secrets in build logs (`echo $SECRET_KEY`)
- Share production secrets in staging environments

## Support

- **CircleCI Docs**: https://circleci.com/docs/
- **pnpm Docs**: https://pnpm.io/
- **Next.js CI/CD**: https://nextjs.org/docs/deployment
- **Project Issues**: https://github.com/code-craka/afilo-nextjs-shopify-app/issues

## Maintenance

### Update CircleCI Orbs

Check for updates quarterly:

```bash
# Check current versions
circleci orb list circleci/node

# Update in config.yml
orbs:
  node: circleci/node@5.2.0  # Update version here
```

### Update Node.js Version

When upgrading Node.js:

1. Update `package.json` engines
2. Update `.circleci/config.yml` executor image:
   ```yaml
   - image: cimg/node:18.17  # Update version
   ```

---

**Last Updated**: January 2025
**Maintainer**: [Rihan](https://github.com/code-craka)
**Project**: [afilo-nextjs-shopify-app](https://github.com/code-craka/afilo-nextjs-shopify-app)
