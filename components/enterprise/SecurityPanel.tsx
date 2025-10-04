'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Smartphone,
  Lock,
  Activity,
  MapPin,
  Monitor,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  Globe,
  Key,
  User,
  Settings
} from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  ipAddress: string;
  location: string;
  device: string;
  status: 'success' | 'failed' | 'warning';
}

interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
}

interface SecurityScore {
  overall: number;
  components: {
    authentication: number;
    encryption: number;
    accessControl: number;
    monitoring: number;
  };
}

// Mock data
const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    action: 'User login',
    user: 'sarah@acme.com',
    timestamp: '2025-01-04 14:23:45',
    ipAddress: '192.168.1.100',
    location: 'San Francisco, CA',
    device: 'Chrome on macOS',
    status: 'success'
  },
  {
    id: '2',
    action: 'API key created',
    user: 'michael@acme.com',
    timestamp: '2025-01-04 13:45:12',
    ipAddress: '10.0.0.50',
    location: 'New York, NY',
    device: 'Firefox on Windows',
    status: 'success'
  },
  {
    id: '3',
    action: 'Failed login attempt',
    user: 'unknown@suspicious.com',
    timestamp: '2025-01-04 12:15:33',
    ipAddress: '45.123.45.67',
    location: 'Unknown',
    device: 'Unknown',
    status: 'failed'
  },
  {
    id: '4',
    action: 'Password changed',
    user: 'emily@acme.com',
    timestamp: '2025-01-04 11:30:22',
    ipAddress: '192.168.1.105',
    location: 'Austin, TX',
    device: 'Safari on macOS',
    status: 'success'
  },
  {
    id: '5',
    action: 'Team member invited',
    user: 'sarah@acme.com',
    timestamp: '2025-01-04 10:20:15',
    ipAddress: '192.168.1.100',
    location: 'San Francisco, CA',
    device: 'Chrome on macOS',
    status: 'success'
  },
  {
    id: '6',
    action: 'IP whitelist updated',
    user: 'michael@acme.com',
    timestamp: '2025-01-04 09:45:00',
    ipAddress: '10.0.0.50',
    location: 'New York, NY',
    device: 'Firefox on Windows',
    status: 'warning'
  }
];

const mockSessions: ActiveSession[] = [
  {
    id: '1',
    device: 'MacBook Pro',
    browser: 'Chrome 120',
    location: 'San Francisco, CA',
    ipAddress: '192.168.1.100',
    lastActive: '2 minutes ago',
    isCurrent: true
  },
  {
    id: '2',
    device: 'iPhone 15 Pro',
    browser: 'Safari iOS',
    location: 'San Francisco, CA',
    ipAddress: '192.168.1.101',
    lastActive: '1 hour ago',
    isCurrent: false
  },
  {
    id: '3',
    device: 'Windows Desktop',
    browser: 'Edge 120',
    location: 'Remote Office',
    ipAddress: '10.0.0.50',
    lastActive: '3 hours ago',
    isCurrent: false
  }
];

const mockSecurityScore: SecurityScore = {
  overall: 87,
  components: {
    authentication: 95,
    encryption: 90,
    accessControl: 85,
    monitoring: 78
  }
};

const mockWhitelistedIPs = [
  { id: '1', ip: '192.168.1.0/24', label: 'Office Network', addedBy: 'sarah@acme.com' },
  { id: '2', ip: '10.0.0.0/16', label: 'Remote Workers', addedBy: 'michael@acme.com' },
  { id: '3', ip: '172.16.0.100', label: 'Dev Server', addedBy: 'emily@acme.com' }
];

export default function SecurityPanel() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [ipWhitelistEnabled, setIpWhitelistEnabled] = useState(true);
  const [selectedLogType, setSelectedLogType] = useState<string>('all');

  const filteredLogs = selectedLogType === 'all'
    ? mockAuditLogs
    : mockAuditLogs.filter(log => log.status === selectedLogType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Security Settings</h2>
        <p className="text-gray-400">Manage security features and monitor activity</p>
      </div>

      {/* Security Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-gradient-to-br from-green-600/10 to-emerald-600/10 border border-white/10 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Security Score</h3>
            <p className="text-sm text-gray-400">Enterprise-grade protection</p>
          </div>
          <div className="relative">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="8"
                fill="none"
              />
              <motion.circle
                cx="48"
                cy="48"
                r="40"
                stroke="url(#scoreGradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDashoffset: 251 }}
                animate={{ strokeDashoffset: 251 - (251 * mockSecurityScore.overall) / 100 }}
                transition={{ duration: 2, ease: 'easeOut' }}
                style={{ strokeDasharray: '251' }}
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{mockSecurityScore.overall}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(mockSecurityScore.components).map(([key, value]) => (
            <div key={key} className="bg-white/5 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1 capitalize">{key}</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="h-full bg-gradient-to-r from-green-600 to-emerald-600 rounded-full"
                  />
                </div>
                <span className="text-sm font-semibold text-white">{value}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-300">
            Your security configuration meets enterprise standards. Consider enabling 2FA for additional protection.
          </p>
        </div>
      </motion.div>

      {/* Security Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Two-Factor Authentication */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-400">Add an extra layer of security</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                twoFactorEnabled ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </motion.button>
          </div>
          {!twoFactorEnabled && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
            >
              Set Up 2FA
            </motion.button>
          )}
        </motion.div>

        {/* IP Whitelist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Globe className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">IP Whitelist</h3>
                <p className="text-sm text-gray-400">Restrict access by IP address</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIpWhitelistEnabled(!ipWhitelistEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                ipWhitelistEnabled ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  ipWhitelistEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </motion.button>
          </div>
          <div className="text-sm text-gray-400">
            {mockWhitelistedIPs.length} IP ranges whitelisted
          </div>
        </motion.div>
      </div>

      {/* Active Sessions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Active Sessions</h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/20 transition-colors"
          >
            Logout All
          </motion.button>
        </div>
        <div className="space-y-3">
          {mockSessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{session.device}</span>
                    {session.isCurrent && (
                      <span className="px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded text-xs text-green-300">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      {session.browser}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {session.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {session.lastActive}
                    </span>
                  </div>
                </div>
              </div>
              {!session.isCurrent && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 text-white rounded-lg text-sm hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-colors"
                >
                  Logout
                </motion.button>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Audit Logs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl overflow-hidden"
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Audit Logs</h3>
            <select
              value={selectedLogType}
              onChange={(e) => setSelectedLogType(e.target.value)}
              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Events</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="warning">Warnings</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Action</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">User</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Location</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Timestamp</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, index) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="text-white font-medium">{log.action}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-gray-300">{log.user}</div>
                      <div className="text-xs text-gray-500">{log.device}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-gray-300">{log.location}</div>
                      <div className="text-xs text-gray-500">{log.ipAddress}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-300 text-sm">{log.timestamp}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {log.status === 'success' && (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 text-sm">Success</span>
                        </>
                      )}
                      {log.status === 'failed' && (
                        <>
                          <XCircle className="w-4 h-4 text-red-400" />
                          <span className="text-red-400 text-sm">Failed</span>
                        </>
                      )}
                      {log.status === 'warning' && (
                        <>
                          <AlertTriangle className="w-4 h-4 text-yellow-400" />
                          <span className="text-yellow-400 text-sm">Warning</span>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
