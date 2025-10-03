'use client';

import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Pricing Card Skeleton Component
 * Loading placeholder for subscription pricing cards
 * Matches PremiumPricingDisplay card dimensions
 */
export default function PricingCardSkeleton({ index = 0, featured = false }: { index?: number; featured?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: featured ? -10 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.15 }}
      className={`relative backdrop-blur-xl bg-white/5 border rounded-2xl p-8 ${
        featured
          ? 'border-blue-500/50 scale-105 shadow-2xl shadow-blue-500/20'
          : 'border-white/10'
      }`}
    >
      {/* Featured Badge */}
      {featured && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <Skeleton className="h-8 w-32 rounded-full" />
        </div>
      )}

      {/* Plan Name */}
      <div className="text-center mb-6">
        <Skeleton className="h-8 w-40 mx-auto mb-2" />
        <Skeleton className="h-4 w-56 mx-auto" />
      </div>

      {/* Price */}
      <div className="text-center mb-8">
        <div className="flex items-baseline justify-center gap-2 mb-2">
          <Skeleton className="h-12 w-24" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>

      {/* Features List */}
      <div className="space-y-4 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5" />
            <Skeleton className="h-5 flex-1" />
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <Skeleton className="h-12 w-full rounded-xl" />
    </motion.div>
  );
}

/**
 * Pricing Grid Skeleton
 * Shows multiple pricing cards in grid layout
 */
export function PricingGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
      {Array.from({ length: count }).map((_, index) => (
        <PricingCardSkeleton
          key={index}
          index={index}
          featured={index === 1} // Make second card featured (Business plan)
        />
      ))}
    </div>
  );
}
