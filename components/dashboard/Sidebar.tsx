'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  CreditCard,
  ShoppingBag,
  Settings,
  ChevronLeft,
  ChevronRight,
  Download,
  Clock,
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
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
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
    href: '/billing',
    icon: CreditCard,
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

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
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                      ${isActive
                        ? 'bg-blue-50 text-blue-600 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                      ${isCollapsed ? 'justify-center' : ''}
                    `}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                    {!isCollapsed && (
                      <span className="flex-1">{item.label}</span>
                    )}
                    {!isCollapsed && item.badge && (
                      <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
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
