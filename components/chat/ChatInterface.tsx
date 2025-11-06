/**
 * Chat Interface Component
 *
 * Main chat UI with message list, input, and conversation sidebar.
 * Handles message sending and streaming responses.
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { ConversationList } from './ConversationList';
import { TypingIndicator } from './TypingIndicator';
import { useChatStore } from '@/store/chat-store';
import { Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/types/chat';

export function ChatInterface() {
  const { user } = useUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');

  const {
    conversations,
    currentConversationId,
    messages,
    isLoading,
    error,
    setCurrentConversationId,
    setConversations,
    setMessages,
    addMessage,
    setError,
  } = useChatStore();

  // Fetch conversations on mount
  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (currentConversationId) {
      fetchMessages(currentConversationId);
    } else {
      setLocalMessages([]);
    }
  }, [currentConversationId]);

  // Combine stored messages with local messages
  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages, streamingContent]);

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/chat/conversations?limit=50');
      if (!response.ok) {
        // PHASE 5: Handle rate limiting specifically
        if (response.status === 429) {
          const errorData = await response.json().catch(() => ({}));
          const rateLimitMessage = errorData.message || 'Too many requests. Please wait before fetching conversations again.';
          throw new Error(rateLimitMessage);
        }
        throw new Error('Failed to fetch conversations');
      }

      const data = await response.json();
      if (data.success) {
        setConversations(data.data.conversations);
      }
    } catch (error) {
      console.error('[ChatInterface] Error fetching conversations:', error);
      setError(error instanceof Error ? error.message : 'Failed to load conversations');
    }
  };

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(
        `/api/chat/conversations/${conversationId}/messages?limit=50`
      );
      if (!response.ok) {
        // PHASE 5: Handle rate limiting specifically
        if (response.status === 429) {
          const errorData = await response.json().catch(() => ({}));
          const rateLimitMessage = errorData.message || 'Too many requests. Please wait before fetching messages again.';
          throw new Error(rateLimitMessage);
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

  // Create new conversation
  const handleNewConversation = async () => {
    try {
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Conversation' }),
      });

      if (!response.ok) {
        // PHASE 5: Handle rate limiting specifically
        if (response.status === 429) {
          const errorData = await response.json().catch(() => ({}));
          const rateLimitMessage = errorData.message || 'Too many conversations created. Please wait before creating another conversation.';
          throw new Error(rateLimitMessage);
        }
        throw new Error('Failed to create conversation');
      }

      const data = await response.json();
      if (data.success) {
        await fetchConversations();
        setCurrentConversationId(data.data.conversation.id);
      }
    } catch (error) {
      console.error('[ChatInterface] Error creating conversation:', error);
      setError(error instanceof Error ? error.message : 'Failed to create conversation');
    }
  };

  // Send message with streaming
  const handleSendMessage = async (message: string) => {
    if (!currentConversationId) {
      // Create conversation first
      await handleNewConversation();
      // Wait a bit for the conversation to be created
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    if (!currentConversationId) {
      setError('No active conversation');
      return;
    }

    try {
      // Add user message optimistically
      const userMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        conversationId: currentConversationId,
        role: 'user',
        content: message,
        metadata: {},
        createdAt: new Date(),
      };

      setLocalMessages((prev) => [...prev, userMessage]);
      setIsStreaming(true);
      setStreamingContent('');

      // Send message to API
      const response = await fetch(
        `/api/chat/conversations/${currentConversationId}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message }),
        }
      );

      if (!response.ok) {
        // PHASE 5: Handle rate limiting specifically
        if (response.status === 429) {
          const errorData = await response.json().catch(() => ({}));
          const rateLimitMessage = errorData.message || 'Rate limit exceeded. Please wait before sending another message.';
          throw new Error(rateLimitMessage);
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
        id: `msg-${Date.now()}`,
        conversationId: currentConversationId,
        role: 'assistant',
        content: accumulatedContent,
        metadata: {},
        createdAt: new Date(),
      };

      setLocalMessages((prev) => [...prev, assistantMessage]);
      setStreamingContent('');
      setIsStreaming(false);

      // Refresh messages from server
      await fetchMessages(currentConversationId);
    } catch (error) {
      console.error('[ChatInterface] Error sending message:', error);
      setError(error instanceof Error ? error.message : 'Failed to send message');
      setIsStreaming(false);
      setStreamingContent('');

      // Remove the optimistic user message on error
      setLocalMessages((prev) => prev.slice(0, -1));
    }
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id);
    setError(null);
  };

  return (
    <div className="flex h-full">
      {/* Conversation List Sidebar */}
      <div className="w-80 shrink-0">
        <ConversationList
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          isLoading={isLoading}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto bg-slate-950">
          {!currentConversationId ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <h2 className="mb-2 text-xl font-semibold text-slate-100">
                  Welcome to Afilo Support
                </h2>
                <p className="mb-4 text-sm text-slate-400">
                  Start a new conversation or select an existing one
                </p>
                <button
                  onClick={handleNewConversation}
                  className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Start Conversation
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-0 py-4">
              {localMessages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}

              {/* Streaming Message */}
              {isStreaming && streamingContent && (
                <MessageBubble
                  message={{
                    id: 'streaming',
                    conversationId: currentConversationId,
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
                <div className="flex gap-3 px-4 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-sm font-semibold text-white">
                    AI
                  </div>
                  <TypingIndicator />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Error Banner */}
        {error && (
          <div className="border-t border-red-900 bg-red-950/50 px-4 py-2">
            <div className="flex items-center gap-2 text-sm text-red-400">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Message Input */}
        {currentConversationId && (
          <MessageInput
            onSendMessage={handleSendMessage}
            disabled={isStreaming}
            placeholder={
              isStreaming
                ? 'AI is responding...'
                : 'Ask about pricing, features, support...'
            }
          />
        )}
      </div>
    </div>
  );
}
