# Vercel Environment Variables Configuration
# Copy these variables to your Vercel dashboard under Settings > Environment Variables
# Mark sensitive variables (like API keys) as "Sensitive" to hide their values

## 🔧 Core Database & Infrastructure

### Neon PostgreSQL Database (Required)
DATABASE_URL=postgresql://username:password@host/database?sslmode=require&channel_binding=require
# Get from: Neon Console > Connection Details > Connection String
# Example: postgresql://neondb_owner:abcd1234@ep-example-123456.us-east-1.aws.neon.tech/neondb?sslmode=require

### Redis Caching (Upstash) - For Performance Optimization
UPSTASH_REDIS_REST_URL=https://your-endpoint.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token_here
# Get from: Upstash Console > Redis Database > Details > REST API
# Note: Redis is optional - app gracefully falls back if not configured

## 🔐 Authentication (Clerk) - Required

### Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_or_pk_live_your_key_here
CLERK_SECRET_KEY=sk_test_or_sk_live_your_secret_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
# Get from: Clerk Dashboard > API Keys

## 💳 Stripe Payments (Required)

### Stripe API Configuration
STRIPE_SECRET_KEY=sk_test_or_sk_live_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_or_pk_live_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_from_stripe_dashboard
# Get from: Stripe Dashboard > Developers > API Keys & Webhooks

### Stripe Feature Flags
ENABLE_STRIPE_V2=true
# Enables enhanced Stripe v2 features (recommended: true)

## 🤖 AI & Chat Bot System

### Anthropic Claude API (Required for Chat Bot)
ANTHROPIC_API_KEY=sk-ant-api03-your_anthropic_api_key_here
ANTHROPIC_MODEL=claude-sonnet-4-20250514
# Get from: Anthropic Console > API Keys

### OpenAI (Required for Knowledge Base Embeddings)
OPENAI_API_KEY=sk-proj-your_openai_api_key_here
KNOWLEDGE_BASE_EMBEDDING_MODEL=text-embedding-3-small
# Get from: OpenAI Platform > API Keys

### Chat Bot Configuration
NEXT_PUBLIC_CHAT_BOT_ENABLED=true
CHAT_BOT_MAX_TOKENS=4096
CHAT_BOT_TEMPERATURE=0.7
# Controls AI chat bot behavior and availability

## 📧 Email Services (Choose One)

### Resend (Recommended)
RESEND_API_KEY=re_your_resend_api_key_here
# Get from: Resend Dashboard > API Keys
# Used for: Cart recovery emails, notifications, transactional emails

### Alternative Email Services (Optional)
# SENDGRID_API_KEY=SG.your_sendgrid_api_key_here
# MAILGUN_API_KEY=your_mailgun_api_key_here

## 📊 Analytics & Monitoring

### Google Analytics 4 (Optional but Recommended)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX
# Get from: Google Analytics > Admin > Data Streams > Measurement ID

### Site Verification (Optional)
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your_google_verification_code
NEXT_PUBLIC_YANDEX_VERIFICATION=your_yandex_verification_code
# Get from: Google Search Console & Yandex Webmaster

## 🛒 E-commerce & Cart Recovery

### Application URLs
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
NEXT_PUBLIC_SITE_URL=https://your-vercel-domain.vercel.app
# Use your actual Vercel deployment URL or custom domain

### Cart Recovery System
CART_RECOVERY_ENABLED=true
CRON_SECRET=your_secure_random_string_for_cron_endpoints
# Generate secure random string for cron job authentication

## 🎨 Branding & Assets (Optional)

### Logo & Favicon URLs
NEXT_PUBLIC_LOGO_URL=https://your-domain.com/logo.png
NEXT_PUBLIC_FAVICON_URL=https://your-domain.com/favicon.ico
# Used in Stripe Customer Portal and email templates

## 🔒 Security & Environment

### Node Environment (Auto-set by Vercel)
NODE_ENV=production
# Automatically set by Vercel, don't manually set this

---

## 📋 Vercel Deployment Checklist

### 1. Required Environment Variables (Must Set)
- [ ] `DATABASE_URL` - Neon PostgreSQL connection
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk auth
- [ ] `CLERK_SECRET_KEY` - Clerk backend
- [ ] `STRIPE_SECRET_KEY` - Stripe payments
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe frontend
- [ ] `STRIPE_WEBHOOK_SECRET` - Stripe webhooks
- [ ] `NEXT_PUBLIC_APP_URL` - Your app URL

### 2. Recommended Environment Variables (High Value)
- [ ] `ANTHROPIC_API_KEY` - AI chat bot functionality
- [ ] `OPENAI_API_KEY` - Knowledge base embeddings
- [ ] `RESEND_API_KEY` - Email delivery system
- [ ] `UPSTASH_REDIS_REST_URL` - Performance caching
- [ ] `UPSTASH_REDIS_REST_TOKEN` - Redis authentication
- [ ] `NEXT_PUBLIC_GA_MEASUREMENT_ID` - Analytics tracking

### 3. Optional Environment Variables (Nice to Have)
- [ ] `CRON_SECRET` - Cart recovery automation
- [ ] `NEXT_PUBLIC_LOGO_URL` - Custom branding
- [ ] `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` - SEO verification

### 4. Vercel Settings Configuration
- [ ] Set Environment Variables as "Sensitive" for API keys
- [ ] Configure custom domain (if using)
- [ ] Enable "Automatically expose System Environment Variables"
- [ ] Set up Stripe webhook endpoint: `https://your-domain.vercel.app/api/stripe/webhook`

### 5. Post-Deployment Tasks
- [ ] Test Stripe payments in test mode
- [ ] Verify Clerk authentication flow
- [ ] Test chat bot functionality
- [ ] Set up Google Analytics
- [ ] Configure cart recovery cron job
- [ ] Run database migrations if needed

## ⚠️ Security Notes

1. **Never commit real API keys to git**
2. **Mark sensitive variables as "Sensitive" in Vercel dashboard**
3. **Use test/development keys for non-production environments**
4. **Regularly rotate API keys and webhook secrets**
5. **Monitor API usage and rate limits**

## 🚀 Quick Start Commands

After setting up environment variables in Vercel:

```bash
# Deploy to Vercel
vercel --prod

# Check deployment status
vercel list

# View deployment logs
vercel logs [deployment-url]
```

## 📞 Support & Resources

- **Vercel Docs**: https://vercel.com/docs/concepts/projects/environment-variables
- **Neon Setup**: https://neon.tech/docs/get-started-with-neon/setting-up-a-project
- **Clerk Setup**: https://clerk.com/docs/quickstarts/nextjs
- **Stripe Setup**: https://stripe.com/docs/development/quickstart
- **Upstash Redis**: https://console.upstash.com/

---

**💡 Pro Tip**: Start with required variables first, then add optional ones based on which features you want to enable. The app is designed to gracefully handle missing optional configurations.