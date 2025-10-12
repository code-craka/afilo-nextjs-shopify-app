/**
 * Invoices List Component
 *
 * Displays all invoices for the authenticated user.
 * Features:
 * - Fetches invoices from /api/billing/invoices/list
 * - Shows invoices with InvoiceCard component
 * - Handles retry payment operations
 * - Loading states and error handling
 * - Empty state when no invoices
 * - Filter by status (optional)
 *
 * Used in /dashboard/billing page.
 */

'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import InvoiceCard from './InvoiceCard';
import { InvoiceData } from '@/lib/billing/stripe-invoices';

interface InvoicesListProps {
  limit?: number;
}

export default function InvoicesList({ limit = 12 }: InvoicesListProps) {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch invoices
  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/billing/invoices/list?limit=${limit}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch invoices');
      }

      setInvoices(data.invoices || []);
    } catch (err: any) {
      console.error('Failed to fetch invoices:', err);
      setError(err.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleRetryPayment = async (invoiceId: string) => {
    try {
      const response = await fetch('/api/billing/invoices/retry-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to retry payment');
      }

      // Update local state
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === invoiceId ? data.invoice : inv))
      );

      // Show success message
      console.log('✅ Payment retried successfully');
    } catch (err: any) {
      console.error('Failed to retry payment:', err);
      alert(err.message || 'Failed to retry payment');
      throw err;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Invoice History</h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Invoice History</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="font-semibold text-red-900">Failed to Load Invoices</p>
          </div>
          <p className="text-sm text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchInvoices}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (invoices.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Invoice History</h2>
        </div>
        <div className="text-center py-12">
          <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-2">No invoices yet</p>
          <p className="text-sm text-gray-500">
            Your invoice history will appear here after your first payment
          </p>
        </div>
      </div>
    );
  }

  // Invoices grid
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Invoice History</h2>
          <p className="text-sm text-gray-500 mt-1">
            {invoices.length} {invoices.length === 1 ? 'invoice' : 'invoices'}
          </p>
        </div>
        <button
          onClick={fetchInvoices}
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence>
          {invoices.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              onRetryPayment={handleRetryPayment}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Show more link if at limit */}
      {invoices.length >= limit && (
        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Showing {limit} most recent invoices
          </p>
        </div>
      )}
    </div>
  );
}
