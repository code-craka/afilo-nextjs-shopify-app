/**
 * Invoice Card Component
 *
 * Displays a single invoice with:
 * - Invoice number and status
 * - Amount and payment date
 * - Billing period
 * - Download PDF button
 * - Retry payment button (for failed invoices)
 *
 * Used by InvoicesList component.
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Calendar, CreditCard, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import {
  InvoiceData,
  formatCurrency,
  formatDate,
  getInvoiceStatusColor,
  getInvoiceStatusName,
} from '@/lib/billing/stripe-invoices';

interface InvoiceCardProps {
  invoice: InvoiceData;
  onRetryPayment?: (invoiceId: string) => Promise<void>;
}

export default function InvoiceCard({ invoice, onRetryPayment }: InvoiceCardProps) {
  const [downloading, setDownloading] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const statusColors = getInvoiceStatusColor(invoice.status);
  const statusName = getInvoiceStatusName(invoice.status);
  const canRetry = invoice.status === 'open' || invoice.status === 'uncollectible';

  const handleDownloadPDF = async () => {
    if (!invoice.pdfUrl) {
      alert('PDF not available for this invoice');
      return;
    }

    try {
      setDownloading(true);
      window.open(invoice.pdfUrl, '_blank');
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert('Failed to download PDF');
    } finally {
      setDownloading(false);
    }
  };

  const handleRetryPayment = async () => {
    if (!onRetryPayment) return;

    try {
      setRetrying(true);
      await onRetryPayment(invoice.id);
    } catch (error) {
      console.error('Failed to retry payment:', error);
    } finally {
      setRetrying(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        {/* Invoice Info */}
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-gray-900">
                {invoice.number || `Invoice ${invoice.id.slice(-8)}`}
              </p>
              {/* Status Badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 ${statusColors.bg} ${statusColors.text} text-xs font-medium rounded`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusColors.dot}`}></span>
                {statusName}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {invoice.description || 'Subscription Payment'}
            </p>
          </div>
        </div>

        {/* Amount */}
        <div className="text-right">
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(invoice.amount, invoice.currency)}
          </p>
          {invoice.status === 'paid' && (
            <p className="text-xs text-green-600 font-medium">Paid</p>
          )}
          {invoice.status === 'open' && (
            <p className="text-xs text-blue-600 font-medium">Due</p>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        {/* Date */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <div>
            <p className="text-gray-600">
              {invoice.status === 'paid' ? 'Paid on' : 'Created'}
            </p>
            <p className="font-medium text-gray-900">{formatDate(invoice.created)}</p>
          </div>
        </div>

        {/* Billing Period */}
        {invoice.periodStart && invoice.periodEnd && (
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-gray-600">Period</p>
              <p className="font-medium text-gray-900">
                {formatDate(invoice.periodStart)} - {formatDate(invoice.periodEnd)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Failed Payment Warning */}
      {invoice.status === 'uncollectible' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">Payment Failed</p>
              <p className="text-xs text-red-700 mt-0.5">
                {invoice.attemptCount} attempt{invoice.attemptCount !== 1 ? 's' : ''} made.
                Please update your payment method or retry.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {/* Download PDF */}
        {invoice.pdfUrl && (
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-medium"
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span>Download PDF</span>
          </button>
        )}

        {/* Retry Payment */}
        {canRetry && onRetryPayment && (
          <button
            onClick={handleRetryPayment}
            disabled={retrying}
            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-medium"
          >
            {retrying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Retrying...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                <span>Retry Payment</span>
              </>
            )}
          </button>
        )}

        {/* View Invoice */}
        {invoice.hostedUrl && !invoice.pdfUrl && (
          <button
            onClick={() => window.open(invoice.hostedUrl!, '_blank')}
            className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <FileText className="h-4 w-4" />
            <span>View Invoice</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
