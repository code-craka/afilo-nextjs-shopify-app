'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  CreditCard,
  ShoppingBag,
  ShoppingCart,
  Settings,
  ChevronLeft,
  ChevronRight,
  Download,
  Clock,
  BarChart3,
  Activity,
  Users,
  Shield,
  Bot,
  Building2,
  DollarSign,
} from 'lucide-react';

/**
 * Dashboard Sidebar Navigation
 *
 * Modern sidebar with:
 * - Billing section visible (no extra clicks)
 * - Collapsible on tablet/mobile
 * - Active state indicators
 * - Icon + label layout
 */

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
  {
    label: 'Monitoring',
    href: '/dashboard/monitoring',
    icon: Activity,
    badge: 'NEW',
  },
  {
    label: 'Products',
    href: '/dashboard/products',
    icon: Package,
  },
  {
    label: 'Orders',
    href: '/dashboard/orders',
    icon: ShoppingBag,
  },
  {
    label: 'Downloads',
    href: '/dashboard/downloads',
    icon: Download,
  },
  {
    label: 'Abandoned Carts',
    href: '/dashboard/abandoned-carts',
    icon: Clock,
  },
  {
    label: 'Billing',
    href: '/dashboard/billing',
    icon: CreditCard,
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

const merchantNavItems: NavItem[] = [
  {
    label: 'Merchant Dashboard',
    href: '/dashboard/merchant',
    icon: Building2,
    badge: 'NEW',
  },
];

const adminNavItems: NavItem[] = [
  {
    label: 'User Management',
    href: '/dashboard/admin/users',
    icon: Users,
    adminOnly: true,
    badge: 'ADMIN',
  },
  {
    label: 'Connect Marketplace',
    href: '/dashboard/admin/connect',
    icon: Building2,
    adminOnly: true,
    badge: 'NEW',
  },
  {
    label: 'Cart Recovery',
    href: '/dashboard/admin/cart-recovery',
    icon: ShoppingCart,
    adminOnly: true,
    badge: 'NEW',
  },
  {
    label: 'Chat Bot Admin',
    href: '/dashboard/admin/chat',
    icon: Bot,
    adminOnly: true,
    badge: 'ADMIN',
  },
  {
    label: 'System Admin',
    href: '/dashboard/admin/system',
    icon: Shield,
    adminOnly: true,
    badge: 'ADMIN',
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, isLoaded } = useUser();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserRole() {
      if (!isLoaded || !user) return;

      try {
        const response = await fetch('/api/user/role');
        const data = await response.json();
        setUserRole(data.role);
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    }

    fetchUserRole();
  }, [user, isLoaded]);

  const isAdmin = userRole === 'admin' || userRole === 'owner';
  const isMerchant = userRole === 'merchant' || isAdmin;

  // Build navigation items based on roles
  let allNavItems = [...navItems];
  if (isMerchant) {
    allNavItems = [...allNavItems, ...merchantNavItems];
  }
  if (isAdmin) {
    allNavItems = [...allNavItems, ...adminNavItems];
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 256 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-30"
      >
        {/* Logo/Brand */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {!isCollapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="font-bold text-xl text-gray-900">Afilo</span>
            </Link>
          )}
          {isCollapsed && (
            <Link href="/dashboard" className="w-full flex justify-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
            </Link>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-1">
            {allNavItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const isAdminSection = item.adminOnly;

              // Add divider before admin section
              const showDivider = isAdminSection && index > 0 && !allNavItems[index - 1]?.adminOnly;

              return (
                <li key={item.href}>
                  {showDivider && !isCollapsed && (
                    <div className="my-4 px-3">
                      <div className="border-t border-gray-200"></div>
                      <div className="mt-4 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Admin Panel
                      </div>
                    </div>
                  )}
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                      ${isActive
                        ? isAdminSection
                          ? 'bg-purple-50 text-purple-600 font-semibold'
                          : 'bg-blue-50 text-blue-600 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                      ${isCollapsed ? 'justify-center' : ''}
                    `}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className={`h-5 w-5 flex-shrink-0 ${
                      isActive
                        ? isAdminSection
                          ? 'text-purple-600'
                          : 'text-blue-600'
                        : 'text-gray-500'
                    }`} />
                    {!isCollapsed && (
                      <span className="flex-1">{item.label}</span>
                    )}
                    {!isCollapsed && item.badge && (
                      <span className={`text-white text-xs font-semibold px-2 py-0.5 rounded-full ${
                        item.badge === 'ADMIN'
                          ? 'bg-purple-500'
                          : item.badge === 'NEW'
                          ? 'bg-red-500'
                          : 'bg-blue-500'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Collapse Toggle */}
        <div className="p-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5" />
                <span className="text-sm">Collapse</span>
              </>
            )}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <ul className="flex items-center justify-around px-2 py-2">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all
                    ${isActive
                      ? 'text-blue-600'
                      : 'text-gray-500'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
