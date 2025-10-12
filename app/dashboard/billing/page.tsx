'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  FileText,
  Calendar,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import PaymentMethodsList from '@/components/billing/PaymentMethodsList';
import AddPaymentMethodForm from '@/components/billing/AddPaymentMethodForm';

/**
 * Afilo Enterprise - Custom Billing Portal
 *
 * Replaces Stripe Customer Portal with fully customized billing experience.
 * Features:
 * - Afilo Enterprise branding (no more "TechSci, Inc.")
 * - Payment methods management (Card + ACH with manual entry)
 * - Subscription management (upgrade, downgrade, cancel)
 * - Invoice history with PDF downloads
 * - Usage analytics (planned)
 *
 * Built with:
 * - Clerk authentication
 * - Stripe API integration
 * - Framer Motion animations
 * - Enterprise-grade UX
 */

interface BillingStats {
  activePlan: string | null;
  billingCycle: string | null;
  nextBillingDate: string | null;
  nextBillingAmount: number | null;
  paymentMethodsCount: number;
  invoicesCount: number;
  totalSpent: number;
}

interface LoadingState {
  stats: boolean;
  subscription: boolean;
  paymentMethods: boolean;
  invoices: boolean;
}

export default function BillingPortal() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [stats, setStats] = useState<BillingStats>({
    activePlan: null,
    billingCycle: null,
    nextBillingDate: null,
    nextBillingAmount: null,
    paymentMethodsCount: 0,
    invoicesCount: 0,
    totalSpent: 0,
  });

  const [loading, setLoading] = useState<LoadingState>({
    stats: true,
    subscription: true,
    paymentMethods: true,
    invoices: true,
  });

  const [error, setError] = useState<string | null>(null);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in?redirect=/dashboard/billing');
    }
  }, [isLoaded, user, router]);

  // Fetch billing data
  useEffect(() => {
    if (user) {
      fetchBillingData();
    }
  }, [user]);

  const fetchBillingData = async () => {
    try {
      setLoading({
        stats: true,
        subscription: true,
        paymentMethods: true,
        invoices: true,
      });
      setError(null);

      // TODO: Replace with actual API calls
      // For now, using mock data
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setStats({
        activePlan: 'Professional',
        billingCycle: 'Monthly',
        nextBillingDate: '2025-02-12',
        nextBillingAmount: 49900, // $499 in cents
        paymentMethodsCount: 2,
        invoicesCount: 3,
        totalSpent: 149700, // $1,497 in cents
      });

      setLoading({
        stats: false,
        subscription: false,
        paymentMethods: false,
        invoices: false,
      });
    } catch (err: any) {
      console.error('Failed to fetch billing data:', err);
      setError(err.message || 'Failed to load billing information');
      setLoading({
        stats: false,
        subscription: false,
        paymentMethods: false,
        invoices: false,
      });
    }
  };

  // Format currency
  const formatCurrency = (cents: number | null): string => {
    if (cents === null) return '$0.00';
    return `$${(cents / 100).toFixed(2)}`;
  };

  // Format date
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Loading skeleton
  if (!isLoaded || loading.stats) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-10 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <h2 className="text-lg font-semibold text-red-900">
                Failed to Load Billing Information
              </h2>
            </div>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={fetchBillingData}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Billing & Subscriptions
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your Afilo Enterprise subscription, payment methods, and invoices
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span className="text-sm font-medium">Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Active Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Plan</p>
                <p className="text-xl font-bold text-gray-900">
                  {stats.activePlan || 'No Plan'}
                </p>
                <p className="text-xs text-gray-500">{stats.billingCycle}</p>
              </div>
            </div>
          </motion.div>

          {/* Next Billing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Next Billing</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatDate(stats.nextBillingDate)}
                </p>
                <p className="text-xs text-gray-500">
                  {formatCurrency(stats.nextBillingAmount)}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Payment Methods */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Methods</p>
                <p className="text-xl font-bold text-gray-900">
                  {stats.paymentMethodsCount}
                </p>
                <p className="text-xs text-gray-500">Saved methods</p>
              </div>
            </div>
          </motion.div>

          {/* Total Spent */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(stats.totalSpent)}
                </p>
                <p className="text-xs text-gray-500">{stats.invoicesCount} invoices</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-8 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-1">Quick Actions</h2>
              <p className="text-sm text-blue-100">
                Manage your billing settings and subscriptions
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddPaymentModal(true)}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Payment Method
              </button>
              <button
                onClick={() => router.push('/pricing')}
                className="bg-white/20 backdrop-blur text-white px-4 py-2 rounded-lg font-semibold hover:bg-white/30 transition-colors flex items-center gap-2"
              >
                <ArrowUpRight className="h-4 w-4" />
                Upgrade Plan
              </button>
            </div>
          </div>
        </motion.div>

        {/* Main Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Methods Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2"
          >
            <PaymentMethodsList onAddNew={() => setShowAddPaymentModal(true)} />
          </motion.div>

          {/* Subscription Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Subscription</h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                Manage <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
            <div className="text-center py-12 text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>Subscription details will be displayed here</p>
              <p className="text-sm mt-1">(Coming in Phase 3)</p>
            </div>
          </motion.div>

          {/* Invoices Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 lg:col-span-2"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Invoices</h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                View All <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>Invoice history will be displayed here</p>
              <p className="text-sm mt-1">(Coming in Phase 4)</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Add Payment Method Modal */}
      <AddPaymentMethodForm
        isOpen={showAddPaymentModal}
        onClose={() => setShowAddPaymentModal(false)}
        onSuccess={() => {
          // Refresh payment methods list
          // The PaymentMethodsList component will auto-refresh on mount
          setShowAddPaymentModal(false);
        }}
      />
    </div>
  );
}
