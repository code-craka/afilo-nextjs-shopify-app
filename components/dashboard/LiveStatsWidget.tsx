'use client';

/**
 * LiveStatsWidget
 *
 * Real-time dashboard statistics using Neon REST API.
 * Auto-refreshes every 30 seconds for live data.
 *
 * Features:
 * - Live cart stats (active, abandoned, purchased)
 * - Revenue tracking
 * - Auto-refresh with polling
 * - Loading skeletons
 * - Error handling with retry
 */

import { useEffect, useState } from 'react';
import { useNeonAPI, NeonQueries } from '@/lib/neon-rest-client';
import { motion } from 'framer-motion';
import { ShoppingCart, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';
import { StatCardSkeleton } from '@/components/ui/skeleton';
import toast from 'react-hot-toast';

interface CartStats {
  active_items: number;
  abandoned_items: number;
  purchased_items: number;
  active_value: string;
  abandoned_value: string;
  total_revenue: string;
}

export function LiveStatsWidget() {
  const { query, userId, error } = useNeonAPI();
  const [stats, setStats] = useState<CartStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = async () => {
    if (!userId) return;

    try {
      setIsLoading(true);

      const queryConfig = NeonQueries.getCartStats(userId);
      const result = await query<CartStats>(queryConfig.sql, {
        params: queryConfig.params,
        timeout: 10000, // 10s timeout
      });

      if (result.rows.length > 0) {
        setStats(result.rows[0]);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch live stats:', err);
      toast.error('Failed to load live stats');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchStats();
  }, [userId]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  if (isLoading && !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-900">Failed to load stats</h3>
            <p className="text-sm text-red-700">{error.message}</p>
            <button
              onClick={fetchStats}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Active Cart',
      value: stats?.active_items || 0,
      subValue: `$${parseFloat(stats?.active_value || '0').toFixed(2)}`,
      icon: ShoppingCart,
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Abandoned Carts',
      value: stats?.abandoned_items || 0,
      subValue: `$${parseFloat(stats?.abandoned_value || '0').toFixed(2)} lost`,
      icon: AlertCircle,
      color: 'orange',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      label: 'Total Revenue',
      value: `$${parseFloat(stats?.total_revenue || '0').toFixed(2)}`,
      subValue: `${stats?.purchased_items || 0} purchases`,
      icon: DollarSign,
      color: 'green',
      gradient: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Live indicator */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Live Statistics</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="relative">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping" />
          </div>
          <span>
            {lastUpdated
              ? `Updated ${Math.floor((Date.now() - lastUpdated.getTime()) / 1000)}s ago`
              : 'Loading...'}
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="relative bg-white rounded-xl shadow-md p-6 overflow-hidden group cursor-pointer"
          >
            {/* Gradient background */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
            />

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {card.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {card.value}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{card.subValue}</p>
                </div>

                <motion.div
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                  className={`p-3 bg-gradient-to-br ${card.gradient} rounded-lg`}
                >
                  <card.icon className="w-6 h-6 text-white" />
                </motion.div>
              </div>
            </div>

            {/* Bottom accent */}
            <div
              className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient}`}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
