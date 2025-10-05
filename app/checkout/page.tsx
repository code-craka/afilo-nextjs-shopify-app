'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';

/**
 * Checkout Page - Processes cart checkout after authentication
 *
 * Flow:
 * 1. User adds items to cart on /products
 * 2. Clicks "Proceed to Checkout" → redirected to /sign-in
 * 3. After sign-in → redirected HERE to /checkout
 * 4. This page retrieves cart from sessionStorage
 * 5. Creates Stripe checkout session
 * 6. Redirects to Stripe checkout
 */
export default function CheckoutPage() {
  const { isLoaded, userId, user } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'processing' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function processCheckout() {
      // Wait for Clerk to load
      if (!isLoaded) return;

      // Redirect to sign-in if not authenticated
      if (!userId) {
        router.push('/sign-in?redirect_url=/checkout');
        return;
      }

      try {
        setStatus('processing');

        // Retrieve checkout intent from sessionStorage
        const checkoutIntentStr = sessionStorage.getItem('checkout_intent');

        if (!checkoutIntentStr) {
          console.error('No checkout intent found in sessionStorage');
          setError('Your cart has expired. Please add items again.');
          setTimeout(() => router.push('/products'), 3000);
          return;
        }

        const checkoutIntent = JSON.parse(checkoutIntentStr);

        // Check if checkout intent is recent (within 30 minutes)
        const intentAge = Date.now() - checkoutIntent.timestamp;
        if (intentAge > 30 * 60 * 1000) {
          console.error('Checkout intent expired (older than 30 minutes)');
          sessionStorage.removeItem('checkout_intent');
          setError('Your cart has expired. Please add items again.');
          setTimeout(() => router.push('/products'), 3000);
          return;
        }

        console.log('Processing checkout with items:', checkoutIntent.items);

        // Create Stripe Checkout Session
        const response = await fetch('/api/stripe/create-cart-checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: checkoutIntent.items,
            userEmail: user?.primaryEmailAddress?.emailAddress,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create checkout session');
        }

        const { url: checkoutUrl } = await response.json();

        if (!checkoutUrl) {
          throw new Error('No checkout URL returned');
        }

        // Clear checkout intent from sessionStorage
        sessionStorage.removeItem('checkout_intent');

        console.log('Redirecting to Stripe checkout:', checkoutUrl);

        // Redirect to Stripe checkout
        window.location.href = checkoutUrl;

      } catch (err) {
        console.error('Checkout processing error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Checkout failed';
        setError(errorMessage);
        setStatus('error');
      }
    }

    processCheckout();
  }, [isLoaded, userId, user, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        {status === 'loading' || status === 'processing' ? (
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {status === 'loading' ? 'Loading...' : 'Processing Checkout'}
            </h2>
            <p className="text-gray-600">
              {status === 'loading'
                ? 'Please wait while we prepare your checkout...'
                : 'Creating secure checkout session...'}
            </p>
            <p className="text-sm text-gray-500 mt-4">
              You will be redirected to Stripe checkout shortly.
            </p>
          </div>
        ) : (
          <div className="text-center">
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Checkout Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/products')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Return to Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
