/**
 * Add Payment Method Form Component
 *
 * Modal form for adding new payment methods using Stripe Elements.
 * Supports:
 * - Credit/Debit Cards (Visa, Mastercard, Amex, Discover)
 * - US Bank Accounts (ACH Direct Debit with manual entry)
 *
 * Features:
 * - SetupIntent for secure payment method collection
 * - Stripe Elements with Afilo branding
 * - Loading states and error handling
 * - Success callback after method added
 *
 * Used by PaymentMethodsList component.
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Check, AlertCircle } from 'lucide-react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripe, stripeAppearance } from '@/lib/stripe-browser';

interface AddPaymentMethodFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * Internal Form Component (wrapped in Stripe Elements)
 */
function PaymentMethodForm({ onClose, onSuccess }: Omit<AddPaymentMethodFormProps, 'isOpen'>) {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Confirm setup
      const { error: confirmError, setupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/billing`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        throw new Error(confirmError.message || 'Failed to add payment method');
      }

      if (setupIntent && setupIntent.status === 'succeeded') {
        setSuccess(true);

        // Wait a moment to show success message
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1500);
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      console.error('Failed to add payment method:', error);
      setError(error.message || 'Failed to add payment method');
      setLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="py-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Payment Method Added!
        </h3>
        <p className="text-sm text-gray-600">
          Your payment method has been saved successfully.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Element */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Payment Method
        </label>
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Adding...</span>
            </>
          ) : (
            'Add Payment Method'
          )}
        </button>
      </div>

      {/* Security Notice */}
      <p className="text-xs text-center text-gray-500">
        🔒 Your payment information is secure and encrypted
      </p>
    </form>
  );
}

/**
 * Main Component with Modal
 */
export default function AddPaymentMethodForm({
  isOpen,
  onClose,
  onSuccess,
}: AddPaymentMethodFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingIntent, setLoadingIntent] = useState(true);
  const [intentError, setIntentError] = useState<string | null>(null);

  // Create SetupIntent when modal opens
  useEffect(() => {
    if (isOpen) {
      createSetupIntent();
    }
  }, [isOpen]);

  const createSetupIntent = async () => {
    try {
      setLoadingIntent(true);
      setIntentError(null);

      const response = await fetch('/api/billing/payment-methods/setup-intent', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize payment form');
      }

      setClientSecret(data.clientSecret);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      console.error('Failed to create setup intent:', error);
      setIntentError(error.message || 'Failed to initialize payment form');
    } finally {
      setLoadingIntent(false);
    }
  };

  if (!isOpen) return null;

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
                  <h2 className="text-xl font-bold text-gray-900">
                    Add Payment Method
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Add a card or bank account for future payments
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close modal"
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {loadingIntent ? (
                  // Loading state
                  <div className="py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-600">Loading payment form...</p>
                  </div>
                ) : intentError ? (
                  // Error state
                  <div className="py-8">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <p className="font-semibold text-red-900">Failed to Load Form</p>
                      </div>
                      <p className="text-sm text-red-700">{intentError}</p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Close
                      </button>
                      <button
                        onClick={createSetupIntent}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                ) : clientSecret ? (
                  // Payment form
                  <Elements
                    stripe={getStripe()}
                    options={{
                      clientSecret,
                      appearance: stripeAppearance,
                    }}
                  >
                    <PaymentMethodForm onClose={onClose} onSuccess={onSuccess} />
                  </Elements>
                ) : null}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
