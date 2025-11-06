import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe-server';
import { createErrorResponse, logError } from '@/lib/utils/error-handling';

/**
 * GET /api/billing/invoices/download?invoiceId=in_xxx
 *
 * Downloads a Stripe invoice as PDF.
 * Fetches the invoice PDF URL from Stripe and returns it.
 *
 * Query Params:
 * - invoiceId: Stripe Invoice ID (in_xxx)
 *
 * Response:
 * - Redirect to Stripe hosted invoice PDF
 */
export async function GET(request: NextRequest) {
  let userId: string | null = null;
  let invoiceId: string | null = null;

  try {
    const authResult = await auth();
    userId = authResult.userId;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    invoiceId = searchParams.get('invoiceId');

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      );
    }

    // Fetch invoice from Stripe
    const invoice = await stripe.invoices.retrieve(invoiceId);

    if (!invoice.invoice_pdf) {
      return NextResponse.json(
        { error: 'Invoice PDF not available' },
        { status: 404 }
      );
    }

    // Redirect to Stripe hosted PDF
    return NextResponse.redirect(invoice.invoice_pdf);
  } catch (error: unknown) {
    logError('INVOICE_DOWNLOAD', error, { invoiceId, userId });

    return createErrorResponse(error);
  }
}
