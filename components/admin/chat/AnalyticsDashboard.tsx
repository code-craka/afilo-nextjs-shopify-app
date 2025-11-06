/**
 * Analytics Dashboard Component
 *
 * Displays comprehensive bot performance metrics with interactive charts:
 * - Message activity over time
 * - Conversation status breakdown
 * - Tier distribution
 * - Knowledge base usage
 * - Top questions
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface PieChartLabelProps {
  status: string;
  count: number;
  percent: number;
}
import {
  Calendar,
  TrendingUp,
  Users,
  MessageSquare,
  Database,
  Clock,
  AlertCircle,
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalConversations: number;
    totalMessages: number;
    activeUsers: number;
    avgMessagesPerConversation: string;
  };
  messagesByDay: Array<{ date: string; count: number }>;
  conversationsByStatus: Array<{ status: string; count: number }>;
  tierBreakdown: Array<{ tier: string; count: number }>;
  topQuestions: Array<{ question: string; count: number }>;
  knowledgeBase: {
    totalResponses: number;
    responsesWithKB: number;
    usagePercentage: number;
    avgArticlesPerResponse: string;
  };
  // PHASE 5: Sentiment Analytics
  sentimentBreakdown: Array<{ sentiment: string; count: number }>;
  sentimentByDay: Array<{
    date: string;
    frustrated: number;
    neutral: number;
    satisfied: number;
    angry: number;
    confused: number;
  }>;
  escalationStats: {
    totalEscalations: number;
    escalationRate: number;
  };
  recentActivity: Array<{
    id: string;
    title: string;
    status: string;
    messageCount: number;
    lastMessageAt: string;
  }>;
}

const STATUS_COLORS: Record<string, string> = {
  active: '#3b82f6',
  resolved: '#10b981',
  archived: '#6b7280',
  escalated: '#f59e0b',
};

const TIER_COLORS: Record<string, string> = {
  free: '#6b7280',
  professional: '#3b82f6',
  enterprise: '#8b5cf6',
  enterprise_plus: '#ec4899',
};

// PHASE 5: Sentiment Colors
const SENTIMENT_COLORS: Record<string, string> = {
  satisfied: '#10b981',    // Green
  neutral: '#3b82f6',      // Blue
  confused: '#f59e0b',     // Amber
  frustrated: '#f97316',   // Orange
  angry: '#ef4444',        // Red
};

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  async function fetchAnalytics() {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/chat/analytics?days=${timeRange}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="backdrop-blur-xl bg-white/80 rounded-2xl p-8 shadow-xl border border-white/50 text-center">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Time Range Selector */}
      <div className="flex justify-end gap-2">
        <button
          onClick={() => setTimeRange(7)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            timeRange === 7
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          Last 7 Days
        </button>
        <button
          onClick={() => setTimeRange(30)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            timeRange === 30
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          Last 30 Days
        </button>
        <button
          onClick={() => setTimeRange(90)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            timeRange === 90
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          Last 90 Days
        </button>
      </div>

      {/* Messages Over Time Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/80 rounded-2xl p-6 shadow-xl border border-white/50"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Message Activity</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.messagesByDay}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {/* Conversation Status Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="backdrop-blur-xl bg-white/80 rounded-2xl p-6 shadow-xl border border-white/50"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <MessageSquare className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Conversation Status</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.conversationsByStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: any) => {
                  const entry = data.conversationsByStatus[props.index];
                  return `${entry.status}: ${entry.count} (${(props.percent * 100).toFixed(0)}%)`;
                }}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {data.conversationsByStatus.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={STATUS_COLORS[entry.status] || '#6b7280'}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Tier Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="backdrop-blur-xl bg-white/80 rounded-2xl p-6 shadow-xl border border-white/50"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Users by Tier</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.tierBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="tier"
                stroke="#6b7280"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value.replace('_', ' ').toUpperCase()}
              />
              <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {data.tierBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={TIER_COLORS[entry.tier] || '#6b7280'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* PHASE 5: Sentiment Analysis Chart */}
        {data.sentimentBreakdown && data.sentimentBreakdown.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="backdrop-blur-xl bg-white/80 rounded-2xl p-6 shadow-xl border border-white/50"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-100 rounded-lg">
                <MessageSquare className="h-5 w-5 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Customer Sentiment</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.sentimentBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) => {
                    const entry = data.sentimentBreakdown[props.index];
                    return `${entry.sentiment}: ${entry.count} (${(props.percent * 100).toFixed(0)}%)`;
                  }}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.sentimentBreakdown.map((entry, index) => (
                    <Cell
                      key={`sentiment-cell-${index}`}
                      fill={SENTIMENT_COLORS[entry.sentiment] || '#6b7280'}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>

      {/* Knowledge Base Usage */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="backdrop-blur-xl bg-white/80 rounded-2xl p-6 shadow-xl border border-white/50"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Database className="h-5 w-5 text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Knowledge Base & Escalation Performance</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {data.knowledgeBase.totalResponses}
            </div>
            <div className="text-sm text-gray-600">Total Responses</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {data.knowledgeBase.responsesWithKB}
            </div>
            <div className="text-sm text-gray-600">Used KB Articles</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {data.knowledgeBase.usagePercentage.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">KB Usage Rate</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {parseFloat(data.knowledgeBase.avgArticlesPerResponse).toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Avg Articles/Response</div>
          </div>

          {/* PHASE 5: Escalation Stats */}
          {data.escalationStats && (
            <>
              <div className="text-center p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {data.escalationStats.totalEscalations}
                </div>
                <div className="text-sm text-gray-600">Total Escalations</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {data.escalationStats.escalationRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Escalation Rate</div>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Top Questions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="backdrop-blur-xl bg-white/80 rounded-2xl p-6 shadow-xl border border-white/50"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-100 rounded-lg">
            <MessageSquare className="h-5 w-5 text-orange-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Most Common Questions</h3>
        </div>
        <div className="space-y-3">
          {data.topQuestions.slice(0, 10).map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:shadow-md transition-shadow"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 font-medium truncate">{item.question}</p>
              </div>
              <div className="flex-shrink-0 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                {item.count}×
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* PHASE 5: Sentiment Trends Over Time */}
      {data.sentimentByDay && data.sentimentByDay.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="backdrop-blur-xl bg-white/80 rounded-2xl p-6 shadow-xl border border-white/50"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Sentiment Trends</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.sentimentByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Legend />
              <Line type="monotone" dataKey="satisfied" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="neutral" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="confused" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="frustrated" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="angry" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="backdrop-blur-xl bg-white/80 rounded-2xl p-6 shadow-xl border border-white/50"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-pink-100 rounded-lg">
            <Clock className="h-5 w-5 text-pink-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Recent Conversations</h3>
        </div>
        <div className="space-y-3">
          {data.recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:shadow-md transition-shadow"
            >
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 font-medium truncate">{activity.title || 'Untitled'}</p>
                <p className="text-sm text-gray-500">
                  {activity.messageCount} messages •{' '}
                  {new Date(activity.lastMessageAt).toLocaleString()}
                </p>
              </div>
              <div className="flex-shrink-0 ml-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    activity.status === 'active'
                      ? 'bg-blue-100 text-blue-700'
                      : activity.status === 'resolved'
                      ? 'bg-green-100 text-green-700'
                      : activity.status === 'escalated'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {activity.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
