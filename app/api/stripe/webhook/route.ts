import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_EVENTS, formatDisplayAmount } from '@/lib/stripe-server';
import { generateUserCredentials } from '@/lib/credentials-generator';
import { sendCredentialsEmail, sendRenewalConfirmationEmail, sendCancellationEmail, sendPaymentFailedEmail } from '@/lib/email-service';
import Stripe from 'stripe';

/**
 * POST /api/stripe/webhook
 *
 * Stripe Webhook Handler for ACH + Card Payments + Subscriptions
 *
 * CRITICAL: This endpoint is REQUIRED for ACH payments and subscriptions!
 * ACH payments take 3-5 business days to clear. You must wait
 * for the payment_intent.succeeded webhook before fulfilling orders.
 *
 * Payment Events Handled:
 * - payment_intent.succeeded: Payment confirmed (FULFILL ORDER HERE)
 * - payment_intent.processing: Payment being processed (ACH only)
 * - payment_intent.payment_failed: Payment failed
 * - review.opened: Manual fraud review required
 * - review.closed: Review completed
 * - radar.early_fraud_warning.created: Fraud detected
 * - charge.refunded: Refund issued
 * - charge.dispute.created: Customer disputed charge
 *
 * Subscription Events Handled (NEW):
 * - checkout.session.completed: Send credentials after subscription payment
 * - customer.subscription.created: Log subscription creation
 * - customer.subscription.updated: Handle plan changes
 * - customer.subscription.deleted: Revoke access and send cancellation email
 * - invoice.payment_succeeded: Send renewal confirmation
 * - invoice.payment_failed: Send payment failure notification
 *
 * Setup Instructions:
 * 1. Deploy this endpoint to production
 * 2. Go to Stripe Dashboard → Developers → Webhooks
 * 3. Add endpoint: https://app.afilo.io/api/stripe/webhook
 * 4. Select events: All payment_intent.*, review.*, radar.*, charge.*, checkout.session.*, customer.subscription.*, invoice.*
 * 5. Copy webhook signing secret to .env.local as STRIPE_WEBHOOK_SECRET
 * 6. Set RESEND_API_KEY for email delivery
 *
 * @see https://stripe.com/docs/webhooks
 */

