'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCreateStripeCheckout, useCreateShopifyCart, type UnifiedProduct } from '@/lib/queries/products';
import { Check, CreditCard, Repeat, Loader2 } from 'lucide-react';

interface PaymentMethodSelectorProps {
  product: UnifiedProduct;
  defaultMethod?: 'shopify' | 'stripe';
}

/**
 * Payment Method Selector Component
 *
 * Shows ONLY on app.afilo.io
 * Allows users to choose between:
 * - Shopify Checkout (one-time purchase)
 * - Stripe Subscription (recurring billing)
 *
 * Stripe is pre-selected by default for better margins
 */
export function PaymentMethodSelector({
  product,
  defaultMethod = 'stripe'
}: PaymentMethodSelectorProps) {
  const [method, setMethod] = useState<'shopify' | 'stripe'>(defaultMethod);
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('year');

  const stripeCheckout = useCreateStripeCheckout();
  const shopifyCart = useCreateShopifyCart();

  const isLoading = stripeCheckout.isPending || shopifyCart.isPending;

  // Calculate pricing
  const monthlyPrice = product.basePrice / 100;
  const annualPrice = (product.basePrice * 12 * 0.83) / 100; // 17% discount

  const handleCheckout = () => {
    if (method === 'stripe') {
      // Stripe subscription checkout
      const priceId = billingInterval === 'month'
        ? product.stripe.priceMonthly
        : product.stripe.priceAnnual;

      if (!priceId) {
        alert('Stripe price not available. Please contact support.');
        return;
      }

      stripeCheckout.mutate({ priceId, billingInterval });
    } else {
      // Shopify one-time checkout
      if (!product.shopify.variantId) {
        alert('Product variant not available. Please contact support.');
        return;
      }

      shopifyCart.mutate({ variantId: product.shopify.variantId, quantity: 1 });
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Method Choice */}
      <div className="border-2 border-gray-200 rounded-xl p-6 bg-white">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          Choose Your Payment Method
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Stripe Subscription Option (RECOMMENDED) */}
          {product.stripe.available && (
            <button
              onClick={() => setMethod('stripe')}
              disabled={isLoading}
              className={`relative p-6 border-2 rounded-lg text-left transition-all ${
                method === 'stripe'
                  ? 'border-purple-600 bg-purple-50 shadow-lg'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {/* Recommended Badge */}
              {method === 'stripe' && (
                <div className="absolute -top-3 left-4 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  RECOMMENDED
                </div>
              )}

              {/* Selection Indicator */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      method === 'stripe'
                        ? 'border-purple-600 bg-purple-600'
                        : 'border-gray-300'
                    }`}
                  >
                    {method === 'stripe' && (
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    )}
                  </div>
                  <Repeat className={`w-6 h-6 ${method === 'stripe' ? 'text-purple-600' : 'text-gray-400'}`} />
                </div>
              </div>

              <div className="font-semibold text-gray-900 mb-2">
                Stripe Subscription
              </div>

              <div className="text-sm text-gray-600 space-y-1 mb-4">
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                  <span>Monthly or annual billing</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                  <span>Automatic renewal</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                  <span>Instant email credentials</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                  <span>Cancel anytime</span>
                </div>
              </div>

              {/* Billing interval selection */}
              {method === 'stripe' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setBillingInterval('month');
                      }}
                      className={`flex-1 py-2 px-3 text-sm rounded-md font-medium transition-colors ${
                        billingInterval === 'month'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Monthly
                      <div className="text-xs mt-1">${monthlyPrice}/mo</div>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setBillingInterval('year');
                      }}
                      className={`flex-1 py-2 px-3 text-sm rounded-md font-medium transition-colors ${
                        billingInterval === 'year'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Annual
                      <div className="text-xs mt-1">
                        ${annualPrice.toFixed(2)}/yr
                        <span className="ml-1 text-green-400 font-bold">Save 17%</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </button>
          )}

          {/* Shopify One-Time Option */}
          {product.shopify.available && (
            <button
              onClick={() => setMethod('shopify')}
              disabled={isLoading}
              className={`p-6 border-2 rounded-lg text-left transition-all ${
                method === 'shopify'
                  ? 'border-blue-600 bg-blue-50 shadow-lg'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {/* Selection Indicator */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      method === 'shopify'
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-gray-300'
                    }`}
                  >
                    {method === 'shopify' && (
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    )}
                  </div>
                  <CreditCard className={`w-6 h-6 ${method === 'shopify' ? 'text-blue-600' : 'text-gray-400'}`} />
                </div>
              </div>

              <div className="font-semibold text-gray-900 mb-2">
                Shopify Checkout
              </div>

              <div className="text-sm text-gray-600 space-y-1 mb-4">
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                  <span>One-time payment</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                  <span>Standard checkout</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                  <span>Quick process</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                  <span>Lifetime access</span>
                </div>
              </div>

              {method === 'shopify' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-2xl font-bold text-gray-900">
                    {product.formattedPrice}
                    <span className="text-sm font-normal text-gray-600 ml-2">one-time</span>
                  </div>
                </div>
              )}
            </button>
          )}
        </div>

        {/* Error messages */}
        {stripeCheckout.isError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {stripeCheckout.error?.message || 'Checkout failed. Please try again.'}
          </div>
        )}

        {shopifyCart.isError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {shopifyCart.error?.message || 'Cart creation failed. Please try again.'}
          </div>
        )}
      </div>

      {/* Checkout Button */}
      <motion.button
        onClick={handleCheckout}
        disabled={isLoading}
        className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${
          method === 'stripe'
            ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl'
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        whileHover={!isLoading ? { scale: 1.02 } : {}}
        whileTap={!isLoading ? { scale: 0.98 } : {}}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing...
          </span>
        ) : method === 'stripe' ? (
          `Subscribe with Stripe • ${billingInterval === 'month' ? `$${monthlyPrice}/mo` : `$${annualPrice.toFixed(2)}/yr`}`
        ) : (
          `Proceed to Shopify Checkout • ${product.formattedPrice}`
        )}
      </motion.button>

      {/* Trust Indicators */}
      <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
        <div className="flex items-center">
          <svg className="w-4 h-4 text-green-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Secure Payment
        </div>
        <div className="flex items-center">
          <svg className="w-4 h-4 text-green-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Instant Access
        </div>
        <div className="flex items-center">
          <svg className="w-4 h-4 text-green-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
          Email Delivery
        </div>
      </div>
    </div>
  );
}
