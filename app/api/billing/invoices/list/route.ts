/**
 * List Invoices API
 *
 * GET /api/billing/invoices/list
 *
 * Retrieves all invoices for the authenticated user.
 * Supports pagination with limit query parameter.
 *
 * Query params:
 * - limit: Maximum number of invoices to return (default: 12)
 */

import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { listCustomerInvoices } from '@/lib/billing/stripe-invoices';
import { createErrorResponse, logError } from '@/lib/utils/error-handling';

export async function GET(request: NextRequest) {
  let userId: string | null = null;
  let stripeCustomerId: string | undefined = undefined;

  try {
    // Authenticate user
    const authResult = await auth();
    userId = authResult.userId;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to view invoices' },
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
        {
          success: true,
          invoices: [],
          count: 0,
          message: 'No Stripe customer found',
        },
        { status: 200 }
      );
    }

    // Get limit from query params
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    // List invoices
    const invoices = await listCustomerInvoices(stripeCustomerId, limit);

    return NextResponse.json({
      success: true,
      invoices,
      count: invoices.length,
      message: `Found ${invoices.length} invoice${invoices.length !== 1 ? 's' : ''}`,
    });
  } catch (error: unknown) {
    logError('INVOICE_LIST', error, { userId, stripeCustomerId });

    return createErrorResponse(error);
  }
}

// Health check
export async function POST() {
  return NextResponse.json({
    status: 'error',
    message: 'Use GET method to list invoices',
    endpoint: '/api/billing/invoices/list',
  }, { status: 405 });
}
