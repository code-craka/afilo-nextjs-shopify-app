'use client';

import Link from "next/link";
import ProductGrid from "@/components/ProductGrid";
import { useDigitalCart } from "@/hooks/useDigitalCart";
import type { ShopifyProduct } from "@/types/shopify";

export default function Home() {
  const { addProductToCart } = useDigitalCart();
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-6xl">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Afilo
              </span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              Your premier destination for AI-powered solutions and cutting-edge technology.
              Discover products that transform the way you work and create.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="bg-black text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                Shop Products
              </Link>
              <Link
                href="/test-shopify"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-md text-lg font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                API Testing
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Featured Products
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Explore our latest AI-powered tools and solutions
          </p>
        </div>

        {/* Product Grid */}
        <ProductGrid
          productsPerPage={8}
          showLoadMore={false}
          onProductClick={(product) => {
            console.log('Featured product clicked:', product.title);
          }}
          onAddToCart={async (product, variantId) => {
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
          }}
        />

        <div className="text-center mt-12">
          <Link
            href="/products"
            className="bg-black text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          >
            View All Products
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-gray-600">Built with Next.js 15 and optimized for performance</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered</h3>
              <p className="text-gray-600">Intelligent solutions that adapt to your needs</p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Reliable</h3>
              <p className="text-gray-600">Enterprise-grade security with 99.9% uptime</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Afilo</h3>
            <p className="text-gray-400 mb-8">
              Transforming the future with AI-powered solutions
            </p>
            <div className="flex justify-center space-x-6">
              <Link href="/products" className="text-gray-400 hover:text-white transition-colors">
                Products
              </Link>
              <Link href="/test-shopify" className="text-gray-400 hover:text-white transition-colors">
                API Testing
              </Link>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800">
              <p className="text-gray-400 text-sm">
                © 2024 Afilo. All rights reserved. Powered by Shopify & Next.js.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
