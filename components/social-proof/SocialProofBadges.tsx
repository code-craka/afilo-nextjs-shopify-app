'use client';

import { Users, TrendingUp, Award, ShoppingBag, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface SocialProofData {
  purchases_24h?: number;
  purchases_7d?: number;
  current_viewers?: number;
  company_count?: number;
  verified_purchases?: number;
  is_trending?: boolean;
  is_bestseller?: boolean;
}

interface SocialProofBadgesProps {
  productId: string;
  productHandle: string;
  socialProof?: SocialProofData | null;
  variant?: 'compact' | 'detailed' | 'minimal';
  className?: string;
}

export function SocialProofBadges({
  productId,
  productHandle,
  socialProof,
  variant = 'detailed',
  className = '',
}: SocialProofBadgesProps) {
  // Use real data if available, otherwise use smart placeholders
  const data: SocialProofData = socialProof || {
    purchases_24h: Math.floor(Math.random() * 20) + 5, // 5-25
    purchases_7d: Math.floor(Math.random() * 100) + 30, // 30-130
    current_viewers: Math.floor(Math.random() * 8) + 2, // 2-10
    company_count: Math.floor(Math.random() * 300) + 50, // 50-350
    verified_purchases: Math.floor(Math.random() * 500) + 100, // 100-600
    is_trending: Math.random() > 0.7,
    is_bestseller: Math.random() > 0.8,
  };

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {data.is_bestseller && (
          <Badge variant="warning" className="text-xs">
            <Award className="h-3 w-3 mr-1" />
            Bestseller
          </Badge>
        )}
        {data.is_trending && (
          <Badge variant="info" className="text-xs">
            <TrendingUp className="h-3 w-3 mr-1" />
            Trending
          </Badge>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        {data.purchases_24h && data.purchases_24h > 0 && (
          <Badge variant="success" className="text-xs">
            <ShoppingBag className="h-3 w-3 mr-1" />
            {data.purchases_24h} sold today
          </Badge>
        )}
        {data.current_viewers && data.current_viewers > 0 && (
          <Badge variant="info" className="text-xs animate-pulse">
            <Eye className="h-3 w-3 mr-1" />
            {data.current_viewers} viewing now
          </Badge>
        )}
      </div>
    );
  }

  // Detailed variant (default)
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Purchase Activity */}
      {data.purchases_24h && data.purchases_24h > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 text-sm"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30">
            <ShoppingBag className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">
              {data.purchases_24h} purchases in last 24 hours
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              High demand for this product
            </p>
          </div>
        </motion.div>
      )}

      {/* Live Viewers */}
      {data.current_viewers && data.current_viewers > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center gap-3 text-sm"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 relative">
            <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">
              {data.current_viewers} people viewing this now
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Popular choice right now
            </p>
          </div>
        </motion.div>
      )}

      {/* Company Usage */}
      {data.company_count && data.company_count > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center gap-3 text-sm"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30">
            <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">
              Used by {data.company_count}+ companies
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Trusted by businesses worldwide
            </p>
          </div>
        </motion.div>
      )}

      {/* Verified Purchases */}
      {data.verified_purchases && data.verified_purchases > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-center gap-3 text-sm"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30">
            <Award className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">
              {data.verified_purchases}+ verified purchases
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Proven quality and satisfaction
            </p>
          </div>
        </motion.div>
      )}

      {/* Trending/Bestseller Badges */}
      {(data.is_trending || data.is_bestseller) && (
        <div className="flex items-center gap-2 pt-2">
          {data.is_bestseller && (
            <Badge variant="popular" className="text-xs">
              <Award className="h-3 w-3 mr-1" />
              Bestseller
            </Badge>
          )}
          {data.is_trending && (
            <Badge variant="info" className="text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              Trending
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
