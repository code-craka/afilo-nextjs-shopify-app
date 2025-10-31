'use client';

import { useEffect, useState } from 'react';
import { PaymentRequest, Stripe } from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js';

interface PaymentRequestButtonProps {
  amount: number; // in cents
  currency?: string;
  label: string;
  onSuccess: (paymentMethodId: string) => void;
  onError: (error: string) => void;
  className?: string;
}

/**
 * Payment Request Button Component
 *
 * Displays Google Pay or Apple Pay button based on device/browser support.
 * Uses Stripe Payment Request API for seamless digital wallet payments.
 *
 * Features:
 * - Auto-detects Google Pay (Android/Chrome) or Apple Pay (iOS/Safari)
 * - One-click checkout experience
 * - Secure tokenized payments
 * - Falls back gracefully if not supported
 *
 * @example
 * <PaymentRequestButton
 *   amount={49900}
 *   label="Digital Product"
 *   onSuccess={(pmId) => completeCheckout(pmId)}
 *   onError={(err) => showToast(err)}
 * />
 */
export function PaymentRequestButton({
  amount,
  currency = 'usd',
  label,
  onSuccess,
  onError,
  className = '',
}: PaymentRequestButtonProps) {
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stripe, setStripe] = useState<Stripe | null>(null);

  useEffect(() => {
    const initializePaymentRequest = async () => {
      try {
        // Load Stripe
        const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
        if (!publishableKey) {
          console.error('Stripe publishable key not found');
          setIsLoading(false);
          return;
        }

        const stripeInstance = await loadStripe(publishableKey);
        if (!stripeInstance) {
          console.error('Failed to load Stripe');
          setIsLoading(false);
          return;
        }

        setStripe(stripeInstance);

        // Create payment request
        const pr = stripeInstance.paymentRequest({
          country: 'US',
          currency: currency.toLowerCase(),
          total: {
            label,
            amount,
          },
          requestPayerName: true,
          requestPayerEmail: true,
        });

        // Check if browser supports digital wallets
        const canMakePayment = await pr.canMakePayment();
        if (canMakePayment) {
          setIsSupported(true);
          setPaymentRequest(pr);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing payment request:', error);
        setIsLoading(false);
      }
    };

    initializePaymentRequest();
  }, [amount, currency, label]);

  useEffect(() => {
    if (!paymentRequest) return;

    // Handle payment method creation
    paymentRequest.on('paymentmethod', async (event) => {
      try {
        // Payment method created successfully
        const paymentMethodId = event.paymentMethod.id;

        // Complete the payment (backend handles charge)
        event.complete('success');

        // Notify parent component
        onSuccess(paymentMethodId);
      } catch (error: any) {
        event.complete('fail');
        onError(error.message || 'Payment failed');
      }
    });

    return () => {
      // Cleanup
      paymentRequest.off('paymentmethod');
    };
  }, [paymentRequest, onSuccess, onError]);

  // Don't render if not supported or loading
  if (isLoading) {
    return (
      <div className={`h-12 bg-gray-100 animate-pulse rounded-md ${className}`} />
    );
  }

  if (!isSupported || !paymentRequest || !stripe) {
    return null;
  }

  return (
    <div className={className}>
      <div id="payment-request-button" className="w-full">
        {/* Stripe automatically renders Google Pay or Apple Pay button */}
        <style jsx global>{`
          #payment-request-button button {
            width: 100% !important;
            height: 48px !important;
            border-radius: 6px !important;
          }
        `}</style>
        {stripe && (
          <div
            ref={(el) => {
              if (el && paymentRequest) {
                // Mount the payment request button
                const elements = stripe.elements();
                const prButton = elements.create('paymentRequestButton', {
                  paymentRequest,
                  style: {
                    paymentRequestButton: {
                      type: 'default', // Google Pay shows "Buy with Google Pay"
                      theme: 'dark',
                      height: '48px',
                    },
                  },
                });

                // Clear previous button
                el.innerHTML = '';
                prButton.mount(el);
              }
            }}
          />
        )}
      </div>

      {/* Info text */}
      <p className="text-xs text-gray-500 mt-2 text-center">
        Fast & secure checkout with your digital wallet
      </p>
    </div>
  );
}
