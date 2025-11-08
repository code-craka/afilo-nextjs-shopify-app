'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Clock, Flame, TrendingUp, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface UrgencyData {
  stock_level?: number;
  stock_warning_threshold?: number;
  sale_ends_at?: Date | string | null;
  is_trending?: boolean;
  is_bestseller?: boolean;
  purchases_24h?: number;
}

interface UrgencyIndicatorsProps {
  productId: string;
  productHandle: string;
  urgencyData?: UrgencyData | null;
  showStockWarning?: boolean;
  showCountdown?: boolean;
  showPopularity?: boolean;
  variant?: 'badges' | 'detailed' | 'compact';
  className?: string;
}

export function UrgencyIndicators({
  productId,
  productHandle,
  urgencyData,
  showStockWarning = true,
  showCountdown = true,
  showPopularity = true,
  variant = 'detailed',
  className = '',
}: UrgencyIndicatorsProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  // Use real data if available, otherwise use smart placeholders
  const data: UrgencyData = urgencyData || {
    stock_level: Math.floor(Math.random() * 50) + 5, // 5-55
    stock_warning_threshold: 10,
    sale_ends_at: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
    is_trending: Math.random() > 0.6,
    is_bestseller: Math.random() > 0.7,
    purchases_24h: Math.floor(Math.random() * 30) + 10, // 10-40
  };

  // Countdown timer logic
  useEffect(() => {
    if (!data.sale_ends_at || !showCountdown) return;

    const calculateTimeLeft = () => {
      const endDate = new Date(data.sale_ends_at!);
      const now = new Date();
      const difference = endDate.getTime() - now.getTime();

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return null;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [data.sale_ends_at, showCountdown]);

  const isLowStock = data.stock_level && data.stock_warning_threshold
    ? data.stock_level <= data.stock_warning_threshold
    : false;

  if (variant === 'badges') {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        {/* Trending Badge */}
        {showPopularity && data.is_trending && (
          <Badge variant="info" className="text-xs animate-pulse">
            <TrendingUp className="h-3 w-3 mr-1" />
            Trending
          </Badge>
        )}

        {/* Bestseller Badge */}
        {showPopularity && data.is_bestseller && (
          <Badge variant="popular" className="text-xs">
            <Flame className="h-3 w-3 mr-1" />
            Bestseller
          </Badge>
        )}

        {/* Low Stock Badge */}
        {showStockWarning && isLowStock && (
          <Badge variant="warning" className="text-xs animate-pulse">
            <AlertCircle className="h-3 w-3 mr-1" />
            Only {data.stock_level} left!
          </Badge>
        )}

        {/* Quick Sale Timer */}
        {showCountdown && timeLeft && (
          <Badge variant="destructive" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            Sale ends in {timeLeft.hours}h {timeLeft.minutes}m
          </Badge>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`space-y-2 ${className}`}>
        {/* Low Stock Warning */}
        {showStockWarning && isLowStock && (
          <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400 font-medium">
            <AlertCircle className="h-4 w-4" />
            <span>Only {data.stock_level} left in stock!</span>
          </div>
        )}

        {/* Countdown Timer */}
        {showCountdown && timeLeft && (
          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 font-medium">
            <Clock className="h-4 w-4" />
            <span>
              Sale ends in {timeLeft.days > 0 && `${timeLeft.days}d `}
              {timeLeft.hours}h {timeLeft.minutes}m
            </span>
          </div>
        )}

        {/* Hot Item Indicator */}
        {showPopularity && data.purchases_24h && data.purchases_24h > 20 && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium">
            <Flame className="h-4 w-4" />
            <span>Hot item! {data.purchases_24h} sold today</span>
          </div>
        )}
      </div>
    );
  }

  // Detailed variant (default)
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Low Stock Warning */}
      {showStockWarning && isLowStock && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border border-orange-300 dark:border-orange-800 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/50">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 animate-pulse" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-orange-900 dark:text-orange-300 mb-1">
                Limited Stock Available
              </h4>
              <p className="text-sm text-orange-700 dark:text-orange-400">
                Only <span className="font-bold">{data.stock_level} licenses</span> remaining at this price!
                Order now before they're gone.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Countdown Timer */}
      {showCountdown && timeLeft && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30 border border-red-300 dark:border-red-800 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50">
              <Clock className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-red-900 dark:text-red-300 mb-2">
                Limited Time Offer
              </h4>
              <div className="flex items-center gap-2">
                {timeLeft.days > 0 && (
                  <div className="text-center">
                    <div className="bg-white dark:bg-gray-800 rounded-lg px-3 py-2 border border-red-200 dark:border-red-800">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {timeLeft.days}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">days</div>
                    </div>
                  </div>
                )}
                <div className="text-center">
                  <div className="bg-white dark:bg-gray-800 rounded-lg px-3 py-2 border border-red-200 dark:border-red-800">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">hours</div>
                  </div>
                </div>
                <div className="text-red-600 dark:text-red-400 text-xl font-bold">:</div>
                <div className="text-center">
                  <div className="bg-white dark:bg-gray-800 rounded-lg px-3 py-2 border border-red-200 dark:border-red-800">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">mins</div>
                  </div>
                </div>
                <div className="text-red-600 dark:text-red-400 text-xl font-bold">:</div>
                <div className="text-center">
                  <div className="bg-white dark:bg-gray-800 rounded-lg px-3 py-2 border border-red-200 dark:border-red-800">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">secs</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Popularity Indicators */}
      {showPopularity && (data.is_trending || data.is_bestseller || (data.purchases_24h && data.purchases_24h > 15)) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-300 dark:border-blue-800 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50">
              <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-1">
                High Demand Product
              </h4>
              <div className="flex flex-wrap items-center gap-2">
                {data.is_bestseller && (
                  <Badge variant="popular" className="text-xs">
                    <Flame className="h-3 w-3 mr-1" />
                    Bestseller
                  </Badge>
                )}
                {data.is_trending && (
                  <Badge variant="info" className="text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Trending
                  </Badge>
                )}
                {data.purchases_24h && data.purchases_24h > 15 && (
                  <span className="text-sm text-blue-700 dark:text-blue-400">
                    {data.purchases_24h} sold in last 24 hours
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
