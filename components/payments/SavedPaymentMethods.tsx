'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface PaymentMethod {
  id: string;
  type: 'card' | 'us_bank_account';
  brand?: string;
  last4: string;
  expMonth?: number;
  expYear?: number;
  isDefault: boolean;
}

interface SavedPaymentMethodsProps {
  customerId: string;
  onSelectPaymentMethod: (paymentMethodId: string) => void;
  selectedPaymentMethodId?: string | null;
  className?: string;
}

/**
 * Saved Payment Methods Component
 *
 * Displays customer's saved payment methods for quick checkout.
 * Includes one-click selection and visual feedback.
 *
 * Features:
 * - Grid layout with card previews
 * - Default payment method badge
 * - One-click selection
 * - Expiration date display
 * - Auto-loads on mount
 *
 * @example
 * <SavedPaymentMethods
 *   customerId="cus_123"
 *   onSelectPaymentMethod={(id) => processPayment(id)}
 *   selectedPaymentMethodId={selectedId}
 * />
 */
export function SavedPaymentMethods({
  customerId,
  onSelectPaymentMethod,
  selectedPaymentMethodId,
  className = '',
}: SavedPaymentMethodsProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(
    selectedPaymentMethodId || null
  );

  useEffect(() => {
    loadPaymentMethods();
  }, [customerId]);

  const loadPaymentMethods = async () => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/billing/payment-methods/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId }),
      });

      if (!response.ok) {
        throw new Error('Failed to load payment methods');
      }

      const data = await response.json();
      setPaymentMethods(data.paymentMethods || []);

      // Auto-select default payment method
      const defaultMethod = data.paymentMethods?.find((pm: PaymentMethod) => pm.isDefault);
      if (defaultMethod && !selectedId) {
        setSelectedId(defaultMethod.id);
        onSelectPaymentMethod(defaultMethod.id);
      }
    } catch (error: unknown) {
      console.error('Error loading payment methods:', error);
      toast.error('Failed to load saved payment methods');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (paymentMethodId: string) => {
    setSelectedId(paymentMethodId);
    onSelectPaymentMethod(paymentMethodId);
    toast.success('Payment method selected');
  };

  const formatBrand = (brand?: string) => {
    if (!brand) return 'Card';
    return brand.charAt(0).toUpperCase() + brand.slice(1);
  };

  if (isLoading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-20 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg"
          />
        ))}
      </div>
    );
  }

  if (paymentMethods.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 dark:text-gray-400">
          No saved payment methods
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Add a payment method to enable faster checkout
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Saved Payment Methods
      </h3>

      {paymentMethods.map((pm) => (
        <motion.button
          key={pm.id}
          onClick={() => handleSelect(pm.id)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`
            w-full p-4 rounded-lg border-2 transition-all
            flex items-center justify-between
            ${
              selectedId === pm.id
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }
          `}
        >
          <div className="flex items-center gap-4">
            <div
              className={`
              w-12 h-12 rounded-lg flex items-center justify-center
              ${
                selectedId === pm.id
                  ? 'bg-purple-100 dark:bg-purple-800'
                  : 'bg-gray-100 dark:bg-gray-800'
              }
            `}
            >
              <CreditCard
                className={`w-6 h-6 ${
                  selectedId === pm.id
                    ? 'text-purple-600 dark:text-purple-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              />
            </div>

            <div className="text-left">
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {pm.type === 'card'
                    ? `${formatBrand(pm.brand)} •••• ${pm.last4}`
                    : `Bank Account •••• ${pm.last4}`}
                </p>
                {pm.isDefault && (
                  <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                    Default
                  </span>
                )}
              </div>
              {pm.expMonth && pm.expYear && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Expires {pm.expMonth}/{pm.expYear}
                </p>
              )}
            </div>
          </div>

          {selectedId === pm.id && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center"
            >
              <Check className="w-4 h-4 text-white" />
            </motion.div>
          )}
        </motion.button>
      ))}
    </div>
  );
}
