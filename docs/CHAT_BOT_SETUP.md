# Enterprise Customer Support Chat Bot - Setup Guide

## Phase 1: Foundation - Implementation Summary

This document outlines the foundation layer implementation for the Afilo Enterprise Customer Support Chat Bot system.

---

## ✅ Completed Implementation

### 1. Dependencies Installed
✅ `ai` - Vercel AI SDK
✅ `@ai-sdk/anthropic` - Anthropic Claude provider
✅ `pgvector` - PostgreSQL vector extension client
✅ `react-markdown` - Markdown rendering for messages
✅ `react-syntax-highlighter` - Code block syntax highlighting
✅ `@types/react-syntax-highlighter` - TypeScript types

### 2. Database Schema (`prisma/schema.prisma`)
✅ **chat_conversations** - Stores conversation metadata
✅ **chat_messages** - Individual messages with role (user/assistant/system)
✅ **knowledge_base** - Crawled website content with embeddings
✅ **bot_analytics** - Usage tracking and metrics

**Features:**
- UUID primary keys
- Timestamptz timestamps
- Foreign key constraints with CASCADE delete
- Comprehensive indexes for performance
- Row-level security enabled

### 3. Database Migration (`prisma/migrations/add_chat_tables.sql`)
✅ Enables pgvector extension
✅ Creates all 4 tables with proper constraints
✅ Creates performance indexes (including IVFFlat vector index)
✅ Implements full-text search with GIN indexes
✅ Auto-update triggers for searchable_text
✅ Helper functions for semantic and full-text search

### 4. TypeScript Type Definitions

#### `types/chat.ts`
- `ChatConversation`, `ChatMessage` interfaces
- `CustomerContext` for Stripe integration
- `KnowledgeBaseEntry` with vector embeddings
- `BotAnalyticsEvent` tracking types
- UI state types for widgets

#### `types/api.ts`
- Request/Response types for all endpoints
- Generic `ApiResponse<T>` wrapper
- Error response types (validation, rate limit)
- Type guards for response checking

### 5. State Management (`store/chat-store.ts`)
✅ Zustand store for global chat state
✅ Widget state (open/minimized/unread count)
✅ Conversations and messages management
✅ Streaming message support
✅ Optimistic updates with rollback
✅ Selectors for performant re-renders

### 6. Utilities

#### `lib/chat-auth.ts`
- Clerk authentication integration
- Conversation ownership verification (IDOR protection)
- User profile fetching
- API response helpers
- Input validation and sanitization

#### `lib/chat-stripe-context.ts`
- Customer context fetching (Phase 3 full implementation)
- Subscription tier mapping
- Payment status checking
- AI prompt formatting helpers
- Tier-specific greetings

### 7. API Routes

#### `app/api/chat/conversations/route.ts`
✅ **POST** - Create new conversation
✅ **GET** - List user's conversations with pagination

**Features:**
- Clerk authentication required
- Input validation
- IDOR protection
- Analytics tracking
- Proper error handling
- Rate limiting ready

---

## 🚧 Next Steps to Complete Phase 1

### 1. Remaining API Routes

Create these files:

#### `app/api/chat/conversations/[id]/route.ts`
```typescript
// GET - Get conversation by ID with messages
// DELETE - Archive conversation
// PATCH - Update conversation (title, status)
```

#### `app/api/chat/conversations/[id]/messages/route.ts`
```typescript
// POST - Send message with AI streaming response
// GET - Get messages with pagination
```

### 2. UI Components

Create these in `components/chat/`:

#### Core Components
- `ChatWidget.tsx` - Floating button with Sheet
- `ChatInterface.tsx` - Main chat UI
- `MessageBubble.tsx` - User/assistant message display
- `MessageInput.tsx` - Text input with file upload
- `ConversationList.tsx` - Sidebar conversation list
- `TypingIndicator.tsx` - Animated typing dots

#### Supporting Components
- `MarkdownRenderer.tsx` - Safe markdown with syntax highlighting
- `CodeBlock.tsx` - Code snippet with copy button
- `AttachmentPreview.tsx` - File attachment display

### 3. Integration

#### Add to Layout
```typescript
// app/layout.tsx or app/(dashboard)/layout.tsx
import { ChatWidget } from '@/components/chat/ChatWidget';

export default function Layout({ children }) {
  return (
    <>
      {children}
      <ChatWidget />
    </>
  );
}
```

---

## 📋 Database Setup Instructions

### Step 1: Run Migration

```bash
# Connect to your Neon database
psql $DATABASE_URL -f prisma/migrations/add_chat_tables.sql
```

### Step 2: Verify pgvector Extension

```sql
-- Check if pgvector is enabled
SELECT * FROM pg_extension WHERE extname = 'vector';

-- If not enabled, run:
CREATE EXTENSION IF NOT EXISTS vector;
```

### Step 3: Generate Prisma Client

```bash
pnpm prisma generate
```

### Step 4: Verify Tables

```sql
-- List all chat tables
SELECT table_name
FROM information_schema.tables
WHERE table_name LIKE 'chat_%' OR table_name LIKE 'knowledge_base' OR table_name LIKE 'bot_analytics';

-- Check indexes
SELECT indexname, tablename
FROM pg_indexes
WHERE tablename IN ('chat_conversations', 'chat_messages', 'knowledge_base', 'bot_analytics');
```

---

## 🔑 Environment Variables

Add to `.env.local` and Vercel:

