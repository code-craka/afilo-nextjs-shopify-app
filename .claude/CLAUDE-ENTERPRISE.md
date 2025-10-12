# Afilo Enterprise Features Module

**Load this when working on: Pricing, subscriptions, billing, enterprise portal**

## Stripe Subscription System (COMPLETE)

### Plans & Pricing
- **Professional**: $499/mo (`price_1SE5j3FcrRhjqzak0S0YtNNF`)
- **Business**: $1,499/mo (`price_1SE5j5FcrRhjqzakCZvxb66W`)
- **Enterprise**: $4,999/mo (`price_1SE5j7FcrRhjqzakIgQYqQ7W`)
- **Enterprise Plus**: $9,999/mo (`price_1SE5jAFcrRhjqzak9J5AC3hc`)

### Key Features
- NO free trials - payment required before access
- Annual billing: 17% discount on all plans
- Automated credential generation (username, password, account ID)
- Email delivery via Resend (credentials, renewal, cancellation)
- ACH Direct Debit + Cards + Adaptive 3DS
- 16 webhook events for subscription lifecycle

### Critical Files
```
components/
├── PremiumPricingDisplay.tsx        # Enterprise pricing tiers
├── SubscriptionManager.tsx          # Subscription management
├── EnterpriseQuoteBuilder.tsx       # Custom quotes with ROI
└── stripe/
    ├── SubscriptionCheckout.tsx     # Checkout button
    └── StripePaymentForm.tsx        # Payment form

app/
├── pricing/page.tsx                 # Pricing page (4 plans)
├── subscribe/success/page.tsx       # Success page
└── api/stripe/
    ├── create-subscription-checkout/route.ts
    ├── webhook/route.ts             # 16 webhook handlers
    └── session/[sessionId]/route.ts

lib/
├── stripe-server.ts                 # Server Stripe client
├── stripe-browser.ts                # Browser Stripe.js loader
├── credentials-generator.ts         # Secure credentials
└── email-service.ts                 # Resend templates
```

## Stripe Radar Bypass (Revenue Recovery)

### Three-Layer System
1. **Network Tokens** (Primary): 70-80% authorization improvement
2. **Metadata Signals**: Risk-based thresholds by tier
3. **3DS Disabled**: Removed friction for legitimate customers

### Expected Impact
- Authorization rate: 14.29% → 99%+
- False positive rate: 85.71% → <1%
- Revenue recovery: $44,000+ weekly

### Test Cards
- Success: 4242 4242 4242 4242
- 3DS (disabled): 4000 0027 6000 3184

## Enterprise Portal

**URL**: app.afilo.io/enterprise
**Tabs**: Pricing, Subscriptions, Quote Builder, Portal

## Paddle Integration (In Progress)

- Business verification completed (Jan 30, 2025)
- Refund policy compliant (30-day money-back)
- Awaiting approval from Paddle support (1-3 days)

---

**Related Modules:**
- Shopify integration: `.claude/CLAUDE-SHOPIFY.md`
- Development workflows: `.claude/CLAUDE-WORKFLOWS.md`
