'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Download, CreditCard, ArrowUpRight, Sparkles } from 'lucide-react';
import BillingSummaryWidget from '@/components/dashboard/BillingSummaryWidget';
import AbandonedCartWidget from '@/components/dashboard/AbandonedCartWidget';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function StandardDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [role, setRole] = useState<string>('standard');
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
      setRole(data.role);

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName || 'there'}!
        </h1>
        <p className="mt-1 text-gray-600">
          Here's what's happening with your account today.
        </p>
      </div>

      {/* Upgrade Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01 }}
        className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-[length:200%_100%] animate-gradient text-white rounded-xl p-6 mb-8 shadow-lg overflow-hidden"
      >
        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>

        {/* Content */}
        <div className="relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <Sparkles className="h-8 w-8 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold">Upgrade to Premium</h3>
              <p className="text-sm text-blue-100 mt-1">
                Get team management, API access, advanced analytics, and more
              </p>
            </div>
          </div>
          <motion.button
            onClick={() => router.push('/pricing')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2 whitespace-nowrap shadow-lg"
          >
            View Plans
            <ArrowUpRight className="h-4 w-4" />
          </motion.button>
        </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-xl cursor-pointer transition-shadow"
          >
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
                className="p-3 bg-blue-100 rounded-lg"
              >
                <Package className="h-6 w-6 text-blue-600" />
              </motion.div>
              <div>
                <p className="text-sm text-gray-600">My Products</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-xl cursor-pointer transition-shadow"
          >
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
                className="p-3 bg-green-100 rounded-lg"
              >
                <Download className="h-6 w-6 text-green-600" />
              </motion.div>
              <div>
                <p className="text-sm text-gray-600">Downloads</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-xl cursor-pointer transition-shadow"
          >
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
                className="p-3 bg-purple-100 rounded-lg"
              >
                <CreditCard className="h-6 w-6 text-purple-600" />
              </motion.div>
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">$0</p>
              </div>
            </div>
          </motion.div>
      </div>

      {/* Billing Summary Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Billing & Subscription</h2>
        <BillingSummaryWidget />
      </motion.div>

      {/* Abandoned Carts Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <AbandonedCartWidget />
      </motion.div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No orders yet</p>
          <button
            onClick={() => router.push('/products')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Products
          </button>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
