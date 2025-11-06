/**
 * Conversation Management Component
 *
 * Features:
 * - List all conversations with pagination
 * - Filter by status, tier, search
 * - Sort by multiple fields
 * - Escalate to human support
 * - Export transcripts (TXT/JSON)
 * - View conversation details
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Download,
  AlertTriangle,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  MessageSquare,
  User,
  Clock,
  Crown,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Conversation {
  id: string;
  userId: string;
  userEmail: string;
  title: string;
  status: 'active' | 'resolved' | 'archived' | 'escalated';
  tier: string;
  messageCount: number;
  firstMessage: string | null;
  lastMessage: string | null;
  createdAt: string;
  lastMessageAt: string;
}

interface PaginationInfo {
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'archived', label: 'Archived' },
  { value: 'escalated', label: 'Escalated' },
];

const TIER_OPTIONS = [
  { value: '', label: 'All Tiers' },
  { value: 'free', label: 'Free' },
  { value: 'professional', label: 'Professional' },
  { value: 'enterprise', label: 'Enterprise' },
  { value: 'enterprise_plus', label: 'Enterprise Plus' },
];

const SORT_OPTIONS = [
  { value: 'last_message_at', label: 'Recent Activity' },
  { value: 'created_at', label: 'Created Date' },
  { value: 'message_count', label: 'Message Count' },
];

export default function ConversationManagement() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    limit: 20,
    offset: 0,
    total: 0,
    hasMore: false,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [tier, setTier] = useState('');
  const [sortBy, setSortBy] = useState('last_message_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  // Escalation modal
  const [escalatingId, setEscalatingId] = useState<string | null>(null);
  const [escalationReason, setEscalationReason] = useState('');
  const [escalationPriority, setEscalationPriority] = useState<'normal' | 'high' | 'urgent'>(
    'normal'
  );

  useEffect(() => {
    fetchConversations();
  }, [pagination.offset, status, tier, sortBy, sortOrder]);

  async function fetchConversations() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString(),
        sortBy,
        sortOrder,
      });

      if (status) params.set('status', status);
      if (tier) params.set('tier', tier);
      if (search) params.set('search', search);

      const response = await fetch(`/api/admin/chat/conversations?${params}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setConversations(result.data.conversations);
          setPagination(result.data.pagination);
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() {
    setPagination((prev) => ({ ...prev, offset: 0 }));
    fetchConversations();
  }

  function toggleSortOrder() {
    setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
  }

  async function handleEscalate(conversationId: string) {
    if (!escalationReason.trim()) {
      toast.error('Please provide a reason for escalation');
      return;
    }

    try {
      const response = await fetch(`/api/admin/chat/escalate/${conversationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: escalationReason,
          priority: escalationPriority,
        }),
      });

      if (response.ok) {
        toast.success('Conversation escalated successfully');
        setEscalatingId(null);
        setEscalationReason('');
        fetchConversations();
      } else {
        toast.error('Failed to escalate conversation');
      }
    } catch (error) {
      console.error('Error escalating conversation:', error);
      toast.error('Failed to escalate conversation');
    }
  }

  async function handleExport(conversationId: string, format: 'txt' | 'json') {
    try {
      const response = await fetch(`/api/admin/chat/export/${conversationId}?format=${format}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `conversation-${conversationId}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success(`Transcript exported as ${format.toUpperCase()}`);
      } else {
        toast.error('Failed to export transcript');
      }
    } catch (error) {
      console.error('Error exporting conversation:', error);
      toast.error('Failed to export transcript');
    }
  }

  function getTierBadgeColor(tier: string) {
    switch (tier) {
      case 'enterprise_plus':
        return 'bg-gradient-to-r from-pink-500 to-purple-500 text-white';
      case 'enterprise':
        return 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white';
      case 'professional':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  }

  function getStatusBadgeColor(status: string) {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-700';
      case 'resolved':
        return 'bg-green-100 text-green-700';
      case 'escalated':
        return 'bg-orange-100 text-orange-700';
      case 'archived':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/80 rounded-2xl p-6 shadow-xl border border-white/50"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by user email or title..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                Search
              </button>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPagination((prev) => ({ ...prev, offset: 0 }));
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tier Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tier</label>
            <select
              value={tier}
              onChange={(e) => {
                setTier(e.target.value);
                setPagination((prev) => ({ ...prev, offset: 0 }));
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {TIER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                onClick={toggleSortOrder}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                title={`Sort ${sortOrder === 'ASC' ? 'Ascending' : 'Descending'}`}
              >
                <ArrowUpDown className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Conversations Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-xl border border-white/50 overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent mb-4" />
              <p className="text-gray-600">Loading conversations...</p>
            </div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No conversations found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Tier
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Messages
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Last Activity
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {conversations.map((conv) => (
                    <tr key={conv.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {conv.userEmail || 'Unknown'}
                            </div>
                            <div className="text-xs text-gray-500">{conv.userId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 font-medium max-w-xs truncate">
                          {conv.title || 'Untitled'}
                        </div>
                        {conv.firstMessage && (
                          <div className="text-xs text-gray-500 max-w-xs truncate mt-1">
                            {conv.firstMessage}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                            conv.status
                          )}`}
                        >
                          {conv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getTierBadgeColor(
                            conv.tier
                          )}`}
                        >
                          {(conv.tier === 'enterprise' || conv.tier === 'enterprise_plus') && (
                            <Crown className="h-3 w-3" />
                          )}
                          {conv.tier.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-semibold text-gray-900">
                            {conv.messageCount}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4 text-gray-400" />
                          {new Date(conv.lastMessageAt).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {conv.status !== 'escalated' && (
                            <button
                              onClick={() => setEscalatingId(conv.id)}
                              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                              title="Escalate to human"
                            >
                              <AlertTriangle className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleExport(conv.id, 'txt')}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Export as TXT"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleExport(conv.id, 'json')}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Export as JSON"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of{' '}
                {pagination.total} conversations
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      offset: Math.max(0, prev.offset - prev.limit),
                    }))
                  }
                  disabled={pagination.offset === 0}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      offset: prev.offset + prev.limit,
                    }))
                  }
                  disabled={!pagination.hasMore}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* Escalation Modal */}
      {escalatingId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-orange-100 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Escalate Conversation</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={escalationPriority}
                  onChange={(e) =>
                    setEscalationPriority(e.target.value as 'normal' | 'high' | 'urgent')
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Escalation
                </label>
                <textarea
                  value={escalationReason}
                  onChange={(e) => setEscalationReason(e.target.value)}
                  placeholder="Explain why this conversation needs human support..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setEscalatingId(null);
                  setEscalationReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleEscalate(escalatingId)}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                Escalate
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
