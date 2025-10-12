/**
 * Retry Invoice Payment API
 *
 * POST /api/billing/invoices/retry-payment
 *
 * Retries payment for a failed invoice using customer's default payment method.
 *
 * Body:
 * {
 *   "invoiceId": "in_xxx"
 * }
 */

import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { retryInvoicePayment, verifyInvoiceOwnership } from '@/lib/billing/stripe-invoices';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to retry payment' },
        { status: 401 }
      );
    }

    // Get user details
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get Stripe Customer ID
    const stripeCustomerId = user.publicMetadata.stripeCustomerId as string | undefined;

    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: 'No Stripe customer found - please contact support' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { invoiceId } = body;

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Missing required field: invoiceId' },
        { status: 400 }
      );
    }

    // Security check: Verify invoice belongs to customer
    const isOwner = await verifyInvoiceOwnership(invoiceId, stripeCustomerId);

    if (!isOwner) {
      return NextResponse.json(
        { error: 'Unauthorized - This invoice does not belong to you' },
        { status: 403 }
      );
    }

    // Retry payment
    const invoice = await retryInvoicePayment(invoiceId);

    return NextResponse.json({
      success: true,
      invoice,
      message: invoice.status === 'paid'
        ? 'Payment successful'
        : 'Payment attempted - please check status',
    });
  } catch (error: any) {
    console.error('Error retrying invoice payment:', error);

    // Handle specific Stripe errors
    if (error.type === 'StripeCardError') {
      return NextResponse.json(
        {
          error: 'Payment failed - please update your payment method',
          details: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: error.message || 'Failed to retry invoice payment',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/billing/invoices/retry-payment',
    method: 'POST',
    authentication: 'Clerk',
    description: 'Retries payment for a failed invoice',
  });
}
