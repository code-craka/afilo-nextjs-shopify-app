'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, CreditCard, Zap } from 'lucide-react';

/**
 * Subscription Gate Component
 *
 * Blocks access to premium features until user has active subscription
 * Shows upgrade CTA if no subscription found
 */
export default function SubscriptionGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    async function checkSubscription() {
      try {
        const response = await fetch('/api/subscriptions/status');
        const data = await response.json();

        if (data.hasSubscription) {
          setHasAccess(true);
        }
      } catch (error) {
        console.error('Subscription check failed:', error);
      } finally {
        setLoading(false);
      }
    }

    checkSubscription();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent mb-4" />
          <div className="text-white text-xl">Verifying access...</div>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-12 text-center"
        >
          {/* Lock Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/20 mb-6"
          >
            <Lock className="w-12 h-12 text-purple-400" />
          </motion.div>

          {/* Title */}
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-4">
            Premium Access Required
          </h1>

          {/* Description */}
          <p className="text-gray-300 text-lg mb-8">
            This is an enterprise feature. Upgrade to a paid plan to unlock the full power of Afilo.
          </p>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {[
              { icon: <Zap className="w-5 h-5" />, text: 'Enterprise Dashboard' },
              { icon: <CreditCard className="w-5 h-5" />, text: 'API Access' },
              { icon: <Lock className="w-5 h-5" />, text: 'Team Management' },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3"
              >
                <div className="text-purple-400">{feature.icon}</div>
                <span className="text-white font-medium text-sm">{feature.text}</span>
              </motion.div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/pricing')}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold text-lg shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow"
            >
              View Pricing Plans
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/')}
              className="px-8 py-4 backdrop-blur-xl bg-white/5 border border-white/10 text-white rounded-xl font-semibold text-lg hover:bg-white/10 transition-colors"
            >
              Go Home
            </motion.button>
          </div>

          {/* Pricing Preview */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-gray-400 text-sm mb-4">Plans starting at</p>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl font-bold text-white">$499</span>
              <span className="text-gray-400">/month</span>
            </div>
            <p className="text-purple-400 text-sm mt-2">17% savings with annual billing</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
