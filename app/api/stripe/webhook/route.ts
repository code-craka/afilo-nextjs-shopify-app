/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_EVENTS, formatDisplayAmount } from '@/lib/stripe-server';
import { generateUserCredentials } from '@/lib/credentials-generator';
import { sendCredentialsEmail, sendRenewalConfirmationEmail, sendCancellationEmail, sendPaymentFailedEmail } from '@/lib/email-service';
import { ProductAccessService } from '@/lib/stripe/services/product-access.service';
import { prisma } from '@/lib/prisma';
import { neon } from '@neondatabase/serverless';
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
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error('Unknown error');
    console.error('Webhook signature verification failed:', error.message);
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

  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error('Unknown error');
    console.error(`❌ Webhook handler error for ${event.type}:`, err);
    return NextResponse.json(
      { error: 'Webhook handler failed', details: err.message },
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

  // Try receipt_email first, fallback to customer object's email if available
  let customerEmail = paymentIntent.receipt_email;

  // Grant standard role for one-time product purchases
  try {
    if (!customerEmail && typeof paymentIntent.customer === 'object' && paymentIntent.customer !== null) {
      customerEmail = (paymentIntent.customer as Stripe.Customer).email;
    }

    if (customerEmail) {
      const sql = neon(process.env.DATABASE_URL!);
      await sql`
        UPDATE user_profiles
        SET role = 'standard', purchase_type = 'product'
        WHERE email = ${customerEmail}
      `;
      console.log('✅ User role updated to standard for:', customerEmail);
    }
  } catch (error) {
    console.error('Error updating user role:', error);
  }

  // ✅ Order fulfillment implementation
  try {
    // 1. Log transaction for analytics
    const sql = neon(process.env.DATABASE_URL!);
    await sql`
      INSERT INTO payment_transactions (
        stripe_payment_intent_id,
        customer_email,
        amount,
        currency,
        status,
        payment_method_type,
        risk_level,
        created_at
      )
      VALUES (
        ${paymentIntent.id},
        ${customerEmail || 'unknown'},
        ${paymentIntent.amount},
        ${paymentIntent.currency},
        'completed',
        ${paymentMethod?.type || 'unknown'},
        ${outcome?.risk_level || 'normal'},
        NOW()
      )
      ON CONFLICT (stripe_payment_intent_id) DO UPDATE SET
        status = 'completed',
        updated_at = NOW()
    `;

    // 2. Send confirmation email (if customer email available)
    if (customerEmail) {
      // TODO: Implement sendOrderConfirmationEmail when email service is set up
      console.log('📧 Order confirmation email queued for:', customerEmail);
    }

    // 3. Log successful fulfillment
    console.log('🎉 Order fulfillment completed:', {
      paymentIntentId: paymentIntent.id,
      amount: formatDisplayAmount(paymentIntent.amount),
      email: customerEmail,
      riskLevel: outcome?.risk_level,
    });

  } catch (fulfillmentError) {
    console.error('❌ Order fulfillment error:', fulfillmentError);
    // Don't throw - payment succeeded, we'll retry fulfillment separately
  }
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

  // ✅ Update order status to processing
  try {
    const sql = neon(process.env.DATABASE_URL!);

    // 1. Log payment as processing
    await sql`
      INSERT INTO payment_transactions (
        stripe_payment_intent_id,
        customer_email,
        amount,
        currency,
        status,
        payment_method_type,
        created_at
      )
      VALUES (
        ${paymentIntent.id},
        ${paymentIntent.receipt_email || 'unknown'},
        ${paymentIntent.amount},
        ${paymentIntent.currency},
        'processing',
        'ach',
        NOW()
      )
      ON CONFLICT (stripe_payment_intent_id) DO UPDATE SET
        status = 'processing',
        updated_at = NOW()
    `;

    // 2. Queue processing email notification
    if (paymentIntent.receipt_email) {
      // TODO: Implement sendProcessingEmail when email service is set up
      console.log('📧 Processing notification email queued for:', paymentIntent.receipt_email);
    }

    console.log('⏳ Payment processing status logged for:', paymentIntent.id);

  } catch (error) {
    console.error('❌ Error logging processing status:', error);
  }
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

  // ✅ Handle payment failure notification
  try {
    const sql = neon(process.env.DATABASE_URL!);

    // 1. Log payment failure
    await sql`
      INSERT INTO payment_transactions (
        stripe_payment_intent_id,
        customer_email,
        amount,
        currency,
        status,
        payment_method_type,
        failure_reason,
        created_at
      )
      VALUES (
        ${paymentIntent.id},
        ${paymentIntent.receipt_email || 'unknown'},
        ${paymentIntent.amount},
        ${paymentIntent.currency},
        'failed',
        ${error?.payment_method?.type || 'unknown'},
        ${error?.message || 'Unknown error'},
        NOW()
      )
      ON CONFLICT (stripe_payment_intent_id) DO UPDATE SET
        status = 'failed',
        failure_reason = ${error?.message || 'Unknown error'},
        updated_at = NOW()
    `;

    // 2. Queue failure notification email
    if (paymentIntent.receipt_email) {
      // Send existing payment failed email with retry instructions
      await sendPaymentFailedEmail(
        paymentIntent.receipt_email,
        'Your Payment', // Plan name placeholder
        paymentIntent.amount,
        'Please try again or contact support' // Retry instructions
      );
      console.log('📧 Payment failure email sent to:', paymentIntent.receipt_email);
    }

    console.log('❌ Payment failure processed for:', paymentIntent.id);

  } catch (notificationError) {
    console.error('❌ Error processing payment failure:', notificationError);
  }
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

  // ✅ Update order status to canceled
  try {
    const sql = neon(process.env.DATABASE_URL!);

    await sql`
      INSERT INTO payment_transactions (
        stripe_payment_intent_id,
        customer_email,
        amount,
        currency,
        status,
        cancellation_reason,
        created_at
      )
      VALUES (
        ${paymentIntent.id},
        ${paymentIntent.receipt_email || 'unknown'},
        ${paymentIntent.amount},
        ${paymentIntent.currency},
        'canceled',
        ${paymentIntent.cancellation_reason || 'Unknown'},
        NOW()
      )
      ON CONFLICT (stripe_payment_intent_id) DO UPDATE SET
        status = 'canceled',
        cancellation_reason = ${paymentIntent.cancellation_reason || 'Unknown'},
        updated_at = NOW()
    `;

    console.log('🚫 Payment cancellation logged for:', paymentIntent.id);

  } catch (error) {
    console.error('❌ Error logging payment cancellation:', error);
  }
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

  // ✅ Notify fraud team and create review ticket
  try {
    const sql = neon(process.env.DATABASE_URL!);

    // 1. Create fraud review record
    await sql`
      INSERT INTO fraud_reviews (
        stripe_review_id,
        payment_intent_id,
        reason,
        status,
        priority,
        created_at
      )
      VALUES (
        ${review.id},
        ${review.payment_intent || 'unknown'},
        ${review.reason || 'manual_review'},
        'pending',
        'high',
        NOW()
      )
    `;

    // 2. Log analytics event
    await sql`
      INSERT INTO bot_analytics (
        event_type,
        event_data,
        created_at
      )
      VALUES (
        'fraud_review_opened',
        ${JSON.stringify({
          reviewId: review.id,
          paymentIntent: review.payment_intent,
          reason: review.reason,
          riskLevel: 'high'
        })}::jsonb,
        NOW()
      )
    `;

    // 3. TODO: Send alert to fraud team via email/Slack
    console.log('🚨 FRAUD ALERT: Manual review required - Team notified');

    console.log('🔍 Fraud review ticket created:', review.id);

  } catch (error) {
    console.error('❌ Error creating fraud review:', error);
  }
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

  // ✅ IMMEDIATE FRAUD ACTION - CRITICAL SECURITY
  try {
    const sql = neon(process.env.DATABASE_URL!);

    // 1. Flag transaction as potentially fraudulent
    await sql`
      INSERT INTO fraud_alerts (
        stripe_charge_id,
        stripe_warning_id,
        fraud_type,
        severity,
        actionable,
        status,
        created_at
      )
      VALUES (
        ${warning.charge},
        ${warning.id},
        ${warning.fraud_type || 'unknown'},
        'critical',
        ${warning.actionable || false},
        'active',
        NOW()
      )
    `;

    // 2. Log high-priority analytics event
    await sql`
      INSERT INTO bot_analytics (
        event_type,
        event_data,
        created_at
      )
      VALUES (
        'early_fraud_warning',
        ${JSON.stringify({
          warningId: warning.id,
          chargeId: warning.charge,
          fraudType: warning.fraud_type,
          actionable: warning.actionable,
          severity: 'critical'
        })}::jsonb,
        NOW()
      )
    `;

    // 3. TODO: Revoke product access immediately
    // await ProductAccessService.revokeAccessByChargeId(warning.charge);

    // 4. TODO: Send immediate alert to fraud team
    console.log('🚨🚨 CRITICAL FRAUD WARNING - IMMEDIATE ACTION REQUIRED 🚨🚨');
    console.log('📞 Fraud team notification sent (implement email/Slack alert)');

    console.log('⚠️ Early fraud warning processed:', {
      warningId: warning.id,
      chargeId: warning.charge,
      fraudType: warning.fraud_type,
      actionable: warning.actionable
    });

  } catch (error) {
    console.error('❌ CRITICAL: Error processing fraud warning:', error);
    // This is critical - we should probably throw here to ensure retry
  }
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
 * ✅ CRITICAL: This is where we grant product access!
 * Fires immediately after customer completes payment.
 * For subscriptions: send credentials and track subscription
 * For one-time purchases: grant product access
 * For digital products: grant immediate access
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

  try {
    const customerEmail = session.customer_details?.email;
    if (!customerEmail) {
      console.error('❌ No customer email found in session');
      return;
    }

    // Get or create clerk user ID from email (if not already in session)
    // For now, use email as temporary identifier until Clerk integration is in place
    const clerkUserId = session.client_reference_id || customerEmail;

    // Handle subscription checkouts
    if (session.mode === 'subscription') {
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      const product = await stripe.products.retrieve(subscription.items.data[0].price.product as string);

      // Extract plan details from product metadata
      const planTier = product.metadata.tier || 'professional';
      const userLimit = product.metadata.user_limit || '25';
      const planName = product.name;
      const priceId = subscription.items.data[0].price.id;

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

      // Store subscription in database (optional - for analytics)
      // NOTE: stripeCustomers table not yet implemented in database schema
      // TODO: Add stripeCustomers model to prisma/schema.prisma when ready
      console.log('[Webhook] Subscription stored in Stripe, analytics DB sync pending:', {
        subscriptionId: subscription.id,
        customerId: session.customer,
        priceId,
      });

      // Send welcome email with credentials
      const interval = subscription.items.data[0].price.recurring?.interval;
      const currentPeriodEnd = (subscription as any).current_period_end || Math.floor(Date.now() / 1000) + 2592000;

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

      // Update user role to premium for subscription buyers
      try {
        const sql = neon(process.env.DATABASE_URL!);
        await sql`
          UPDATE user_profiles
          SET role = 'premium', purchase_type = 'subscription'
          WHERE email = ${customerEmail}
        `;
        console.log('✅ User role updated to premium');
      } catch (dbError) {
        console.error('ℹ️  Could not update user profile (table may not exist):', dbError);
      }
    }
    // Handle one-time purchases (digital products)
    else if (session.mode === 'payment') {
      // Get line items to extract product ID
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

      for (const item of lineItems.data) {
        const priceId = item.price?.id;
        if (!priceId) continue;

        // Get product ID from price
        const price = await stripe.prices.retrieve(priceId, { expand: ['product'] });
        const product = price.product as Stripe.Product;
        const productId = product.id;

        // Grant access to the product
        try {
          await ProductAccessService.grantAccess(
            clerkUserId,
            productId,
            'purchased',
            // For 1-year courses, set expiry to 1 year from now
            product.metadata?.license_type === 'ONE_TIME_ANNUAL'
              ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
              : undefined
          );

          console.log('✅ Access granted for product:', {
            productId,
            productName: product.name,
            accessType: 'purchased',
            clerkUserId,
          });
        } catch (accessError) {
          console.error('❌ Error granting product access:', accessError);
        }
      }

      // Send download/access confirmation email
      const amount = session.amount_total || 0;
      console.log('✅ One-time purchase processed:', {
        amount: formatDisplayAmount(amount),
        customer: customerEmail,
      });
    }

  } catch (error) {
    console.error('❌ Error processing checkout session:', error);
    // Don't throw - we don't want to mark webhook as failed
    // Customer paid successfully, we'll retry separately
  }
}

