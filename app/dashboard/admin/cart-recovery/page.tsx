/**
 * Admin Cart Recovery Dashboard
 *
 * Phase 2 Feature: Enhanced E-commerce Features
 *
 * Features:
 * - Abandoned cart analytics and insights
 * - Automated recovery email campaigns
 * - Revenue recovery tracking
 * - Cart optimization tools
 * - A/B testing for cart conversion
 *
 * URL: /dashboard/admin/cart-recovery
 * Requires: Admin role
 */

'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  TrendingUp,
  Mail,
  DollarSign,
  Clock,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Users,
  Zap,
  BarChart3,
  Settings,
  Play,
  Pause,
  RefreshCw,
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface CartRecoveryStats {
  totalAbandonedCarts: number;
  totalLostRevenue: number;
  recoveredCarts: number;
  recoveredRevenue: number;
  recoveryRate: number;
  emailsSent: number;
  emailOpenRate: number;
  emailClickRate: number;
  conversionRate: number;
}

interface AbandonedCart {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  items: Array<{
    productId: string;
    title: string;
    price: number;
    quantity: number;
    imageUrl: string | null;
  }>;
  totalValue: number;
  createdAt: string;
  lastUpdated: string;
  emailsSent: number;
  status: 'abandoned' | 'recovered' | 'expired';
  recoveryAttempts: number;
}

interface RecoveryCampaign {
  id: string;
  name: string;
  isActive: boolean;
  triggerDelay: number; // hours after abandonment
  emailTemplate: string;
  subject: string;
  discountPercent: number;
  sent: number;
  opened: number;
  clicked: number;
  converted: number;
  revenue: number;
}

