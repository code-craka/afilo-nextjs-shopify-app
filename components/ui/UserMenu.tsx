'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Settings,
  CreditCard,
  LogOut,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * UserMenu Component
 *
 * Dropdown menu with user profile and actions:
 * - Profile information
 * - Settings link
 * - Billing link
 * - Sign out button
 *
 * Features:
 * - Click outside to close
 * - Keyboard navigation (Escape to close)
 * - Smooth animations with Framer Motion
 * - Loading states
 */
export default function UserMenu() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    // Close on Escape key
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
      setSigningOut(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
    );
  }

  if (!user) {
    return null;
  }

  const userInitials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U';

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pr-3 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="User menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* User Avatar */}
        {user.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={`${user.firstName || 'User'}'s avatar`}
            className="h-10 w-10 rounded-full ring-2 ring-gray-200"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold text-sm ring-2 ring-gray-200">
            {userInitials}
          </div>
        )}

        {/* Chevron Icon */}
        <ChevronDown
          className={`h-4 w-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
          >
            {/* User Info Section */}
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user.emailAddresses[0]?.emailAddress}
              </p>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {/* Profile */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push('/dashboard/profile');
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <User className="h-4 w-4 text-gray-500" />
                <span>Profile</span>
              </button>

              {/* Settings */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push('/dashboard/settings');
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Settings className="h-4 w-4 text-gray-500" />
                <span>Settings</span>
              </button>

              {/* Billing */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push('/billing');
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <CreditCard className="h-4 w-4 text-gray-500" />
                <span>Billing</span>
              </button>
            </div>

            {/* Sign Out */}
            <div className="border-t border-gray-100 pt-2">
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {signingOut ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
