/**
 * Remove Payment Method API
 *
 * POST /api/billing/payment-methods/remove
 *
 * Removes a payment method from the authenticated user's account.
 * Includes ownership verification for security.
 */

import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import {
  detachPaymentMethod,
  verifyPaymentMethodOwnership,
} from '@/lib/billing/stripe-payment-methods';
import { createErrorResponse, logError } from '@/lib/utils/error-handling';

export async function POST(request: NextRequest) {
  let userId: string | null = null;
  let stripeCustomerId: string | undefined = undefined;
  let paymentMethodId: string | undefined = undefined;

  try {
    // Authenticate user
    const authResult = await auth();
    userId = authResult.userId;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to remove payment methods' },
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
    stripeCustomerId = user.publicMetadata.stripeCustomerId as string | undefined;

    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: 'No Stripe customer found' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    paymentMethodId = body.paymentMethodId;

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

    // Detach payment method
    await detachPaymentMethod(paymentMethodId);

    return NextResponse.json({
      success: true,
      message: 'Payment method removed successfully',
      paymentMethodId,
    });
  } catch (error: unknown) {
    logError('PAYMENT_METHOD_REMOVE', error, { userId, stripeCustomerId, paymentMethodId });

    return createErrorResponse(error);
  }
}

// Health check
export async function OPTIONS() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/billing/payment-methods/remove',
    method: 'POST',
    authentication: 'Clerk',
    body: {
      paymentMethodId: 'string (required)',
    },
    description: 'Removes a payment method from user account',
  });
}
