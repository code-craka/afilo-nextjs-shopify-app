'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Building2,
  Landmark,
  Plus,
  ExternalLink,
  ArrowUpRight,
  Clock
} from 'lucide-react';

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  invoiceNumber: string;
  downloadUrl: string;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'ach' | 'wire';
  last4?: string;
  brand?: string;
  bankName?: string;
  accountType?: string;
  isDefault: boolean;
  expiryDate?: string;
}

interface UsageMetric {
  name: string;
  current: number;
  limit: number;
  unit: string;
  cost?: number;
}

// Mock data
const mockInvoices: Invoice[] = [
  {
    id: '1',
    date: '2025-01-01',
    amount: 9999,
    status: 'paid',
    invoiceNumber: 'INV-2025-001',
    downloadUrl: '#'
  },
  {
    id: '2',
    date: '2024-12-01',
    amount: 9999,
    status: 'paid',
    invoiceNumber: 'INV-2024-012',
    downloadUrl: '#'
  },
  {
    id: '3',
    date: '2024-11-01',
    amount: 9999,
    status: 'paid',
    invoiceNumber: 'INV-2024-011',
    downloadUrl: '#'
  },
  {
    id: '4',
    date: '2024-10-01',
    amount: 4999,
    status: 'paid',
    invoiceNumber: 'INV-2024-010',
    downloadUrl: '#'
  }
];

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: '1',
    type: 'card',
    last4: '4242',
    brand: 'Visa',
    expiryDate: '12/2027',
    isDefault: true
  },
  {
    id: '2',
    type: 'ach',
    bankName: 'Chase Business',
    accountType: 'Checking',
    last4: '6789',
    isDefault: false
  }
];

const mockUsageMetrics: UsageMetric[] = [
  { name: 'Team Members', current: 342, limit: 500, unit: 'users' },
  { name: 'API Calls', current: 2847291, limit: 10000000, unit: 'calls', cost: 0.0001 },
  { name: 'Storage', current: 487, limit: 1000, unit: 'GB', cost: 0.15 },
  { name: 'Projects', current: 156, limit: 1000, unit: 'projects' }
];

export default function BillingOverview() {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  const currentPlan = {
    name: 'Enterprise Plus',
    price: 9999,
    billingCycle: 'monthly',
    nextBillingDate: '2025-02-01',
    features: [
      'Unlimited users',
      'Unlimited projects',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee'
    ]
  };

  const forecastedCost = {
    base: 9999,
    usage: 284.73,
    total: 10283.73,
    projectedAnnual: 123404.76
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Billing & Invoices</h2>
        <p className="text-gray-400">Manage your subscription and payment methods</p>
      </div>

      {/* Current Plan */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-gradient-to-br from-purple-600/10 to-blue-600/10 border border-white/10 rounded-2xl p-6"
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-bold text-white">{currentPlan.name}</h3>
              <div className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm font-semibold">
                Active
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                ${currentPlan.price.toLocaleString()}
              </span>
              <span className="text-gray-400">/ month</span>
            </div>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors"
            >
              Change Plan
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
            >
              Upgrade
            </motion.button>
          </div>
        </div>

        {/* Plan Features */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {currentPlan.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span className="text-sm text-gray-300">{feature}</span>
            </div>
          ))}
        </div>

        {/* Next Billing */}
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>Next billing date: {new Date(currentPlan.nextBillingDate).toLocaleDateString()}</span>
        </div>
      </motion.div>

      {/* Cost Forecast */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Month Forecast */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Current Month Forecast</h3>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Base subscription</span>
              <span className="text-white font-medium">${forecastedCost.base.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Usage charges</span>
              <span className="text-green-400 font-medium">+${forecastedCost.usage.toFixed(2)}</span>
            </div>
            <div className="border-t border-white/10 pt-3 flex justify-between items-center">
              <span className="text-white font-semibold">Estimated total</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                ${forecastedCost.total.toLocaleString()}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Annual Projection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Annual Projection</h3>
            <ArrowUpRight className="w-5 h-5 text-purple-400" />
          </div>
          <div className="space-y-3">
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              ${forecastedCost.projectedAnnual.toLocaleString()}
            </div>
            <p className="text-sm text-gray-400">
              Based on current usage trends and subscription
            </p>
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-300">
                  Save 17% ($20,979/year) by switching to annual billing
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Usage Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Usage Tracking</h3>
        <div className="space-y-4">
          {mockUsageMetrics.map((metric, index) => {
            const percentage = (metric.current / metric.limit) * 100;
            const isNearLimit = percentage > 80;

            return (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">{metric.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">
                      {metric.current.toLocaleString()} / {metric.limit.toLocaleString()} {metric.unit}
                    </span>
                    {metric.cost && (
                      <span className="text-xs text-gray-500">
                        (${metric.cost}/unit)
                      </span>
                    )}
                  </div>
                </div>
                <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className={`h-full rounded-full ${
                      isNearLimit
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                        : 'bg-gradient-to-r from-purple-600 to-blue-600'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Payment Methods */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Payment Methods</h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white hover:bg-white/10 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Method
          </motion.button>
        </div>
        <div className="space-y-3">
          {mockPaymentMethods.map((method) => (
            <div
              key={method.id}
              className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                {method.type === 'card' ? (
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                ) : method.type === 'ach' ? (
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                    <Landmark className="w-5 h-5 text-white" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">
                      {method.type === 'card' ? method.brand : method.bankName} •••• {method.last4}
                    </span>
                    {method.isDefault && (
                      <span className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded text-xs text-purple-300">
                        Default
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-400">
                    {method.type === 'card' ? `Expires ${method.expiryDate}` : method.accountType}
                  </span>
                </div>
              </div>
              <button type="button" aria-label="Manage payment method" className="text-gray-400 hover:text-white transition-colors">
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Invoice History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl overflow-hidden"
      >
        <div className="p-6 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Invoice History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Invoice</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Date</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Amount</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Status</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {mockInvoices.map((invoice, index) => (
                <motion.tr
                  key={invoice.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="text-white font-medium">{invoice.invoiceNumber}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-300">{new Date(invoice.date).toLocaleDateString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white font-medium">${invoice.amount.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        invoice.status === 'paid'
                          ? 'bg-green-500/10 text-green-400 border-green-500/20'
                          : invoice.status === 'pending'
                          ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}
                    >
                      {invoice.status}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      title="Download invoice"
                    >
                      <Download className="w-4 h-4 text-gray-400" />
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
