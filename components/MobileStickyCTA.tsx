'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Heart, Share2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MobileStickyCTAProps {
  productTitle: string;
  productPrice: number;
  comparePrice?: number | null;
  selectedVariant?: {
    id: string;
    title: string;
    price: number;
  } | null;
  onAddToCart: () => void;
  onWishlist: () => void;
  onShare: () => void;
  isWishlisted?: boolean;
  className?: string;
}

export function MobileStickyCTA({
  productTitle,
  productPrice,
  comparePrice,
  selectedVariant,
  onAddToCart,
  onWishlist,
  onShare,
  isWishlisted = false,
  className = '',
}: MobileStickyCTAProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // Smart scroll hide/show behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show when scrolling up, hide when scrolling down
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    // Only activate on mobile devices
    if (window.innerWidth < 768) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [lastScrollY]);

  // Calculate discount percentage
  const discount = comparePrice && comparePrice > productPrice
    ? Math.round(((comparePrice - productPrice) / comparePrice) * 100)
    : null;

  // Don't render on desktop
  if (typeof window !== 'undefined' && window.innerWidth >= 768) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-2xl md:hidden ${className}`}
        >
          {/* Expanded Info Panel */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-b border-gray-200 dark:border-gray-700"
              >
                <div className="p-4 space-y-3">
                  {/* Product Title */}
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 flex-1">
                      {productTitle}
                    </h3>
                    <button
                      onClick={() => setIsExpanded(false)}
                      className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Selected Variant */}
                  {selectedVariant && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">License:</span>
                      <Badge variant="info" className="text-xs">
                        {selectedVariant.title}
                      </Badge>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onWishlist}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border transition-colors ${
                        isWishlisted
                          ? 'border-red-500 text-red-500 bg-red-50 dark:bg-red-900/20'
                          : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
                      <span className="text-xs font-medium">
                        {isWishlisted ? 'Saved' : 'Save'}
                      </span>
                    </button>

                    <button
                      onClick={onShare}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 transition-colors"
                    >
                      <Share2 className="h-4 w-4" />
                      <span className="text-xs font-medium">Share</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main CTA Bar */}
          <div className="p-3 safe-area-bottom">
            <div className="flex items-center gap-3">
              {/* Price Section */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex flex-col items-start min-w-0"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    ${selectedVariant ? selectedVariant.price.toFixed(2) : productPrice.toFixed(2)}
                  </span>
                  {discount && (
                    <Badge variant="destructive" className="text-xs">
                      {discount}% OFF
                    </Badge>
                  )}
                </div>
                {comparePrice && comparePrice > productPrice && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                    ${comparePrice.toFixed(2)}
                  </span>
                )}
              </button>

              {/* Add to Cart Button */}
              <button
                onClick={onAddToCart}
                disabled={!selectedVariant}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg min-h-[44px]"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