```bash
# AI Configuration (already configured per user confirmation)
ANTHROPIC_API_KEY=sk-ant-...

# Chat Bot Settings
NEXT_PUBLIC_CHAT_BOT_ENABLED=true
CHAT_BOT_MAX_TOKENS=4096
CHAT_BOT_TEMPERATURE=0.7

# Knowledge Base Embeddings
KNOWLEDGE_BASE_EMBEDDING_MODEL=claude-3-haiku-20240307

# Rate Limiting (Upstash Redis - already configured)
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

---

## 🧪 Testing API Routes

### Create Conversation

```bash
curl -X POST http://localhost:3000/api/chat/conversations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{
    "title": "Test Conversation",
    "initialMessage": "Hello, I need help with pricing"
  }'
```

### List Conversations

```bash
curl -X GET "http://localhost:3000/api/chat/conversations?status=active&limit=10" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"
```

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                             │
├─────────────────────────────────────────────────────────────┤
│  ChatWidget (Sheet) → ChatInterface → MessageBubble        │
│  MessageInput → ConversationList → TypingIndicator          │
│  Zustand Store (chat-store.ts)                             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      API Routes                             │
├─────────────────────────────────────────────────────────────┤
│  /api/chat/conversations                                    │
│    - POST (create) ✅                                        │
│    - GET (list) ✅                                           │
│                                                             │
│  /api/chat/conversations/[id]                               │
│    - GET (get with messages) 🚧                             │
│    - DELETE (archive) 🚧                                     │
│    - PATCH (update) 🚧                                       │
│                                                             │
│  /api/chat/conversations/[id]/messages                       │
│    - POST (send with streaming) 🚧                          │
│    - GET (list messages) 🚧                                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic                           │
├─────────────────────────────────────────────────────────────┤
│  lib/chat-auth.ts (Clerk integration) ✅                     │
│  lib/chat-stripe-context.ts (Customer data) ✅              │
│  lib/rate-limit.ts (Existing - 20 msgs/min)                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                       Database                              │
├─────────────────────────────────────────────────────────────┤
│  Neon PostgreSQL + pgvector                                │
│    - chat_conversations ✅                                   │
│    - chat_messages ✅                                        │
│    - knowledge_base ✅                                       │
│    - bot_analytics ✅                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔒 Security Implemented

✅ **Authentication**: All routes require Clerk authentication
✅ **IDOR Protection**: Conversation ownership validation
✅ **Input Validation**: Length limits and sanitization
✅ **XSS Prevention**: HTML sanitization helpers
✅ **Rate Limiting**: Ready for Upstash Redis integration
✅ **SQL Injection**: Parameterized queries with Neon
✅ **Row-Level Security**: Enabled on all chat tables

---

## 📊 Performance Optimizations

✅ **Database Indexes**:
- B-tree on user_id, status, timestamps
- GIN on searchable_text for full-text search
- IVFFlat on embeddings for vector similarity

✅ **Query Optimization**:
- Proper JOINs with COUNT aggregation
- LIMIT/OFFSET pagination
- Single query for conversation + message count

✅ **Frontend Optimization**:
- Zustand selectors prevent unnecessary re-renders
- Optimistic updates for instant UI feedback
- Streaming responses for perceived performance

---

## 🎯 Success Criteria Checklist

- [x] Dependencies installed
- [x] Database schema created
- [x] Migration script ready
- [x] Type definitions complete
- [x] State management implemented
- [x] Authentication utilities created
- [x] Stripe context utilities prepared
- [x] Conversation CRUD API (partial - 2/4 routes)
- [ ] Messages API with streaming
- [ ] UI components
- [ ] Integration with layout
- [ ] End-to-end testing
- [ ] Documentation complete

**Phase 1 Progress: ~70% Complete**

---

## 🚀 Quick Start Checklist

### For Developer to Complete:

1. **Run Database Migration**
   ```bash
   psql $DATABASE_URL -f prisma/migrations/add_chat_tables.sql
   pnpm prisma generate
   ```

2. **Add Environment Variables**
   - Verify `ANTHROPIC_API_KEY` is set
   - Add `NEXT_PUBLIC_CHAT_BOT_ENABLED=true`
   - Add `CHAT_BOT_MAX_TOKENS=4096`

3. **Create Remaining API Routes**
   - `app/api/chat/conversations/[id]/route.ts`
   - `app/api/chat/conversations/[id]/messages/route.ts`

4. **Build UI Components**
   - Start with `ChatWidget.tsx`
   - Then `ChatInterface.tsx`
   - Add message components

5. **Test End-to-End**
   - Create conversation
   - Send messages
   - View conversation history

---

## 📚 Related Documentation

- [CLAUDE.md](../CLAUDE.md) - Project configuration
- [.claude/IMPLIMENT-BOT.md](../.claude/IMPLIMENT-BOT.md) - Full implementation spec
- [Prisma Schema](../prisma/schema.prisma) - Database models
- [API Types](../types/api.ts) - Request/response interfaces

---

## 🤝 Support

For questions or issues:
1. Check existing types in `types/chat.ts` and `types/api.ts`
2. Review authentication patterns in `lib/chat-auth.ts`
3. Examine API route structure in `app/api/chat/conversations/route.ts`
4. Refer to Zustand store in `store/chat-store.ts`

---

**Next Phase**: Phase 2 will integrate Anthropic Claude API with streaming responses and implement the AI prompt engineering system.
