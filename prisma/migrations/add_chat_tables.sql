-- Migration: Add Enterprise Customer Support Chat Bot Tables
-- Description: Creates chat_conversations, chat_messages, knowledge_base, and bot_analytics tables
-- Requires: pgvector extension for semantic search
-- Created: 2025-10-31

-- ====================================
-- 1. Enable pgvector extension
-- ====================================
CREATE EXTENSION IF NOT EXISTS vector;

-- ====================================
-- 2. Chat Conversations Table
-- ====================================
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id VARCHAR(255) NOT NULL,
  title VARCHAR(500),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for chat_conversations
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user ON chat_conversations(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_status ON chat_conversations(status);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_created_at ON chat_conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_last_message ON chat_conversations(last_message_at DESC);

-- Add row level security
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

-- ====================================
-- 3. Chat Messages Table
-- ====================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE
);

-- Create indexes for chat_messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_role ON chat_messages(role);

-- Add row level security
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- ====================================
-- 4. Knowledge Base Table
-- ====================================
CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT UNIQUE NOT NULL,
  title VARCHAR(500),
  content TEXT NOT NULL,
  content_type VARCHAR(50),
  embedding vector(1536), -- Anthropic embeddings are 1536 dimensions
  searchable_text tsvector,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for knowledge_base
CREATE INDEX IF NOT EXISTS idx_knowledge_base_content_type ON knowledge_base(content_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_created_at ON knowledge_base(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_updated_at ON knowledge_base(updated_at DESC);

-- Create vector similarity search index (IVFFlat for performance)
CREATE INDEX IF NOT EXISTS idx_knowledge_base_embedding ON knowledge_base
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100); -- Tune based on dataset size

-- Create full-text search index
CREATE INDEX IF NOT EXISTS idx_knowledge_base_fts ON knowledge_base
  USING gin(searchable_text);

-- Add row level security
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

-- Create trigger to auto-update searchable_text from content
CREATE OR REPLACE FUNCTION update_knowledge_base_searchable_text()
RETURNS TRIGGER AS $$
BEGIN
  NEW.searchable_text := to_tsvector('english', COALESCE(NEW.title, '') || ' ' || NEW.content);
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_knowledge_base_searchable_text
  BEFORE INSERT OR UPDATE ON knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION update_knowledge_base_searchable_text();

-- ====================================
-- 5. Bot Analytics Table
-- ====================================
CREATE TABLE IF NOT EXISTS bot_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE
);

-- Create indexes for bot_analytics
CREATE INDEX IF NOT EXISTS idx_bot_analytics_conversation ON bot_analytics(conversation_id);
CREATE INDEX IF NOT EXISTS idx_bot_analytics_event_type ON bot_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_bot_analytics_created_at ON bot_analytics(created_at DESC);

-- Add row level security
ALTER TABLE bot_analytics ENABLE ROW LEVEL SECURITY;

-- ====================================
-- 6. Helper Functions
-- ====================================

-- Function: Get conversation with message count
CREATE OR REPLACE FUNCTION get_conversation_summary(conv_id UUID)
RETURNS TABLE (
  id UUID,
  clerk_user_id VARCHAR(255),
  title VARCHAR(500),
  status VARCHAR(50),
  message_count BIGINT,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.clerk_user_id,
    c.title,
    c.status,
    COUNT(m.id) as message_count,
    c.last_message_at,
    c.created_at
  FROM chat_conversations c
  LEFT JOIN chat_messages m ON m.conversation_id = c.id
  WHERE c.id = conv_id
  GROUP BY c.id, c.clerk_user_id, c.title, c.status, c.last_message_at, c.created_at;
END;
$$ LANGUAGE plpgsql;

-- Function: Search knowledge base with semantic similarity
CREATE OR REPLACE FUNCTION search_knowledge_base(
  query_embedding vector(1536),
  similarity_threshold FLOAT DEFAULT 0.7,
  max_results INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  url TEXT,
  title VARCHAR(500),
  content TEXT,
  content_type VARCHAR(50),
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.url,
    kb.title,
    kb.content,
    kb.content_type,
    1 - (kb.embedding <=> query_embedding) as similarity
  FROM knowledge_base kb
  WHERE kb.embedding IS NOT NULL
    AND 1 - (kb.embedding <=> query_embedding) > similarity_threshold
  ORDER BY kb.embedding <=> query_embedding
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Function: Full-text search knowledge base
CREATE OR REPLACE FUNCTION search_knowledge_base_fulltext(
  search_query TEXT,
  max_results INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  url TEXT,
  title VARCHAR(500),
  content TEXT,
  content_type VARCHAR(50),
  rank FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.url,
    kb.title,
    kb.content,
    kb.content_type,
    ts_rank(kb.searchable_text, websearch_to_tsquery('english', search_query)) as rank
  FROM knowledge_base kb
  WHERE kb.searchable_text @@ websearch_to_tsquery('english', search_query)
  ORDER BY rank DESC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- 7. Performance Optimization
-- ====================================

-- Analyze tables for query optimization
ANALYZE chat_conversations;
ANALYZE chat_messages;
ANALYZE knowledge_base;
ANALYZE bot_analytics;

-- ====================================
-- 8. Grant Permissions (if needed)
-- ====================================
-- Uncomment if you need to grant permissions to specific roles
-- GRANT SELECT, INSERT, UPDATE, DELETE ON chat_conversations TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON chat_messages TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON knowledge_base TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON bot_analytics TO your_app_user;

-- ====================================
-- Migration Complete
-- ====================================
-- Next steps:
-- 1. Run: pnpm prisma generate
-- 2. Update environment variables with ANTHROPIC_API_KEY
-- 3. Test API routes with authentication
