'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  Settings,
  LogOut,
  User,
  CreditCard,
  Shield,
  ChevronDown,
  Command,
  Home,
  Package,
  BarChart3,
  Code,
  DollarSign
} from 'lucide-react';

export default function EnterpriseHeader() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const userInitials = user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress[0] || 'U';
  const userName = user?.firstName || user?.emailAddresses[0]?.emailAddress.split('@')[0] || 'User';
  const userEmail = user?.emailAddresses[0]?.emailAddress || '';

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const notifications: { id: number; text: string; time: string; type: string }[] = [
    { id: 1, text: 'New subscription payment received', time: '2m ago', type: 'success' },
    { id: 2, text: 'API usage at 75% of limit', time: '1h ago', type: 'warning' },
    { id: 3, text: 'Team member invited to workspace', time: '3h ago', type: 'info' },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/20 border-b border-white/10">
      <div className="max-w-[1800px] mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/')}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur opacity-50" />
                <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1.5 rounded-lg font-bold text-lg">
                  Afilo
                </div>
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-400">Enterprise</span>
            </motion.button>

            {/* Quick Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <NavLink icon={<Home className="w-4 h-4" />} href="/dashboard" label="Dashboard" />
              <NavLink icon={<BarChart3 className="w-4 h-4" />} href="/enterprise" label="Analytics" />
              <NavLink icon={<Package className="w-4 h-4" />} href="/products" label="Products" />
              <NavLink icon={<Code className="w-4 h-4" />} href="/dashboard" label="API" />
            </nav>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSearchOpen(true)}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <Search className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Search...</span>
              <kbd className="hidden lg:inline-flex h-5 px-1.5 items-center gap-1 rounded border border-white/20 bg-white/10 text-[10px] font-medium text-gray-400">
                <Command className="w-3 h-3" />K
              </kbd>
            </motion.button>

            {/* Notifications */}
            <NotificationDropdown notifications={notifications} />

            {/* User Menu */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                  {userInitials}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-white">{userName}</div>
                  <div className="text-xs text-gray-400">Enterprise Plan</div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </motion.button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 backdrop-blur-xl bg-black/80 border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                  >
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-white/10">
                      <div className="font-medium text-white">{userName}</div>
                      <div className="text-sm text-gray-400">{userEmail}</div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      <UserMenuItem icon={<User />} label="Profile" onClick={() => router.push('/dashboard')} />
                      <UserMenuItem icon={<CreditCard />} label="Billing" onClick={() => router.push('/enterprise')} />
                      <UserMenuItem icon={<Settings />} label="Settings" onClick={() => router.push('/dashboard')} />
                      <UserMenuItem icon={<Shield />} label="Security" onClick={() => router.push('/dashboard')} />
                    </div>

                    <div className="p-2 border-t border-white/10">
                      <UserMenuItem
                        icon={<LogOut />}
                        label="Sign Out"
                        onClick={handleSignOut}
                        variant="danger"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}

// Nav Link Component
function NavLink({ icon, href, label }: { icon: React.ReactNode; href: string; label: string }) {
  const router = useRouter();

  return (
    <motion.button
      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
      whileTap={{ scale: 0.95 }}
      onClick={() => router.push(href)}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:text-white transition-colors text-sm font-medium"
    >
      {icon}
      <span>{label}</span>
    </motion.button>
  );
}

// User Menu Item
function UserMenuItem({
  icon,
  label,
  onClick,
  variant = 'default'
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
}) {
  return (
    <motion.button
      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        variant === 'danger'
          ? 'text-red-400 hover:text-red-300'
          : 'text-gray-300 hover:text-white'
      }`}
    >
      <div className="w-4 h-4">{icon}</div>
      <span>{label}</span>
    </motion.button>
  );
}

// Notification Dropdown
function NotificationDropdown({ notifications }: { notifications: { id: number; text: string; time: string; type: string }[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-300" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full ring-2 ring-black" />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 backdrop-blur-xl bg-black/80 border border-white/10 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-white/10">
              <h3 className="font-semibold text-white">Notifications</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <p className="text-sm text-gray-300">{notif.text}</p>
                  <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Search Modal (placeholder)
function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: -20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: -20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl backdrop-blur-xl bg-black/80 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products, documentation, settings..."
            className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none"
            autoFocus
          />
          <kbd className="px-2 py-1 text-xs text-gray-400 border border-white/20 rounded">ESC</kbd>
        </div>
        <div className="p-4 text-center text-gray-500 text-sm">
          Start typing to search...
        </div>
      </motion.div>
    </motion.div>
  );
}
