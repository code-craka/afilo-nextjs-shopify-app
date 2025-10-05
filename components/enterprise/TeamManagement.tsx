'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserPlus,
  Shield,
  Mail,
  MoreVertical,
  Crown,
  Edit,
  Trash2,
  Search,
  Filter,
  Download
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  status: 'active' | 'pending' | 'inactive';
  joinedAt: string;
  lastActive: string;
  avatar?: string;
}

// Mock team data
const mockTeam: TeamMember[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@acme.com',
    role: 'owner',
    status: 'active',
    joinedAt: '2024-01-15',
    lastActive: '2 minutes ago'
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael@acme.com',
    role: 'admin',
    status: 'active',
    joinedAt: '2024-02-20',
    lastActive: '1 hour ago'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily@acme.com',
    role: 'member',
    status: 'active',
    joinedAt: '2024-03-10',
    lastActive: '3 hours ago'
  },
  {
    id: '4',
    name: 'James Wilson',
    email: 'james@acme.com',
    role: 'member',
    status: 'pending',
    joinedAt: '2024-04-01',
    lastActive: 'Never'
  },
  {
    id: '5',
    name: 'Lisa Anderson',
    email: 'lisa@acme.com',
    role: 'viewer',
    status: 'active',
    joinedAt: '2024-04-05',
    lastActive: '1 day ago'
  }
];

export default function TeamManagement() {
  const [team, setTeam] = useState<TeamMember[]>(mockTeam);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const filteredTeam = team.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || member.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: TeamMember['role']) => {
    const badges = {
      owner: { color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: <Crown className="w-3 h-3" /> },
      admin: { color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: <Shield className="w-3 h-3" /> },
      member: { color: 'bg-green-500/10 text-green-400 border-green-500/20', icon: <Users className="w-3 h-3" /> },
      viewer: { color: 'bg-gray-500/10 text-gray-400 border-gray-500/20', icon: <Users className="w-3 h-3" /> }
    };
    return badges[role];
  };

  const getStatusBadge = (status: TeamMember['status']) => {
    const badges = {
      active: 'bg-green-500/10 text-green-400 border-green-500/20',
      pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      inactive: 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    };
    return badges[status];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Team Management</h2>
          <p className="text-gray-400">Manage your team members and permissions</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsInviteOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
        >
          <UserPlus className="w-4 h-4" />
          Invite Member
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Members" value={team.length} icon={<Users className="w-5 h-5" />} />
        <StatCard label="Active" value={team.filter(m => m.status === 'active').length} icon={<Shield className="w-5 h-5" />} color="green" />
        <StatCard label="Pending" value={team.filter(m => m.status === 'pending').length} icon={<Mail className="w-5 h-5" />} color="yellow" />
        <StatCard label="Seats Available" value={500 - team.length} icon={<Users className="w-5 h-5" />} color="blue" />
      </div>

      {/* Filters */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Roles</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
            <option value="viewer">Viewer</option>
          </select>

          {/* Export */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </motion.button>
        </div>
      </div>

      {/* Team Table */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Member</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Role</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Joined</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Last Active</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeam.map((member, index) => (
                <motion.tr
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-semibold">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="text-white font-medium">{member.name}</div>
                        <div className="text-sm text-gray-400">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getRoleBadge(member.role).color}`}>
                      {getRoleBadge(member.role).icon}
                      <span className="capitalize">{member.role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(member.status)}`}>
                      <span className="capitalize">{member.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {member.lastActive}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <MemberActions member={member} />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      <InviteMemberModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />
    </div>
  );
}

// Stat Card Component
function StatCard({ label, value, icon, color = 'purple' }: { label: string; value: number; icon: React.ReactNode; color?: string }) {
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

// Member Actions Dropdown
function MemberActions({ member }: { member: TeamMember }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
      >
        <MoreVertical className="w-4 h-4 text-gray-400" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute right-0 mt-2 w-48 backdrop-blur-xl bg-black/80 border border-white/10 rounded-lg shadow-2xl overflow-hidden z-10"
          >
            <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition-colors">
              <Edit className="w-4 h-4" />
              Edit Role
            </button>
            <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition-colors">
              <Mail className="w-4 h-4" />
              Resend Invite
            </button>
            {member.role !== 'owner' && (
              <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors border-t border-white/10">
                <Trash2 className="w-4 h-4" />
                Remove Member
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Invite Member Modal
function InviteMemberModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');

  if (!isOpen) return null;

  const handleInvite = () => {
    // Handle invite logic
    if (process.env.NODE_ENV === 'development') {
      console.log('Inviting:', email, role);
    }
    onClose();
    setEmail('');
    setRole('member');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md backdrop-blur-xl bg-black/80 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-white/10">
          <h3 className="text-xl font-semibold text-white">Invite Team Member</h3>
          <p className="text-sm text-gray-400 mt-1">Send an invitation to join your workspace</p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="viewer">Viewer - Read-only access</option>
              <option value="member">Member - Standard access</option>
              <option value="admin">Admin - Full access</option>
            </select>
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
            onClick={handleInvite}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
          >
            Send Invite
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
