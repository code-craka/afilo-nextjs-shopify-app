/**
 * Claude.ai-Style Chat Widget
 *
 * Clean, minimal chat interface inspired by Claude.ai
 * - Full-width conversation view (no sidebar)
 * - Simple header with title and close button
 * - Focus on messages, not navigation
 * - Elegant, modern design
 */

'use client';

import { MessageSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
import { ChatInterface } from './ChatInterface';
import { useChatStore } from '@/store/chat-store';
import { cn } from '@/lib/utils';

export function ChatWidget() {
  const {
    isOpen,
    unreadCount,
    setIsOpen,
    resetUnreadCount,
  } = useChatStore();

  // Check if chat bot is enabled
  const isChatBotEnabled =
    process.env.NEXT_PUBLIC_CHAT_BOT_ENABLED === 'true';

  // Reset unread count when opened
  useEffect(() => {
    if (isOpen) {
      resetUnreadCount();
    }
  }, [isOpen, resetUnreadCount]);

  // Don't render if chat bot is disabled
  if (!isChatBotEnabled) {
    return null;
  }

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Floating Chat Button - Claude.ai Style */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <button
              onClick={handleToggle}
              className={cn(
                'group relative flex h-14 w-14 items-center justify-center rounded-full',
                'bg-gradient-to-br from-orange-500 to-amber-600',
                'shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30',
                'transition-all duration-300 hover:scale-105',
                'focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2'
              )}
              aria-label="Chat with Afilo AI Assistant"
            >
              <MessageSquare className="h-6 w-6 text-white" strokeWidth={2} />

              {/* Unread Badge */}
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white ring-2 ring-white"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}

              {/* Pulse Animation */}
              <span className="absolute inset-0 rounded-full bg-orange-400 opacity-0 group-hover:animate-ping" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Sheet - Full Width, No Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="right"
          className={cn(
            'flex w-full flex-col p-0 sm:max-w-lg md:max-w-2xl',
            'bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800',
            'shadow-2xl'
          )}
        >
          {/* Simple Header - Claude.ai Style */}
          <div className="relative flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 py-4">
            {/* Title */}
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-600">
                <span className="text-sm font-bold text-white">A</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Afilo Assistant
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Powered by Claude AI
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className={cn(
                'rounded-lg p-2 text-slate-500 dark:text-slate-400',
                'hover:bg-slate-100 dark:hover:bg-slate-800',
                'hover:text-slate-900 dark:hover:text-slate-100',
                'transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-orange-400'
              )}
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Chat Interface - Full Width */}
          <ChatInterface />
        </SheetContent>
      </Sheet>
    </>
  );
}
