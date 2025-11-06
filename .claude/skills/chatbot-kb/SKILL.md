---
name: chatbot-kb
description: Manages AI chatbot knowledge base operations including semantic search, website crawling, and vector embeddings. Use when working with the chat bot system, knowledge base management, or AI context optimization.
---

# Chat Bot Knowledge Base

Enterprise AI chat bot with semantic search and intelligent knowledge base management.

## Quick Start

**Start a crawl:**
```bash
curl -X POST /api/admin/knowledge-base/crawl \
  -H "Cookie: __session=YOUR_ADMIN_SESSION"
```

**Search knowledge base:**
```typescript
import { hybridSearch } from '@/lib/semantic-search';

const results = await hybridSearch('stripe integration', {
  limit: 3,
  threshold: 0.5,
  contentTypes: ['documentation', 'faq']
});
```

**Create chat conversation:**
```typescript
const conversation = await fetch('/api/chat/conversations', {
  method: 'POST',
  body: JSON.stringify({ title: 'User Question' })
});
```

## Core Components

**Semantic Search**: See [semantic-search.md](semantic-search.md) for vector and hybrid search
**Website Crawler**: See [crawler.md](crawler.md) for content extraction
**Embeddings**: See [embeddings.md](embeddings.md) for vector generation
**Chat Context**: See [chat-context.md](chat-context.md) for AI integration

## Knowledge Base Workflow

Copy this checklist when updating the knowledge base:

```
KB Management Checklist:
- [ ] Step 1: Trigger website crawl via admin API
- [ ] Step 2: Monitor crawl progress and status
- [ ] Step 3: Verify new content was indexed properly
- [ ] Step 4: Test search relevance with sample queries
- [ ] Step 5: Update content types and metadata if needed
```

## Database Schema

**knowledge_base table:**
- `id`: UUID primary key
- `url`: Unique URL of content
- `title`: Page/content title
- `content`: Full text content
- `content_type`: 'page' | 'product' | 'faq' | 'documentation'
- `embedding`: Vector(1536) for semantic search
- `searchable_text`: tsvector for full-text search
- `metadata`: JSON with tags, word count, etc.

**Chat tables:**
- `chat_conversations`: User conversations
- `chat_messages`: Individual messages with KB article references
- `bot_analytics`: Usage tracking and performance metrics

## Search Strategy

### Hybrid Search (Recommended)
Combines vector similarity + full-text search:
- **Vector Search (70% weight)**: Semantic understanding
- **Full-text Search (30% weight)**: Exact keyword matching
- **Deduplication**: Merges results and boosts items found in both

### Vector Search Only
For semantic similarity when keywords don't match:
```typescript
const results = await vectorSearch(query, {
  limit: 5,
  threshold: 0.6 // Higher threshold for better relevance
});
```

### Full-text Search Only
For exact keyword matching:
```typescript
const results = await fullTextSearch(query, {
  contentTypes: ['documentation']
});
```

## AI Context Integration

**Context Assembly:**
1. Last 10 messages from conversation
2. Top 3 relevant KB articles (via hybrid search)
3. Customer Stripe data (subscription, payment status)
4. Current conversation metadata

**Context Formatting:**
```typescript
const context = formatResultsForAI(searchResults);
// Outputs formatted articles with relevance scores
```

## Performance Optimization

- **Embedding Cache**: Reuse embeddings for similar queries
- **Content Chunking**: Split large articles into smaller sections
- **Relevance Threshold**: Filter out low-relevance results (< 0.5)
- **Search Limits**: Cap results to prevent context overflow

## Troubleshooting

**Poor search results:**
- Check embedding model consistency
- Verify content preprocessing
- Adjust relevance thresholds
- Test with different search strategies

**Crawl failures:**
- Verify website accessibility
- Check robots.txt compliance
- Monitor rate limiting
- Review error logs in bot_analytics

**AI responses lack context:**
- Ensure search results are relevant
- Check article formatting for AI
- Verify customer data integration
- Test with various query types