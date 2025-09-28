'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Types for Enterprise Portal
interface EnterpriseUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'developer' | 'viewer';
  department: string;
  lastActive: string;
  status: 'active' | 'inactive' | 'pending';
  permissions: string[];
  avatar?: string;
  joinedDate: string;
  licenseType: 'enterprise' | 'professional' | 'commercial';
}

interface UsageAnalytics {
  period: 'daily' | 'weekly' | 'monthly';
  data: {
    date: string;
    apiCalls: number;
    activeUsers: number;
    deployments: number;
    storageUsed: number;
  }[];
  totals: {
    apiCalls: number;
    activeUsers: number;
    deployments: number;
    storageUsed: number;
    billingCycle: string;
    nextBilling: string;
  };
  limits: {
    apiCalls: number;
    activeUsers: number;
    storageGB: number;
    deployments: number;
  };
}

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  category: 'technical' | 'billing' | 'feature-request' | 'bug-report';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  responses: number;
  escalated: boolean;
}

interface BillingInfo {
  currentPlan: {
    name: string;
    price: number;
    billingCycle: 'monthly' | 'annual';
    features: string[];
    userLimit: number;
  };
  usage: {
    users: number;
    apiCalls: number;
    storage: number;
    support: string;
  };
  invoices: {
    id: string;
    date: string;
    amount: number;
    status: 'paid' | 'pending' | 'overdue';
    downloadUrl: string;
  }[];
  paymentMethod: {
    type: 'card' | 'bank' | 'invoice';
    last4?: string;
    expiryDate?: string;
  };
  nextBilling: {
    date: string;
    amount: number;
    prorations: number;
  };
}