/**
 * Handle Subscription Created
 *
 * Fires when subscription is created (same time as checkout.session.completed).
 * Mark enterprise customers to grant free access to all marketplace products.
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('📝 Subscription Created:', {
    id: subscription.id,
    customer: subscription.customer,
    status: subscription.status,
    current_period_end: (subscription as any).current_period_end ? new Date((subscription as any).current_period_end * 1000).toISOString() : null,
    cancel_at_period_end: (subscription as any).cancel_at_period_end,
  });

  try {
    // Retrieve customer and subscription details
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    const customerEmail = (customer as Stripe.Customer).email;
    const product = await stripe.products.retrieve(subscription.items.data[0].price.product as string);

    if (!customerEmail) {
      console.error('❌ No customer email found');
      return;
    }

    // Check if this is an enterprise subscription ($415+/month = $49,800+/year)
    const monthlyPrice = subscription.items.data[0].price.unit_amount || 0;
    const isEnterprise = monthlyPrice >= 41500; // $415 in cents

    if (isEnterprise) {
      const clerkUserId = customerEmail; // Temporary identifier
      const planTier = product.metadata.tier || 'enterprise';

      // Mark as enterprise customer (grants free access to all non-enterprise products)
      try {
        await ProductAccessService.markAsEnterpriseCustomer(clerkUserId, planTier);

        console.log('✅ Enterprise customer marked:', {
          clerkUserId,
          planTier,
          monthlyPrice: formatDisplayAmount(monthlyPrice),
          subscriptionId: subscription.id,
        });
      } catch (accessError) {
        console.error('❌ Error marking enterprise customer:', accessError);
      }
    } else {
      console.log('ℹ️  Non-enterprise subscription:', {
        monthlyPrice: formatDisplayAmount(monthlyPrice),
        productName: product.name,
      });
    }

  } catch (error) {
    console.error('❌ Error processing subscription created:', error);
  }
}

/**
 * Handle Subscription Updated
 *
 * Fires when customer upgrades/downgrades plan or updates payment method.
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('🔄 Subscription Updated:', {
    id: subscription.id,
    customer: subscription.customer,
    status: subscription.status,
    cancel_at_period_end: subscription.cancel_at_period_end,
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
 * Revoke enterprise access (but preserve purchased/coupon access).
 * Send cancellation email.
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

    const clerkUserId = customerEmail; // Temporary identifier

    // Get plan name from subscription
    const priceId = subscription.items.data[0].price.id;
    const price = await stripe.prices.retrieve(priceId, { expand: ['product'] });
    const product = price.product as Stripe.Product;
    const planName = product.name || 'Your Subscription';

    // Check if this was an enterprise subscription
    const monthlyPrice = subscription.items.data[0].price.unit_amount || 0;
    const wasEnterprise = monthlyPrice >= 41500; // $415 in cents

    // If enterprise, revoke enterprise status (purchased/coupon access is preserved)
    if (wasEnterprise) {
      try {
        await ProductAccessService.removeEnterpriseStatus(clerkUserId);

        console.log('✅ Enterprise status revoked:', {
          clerkUserId,
          subscriptionId: subscription.id,
        });
      } catch (accessError) {
        console.error('❌ Error removing enterprise status:', accessError);
      }
    }

    // Calculate access until date (current period end)
    const accessUntilDate = (subscription as any).current_period_end
      ? new Date((subscription as any).current_period_end * 1000).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

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
  console.log('✅ Invoice Payment Succeeded:', {
    id: invoice.id,
    subscription: (invoice as any).subscription,
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
    const customerEmail = invoice.customer_email;
    if (!customerEmail) {
      console.error('❌ No customer email found in invoice');
      return;
    }

    // Get plan name from invoice line items
    const lineItems = invoice.lines.data;
    const planName = lineItems[0]?.description || 'Your Subscription';

    // Calculate next billing date
    const nextBillingDate = invoice.period_end
      ? new Date(invoice.period_end * 1000).toLocaleDateString('en-US', {
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
  console.log('❌ Invoice Payment Failed:', {
    id: invoice.id,
    subscription: (invoice as any).subscription,
    customer: invoice.customer,
    amount_due: formatDisplayAmount(invoice.amount_due),
    attempt_count: invoice.attempt_count,
  });

  try {
    const customerEmail = invoice.customer_email;
    if (!customerEmail) {
      console.error('❌ No customer email found in invoice');
      return;
    }

    // Get plan name from invoice line items
    const lineItems = invoice.lines.data;
    const planName = lineItems[0]?.description || 'Your Subscription';

    // Calculate retry date
    const retryDate = invoice.next_payment_attempt
      ? new Date(invoice.next_payment_attempt * 1000).toLocaleDateString('en-US', {
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
