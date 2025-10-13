'use client';

import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Cart Badge Component
 *
 * Displays cart icon with item count badge
 * Opens cart slideout on click
 */

export default function CartBadge() {
  const { itemCount, openCart } = useCartStore();
  const count = itemCount();

  return (
    <button
      onClick={openCart}
      className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      aria-label={`Open cart (${count} items)`}
    >
      <ShoppingCart className="h-6 w-6 text-gray-700" />

      {/* Item Count Badge */}
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center"
          >
            {count > 99 ? '99+' : count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
