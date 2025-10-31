'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Download, CreditCard, ArrowUpRight, Sparkles, TrendingUp, ShoppingBag, Star, BarChart3 } from 'lucide-react';
import BillingSummaryWidget from '@/components/dashboard/BillingSummaryWidget';
import AbandonedCartWidget from '@/components/dashboard/AbandonedCartWidget';
import { LiveStatsWidget } from '@/components/dashboard/LiveStatsWidget';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function PremiumDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAccess() {
      if (!isLoaded) return;
      if (!user) {
        router.push('/sign-in');
        return;
      }

      // Check user role
      const response = await fetch('/api/user/role');
      const data = await response.json();

      // Redirect premium users to premium dashboard
      if (data.role === 'premium') {
        router.push('/dashboard/premium');
        return;
      }

      setLoading(false);
    }

    checkAccess();
  }, [user, isLoaded, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent mb-4" />
          <div className="text-gray-900 text-xl font-semibold">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      {/* Premium Background Gradient */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50" />
      <div className="fixed inset-0 -z-10 opacity-30 pointer-events-none">
        <div className="absolute inset-0 radial-gradient-mesh" />
      </div>

      {/* Welcome Header - Premium Style */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 backdrop-blur-xl bg-white/70 border border-white/50 rounded-2xl p-8 shadow-xl"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Welcome back, {user?.firstName || 'there'}!
              </h1>
              <motion.div
                animate={{ rotate: [0, 14, -8, 14, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
              >
                <Sparkles className="h-8 w-8 text-purple-600" />
              </motion.div>
            </div>
            <p className="text-lg text-gray-600 flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              Your premium dashboard experience
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-purple-700">All Systems Operational</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Upgrade Banner - Premium Glassmorphism */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01, y: -2 }}
        className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-[length:200%_100%] animate-gradient text-white rounded-2xl p-8 mb-8 shadow-2xl overflow-hidden"
      >
        {/* Animated gradient orbs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-400 rounded-full blur-3xl opacity-20 animate-pulse animation-delay-1s" />

        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <motion.div
                animate={{
                  rotate: [0, 14, -8, 14, 0],
                  scale: [1, 1.1, 1, 1.1, 1]
                }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Sparkles className="h-10 w-10 flex-shrink-0 mt-1" />
              </motion.div>
              <div>
                <h3 className="text-2xl font-bold mb-1">Unlock Enterprise Features</h3>
                <p className="text-sm text-blue-100">
                  Team collaboration • API access • Advanced analytics • Priority support
                </p>
              </div>
            </div>
            <motion.button
              onClick={() => router.push('/pricing')}
              whileHover={{ scale: 1.08, rotate: 1 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all flex items-center gap-2 whitespace-nowrap shadow-2xl"
            >
              View Plans
              <ArrowUpRight className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Live Statistics Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <LiveStatsWidget />
      </motion.div>

      {/* Analytics CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        whileHover={{ scale: 1.01, y: -2 }}
        onClick={() => router.push('/dashboard/analytics')}
        className="relative backdrop-blur-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl p-6 mb-8 shadow-xl border border-indigo-200/50 hover:shadow-2xl cursor-pointer overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg"
            >
              <BarChart3 className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">View Advanced Analytics</h3>
              <p className="text-sm text-gray-600">
                Top products • Abandoned cart trends • Revenue insights
              </p>
            </div>
          </div>
          <ArrowUpRight className="h-6 w-6 text-indigo-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </div>
      </motion.div>

      {/* Quick Stats - Premium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.03, y: -6 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="relative backdrop-blur-xl bg-white/80 rounded-2xl p-6 shadow-xl border border-white/50 hover:shadow-2xl cursor-pointer overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg"
              >
                <Package className="h-6 w-6 text-white" />
              </motion.div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">My Products</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">0</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.03, y: -6 }}
          className="relative backdrop-blur-xl bg-white/80 rounded-2xl p-6 shadow-xl border border-white/50 hover:shadow-2xl cursor-pointer overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="p-3 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl shadow-lg"
              >
                <Download className="h-6 w-6 text-white" />
              </motion.div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Downloads</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">0</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.03, y: -6 }}
          className="relative backdrop-blur-xl bg-white/80 rounded-2xl p-6 shadow-xl border border-white/50 hover:shadow-2xl cursor-pointer overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="p-3 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl shadow-lg"
              >
                <CreditCard className="h-6 w-6 text-white" />
              </motion.div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Spent</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">$0</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.03, y: -6 }}
          className="relative backdrop-blur-xl bg-white/80 rounded-2xl p-6 shadow-xl border border-white/50 hover:shadow-2xl cursor-pointer overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="p-3 bg-gradient-to-br from-orange-400 to-amber-600 rounded-xl shadow-lg"
              >
                <ShoppingBag className="h-6 w-6 text-white" />
              </motion.div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Active Orders</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">0</p>
          </div>
        </motion.div>
      </div>

      {/* Billing Summary Widget - Premium Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
            <CreditCard className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Billing & Subscription
          </h2>
        </div>
        <div className="backdrop-blur-xl bg-white/80 rounded-2xl border border-white/50 shadow-xl overflow-hidden">
          <BillingSummaryWidget />
        </div>
      </motion.div>

      {/* Abandoned Carts Widget - Premium Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-8"
      >
        <div className="backdrop-blur-xl bg-white/80 rounded-2xl border border-white/50 shadow-xl overflow-hidden">
          <AbandonedCartWidget />
        </div>
      </motion.div>

      {/* Recent Orders - Premium Style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-xl border border-white/50 p-8 overflow-hidden relative"
      >
        {/* Decorative gradient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl -z-10" />

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg">
            <ShoppingBag className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Recent Orders
          </h2>
        </div>

        <div className="text-center py-16">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block mb-6"
          >
            <div className="p-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl">
              <Package className="h-16 w-16 text-blue-600 mx-auto" />
            </div>
          </motion.div>
          <p className="text-lg text-gray-600 mb-2 font-medium">No orders yet</p>
          <p className="text-sm text-gray-500 mb-6">Start exploring our amazing products</p>
          <motion.button
            onClick={() => router.push('/products')}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
          >
            <ShoppingBag className="h-5 w-5" />
            Browse Products
          </motion.button>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
