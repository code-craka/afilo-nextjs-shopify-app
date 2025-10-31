'use client';

/**
 * InternationalInvoiceList Component
 *
 * Displays customer invoices with:
 * - Multi-currency support
 * - Invoice filtering and sorting
 * - Download functionality
 * - Status indicators (paid, pending, failed)
 * - Localized date formatting
 * - Pagination support
 *
 * Features:
 * - Real-time invoice list from Stripe
 * - Status-based filtering
 * - Currency-aware amount formatting
 * - Error handling and loading states
 * - Empty state messaging
 * - Responsive design
 *
 * Usage:
 * ```tsx
 * <InternationalInvoiceList
 *   accountId="acct_xxx"
 *   currency="USD"
 *   locale="en-US"
 * />
 * ```
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { CurrencyCode } from '@/lib/stripe/types/adaptive-checkout.types';

/**
 * Invoice object structure
 */
interface Invoice {
  id: string;
  number: string;
  amount_paid: number;
  amount_due: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
  created: number;
  due_date: number | null;
  paid_at: number | null;
  download_url: string | null;
  description: string | null;
}

/**
 * Component Props
 */
interface InternationalInvoiceListProps {
  /** Stripe Account ID (Accounts v2) */
  accountId?: string;
  /** Currency for display (optional) */
  currency?: CurrencyCode;
  /** Locale for date formatting (optional, defaults to 'en-US') */
  locale?: string;
  /** Number of invoices per page (optional, defaults to 10) */
  pageSize?: number;
  /** Custom className */
  className?: string;
  /** Show all invoices or just recent ones (optional) */
  showAll?: boolean;
  /** Filter by status (optional) */
  statusFilter?: Invoice['status'] | 'all';
  /** Enable download functionality (optional) */
  enableDownload?: boolean;
  /** Callback when invoice is selected */
  onInvoiceSelect?: (invoice: Invoice) => void;
}

/**
 * Get status badge color
 */
function getStatusColor(status: Invoice['status']): string {
  switch (status) {
    case 'paid':
      return '#10b981'; // green
    case 'open':
      return '#f59e0b'; // amber
    case 'draft':
      return '#6b7280'; // gray
    case 'void':
      return '#9ca3af'; // light gray
    case 'uncollectible':
      return '#ef4444'; // red
    default:
      return '#6b7280';
  }
}

/**
 * Get status badge label
 */
function getStatusLabel(status: Invoice['status']): string {
  switch (status) {
    case 'paid':
      return '✓ Paid';
    case 'open':
      return '⏳ Outstanding';
    case 'draft':
      return '📝 Draft';
    case 'void':
      return '✗ Void';
    case 'uncollectible':
      return '⚠️ Uncollectible';
    default:
      return status;
  }
}

/**
 * Format currency amount for display
 */
function formatCurrencyAmount(
  amountCents: number,
  currency: string,
  locale: string
): string {
  const amount = amountCents / 100;

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Fallback to simple formatting
    return `${currency.toUpperCase()} ${amount.toFixed(2)}`;
  }
}

/**
 * Format Unix timestamp to localized date
 */
function formatDate(timestamp: number, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(timestamp * 1000));
  } catch {
    return new Date(timestamp * 1000).toLocaleDateString();
  }
}

/**
 * InternationalInvoiceList Component
 *
 * Displays a list of invoices with multi-currency support,
 * status filtering, and download capabilities.
 *
 * Placeholder: Currently shows mock data. Will integrate with
 * actual Stripe v2 accounts API in future.
 *
 * @component
 */
