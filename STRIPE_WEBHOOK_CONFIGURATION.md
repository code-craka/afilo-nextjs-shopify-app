# Stripe Webhook Configuration Guide

## Required Webhook Events (16 Events)

Configure these exact events in your Stripe Dashboard:

### 1. Checkout Events (3 events)
```
✅ checkout.session.completed
✅ checkout.session.async_payment_succeeded
✅ checkout.session.async_payment_failed
```

**Purpose**: Handle subscription checkout completion and ACH payments

### 2. Customer Subscription Events (6 events)
```
✅ customer.subscription.created
✅ customer.subscription.updated
✅ customer.subscription.deleted
✅ customer.subscription.trial_will_end (optional - no trials)
✅ customer.subscription.paused
✅ customer.subscription.resumed
```

**Purpose**: Track subscription lifecycle (create, update, cancel, pause, resume)

### 3. Invoice Events (5 events)
```
✅ invoice.paid
✅ invoice.payment_failed
✅ invoice.payment_action_required
✅ invoice.upcoming
✅ invoice.finalized
```

**Purpose**: Handle recurring payments, failed payments, renewal reminders

### 4. Payment Intent Events (2 events)
```
✅ payment_intent.succeeded
✅ payment_intent.payment_failed
```

**Purpose**: Handle one-time payments (for digital products)

---

## Webhook Configuration Steps

### Step 1: Access Stripe Dashboard

1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint" button

### Step 2: Configure Endpoint

**Endpoint URL:**
```
https://app.afilo.io/api/stripe/webhook
```

**Events to send:**
- Select "Select events" option
- Search and select all 16 events listed above

**Description (optional):**
```
Afilo Enterprise - Subscription & Payment Webhooks
```

### Step 3: Copy Webhook Secret

After creating the endpoint:

1. Click on the newly created endpoint
2. Click "Reveal" in the "Signing secret" section
3. Copy the secret (starts with `whsec_...`)
4. Add to `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 4: Test Webhook

1. Click "Send test webhook" in Stripe Dashboard
2. Select `checkout.session.completed` event
3. Click "Send test webhook"
4. Verify in your application logs that the event was received

---

## Current Webhook Handler Status

✅ **API Route**: `/app/api/stripe/webhook/route.ts`
✅ **Events Handled**: 16 events
✅ **Signature Verification**: Enabled
✅ **Error Logging**: Complete
✅ **Credential Generation**: Automated (on subscription success)
✅ **Email Delivery**: Resend integration

---

## Event Flow Diagrams

### Subscription Checkout Flow
```
Customer                  Stripe                   Your App
   |                        |                         |
   |---Select Plan--------->|                         |
   |<--Checkout Session-----|                         |
   |---Enter Payment------->|                         |
   |                        |---checkout.session.--->|
   |                        |   completed             |
   |                        |                         |---Generate Credentials
   |                        |                         |---Send Welcome Email
   |<--Redirect Success-----|                         |
```

### Recurring Payment Flow
```
Stripe                              Your App
   |                                   |
   |---7 days before renewal---------->|
   |   (invoice.upcoming)               |---Send Renewal Reminder Email
   |                                   |
   |---Payment successful------------->|
   |   (invoice.paid)                   |---Update Subscription Status
   |                                   |---Send Receipt Email
```

### Failed Payment Flow
```
Stripe                              Your App
   |                                   |
   |---Payment failed----------------->|
   |   (invoice.payment_failed)         |---Send Payment Failed Email
   |                                   |---Mark Subscription At Risk
   |                                   |
   |---3DS Required------------------->|
   |   (invoice.payment_action_req)     |---Send Action Required Email
   |                                   |---Provide Payment Link
```

---

## Webhook Event Details

### checkout.session.completed
**Trigger**: Customer completes checkout (card or ACH)
**Actions**:
- Generate username, password, account ID
- Send welcome email with credentials
- Create user profile in database

### checkout.session.async_payment_succeeded
**Trigger**: ACH payment verified (3-5 days later)
**Actions**:
- Activate subscription
- Send access granted email

### invoice.paid
**Trigger**: Recurring payment succeeded
**Actions**:
- Extend subscription period
- Send receipt email

### invoice.payment_failed
**Trigger**: Recurring payment failed
**Actions**:
- Send payment failed notification
- Mark account for review
- Provide retry payment link

### customer.subscription.deleted
**Trigger**: Subscription canceled
**Actions**:
- Send cancellation confirmation email
- Schedule data deletion (30 days)
- Disable account access

---

## Testing Webhooks Locally

### Option 1: Stripe CLI (Recommended)
```bash
# Forward webhooks to localhost
stripe listen --forward-to localhost:3000/api/stripe/webhook

# In another terminal, trigger test events
stripe trigger checkout.session.completed
stripe trigger invoice.paid
stripe trigger customer.subscription.deleted
```

### Option 2: ngrok + Stripe Dashboard
```bash
# Expose localhost to internet
ngrok http 3000

# Use ngrok URL in Stripe Dashboard
https://xxxx-xx-xx-xxx.ngrok.io/api/stripe/webhook
```

---

## Security Best Practices

✅ **Signature Verification**: Always verify webhook signatures
✅ **Idempotency**: Handle duplicate events gracefully
✅ **Environment Isolation**: Use separate webhooks for test/live mode
✅ **Secret Rotation**: Rotate webhook secrets periodically
✅ **Error Monitoring**: Log all webhook errors to Sentry

---

## Troubleshooting

### Webhook Not Receiving Events
1. Check endpoint URL is correct (https://app.afilo.io/api/stripe/webhook)
2. Verify webhook secret in .env.local
3. Check Stripe Dashboard → Webhooks → Event logs
4. Ensure API route is not rate-limited

### Signature Verification Failing
```typescript
// Check your webhook secret
console.log('STRIPE_WEBHOOK_SECRET:', process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 10));

// Verify raw body is being used
const signature = headers.get('stripe-signature');
const rawBody = await request.text();
```

### Events Not Processing
1. Check application logs for errors
2. Verify event type is handled in switch statement
3. Test with Stripe CLI: `stripe trigger <event_type>`
4. Check database for failed transactions

---

## Production Checklist

- [ ] Webhook endpoint configured in Stripe Dashboard
- [ ] All 16 events selected
- [ ] STRIPE_WEBHOOK_SECRET added to production environment
- [ ] RESEND_API_KEY configured for email delivery
- [ ] Tested all critical flows (signup, renewal, cancellation)
- [ ] Monitoring enabled (Sentry error tracking)
- [ ] Email templates tested and working
- [ ] Database triggers configured for cleanup

---

## Webhook Event Reference

Full list of available Stripe events:
https://stripe.com/docs/api/events/types

Current implementation handles:
- ✅ Subscriptions (create, update, cancel)
- ✅ Payments (card, ACH)
- ✅ Invoices (paid, failed, upcoming)
- ✅ Checkouts (completed, async payments)
- ❌ Refunds (not yet implemented)
- ❌ Disputes (not yet implemented)
- ❌ Customer updates (partial implementation)

---

## Support

For issues with webhooks:
1. Check Stripe Dashboard → Developers → Webhooks → Event logs
2. Review application logs in Vercel/Railway
3. Test locally with Stripe CLI
4. Contact Stripe support if signature verification fails

Last updated: 2025-01-05
Version: 1.0