export default function CartRecoveryDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CartRecoveryStats | null>(null);
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>([]);
  const [campaigns, setCampaigns] = useState<RecoveryCampaign[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'carts' | 'campaigns' | 'analytics'>('overview');
  const [dateRange, setDateRange] = useState(30); // days

  useEffect(() => {
    async function checkAccess() {
      if (!isLoaded) return;
      if (!user) {
        router.push('/sign-in');
        return;
      }

      // Check admin role
      try {
        const response = await fetch('/api/user/role');
        const data = await response.json();

        if (data.role !== 'admin' && data.role !== 'owner') {
          router.push('/dashboard');
          return;
        }

        await fetchDashboardData();
        setLoading(false);
      } catch (error) {
        console.error('Error checking admin access:', error);
        router.push('/dashboard');
      }
    }

    checkAccess();
  }, [user, isLoaded, router, dateRange]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, cartsRes, campaignsRes] = await Promise.all([
        fetch(`/api/admin/cart-recovery/stats?days=${dateRange}`),
        fetch(`/api/admin/cart-recovery/carts?limit=50`),
        fetch(`/api/admin/cart-recovery/campaigns`),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data);
      }

      if (cartsRes.ok) {
        const cartsData = await cartsRes.json();
        setAbandonedCarts(cartsData.data);
      }

      if (campaignsRes.ok) {
        const campaignsData = await campaignsRes.json();
        setCampaigns(campaignsData.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const toggleCampaign = async (campaignId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/cart-recovery/campaigns/${campaignId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        await fetchDashboardData();
      }
    } catch (error) {
      console.error('Error toggling campaign:', error);
    }
  };

  const triggerRecoveryEmail = async (cartId: string) => {
    try {
      const response = await fetch(`/api/admin/cart-recovery/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId }),
      });

      if (response.ok) {
        await fetchDashboardData();
      }
    } catch (error) {
      console.error('Error sending recovery email:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent mb-4" />
          <div className="text-gray-900 text-xl font-semibold">Loading cart recovery dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg">
              <ShoppingCart className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 bg-clip-text text-transparent">
                Cart Recovery Center
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Recover abandoned carts and boost revenue with automated campaigns
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(Number(e.target.value))}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>

            <button
              onClick={fetchDashboardData}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Key Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="backdrop-blur-xl bg-white/80 rounded-2xl p-6 shadow-xl border border-white/50">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-red-100 rounded-xl">
                  <ShoppingCart className="h-6 w-6 text-red-600" />
                </div>
                <div className="text-sm font-medium text-gray-600">Abandoned Carts</div>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {stats.totalAbandonedCarts.toLocaleString()}
              </div>
              <div className="text-sm text-red-600 font-medium">
                ${stats.totalLostRevenue.toFixed(2)} potential revenue
              </div>
            </div>

            <div className="backdrop-blur-xl bg-white/80 rounded-2xl p-6 shadow-xl border border-white/50">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-green-100 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-sm font-medium text-gray-600">Recovery Rate</div>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {stats.recoveryRate.toFixed(1)}%
              </div>
              <div className="text-sm text-green-600 font-medium">
                {stats.recoveredCarts} carts recovered
              </div>
            </div>

            <div className="backdrop-blur-xl bg-white/80 rounded-2xl p-6 shadow-xl border border-white/50">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-sm font-medium text-gray-600">Email Performance</div>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {stats.emailOpenRate.toFixed(1)}%
              </div>
              <div className="text-sm text-blue-600 font-medium">
                {stats.emailsSent} emails sent
              </div>
            </div>

            <div className="backdrop-blur-xl bg-white/80 rounded-2xl p-6 shadow-xl border border-white/50">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-sm font-medium text-gray-600">Recovered Revenue</div>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                ${stats.recoveredRevenue.toFixed(2)}
              </div>
              <div className="text-sm text-purple-600 font-medium">
                {stats.conversionRate.toFixed(1)}% conversion
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-xl border border-white/50 mb-8 p-2"
      >
        <div className="flex gap-2">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'carts', label: 'Abandoned Carts', icon: ShoppingCart },
            { id: 'campaigns', label: 'Email Campaigns', icon: Mail },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Recovery Performance Chart */}
            <div className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-xl border border-white/50 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Recovery Performance Trend</h3>
              <div className="h-64 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-orange-600 mx-auto mb-3" />
                  <p className="text-gray-600">Chart implementation coming soon</p>
                  <p className="text-sm text-gray-500">Will show recovery trends over time</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-xl border border-white/50 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition-all">
                    <Zap className="h-5 w-5" />
                    <span>Send Recovery Campaign</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-4 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all">
                    <Settings className="h-5 w-5" />
                    <span>Configure Templates</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-4 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all">
                    <Target className="h-5 w-5" />
                    <span>A/B Test Campaigns</span>
                  </button>
                </div>
              </div>

              <div className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-xl border border-white/50 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Top Performing Campaigns</h3>
                {campaigns.slice(0, 3).map((campaign, index) => (
                  <div key={campaign.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <div className="font-semibold text-gray-900">{campaign.name}</div>
                      <div className="text-sm text-gray-600">
                        {campaign.converted} conversions • ${campaign.revenue.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {((campaign.converted / campaign.sent) * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">conversion rate</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'carts' && (
          <div className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-xl border border-white/50 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Recent Abandoned Carts</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-orange-50 to-red-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Customer</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Cart Value</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Abandoned</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Recovery</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {abandonedCarts.map((cart, index) => (
                    <motion.tr
                      key={cart.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-gray-900">{cart.userName}</div>
                          <div className="text-sm text-gray-600">{cart.userEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">${cart.totalValue.toFixed(2)}</div>
                        <div className="text-sm text-gray-600">{cart.items.length} items</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {format(new Date(cart.createdAt), 'MMM d, yyyy')}
                        </div>
                        <div className="text-sm text-gray-600">
                          {format(new Date(cart.createdAt), 'h:mm a')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          cart.status === 'recovered' ? 'bg-green-100 text-green-800' :
                          cart.status === 'expired' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {cart.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {cart.emailsSent} emails sent
                        </div>
                        <div className="text-sm text-gray-600">
                          {cart.recoveryAttempts} attempts
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {cart.status === 'abandoned' && (
                          <button
                            onClick={() => triggerRecoveryEmail(cart.id)}
                            className="px-3 py-1 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
                          >
                            Send Email
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'campaigns' && (
          <div className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-xl border border-white/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Email Campaigns</h3>
              <button className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all">
                Create Campaign
              </button>
            </div>

            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-4 h-4 rounded-full ${
                        campaign.isActive ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{campaign.name}</h4>
                        <p className="text-sm text-gray-600">
                          Triggers {campaign.triggerDelay} hours after abandonment
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleCampaign(campaign.id, campaign.isActive)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        campaign.isActive
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {campaign.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      {campaign.isActive ? 'Pause' : 'Activate'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{campaign.sent}</div>
                      <div className="text-sm text-gray-600">Sent</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {((campaign.opened / campaign.sent) * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Open Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {((campaign.clicked / campaign.sent) * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Click Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {((campaign.converted / campaign.sent) * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Conversion</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        ${campaign.revenue.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">Revenue</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-xl border border-white/50 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Recovery by Time of Day</h3>
                <div className="h-48 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-gray-600">Analytics coming soon</p>
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-xl border border-white/50 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Cart Value Distribution</h3>
                <div className="h-48 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <DollarSign className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-gray-600">Analytics coming soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}