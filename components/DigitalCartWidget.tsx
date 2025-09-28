'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useDigitalCart } from '@/hooks/useDigitalCart';

export default function DigitalCartWidget() {
  const { 
    items, 
    isOpen, 
    totals, 
    toggleCart, 
    removeItem, 
    proceedToCheckout,
    cartSummary,
    changeLicense,
    adjustTeamSize
  } = useDigitalCart();


  // Don't render if no items
  if (items.length === 0) return null;

  return (
    <>
      {/* Cart Trigger Button */}
      <motion.button
        onClick={toggleCart}
        className="fixed bottom-6 right-6 z-50 bg-black text-white rounded-full p-4 shadow-lg hover:bg-gray-800 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="relative">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 1.5M7 13h10m-10 0l1.5-1.5m8.5 1.5H9" />
          </svg>
          
          {/* Item count badge */}
          {items.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {items.length}
            </span>
          )}
        </div>
      </motion.button>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleCart}
              className="fixed inset-0 z-40 bg-black bg-opacity-50"
            />

            {/* Cart Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Digital Cart ({items.length} {items.length === 1 ? 'license' : 'licenses'})
                  </h2>
                  <button
                    onClick={toggleCart}
                    className="p-1 rounded-md hover:bg-gray-100"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Cart Summary */}
                <div className="mt-2 text-sm text-gray-600">
                  {cartSummary.totalSeats} seats • {cartSummary.licenseTypes.join(', ')} licenses
                  {cartSummary.totalSavings > 0 && (
                    <span className="text-green-600 ml-2">
                      Save ${cartSummary.totalSavings.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                      {/* Product Info */}
                      <div className="flex items-start gap-3">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-12 h-12 rounded object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {item.vendor} • {item.productType}
                          </p>

                          {/* Tech Stack */}
                          {item.techStack.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {item.techStack.slice(0, 3).map((tech) => (
                                <span key={tech} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* License Configuration */}
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">License:</span>
                          <select
                            value={item.licenseType}
                            onChange={(e) => changeLicense(item.id, e.target.value as 'Personal' | 'Commercial' | 'Extended' | 'Enterprise')}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="Personal">Personal</option>
                            <option value="Commercial">Commercial</option>
                            <option value="Extended">Extended</option>
                            <option value="Enterprise">Enterprise</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Seats:</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => adjustTeamSize(item.id, Math.max(1, item.quantity - 1))}
                              className="w-6 h-6 bg-gray-200 rounded text-sm hover:bg-gray-300"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <button
                              onClick={() => adjustTeamSize(item.id, item.quantity + 1)}
                              className="w-6 h-6 bg-gray-200 rounded text-sm hover:bg-gray-300"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Price and Actions */}
                      <div className="mt-3 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900">
                            ${item.educationalDiscount.appliedPrice.toFixed(2)}
                          </div>
                          {item.educationalDiscount.appliedPrice < item.price && (
                            <div className="text-sm text-gray-500 line-through">
                              ${item.price.toFixed(2)}
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>

                      {/* License Features Preview */}
                      <div className="mt-2 text-xs text-gray-600">
                        {item.licenseTerms.commercialUse && '✓ Commercial use'}
                        {item.licenseTerms.sourceCodeIncluded && ' • ✓ Source code'}
                        {item.licenseTerms.extendedSupport && ' • ✓ Support'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer - Totals and Checkout */}
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                {/* Totals */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${totals.subtotal.toFixed(2)}</span>
                  </div>
                  
                  {totals.educationalDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Educational Discount:</span>
                      <span>-${totals.educationalDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {totals.bundleDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Bundle Discount:</span>
                      <span>-${totals.bundleDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {totals.tax.amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>{totals.tax.type}:</span>
                      <span>${totals.tax.amount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-300">
                    <span>Total:</span>
                    <span>${totals.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={proceedToCheckout}
                  className="w-full bg-black text-white py-3 px-4 rounded-md font-medium hover:bg-gray-800 transition-colors"
                >
                  Proceed to Checkout • Instant Access
                </button>
                
                <p className="text-xs text-gray-600 text-center mt-2">
                  🚀 Digital delivery • 📧 License via email
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}