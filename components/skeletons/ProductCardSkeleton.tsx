'use client';

import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Product Card Skeleton Component
 * Loading placeholder for product grid items
 * Matches dimensions of actual ProductGrid cards to prevent layout shift (CLS = 0)
 */
export default function ProductCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="relative group backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300"
    >
      {/* Image Skeleton */}
      <div className="relative w-full h-64 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
        <Skeleton className="w-full h-full" />

        {/* Premium Badge Skeleton */}
        <div className="absolute top-3 right-3">
          <Skeleton className="w-24 h-6 rounded-full" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-6 space-y-4">
        {/* Title */}
        <Skeleton className="h-7 w-3/4" />

        {/* Description Lines */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        {/* Tech Stack Badges */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>

        {/* Features List */}
        <div className="space-y-2 pt-2">
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        {/* Price and CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
          </div>
          <Skeleton className="h-12 w-32 rounded-xl" />
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Product Grid Skeleton
 * Shows multiple loading cards in grid layout
 */
export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} index={index} />
      ))}
    </div>
  );
}
