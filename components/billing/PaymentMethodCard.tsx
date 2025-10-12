/**
 * Payment Method Card Component
 *
 * Displays a single payment method (card or bank account) with:
 * - Brand icon and last 4 digits
 * - Expiry date (for cards)
 * - Default badge
 * - Action menu (set default, delete)
 *
 * Used by PaymentMethodsList component.
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Building2,
  MoreVertical,
  Trash2,
  Star,
  Check,
  Loader2,
} from 'lucide-react';
import { PaymentMethodData, formatBrandName } from '@/lib/billing/stripe-payment-methods';

interface PaymentMethodCardProps {
  paymentMethod: PaymentMethodData;
  onSetDefault?: (paymentMethodId: string) => Promise<void>;
  onRemove?: (paymentMethodId: string) => Promise<void>;
}

export default function PaymentMethodCard({
  paymentMethod,
  onSetDefault,
  onRemove,
}: PaymentMethodCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isSettingDefault, setIsSettingDefault] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleSetDefault = async () => {
    if (!onSetDefault) return;

    try {
      setIsSettingDefault(true);
      setShowMenu(false);
      await onSetDefault(paymentMethod.id);
    } catch (error) {
      console.error('Failed to set default:', error);
    } finally {
      setIsSettingDefault(false);
    }
  };

  const handleRemove = async () => {
    if (!onRemove) return;

    const confirmed = confirm(
      `Are you sure you want to remove this ${
        paymentMethod.type === 'card' ? 'card' : 'bank account'
      }?`
    );

    if (!confirmed) return;

    try {
      setIsRemoving(true);
      setShowMenu(false);
      await onRemove(paymentMethod.id);
    } catch (error) {
      console.error('Failed to remove:', error);
      setIsRemoving(false);
    }
  };

  // Get card brand icon
  const getCardIcon = () => {
    if (paymentMethod.type === 'us_bank_account') {
      return <Building2 className="h-8 w-8 text-blue-600" />;
    }

    // For cards, show CreditCard icon
    return <CreditCard className="h-8 w-8 text-purple-600" />;
  };

  // Format expiry date
  const formatExpiry = () => {
    if (paymentMethod.type === 'us_bank_account') {
      return paymentMethod.bankName || 'Bank Account';
    }

    if (paymentMethod.expMonth && paymentMethod.expYear) {
      return `Expires ${paymentMethod.expMonth}/${paymentMethod.expYear}`;
    }

    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`
        relative p-4 rounded-lg border-2 transition-all duration-200
        ${
          paymentMethod.isDefault
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 bg-white hover:border-gray-300'
        }
        ${isRemoving ? 'opacity-50 pointer-events-none' : ''}
      `}
    >
      {/* Loading Overlay */}
      {(isSettingDefault || isRemoving) && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg z-10">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      )}

      <div className="flex items-start justify-between">
        {/* Icon and Info */}
        <div className="flex items-center gap-4">
          {/* Brand Icon */}
          <div
            className={`
            p-3 rounded-lg
            ${
              paymentMethod.type === 'us_bank_account'
                ? 'bg-blue-100'
                : 'bg-purple-100'
            }
          `}
          >
            {getCardIcon()}
          </div>

          {/* Details */}
          <div>
            {/* Card Type/Brand */}
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-gray-900">
                {paymentMethod.type === 'card'
                  ? formatBrandName(paymentMethod.brand)
                  : 'Bank Account'}
              </p>
              {paymentMethod.isDefault && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                  <Check className="h-3 w-3" />
                  Default
                </span>
              )}
            </div>

            {/* Last 4 Digits */}
            <p className="text-sm text-gray-600 mb-1">
              •••• {paymentMethod.last4}
            </p>

            {/* Expiry or Bank Name */}
            {formatExpiry() && (
              <p className="text-xs text-gray-500">{formatExpiry()}</p>
            )}
          </div>
        </div>

        {/* Action Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSettingDefault || isRemoving}
          >
            <MoreVertical className="h-5 w-5 text-gray-600" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />

              {/* Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                {!paymentMethod.isDefault && onSetDefault && (
                  <button
                    onClick={handleSetDefault}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                  >
                    <Star className="h-4 w-4" />
                    Set as Default
                  </button>
                )}

                {onRemove && (
                  <button
                    onClick={handleRemove}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Additional Info for Bank Accounts */}
      {paymentMethod.type === 'us_bank_account' && paymentMethod.accountHolderType && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Account Holder:{' '}
            <span className="font-medium text-gray-700">
              {paymentMethod.accountHolderType === 'individual'
                ? 'Individual'
                : 'Company'}
            </span>
          </p>
        </div>
      )}
    </motion.div>
  );
}
