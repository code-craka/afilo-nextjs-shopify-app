# Semantic Search Implementation

Advanced search combining vector similarity and full-text search for optimal knowledge retrieval.

## Search Types

### 1. Vector Search
Uses pgvector extension for semantic similarity:
```sql
SELECT *, 1 - (embedding <=> $query_embedding::vector) AS similarity_score
FROM knowledge_base
WHERE 1 - (embedding <=> $query_embedding::vector) >= $threshold
ORDER BY embedding <=> $query_embedding::vector
```

**Best for**: Conceptual queries, synonyms, related topics

### 2. Full-text Search
Uses PostgreSQL's built-in text search:
```sql
SELECT *, ts_rank(searchable_text, plainto_tsquery('english', $query)) AS rank
FROM knowledge_base
WHERE searchable_text @@ plainto_tsquery('english', $query)
```

**Best for**: Exact keywords, technical terms, specific names

### 3. Hybrid Search
Combines both approaches with weighted scoring:
- Vector results: 70% weight
- Full-text results: 30% weight
- Deduplicates and boosts items found in both searches

## Search Options

```typescript
interface SearchOptions {
  limit?: number;           // Max results (default: 5)
  threshold?: number;       // Min similarity (0-1, default: 0.5)
  contentTypes?: string[];  // Filter by content type
}
```

## Relevance Scoring

- **Vector similarity**: 0-1 scale using cosine distance
- **Full-text rank**: PostgreSQL ts_rank function
- **Hybrid score**: Weighted combination with boost for dual matches

## Content Types

- `page`: General website pages
- `product`: Product documentation
- `faq`: Frequently asked questions
- `documentation`: Technical docs

## Query Preprocessing

Before generating embeddings:
1. **Clean text**: Remove HTML, normalize whitespace
2. **Extract key phrases**: Focus on meaningful content
3. **Limit length**: Truncate to model limits
4. **Language detection**: English text preferred

## Performance Tips

- Use appropriate thresholds (0.5+ for quality)
- Limit results to prevent context overflow
- Filter by content type for focused searches
- Cache frequent query embeddings

## Integration Pattern

```typescript
// Standard search flow
const query = "How do I integrate Stripe?";
const results = await hybridSearch(query, {
  limit: 3,
  threshold: 0.6,
  contentTypes: ['documentation', 'faq']
});

// Format for AI consumption
const aiContext = formatResultsForAI(results);
```

## Error Handling

- **Embedding generation fails**: Fallback to full-text search
- **Vector search fails**: Use keyword search
- **No results found**: Return empty array, log query
- **Database errors**: Graceful degradation to simpler search