export default function EnterprisePortal() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'analytics' | 'billing' | 'support'>('dashboard');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [analyticsperiod, setAnalyticsPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  // Mock Enterprise Users Data
  const [enterpriseUsers] = useState<EnterpriseUser[]>([
    {
      id: '1',
      name: 'Sarah Mitchell',
      email: 'sarah.mitchell@company.com',
      role: 'admin',
      department: 'Engineering',
      lastActive: '2024-01-15T10:30:00Z',
      status: 'active',
      permissions: ['user-management', 'billing', 'analytics', 'support', 'admin-settings'],
      joinedDate: '2023-06-15',
      licenseType: 'enterprise'
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael.chen@company.com',
      role: 'manager',
      department: 'Product',
      lastActive: '2024-01-15T09:45:00Z',
      status: 'active',
      permissions: ['user-management', 'analytics', 'support'],
      joinedDate: '2023-08-22',
      licenseType: 'professional'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@company.com',
      role: 'developer',
      department: 'Engineering',
      lastActive: '2024-01-15T11:15:00Z',
      status: 'active',
      permissions: ['development', 'deployment'],
      joinedDate: '2023-09-10',
      licenseType: 'professional'
    },
    {
      id: '4',
      name: 'David Kim',
      email: 'david.kim@company.com',
      role: 'developer',
      department: 'Engineering',
      lastActive: '2024-01-14T16:20:00Z',
      status: 'active',
      permissions: ['development', 'deployment'],
      joinedDate: '2023-11-05',
      licenseType: 'commercial'
    },
    {
      id: '5',
      name: 'Lisa Thompson',
      email: 'lisa.thompson@company.com',
      role: 'viewer',
      department: 'Marketing',
      lastActive: '2024-01-15T08:30:00Z',
      status: 'active',
      permissions: ['view-analytics'],
      joinedDate: '2024-01-02',
      licenseType: 'commercial'
    },
    {
      id: '6',
      name: 'James Wilson',
      email: 'james.wilson@company.com',
      role: 'developer',
      department: 'Engineering',
      lastActive: '2024-01-10T14:45:00Z',
      status: 'inactive',
      permissions: ['development'],
      joinedDate: '2023-07-18',
      licenseType: 'professional'
    }
  ]);

  // Mock Usage Analytics
  const [usageAnalytics] = useState<UsageAnalytics>({
    period: 'monthly',
    data: [
      { date: '2024-01-01', apiCalls: 45000, activeUsers: 23, deployments: 156, storageUsed: 2.3 },
      { date: '2024-01-02', apiCalls: 52000, activeUsers: 27, deployments: 189, storageUsed: 2.4 },
      { date: '2024-01-03', apiCalls: 48000, activeUsers: 25, deployments: 167, storageUsed: 2.5 },
      { date: '2024-01-04', apiCalls: 61000, activeUsers: 31, deployments: 203, storageUsed: 2.6 },
      { date: '2024-01-05', apiCalls: 58000, activeUsers: 29, deployments: 178, storageUsed: 2.7 }
    ],
    totals: {
      apiCalls: 1450000,
      activeUsers: 42,
      deployments: 2340,
      storageUsed: 47.8,
      billingCycle: 'Monthly',
      nextBilling: '2024-02-15'
    },
    limits: {
      apiCalls: 2000000,
      activeUsers: 50,
      storageGB: 100,
      deployments: 5000
    }
  });

  // Mock Support Tickets
  const [supportTickets] = useState<SupportTicket[]>([
    {
      id: 'TICK-2024-001',
      title: 'API Rate Limiting Issues',
      description: 'Experiencing rate limiting on deployment APIs during peak hours',
      priority: 'high',
      status: 'in-progress',
      category: 'technical',
      createdAt: '2024-01-14T09:30:00Z',
      updatedAt: '2024-01-15T10:15:00Z',
      assignedTo: 'Technical Support Team',
      responses: 3,
      escalated: false
    },
    {
      id: 'TICK-2024-002',
      title: 'Billing Discrepancy',
      description: 'Invoice amount does not match expected usage calculations',
      priority: 'medium',
      status: 'open',
      category: 'billing',
      createdAt: '2024-01-13T14:22:00Z',
      updatedAt: '2024-01-13T14:22:00Z',
      responses: 0,
      escalated: false
    },
    {
      id: 'TICK-2024-003',
      title: 'Feature Request: Advanced Analytics',
      description: 'Request for custom dashboard widgets and enhanced reporting',
      priority: 'low',
      status: 'open',
      category: 'feature-request',
      createdAt: '2024-01-12T11:45:00Z',
      updatedAt: '2024-01-14T16:30:00Z',
      responses: 2,
      escalated: false
    }
  ]);

  // Mock Billing Information
  const [billingInfo] = useState<BillingInfo>({
    currentPlan: {
      name: 'Enterprise Plus',
      price: 9999,
      billingCycle: 'monthly',
      features: [
        'Unlimited API calls',
        'Up to 50 enterprise users',
        '100GB storage',
        '24/7 premium support',
        'Advanced analytics',
        'Custom integrations',
        'SSO & SAML support',
        'Dedicated account manager'
      ],
      userLimit: 50
    },
    usage: {
      users: 42,
      apiCalls: 1450000,
      storage: 47.8,
      support: '24/7 Premium'
    },
    invoices: [
      { id: 'INV-2024-001', date: '2024-01-15', amount: 9999, status: 'paid', downloadUrl: '/invoices/2024-001.pdf' },
      { id: 'INV-2023-012', date: '2023-12-15', amount: 9999, status: 'paid', downloadUrl: '/invoices/2023-012.pdf' },
      { id: 'INV-2023-011', date: '2023-11-15', amount: 9999, status: 'paid', downloadUrl: '/invoices/2023-011.pdf' }
    ],
    paymentMethod: {
      type: 'card',
      last4: '4242',
      expiryDate: '12/26'
    },
    nextBilling: {
      date: '2024-02-15',
      amount: 9999,
      prorations: 0
    }
  });

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleColor = (role: EnterpriseUser['role']) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'developer': return 'bg-green-100 text-green-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: SupportTicket['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100);
  };

  return (
    <div className="max-w-7xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <h1 className="text-3xl font-bold mb-2">Enterprise Portal</h1>
        <p className="text-blue-100">
          Comprehensive account management for your enterprise organization
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 bg-gray-50">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'users', label: 'User Management', icon: '👥' },
            { id: 'analytics', label: 'Usage Analytics', icon: '📈' },
            { id: 'billing', label: 'Billing & Invoices', icon: '💳' },
            { id: 'support', label: 'Support Center', icon: '🎧' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-blue-900">Active Users</h3>
                    <span className="text-2xl">👥</span>
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {usageAnalytics.totals.activeUsers}
                  </div>
                  <div className="text-sm text-blue-700">
                    of {usageAnalytics.limits.activeUsers} limit
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2 mt-3">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${calculateUsagePercentage(usageAnalytics.totals.activeUsers, usageAnalytics.limits.activeUsers)}%` }}
                    />
                  </div>
                </div>

                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-green-900">API Calls</h3>
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {(usageAnalytics.totals.apiCalls / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-sm text-green-700">
                    of {(usageAnalytics.limits.apiCalls / 1000000).toFixed(1)}M limit
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-2 mt-3">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${calculateUsagePercentage(usageAnalytics.totals.apiCalls, usageAnalytics.limits.apiCalls)}%` }}
                    />
                  </div>
                </div>

                <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-purple-900">Storage</h3>
                    <span className="text-2xl">💾</span>
                  </div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {usageAnalytics.totals.storageUsed.toFixed(1)}GB
                  </div>
                  <div className="text-sm text-purple-700">
                    of {usageAnalytics.limits.storageGB}GB limit
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-2 mt-3">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${calculateUsagePercentage(usageAnalytics.totals.storageUsed, usageAnalytics.limits.storageGB)}%` }}
                    />
                  </div>
                </div>

                <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-orange-900">Deployments</h3>
                    <span className="text-2xl">🚀</span>
                  </div>
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {usageAnalytics.totals.deployments.toLocaleString()}
                  </div>
                  <div className="text-sm text-orange-700">
                    of {usageAnalytics.limits.deployments.toLocaleString()} limit
                  </div>
                  <div className="w-full bg-orange-200 rounded-full h-2 mt-3">
                    <div
                      className="bg-orange-600 h-2 rounded-full"
                      style={{ width: `${calculateUsagePercentage(usageAnalytics.totals.deployments, usageAnalytics.limits.deployments)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Recent User Activity</h3>
                  <div className="space-y-4">
                    {enterpriseUsers.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-600">
                            Last active: {formatDateTime(user.lastActive)}
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                          {user.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Support Tickets</h3>
                  <div className="space-y-4">
                    {supportTickets.slice(0, 3).map((ticket) => (
                      <div key={ticket.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{ticket.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{ticket.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{ticket.id}</span>
                          <span>{formatDate(ticket.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm">
                    View All Tickets
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* User Management Tab */}
          {activeTab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Users Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                  <p className="text-gray-600">Manage enterprise users, roles, and permissions</p>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Invite User
                </button>
              </div>

              {/* Users Table */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-3 px-6 font-medium text-gray-900">User</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-900">Role</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-900">Department</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-900">Status</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-900">Last Active</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enterpriseUsers.map((user) => (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-600">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-gray-700">{user.department}</td>
                          <td className="py-4 px-6">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-gray-600 text-sm">
                            {formatDateTime(user.lastActive)}
                          </td>
                          <td className="py-4 px-6">
                            <button
                              onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
                              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                            >
                              {selectedUser === user.id ? 'Hide' : 'Edit'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* User Details Panel */}
              <AnimatePresence>
                {selectedUser && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white rounded-xl border border-gray-200 p-6"
                  >
                    {(() => {
                      const user = enterpriseUsers.find(u => u.id === selectedUser);
                      if (!user) return null;

                      return (
                        <div className="space-y-6">
                          <h3 className="text-xl font-bold text-gray-900">Edit User: {user.name}</h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                              <select className="w-full p-3 border border-gray-300 rounded-lg">
                                <option value="admin">Administrator</option>
                                <option value="manager">Manager</option>
                                <option value="developer">Developer</option>
                                <option value="viewer">Viewer</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                              <select className="w-full p-3 border border-gray-300 rounded-lg">
                                <option value="Engineering">Engineering</option>
                                <option value="Product">Product</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Sales">Sales</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-900 mb-3">Permissions</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {[
                                'User Management',
                                'Billing Access',
                                'Analytics View',
                                'Support Tickets',
                                'Admin Settings',
                                'Development',
                                'Deployment',
                                'API Access'
                              ].map((permission) => (
                                <label key={permission} className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    defaultChecked={user.permissions.some(p =>
                                      p.toLowerCase().includes(permission.toLowerCase().split(' ')[0])
                                    )}
                                    className="rounded border-gray-300"
                                  />
                                  <span className="text-sm text-gray-700">{permission}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-3 pt-4 border-t border-gray-200">
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                              Save Changes
                            </button>
                            <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                              Reset Password
                            </button>
                            <button className="text-red-600 hover:text-red-700 px-4 py-2">
                              Deactivate User
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Usage Analytics</h2>
                  <p className="text-gray-600">Monitor platform usage and performance metrics</p>
                </div>
                <select
                  value={analyticsePeriod}
                  onChange={(e) => setAnalyticsPeriod(e.target.value as any)}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {/* Analytics Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">API Usage Trends</h3>
                  <div className="space-y-4">
                    {usageAnalytics.data.map((data, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-gray-600">{formatDate(data.date)}</span>
                        <div className="flex items-center gap-4">
                          <span className="font-medium">{data.apiCalls.toLocaleString()}</span>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${(data.apiCalls / 70000) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">User Activity</h3>
                  <div className="space-y-4">
                    {usageAnalytics.data.map((data, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-gray-600">{formatDate(data.date)}</span>
                        <div className="flex items-center gap-4">
                          <span className="font-medium">{data.activeUsers} users</span>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${(data.activeUsers / 35) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Usage Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Usage Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{usageAnalytics.totals.apiCalls.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total API Calls</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{usageAnalytics.totals.activeUsers}</div>
                    <div className="text-sm text-gray-600">Peak Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{usageAnalytics.totals.deployments}</div>
                    <div className="text-sm text-gray-600">Total Deployments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">{usageAnalytics.totals.storageUsed}GB</div>
                    <div className="text-sm text-gray-600">Storage Used</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <motion.div
              key="billing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Billing & Invoices</h2>
                <p className="text-gray-600">Manage your enterprise subscription and billing</p>
              </div>

              {/* Current Plan */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Current Plan</h3>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-2xl font-bold text-gray-900">{billingInfo.currentPlan.name}</h4>
                        <p className="text-gray-600">
                          ${billingInfo.currentPlan.price.toLocaleString()}/{billingInfo.currentPlan.billingCycle}
                        </p>
                      </div>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Change Plan
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Current Usage</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Users:</span>
                            <span className="font-medium">{billingInfo.usage.users}/{billingInfo.currentPlan.userLimit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>API Calls:</span>
                            <span className="font-medium">{(billingInfo.usage.apiCalls / 1000000).toFixed(1)}M</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Storage:</span>
                            <span className="font-medium">{billingInfo.usage.storage}GB</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Support:</span>
                            <span className="font-medium">{billingInfo.usage.support}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Next Billing</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Date:</span>
                            <span className="font-medium">{formatDate(billingInfo.nextBilling.date)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Amount:</span>
                            <span className="font-medium">${billingInfo.nextBilling.amount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Prorations:</span>
                            <span className="font-medium">${billingInfo.nextBilling.prorations}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">Plan Features</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {billingInfo.currentPlan.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">Payment Method</h5>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-6 bg-gray-300 rounded flex items-center justify-center">
                          <span className="text-xs font-bold">CARD</span>
                        </div>
                        <div>
                          <div className="font-medium">**** {billingInfo.paymentMethod.last4}</div>
                          <div className="text-sm text-gray-600">Expires {billingInfo.paymentMethod.expiryDate}</div>
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                        Update Payment Method
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Invoice History */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Invoice History</h3>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-200">
                      <tr>
                        <th className="text-left py-3 font-medium text-gray-900">Invoice</th>
                        <th className="text-left py-3 font-medium text-gray-900">Date</th>
                        <th className="text-left py-3 font-medium text-gray-900">Amount</th>
                        <th className="text-left py-3 font-medium text-gray-900">Status</th>
                        <th className="text-left py-3 font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billingInfo.invoices.map((invoice) => (
                        <tr key={invoice.id} className="border-b border-gray-100">
                          <td className="py-4 font-medium text-gray-900">{invoice.id}</td>
                          <td className="py-4 text-gray-700">{formatDate(invoice.date)}</td>
                          <td className="py-4 font-medium text-gray-900">${invoice.amount.toLocaleString()}</td>
                          <td className="py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                              invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {invoice.status}
                            </span>
                          </td>
                          <td className="py-4">
                            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                              Download PDF
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Support Tab */}
          {activeTab === 'support' && (
            <motion.div
              key="support"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Support Center</h2>
                  <p className="text-gray-600">Enterprise support tickets and assistance</p>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Create New Ticket
                </button>
              </div>

              {/* Support Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">{supportTickets.length}</div>
                  <div className="text-sm text-blue-700">Total Tickets</div>
                </div>
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <div className="text-2xl font-bold text-green-600">
                    {supportTickets.filter(t => t.status === 'resolved').length}
                  </div>
                  <div className="text-sm text-green-700">Resolved</div>
                </div>
                <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                  <div className="text-2xl font-bold text-orange-600">
                    {supportTickets.filter(t => t.status === 'in-progress').length}
                  </div>
                  <div className="text-sm text-orange-700">In Progress</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600">2.3h</div>
                  <div className="text-sm text-purple-700">Avg Response Time</div>
                </div>
              </div>

              {/* Support Tickets */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Your Support Tickets</h3>

                <div className="space-y-4">
                  {supportTickets.map((ticket) => (
                    <div key={ticket.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-bold text-gray-900">{ticket.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3">{ticket.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>ID: {ticket.id}</span>
                            <span>•</span>
                            <span>Category: {ticket.category}</span>
                            <span>•</span>
                            <span>Created: {formatDate(ticket.createdAt)}</span>
                            <span>•</span>
                            <span>{ticket.responses} responses</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            ticket.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                            ticket.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {ticket.status}
                          </span>
                          {ticket.escalated && (
                            <div className="text-xs text-red-600 mt-1">Escalated</div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                          View Details
                        </button>
                        <button className="text-gray-600 hover:text-gray-700 font-medium text-sm">
                          Add Response
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Support */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Need Immediate Assistance?</h3>
                <p className="text-gray-600 mb-6">
                  As an Enterprise customer, you have access to priority support channels
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="bg-white border border-gray-300 p-4 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <div className="font-medium text-gray-900">📞 Phone Support</div>
                    <div className="text-sm text-gray-600">24/7 dedicated line</div>
                  </button>
                  <button className="bg-white border border-gray-300 p-4 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <div className="font-medium text-gray-900">💬 Live Chat</div>
                    <div className="text-sm text-gray-600">Instant messaging</div>
                  </button>
                  <button className="bg-white border border-gray-300 p-4 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <div className="font-medium text-gray-900">👤 Account Manager</div>
                    <div className="text-sm text-gray-600">Dedicated contact</div>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}