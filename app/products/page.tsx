'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProductGrid from '@/components/ProductGrid';
import { useDigitalCart } from '@/hooks/useDigitalCart';
import type { ShopifyProduct } from '@/types/shopify';

export default function ProductsPage() {
  const { addProductToCart } = useDigitalCart();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'TITLE' | 'PRICE' | 'BEST_SELLING' | 'CREATED_AT' | 'UPDATED_AT'>('UPDATED_AT');
  const [sortReverse, setSortReverse] = useState(false);

  // Handle product click (navigate to product page)
  const handleProductClick = (product: ShopifyProduct) => {
    router.push(`/products/${product.handle}`);
  };

  // Handle add to cart
  const handleAddToCart = async (product: ShopifyProduct, variantId: string) => {
    console.log('Adding to digital cart:', { product: product.title, variantId });
    
    // Use the digital cart system
    const result = await addProductToCart(product, { 
      variantId,
      licenseType: 'Personal', // Default license type
      quantity: 1 
    });
    
    if (result.success) {
      console.log('✅ Product added to digital cart successfully!');
    } else {
      console.error('❌ Failed to add to cart:', result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-gray-900">Products</h1>
              <p className="text-gray-600 mt-1">Discover our latest AI-powered solutions</p>
            </div>

            {/* Search and Sort Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-black focus:border-black sm:text-sm"
                />
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'TITLE' | 'PRICE' | 'BEST_SELLING' | 'CREATED_AT' | 'UPDATED_AT')}
                  aria-label="Sort products by"
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-black focus:border-black sm:text-sm rounded-md bg-white"
                >
                  <option value="UPDATED_AT">Latest</option>
                  <option value="TITLE">Name</option>
                  <option value="PRICE">Price</option>
                  <option value="BEST_SELLING">Best Selling</option>
                  <option value="CREATED_AT">Newest</option>
                </select>

                <button
                  onClick={() => setSortReverse(!sortReverse)}
                  className={`p-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black focus:border-black ${
                    sortReverse ? 'bg-gray-100' : ''
                  }`}
                  title={`Sort ${sortReverse ? 'ascending' : 'descending'}`}
                >
                  <svg
                    className={`h-5 w-5 text-gray-400 transition-transform ${sortReverse ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductGrid
          searchQuery={searchQuery}
          sortBy={sortBy}
          sortReverse={sortReverse}
          onProductClick={handleProductClick}
          onAddToCart={handleAddToCart}
          productsPerPage={16}
          showLoadMore={true}
          className="w-full"
        />
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              © 2024 Afilo. All rights reserved. Powered by Shopify.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}