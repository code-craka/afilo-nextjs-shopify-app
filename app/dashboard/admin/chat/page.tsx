/**
 * Admin Chat Bot Dashboard
 *
 * Features:
 * - Bot performance analytics
 * - Conversation management
 * - Knowledge base management
 * - Escalation workflow
 * - Export functionality
 *
 * URL: /dashboard/admin/chat
 * Requires: Admin role
 */

'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Users,
  TrendingUp,
  Database,
  AlertCircle,
  Bot,
  Activity,
  BarChart3,
  Download,
} from 'lucide-react';

import AnalyticsDashboard from '@/components/admin/chat/AnalyticsDashboard';
import ConversationManagement from '@/components/admin/chat/ConversationManagement';
import KnowledgeBaseManager from '@/components/admin/chat/KnowledgeBaseManager';

type TabType = 'analytics' | 'conversations' | 'knowledge-base';

interface AnalyticsOverview {
  totalConversations: number;
  totalMessages: number;
  activeUsers: number;
  avgMessagesPerConversation: string;
}

export default function AdminChatDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('analytics');
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);

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

        // Fetch quick overview stats
        const analyticsResponse = await fetch('/api/admin/chat/analytics?days=7');
        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json();
          if (analyticsData.success) {
            setOverview(analyticsData.data.overview);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error checking admin access:', error);
        router.push('/dashboard');
      }
    }

    checkAccess();
  }, [user, isLoaded, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent mb-4" />
          <div className="text-gray-900 text-xl font-semibold">Loading admin dashboard...</div>
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
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl shadow-lg">
            <Bot className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Chat Bot Administration
            </h1>
            <p className="text-lg text-gray-600 mt-1">
              Monitor performance, manage conversations, and optimize the knowledge base
            </p>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      {overview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="backdrop-blur-xl bg-white/80 rounded-2xl p-6 shadow-xl border border-white/50">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-sm font-medium text-gray-600">Conversations</div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {overview.totalConversations.toLocaleString()}
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/80 rounded-2xl p-6 shadow-xl border border-white/50">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-sm font-medium text-gray-600">Messages</div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {overview.totalMessages.toLocaleString()}
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/80 rounded-2xl p-6 shadow-xl border border-white/50">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-sm font-medium text-gray-600">Active Users</div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {overview.activeUsers.toLocaleString()}
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/80 rounded-2xl p-6 shadow-xl border border-white/50">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-orange-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-sm font-medium text-gray-600">Avg Messages/Conv</div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {parseFloat(overview.avgMessagesPerConversation).toFixed(1)}
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-xl border border-white/50 mb-8 p-2"
      >
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'analytics'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <BarChart3 className="h-5 w-5" />
            Analytics
          </button>

          <button
            onClick={() => setActiveTab('conversations')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'conversations'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <MessageSquare className="h-5 w-5" />
            Conversations
          </button>

          <button
            onClick={() => setActiveTab('knowledge-base')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'knowledge-base'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Database className="h-5 w-5" />
            Knowledge Base
          </button>
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'analytics' && <AnalyticsDashboard />}
        {activeTab === 'conversations' && <ConversationManagement />}
        {activeTab === 'knowledge-base' && <KnowledgeBaseManager />}
      </motion.div>
    </div>
  );
}
