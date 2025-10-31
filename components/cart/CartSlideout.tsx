'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Trash2, Loader2 } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

/**
 * Cart Slideout Component
 *
 * Industry-standard cart preview with:
 * - Slide-in animation from right
 * - Item list with quantity controls
 * - License type toggle
 * - Real-time subtotal
 * - Checkout button
 */

export default function CartSlideout() {
  const router = useRouter();
  const {
    items,
    isOpen,
    isLoading,
    closeCart,
    removeItem,
    updateQuantity,
    updateLicenseType,
    itemCount,
    subtotal,
  } = useCartStore();

  const handleCheckout = () => {
    closeCart();
    router.push('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          {/* Slideout Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-5 w-5 text-gray-700" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Your Cart
                </h2>
                {itemCount() > 0 && (
                  <span className="bg-blue-600 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                    {itemCount()}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={closeCart}
                className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                aria-label="Close cart"
                title="Close cart"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                  <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Start shopping to add items to your cart
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      closeCart();
                      router.push('/products');
                    }}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    aria-label="Browse products"
                    title="Browse our product catalog"
                  >
                    Browse Products
                  </button>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="bg-gray-50 rounded-lg p-4 relative"
                    >
                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        disabled={isLoading}
                        className="absolute top-3 right-3 p-1 rounded-md hover:bg-red-100 text-red-600 transition-colors disabled:opacity-50"
                        aria-label={`Remove ${item.title} from cart`}
                        title={`Remove ${item.title} from cart`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      {/* Product Info */}
                      <div className="flex gap-3 pr-8">
                        {item.imageUrl && (
                          <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-200">
                            <Image
                              src={item.imageUrl}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 text-sm mb-1 truncate">
                            {item.title}
                          </h3>
                          <p className="text-sm font-semibold text-gray-900">
                            ${item.price.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* License Type */}
                      <div className="mt-3 flex items-center justify-between">
                        <label
                          htmlFor={`license-${item.id}`}
                          className="text-xs font-medium text-gray-600"
                        >
                          License:
                        </label>
                        <select
                          id={`license-${item.id}`}
                          value={item.licenseType}
                          onChange={(e) =>
                            updateLicenseType(
                              item.id,
                              e.target.value as 'personal' | 'commercial'
                            )
                          }
                          disabled={isLoading}
                          className="text-xs border border-gray-300 rounded px-2 py-1 bg-white disabled:opacity-50"
                          aria-label={`Select license type for ${item.title}`}
                          title={`Select license type for ${item.title}`}
                        >
                          <option value="personal">Personal</option>
                          <option value="commercial">Commercial</option>
                        </select>
                      </div>

                      {/* Quantity Controls */}
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-600">
                          Quantity:
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.id, Math.max(1, item.quantity - 1))
                            }
                            disabled={isLoading || item.quantity <= 1}
                            className="w-7 h-7 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 text-sm font-medium"
                            aria-label={`Decrease quantity for ${item.title}`}
                            title="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm font-medium" aria-live="polite">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={isLoading}
                            className="w-7 h-7 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 text-sm font-medium"
                            aria-label={`Increase quantity for ${item.title}`}
                            title="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer - Totals & Checkout */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 bg-gray-50 p-6 space-y-4">
                {/* Subtotal */}
                <div className="flex items-center justify-between text-base">
                  <span className="font-medium text-gray-700">Subtotal:</span>
                  <span className="font-semibold text-gray-900">
                    ${subtotal().toFixed(2)}
                  </span>
                </div>

                {/* Tax Note */}
                <p className="text-xs text-gray-600">
                  Taxes and shipping calculated at checkout
                </p>

                {/* Checkout Button */}
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  aria-label="Proceed to checkout"
                  title="Proceed to checkout"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Proceed to Checkout</span>
                      <span>→</span>
                    </>
                  )}
                </button>

                {/* Continue Shopping */}
                <button
                  type="button"
                  onClick={() => {
                    closeCart();
                    router.push('/products');
                  }}
                  className="w-full text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
                  aria-label="Continue shopping"
                  title="Continue browsing products"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
