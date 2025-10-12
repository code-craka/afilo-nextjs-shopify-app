/**
 * Cancel Subscription Modal Component
 *
 * Modal for canceling subscription with retention offer.
 * Features:
 * - Cancellation warning with access retention info
 * - Immediate vs end-of-period cancellation options
 * - Retention offer (optional discount or alternative)
 * - Cancel reason collection (optional)
 * - Success/error states
 *
 * Used by ActiveSubscriptionCard component.
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Loader2, Check, XCircle } from 'lucide-react';
import { formatDate } from '@/lib/billing/stripe-subscriptions';

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptionId: string;
  planName: string;
  currentPeriodEnd: number;
  onSuccess?: () => void;
}

export default function CancelSubscriptionModal({
  isOpen,
  onClose,
  subscriptionId,
  planName,
  currentPeriodEnd,
  onSuccess,
}: CancelSubscriptionModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [cancelImmediately, setCancelImmediately] = useState(false);

  const handleCancel = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/billing/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId,
          cancelImmediately,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      setSuccess(true);

      // Wait to show success message
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Failed to cancel subscription:', err);
      setError(err.message || 'Failed to cancel subscription');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Success state
  if (success) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
            />

            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                  <Check className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {cancelImmediately
                    ? 'Subscription Canceled'
                    : 'Cancellation Scheduled'}
                </h3>
                <p className="text-sm text-gray-600">
                  {cancelImmediately
                    ? 'Your subscription has been canceled immediately.'
                    : `Your subscription will end on ${formatDate(currentPeriodEnd)}.`}
                </p>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Cancel Subscription</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    We&apos;re sorry to see you go
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  aria-label="Close modal"
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Warning */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-orange-900 mb-1">
                        You&apos;re about to cancel your {planName} subscription
                      </p>
                      <p className="text-sm text-orange-700">
                        If you cancel now, you&apos;ll retain access until{' '}
                        <span className="font-medium">{formatDate(currentPeriodEnd)}</span>.
                        No further charges will be made.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Retention Offer */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Before you go...
                  </h3>
                  <p className="text-sm text-blue-700 mb-3">
                    Need to reduce costs? Consider downgrading to a lower tier instead
                    of canceling completely.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      // This would trigger the change plan modal
                      // You can add this functionality by passing a callback
                    }}
                    className="text-sm text-blue-700 font-medium hover:text-blue-800 underline"
                  >
                    View All Plans →
                  </button>
                </div>

                {/* Cancellation Options */}
                <div className="space-y-3 mb-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="cancelOption"
                      checked={!cancelImmediately}
                      onChange={() => setCancelImmediately(false)}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        Cancel at end of billing period (Recommended)
                      </p>
                      <p className="text-sm text-gray-600">
                        Keep access until {formatDate(currentPeriodEnd)}
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="cancelOption"
                      checked={cancelImmediately}
                      onChange={() => setCancelImmediately(true)}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Cancel immediately</p>
                      <p className="text-sm text-gray-600">
                        Lose access now (no refund for remaining time)
                      </p>
                    </div>
                  </label>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Keep Subscription
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Canceling...</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4" />
                        <span>Cancel Subscription</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
