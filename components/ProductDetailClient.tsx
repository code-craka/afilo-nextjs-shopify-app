'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useDigitalCart } from '@/hooks/useDigitalCart';
import type { ShopifyProduct } from '@/types/shopify';

interface ProductDetailClientProps {
  product: ShopifyProduct;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addProductToCart } = useDigitalCart();
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants.edges[0]?.node.id);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async () => {
    if (!selectedVariantId) return;

    setIsLoading(true);
    const result = await addProductToCart(product, {
      variantId: selectedVariantId,
      quantity: 1,
    });

    if (result.success) {
      console.log('✅ Product added to cart');
    } else {
      console.error('❌ Failed to add to cart:', result.error);
    }
    setIsLoading(false);
  };

  const primaryImage = product.featuredImage || product.images.edges[0]?.node;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid md:grid-cols-2 gap-12">
        {/* Product Image Gallery */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          {primaryImage && (
            <div className="aspect-square relative rounded-xl overflow-hidden shadow-lg">
              <Image
                src={primaryImage.url}
                alt={primaryImage.altText || product.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          )}
          <div className="grid grid-cols-4 gap-4">
            {product.images.edges.slice(0, 4).map(({ node: image }) => (
              <div key={image.id} className="aspect-square relative rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 cursor-pointer">
                <Image
                  src={image.url}
                  alt={image.altText || ''}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Product Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col justify-center"
        >
          <div className="mb-4">
            <span className="text-sm font-semibold text-blue-600 uppercase">{product.vendor}</span>
            <h1 className="text-4xl font-bold text-gray-900 mt-1">{product.title}</h1>
          </div>

          <div className="mb-6 text-lg text-gray-600" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />

          <div className="mb-8">
            <span className="text-3xl font-bold text-gray-900">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: product.priceRange.minVariantPrice.currencyCode }).format(
                parseFloat(product.priceRange.minVariantPrice.amount)
              )}
            </span>
          </div>

          {/* Variant Selector (if more than one variant) */}
          {product.variants.edges.length > 1 && (
            <div className="mb-8">
              <label htmlFor="variant-select" className="block text-sm font-medium text-gray-700 mb-2">Select Option</label>
              <select
                id="variant-select"
                value={selectedVariantId}
                onChange={(e) => setSelectedVariantId(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                {product.variants.edges.map(({ node: variant }) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!product.availableForSale || isLoading}
            className="w-full bg-black text-white py-4 px-6 rounded-lg text-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Adding...</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 1.5M7 13h10m-10 0l1.5-1.5m8.5 1.5H9" />
                </svg>
                <span>Add to Cart</span>
              </>
            )}
          </button>
          {!product.availableForSale && (
            <p className="text-center text-red-600 mt-4">This product is currently unavailable.</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}