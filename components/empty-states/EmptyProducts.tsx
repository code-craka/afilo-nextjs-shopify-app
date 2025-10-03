'use client';

import { motion } from 'framer-motion';
import { Package, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Empty Products State Component
 * Displayed when no products are found (filtered search or empty catalog)
 */
export default function EmptyProducts({
  hasFilters = false,
  onClearFilters,
}: {
  hasFilters?: boolean;
  onClearFilters?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-20 px-4"
    >
      {/* Animated Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 15,
          delay: 0.2
        }}
        className="relative mb-8"
      >
        <div className="w-32 h-32 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-full flex items-center justify-center backdrop-blur-xl border border-white/10">
          {hasFilters ? (
            <Filter className="w-16 h-16 text-blue-400" />
          ) : (
            <Package className="w-16 h-16 text-blue-400" />
          )}
        </div>

        {/* Pulse Animation */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-full"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      {/* Heading */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold text-white mb-3"
      >
        {hasFilters ? 'No Products Match Your Filters' : 'No Products Available'}
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-white/60 text-center max-w-md mb-8"
      >
        {hasFilters
          ? 'Try adjusting your search criteria or clearing filters to see more products.'
          : 'Check back soon for new enterprise software solutions and digital products.'}
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        {hasFilters && onClearFilters ? (
          <Button
            onClick={onClearFilters}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
          >
            <Filter className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
        ) : (
          <Button
            onClick={() => window.location.href = '/'}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
          >
            Browse Home
          </Button>
        )}

        <Button
          onClick={() => window.location.href = '/contact'}
          variant="secondary"
          className="border border-white/20 bg-white/5 hover:bg-white/10"
        >
          <Search className="w-4 h-4 mr-2" />
          Request Custom Product
        </Button>
      </motion.div>
    </motion.div>
  );
}
