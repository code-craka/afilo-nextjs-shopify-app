# 🚀 Deployment Guide

**Project**: Afilo Digital Marketplace  
**Author**: Rihan (@code-craka)  
**Repository**: [afilo-nextjs-shopify-app](https://github.com/code-craka/afilo-nextjs-shopify-app)  

## 🌍 Live Deployments

- **Frontend**: [app.afilo.io](https://app.afilo.io)
- **Customer Portal**: [account.afilo.io](https://account.afilo.io)
- **Backend**: Shopify (fzjdsw-ma.myshopify.com)

## 🛠️ Prerequisites

### Requirements
- **Node.js**: 18.17+ or 20.3+ (LTS recommended)
- **pnpm**: 8.0+ (required package manager)
- **Git**: Latest version
- **Vercel Account**: For deployment
- **Shopify Store**: With Storefront API access

### Environment Variables
```env
# Required for deployment
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=fzjdsw-ma.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_server_side_storefront_token

# Optional
NEXT_PUBLIC_CUSTOMER_ACCOUNT_CLIENT_ID=your_client_id
NEXT_PUBLIC_VERCEL_URL=your_preview_url
```

## 🔧 Vercel Deployment (Recommended)

### Automatic Deployment

1. **Connect Repository**
   ```bash
   # Ensure code is pushed to GitHub
   git add .
   git commit -m "feat: ready for deployment"  
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import from GitHub: `code-craka/afilo-nextjs-shopify-app`

3. **Configure Environment**
   - Add environment variables in Vercel dashboard
   - Set build command: `pnpm build`
   - Set install command: `pnpm install`
   - Set dev command: `pnpm dev --turbopack`

4. **Deploy**
   - Click "Deploy"
   - Automatic deployments on every push to main

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Custom Domains

```bash
# Add custom domain
vercel domains add app.afilo.io
vercel domains add account.afilo.io

# Configure domain in Vercel dashboard
```

## ⚙️ Build Configuration

### vercel.json
```json
{
  "framework": "nextjs",
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev --turbopack", 
  "installCommand": "pnpm install",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options", 
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### next.config.ts
```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack for faster development
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js'
        }
      }
    }
  },
  
  // Image optimization for Shopify CDN
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        pathname: '/s/files/**'
      }
    ]
  },
  
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  
  // Bundle analysis
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      config.plugins.push(
        new (require('@next/bundle-analyzer'))({
          enabled: true
        })
      );
      return config;
    }
  })
};

module.exports = nextConfig;
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

The repository includes automated CI/CD:

1. **Continuous Integration** (`.github/workflows/ci.yml`)
   - Type checking with TypeScript
   - Linting with ESLint  
   - Build verification
   - Security audit
   - Lighthouse performance testing

2. **Deployment** (`.github/workflows/deploy.yml`)
   - Automatic deployment on main branch
   - Environment variable injection
   - Release creation with changelog

3. **Code Quality** (`.github/workflows/code-quality.yml`)
   - Bundle analysis
   - Dependency review
   - Prettier formatting check

### Secrets Configuration

Add these secrets in GitHub repository settings:

```env
# Shopify Configuration
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
SHOPIFY_STOREFRONT_ACCESS_TOKEN
NEXT_PUBLIC_CUSTOMER_ACCOUNT_CLIENT_ID

# Vercel Deployment
VERCEL_TOKEN
VERCEL_ORG_ID  
VERCEL_PROJECT_ID
```

## 📊 Performance Optimization

### Build Optimization

```bash
# Analyze bundle size
pnpm run analyze

# Check build output
pnpm run build

# Test production build locally
pnpm run build && pnpm start
```

### Performance Targets

- **LCP**: < 2.5s (Largest Contentful Paint)
- **FID**: < 100ms (First Input Delay)
- **CLS**: < 0.1 (Cumulative Layout Shift)
- **Bundle Size**: < 250KB gzipped main bundle

### Lighthouse Audit

```bash
# Install Lighthouse CI
npm install -g @lhci/cli

# Run audit
lhci autorun
```

## 🔒 Security Configuration

### Environment Security

```bash
# Never commit secrets
echo "*.env*" >> .gitignore
echo ".env.local" >> .gitignore

# Use environment variables in Vercel
# Set in dashboard: Settings > Environment Variables
```

### Security Headers

Implemented via Vercel configuration:
- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block

## 🌐 Domain Configuration

### DNS Settings

For custom domains (`app.afilo.io`, `account.afilo.io`):

```dns
# A Records
@ -> 76.76.19.61
www -> 76.76.19.61

# CNAME Records  
app -> cname.vercel-dns.com
account -> cname.vercel-dns.com
```

### SSL/TLS

- Automatic SSL via Vercel
- TLS 1.3 support
- HSTS headers enabled

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   
   # Reinstall dependencies
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

2. **Environment Variables**
   ```bash
   # Check environment in Vercel
   vercel env list
   
   # Pull environment locally
   vercel env pull .env.local
   ```

3. **Shopify API Issues**
   ```bash
   # Test API connectivity
   curl -X POST \
     https://fzjdsw-ma.myshopify.com/api/2024-07/graphql.json \
     -H "X-Shopify-Storefront-Access-Token: YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"query":"{ shop { name } }"}'
   ```

### Debug Mode

```bash
# Enable debug logging
export DEBUG=next:*
pnpm dev

# Check build logs
vercel logs
```

## 📈 Monitoring & Analytics

### Performance Monitoring

- **Vercel Analytics**: Built-in performance metrics
- **Core Web Vitals**: Real user monitoring
- **Lighthouse CI**: Automated performance testing

### Error Tracking

- **Vercel Error Tracking**: Built-in error monitoring
- **Console Logging**: Development debugging

### Analytics Integration

```typescript
// Google Analytics 4 (if configured)
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

// Track page views
useEffect(() => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: window.location.pathname,
    });
  }
}, []);
```

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] All tests pass locally
- [ ] Build completes successfully
- [ ] Environment variables configured
- [ ] Performance audit completed
- [ ] Security headers configured
- [ ] Custom domains configured (if applicable)

### Post-Deployment

- [ ] Site loads correctly on all devices
- [ ] Shopify integration working
- [ ] ProductGrid displays products
- [ ] Digital cart functions properly
- [ ] Performance metrics meet targets
- [ ] Error monitoring configured

### Production Monitoring

- [ ] Uptime monitoring
- [ ] Performance tracking
- [ ] Error rate monitoring
- [ ] User analytics
- [ ] Shopify API rate limiting

## 📞 Support

### Deployment Issues

- **GitHub Issues**: [Report deployment problems](https://github.com/code-craka/afilo-nextjs-shopify-app/issues)
- **Documentation**: [Comprehensive guides](./docs/)
- **Author**: [@code-craka](https://github.com/code-craka)

### Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Shopify Storefront API](https://shopify.dev/docs/storefront-api)

---

**Deployed with ❤️ by Rihan** | **Powered by Vercel & Shopify** | **Built with Next.js**