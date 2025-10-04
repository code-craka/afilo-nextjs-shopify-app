'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Key,
  Plus,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  RotateCw,
  Check,
  AlertTriangle,
  Code,
  Activity
} from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string;
  requests: number;
  scopes: string[];
  status: 'active' | 'revoked';
}

const mockApiKeys: ApiKey[] = [
  {
    id: '1',
    name: 'Production API',
    key: 'ak_live_2h8f9n2k4l5m6n7o8p9q0r1s2t3u4v5w',
    createdAt: '2024-01-15',
    lastUsed: '5 minutes ago',
    requests: 2847291,
    scopes: ['read', 'write', 'admin'],
    status: 'active'
  },
  {
    id: '2',
    name: 'Development API',
    key: 'ak_test_9x8y7z6w5v4u3t2s1r0q9p8o7n6m5l4k',
    createdAt: '2024-02-10',
    lastUsed: '2 hours ago',
    requests: 145892,
    scopes: ['read', 'write'],
    status: 'active'
  },
  {
    id: '3',
    name: 'Analytics API',
    key: 'ak_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
    createdAt: '2024-03-05',
    lastUsed: '1 day ago',
    requests: 78423,
    scopes: ['read'],
    status: 'active'
  }
];

export default function ApiKeyManager() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(mockApiKeys);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  const copyToClipboard = async (key: string, keyId: string) => {
    await navigator.clipboard.writeText(key);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const maskApiKey = (key: string) => {
    const prefix = key.substring(0, 12);
    const suffix = key.substring(key.length - 4);
    return `${prefix}${'•'.repeat(20)}${suffix}`;
  };

  const totalRequests = apiKeys.reduce((sum, key) => sum + key.requests, 0);
  const activeKeys = apiKeys.filter(k => k.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">API Keys</h2>
          <p className="text-gray-400">Manage your API keys and access tokens</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Create New Key
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Active Keys"
          value={activeKeys}
          icon={<Key className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          label="Total API Requests"
          value={totalRequests.toLocaleString()}
          icon={<Activity className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          label="Last Request"
          value="5m ago"
          icon={<Code className="w-5 h-5" />}
          color="green"
        />
      </div>

      {/* Warning Banner */}
      <div className="backdrop-blur-xl bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-yellow-400 font-semibold mb-1">Keep your API keys secure</h3>
          <p className="text-sm text-yellow-300/80">
            Never share your API keys publicly. Anyone with your key can access your account.
            Store keys securely and rotate them regularly.
          </p>
        </div>
      </div>

      {/* API Keys List */}
      <div className="space-y-4">
        {apiKeys.map((apiKey, index) => (
          <motion.div
            key={apiKey.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-white">{apiKey.name}</h3>
                  <div className="px-2.5 py-1 bg-green-500/10 text-green-400 text-xs font-semibold rounded-full border border-green-500/20">
                    {apiKey.status}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {apiKey.scopes.map(scope => (
                    <span
                      key={scope}
                      className="px-2 py-1 bg-purple-500/10 text-purple-400 text-xs font-medium rounded border border-purple-500/20"
                    >
                      {scope}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleKeyVisibility(apiKey.id)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title={visibleKeys.has(apiKey.id) ? 'Hide key' : 'Show key'}
                >
                  {visibleKeys.has(apiKey.id) ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Copy to clipboard"
                >
                  {copiedKey === apiKey.id ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Regenerate key"
                >
                  <RotateCw className="w-4 h-4 text-gray-400" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Delete key"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </motion.button>
              </div>
            </div>

            {/* API Key Display */}
            <div className="mb-4 p-3 bg-black/40 border border-white/10 rounded-lg font-mono text-sm">
              <code className="text-gray-300">
                {visibleKeys.has(apiKey.id) ? apiKey.key : maskApiKey(apiKey.key)}
              </code>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Created</span>
                <div className="text-gray-300 font-medium mt-1">
                  {new Date(apiKey.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Last Used</span>
                <div className="text-gray-300 font-medium mt-1">{apiKey.lastUsed}</div>
              </div>
              <div>
                <span className="text-gray-500">Total Requests</span>
                <div className="text-gray-300 font-medium mt-1">
                  {apiKey.requests.toLocaleString()}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Modal */}
      <CreateApiKeyModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}

// Stat Card
function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg bg-${color}-500/10`}>
          <div className={`text-${color}-400`}>{icon}</div>
        </div>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
}

// Create API Key Modal
function CreateApiKeyModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [name, setName] = useState('');
  const [scopes, setScopes] = useState<string[]>(['read']);

  if (!isOpen) return null;

  const toggleScope = (scope: string) => {
    setScopes(prev =>
      prev.includes(scope) ? prev.filter(s => s !== scope) : [...prev, scope]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md backdrop-blur-xl bg-black/80 border border-white/10 rounded-2xl shadow-2xl"
      >
        <div className="p-6 border-b border-white/10">
          <h3 className="text-xl font-semibold text-white">Create API Key</h3>
          <p className="text-sm text-gray-400 mt-1">Generate a new API key for your application</p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Key Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Production API"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Scopes</label>
            <div className="space-y-2">
              {['read', 'write', 'admin'].map(scope => (
                <label key={scope} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                  <input
                    type="checkbox"
                    checked={scopes.includes(scope)}
                    onChange={() => toggleScope(scope)}
                    className="w-4 h-4 text-purple-600 bg-white/5 border-white/20 rounded focus:ring-2 focus:ring-purple-500"
                  />
                  <div className="flex-1">
                    <div className="text-white font-medium capitalize">{scope}</div>
                    <div className="text-xs text-gray-400">
                      {scope === 'read' && 'Read-only access to resources'}
                      {scope === 'write' && 'Create and update resources'}
                      {scope === 'admin' && 'Full administrative access'}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/10 flex justify-end gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
          >
            Create Key
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
