/**
 * Chat Store - Zustand State Management
 *
 * Manages global chat state including conversations, messages, and UI state.
 * Follows Afilo's existing Zustand patterns.
 */

import { create } from 'zustand';
import type {
  ChatConversation,
  ChatMessage,
  ConversationStatus,
  StreamingMessage,
} from '@/types/chat';

// ====================================
// Store State Interface
// ====================================

interface ChatState {
  // Widget State
  isOpen: boolean;
  isMinimized: boolean;
  unreadCount: number;

  // Conversations
  conversations: ChatConversation[];
  currentConversationId: string | null;

  // Messages
  messages: ChatMessage[];
  streamingMessage: StreamingMessage | null;

  // UI State
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;

  // Actions
  setIsOpen: (isOpen: boolean) => void;
  setIsMinimized: (isMinimized: boolean) => void;
  toggleWidget: () => void;

  setConversations: (conversations: ChatConversation[]) => void;
  addConversation: (conversation: ChatConversation) => void;
  updateConversation: (id: string, updates: Partial<ChatConversation>) => void;
  removeConversation: (id: string) => void;

  setCurrentConversationId: (id: string | null) => void;

  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;

  setStreamingMessage: (message: StreamingMessage | null) => void;
  updateStreamingContent: (content: string) => void;
  completeStreamingMessage: () => void;

  setIsLoading: (isLoading: boolean) => void;
  setIsStreaming: (isStreaming: boolean) => void;
  setError: (error: string | null) => void;

  incrementUnreadCount: () => void;
  resetUnreadCount: () => void;

  // Optimistic Updates
  optimisticAddMessage: (content: string, conversationId: string) => void;
  rollbackOptimisticMessage: (tempId: string) => void;

  // Reset
  reset: () => void;
}

// ====================================
// Initial State
// ====================================

const initialState = {
  isOpen: false,
  isMinimized: false,
  unreadCount: 0,
  conversations: [],
  currentConversationId: null,
  messages: [],
  streamingMessage: null,
  isLoading: false,
  isStreaming: false,
  error: null,
};

// ====================================
// Chat Store
// ====================================

export const useChatStore = create<ChatState>((set, get) => ({
  ...initialState,

  // Widget Actions
  setIsOpen: (isOpen) => set({ isOpen }),

  setIsMinimized: (isMinimized) => set({ isMinimized }),

  toggleWidget: () => {
    const { isOpen } = get();
    set({ isOpen: !isOpen });
    if (!isOpen) {
      set({ unreadCount: 0 });
    }
  },

  // Conversation Actions
  setConversations: (conversations) => set({ conversations }),

  addConversation: (conversation) =>
    set((state) => ({
      conversations: [conversation, ...state.conversations],
    })),

  updateConversation: (id, updates) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === id ? { ...conv, ...updates } : conv
      ),
    })),

  removeConversation: (id) =>
    set((state) => ({
      conversations: state.conversations.filter((conv) => conv.id !== id),
      currentConversationId:
        state.currentConversationId === id ? null : state.currentConversationId,
    })),

  setCurrentConversationId: (id) =>
    set({
      currentConversationId: id,
      error: null,
    }),

  // Message Actions
  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  updateMessage: (id, updates) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, ...updates } : msg
      ),
    })),

  // Streaming Actions
  setStreamingMessage: (streamingMessage) => set({ streamingMessage }),

  updateStreamingContent: (content) =>
    set((state) => ({
      streamingMessage: state.streamingMessage
        ? { ...state.streamingMessage, content }
        : null,
    })),

  completeStreamingMessage: () =>
    set((state) => {
      if (state.streamingMessage) {
        const completedMessage: ChatMessage = {
          id: state.streamingMessage.id,
          conversationId: state.currentConversationId || '',
          role: state.streamingMessage.role,
          content: state.streamingMessage.content,
          metadata: {},
          createdAt: new Date(),
        };

        return {
          messages: [...state.messages, completedMessage],
          streamingMessage: null,
          isStreaming: false,
        };
      }
      return { streamingMessage: null, isStreaming: false };
    }),

  // UI State Actions
  setIsLoading: (isLoading) => set({ isLoading }),

  setIsStreaming: (isStreaming) => set({ isStreaming }),

  setError: (error) => set({ error }),

  // Unread Count Actions
  incrementUnreadCount: () =>
    set((state) => ({
      unreadCount: state.unreadCount + 1,
    })),

  resetUnreadCount: () => set({ unreadCount: 0 }),

  // Optimistic Updates
  optimisticAddMessage: (content, conversationId) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: ChatMessage = {
      id: tempId,
      conversationId,
      role: 'user',
      content,
      metadata: {},
      createdAt: new Date(),
    };

    set((state) => ({
      messages: [...state.messages, optimisticMessage],
    }));

    return tempId;
  },

  rollbackOptimisticMessage: (tempId) =>
    set((state) => ({
      messages: state.messages.filter((msg) => msg.id !== tempId),
    })),

  // Reset
  reset: () => set(initialState),
}));

// ====================================
// Selectors (for optimized re-renders)
// ====================================

export const selectCurrentConversation = (state: ChatState) =>
  state.conversations.find((conv) => conv.id === state.currentConversationId);

export const selectCurrentMessages = (state: ChatState) =>
  state.messages.filter((msg) => msg.conversationId === state.currentConversationId);

export const selectActiveConversations = (state: ChatState) =>
  state.conversations.filter((conv) => conv.status === 'active');

export const selectIsWidgetOpen = (state: ChatState) => state.isOpen;

export const selectHasUnread = (state: ChatState) => state.unreadCount > 0;
