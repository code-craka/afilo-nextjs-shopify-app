'use client';

/**
 * Analytics Dashboard Page
 *
 * Advanced analytics powered by Neon REST API direct queries.
 * Displays:
 * - Top products by revenue
 * - Abandoned cart trends over time
 * - Revenue breakdown by license type
 * - Purchase patterns
 *
 * Uses hybrid approach: Neon API for reads, existing API routes for writes.
 */

import { useEffect, useState } from 'react';
import { useNeonAPI, NeonQueries } from '@/lib/neon-rest-client';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Package,
  ShoppingCart,
  Calendar,
  DollarSign,
  Award,
} from 'lucide-react';
import { StatCardSkeleton } from '@/components/ui/skeleton';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface TopProduct {
  product_id: string;
  title: string;
  purchase_count: number;
  revenue: string;
  image_url: string | null;
}

interface AbandonedCartTrend {
  date: string;
  cart_count: number;
  lost_revenue: string;
}

interface RecentPurchase {
  id: string;
  title: string;
  price: string;
  quantity: number;
  license_type: string;
  image_url: string | null;
  purchased_at: string;
}

export default function AnalyticsPage() {
  const { query, userId } = useNeonAPI();
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [abandonedTrends, setAbandonedTrends] = useState<AbandonedCartTrend[]>([]);
  const [recentPurchases, setRecentPurchases] = useState<RecentPurchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);

        // Fetch all analytics data in parallel
        const topProductsQuery = NeonQueries.getTopProducts(10);
        const trendsQuery = NeonQueries.getAbandonedCartTrends(30);
        const purchasesQuery = NeonQueries.getRecentPurchases(userId, 10);

        const [topProductsResult, trendsResult, purchasesResult] = await Promise.all([
          query<TopProduct>(topProductsQuery.sql, { params: topProductsQuery.params }),
          query<AbandonedCartTrend>(trendsQuery.sql, { params: trendsQuery.params }),
          query<RecentPurchase>(purchasesQuery.sql, { params: purchasesQuery.params }),
        ]);

        setTopProducts(topProductsResult.rows);
        setAbandonedTrends(trendsResult.rows);
        setRecentPurchases(purchasesResult.rows);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        toast.error('Failed to load analytics data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [userId]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      </DashboardLayout>
    );
  }

  // Calculate total lost revenue from abandoned carts
  const totalLostRevenue = abandonedTrends.reduce(
    (sum, trend) => sum + parseFloat(trend.lost_revenue || '0'),
    0
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-1">
              Real-time insights powered by Neon REST API
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-green-700">Live Data</span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Top Products</p>
                <p className="text-3xl font-bold mt-1">{topProducts.length}</p>
                <p className="text-purple-100 text-sm mt-1">Best sellers</p>
              </div>
              <Award className="w-8 h-8 text-white opacity-80" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Lost Revenue</p>
                <p className="text-3xl font-bold mt-1">
                  ${totalLostRevenue.toFixed(2)}
                </p>
                <p className="text-orange-100 text-sm mt-1">Last 30 days</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-white opacity-80" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Recent Orders</p>
                <p className="text-3xl font-bold mt-1">{recentPurchases.length}</p>
                <p className="text-blue-100 text-sm mt-1">Last 10 purchases</p>
              </div>
              <Package className="w-8 h-8 text-white opacity-80" />
            </div>
          </motion.div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Top Products by Revenue</h2>
          </div>

          {topProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No products sold yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <motion.div
                  key={product.product_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01, x: 4 }}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all cursor-pointer"
                >
                  {/* Rank badge */}
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>

                  {/* Product image */}
                  {product.image_url ? (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={product.image_url}
                        alt={product.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                  )}

                  {/* Product info */}
                  <div className="flex-grow">
                    <h3 className="font-semibold text-gray-900">{product.title}</h3>
                    <p className="text-sm text-gray-600">
                      {product.purchase_count} {product.purchase_count === 1 ? 'sale' : 'sales'}
                    </p>
                  </div>

                  {/* Revenue */}
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">
                      ${parseFloat(product.revenue).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">Total revenue</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Abandoned Cart Trends */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Abandoned Cart Trends (Last 30 Days)
            </h2>
          </div>

          {abandonedTrends.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No abandoned carts in the last 30 days</p>
            </div>
          ) : (
            <div className="space-y-3">
              {abandonedTrends.slice(0, 10).map((trend, index) => {
                const date = new Date(trend.date);
                const revenue = parseFloat(trend.lost_revenue);

                return (
                  <motion.div
                    key={trend.date}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">
                          {date.getDate()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {date.toLocaleDateString('en-US', { month: 'short' })}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {trend.cart_count} {trend.cart_count === 1 ? 'cart' : 'carts'} abandoned
                        </p>
                        <p className="text-sm text-gray-600">
                          {date.toLocaleDateString('en-US', { weekday: 'long' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600">
                        ${revenue.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">Lost revenue</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Purchases */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Recent Purchases</h2>
          </div>

          {recentPurchases.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No recent purchases</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPurchases.map((purchase, index) => {
                const purchaseDate = new Date(purchase.purchased_at);
                const price = parseFloat(purchase.price);

                return (
                  <motion.div
                    key={purchase.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-sm transition-all"
                  >
                    {purchase.image_url ? (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={purchase.image_url}
                          alt={purchase.title}
                          fill
                          className="object-cover"
                          sizes="48px"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5 text-gray-400" />
                      </div>
                    )}

                    <div className="flex-grow">
                      <h3 className="font-semibold text-gray-900">{purchase.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                          {purchase.license_type}
                        </span>
                        <span className="text-xs text-gray-500">
                          Qty: {purchase.quantity}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        ${(price * purchase.quantity).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {purchaseDate.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
