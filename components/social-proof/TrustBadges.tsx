'use client';

import { Shield, Zap, Lock, Mail, RefreshCw, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

interface TrustBadgesProps {
  variant?: 'horizontal' | 'vertical' | 'grid';
  showIcons?: boolean;
  className?: string;
}

const trustItems = [
  {
    icon: Shield,
    title: '30-Day Money Back',
    description: 'Guarantee',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
  },
  {
    icon: Zap,
    title: 'Instant Delivery',
    description: 'Download immediately',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  {
    icon: Lock,
    title: 'Secure Checkout',
    description: 'SSL encrypted',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
  {
    icon: Mail,
    title: 'License via Email',
    description: 'Instant access',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
  {
    icon: RefreshCw,
    title: 'Lifetime Updates',
    description: 'Free forever',
    color: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-100 dark:bg-teal-900/30',
  },
  {
    icon: CreditCard,
    title: 'Secure Payment',
    description: 'Powered by Stripe',
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
  },
];

export function TrustBadges({
  variant = 'horizontal',
  showIcons = true,
  className = '',
}: TrustBadgesProps) {
  if (variant === 'vertical') {
    return (
      <div className={`space-y-3 ${className}`}>
        {trustItems.slice(0, 4).map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="flex items-center gap-3"
          >
            {showIcons && (
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${item.bgColor}`}>
                <item.icon className={`h-5 w-5 ${item.color}`} />
              </div>
            )}
            <div>
              <p className="font-semibold text-sm text-gray-900 dark:text-white">
                {item.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {item.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 ${className}`}>
        {trustItems.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="flex flex-col items-center text-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
          >
            {showIcons && (
              <div className={`flex items-center justify-center w-12 h-12 rounded-full ${item.bgColor} mb-3`}>
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </div>
            )}
            <p className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
              {item.title}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {item.description}
            </p>
          </motion.div>
        ))}
      </div>
    );
  }

  // Horizontal variant (default)
  return (
    <div className={`flex flex-wrap items-center gap-6 ${className}`}>
      {trustItems.slice(0, 4).map((item, index) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="flex items-center gap-2"
        >
          {showIcons && (
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${item.bgColor}`}>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </div>
          )}
          <div>
            <p className="font-semibold text-xs text-gray-900 dark:text-white">
              {item.title}
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">
              {item.description}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
