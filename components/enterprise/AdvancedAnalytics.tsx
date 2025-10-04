'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Filter,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Activity,
  Users,
  DollarSign,
  Zap,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

// Analytics data
const userGrowthData = [
  { month: 'Jul', users: 234, revenue: 45000, apiCalls: 1240000 },
  { month: 'Aug', users: 289, revenue: 52000, apiCalls: 1680000 },
  { month: 'Sep', users: 356, revenue: 61000, apiCalls: 2150000 },
  { month: 'Oct', users: 423, revenue: 73000, apiCalls: 2840000 },
  { month: 'Nov', users: 512, revenue: 89000, apiCalls: 3620000 },
  { month: 'Dec', users: 689, revenue: 107000, apiCalls: 4580000 },
  { month: 'Jan', users: 847, revenue: 127000, apiCalls: 5920000 }
];

const productPerformance = [
  { name: 'AI Tools', revenue: 45000, users: 324, growth: 34 },
  { name: 'Templates', revenue: 35000, users: 278, growth: 28 },
  { name: 'Scripts', revenue: 27000, users: 189, growth: 22 },
  { name: 'Starter Kits', revenue: 20000, users: 156, growth: 15 }
];

const featureUsage = [
  { feature: 'API Gateway', usage: 95 },
  { feature: 'Team Collaboration', usage: 87 },
  { feature: 'Analytics', usage: 78 },
  { feature: 'Custom Integrations', usage: 65 },
  { feature: 'White Label', usage: 52 }
];

const regionData = [
  { region: 'North America', value: 45, color: '#8b5cf6' },
  { region: 'Europe', value: 28, color: '#3b82f6' },
  { region: 'Asia Pacific', value: 18, color: '#10b981' },
  { region: 'Latin America', value: 9, color: '#f59e0b' }
];

const customerSegments = [
  { segment: 'Enterprise', count: 156, revenue: 89000, ltv: 145000 },
  { segment: 'Business', count: 342, revenue: 28000, ltv: 42000 },
  { segment: 'Professional', count: 289, revenue: 10000, ltv: 18000 },
  { segment: 'Starter', count: 60, revenue: 800, ltv: 1200 }
];

export default function AdvancedAnalytics() {
  const [dateRange, setDateRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('area');

  const keyMetrics = [
    {
      label: 'Monthly Recurring Revenue',
      value: '$127,000',
      change: '+23%',
      trend: 'up' as const,
      icon: <DollarSign className="w-5 h-5" />
    },
    {
      label: 'Active Users',
      value: '847',
      change: '+31%',
      trend: 'up' as const,
      icon: <Users className="w-5 h-5" />
    },
    {
      label: 'API Requests',
      value: '5.92M',
      change: '+29%',
      trend: 'up' as const,
      icon: <Zap className="w-5 h-5" />
    },
    {
      label: 'Churn Rate',
      value: '2.3%',
      change: '-0.8%',
      trend: 'down' as const,
      icon: <Activity className="w-5 h-5" />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Advanced Analytics</h2>
          <p className="text-gray-400">Deep dive into your business metrics</p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="12m">Last 12 months</option>
            <option value="all">All time</option>
          </select>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
          >
            <Download className="w-4 h-4" />
            Export
          </motion.button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {keyMetrics.map((metric, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                {metric.icon}
              </div>
              <div className={`flex items-center gap-1 text-sm font-semibold ${
                metric.trend === 'up' ? 'text-green-400' : 'text-red-400'
              }`}>
                {metric.trend === 'up' ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                {metric.change}
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
            <div className="text-sm text-gray-400">{metric.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Growth Trends</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setChartType('line')}
              className={`p-2 rounded-lg transition-colors ${
                chartType === 'line'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <LineChartIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`p-2 rounded-lg transition-colors ${
                chartType === 'area'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <Activity className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`p-2 rounded-lg transition-colors ${
                chartType === 'bar'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          {chartType === 'area' ? (
            <AreaChart data={userGrowthData}>
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
          ) : chartType === 'line' ? (
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px'
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', r: 4 }}
              />
            </LineChart>
          ) : (
            <BarChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="revenue" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </BarChart>
          )}
        </ResponsiveContainer>
      </motion.div>

      {/* Secondary Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Product Performance</h3>
          <div className="space-y-4">
            {productPerformance.map((product, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">{product.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400">${product.revenue.toLocaleString()}</span>
                    <span className="text-xs text-green-400">+{product.growth}%</span>
                  </div>
                </div>
                <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${product.growth * 2}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Geographic Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Geographic Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={regionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {regionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {regionData.map((region, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: region.color }} />
                <span className="text-xs text-gray-400">{region.region}</span>
                <span className="text-xs text-white font-semibold ml-auto">{region.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Feature Usage Radar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Feature Adoption</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={featureUsage}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="feature" stroke="#9ca3af" />
              <PolarRadiusAxis stroke="#9ca3af" />
              <Radar
                name="Usage"
                dataKey="usage"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.6}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px'
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Customer Segments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Customer Segments</h3>
          <div className="space-y-3">
            {customerSegments.map((segment, index) => (
              <div key={index} className="p-3 bg-white/5 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{segment.segment}</span>
                  <span className="text-sm text-gray-400">{segment.count} customers</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-400">MRR:</span>
                    <span className="text-white ml-1">${segment.revenue.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">LTV:</span>
                    <span className="text-white ml-1">${segment.ltv.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
