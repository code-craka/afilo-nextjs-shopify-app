---
name: stripe-payments
description: Manages Stripe payment integration workflows including adaptive checkout, subscription handling, and billing operations. Use when working with payment flows, subscription management, or Stripe API integrations.
---

# Stripe Payments

Advanced Stripe integration for digital marketplace with adaptive checkout, subscription management, and billing operations.

## Quick Start

**Create adaptive checkout session:**
```typescript
import { adaptiveCheckoutService } from '@/lib/stripe/services/adaptive-checkout.service';

const session = await adaptiveCheckoutService.createAdaptiveCheckoutSession({
  price_id: 'price_xxx',
  customer_email: 'user@example.com',
  success_url: 'https://app.afilo.io/checkout/success',
  cancel_url: 'https://app.afilo.io/pricing',
});
```

**Handle subscription changes:**
```typescript
import { stripeSubscriptionsService } from '@/lib/billing/stripe-subscriptions';

await stripeSubscriptionsService.changePlan(
  customerId,
  newPriceId,
  { prorate: true }
);
```

## Core Services

**Adaptive Checkout**: See [adaptive-checkout.md](adaptive-checkout.md) for intelligent payment optimization
**Subscription Management**: See [subscriptions.md](subscriptions.md) for billing workflows
**Payment Methods**: See [payment-methods.md](payment-methods.md) for method optimization
**Webhooks**: See [webhooks.md](webhooks.md) for event handling

## Workflow Patterns

### Payment Flow Validation

Always validate payment flows with this checklist:

```
Payment Flow Checklist:
- [ ] Step 1: Validate price and customer data
- [ ] Step 2: Create checkout session with adaptive settings
- [ ] Step 3: Handle successful payment webhook
- [ ] Step 4: Update database with subscription/purchase
- [ ] Step 5: Send confirmation email and grant access
```

### Error Handling Pattern

```typescript
try {
  // Payment operation
} catch (error) {
  if (error.code === 'card_declined') {
    // Handle card decline - suggest alternative payment method
  } else if (error.code === 'insufficient_funds') {
    // Handle insufficient funds - offer payment plan
  } else {
    // Log unknown error and fallback gracefully
  }
}
```

## Database Integration

**Products sync with Stripe:**
- Local products table stores all product data
- `stripe_product_id` and `stripe_price_id` link to Stripe
- Use `/api/products/sync-stripe` to sync changes

**Subscriptions tracking:**
- `user_subscriptions` table tracks local state
- Always verify with Stripe API for critical operations
- Handle webhook delays with eventual consistency

## Security Requirements

- **Never store card data** - use Stripe's secure vaults
- **Validate webhooks** with signature verification
- **Check subscription status** before granting access
- **Use HTTPS** for all payment-related pages
- **Sanitize inputs** before Stripe API calls

## Common Patterns

### Subscription Status Check
```typescript
const subscription = await stripe.subscriptions.retrieve(subscriptionId);
const isActive = ['active', 'trialing'].includes(subscription.status);
```

### Price Localization
```typescript
const localizedPrice = adaptiveCheckoutService.calculateLocalizedPrice(
  basePriceCents,
  'USD',
  detectedCurrency
);
```

### Payment Method Optimization
```typescript
const optimalMethods = await adaptiveCheckoutService.getOptimalPaymentMethods({
  country: 'US',
  currency: 'USD',
  transaction_amount: 2999
});
```