/**
 * Conversation List Component
 *
 * Sidebar list of conversations with search and filtering.
 * Displays conversation titles and last message preview.
 */

'use client';

import { MessageSquare, Archive, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import type { ChatConversation } from '@/types/chat';
import { cn } from '@/lib/utils';

interface ConversationListProps {
  conversations: ChatConversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  isLoading?: boolean;
}

export function ConversationList({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  isLoading = false,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter conversations by search query
  const filteredConversations = conversations.filter((conv) => {
    const searchLower = searchQuery.toLowerCase();
    const titleMatch = conv.title?.toLowerCase().includes(searchLower);
    const messageMatch = conv.lastMessage?.toLowerCase().includes(searchLower);
    return titleMatch || messageMatch;
  });

  return (
    <div className="flex h-full flex-col border-r border-slate-700 bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">Conversations</h2>
          <button
            onClick={onNewConversation}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            aria-label="New conversation"
          >
            New Chat
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full rounded-lg bg-slate-800 py-2 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
            <MessageSquare className="h-12 w-12 text-slate-600" />
            <p className="text-sm text-slate-500">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
            {!searchQuery && (
              <button
                onClick={onNewConversation}
                className="mt-2 text-sm text-blue-500 hover:text-blue-400"
              >
                Start your first conversation
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={conversation.id === currentConversationId}
                onClick={() => onSelectConversation(conversation.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Individual Conversation Item
interface ConversationItemProps {
  conversation: ChatConversation;
  isActive: boolean;
  onClick: () => void;
}

function ConversationItem({ conversation, isActive, onClick }: ConversationItemProps) {
  const isArchived = conversation.status === 'archived';

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        'w-full rounded-lg p-3 text-left transition-colors',
        isActive
          ? 'bg-blue-600 text-white'
          : 'text-slate-300 hover:bg-slate-800',
        isArchived && 'opacity-50'
      )}
    >
      {/* Title and Status */}
      <div className="mb-1 flex items-center justify-between gap-2">
        <h3 className="truncate text-sm font-medium">
          {conversation.title || 'Untitled Conversation'}
        </h3>
        {isArchived && <Archive className="h-3 w-3 shrink-0" />}
      </div>

      {/* Last Message Preview */}
      {conversation.lastMessage && (
        <p
          className={cn(
            'mb-1 truncate text-xs',
            isActive ? 'text-blue-100' : 'text-slate-500'
          )}
        >
          {conversation.lastMessage}
        </p>
      )}

      {/* Metadata */}
      <div
        className={cn(
          'flex items-center gap-2 text-xs',
          isActive ? 'text-blue-200' : 'text-slate-600'
        )}
      >
        <span>{conversation.messageCount ?? 0} messages</span>
        <span>•</span>
        <span>
          {new Date(conversation.lastMessageAt).toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>
    </motion.button>
  );
}
