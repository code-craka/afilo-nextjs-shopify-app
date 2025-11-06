/**
 * Chat Widget Component
 *
 * Floating button that opens chat interface in a Sheet drawer.
 * Shows unread count badge and handles open/close state.
 */

'use client';

import { MessageSquare, X, Minimize2, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ChatInterface } from './ChatInterface';
import { useChatStore } from '@/store/chat-store';
import { cn } from '@/lib/utils';

export function ChatWidget() {
  const {
    isOpen,
    isMinimized,
    unreadCount,
    setIsOpen,
    setIsMinimized,
    resetUnreadCount,
  } = useChatStore();

  const [currentView, setCurrentView] = useState<'support' | 'messages'>('support');

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
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <button
              onClick={handleToggle}
              className={cn(
                'group relative flex h-12 w-12 items-center justify-center rounded-full',
                'bg-slate-900 border border-slate-700',
                'shadow-lg hover:shadow-xl',
                'transition-all duration-200 hover:scale-105',
                'hover:border-slate-600'
              )}
              aria-label="Open BenZo AI Chat"
            >
              <MessageSquare className="h-5 w-5 text-slate-300" />

              {/* Unread Badge */}
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="right"
          className={cn(
            'flex w-full flex-col p-0 sm:max-w-md',
            'bg-white border-none shadow-2xl'
          )}
        >
          {/* Custom Header - Dark like Anthropic */}
          <div className="relative bg-slate-900 px-6 py-8 text-white">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 rounded p-1 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Large AI Text */}
            <div className="mb-4">
              <h1 className="text-4xl font-light tracking-tight">AI</h1>
            </div>

            {/* Support Message */}
            <div>
              <h2 className="text-2xl font-normal mb-1">Need support?</h2>
              <p className="text-xl font-normal text-white/90">How can we help?</p>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-hidden">
            {currentView === 'support' ? (
              <div className="bg-white px-6 py-4 space-y-6 h-full overflow-y-auto">
                {/* Recent Message Section */}
                <div className="bg-slate-50 rounded-xl p-4">
                  <h3 className="text-sm text-slate-600 mb-3">Recent message</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white text-sm font-medium">
                      B
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-900 text-sm font-medium truncate">
                        How can I help you today?
                      </p>
                      <p className="text-slate-500 text-xs">BenZo • now</p>
                    </div>
                    <div className="text-slate-400">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Status Section */}
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" className="text-green-600">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-slate-900 font-medium text-sm">Status: All Systems Operational</p>
                    <p className="text-slate-500 text-xs">Updated {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}</p>
                  </div>
                </div>

                {/* Send Message Button */}
                <button
                  onClick={() => setCurrentView('messages')}
                  className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors group"
                >
                  <span className="text-slate-900 font-medium">Send us a message</span>
                  <div className="text-blue-600 group-hover:translate-x-1 transition-transform">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </button>

                {/* Search for Help Button */}
                <button className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors group">
                  <span className="text-slate-900 font-medium">Search for help</span>
                  <div className="text-blue-600">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                </button>

                {/* Quick Help Links */}
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors group">
                    <span className="text-slate-700 text-sm">How to Get Support</span>
                    <div className="text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all">
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </button>
                  <button className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors group">
                    <span className="text-slate-700 text-sm">Using BenZo AI with your Pro plan</span>
                    <div className="text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all">
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              <ChatInterface />
            )}
          </div>

          {/* Bottom Navigation */}
          <div className="border-t border-slate-200 bg-white px-6 py-4">
            <div className="flex items-center justify-around">
              <button
                onClick={() => setCurrentView('support')}
                className={cn(
                  "flex flex-col items-center gap-1 transition-colors",
                  currentView === 'support' ? 'text-blue-600' : 'text-slate-400'
                )}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <span className="text-xs font-medium">Home</span>
              </button>
              <button
                onClick={() => setCurrentView('messages')}
                className={cn(
                  "flex flex-col items-center gap-1 transition-colors",
                  currentView === 'messages' ? 'text-blue-600' : 'text-slate-400'
                )}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span className="text-xs">Messages</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-slate-400">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <span className="text-xs">Help</span>
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
