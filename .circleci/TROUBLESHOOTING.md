# CircleCI Troubleshooting Guide

## Common Issues and Solutions

### 1. pnpm Installation Error: "ERR_PNPM_UNKNOWN_SHELL"

**Error Message:**
```
ERR_PNPM_UNKNOWN_SHELL  Could not infer shell type.
Set the SHELL environment variable to your active shell.
```

**Solution:**
✅ **FIXED** - The configuration now includes explicit shell settings.

**What was done:**
1. Added `SHELL: /bin/bash` to executor environment variables
2. Configured `shell: /bin/bash -eo pipefail` for executor
3. Passed `SHELL=/bin/bash` explicitly to pnpm installation script

**Technical Details:**
The pnpm installer requires the `SHELL` environment variable to detect which shell is being used. CircleCI's Docker containers don't set this by default, causing the installation to fail. By explicitly setting `SHELL=/bin/bash`, we tell pnpm which shell configuration to use.

---

### 2. Environment Variables Not Available During Build

**Symptom:**
Build fails with errors like "NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN is undefined"

**Solution:**
Configure environment variables in CircleCI project settings:

1. Go to your CircleCI project
2. Click **Project Settings** → **Environment Variables**
3. Add the following variables:

| Variable Name | Source | Notes |
|--------------|--------|-------|
| `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` | `.env.local` | Your Shopify store domain |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | `.env.local` | Shopify API token |
| `STRIPE_SECRET_KEY` | `.env.local` | Stripe secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `.env.local` | Stripe publishable key |
| `CLERK_SECRET_KEY` | `.env.local` | Clerk secret key |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `.env.local` | Clerk publishable key |
| `DATABASE_URL` | `.env.local` | PostgreSQL connection string |
| `NEXT_PUBLIC_APP_URL` | Use `https://app.afilo.io` | Application URL |

**Fallback Values:**
The configuration includes fallback values for public variables:
- `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`: `placeholder.myshopify.com`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: `pk_test_placeholder`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: `pk_test_placeholder`
- `NEXT_PUBLIC_APP_URL`: `https://app.afilo.io`

---

### 3. Cache Issues

**Symptom:**
Build is slow or dependencies aren't being cached properly

**Solution:**
Clear the CircleCI cache:

1. Go to CircleCI project
2. Click on a recent build
3. Click **Rerun workflow** → **Rerun from beginning**
4. Or manually clear cache using SSH:
   ```bash
   rm -rf ~/.pnpm-store ~/.local/share/pnpm/store node_modules
   ```

**Cache Keys:**
The configuration uses the following cache strategy:
```yaml
- pnpm-v1-{{ checksum "pnpm-lock.yaml" }}
- pnpm-v1-
```

To invalidate cache, change the version number (e.g., `pnpm-v2-`).

---

### 4. Build Fails on Type Check

**Symptom:**
```
pnpm type-check
TypeScript errors found
```

**Solution:**
Run type check locally before pushing:
```bash
pnpm run type-check
```

Fix all TypeScript errors before pushing to remote.

**Tip:** The CI is configured to run type checking in strict mode as defined in `tsconfig.json`.

---

### 5. Prettier Check Fails

**Symptom:**
```
pnpm prettier:check
Code style issues found
```

**Solution:**
Format your code locally:
```bash
pnpm prettier:write
```

Then commit the formatted code.

**Check before committing:**
```bash
pnpm prettier:check
```

---

### 6. Security Audit Warnings

**Symptom:**
```
pnpm audit
X vulnerabilities found
```

**Solution:**
The security audit is configured with `|| true` to not fail the build on warnings.

To fix vulnerabilities:
```bash
# Review vulnerabilities
pnpm audit

# Fix automatically where possible
pnpm audit --fix

# Update specific packages
pnpm update package-name
```

**Note:** Some vulnerabilities may be in dependencies you don't directly control. Evaluate the risk before updating.

---

### 7. Tests Fail

**Symptom:**
```
pnpm test
Tests failed
```

**Current Status:**
The test script currently returns success by default:
```json
"test": "echo \"No tests specified yet\" && exit 0"
```

**When tests are implemented:**
1. Run tests locally: `pnpm test`
2. Ensure all tests pass before pushing
3. Update the script in `package.json`

---

## CircleCI Configuration Overview

### Jobs

1. **install** - Install dependencies and cache them
2. **type-check** - Run TypeScript type checking
3. **lint** - Run ESLint
4. **prettier-check** - Check code formatting
5. **security-audit** - Run security vulnerability scan
6. **build** - Build Next.js application
7. **test** - Run tests (when implemented)
8. **deploy-staging** - Deploy to staging (auto via Vercel)
9. **deploy-production** - Deploy to production (auto via Vercel)

### Workflow

```
install
  ↓
  ├─→ type-check ─┐
  ├─→ lint ───────┼─→ build ─→ test ─→ deploy
  ├─→ prettier ───┘
  └─→ security-audit
```

### Resource Classes

- **install, type-check, lint, prettier, security-audit, test**: `medium`
- **build**: `large` (requires more memory for Next.js build)

---

## Debugging Failed Builds

### Step 1: Check the Logs

1. Go to CircleCI dashboard
2. Click on the failed build
3. Expand the failed step
4. Read the error message

### Step 2: Reproduce Locally

Run the same commands locally:
```bash
pnpm install --frozen-lockfile
pnpm run type-check
pnpm run lint
pnpm run build
pnpm test
```

### Step 3: SSH into CircleCI (if needed)

1. Click **Rerun workflow** → **Rerun job with SSH**
2. Connect using the provided SSH command
3. Debug interactively

---

## Performance Optimization

### Current Optimizations

1. **Dependency Caching**: pnpm store is cached between builds
2. **Workspace Persistence**: `node_modules` and `.next` are shared between jobs
3. **Parallel Jobs**: Quality checks (lint, type-check, prettier) run in parallel
4. **Resource Allocation**: Build job uses `large` resource class

### Estimated Build Times

- **Cold build** (no cache): ~5-8 minutes
- **Warm build** (with cache): ~3-5 minutes
- **Cached build** (no code changes): ~2-3 minutes

---

## Scheduled Workflows

### Nightly Security Audit
- **Schedule**: Every day at 2 AM UTC
- **Purpose**: Catch new security vulnerabilities
- **Branches**: `main` only

### Weekly Dependency Check
- **Schedule**: Every Monday at 3 AM UTC
- **Purpose**: Ensure dependencies are up to date
- **Branches**: `main` only

---

## Need Help?

- [CircleCI Documentation](https://circleci.com/docs/)
- [pnpm Documentation](https://pnpm.io/motivation)
- [Next.js Build Documentation](https://nextjs.org/docs/deployment)
- [Afilo CI Configuration](.circleci/config.yml)

---

## Recent Fixes (Changelog)

### 2025-10-13 - Shell Detection Fix
- **Issue**: pnpm installation failed with "ERR_PNPM_UNKNOWN_SHELL"
- **Fix**: Added explicit SHELL environment variable configuration
- **Commit**: `44b5821`

### 2025-10-13 - Deprecated Version Key
- **Issue**: CircleCI warned about deprecated `version: 2.1` in workflows
- **Fix**: Removed deprecated version key
- **Commit**: `44b5821`
