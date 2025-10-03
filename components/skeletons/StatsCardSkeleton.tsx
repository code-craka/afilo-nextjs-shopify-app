'use client';

import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Stats Card Skeleton Component
 * Loading placeholder for metrics dashboard cards
 * Matches LiveMetricsDashboard card dimensions
 */
export default function StatsCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6"
    >
      {/* Icon and Label */}
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <Skeleton className="w-16 h-6 rounded-full" />
      </div>

      {/* Metric Value */}
      <Skeleton className="h-10 w-32 mb-2" />

      {/* Metric Label */}
      <Skeleton className="h-4 w-24 mb-4" />

      {/* Trend Indicator */}
      <div className="flex items-center gap-2">
        <Skeleton className="w-5 h-5 rounded-full" />
        <Skeleton className="h-4 w-20" />
      </div>
    </motion.div>
  );
}

/**
 * Stats Grid Skeleton
 * Shows multiple stats cards in grid layout
 */
export function StatsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <StatsCardSkeleton key={index} index={index} />
      ))}
    </div>
  );
}
