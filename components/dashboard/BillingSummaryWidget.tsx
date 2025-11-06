/**
 * Billing Summary Widget Component
 *
 * Displays billing overview on the main dashboard.
 * Features:
 * - Active subscription status
 * - Next billing date and amount
 * - Quick link to billing portal
 * - Loading and empty states
 *
 * Used in main dashboard page.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Calendar,
  TrendingUp,
  ArrowRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface SubscriptionSummary {
  planName: string;
  interval: 'month' | 'year';
  amount: number;
  currency: string;
  currentPeriodEnd: number;
  status: string;
}

export default function BillingSummaryWidget() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<SubscriptionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/billing/subscriptions/active');
      const data = await response.json();

      if (response.ok && data.subscription) {
        setSubscription({
          planName: data.subscription.planName,
          interval: data.subscription.interval,
          amount: data.subscription.amount,
          currency: data.subscription.currency,
          currentPeriodEnd: data.subscription.currentPeriodEnd,
          status: data.subscription.status,
        });
      } else {
        setSubscription(null);
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      console.error('Failed to fetch subscription:', error);
      setError(error.message || 'Failed to load subscription');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents: number, currency: string = 'usd'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Loading state
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
      >
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      </motion.div>
    );
  }

  // Error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900">Failed to load billing info</p>
            <p className="text-xs text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  // No subscription state
  if (!subscription) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              No Active Subscription
            </h3>
            <p className="text-sm text-gray-600">
              Subscribe to unlock premium features
            </p>
          </div>
          <TrendingUp className="h-6 w-6 text-blue-600" />
        </div>
        <button
          onClick={() => router.push('/pricing')}
          className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
        >
          View Plans
          <ArrowRight className="h-4 w-4" />
        </button>
      </motion.div>
    );
  }

  // Active subscription state
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-gray-900">{subscription.planName}</h3>
            {subscription.status === 'active' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                Active
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">
            Billed {subscription.interval === 'year' ? 'Annually' : 'Monthly'}
          </p>
        </div>
        <CreditCard className="h-6 w-6 text-gray-400" />
      </div>

      {/* Billing Details */}
      <div className="space-y-3 mb-4">
        {/* Next Billing */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Next Billing</span>
          </div>
          <span className="text-sm font-medium text-gray-900">
            {formatDate(subscription.currentPeriodEnd)}
          </span>
        </div>

        {/* Amount */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Amount</span>
          </div>
          <span className="text-sm font-medium text-gray-900">
            {formatCurrency(subscription.amount, subscription.currency)}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={() => router.push('/dashboard/billing')}
        className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
      >
        Manage Billing
        <ArrowRight className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
