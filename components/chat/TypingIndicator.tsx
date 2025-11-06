/**
 * Typing Indicator Component
 *
 * Animated dots to show AI is thinking/typing.
 * Used during streaming responses.
 */

'use client';

import { motion } from 'framer-motion';

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      <motion.div
        className="h-2 w-2 rounded-full bg-blue-500"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="h-2 w-2 rounded-full bg-blue-500"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.2,
        }}
      />
      <motion.div
        className="h-2 w-2 rounded-full bg-blue-500"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.4,
        }}
      />
    </div>
  );
}
