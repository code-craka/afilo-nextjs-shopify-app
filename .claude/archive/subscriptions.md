# Subscription Management

Comprehensive Stripe subscription lifecycle management for digital marketplace.

## Core Operations

### Create Subscription
```typescript
const subscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: priceId }],
  payment_behavior: 'default_incomplete',
  expand: ['latest_invoice.payment_intent'],
});
```

### Subscription Status Monitoring
```typescript
const isActive = ['active', 'trialing'].includes(subscription.status);
const needsAttention = ['past_due', 'unpaid'].includes(subscription.status);
const isEnding = subscription.cancel_at_period_end;
```

## Billing Workflows

### Plan Changes
```typescript
// Upgrade/downgrade with proration
await stripe.subscriptions.update(subscriptionId, {
  items: [{ id: subscriptionItemId, price: newPriceId }],
  proration_behavior: 'create_prorations',
});
```

### Trial Management
- 14-day trials for enterprise plans
- Automatic conversion to paid plans
- Trial extension for qualified customers
- Usage tracking during trials

### Billing Cycles
- Monthly and annual billing options
- Prorated upgrades/downgrades
- Invoice generation and delivery
- Failed payment recovery

## Integration Points

**API Routes**: `/api/billing/subscriptions/`
**Database**: `user_subscriptions` table
**Webhooks**: Subscription event handling
**Customer Portal**: Stripe-hosted management