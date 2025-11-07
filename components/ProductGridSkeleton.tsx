'use client';

import { motion } from 'framer-motion';

const ProductCardSkeleton = ({ index }: { index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="group relative backdrop-blur-xl bg-white/80 border border-gray-200/50 rounded-3xl overflow-hidden"
  >
    {/* Image Skeleton */}
    <div className="relative aspect-square bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />

    {/* Content Skeleton */}
    <div className="relative p-6 space-y-4">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
        <div className="h-6 bg-gray-200 rounded w-12 animate-pulse" />
      </div>

      {/* Title */}
      <div className="space-y-2">
        <div className="h-5 bg-gray-200 rounded w-full animate-pulse" />
        <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
      </div>

      {/* Tech Stack Badges */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-6 bg-gray-200 rounded-xl animate-pulse"
            style={{ width: `${60 + i * 20}px` }}
          />
        ))}
      </div>

      {/* Price and License */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col space-y-1">
          <div className="h-5 bg-gray-200 rounded w-20 animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
        </div>
        <div className="text-right space-y-1">
          <div className="h-4 bg-gray-200 rounded w-12 animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <div className="flex-1 h-12 bg-gray-200 rounded-2xl animate-pulse" />
        <div className="h-12 w-12 bg-gray-200 rounded-2xl animate-pulse" />
      </div>
    </div>
  </motion.div>
);

const HeaderSkeleton = () => (
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
          Loading cutting-edge AI tools and premium software solutions...
        </p>
      </motion.div>

      {/* Search and Sort Skeleton */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-12 max-w-4xl mx-auto"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 h-14 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl animate-pulse" />
          <div className="flex items-center gap-3">
            <div className="h-14 w-32 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl animate-pulse" />
            <div className="h-14 w-14 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl animate-pulse" />
          </div>
        </div>
      </motion.div>
    </div>
  </div>
);

export default function ProductGridSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <HeaderSkeleton />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 16 }).map((_, index) => (
            <ProductCardSkeleton key={index} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

