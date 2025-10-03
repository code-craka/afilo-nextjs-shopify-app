'use client';

import { motion } from 'framer-motion';
import { CreditCard, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Empty Subscriptions State Component
 * Displayed when user has no active subscriptions
 */
export default function EmptySubscriptions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      {/* Animated Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 15,
          delay: 0.2
        }}
        className="relative mb-8"
      >
        <div className="w-32 h-32 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-full flex items-center justify-center backdrop-blur-xl border border-white/10">
          <CreditCard className="w-16 h-16 text-blue-400" />
        </div>

        {/* Sparkle Effects */}
        <motion.div
          className="absolute -top-2 -right-2"
          animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Sparkles className="w-8 h-8 text-yellow-400" />
        </motion.div>
      </motion.div>

      {/* Heading */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold text-white mb-3"
      >
        No Active Subscriptions
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-white/60 text-center max-w-md mb-8"
      >
        Start your journey with enterprise-grade software solutions. Choose a plan that fits your needs and unlock powerful features.
      </motion.p>

      {/* Features List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-3xl"
      >
        {[
          { title: 'Instant Access', description: 'Start using immediately' },
          { title: 'Cancel Anytime', description: 'No long-term commitment' },
          { title: 'Premium Support', description: '24/7 expert assistance' },
        ].map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg p-4 text-center"
          >
            <h4 className="text-white font-semibold mb-1">{feature.title}</h4>
            <p className="text-white/60 text-sm">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <Button
          onClick={() => window.location.href = '/pricing'}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 group"
        >
          View Pricing Plans
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>

        <Button
          onClick={() => window.location.href = '/enterprise'}
          variant="secondary"
          className="border border-white/20 bg-white/5 hover:bg-white/10"
        >
          Explore Enterprise Options
        </Button>
      </motion.div>
    </motion.div>
  );
}
