/**
 * Active Subscription Card Component
 *
 * Displays the customer's active subscription with:
 * - Plan name and billing cycle
 * - Next billing date and amount
 * - Status badge (Active, Trialing, Past Due, etc.)
 * - Cancellation warning if scheduled for cancellation
 * - Quick actions (Change Plan, Cancel, Reactivate)
 *
 * Used by billing portal page.
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  CreditCard,
  AlertTriangle,
  Check,
  Loader2,
  ArrowUpRight,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { SubscriptionData, formatCurrency, formatDate, getStatusColor } from '@/lib/billing/stripe-subscriptions';

interface ActiveSubscriptionCardProps {
  subscription: SubscriptionData | null;
  loading?: boolean;
  onChangePlan?: () => void;
  onCancel?: () => void;
  onReactivate?: () => void;
}

export default function ActiveSubscriptionCard({
  subscription,
  loading = false,
  onChangePlan,
  onCancel,
  onReactivate,
}: ActiveSubscriptionCardProps) {
  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Active Subscription</h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  // No subscription state
  if (!subscription) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Active Subscription</h2>
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <CreditCard className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-2">No Active Subscription</p>
          <p className="text-sm text-gray-500 mb-6">
            Subscribe to an Afilo Enterprise plan to get started
          </p>
          <button
            onClick={() => window.location.href = '/pricing'}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors font-semibold"
          >
            View Plans
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  const statusColors = getStatusColor(subscription.status);
  const isScheduledForCancellation = subscription.cancelAtPeriodEnd;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Active Subscription</h2>

        {/* Status Badge */}
        <span
          className={`inline-flex items-center gap-2 px-3 py-1 ${statusColors.bg} ${statusColors.text} text-sm font-medium rounded-full`}
        >
          <span className={`w-2 h-2 rounded-full ${statusColors.dot}`}></span>
          {subscription.status === 'active' && 'Active'}
          {subscription.status === 'trialing' && 'Trial'}
          {subscription.status === 'past_due' && 'Past Due'}
          {subscription.status === 'canceled' && 'Canceled'}
          {subscription.status === 'unpaid' && 'Unpaid'}
          {subscription.status === 'incomplete' && 'Incomplete'}
        </span>
      </div>

      {/* Cancellation Warning */}
      {isScheduledForCancellation && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-orange-900 mb-1">
                Subscription Scheduled for Cancellation
              </p>
              <p className="text-sm text-orange-700 mb-3">
                Your subscription will end on{' '}
                <span className="font-medium">{formatDate(subscription.currentPeriodEnd)}</span>.
                You'll retain access until then.
              </p>
              {onReactivate && (
                <button
                  onClick={onReactivate}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reactivate Subscription
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Plan Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Current Plan */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Check className="h-5 w-5 text-green-600" />
            <p className="text-sm font-medium text-gray-600">Current Plan</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{subscription.planName}</p>
          <p className="text-sm text-gray-500 mt-1">
            Billed {subscription.interval === 'year' ? 'Annually' : 'Monthly'}
          </p>
        </div>

        {/* Billing Amount */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            <p className="text-sm font-medium text-gray-600">Billing Amount</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(subscription.amount, subscription.currency)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            per {subscription.interval === 'year' ? 'year' : 'month'}
          </p>
        </div>
      </div>

      {/* Billing Cycle */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-gray-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Next Billing Date</p>
              <p className="text-lg font-bold text-gray-900">
                {formatDate(subscription.currentPeriodEnd)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Amount Due</p>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(subscription.amount, subscription.currency)}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        {onChangePlan && !isScheduledForCancellation && (
          <button
            onClick={onChangePlan}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <ArrowUpRight className="h-4 w-4" />
            Change Plan
          </button>
        )}

        {onCancel && !isScheduledForCancellation && (
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
          >
            <XCircle className="h-4 w-4" />
            Cancel
          </button>
        )}
      </div>

      {/* Additional Info */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Subscription Started</p>
            <p className="font-medium text-gray-900">{formatDate(subscription.created)}</p>
          </div>
          <div>
            <p className="text-gray-600">Current Period</p>
            <p className="font-medium text-gray-900">
              {formatDate(subscription.currentPeriodStart)} -{' '}
              {formatDate(subscription.currentPeriodEnd)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
