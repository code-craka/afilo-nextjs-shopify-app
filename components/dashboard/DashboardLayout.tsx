'use client';

import { useEffect } from 'react';
import Sidebar from './Sidebar';
import UserMenu from '@/components/ui/UserMenu';
import CartBadge from '@/components/cart/CartBadge';
import CartSlideout from '@/components/cart/CartSlideout';
import { useCartStore } from '@/store/cart';
import { useUser } from '@clerk/nextjs';

/**
 * Dashboard Layout
 *
 * Wraps dashboard pages with:
 * - Sidebar navigation
 * - Header with user menu and cart
 * - Cart slideout
 * - Responsive design
 */

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isLoaded } = useUser();
  const { loadFromServer } = useCartStore();

  // Load cart from server on mount
  useEffect(() => {
    if (isLoaded) {
      loadFromServer();
    }
  }, [isLoaded, loadFromServer]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
            {/* Left - Empty or breadcrumbs */}
            <div className="flex-1" />

            {/* Right - Actions */}
            <div className="flex items-center gap-4">
              <CartBadge />
              <UserMenu />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Cart Slideout */}
      <CartSlideout />
    </div>
  );
}
