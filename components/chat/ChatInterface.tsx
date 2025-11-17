/**
 * Claude.ai-Style Chat Interface
 *
 * Simple, full-width chat interface without sidebars
 * - Clean message bubbles
 * - Auto-creates conversation on first message
 * - Streaming responses with typing indicator
 * - No conversation sidebar
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { useChatStore } from '@/store/chat-store';
import { Sparkles, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/types/chat';

export function ChatInterface() {
  const { user } = useUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');

  const {
    currentConversationId,
    messages,
    error,
    setCurrentConversationId,
    setMessages,
    setError,
  } = useChatStore();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages, streamingContent]);

  // Sync messages from store
  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  // Fetch messages when conversation exists
  useEffect(() => {
    if (currentConversationId) {
      fetchMessages(currentConversationId);
    }
  }, [currentConversationId]);

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(
        `/api/chat/conversations/${conversationId}/messages?limit=100`
      );

      if (!response.ok) {
        if (response.status === 429) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Too many requests. Please wait.');
        }
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      if (data.success) {
        setMessages(data.data.messages);
      }
    } catch (error) {
      console.error('[ChatInterface] Error fetching messages:', error);
      setError(error instanceof Error ? error.message : 'Failed to load messages');
    }
  };

  // Create new conversation (auto-called on first message)
  const createConversation = async (): Promise<string | null> => {
    try {
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Chat Conversation' }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Too many conversations. Please wait.');
        }
        throw new Error('Failed to create conversation');
      }

      const data = await response.json();
      if (data.success) {
        const conversationId = data.data.conversation.id;
        setCurrentConversationId(conversationId);
        return conversationId;
      }

      return null;
    } catch (error) {
      console.error('[ChatInterface] Error creating conversation:', error);
      setError(error instanceof Error ? error.message : 'Failed to create conversation');
      return null;
    }
  };

  // Send message with streaming
  const handleSendMessage = async (message: string) => {
    // Get or create conversation
    let conversationId = currentConversationId;

    if (!conversationId) {
      conversationId = await createConversation();
      if (!conversationId) {
        setError('Failed to start conversation');
        return;
      }
      // Wait for conversation to be created
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    try {
      // Add user message optimistically
      const userMessage: ChatMessage = {
        id: `temp-user-${Date.now()}`,
        conversationId,
        role: 'user',
        content: message,
        metadata: {},
        createdAt: new Date(),
      };

      setLocalMessages((prev) => [...prev, userMessage]);
      setIsStreaming(true);
      setStreamingContent('');
      setError(null);

      // Send message to API
      const response = await fetch(
        `/api/chat/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Rate limit exceeded. Please wait.');
        }
        throw new Error('Failed to send message');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response stream');
      }

      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((line) => line.trim());

        for (const line of lines) {
          if (line.startsWith('0:')) {
            // Data chunk
            const content = line.slice(2).replace(/^"(.*)"$/, '$1');
            accumulatedContent += content;
            setStreamingContent(accumulatedContent);
          }
        }
      }

      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: `temp-assistant-${Date.now()}`,
        conversationId,
        role: 'assistant',
        content: accumulatedContent,
        metadata: {},
        createdAt: new Date(),
      };

      setLocalMessages((prev) => [...prev, assistantMessage]);
      setStreamingContent('');
      setIsStreaming(false);

      // Refresh messages from server to get real IDs
      await fetchMessages(conversationId);
    } catch (error) {
      console.error('[ChatInterface] Error sending message:', error);
      setError(error instanceof Error ? error.message : 'Failed to send message');
      setIsStreaming(false);
      setStreamingContent('');

      // Remove the optimistic user message on error
      setLocalMessages((prev) => prev.slice(0, -1));
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Messages Area - Claude.ai Style */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-950">
        {localMessages.length === 0 && !isStreaming ? (
          // Welcome Screen - Claude.ai Style
          <div className="flex h-full flex-col items-center justify-center px-6 py-12">
            <div className="max-w-md text-center">
              {/* Icon */}
              <div className="mb-6 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-500/25">
                  <Sparkles className="h-8 w-8 text-white" strokeWidth={2} />
                </div>
              </div>

              {/* Welcome Text */}
              <h3 className="mb-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                Hello{user?.firstName ? `, ${user.firstName}` : ''}!
              </h3>
              <p className="mb-6 text-base leading-relaxed text-slate-600 dark:text-slate-400">
                I'm your Afilo AI assistant, powered by Claude. I can help you with:
              </p>

              {/* Feature List */}
              <div className="space-y-3 text-left">
                <div className="flex items-start gap-3 rounded-lg bg-slate-50 dark:bg-slate-900 p-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                    <span className="text-xs">💰</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Pricing & Plans
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Find the right plan for your needs
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg bg-slate-50 dark:bg-slate-900 p-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                    <span className="text-xs">🎯</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Product Features
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Learn about our AI tools and templates
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg bg-slate-50 dark:bg-slate-900 p-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                    <span className="text-xs">🛟</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Support & Help
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Get help with your account or orders
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <p className="mt-6 text-sm text-slate-500 dark:text-slate-500">
                Type your question below to get started
              </p>
            </div>
          </div>
        ) : (
          // Messages List
          <div className="mx-auto max-w-3xl space-y-0 py-6">
            {localMessages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {/* Streaming Message */}
            {isStreaming && streamingContent && (
              <MessageBubble
                message={{
                  id: 'streaming',
                  conversationId: currentConversationId || '',
                  role: 'assistant',
                  content: streamingContent,
                  metadata: {},
                  createdAt: new Date(),
                }}
                isStreaming
              />
            )}

            {/* Typing Indicator */}
            {isStreaming && !streamingContent && (
              <div className="flex gap-4 px-6 py-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-600">
                  <span className="text-xs font-bold text-white">A</span>
                </div>
                <div className="flex items-center">
                  <TypingIndicator />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="border-t border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/50 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-xs underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Message Input - Always Visible */}
      <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={isStreaming}
          placeholder={
            isStreaming
              ? 'AI is thinking...'
              : 'Ask me anything about Afilo products, pricing, or support...'
          }
        />
      </div>
    </div>
  );
}
