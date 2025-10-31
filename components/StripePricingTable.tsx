'use client';

/**
 * Comprehensive Stripe Pricing Table Component
 * Displays all products with features and pricing from Stripe
 */

import { useState, useEffect } from 'react';

interface PriceInfo {
  id: string;
  amount: number;
  currency: string;
  interval?: string;
  nickname?: string;
}

interface ProductInfo {
  id: string;
  name: string;
  description: string;
  features: string[];
  prices: PriceInfo[];
  type: 'subscription' | 'one-time';
}

export default function StripePricingTable() {
  const [products, setProducts] = useState<ProductInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'subscription' | 'one-time'>('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products/stripe-pricing');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (priceId: string, isSubscription: boolean) => {
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          mode: isSubscription ? 'subscription' : 'payment',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Modern approach: redirect directly to the checkout URL
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Failed to start checkout. Please try again.');
    }
  };

  const filteredProducts = products.filter(
    p => filter === 'all' || p.type === filter
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pricing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Choose Your Perfect Plan
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Professional digital products and tools to accelerate your business
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            All Products
          </button>
          <button
            onClick={() => setFilter('subscription')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'subscription'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            Subscriptions
          </button>
          <button
            onClick={() => setFilter('one-time')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'one-time'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            One-Time Purchase
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.map(product => (
          <div
            key={product.id}
            className="relative flex flex-col bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow overflow-hidden"
          >
            {/* Product Badge */}
            <div className="absolute top-4 right-4">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  product.type === 'subscription'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {product.type === 'subscription' ? 'Subscription' : 'One-Time'}
              </span>
            </div>

            {/* Product Header */}
            <div className="p-6 pb-0">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {product.name}
              </h3>
              <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                {product.description}
              </p>
            </div>

            {/* Features List */}
            {product.features.length > 0 && (
              <div className="px-6 py-4 flex-grow">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  Features included:
                </h4>
                <ul className="space-y-2">
                  {product.features.slice(0, 5).map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg
                        className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                  {product.features.length > 5 && (
                    <li className="text-sm text-gray-500 ml-7">
                      +{product.features.length - 5} more features
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Pricing Options */}
            <div className="p-6 pt-4 border-t border-gray-100">
              {product.prices.length === 1 ? (
                // Single price - simple display
                <div className="space-y-4">
                  <div>
                    <p className="text-3xl font-bold text-gray-900">
                      ${(product.prices[0].amount / 100).toFixed(2)}
                      {product.prices[0].interval && (
                        <span className="text-lg font-normal text-gray-600">
                          /{product.prices[0].interval}
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleCheckout(
                        product.prices[0].id,
                        product.type === 'subscription'
                      )
                    }
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Get Started
                  </button>
                </div>
              ) : (
                // Multiple prices - show options
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Choose your plan:
                  </p>
                  {product.prices.map(price => (
                    <button
                      key={price.id}
                      onClick={() =>
                        handleCheckout(price.id, product.type === 'subscription')
                      }
                      className="w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-3 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-900">
                        {price.nickname || 'Standard'}
                      </span>
                      <span className="text-lg font-bold text-gray-900">
                        ${(price.amount / 100).toFixed(2)}
                        {price.interval && (
                          <span className="text-xs font-normal text-gray-600">
                            /{price.interval}
                          </span>
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* No Products Message */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            No {filter !== 'all' && filter} products found.
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-16 text-center">
        <p className="text-gray-600 mb-2">
          All payments are secure and encrypted
        </p>
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
          <span>🔒 SSL Secured</span>
          <span>•</span>
          <span>💳 Stripe Verified</span>
          <span>•</span>
          <span>✓ Money-back Guarantee</span>
        </div>
      </div>
    </div>
  );
}
