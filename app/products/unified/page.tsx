'use client';

import { useUnifiedProducts } from '@/lib/queries/products';
import { PaymentMethodSelector } from '@/components/PaymentMethodSelector';
import { Loader2 } from 'lucide-react';

/**
 * Unified Products Page
 *
 * Shows products with dual payment option (Shopify OR Stripe)
 * This is the NEW product page for app.afilo.io
 */
export default function UnifiedProductsPage() {
  const { data, isLoading, error } = useUnifiedProducts({ active: true });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Failed to load products
          </h2>
          <p className="text-red-600">
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Subscription Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select your preferred payment method: one-time purchase or recurring subscription
          </p>
        </div>

        {/* Products Grid */}
        {data && data.products.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {data.products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Product Image */}
                {product.images.length > 0 && (
                  <div className="aspect-video bg-gradient-to-br from-purple-100 to-blue-100 overflow-hidden">
                    <img
                      src={product.images[0].url}
                      alt={product.images[0].alt || product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Product Info */}
                <div className="p-6">
                  <div className="mb-4">
                    {product.tier && (
                      <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full uppercase mb-2">
                        {product.tier}
                      </span>
                    )}
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Features */}
                  {product.features.length > 0 && (
                    <div className="mb-6 space-y-2">
                      {product.features.slice(0, 5).map((feature, index) => (
                        <div key={index} className="flex items-start text-sm text-gray-700">
                          <svg className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Payment Method Selector */}
                  <PaymentMethodSelector product={product} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">No products available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
