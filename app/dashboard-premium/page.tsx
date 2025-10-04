'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Activity,
  Users,
  Server,
  TrendingUp,
  Package,
  Clock,
  Shield,
  Zap,
  Database,
  Globe,
  Code
} from 'lucide-react';
import EnterpriseHeader from '@/components/enterprise/EnterpriseHeader';
import PremiumMetricsCard from '@/components/enterprise/PremiumMetricsCard';
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

export default function PremiumDashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

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
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Mesh Gradient Overlay */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-mesh" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <EnterpriseHeader />

        <main className="max-w-[1800px] mx-auto px-6 lg:px-8 py-8">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-2">
              Enterprise Command Center
            </h1>
            <p className="text-gray-400">Real-time insights into your business performance</p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
              value={2400000}
              change="+14%"
              trend="up"
              suffix="M"
              icon={<Activity className="w-6 h-6" />}
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
              icon={<Server className="w-6 h-6" />}
              animate={false}
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
                  <TrendingUp className="w-4 h-4" />
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
                <div className="flex items-center gap-2 text-sm text-blue-400">
                  <Activity className="w-4 h-4" />
                  <span>Live</span>
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

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Product Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-6">Product Distribution</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={productDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {productDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {productDistribution.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-400">{item.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Live Activity Feed */}
            <LiveActivityFeed />

            {/* Quick Stats */}
            <QuickStats />
          </div>
        </main>
      </div>
    </div>
  );
}

// Live Activity Feed Component
function LiveActivityFeed() {
  const activities = [
    { id: 1, text: 'New enterprise customer: Acme Corp', time: '2m ago', type: 'success' },
    { id: 2, text: 'API deployment completed successfully', time: '15m ago', type: 'info' },
    { id: 3, text: 'High API usage detected (+400%)', time: '1h ago', type: 'warning' },
    { id: 4, text: 'Team member added: john@acme.com', time: '2h ago', type: 'info' },
    { id: 5, text: 'Monthly invoice generated', time: '3h ago', type: 'success' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Live Activity</h2>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-gray-400">Live</span>
        </div>
      </div>
      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div className={`w-2 h-2 rounded-full mt-1.5 ${
              activity.type === 'success' ? 'bg-green-500' :
              activity.type === 'warning' ? 'bg-yellow-500' :
              'bg-blue-500'
            }`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-300">{activity.text}</p>
              <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// Quick Stats Component
function QuickStats() {
  const stats = [
    { icon: <Package className="w-5 h-5" />, label: 'Total Products', value: '847', color: 'purple' },
    { icon: <Clock className="w-5 h-5" />, label: 'Avg Response Time', value: '89ms', color: 'blue' },
    { icon: <Database className="w-5 h-5" />, label: 'Storage Used', value: '1.2TB', color: 'green' },
    { icon: <Globe className="w-5 h-5" />, label: 'Global CDN Hits', value: '45M', color: 'orange' },
    { icon: <Code className="w-5 h-5" />, label: 'API Keys Active', value: '234', color: 'pink' },
    { icon: <Shield className="w-5 h-5" />, label: 'Security Score', value: '98%', color: 'emerald' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
    >
      <h2 className="text-xl font-semibold text-white mb-6">Quick Stats</h2>
      <div className="space-y-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-${stat.color}-500/10`}>
                <div className={`text-${stat.color}-400`}>{stat.icon}</div>
              </div>
              <span className="text-sm text-gray-300">{stat.label}</span>
            </div>
            <span className="text-sm font-semibold text-white">{stat.value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
