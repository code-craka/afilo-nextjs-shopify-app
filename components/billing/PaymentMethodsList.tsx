/**
 * Payment Methods List Component
 *
 * Displays all saved payment methods for the authenticated user.
 * Features:
 * - Fetches payment methods from /api/billing/payment-methods/list
 * - Shows cards and bank accounts with PaymentMethodCard
 * - Handles set default and remove operations
 * - Loading states and error handling
 * - Empty state when no payment methods
 *
 * Used in /dashboard/billing page.
 */

'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Plus, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import PaymentMethodCard from './PaymentMethodCard';
import { PaymentMethodData } from '@/lib/billing/stripe-payment-methods';

interface PaymentMethodsListProps {
  onAddNew?: () => void;
}

export default function PaymentMethodsList({ onAddNew }: PaymentMethodsListProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch payment methods
  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/billing/payment-methods/list');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch payment methods');
      }

      setPaymentMethods(data.paymentMethods || []);
    } catch (err: any) {
      console.error('Failed to fetch payment methods:', err);
      setError(err.message || 'Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (paymentMethodId: string) => {
    try {
      const response = await fetch('/api/billing/payment-methods/set-default', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethodId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to set default payment method');
      }

      // Update local state
      setPaymentMethods((prev) =>
        prev.map((pm) => ({
          ...pm,
          isDefault: pm.id === paymentMethodId,
        }))
      );

      // Show success message (you can use a toast library here)
      console.log('✅ Default payment method updated');
    } catch (err: any) {
      console.error('Failed to set default:', err);
      alert(err.message || 'Failed to set default payment method');
      throw err;
    }
  };

  const handleRemove = async (paymentMethodId: string) => {
    try {
      const response = await fetch('/api/billing/payment-methods/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethodId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove payment method');
      }

      // Remove from local state
      setPaymentMethods((prev) => prev.filter((pm) => pm.id !== paymentMethodId));

      // Show success message
      console.log('✅ Payment method removed');
    } catch (err: any) {
      console.error('Failed to remove payment method:', err);
      alert(err.message || 'Failed to remove payment method');
      throw err;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Methods</h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Methods</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="font-semibold text-red-900">Failed to Load Payment Methods</p>
          </div>
          <p className="text-sm text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchPaymentMethods}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (paymentMethods.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Payment Methods</h2>
          {onAddNew && (
            <button
              onClick={onAddNew}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Payment Method
            </button>
          )}
        </div>
        <div className="text-center py-12">
          <CreditCard className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-2">No payment methods added yet</p>
          <p className="text-sm text-gray-500 mb-6">
            Add a card or bank account to manage your subscriptions
          </p>
          {onAddNew && (
            <button
              onClick={onAddNew}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              <Plus className="h-5 w-5" />
              Add Your First Payment Method
            </button>
          )}
        </div>
      </div>
    );
  }

  // Payment methods grid
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Payment Methods</h2>
          <p className="text-sm text-gray-500 mt-1">
            {paymentMethods.length} {paymentMethods.length === 1 ? 'method' : 'methods'} saved
          </p>
        </div>
        {onAddNew && (
          <button
            onClick={onAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add New
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {paymentMethods.map((pm) => (
            <PaymentMethodCard
              key={pm.id}
              paymentMethod={pm}
              onSetDefault={handleSetDefault}
              onRemove={handleRemove}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Refresh Button */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={fetchPaymentMethods}
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Payment Methods
        </button>
      </div>
    </div>
  );
}
