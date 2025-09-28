'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import ProductGrid from "@/components/ProductGrid";
import { useDigitalCart } from "@/hooks/useDigitalCart";
import type { ShopifyProduct } from "@/types/shopify";

export default function Home() {
  const { addProductToCart } = useDigitalCart();
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Premium Hero Section */}
      <div className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-8">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.664 1.319a.75.75 0 01.672 0 41.059 41.059 0 018.198 5.424.75.75 0 01-.254 1.285 31.372 31.372 0 00-7.86 3.83.75.75 0 01-.84 0 31.508 31.508 0 00-2.08-1.287V9.394c0-.244.116-.463.302-.592a35.504 35.504 0 013.305-2.033.75.75 0 00-.714-1.319 37 37 0 00-3.446 2.12A2.216 2.216 0 006 9.393v.38a31.293 31.293 0 00-4.28-1.746.75.75 0 01-.254-1.285 41.059 41.059 0 018.198-5.424zM6 11.459a29.848 29.848 0 00-2.455-1.158 41.029 41.029 0 00-.39 3.114.75.75 0 00.419.74c.528.256 1.046.53 1.554.82-.21-.324-.455-.63-.739-.914a.75.75 0 111.06-1.06c.37.369.69.77.96 1.193a26.61 26.61 0 013.095 2.348.75.75 0 00.992 0 26.547 26.547 0 015.93-3.95.75.75 0 00.42-.739 41.029 41.029 0 00-.39-3.114 29.925 29.925 0 00-5.199 2.801 2.25 2.25 0 01-2.514 0c-.41-.275-.826-.541-1.25-.797a6.985 6.985 0 01-1.084-.63 16.724 16.724 0 01-.549-.415z" clipRule="evenodd" />
              </svg>
              Enterprise Software Solutions
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Afilo
              </span>
            </h1>

            <p className="mt-6 text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto">
              Your premier destination for enterprise-grade AI solutions and cutting-edge technology.
              Discover software that transforms Fortune 500 companies worldwide.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/enterprise"
                className="bg-white text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
              >
                Enterprise Solutions
              </Link>
              <Link
                href="/products"
                className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
              >
                Browse Products
              </Link>
              <Link
                href="/test-shopify"
                className="text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-white/10 transition-colors"
              >
                API Demo
              </Link>
            </div>

            {/* Enterprise Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
              {[
                { value: '$50M+', label: 'Enterprise Revenue' },
                { value: '500+', label: 'Fortune 500 Clients' },
                { value: '99.99%', label: 'Uptime SLA' },
                { value: '150+', label: 'Countries Served' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-2xl md:text-3xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-gray-300 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
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
