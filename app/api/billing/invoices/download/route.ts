import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe-server';

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
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get('invoiceId');

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
  } catch (error: any) {
    console.error('Error downloading invoice:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to download invoice' },
      { status: 500 }
    );
  }
}
