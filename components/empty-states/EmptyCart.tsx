'use client';

import { motion } from 'framer-motion';
import { ShoppingCart, Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Empty Cart State Component
 * Displayed when shopping cart has no items
 */
export default function EmptyCart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-12 px-4"
    >
      {/* Animated Cart Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 15,
          delay: 0.2
        }}
        className="relative mb-6"
      >
        <div className="w-24 h-24 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-full flex items-center justify-center backdrop-blur-xl border border-white/10">
          <ShoppingCart className="w-12 h-12 text-blue-400" />
        </div>

        {/* Floating Package Icon */}
        <motion.div
          className="absolute -top-1 -right-1"
          animate={{ y: [-2, 2, -2] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Package className="w-6 h-6 text-purple-400" />
        </motion.div>
      </motion.div>

      {/* Heading */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-xl font-bold text-white mb-2"
      >
        Your Cart is Empty
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-white/60 text-center max-w-sm mb-6"
      >
        Discover our enterprise software solutions and add products to get started.
      </motion.p>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          onClick={() => window.location.href = '/products'}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 group"
        >
          Browse Products
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </motion.div>
    </motion.div>
  );
}
