'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PremiumMetricsCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down';
  icon: React.ReactNode;
  suffix?: string;
  prefix?: string;
  animate?: boolean;
}

export default function PremiumMetricsCard({
  title,
  value,
  change,
  trend = 'up',
  icon,
  suffix = '',
  prefix = '',
  animate = true
}: PremiumMetricsCardProps) {
  const [displayValue, setDisplayValue] = useState(animate ? 0 : value);

  useEffect(() => {
    if (!animate || typeof value !== 'number') return;

    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, animate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative group"
    >
      {/* Glow effect on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500" />

      {/* Card */}
      <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          {/* Icon */}
          <div className="p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl backdrop-blur-sm">
            <div className="text-purple-400">{icon}</div>
          </div>

          {/* Trend Badge */}
          {change && (
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
              trend === 'up'
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {trend === 'up' ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{change}</span>
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mb-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent"
          >
            {prefix}
            {typeof displayValue === 'number'
              ? displayValue.toLocaleString()
              : displayValue}
            {suffix}
          </motion.div>
        </div>

        {/* Title */}
        <p className="text-sm text-gray-400 font-medium">{title}</p>

        {/* Decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="h-1 w-full bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-transparent rounded-full mt-4"
        />
      </div>
    </motion.div>
  );
}

// Skeleton loader for metrics card
export function PremiumMetricsCardSkeleton() {
  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-white/10 rounded-xl" />
        <div className="w-16 h-6 bg-white/10 rounded-full" />
      </div>
      <div className="w-32 h-10 bg-white/10 rounded mb-2" />
      <div className="w-24 h-4 bg-white/10 rounded" />
    </div>
  );
}
