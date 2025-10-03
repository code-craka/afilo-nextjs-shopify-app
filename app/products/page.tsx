'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
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
      {/* Premium Navigation */}
      <Navigation />

      {/* Premium Header Section */}
      <div className="relative bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 pt-32 pb-20 overflow-hidden">
        {/* Gradient Orbs Background */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], x: [0, -50, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-white font-semibold text-sm">ALL PRODUCTS</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white mb-6">
              Explore Our{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Digital Products
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto font-light">
              Discover cutting-edge AI tools and premium software solutions
            </p>
          </motion.div>

          {/* Premium Search and Sort Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-12 max-w-4xl mx-auto"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Premium Search */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl leading-5 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 font-medium transition-all"
                />
              </div>

              {/* Premium Sort Controls */}
              <div className="flex items-center gap-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'TITLE' | 'PRICE' | 'BEST_SELLING' | 'CREATED_AT' | 'UPDATED_AT')}
                  aria-label="Sort products by"
                  className="block pl-4 pr-10 py-4 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="UPDATED_AT" className="bg-gray-900">Latest</option>
                  <option value="TITLE" className="bg-gray-900">Name</option>
                  <option value="PRICE" className="bg-gray-900">Price</option>
                  <option value="BEST_SELLING" className="bg-gray-900">Best Selling</option>
                  <option value="CREATED_AT" className="bg-gray-900">Newest</option>
                </select>

                <motion.button
                  onClick={() => setSortReverse(!sortReverse)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-4 backdrop-blur-xl rounded-2xl border transition-all ${
                    sortReverse
                      ? 'bg-blue-500/30 border-blue-400/50'
                      : 'bg-white/10 border-white/20 hover:bg-white/20'
                  }`}
                  title={`Sort ${sortReverse ? 'ascending' : 'descending'}`}
                >
                  <svg
                    className={`h-5 w-5 text-white transition-transform duration-300 ${sortReverse ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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

      {/* Premium Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 border-t border-white/10 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
              Afilo
            </h3>
            <p className="text-white/60 text-sm">
              © 2025 Afilo. All rights reserved. Powered by Shopify & Next.js.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}