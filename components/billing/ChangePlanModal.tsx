/**
 * Change Plan Modal Component
 *
 * Modal for upgrading/downgrading subscription plans.
 * Features:
 * - Display all available plans with pricing
 * - Show current plan
 * - Calculate prorated billing preview
 * - Handles plan change via API
 * - Success/error states
 *
 * Used by ActiveSubscriptionCard component.
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { PLAN_CONFIGS, formatCurrency } from '@/lib/billing/stripe-subscriptions';

interface ChangePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlanId: string;
  currentInterval: 'month' | 'year';
  onSuccess?: () => void;
}

export default function ChangePlanModal({
  isOpen,
  onClose,
  currentPlanId,
  currentInterval,
  onSuccess,
}: ChangePlanModalProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(currentPlanId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Get all plans
  const plans = [
    {
      key: 'professional',
      ...PLAN_CONFIGS.professional,
    },
    {
      key: 'business',
      ...PLAN_CONFIGS.business,
    },
    {
      key: 'enterprise',
      ...PLAN_CONFIGS.enterprise,
    },
    {
      key: 'enterprisePlus',
      ...PLAN_CONFIGS.enterprisePlus,
    },
  ];

  const handleChangePlan = async () => {
    if (selectedPlanId === currentPlanId) {
      setError('Please select a different plan');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/billing/subscriptions/change-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPriceId: selectedPlanId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change plan');
      }

      setSuccess(true);

      // Wait to show success message
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Failed to change plan:', err);
      setError(err.message || 'Failed to change plan');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Success state
  if (success) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
            />

            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Plan Changed Successfully!
                </h3>
                <p className="text-sm text-gray-600">
                  Your subscription has been updated. Changes take effect immediately.
                </p>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Change Plan</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Select a new plan - changes take effect immediately
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  aria-label="Close modal"
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {/* Plans Grid */}
                <div className="space-y-3">
                  {plans.map((plan) => {
                    const priceId =
                      currentInterval === 'year' ? plan.annualPriceId : plan.monthlyPriceId;
                    const amount =
                      currentInterval === 'year' ? plan.annualAmount : plan.monthlyAmount;
                    const isCurrent = priceId === currentPlanId;
                    const isSelected = priceId === selectedPlanId;

                    return (
                      <button
                        key={plan.key}
                        type="button"
                        onClick={() => setSelectedPlanId(priceId)}
                        disabled={loading || isCurrent}
                        aria-label={`Select ${plan.name} plan`}
                        className={`
                          w-full p-4 rounded-lg border-2 transition-all text-left
                          ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : isCurrent
                              ? 'border-gray-300 bg-gray-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }
                          ${loading || isCurrent ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {/* Radio Button */}
                            <div
                              className={`
                              w-5 h-5 rounded-full border-2 flex items-center justify-center
                              ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}
                            `}
                            >
                              {isSelected && <Check className="h-3 w-3 text-white" />}
                            </div>

                            {/* Plan Info */}
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-gray-900">{plan.name}</p>
                                {isCurrent && (
                                  <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-medium rounded">
                                    Current Plan
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">
                                Billed {currentInterval === 'year' ? 'Annually' : 'Monthly'}
                              </p>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                              {formatCurrency(amount)}
                            </p>
                            <p className="text-xs text-gray-500">
                              per {currentInterval === 'year' ? 'year' : 'month'}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Proration Notice */}
                {selectedPlanId !== currentPlanId && (
                  <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-blue-900 mb-1">Prorated Billing</p>
                        <p className="text-sm text-blue-700">
                          You'll be charged or credited for the difference immediately. Your
                          next billing date remains unchanged.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex gap-3 p-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleChangePlan}
                  disabled={loading || selectedPlanId === currentPlanId}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Changing Plan...</span>
                    </>
                  ) : (
                    <>
                      <span>Change Plan</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
