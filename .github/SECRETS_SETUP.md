# GitHub Actions Secrets Setup Guide

## Overview

This guide explains how to configure GitHub Secrets and Variables for the CI/CD pipeline.

## Required Secrets

Navigate to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**

### 1. Secrets (Sensitive Data)

Click "New repository secret" for each of the following:

| Secret Name | Description | Example Format |
|------------|-------------|----------------|
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Shopify Storefront API token | `shpat_xxxxxxxxxxxxx...` |
| `STRIPE_SECRET_KEY` | Stripe API secret key (LIVE or TEST) | `sk_live_xxxxx...` or `sk_test_xxxxx...` |
| `CLERK_SECRET_KEY` | Clerk authentication secret key | `sk_test_xxxxx...` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db?params` |

### 2. Variables (Non-Sensitive Data)

Click on **Variables** tab, then "New repository variable" for each:

| Variable Name | Description | Value |
|--------------|-------------|-------|
| `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` | Shopify store domain | `fzjdsw-ma.myshopify.com` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_live_51Mvv...` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | `pk_test_c2Fjcm...` |
| `NEXT_PUBLIC_APP_URL` | Application URL | `https://app.afilo.io` |

## Why Separate Secrets and Variables?

- **Secrets**: Encrypted, never shown in logs, used for API keys/tokens
- **Variables**: Public, visible in logs, used for non-sensitive configuration

## Setting Up Secrets

### Step-by-Step Instructions:

1. **Go to your GitHub repository**
   ```
   https://github.com/code-craka/afilo-nextjs-shopify-app
   ```

2. **Navigate to Settings**
   - Click on **Settings** tab
   - Scroll down to **Security** section
   - Click **Secrets and variables** → **Actions**

3. **Add Repository Secrets**
   - Click **New repository secret**
   - Enter the **Name** (e.g., `STRIPE_SECRET_KEY`)
   - Paste the **Value** from your `.env.local` file
   - Click **Add secret**
   - Repeat for all secrets listed above

4. **Add Repository Variables**
   - Click on **Variables** tab
   - Click **New repository variable**
   - Enter the **Name** and **Value**
   - Click **Add variable**
   - Repeat for all variables listed above

## Verification

After adding all secrets and variables, your CI/CD pipeline should:

1. ✅ Build successfully
2. ✅ Pass type checking
3. ✅ Pass linting
4. ✅ Complete security audits
5. ✅ Run Lighthouse performance tests

## Troubleshooting

### Build Fails with "Secret not found"

**Solution**: Double-check the secret name matches exactly (case-sensitive)

### Build Fails with "STRIPE_SECRET_KEY is not set"

**Solution**:
1. Verify secret is added in GitHub Settings
2. Ensure the workflow file references it correctly: `${{ secrets.STRIPE_SECRET_KEY }}`
3. Re-run the workflow

### "Context access might be invalid" warnings in VS Code

**These warnings are false positives from VS Code**. GitHub Actions supports both:
- `${{ secrets.SECRET_NAME }}` - For sensitive data
- `${{ vars.VARIABLE_NAME }}` - For non-sensitive data

The workflow will run successfully despite these warnings.

## Getting Your Secret Values

Copy values from your local `.env.local` file:

```bash
# Secrets (Copy from .env.local to GitHub Secrets)
SHOPIFY_STOREFRONT_ACCESS_TOKEN=<from your .env.local>
STRIPE_SECRET_KEY=<from your .env.local>
CLERK_SECRET_KEY=<from your .env.local>
DATABASE_URL=<from your .env.local>

# Variables (Copy from .env.local to GitHub Variables)
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=<from your .env.local>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<from your .env.local>
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<from your .env.local>
NEXT_PUBLIC_APP_URL=<from your .env.local or use: https://app.afilo.io>
```

**Important**: Copy the actual values from your `.env.local` file - do NOT commit them to git!

## Security Best Practices

✅ **DO:**
- Store API keys in GitHub Secrets
- Use separate keys for staging/production
- Rotate secrets regularly
- Review secret access logs

❌ **DON'T:**
- Commit secrets to git
- Share secrets in pull requests
- Use production keys in development
- Store secrets in code comments

## Next Steps

After configuring secrets:

1. Push your code changes
2. GitHub Actions will automatically run
3. Check the **Actions** tab to monitor progress
4. Green checkmark ✅ = CI passed
5. Red X ❌ = Check logs for errors

## Need Help?

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
- [Afilo CI Configuration](.github/workflows/ci.yml)
