/**
 * Set Default Payment Method API
 *
 * POST /api/billing/payment-methods/set-default
 *
 * Sets a payment method as the default for future invoices and subscriptions.
 * Includes ownership verification for security.
 */

import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import {
  setDefaultPaymentMethod,
  verifyPaymentMethodOwnership,
} from '@/lib/billing/stripe-payment-methods';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to update payment methods' },
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
        { error: 'No Stripe customer found' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { paymentMethodId } = body;

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: 'Payment method ID is required' },
        { status: 400 }
      );
    }

    // Security check: Verify ownership
    const isOwner = await verifyPaymentMethodOwnership(
      paymentMethodId,
      stripeCustomerId
    );

    if (!isOwner) {
      return NextResponse.json(
        {
          error: 'Unauthorized - This payment method does not belong to you',
        },
        { status: 403 }
      );
    }

    // Set as default
    await setDefaultPaymentMethod(stripeCustomerId, paymentMethodId);

    return NextResponse.json({
      success: true,
      message: 'Default payment method updated successfully',
      paymentMethodId,
    });
  } catch (error: any) {
    console.error('Error setting default payment method:', error);

    return NextResponse.json(
      {
        error: error.message || 'Failed to set default payment method',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// Health check
export async function OPTIONS() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/billing/payment-methods/set-default',
    method: 'POST',
    authentication: 'Clerk',
    body: {
      paymentMethodId: 'string (required)',
    },
    description: 'Sets a payment method as default for future charges',
  });
}
