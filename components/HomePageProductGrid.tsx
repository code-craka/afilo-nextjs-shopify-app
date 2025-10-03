'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ProductGrid from '@/components/ProductGrid';
import { useDigitalCart } from '@/hooks/useDigitalCart';

export default function HomePageProductGrid() {
  const { addProductToCart } = useDigitalCart();
  const router = useRouter();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 backdrop-blur-xl bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-blue-600 font-semibold text-sm">FEATURED PRODUCTS</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-4">
            Explore Our Latest{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Solutions
            </span>
          </h2>
          <p className="mt-4 text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto font-light">
            Discover cutting-edge tools that transform Fortune 500 companies worldwide
          </p>
        </motion.div>
      </div>

      <ProductGrid
        productsPerPage={8}
        showLoadMore={false}
        onProductClick={(product) => {
          router.push(`/products/${product.handle}`);
        }}
        onAddToCart={async (product, variantId) => {
          console.log('Adding to digital cart:', { product: product.title, variantId });

          const result = await addProductToCart(product, {
            variantId,
            licenseType: 'Personal', // Default license type
            quantity: 1,
          });

          if (result.success) {
            console.log('✅ Product added to digital cart successfully!');
          } else {
            console.error('❌ Failed to add to cart:', result.error);
          }
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-center mt-16"
      >
        <Link href="/products">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-2xl text-lg font-bold overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10 text-white">View All Products</span>
            <motion.svg
              className="relative z-10 w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </motion.svg>
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}