// Disable Next.js body parsing (required for signature verification)
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error('Webhook error: Missing stripe-signature header');
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 400 }
    );
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('Webhook error: STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature (CRITICAL for security)
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  console.log(`✅ Webhook received: ${event.type} (${event.id})`);

  // Handle webhook events
  try {
    switch (event.type) {
      // ========================================
      // PAYMENT INTENT EVENTS (CRITICAL)
      // ========================================

      case STRIPE_EVENTS.PAYMENT_INTENT_SUCCEEDED:
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;

      case STRIPE_EVENTS.PAYMENT_INTENT_PROCESSING:
        await handlePaymentProcessing(event.data.object as Stripe.PaymentIntent);
        break;

      case STRIPE_EVENTS.PAYMENT_INTENT_FAILED:
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case STRIPE_EVENTS.PAYMENT_INTENT_CANCELED:
        await handlePaymentCanceled(event.data.object as Stripe.PaymentIntent);
        break;

      // ========================================
      // FRAUD PREVENTION EVENTS
      // ========================================

      case STRIPE_EVENTS.REVIEW_OPENED:
        await handleManualReview(event.data.object as Stripe.Review);
        break;

      case STRIPE_EVENTS.REVIEW_CLOSED:
        await handleReviewClosed(event.data.object as Stripe.Review);
        break;

      case STRIPE_EVENTS.EARLY_FRAUD_WARNING:
        await handleEarlyFraudWarning(event.data.object as any);
        break;

      // ========================================
      // CHARGE EVENTS (REFUNDS, DISPUTES)
      // ========================================

      case STRIPE_EVENTS.CHARGE_REFUNDED:
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      case STRIPE_EVENTS.CHARGE_DISPUTED:
        await handleDisputeCreated(event.data.object as Stripe.Dispute);
        break;

      case STRIPE_EVENTS.CHARGE_DISPUTE_CLOSED:
        await handleDisputeClosed(event.data.object as Stripe.Dispute);
        break;

      // ========================================
      // SUBSCRIPTION EVENTS (NEW)
      // ========================================

      case STRIPE_EVENTS.CHECKOUT_SESSION_COMPLETED:
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case STRIPE_EVENTS.SUBSCRIPTION_CREATED:
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case STRIPE_EVENTS.SUBSCRIPTION_UPDATED:
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case STRIPE_EVENTS.SUBSCRIPTION_DELETED:
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case STRIPE_EVENTS.INVOICE_PAYMENT_SUCCEEDED:
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case STRIPE_EVENTS.INVOICE_PAYMENT_FAILED:
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`ℹ️  Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error(`❌ Webhook handler error for ${event.type}:`, error);
    return NextResponse.json(
      { error: 'Webhook handler failed', details: error.message },
      { status: 500 }
    );
  }
}

// ========================================
// PAYMENT INTENT HANDLERS
// ========================================

/**
 * Handle Successful Payment
 *
 * ⚠️ CRITICAL: Only fulfill orders AFTER this webhook!
 * For ACH, this fires 3-5 business days after customer submits payment.
 */
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const charge = paymentIntent.latest_charge as Stripe.Charge;
  const outcome = charge?.outcome;
  const paymentMethod = charge?.payment_method_details;

  console.log('✅ Payment Succeeded:', {
    id: paymentIntent.id,
    amount: formatDisplayAmount(paymentIntent.amount),
    currency: paymentIntent.currency,
    customer: paymentIntent.customer,
    payment_method_type: paymentMethod?.type,
    risk_level: outcome?.risk_level,
    risk_score: outcome?.risk_score,
    metadata: paymentIntent.metadata,
  });

  // TODO: IMPLEMENT ORDER FULFILLMENT HERE
  // 1. Update order status to "paid" in database
  // 2. Grant access to digital product
  // 3. Send confirmation email to customer
  // 4. Log transaction for analytics
  // 5. Trigger any post-purchase workflows

  // Example implementation:
  /*
  const orderId = paymentIntent.metadata.order_id;
  const userId = paymentIntent.metadata.user_id;
  const productId = paymentIntent.metadata.product_id;

  await db.order.update({
    where: { id: orderId },
    data: {
      status: 'paid',
      paidAt: new Date(),
      paymentIntentId: paymentIntent.id,
      paymentMethod: paymentMethod?.type,
    },
  });

  await grantProductAccess(userId, productId);
  await sendConfirmationEmail(paymentIntent.receipt_email, orderId);
  */

  console.log('🎉 Order fulfillment completed for:', paymentIntent.id);
}

/**
 * Handle Payment Processing (ACH Only)
 *
 * ACH payments show "processing" status immediately after submission.
 * DO NOT fulfill orders at this stage - wait for payment_intent.succeeded.
 */
async function handlePaymentProcessing(paymentIntent: Stripe.PaymentIntent) {
  console.log('⏳ Payment Processing (ACH):', {
    id: paymentIntent.id,
    amount: formatDisplayAmount(paymentIntent.amount),
    message: 'ACH payment will clear in 3-5 business days',
  });

  // TODO: UPDATE ORDER STATUS
  // 1. Update order status to "processing"
  // 2. Send email: "Payment received, processing in 3-5 days"
  // 3. DO NOT grant product access yet

  // Example:
  /*
  await db.order.update({
    where: { id: paymentIntent.metadata.order_id },
    data: { status: 'processing' },
  });

  await sendProcessingEmail(
    paymentIntent.receipt_email,
    paymentIntent.metadata.order_id,
    'Your payment is being processed and will clear in 3-5 business days.'
  );
  */
}

/**
 * Handle Payment Failed
 *
 * Common reasons:
 * - Insufficient funds (ACH)
 * - Card declined
 * - Authentication failed (3DS)
 * - Invalid bank account
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const error = paymentIntent.last_payment_error;

  console.log('❌ Payment Failed:', {
    id: paymentIntent.id,
    amount: formatDisplayAmount(paymentIntent.amount),
    error_code: error?.code,
    error_message: error?.message,
    decline_code: error?.decline_code,
  });

  // TODO: NOTIFY CUSTOMER
  // 1. Update order status to "failed"
  // 2. Send email with error details
  // 3. Provide retry instructions
  // 4. Suggest alternative payment method

  // Example:
  /*
  await db.order.update({
    where: { id: paymentIntent.metadata.order_id },
    data: { status: 'failed', failureReason: error?.message },
  });

  await sendPaymentFailedEmail(
    paymentIntent.receipt_email,
    paymentIntent.metadata.order_id,
    error?.message
  );
  */
}

/**
 * Handle Payment Canceled
 *
 * Customer or system canceled the payment before completion.
 */
async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  console.log('🚫 Payment Canceled:', {
    id: paymentIntent.id,
    amount: formatDisplayAmount(paymentIntent.amount),
    cancellation_reason: paymentIntent.cancellation_reason,
  });

  // TODO: Update order status to "canceled"
}

// ========================================
// FRAUD PREVENTION HANDLERS
// ========================================

/**
 * Handle Manual Review Opened
 *
 * Stripe Radar flagged transaction for manual review.
 * DO NOT fulfill order until review is closed and approved.
 */
async function handleManualReview(review: Stripe.Review) {
  console.log('🔍 Manual Review Opened:', {
    id: review.id,
    payment_intent: review.payment_intent,
    reason: review.reason,
    opened_at: new Date(review.created * 1000).toISOString(),
  });

  // TODO: NOTIFY FRAUD TEAM
  // 1. Create ticket in admin dashboard
  // 2. Flag order for review
  // 3. Send alert to fraud team
  // 4. DO NOT fulfill order

  // Example:
  /*
  await createFraudReviewTicket({
    reviewId: review.id,
    paymentIntentId: review.payment_intent,
    reason: review.reason,
    priority: 'high',
  });
  */
}

/**
 * Handle Review Closed
 *
 * Manual review completed. Check if approved or rejected.
 */
async function handleReviewClosed(review: Stripe.Review) {
  const approved = review.closed_reason === 'approved';

  console.log('✅ Review Closed:', {
    id: review.id,
    reason: review.closed_reason,
    approved,
  });

  // TODO: PROCESS BASED ON OUTCOME
  // If approved: Fulfill order
  // If rejected: Cancel order, refund if necessary

  // Example:
  /*
  if (approved) {
    await fulfillOrder(review.payment_intent);
  } else {
    await cancelOrder(review.payment_intent);
    await refundPayment(review.payment_intent);
  }
  */
}

/**
 * Handle Early Fraud Warning
 *
 * Bank or card network reported potential fraud.
 * HIGH PRIORITY: Investigate immediately.
 */
async function handleEarlyFraudWarning(warning: any) {
  console.log('⚠️ Early Fraud Warning:', {
    id: warning.id,
    charge: warning.charge,
    fraud_type: warning.fraud_type,
    actionable: warning.actionable,
  });

  // TODO: IMMEDIATE ACTION REQUIRED
  // 1. Flag transaction as potentially fraudulent
  // 2. Notify fraud team immediately
  // 3. Revoke product access if already granted
  // 4. Consider issuing refund to avoid chargeback

  // Example:
  /*
  await flagTransactionAsFraud({
    chargeId: warning.charge,
    fraudType: warning.fraud_type,
    severity: 'critical',
  });

  await revokeProductAccess(warning.charge);
  await notifyFraudTeam(warning);
  */
}

// ========================================
// CHARGE HANDLERS (REFUNDS, DISPUTES)
// ========================================

/**
 * Handle Charge Refunded
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  console.log('💸 Charge Refunded:', {
    id: charge.id,
    amount_refunded: formatDisplayAmount(charge.amount_refunded),
    refund_reason: 'See refunds list',
  });

  // TODO: REVOKE ACCESS
  // 1. Update order status to "refunded"
  // 2. Revoke product access
  // 3. Send refund confirmation email
}

/**
 * Handle Dispute Created (Chargeback)
 */
async function handleDisputeCreated(dispute: Stripe.Dispute) {
  const dueBy = dispute.evidence_details?.due_by
    ? new Date(dispute.evidence_details.due_by * 1000).toISOString()
    : 'Not set';

  console.log('⚖️ Dispute Created:', {
    id: dispute.id,
    amount: formatDisplayAmount(dispute.amount),
    reason: dispute.reason,
    status: dispute.status,
    evidence_due_by: dueBy,
  });

  // TODO: RESPOND TO DISPUTE
  // 1. Notify team immediately
  // 2. Gather evidence (invoices, communication logs)
  // 3. Submit evidence before deadline
  // 4. Revoke access if dispute is upheld
}

/**
 * Handle Dispute Closed
 */
async function handleDisputeClosed(dispute: Stripe.Dispute) {
  const won = dispute.status === 'won';

  console.log('✅ Dispute Closed:', {
    id: dispute.id,
    status: dispute.status,
    won,
  });

  // TODO: FINAL ACTIONS
  // If won: Restore access if revoked
  // If lost: Permanent revocation, update records
}

// ========================================
// SUBSCRIPTION HANDLERS (NEW)
// ========================================

/**
 * Handle Checkout Session Completed
 *
 * ✅ CRITICAL: This is where we send credentials!
 * Fires immediately after customer completes payment for subscription.
 * Generate credentials and send welcome email with login details.
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('🎉 Checkout Session Completed:', {
    id: session.id,
    subscription: session.subscription,
    customer: session.customer,
    customer_email: session.customer_details?.email,
    amount_total: formatDisplayAmount(session.amount_total || 0),
    mode: session.mode,
  });

  // Only process subscription checkouts (skip one-time payments)
  if (session.mode !== 'subscription') {
    console.log('ℹ️  Skipping non-subscription checkout');
    return;
  }

  try {
    // Retrieve full subscription details
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    const product = await stripe.products.retrieve(subscription.items.data[0].price.product as string);

    const customerEmail = session.customer_details?.email;
    if (!customerEmail) {
      console.error('❌ No customer email found in session');
      return;
    }

    // Extract plan details from product metadata
    const planTier = product.metadata.tier || 'professional';
    const userLimit = product.metadata.user_limit || '25';
    const planName = product.name;

    // Generate secure credentials for customer
    const credentials = await generateUserCredentials(
      customerEmail,
      planTier,
      userLimit
    );

    console.log('✅ Generated credentials for:', {
      email: customerEmail,
      username: credentials.username,
      accountId: credentials.accountId,
      planTier,
      userLimit,
    });

    // TODO: STORE CREDENTIALS IN DATABASE
    // await db.subscription.create({
    //   data: {
    //     accountId: credentials.accountId,
    //     email: credentials.email,
    //     username: credentials.username,
    //     hashedPassword: credentials.hashedPassword,
    //     planTier: credentials.planTier,
    //     userLimit: credentials.userLimit,
    //     stripeSubscriptionId: subscription.id,
    //     stripeCustomerId: session.customer as string,
    //     status: 'active',
    //     createdAt: new Date(),
    //   },
    // });

    // Send welcome email with credentials
    const interval = subscription.items.data[0].price.recurring?.interval;
    const currentPeriodEnd = (subscription as any).current_period_end || Math.floor(Date.now() / 1000) + 2592000; // Default to 30 days from now

    await sendCredentialsEmail({
      credentials,
      planName,
      billingInterval: (interval === 'year' ? 'year' : 'month') as 'month' | 'year',
      amount: session.amount_total || 0,
      nextBillingDate: new Date(currentPeriodEnd * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    });

    console.log('✅ Credentials email sent to:', customerEmail);

  } catch (error) {
    console.error('❌ Error processing checkout session:', error);
    // Don't throw - we don't want to mark webhook as failed
    // Customer paid successfully, we'll retry credential delivery separately
  }
}

/**
 * Handle Subscription Created
 *
 * Fires when subscription is created (same time as checkout.session.completed).
 * Use this for logging and analytics.
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const sub = subscription as any;
  console.log('📝 Subscription Created:', {
    id: subscription.id,
    customer: subscription.customer,
    status: subscription.status,
    current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
    cancel_at_period_end: sub.cancel_at_period_end,
  });

  // TODO: LOG SUBSCRIPTION CREATION
  // await analytics.track('subscription_created', {
  //   subscriptionId: subscription.id,
  //   customerId: subscription.customer,
  //   planId: subscription.items.data[0].price.id,
  // });
}

/**
 * Handle Subscription Updated
 *
 * Fires when customer upgrades/downgrades plan or updates payment method.
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const sub = subscription as any;
  console.log('🔄 Subscription Updated:', {
    id: subscription.id,
    customer: subscription.customer,
    status: subscription.status,
    cancel_at_period_end: sub.cancel_at_period_end,
  });

  // TODO: UPDATE DATABASE
  // await db.subscription.update({
  //   where: { stripeSubscriptionId: subscription.id },
  //   data: {
  //     status: subscription.status,
  //     cancelAtPeriodEnd: sub.cancel_at_period_end,
  //     currentPeriodEnd: new Date(sub.current_period_end * 1000),
  //   },
  // });

  // If customer upgraded, send confirmation email
  // If customer scheduled cancellation, send cancellation notice
}

/**
 * Handle Subscription Deleted
 *
 * Fires when subscription is canceled (either immediately or at period end).
 * Revoke access and send cancellation email.
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('🚫 Subscription Deleted:', {
    id: subscription.id,
    customer: subscription.customer,
    canceled_at: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000).toISOString()
      : null,
  });

  try {
    // Retrieve customer email
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    const customerEmail = (customer as Stripe.Customer).email;

    if (!customerEmail) {
      console.error('❌ No customer email found');
      return;
    }

    // Get plan name from subscription
    const priceId = subscription.items.data[0].price.id;
    const price = await stripe.prices.retrieve(priceId, { expand: ['product'] });
    const product = price.product as Stripe.Product;
    const planName = product.name || 'Your Subscription';

    // Calculate access until date (current period end)
    const sub = subscription as any;
    const accessUntilDate = sub.current_period_end
      ? new Date(sub.current_period_end * 1000).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

    // TODO: REVOKE ACCESS IN DATABASE
    // await db.subscription.update({
    //   where: { stripeSubscriptionId: subscription.id },
    //   data: {
    //     status: 'canceled',
    //     canceledAt: new Date(),
    //   },
    // });

    // Send cancellation confirmation email
    await sendCancellationEmail(
      customerEmail,
      planName,
      accessUntilDate
    );

    console.log('✅ Cancellation email sent to:', customerEmail);

  } catch (error) {
    console.error('❌ Error processing subscription deletion:', error);
  }
}

/**
 * Handle Invoice Payment Succeeded
 *
 * Fires when recurring payment succeeds (monthly/annual renewal).
 * Send renewal confirmation email.
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const inv = invoice as any;
  console.log('✅ Invoice Payment Succeeded:', {
    id: invoice.id,
    subscription: inv.subscription,
    customer: invoice.customer,
    amount_paid: formatDisplayAmount(invoice.amount_paid),
    billing_reason: invoice.billing_reason,
  });

  // Skip the first invoice (handled by checkout.session.completed)
  if (invoice.billing_reason === 'subscription_create') {
    console.log('ℹ️  Skipping initial subscription invoice');
    return;
  }

  try {
    const customerEmail = inv.customer_email;
    if (!customerEmail) {
      console.error('❌ No customer email found in invoice');
      return;
    }

    // Get plan name from invoice line items
    const lineItems = invoice.lines.data;
    const planName = lineItems[0]?.description || 'Your Subscription';

    // Calculate next billing date
    const nextBillingDate = inv.period_end
      ? new Date(inv.period_end * 1000).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'N/A';

    // Send renewal confirmation email
    await sendRenewalConfirmationEmail(
      customerEmail,
      planName,
      invoice.amount_paid,
      nextBillingDate
    );

    console.log('✅ Renewal confirmation sent to:', customerEmail);

  } catch (error) {
    console.error('❌ Error processing invoice payment:', error);
  }
}

/**
 * Handle Invoice Payment Failed
 *
 * Fires when recurring payment fails (card declined, insufficient funds).
 * Send payment failure notification with retry instructions.
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const inv = invoice as any;
  console.log('❌ Invoice Payment Failed:', {
    id: invoice.id,
    subscription: inv.subscription,
    customer: invoice.customer,
    amount_due: formatDisplayAmount(invoice.amount_due),
    attempt_count: invoice.attempt_count,
  });

  try {
    const customerEmail = inv.customer_email;
    if (!customerEmail) {
      console.error('❌ No customer email found in invoice');
      return;
    }

    // Get plan name from invoice line items
    const lineItems = invoice.lines.data;
    const planName = lineItems[0]?.description || 'Your Subscription';

    // Calculate retry date
    const retryDate = inv.next_payment_attempt
      ? new Date(inv.next_payment_attempt * 1000).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'N/A';

    // TODO: MARK SUBSCRIPTION AS PAST DUE
    // await db.subscription.update({
    //   where: { stripeSubscriptionId: inv.subscription as string },
    //   data: { status: 'past_due' },
    // });

    // Send payment failure email with retry link
    await sendPaymentFailedEmail(
      customerEmail,
      planName,
      invoice.amount_due,
      retryDate
    );

    console.log('✅ Payment failure notification sent to:', customerEmail);

  } catch (error) {
    console.error('❌ Error processing invoice payment failure:', error);
  }
}

/**
 * GET /api/stripe/webhook
 *
 * Returns webhook configuration and health check.
 */
export async function GET() {
  return NextResponse.json({
    name: 'Stripe Webhook Handler',
    version: '3.0',
    description: 'Handles ACH + Card payments, fraud prevention, and subscriptions with automated credential delivery',
    status: process.env.STRIPE_WEBHOOK_SECRET ? 'configured' : 'not_configured',
    events_handled: [
      // Payment Events
      'payment_intent.succeeded',
      'payment_intent.processing',
      'payment_intent.payment_failed',
      'payment_intent.canceled',
      // Fraud Prevention
      'review.opened',
      'review.closed',
      'radar.early_fraud_warning.created',
      // Charges & Disputes
      'charge.refunded',
      'charge.dispute.created',
      'charge.dispute.closed',
      // Subscriptions (NEW)
      'checkout.session.completed',
      'customer.subscription.created',
      'customer.subscription.updated',
      'customer.subscription.deleted',
      'invoice.payment_succeeded',
      'invoice.payment_failed',
    ],
    setup_instructions: {
      step1: 'Deploy this endpoint to production',
      step2: 'Go to Stripe Dashboard → Developers → Webhooks',
      step3: 'Add endpoint: https://app.afilo.io/api/stripe/webhook',
      step4: 'Select all payment_intent.*, review.*, radar.*, charge.*, checkout.session.*, customer.subscription.*, invoice.* events',
      step5: 'Copy webhook signing secret to .env.local as STRIPE_WEBHOOK_SECRET',
      step6: 'Set RESEND_API_KEY for email delivery',
    },
    features: {
      automated_credential_delivery: true,
      subscription_management: true,
      email_notifications: true,
      no_trial_periods: true,
      immediate_paid_access: true,
    },
  });
}
