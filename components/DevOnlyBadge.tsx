'use client';

import { motion } from 'framer-motion';
import { Code } from 'lucide-react';

/**
 * Development Only Badge Component
 * Displays a prominent badge indicating this is a development/testing page
 * Should be placed at the top of test pages for clear visual indication
 */
export default function DevOnlyBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 p-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/50 rounded-xl backdrop-blur-sm"
    >
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Code className="w-6 h-6 text-orange-400" />
        </motion.div>
        <div>
          <h3 className="text-orange-400 font-bold text-lg">Development Only</h3>
          <p className="text-orange-300/80 text-sm">
            This page is for testing and development purposes. Not accessible in production.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
