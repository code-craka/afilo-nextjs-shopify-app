/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Stripe Invoices Utilities
 *
 * Manages customer invoices for Afilo Enterprise billing portal.
 * Supports:
 * - List invoices (paid, pending, failed)
 * - Get invoice details
 * - Download invoice PDF
 * - Get invoice payment status
 *
 * Functions:
 * - List all invoices for a customer
 * - Get specific invoice details
 * - Retry failed invoice payment
 * - Get invoice PDF URL
 */

import Stripe from 'stripe';
import { stripe } from '@/lib/stripe-server';

/**
 * Invoice Data Type
 */
export interface InvoiceData {
  id: string;
  number: string | null;
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
  amount: number; // Amount in cents
  amountPaid: number;
  amountDue: number;
  currency: string;
  description: string | null;
  created: number;
  dueDate: number | null;
  periodStart: number | null;
  periodEnd: number | null;
  pdfUrl: string | null;
  hostedUrl: string | null;
  subscriptionId: string | null;
  attemptCount: number;
}

/**
 * List Customer Invoices
 *
 * Retrieves all invoices for a customer.
 * Returns formatted data optimized for UI display.
 *
 * @param customerId - Stripe Customer ID
 * @param limit - Maximum number of invoices to return (default: 12)
 * @returns Array of invoice data
 */
export async function listCustomerInvoices(
  customerId: string,
  limit: number = 12
): Promise<InvoiceData[]> {
  try {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit,
    });

    return invoices.data.map((invoice) => ({
      id: invoice.id,
      number: invoice.number,
      status: invoice.status as InvoiceData['status'],
      amount: invoice.amount_due,
      amountPaid: invoice.amount_paid,
      amountDue: invoice.amount_remaining,
      currency: invoice.currency,
      description: invoice.description,
      created: invoice.created,
      dueDate: invoice.due_date,
      periodStart: invoice.period_start,
      periodEnd: invoice.period_end,
      pdfUrl: invoice.invoice_pdf ?? null,
      hostedUrl: invoice.hosted_invoice_url ?? null,
      subscriptionId: typeof (invoice as any).subscription === 'string'
        ? (invoice as any).subscription
        : (invoice as any).subscription?.id ?? null,
      attemptCount: invoice.attempt_count,
    }));
  } catch (error: unknown) {
    console.error('Error listing customer invoices:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to list customer invoices');
  }
}

/**
 * Get Invoice Details
 *
 * Retrieves detailed information about a specific invoice.
 *
 * @param invoiceId - Stripe Invoice ID
 * @returns Invoice data
 */
export async function getInvoiceDetails(
  invoiceId: string
): Promise<InvoiceData | null> {
  try {
    const invoice = await stripe.invoices.retrieve(invoiceId);

    return {
      id: invoice.id,
      number: invoice.number,
      status: invoice.status as InvoiceData['status'],
      amount: invoice.amount_due,
      amountPaid: invoice.amount_paid,
      amountDue: invoice.amount_remaining,
      currency: invoice.currency,
      description: invoice.description,
      created: invoice.created,
      dueDate: invoice.due_date,
      periodStart: invoice.period_start,
      periodEnd: invoice.period_end,
      pdfUrl: invoice.invoice_pdf ?? null,
      hostedUrl: invoice.hosted_invoice_url ?? null,
      subscriptionId: typeof (invoice as any).subscription === 'string'
        ? (invoice as any).subscription
        : (invoice as any).subscription?.id ?? null,
      attemptCount: invoice.attempt_count,
    };
  } catch (error: unknown) {
    console.error('Error retrieving invoice details:', error);

    if (error instanceof Error && (error as any).code === 'resource_missing') {
      return null;
    }

    throw new Error(error instanceof Error ? error.message : 'Failed to retrieve invoice details');
  }
}

/**
 * Verify Invoice Ownership
 *
 * Checks if an invoice belongs to a specific customer.
 * Security check before viewing or downloading.
 *
 * @param invoiceId - Stripe Invoice ID
 * @param customerId - Expected Customer ID
 * @returns True if invoice belongs to customer
 */
export async function verifyInvoiceOwnership(
  invoiceId: string,
  customerId: string
): Promise<boolean> {
  try {
    const invoice = await stripe.invoices.retrieve(invoiceId);

    const invoiceCustomerId = typeof invoice.customer === 'string'
      ? invoice.customer
      : invoice.customer?.id;

    return invoiceCustomerId === customerId;
  } catch (error: unknown) {
    console.error('Error verifying invoice ownership:', error);
    return false;
  }
}

/**
 * Retry Failed Invoice Payment
 *
 * Attempts to pay a failed invoice with customer's default payment method.
 *
 * @param invoiceId - Stripe Invoice ID
 * @returns Updated invoice data
 */
export async function retryInvoicePayment(
  invoiceId: string
): Promise<InvoiceData> {
  try {
    // Pay the invoice
    const invoice = await stripe.invoices.pay(invoiceId);

    return {
      id: invoice.id,
      number: invoice.number,
      status: invoice.status as InvoiceData['status'],
      amount: invoice.amount_due,
      amountPaid: invoice.amount_paid,
      amountDue: invoice.amount_remaining,
      currency: invoice.currency,
      description: invoice.description,
      created: invoice.created,
      dueDate: invoice.due_date,
      periodStart: invoice.period_start,
      periodEnd: invoice.period_end,
      pdfUrl: invoice.invoice_pdf ?? null,
      hostedUrl: invoice.hosted_invoice_url ?? null,
      subscriptionId: typeof (invoice as any).subscription === 'string'
        ? (invoice as any).subscription
        : (invoice as any).subscription?.id ?? null,
      attemptCount: invoice.attempt_count,
    };
  } catch (error: unknown) {
    console.error('Error retrying invoice payment:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to retry invoice payment');
  }
}

/**
 * Calculate Total Spent
 *
 * Calculates total amount paid across all invoices.
 *
 * @param invoices - Array of invoice data
 * @returns Total amount paid in cents
 */
export function calculateTotalSpent(invoices: InvoiceData[]): number {
  return invoices.reduce((total, invoice) => {
    if (invoice.status === 'paid') {
      return total + invoice.amountPaid;
    }
    return total;
  }, 0);
}

/**
 * Get Invoice Count by Status
 *
 * Counts invoices by status.
 *
 * @param invoices - Array of invoice data
 * @returns Object with counts by status
 */
export function getInvoiceCountByStatus(invoices: InvoiceData[]): {
  paid: number;
  open: number;
  draft: number;
  uncollectible: number;
  void: number;
} {
  return invoices.reduce(
    (counts, invoice) => {
      counts[invoice.status]++;
      return counts;
    },
    { paid: 0, open: 0, draft: 0, uncollectible: 0, void: 0 }
  );
}

/**
 * Format Currency
 */
export function formatCurrency(cents: number, currency: string = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

/**
 * Format Date
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Get Status Badge Color
 */
export function getInvoiceStatusColor(status: InvoiceData['status']): {
  bg: string;
  text: string;
  dot: string;
} {
  switch (status) {
    case 'paid':
      return { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' };
    case 'open':
      return { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' };
    case 'draft':
      return { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500' };
    case 'uncollectible':
      return { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' };
    case 'void':
      return { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500' };
  }
}

/**
 * Get Status Display Name
 */
export function getInvoiceStatusName(status: InvoiceData['status']): string {
  switch (status) {
    case 'paid':
      return 'Paid';
    case 'open':
      return 'Pending';
    case 'draft':
      return 'Draft';
    case 'uncollectible':
      return 'Failed';
    case 'void':
      return 'Void';
    default:
      return status;
  }
}
