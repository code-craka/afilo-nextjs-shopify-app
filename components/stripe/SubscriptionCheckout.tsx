'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface SubscriptionCheckoutProps {
  /**
   * Stripe Price ID for the subscription plan
   * Get this from the Stripe Dashboard or create-enterprise-subscriptions script
   */
  priceId: string;

  /**
   * Plan name for display (e.g., "Professional Plan")
   */
  planName: string;

  /**
   * Button text (default: "Subscribe Now")
   */
  buttonText?: string;

  /**
   * Button variant
   */
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';

  /**
   * Full width button
   */
  fullWidth?: boolean;

  /**
   * Customer email (optional - will be prefilled in checkout)
   */
  customerEmail?: string;

  /**
   * Callback when checkout starts
   */
  onCheckoutStart?: () => void;

  /**
   * Callback when checkout fails
   */
  onCheckoutError?: (error: Error) => void;
}

/**
 * SubscriptionCheckout Component
 *
 * Handles subscription checkout flow:
 * 1. User clicks "Subscribe Now" button
 * 2. Component calls API to create Stripe Checkout Session
 * 3. User redirected to Stripe-hosted checkout page
 * 4. After payment, redirected to success page
 * 5. Webhook generates credentials and sends email
 *
 * Features:
 * - NO free trials (immediate payment required)
 * - Supports Card + ACH Direct Debit
 * - Loading states and error handling
 * - Customizable button styling
 *
 * @example
 * <SubscriptionCheckout
 *   priceId="price_1QiEUZL0rxYK0P40KAvgFUjO"
 *   planName="Professional Plan"
 *   customerEmail="customer@example.com"
 * />
 */
export function SubscriptionCheckout({
  priceId,
  planName,
  buttonText = 'Subscribe Now',
  variant = 'default',
  fullWidth = false,
  customerEmail,
  onCheckoutStart,
  onCheckoutError,
}: SubscriptionCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState(customerEmail || '');
  const [showEmailInput, setShowEmailInput] = useState(!customerEmail);

  const handleSubscribe = async () => {
    try {
      // Validate email if shown
      if (showEmailInput && !email) {
        setError('Please enter your email address');
        return;
      }

      if (showEmailInput && !email.includes('@')) {
        setError('Please enter a valid email address');
        return;
      }

      setError(null);
      setIsLoading(true);

      // Callback: checkout started
      onCheckoutStart?.();

      console.log('📝 Creating checkout session:', {
        priceId,
        planName,
        email: email || customerEmail,
      });

      // Call API to create Stripe Checkout Session
      const response = await fetch('/api/stripe/create-subscription-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          customerEmail: email || customerEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      console.log('✅ Checkout session created:', {
        sessionId: data.sessionId,
        url: data.url,
      });

      // Redirect to Stripe Checkout
      window.location.href = data.url;

      // Note: Component will be unmounted after redirect, so we don't reset loading state

    } catch (err) {
      console.error('❌ Checkout error:', err);
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error.message);
      setIsLoading(false);

      // Callback: checkout failed
      onCheckoutError?.(error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Email input (only shown if email not provided) */}
      {showEmailInput && (
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      )}

      {/* Subscribe button */}
      <Button
        onClick={handleSubscribe}
        disabled={isLoading || (showEmailInput && !email)}
        variant={variant}
        className={fullWidth ? 'w-full' : ''}
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Checkout...
          </>
        ) : (
          buttonText
        )}
      </Button>

      {/* Error alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Security notice */}
      <p className="text-xs text-muted-foreground text-center">
        🔒 Secure payment powered by Stripe. Card + ACH Direct Debit accepted.
      </p>
    </div>
  );
}
