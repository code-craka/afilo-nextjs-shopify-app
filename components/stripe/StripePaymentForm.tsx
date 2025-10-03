'use client';

import { useState, useEffect } from 'react';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import {
  getStripe,
  stripeAppearance,
  getStripeErrorMessage,
} from '@/lib/stripe-browser';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * Stripe Payment Form - ACH + Card Support
 *
 * Features:
 * - Automatic payment methods (Card + ACH)
 * - Adaptive 3D Secure (only when required)
 * - User-friendly error handling
 * - Loading states and animations
 * - ACH processing notifications
 * - Enterprise design matching Afilo brand
 *
 * Props:
 * - amount: Payment amount in cents
 * - productName: Product name for display
 * - productId: Product ID for tracking
 * - customerEmail: Customer email (optional)
 * - onSuccess: Callback when payment succeeds
 * - onError: Callback when payment fails
 */

interface PaymentFormProps {
  amount: number;
  productName: string;
  productId: string;
  customerEmail?: string;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
}

/**
 * Checkout Form Component (Internal)
 *
 * Handles payment submission and confirmation.
 * Separated from wrapper to work within Elements context.
 */
function CheckoutForm({
  amount,
  productName,
  productId,
  customerEmail,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [processingACH, setProcessingACH] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Confirm payment - Stripe handles 3DS automatically if needed
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
          receipt_email: customerEmail,
        },
        redirect: 'if_required', // Only redirect if 3DS required
      });

      if (confirmError) {
        const errorMessage = getStripeErrorMessage(confirmError.code);
        setError(errorMessage);
        onError?.(errorMessage);
        setLoading(false);
        return;
      }

      // Handle payment status
      if (paymentIntent) {
        if (paymentIntent.status === 'succeeded') {
          // Card payment succeeded immediately
          setSuccess(true);
          onSuccess?.(paymentIntent.id);
        } else if (paymentIntent.status === 'processing') {
          // ACH payment processing (3-5 days)
          setSuccess(true);
          setProcessingACH(true);
          onSuccess?.(paymentIntent.id);
        } else if (paymentIntent.status === 'requires_action') {
          // 3DS authentication required (rare case)
          setError('Additional authentication is required. Please complete verification.');
        } else {
          setError(`Payment status: ${paymentIntent.status}. Please contact support.`);
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
        <AlertDescription className="text-green-800 dark:text-green-200">
          <div className="flex items-center space-x-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-semibold">Payment submitted successfully!</span>
          </div>

          {processingACH && (
            <p className="mt-3 text-sm">
              Your ACH payment is being processed and will clear in 3-5 business
              days. You will receive a confirmation email once the payment is
              complete.
            </p>
          )}

          {!processingACH && (
            <p className="mt-3 text-sm">
              Thank you for your purchase! You should receive a confirmation email
              shortly.
            </p>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Product Summary */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Product</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {productName}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              ${(amount / 100).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Element - Shows Card + ACH tabs */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Payment Method
        </label>
        <PaymentElement
          options={{
            layout: 'tabs',
            // ACH Direct Debit will appear as a tab option
            // 3DS will trigger automatically when required
            defaultValues: {
              billingDetails: {
                email: customerEmail,
              },
            },
          }}
        />
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-start space-x-2">
            <svg
              className="w-5 h-5 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!stripe || loading}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <span className="flex items-center justify-center space-x-2">
            <svg
              className="animate-spin h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Processing...</span>
          </span>
        ) : (
          `Pay $${(amount / 100).toFixed(2)}`
        )}
      </Button>

      {/* Security Notice */}
      <p className="text-xs text-center text-gray-500 dark:text-gray-400">
        <span className="flex items-center justify-center space-x-1">
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span>Payments are secure and encrypted.</span>
        </span>
        <span className="block mt-1">
          ACH payments take 3-5 business days to process.
        </span>
      </p>
    </form>
  );
}

/**
 * Stripe Payment Form Wrapper
 *
 * Main component that creates PaymentIntent and wraps
 * CheckoutForm in Stripe Elements context.
 */
export default function StripePaymentForm(props: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingIntent, setLoadingIntent] = useState(true);
  const [intentError, setIntentError] = useState<string | null>(null);

  // Create PaymentIntent on component mount
  useEffect(() => {
    createPaymentIntent();
  }, [props.amount, props.productId]);

  const createPaymentIntent = async () => {
    try {
      setLoadingIntent(true);
      setIntentError(null);

      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: props.amount,
          productName: props.productName,
          productId: props.productId,
          customerEmail: props.customerEmail,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setClientSecret(data.clientSecret);
    } catch (error: any) {
      console.error('Error creating PaymentIntent:', error);
      setIntentError(error.message || 'Failed to initialize payment');
    } finally {
      setLoadingIntent(false);
    }
  };

  // Loading state
  if (loadingIntent) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Loading payment form...
        </p>
      </div>
    );
  }

  // Error state
  if (intentError || !clientSecret) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          <p className="font-semibold">Failed to initialize payment</p>
          <p className="mt-2 text-sm">{intentError || 'Unknown error occurred'}</p>
          <Button
            onClick={createPaymentIntent}
            variant="outline"
            size="sm"
            className="mt-4"
          >
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Render payment form
  return (
    <Elements
      stripe={getStripe()}
      options={{
        clientSecret,
        appearance: stripeAppearance,
      }}
    >
      <CheckoutForm {...props} />
    </Elements>
  );
}