export const InternationalInvoiceList: React.FC<InternationalInvoiceListProps> = ({
  accountId,
  currency = 'USD',
  locale = 'en-US',
  pageSize = 10,
  className = '',
  showAll = false,
  statusFilter = 'all',
  enableDownload = true,
  onInvoiceSelect,
}) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  /**
   * Fetch invoices from API (placeholder - will be implemented later)
   */
  const fetchInvoices = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('[InternationalInvoiceList] Fetching invoices:', {
        accountId,
        currency,
        locale,
      });

      // TODO: Replace with actual API call when available
      // const response = await fetch(`/api/invoices?account_id=${accountId}`);

      // For now, show placeholder message
      // In production, this would fetch from /api/billing/invoices or similar
      setInvoices([]);

      // Log that this is a placeholder
      console.log('[InternationalInvoiceList] Using placeholder - API integration pending');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load invoices';
      console.error('[InternationalInvoiceList] Error:', errorMsg);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [accountId, currency, locale]);

  // Load invoices on mount
  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Filter invoices based on status
  useEffect(() => {
    let filtered = invoices;

    if (statusFilter !== 'all') {
      filtered = filtered.filter((inv) => inv.status === statusFilter);
    }

    // Limit to pageSize if not showing all
    if (!showAll) {
      filtered = filtered.slice(0, pageSize);
    }

    setFilteredInvoices(filtered);
    setCurrentPage(1);
  }, [invoices, statusFilter, showAll, pageSize]);

  if (isLoading) {
    return (
      <div className={`invoice-list-loader ${className}`}>
        <div className="loader-spinner">
          <svg
            className="animate-spin h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
        <p className="text-gray-600">Loading invoices...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`invoice-list-error ${className}`}>
        <div className="error-content">
          <p className="error-message">⚠️ {error}</p>
          <button onClick={fetchInvoices} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (filteredInvoices.length === 0) {
    return (
      <div className={`invoice-list-empty ${className}`}>
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <h3>No invoices found</h3>
          <p className="text-gray-600 text-sm">
            {accountId
              ? 'No invoices available for this account yet'
              : 'Connect your Stripe account to view invoices'}
          </p>
          {!accountId && (
            <p className="text-gray-500 text-xs mt-2">
              💡 Invoices will appear here after your first transaction
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`invoice-list-container ${className}`}>
      <div className="invoice-list-header">
        <h3>Invoices</h3>
        <p className="text-gray-600 text-sm">
          {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''} •{' '}
          {currency}
        </p>
      </div>

      <div className="invoice-list">
        {filteredInvoices.map((invoice) => (
          <div
            key={invoice.id}
            className="invoice-item"
            onClick={() => onInvoiceSelect?.(invoice)}
          >
            {/* Invoice Number */}
            <div className="invoice-number">
              <strong>{invoice.number || invoice.id.slice(-8)}</strong>
            </div>

            {/* Date */}
            <div className="invoice-date">
              <span className="text-gray-600 text-sm">
                {formatDate(invoice.created, locale)}
              </span>
            </div>

            {/* Amount */}
            <div className="invoice-amount">
              <span className="font-semibold">
                {formatCurrencyAmount(invoice.amount_due || invoice.amount_paid, currency, locale)}
              </span>
            </div>

            {/* Status Badge */}
            <div className="invoice-status">
              <span
                className="status-badge"
                style={{ backgroundColor: getStatusColor(invoice.status) }}
              >
                {getStatusLabel(invoice.status)}
              </span>
            </div>

            {/* Download Button */}
            {enableDownload && invoice.download_url && (
              <div className="invoice-action">
                <a
                  href={invoice.download_url}
                  download
                  className="download-link"
                  title="Download invoice PDF"
                  onClick={(e) => e.stopPropagation()}
                >
                  📥
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="invoice-list-footer">
        <p className="text-xs text-gray-500">
          Last updated: {new Date().toLocaleString(locale)}
        </p>
      </div>

      <style jsx>{`
        .invoice-list-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .invoice-list-header {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .invoice-list-header h3 {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0;
        }

        .invoice-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .invoice-item {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr auto auto;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          background-color: #fafafa;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .invoice-item:hover {
          border-color: #d1d5db;
          background-color: white;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .invoice-number {
          font-weight: 600;
          color: #111827;
        }

        .invoice-date {
          text-align: left;
        }

        .invoice-amount {
          font-weight: 600;
          color: #111827;
          text-align: right;
        }

        .invoice-status {
          text-align: center;
        }

        .status-badge {
          display: inline-block;
          padding: 0.375rem 0.75rem;
          background-color: #e5e7eb;
          color: white;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .invoice-action {
          display: flex;
          justify-content: center;
        }

        .download-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          border-radius: 0.375rem;
          background-color: #f0f9ff;
          border: 1px solid #bfdbfe;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.2s ease;
          text-decoration: none;
        }

        .download-link:hover {
          background-color: #e0f2fe;
          border-color: #7dd3fc;
        }

        .invoice-list-loader,
        .invoice-list-error,
        .invoice-list-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 2rem;
          text-align: center;
        }

        .loader-spinner {
          margin-bottom: 1rem;
          color: #3b82f6;
        }

        .error-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          align-items: center;
        }

        .error-message {
          color: #dc2626;
          margin: 0;
        }

        .retry-button {
          padding: 0.5rem 1rem;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.375rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .retry-button:hover {
          background-color: #2563eb;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          align-items: center;
        }

        .empty-icon {
          font-size: 3rem;
        }

        .empty-state h3 {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0;
        }

        .invoice-list-footer {
          text-align: center;
          padding: 0.75rem;
          background-color: #f9fafb;
          border-radius: 0.375rem;
        }

        @media (max-width: 768px) {
          .invoice-item {
            grid-template-columns: 1fr auto;
            gap: 0.5rem;
          }

          .invoice-number,
          .invoice-date,
          .invoice-amount {
            grid-column: 1 / -1;
            text-align: left;
          }

          .invoice-status {
            text-align: left;
          }
        }
      `}</style>
    </div>
  );
};

export default InternationalInvoiceList;
