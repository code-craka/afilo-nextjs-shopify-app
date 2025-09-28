'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Subscription types
export interface Subscription {
  id: string;
  productName: string;
  planName: string;
  status: 'active' | 'cancelled' | 'expired' | 'trial' | 'past_due';
  billingPeriod: 'monthly' | 'annually';
  currentPrice: number;
  currency: string;
  nextBillingDate: string;
  trialEndsAt?: string;
  usageMetrics: {
    users: { current: number; limit: number };
    projects: { current: number; limit: number };
    apiCalls: { current: number; limit: number };
    storage: { current: number; limit: number; unit: string };
  };
  features: string[];
  paymentMethod: {
    type: 'card' | 'bank' | 'invoice';
    last4?: string;
    brand?: string;
    expiryDate?: string;
  };
}

interface SubscriptionManagerProps {
  subscriptions: Subscription[];
  onUpgrade?: (subscriptionId: string, newPlan: string) => void;
  onDowngrade?: (subscriptionId: string, newPlan: string) => void;
  onCancel?: (subscriptionId: string) => void;
  onReactivate?: (subscriptionId: string) => void;
  onUpdatePayment?: (subscriptionId: string) => void;
  className?: string;
}

export default function SubscriptionManager({
  subscriptions,
  onUpgrade,
  onDowngrade,
  onCancel,
  onReactivate,
  onUpdatePayment,
  className = ''
}: SubscriptionManagerProps) {
  const [selectedSubscription, setSelectedSubscription] = useState<string | null>(null);
  const [showUsageDetails, setShowUsageDetails] = useState<Record<string, boolean>>({});

  // Get subscription status styling
  const getStatusStyle = (status: Subscription['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'trial':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Calculate usage percentage
  const calculateUsagePercentage = (current: number, limit: number): number => {
    if (limit === 0) return 0;
    return Math.min((current / limit) * 100, 100);
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Calculate days until next billing
  const getDaysUntilBilling = (nextBillingDate: string): number => {
    const today = new Date();
    const billingDate = new Date(nextBillingDate);
    const diffTime = billingDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Subscription Management</h2>
        <p className="text-lg text-gray-600">
          Manage your enterprise software subscriptions and usage
        </p>
      </div>

      {/* Subscriptions Overview */}
      <div className="grid gap-6">
        {subscriptions.map((subscription) => (
          <SubscriptionCard
            key={subscription.id}
            subscription={subscription}
            isSelected={selectedSubscription === subscription.id}
            showUsageDetails={showUsageDetails[subscription.id] || false}
            onSelect={() => setSelectedSubscription(
              selectedSubscription === subscription.id ? null : subscription.id
            )}
            onToggleUsage={() => setShowUsageDetails(prev => ({
              ...prev,
              [subscription.id]: !prev[subscription.id]
            }))}
            onUpgrade={onUpgrade}
            onDowngrade={onDowngrade}
            onCancel={onCancel}
            onReactivate={onReactivate}
            onUpdatePayment={onUpdatePayment}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            getDaysUntilBilling={getDaysUntilBilling}
            calculateUsagePercentage={calculateUsagePercentage}
            getStatusStyle={getStatusStyle}
          />
        ))}
      </div>

      {/* Billing History */}
      <BillingHistory
        formatCurrency={formatCurrency}
        formatDate={formatDate}
      />

      {/* Usage Analytics */}
      <UsageAnalytics
        subscriptions={subscriptions}
        calculateUsagePercentage={calculateUsagePercentage}
      />
    </div>
  );
}

// Subscription Card Component
interface SubscriptionCardProps {
  subscription: Subscription;
  isSelected: boolean;
  showUsageDetails: boolean;
  onSelect: () => void;
  onToggleUsage: () => void;
  onUpgrade?: (subscriptionId: string, newPlan: string) => void;
  onDowngrade?: (subscriptionId: string, newPlan: string) => void;
  onCancel?: (subscriptionId: string) => void;
  onReactivate?: (subscriptionId: string) => void;
  onUpdatePayment?: (subscriptionId: string) => void;
  formatCurrency: (amount: number, currency: string) => string;
  formatDate: (dateString: string) => string;
  getDaysUntilBilling: (nextBillingDate: string) => number;
  calculateUsagePercentage: (current: number, limit: number) => number;
  getStatusStyle: (status: Subscription['status']) => string;
}

function SubscriptionCard({
  subscription,
  isSelected,
  showUsageDetails,
  onSelect,
  onToggleUsage,
  onUpgrade,
  onDowngrade,
  onCancel,
  onReactivate,
  onUpdatePayment,
  formatCurrency,
  formatDate,
  getDaysUntilBilling,
  calculateUsagePercentage,
  getStatusStyle
}: SubscriptionCardProps) {
  const daysUntilBilling = getDaysUntilBilling(subscription.nextBillingDate);

  return (
    <motion.div
      layout
      className={`bg-white rounded-xl border-2 p-6 transition-all duration-300 ${
        isSelected ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-gray-900">{subscription.productName}</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusStyle(subscription.status)}`}>
              {subscription.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <p className="text-gray-600">{subscription.planName} Plan</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span>{formatCurrency(subscription.currentPrice, subscription.currency)}/{subscription.billingPeriod}</span>
            <span>•</span>
            <span>Next billing: {formatDate(subscription.nextBillingDate)}</span>
            {daysUntilBilling <= 7 && (
              <>
                <span>•</span>
                <span className="text-orange-600 font-medium">
                  {daysUntilBilling} days remaining
                </span>
              </>
            )}
          </div>
        </div>

        <button
          onClick={onSelect}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isSelected ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Usage Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(subscription.usageMetrics).map(([key, metric]) => {
          const percentage = calculateUsagePercentage(metric.current, metric.limit);
          const isNearLimit = percentage >= 80;

          return (
            <div key={key} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {key === 'apiCalls' ? 'API Calls' : key}
                </span>
                <span className={`text-xs ${isNearLimit ? 'text-orange-600' : 'text-gray-600'}`}>
                  {metric.current.toLocaleString()}/{metric.limit === 999999 ? '∞' : metric.limit.toLocaleString()}
                  {'unit' in metric && metric.unit ? ` ${metric.unit}` : ''}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isNearLimit ? 'bg-orange-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-200 pt-6 space-y-6"
          >
            {/* Trial Information */}
            {subscription.status === 'trial' && subscription.trialEndsAt && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold text-blue-900">Trial Period</span>
                </div>
                <p className="text-blue-800">
                  Your trial ends on {formatDate(subscription.trialEndsAt)}.
                  Upgrade now to continue using all features.
                </p>
              </div>
            )}

            {/* Payment Method */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Payment Method</h4>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-6 bg-gray-200 rounded flex items-center justify-center">
                    {subscription.paymentMethod.brand && (
                      <span className="text-xs font-bold">
                        {subscription.paymentMethod.brand.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {subscription.paymentMethod.type === 'card' ? 'Credit Card' :
                       subscription.paymentMethod.type === 'bank' ? 'Bank Account' : 'Invoice'}
                    </p>
                    {subscription.paymentMethod.last4 && (
                      <p className="text-sm text-gray-600">
                        •••• {subscription.paymentMethod.last4}
                        {subscription.paymentMethod.expiryDate && ` • Expires ${subscription.paymentMethod.expiryDate}`}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onUpdatePayment?.(subscription.id)}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Update
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <button
                onClick={onToggleUsage}
                className="flex items-center gap-2 font-semibold text-gray-900 hover:text-blue-600"
              >
                <span>Included Features</span>
                <svg
                  className={`w-4 h-4 transition-transform ${showUsageDetails ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {showUsageDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid md:grid-cols-2 gap-2"
                  >
                    {subscription.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
              {subscription.status === 'active' && (
                <>
                  <button
                    onClick={() => onUpgrade?.(subscription.id, 'enterprise')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Upgrade Plan
                  </button>
                  <button
                    onClick={() => onDowngrade?.(subscription.id, 'professional')}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Downgrade
                  </button>
                  <button
                    onClick={() => onCancel?.(subscription.id)}
                    className="px-4 py-2 text-red-600 hover:text-red-700 transition-colors"
                  >
                    Cancel Subscription
                  </button>
                </>
              )}

              {subscription.status === 'cancelled' && (
                <button
                  onClick={() => onReactivate?.(subscription.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Reactivate Subscription
                </button>
              )}

              {subscription.status === 'trial' && (
                <button
                  onClick={() => onUpgrade?.(subscription.id, subscription.planName)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Convert to Paid Plan
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Billing History Component
interface BillingRecord {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  invoice: string;
  description: string;
}

interface BillingHistoryProps {
  formatCurrency: (amount: number, currency: string) => string;
  formatDate: (dateString: string) => string;
}

function BillingHistory({ formatCurrency, formatDate }: BillingHistoryProps) {
  // Mock billing history - in real app, this would come from props or API
  const billingHistory: BillingRecord[] = [
    {
      id: '1',
      date: '2024-01-01',
      amount: 1999,
      currency: 'USD',
      status: 'paid',
      invoice: 'INV-2024-001',
      description: 'Enterprise Plan - Annual Billing'
    },
    {
      id: '2',
      date: '2023-12-01',
      amount: 1999,
      currency: 'USD',
      status: 'paid',
      invoice: 'INV-2023-012',
      description: 'Enterprise Plan - Monthly Billing'
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Billing History</h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-0 font-semibold text-gray-900">Date</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Description</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Amount</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Invoice</th>
            </tr>
          </thead>
          <tbody>
            {billingHistory.map((record) => (
              <tr key={record.id} className="border-b border-gray-100">
                <td className="py-4 px-0 text-gray-900">{formatDate(record.date)}</td>
                <td className="py-4 px-4 text-gray-700">{record.description}</td>
                <td className="py-4 px-4 font-medium text-gray-900">
                  {formatCurrency(record.amount, record.currency)}
                </td>
                <td className="py-4 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    record.status === 'paid' ? 'bg-green-100 text-green-800' :
                    record.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {record.status.toUpperCase()}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <button className="text-blue-600 hover:text-blue-700 font-medium">
                    {record.invoice}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Usage Analytics Component
interface UsageAnalyticsProps {
  subscriptions: Subscription[];
  calculateUsagePercentage: (current: number, limit: number) => number;
}

function UsageAnalytics({ subscriptions, calculateUsagePercentage }: UsageAnalyticsProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Usage Analytics</h3>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {subscriptions.map((subscription) => (
          <div key={subscription.id} className="space-y-4">
            <h4 className="font-semibold text-gray-900">{subscription.productName}</h4>

            {Object.entries(subscription.usageMetrics).map(([key, metric]) => {
              const percentage = calculateUsagePercentage(metric.current, metric.limit);
              const isHigh = percentage >= 80;

              return (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 capitalize">{key}</span>
                    <span className={`text-xs font-medium ${isHigh ? 'text-orange-600' : 'text-gray-700'}`}>
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isHigh ? 'bg-orange-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-600">
                    {metric.current.toLocaleString()} / {metric.limit === 999999 ? '∞' : metric.limit.toLocaleString()}
                    {'unit' in metric && metric.unit ? ` ${metric.unit}` : ''}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}