/**
 * Admin User Management Dashboard
 *
 * Phase 2 Feature: Advanced Admin Dashboard
 *
 * Features:
 * - View all users with subscription status
 * - Manage user roles and permissions
 * - Track user engagement metrics
 * - Filter and search users
 * - Export user data
 * - User support actions
 *
 * URL: /dashboard/admin/users
 * Requires: Admin role
 */

'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  Download,
  UserPlus,
  UserCheck,
  UserX,
  Crown,
  Shield,
  Clock,
  DollarSign,
  Mail,
  MoreVertical,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';

interface User {
  id: string;
  clerkUserId: string;
  email: string;
  firstName: string;
  lastName: string;
  imageUrl: string | null;
  role: 'user' | 'admin' | 'owner';
  createdAt: string;
  lastLoginAt: string | null;
  isActive: boolean;
  subscription: {
    status: 'active' | 'inactive' | 'canceled' | 'trial';
    plan: string | null;
    mrr: number;
    nextBillingDate: string | null;
  } | null;
  stats: {
    totalPurchases: number;
    totalSpent: number;
    chatMessages: number;
    lastActivity: string | null;
  };
}

type UserRole = 'all' | 'user' | 'admin' | 'owner';
type UserStatus = 'all' | 'active' | 'inactive';
type SubscriptionStatus = 'all' | 'active' | 'inactive' | 'trial' | 'canceled';

export default function AdminUserManagement() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Filters
  const [roleFilter, setRoleFilter] = useState<UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<UserStatus>('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState<SubscriptionStatus>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(20);

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    avgMRR: 0,
  });

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

        await fetchUsers();
        setLoading(false);
      } catch (error) {
        console.error('Error checking admin access:', error);
        router.push('/dashboard');
      }
    }

    checkAccess();
  }, [user, isLoaded, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user =>
        statusFilter === 'active' ? user.isActive : !user.isActive
      );
    }

    // Subscription filter
    if (subscriptionFilter !== 'all') {
      filtered = filtered.filter(user => {
        if (subscriptionFilter === 'inactive') {
          return !user.subscription || user.subscription.status === 'inactive';
        }
        return user.subscription?.status === subscriptionFilter;
      });
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [users, searchTerm, roleFilter, statusFilter, subscriptionFilter]);

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        await fetchUsers();
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleUserStatusToggle = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        await fetchUsers();
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const exportUsers = async () => {
    try {
      const response = await fetch('/api/admin/users/export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `users-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting users:', error);
    }
  };

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent mb-4" />
          <div className="text-gray-900 text-xl font-semibold">Loading user management...</div>
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
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl shadow-lg">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                User Management
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Manage users, roles, and monitor engagement
              </p>
            </div>
          </div>

          <button
            onClick={exportUsers}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            <Download className="h-5 w-5" />
            Export Users
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-white/80 rounded-2xl p-6 shadow-xl border border-white/50">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-sm font-medium text-gray-600">Total Users</div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.totalUsers.toLocaleString()}
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/80 rounded-2xl p-6 shadow-xl border border-white/50">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-sm font-medium text-gray-600">Active Users</div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.activeUsers.toLocaleString()}
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/80 rounded-2xl p-6 shadow-xl border border-white/50">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-sm font-medium text-gray-600">Total Revenue</div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              ${stats.totalRevenue.toLocaleString()}
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/80 rounded-2xl p-6 shadow-xl border border-white/50">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-sm font-medium text-gray-600">Avg MRR</div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              ${stats.avgMRR.toFixed(0)}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-xl border border-white/50 p-6 mb-8"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Roles</option>
              <option value="user">Users</option>
              <option value="admin">Admins</option>
              <option value="owner">Owners</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as UserStatus)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={subscriptionFilter}
              onChange={(e) => setSubscriptionFilter(e.target.value as SubscriptionStatus)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Subscriptions</option>
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="inactive">No Subscription</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-xl border border-white/50 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Subscription</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Activity</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Revenue</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentUsers.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  {/* User Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.imageUrl ? (
                        <div className="relative w-10 h-10 rounded-full overflow-hidden">
                          <Image
                            src={user.imageUrl}
                            alt={`${user.firstName} ${user.lastName}`}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {user.role === 'owner' && <Crown className="h-4 w-4 text-yellow-500" />}
                      {user.role === 'admin' && <Shield className="h-4 w-4 text-blue-500" />}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.role === 'owner' ? 'bg-yellow-100 text-yellow-800' :
                        user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        user.isActive ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className={`text-sm font-medium ${
                        user.isActive ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>

                  {/* Subscription */}
                  <td className="px-6 py-4">
                    {user.subscription ? (
                      <div>
                        <div className={`px-2 py-1 text-xs font-medium rounded-full inline-block ${
                          user.subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                          user.subscription.status === 'trial' ? 'bg-blue-100 text-blue-800' :
                          user.subscription.status === 'canceled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.subscription.status}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {user.subscription.plan}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">No subscription</span>
                    )}
                  </td>

                  {/* Activity */}
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="text-gray-900">
                        {user.stats.chatMessages} messages
                      </div>
                      <div className="text-gray-600">
                        {user.stats.lastActivity
                          ? format(new Date(user.stats.lastActivity), 'MMM d, yyyy')
                          : 'Never'
                        }
                      </div>
                    </div>
                  </td>

                  {/* Revenue */}
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-semibold text-gray-900">
                        ${user.stats.totalSpent.toFixed(2)}
                      </div>
                      <div className="text-gray-600">
                        {user.stats.totalPurchases} purchases
                      </div>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      {user.role !== 'owner' && (
                        <>
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value as 'user' | 'admin')}
                            className="text-xs px-2 py-1 border border-gray-200 rounded"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>

                          <button
                            onClick={() => handleUserStatusToggle(user.id, user.isActive)}
                            className={`p-2 rounded-lg transition-colors ${
                              user.isActive
                                ? 'hover:bg-red-100 text-red-600'
                                : 'hover:bg-green-100 text-green-600'
                            }`}
                            title={user.isActive ? 'Deactivate user' : 'Activate user'}
                          >
                            {user.isActive ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <div className="text-sm text-gray-600">
              Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}