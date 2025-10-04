'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Key,
  DollarSign,
  Shield,
  BarChart3,
  Settings
} from 'lucide-react';
import EnterpriseHeader from '@/components/enterprise/EnterpriseHeader';
import PremiumMetricsCard from '@/components/enterprise/PremiumMetricsCard';
import TeamManagement from '@/components/enterprise/TeamManagement';
import ApiKeyManager from '@/components/enterprise/ApiKeyManager';
import BillingOverview from '@/components/enterprise/BillingOverview';
import SecurityPanel from '@/components/enterprise/SecurityPanel';
import AdvancedAnalytics from '@/components/enterprise/AdvancedAnalytics';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Mock data for charts
const revenueData = [
  { month: 'Jan', revenue: 45000, users: 120 },
  { month: 'Feb', revenue: 52000, users: 145 },
  { month: 'Mar', revenue: 61000, users: 178 },
  { month: 'Apr', revenue: 73000, users: 215 },
  { month: 'May', revenue: 89000, users: 267 },
  { month: 'Jun', revenue: 107000, users: 324 },
  { month: 'Jul', revenue: 127000, users: 389 },
];

const apiUsageData = [
  { hour: '00:00', calls: 1240 },
  { hour: '04:00', calls: 890 },
  { hour: '08:00', calls: 3420 },
  { hour: '12:00', calls: 5890 },
  { hour: '16:00', calls: 7210 },
  { hour: '20:00', calls: 4560 },
  { hour: '23:00', calls: 2130 },
];

const productDistribution = [
  { name: 'AI Tools', value: 35, color: '#8b5cf6' },
  { name: 'Templates', value: 28, color: '#3b82f6' },
  { name: 'Scripts', value: 22, color: '#10b981' },
  { name: 'Starter Kits', value: 15, color: '#f59e0b' },
];

type Tab = 'overview' | 'team' | 'api' | 'billing' | 'security' | 'analytics';

export default function PremiumDashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        router.push('/sign-in');
      } else {
        setLoading(false);
      }
    }
  }, [isLoaded, user, router]);

  if (loading || !isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent mb-4" />
          <div className="text-white text-xl">Loading Premium Dashboard...</div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview' as Tab, label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'team' as Tab, label: 'Team', icon: <Users className="w-4 h-4" /> },
    { id: 'api' as Tab, label: 'API Keys', icon: <Key className="w-4 h-4" /> },
    { id: 'billing' as Tab, label: 'Billing', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'security' as Tab, label: 'Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'analytics' as Tab, label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Mesh Gradient Overlay */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(at 0% 0%, #1e1b4b 0%, transparent 50%),
            radial-gradient(at 100% 0%, #1e3a8a 0%, transparent 50%),
            radial-gradient(at 100% 100%, #4c1d95 0%, transparent 50%),
            radial-gradient(at 0% 100%, #0f172a 0%, transparent 50%)
          `
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <EnterpriseHeader />

        <main className="max-w-[1800px] mx-auto px-6 lg:px-8 py-8">
          {/* Tabs */}
          <div className="mb-8 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-2 flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'team' && <TeamManagement />}
          {activeTab === 'api' && <ApiKeyManager />}
          {activeTab === 'billing' && <BillingOverview />}
          {activeTab === 'security' && <SecurityPanel />}
          {activeTab === 'analytics' && <AdvancedAnalytics />}
        </main>
      </div>
    </div>
  );
}

// Overview Tab
function OverviewTab() {
  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-2">
          Enterprise Command Center
        </h1>
        <p className="text-gray-400">Real-time insights into your business performance</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PremiumMetricsCard
          title="Monthly Recurring Revenue"
          value={127000}
          change="+23%"
          trend="up"
          prefix="$"
          icon={<DollarSign className="w-6 h-6" />}
        />
        <PremiumMetricsCard
          title="API Requests (24h)"
          value={2.4}
          change="+14%"
          trend="up"
          suffix="M"
          icon={<BarChart3 className="w-6 h-6" />}
        />
        <PremiumMetricsCard
          title="Active Enterprise Users"
          value={847}
          change="+31%"
          trend="up"
          icon={<Users className="w-6 h-6" />}
        />
        <PremiumMetricsCard
          title="System Uptime"
          value="99.97%"
          change="✓"
          trend="up"
          icon={<Shield className="w-6 h-6" />}
          animate={false}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Revenue Growth</h2>
            <div className="flex items-center gap-2 text-sm text-green-400">
              <span>+182% YoY</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  backdropFilter: 'blur(10px)'
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#8b5cf6"
                strokeWidth={3}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* API Usage Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">API Usage (24h)</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-gray-400">Live</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={apiUsageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="hour" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="calls" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}

