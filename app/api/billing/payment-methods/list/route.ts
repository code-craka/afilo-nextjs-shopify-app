/**
 * List Payment Methods API
 *
 * GET /api/billing/payment-methods/list
 *
 * Returns all payment methods for the authenticated user.
 * Requires Clerk authentication.
 */

import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { listPaymentMethods } from '@/lib/billing/stripe-payment-methods';
import { createErrorResponse, logError } from '@/lib/utils/error-handling';

export async function GET() {
  let userId: string | null = null;
  let stripeCustomerId: string | undefined = undefined;

  try {
    // Authenticate user
    const authResult = await auth();
    userId = authResult.userId;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to view payment methods' },
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
      // User has never made a purchase or set up payment methods
      return NextResponse.json({
        success: true,
        paymentMethods: [],
        message: 'No payment methods found. Add your first payment method to get started.',
      });
    }

    // Fetch payment methods from Stripe
    const paymentMethods = await listPaymentMethods(stripeCustomerId);

    return NextResponse.json({
      success: true,
      paymentMethods,
      count: paymentMethods.length,
    });
  } catch (error: unknown) {
    logError('PAYMENT_METHODS_LIST', error, { userId, stripeCustomerId });

    return createErrorResponse(error);
  }
}

// Health check
export async function OPTIONS() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/billing/payment-methods/list',
    method: 'GET',
    authentication: 'Clerk',
    description: 'Lists all payment methods for authenticated user',
  });
}
