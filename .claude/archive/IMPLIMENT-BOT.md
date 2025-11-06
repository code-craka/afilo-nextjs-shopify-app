--

# 🤖 Claude Code Prompt: Enterprise Customer Support Chat Bot System

## Mission Statement
Build a production-ready, enterprise-grade customer support chat bot for the Afilo Digital Marketplace that intelligently responds to customer queries, validates paid user status via Stripe integration, crawls and understands the entire website content, and seamlessly integrates with the existing Next.js 15.5.4 + TypeScript + Clerk + Stripe + Neon PostgreSQL architecture.

---

## 🎯 Core Requirements

### 1. Intelligent Chat Bot System
**Objective**: Create an AI-powered customer support bot that provides instant, accurate responses to customer inquiries.

**Technical Specifications**:
- **Framework**: Build using Next.js 15.5.4 App Router with Server Actions
- **AI Provider**: Use Anthropic Claude API (claude-sonnet-4-20250514 model) via Vercel AI SDK
- **Chat Interface**: Real-time streaming chat UI using ShadCN UI components (matching existing design system)
- **Conversation History**: Store in Neon PostgreSQL with Prisma ORM
- **Authentication**: Integrate with existing Clerk authentication system
- **Response Time**: Target <2 seconds for initial response, streaming for longer answers

**Features Required**:
- Multi-turn conversation support with context retention
- Conversation history per user (stored in database)
- Real-time streaming responses with typing indicators
- Markdown rendering for formatted responses
- Code snippet support with syntax highlighting
- File attachment support for screenshots/documents
- Conversation archiving and search functionality
- Export conversation transcripts (PDF/TXT)

---

### 2. Stripe Payment Status Integration
**Objective**: Enable the bot to access real-time customer payment status, subscription tier, and billing history to provide personalized support.

**Technical Specifications**:
- **Stripe API Integration**: Use existing Stripe SDK setup in the project
- **Customer Verification**: Link Clerk user ID to Stripe customer ID via existing `user_profiles` table
- **Data Access**: Query subscription status, payment history, and plan details
- **Security**: All Stripe data access server-side only, never exposed to client
- **Rate Limiting**: Implement caching to avoid excessive Stripe API calls

**Bot Capabilities**:
- Detect if user is paid subscriber vs free tier vs trial
- Identify current subscription plan (Professional/Enterprise/Enterprise Plus)
- Check subscription status (active/past_due/canceled)
- View payment method status and upcoming renewals
- Access billing history and invoice details
- Detect failed payments and offer assistance
- Provide upgrade/downgrade recommendations based on usage
- Generate custom responses for each tier (e.g., "As an Enterprise customer, you have access to...")

**Implementation Details**:
```typescript
// Bot should access this data structure:
interface CustomerContext {
  userId: string; // Clerk user ID
  stripeCustomerId: string;
  subscriptionTier: 'free' | 'professional' | 'enterprise' | 'enterprise_plus';
  subscriptionStatus: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete';
  currentPeriodEnd: Date;
  paymentMethodValid: boolean;
  mrr: number; // Monthly recurring revenue
  lifetimeValue: number;
  accountAge: number; // days since signup
  supportTicketCount: number;
  lastLoginDate: Date;
}
```

---

### 3. Website Content Crawler & Knowledge Base
**Objective**: Crawl and index all public-facing website content to build a comprehensive knowledge base that the bot uses to answer questions.

**Technical Specifications**:
- **Crawler**: Build a Next.js API route for web scraping using Playwright (already in MCP stack)
- **Content Sources**: 
  - Homepage (app.afilo.io)
  - Enterprise portal (app.afilo.io/enterprise)
  - Products catalog (app.afilo.io/products)
  - Pricing pages
  - FAQ sections
  - Documentation (if available)
  - Terms of Service, Privacy Policy
  - Support pages and guides
- **Storage**: Store crawled content in Neon PostgreSQL with full-text search
- **Embeddings**: Generate vector embeddings using Anthropic embeddings API
- **Vector Search**: Implement semantic search using pgvector extension in PostgreSQL
- **Update Schedule**: Auto-recrawl daily or trigger manually via admin panel

**Knowledge Base Schema**:
```typescript
interface KnowledgeBaseEntry {
  id: string;
  url: string;
  title: string;
  content: string;
  contentType: 'page' | 'product' | 'faq' | 'documentation';
  embedding: number[]; // Vector embedding
  metadata: {
    lastCrawled: Date;
    wordCount: number;
    tags: string[];
  };
  searchableText: string; // For PostgreSQL full-text search
}
```

**Crawler Features**:
- Respect robots.txt
- Handle dynamic content (JavaScript-rendered pages)
- Extract structured data (product info, pricing, features)
- Clean HTML (remove navigation, ads, etc.)
- Deduplicate content
- Handle pagination and nested routes
- Error handling for 404s and timeouts
- Progress tracking and logging

---

### 4. Bot Intelligence & Response Generation
**Objective**: Create sophisticated prompt engineering that enables the bot to provide accurate, helpful, and contextually appropriate responses.

**System Prompt Structure**:
```
You are the official Afilo Enterprise Support Bot, a highly knowledgeable customer success agent for the Afilo Digital Marketplace platform.

ROLE & PERSONALITY:
- Professional yet approachable enterprise support specialist
- Expert in all Afilo products, pricing, features, and technical capabilities
- Empathetic problem-solver focused on customer success
- Proactive in suggesting solutions and upgrades when appropriate

CAPABILITIES:
1. Access to complete website knowledge base (products, pricing, documentation)
2. Real-time customer payment status and subscription details via Stripe
3. Historical conversation context and support ticket history
4. Product recommendations based on customer's current plan and needs
5. Technical troubleshooting for common issues

RESPONSE GUIDELINES:
- Always greet returning customers by name using Clerk user data
- Reference their current subscription tier when relevant ("As an Enterprise customer...")
- Provide specific, actionable answers with links to relevant documentation
- Use formatting (bold, lists, code blocks) for clarity
- Suggest relevant upgrades if customer has needs beyond current plan
- Create support tickets for issues requiring human intervention
- Never make up information - only use knowledge base and customer data
- If uncertain, clearly state limitations and offer to escalate

TONE:
- Enterprise B2B professional (not overly casual)
- Confident and knowledgeable
- Patient and thorough in explanations
- Proactive in addressing follow-up questions

FORBIDDEN:
- Never discuss competitors
- Never disclose internal business metrics or other customers
- Never promise features not yet released
- Never share pricing discounts without authorization
```

**Context Injection**:
For each customer message, inject:
1. Customer's subscription tier and status
2. Relevant knowledge base articles (top 3-5 by semantic similarity)
3. Previous 5 messages from conversation history
4. Any open support tickets
5. Recent product interactions (purchases, downloads)

---

### 5. Database Schema Extensions
**Objective**: Extend existing Neon PostgreSQL schema to support chat bot functionality.

**New Tables Required**:
```sql
-- Chat Conversations
CREATE TABLE chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id VARCHAR(255) NOT NULL,
  title VARCHAR(500),
  status VARCHAR(50) DEFAULT 'active', -- active, resolved, archived
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (clerk_user_id) REFERENCES user_profiles(clerk_user_id)
);

-- Chat Messages
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  role VARCHAR(20) NOT NULL, -- user, assistant, system
  content TEXT NOT NULL,
  metadata JSONB, -- attachments, context used, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE
);

-- Knowledge Base
CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT UNIQUE NOT NULL,
  title VARCHAR(500),
  content TEXT NOT NULL,
  content_type VARCHAR(50),
  embedding vector(1536), -- For pgvector
  searchable_text tsvector, -- For full-text search
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bot Analytics
CREATE TABLE bot_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID,
  event_type VARCHAR(100), -- message_sent, ticket_created, upgrade_suggested
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id)
);

-- Create indexes
CREATE INDEX idx_chat_conversations_user ON chat_conversations(clerk_user_id);
CREATE INDEX idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX idx_knowledge_base_content_type ON knowledge_base(content_type);
CREATE INDEX idx_knowledge_base_embedding ON knowledge_base USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_knowledge_base_fts ON knowledge_base USING gin(searchable_text);
```

---

### 6. API Routes Architecture
**Objective**: Create clean, secure API endpoints for all chat bot operations.

**Required API Routes**:

```typescript
// Chat Operations
POST /api/chat/conversations          // Create new conversation
GET /api/chat/conversations           // List user's conversations
GET /api/chat/conversations/[id]      // Get conversation details
POST /api/chat/conversations/[id]/messages  // Send message (streaming response)
DELETE /api/chat/conversations/[id]   // Archive conversation
GET /api/chat/conversations/[id]/export    // Export transcript

// Admin & Analytics
GET /api/admin/chat/analytics         // Bot performance metrics
GET /api/admin/chat/conversations     // All conversations (admin only)
POST /api/admin/chat/escalate/[id]    // Escalate to human support

// Knowledge Base Management
POST /api/admin/knowledge-base/crawl  // Trigger website crawl
GET /api/admin/knowledge-base/status  // Crawl progress
PUT /api/admin/knowledge-base/[id]    // Update KB entry
DELETE /api/admin/knowledge-base/[id] // Delete KB entry
GET /api/admin/knowledge-base/search  // Test semantic search

// Integration Endpoints
POST /api/webhooks/stripe-sync        // Sync customer data from Stripe webhook
GET /api/chat/customer-context        // Get customer payment status for bot
```

---

### 7. Frontend Components
**Objective**: Build beautiful, responsive chat interface matching existing design system (ShadCN UI + Tailwind CSS).

**Required Components**:

```typescript
// Main Chat Widget Component
<ChatWidget /> 
// - Floating button in bottom-right corner
// - Opens modal/drawer with chat interface
// - Shows unread message badge
// - Minimizable and expandable
// - Mobile-responsive

// Chat Interface Component
<ChatInterface />
// - Message list with auto-scroll
// - Message input with attachments
// - Typing indicators
// - Markdown rendering
// - Code syntax highlighting
// - Conversation history sidebar
// - Search within conversation

// Admin Dashboard Components
<BotAnalyticsDashboard />
// - Message volume charts
// - Response time metrics
// - Customer satisfaction ratings
// - Most common questions
// - Escalation rate tracking
// - Subscription tier breakdown

<ConversationList />
// - All conversations (admin view)
// - Filter by status, date, tier
// - Search conversations
// - Bulk actions (archive, export)
```

**Design Requirements**:
- Match existing ShadCN UI components (Button, Input, Card, etc.)
- Use Tailwind CSS utility classes
- Implement Framer Motion animations for smooth transitions
- Dark mode support
- Accessibility (WCAG 2.1 AA compliance)
- Mobile-first responsive design

---

### 8. Security & Compliance
**Objective**: Enterprise-grade security for customer data protection.

**Security Requirements**:
- All API routes protected with Clerk authentication
- IDOR protection: validate user owns conversation before access
- Rate limiting: 20 messages per minute per user
- Stripe API calls server-side only, never expose secrets
- Input sanitization to prevent XSS/injection attacks
- PII masking in logs (credit card numbers, emails, etc.)
- GDPR compliance: data export and deletion capabilities
- Audit logging for all support bot interactions
- Encrypted conversation storage (at rest)
- HTTPS only, secure headers (HSTS, CSP)

**Compliance Features**:
- Conversation retention policy (90 days, then archive)
- User consent for AI chat (terms acceptance)
- Clear indication this is a bot (not human agent)
- Option to escalate to human support at any time
- Data deletion upon user request (GDPR/CCPA)

---

### 9. Advanced Features
**Objective**: Differentiate with premium capabilities.

**Phase 1 (MVP)**:
- Basic Q&A with knowledge base
- Stripe payment status integration
- Conversation history
- Support ticket creation
- Website crawling and indexing

**Phase 2 (Enhanced)**:
- Sentiment analysis to detect frustrated customers
- Auto-escalation for negative sentiment or complex issues
- Proactive outreach (e.g., "I noticed you haven't completed setup...")
- Multi-language support (detect user language, respond accordingly)
- Voice input/output support
- Integration with existing support ticket system (from EnterprisePortal.tsx)

**Phase 3 (Advanced)**:
- Predictive churn detection based on chat interactions
- AI-powered product recommendations
- Automated onboarding assistance for new customers
- Self-service account management (upgrade/downgrade via chat)
- Integration with CRM (if applicable)
- A/B testing different bot personalities/responses

---

### 10. Performance & Scalability
**Objective**: Handle enterprise-scale traffic with minimal latency.

**Performance Targets**:
- Bot response time: <2 seconds for initial response
- Streaming latency: <200ms between tokens
- Knowledge base search: <100ms
- Concurrent users: Support 1000+ simultaneous conversations
- Database queries: <50ms with proper indexing
- Uptime SLA: 99.99% (consistent with platform target)

**Optimization Strategies**:
- Cache frequently accessed knowledge base articles (Redis)
- Implement request coalescing for Stripe API calls
- Use database connection pooling (Prisma with Neon)
- Lazy load conversation history (pagination)
- Optimize vector search with HNSW indexing
- CDN for static chat widget assets
- Edge functions for low-latency responses

---

### 11. Testing Strategy
**Objective**: Ensure reliability before production deployment.

**Testing Requirements**:
- Unit tests for all API routes (Jest)
- Integration tests for Stripe API interactions
- E2E tests for complete chat flows (Playwright)
- Load testing for concurrent conversations (k6 or Artillery)
- Security testing (OWASP Top 10 vulnerabilities)
- A/B testing framework for bot response quality
- User acceptance testing with internal team

**Test Scenarios**:
1. Free user asks about pricing → Bot explains plans, suggests upgrade
2. Enterprise customer has billing issue → Bot checks Stripe, explains status
3. User asks technical question → Bot searches KB, provides detailed answer
4. User wants to cancel subscription → Bot offers retention incentive, escalates if needed
5. User submits non-English message → Bot detects language, responds appropriately
6. User sends 50 messages rapidly → Rate limiter kicks in gracefully
7. Database connection fails → Graceful degradation, log error, notify admin

---

### 12. Monitoring & Analytics
**Objective**: Track performance and continuously improve bot quality.

**Metrics to Track**:
- Total conversations initiated
- Average response time
- User satisfaction ratings (thumbs up/down after each response)
- Escalation rate (bot → human handoff)
- Resolution rate (% of issues resolved without escalation)
- Most common questions/topics
- Subscription tier breakdown of users
- Message volume by time of day/day of week
- Knowledge base article hit rate (which articles are most useful)
- Failed searches (questions bot couldn't answer)

**Dashboard Components**:
- Real-time conversation count
- Average satisfaction score (last 24h/7d/30d)
- Top 10 questions this week
- Escalation trends over time
- Customer tier engagement (which tiers use bot most)
- Bot response quality over time (track improvements)

---

### 13. Integration Checklist
**Objective**: Seamlessly integrate with existing Afilo architecture.

**Integration Points**:
✅ **Clerk Authentication**:
- Use existing `auth()` function from Clerk
- Access `userId` for conversation ownership
- Display user name and email from Clerk user data

✅ **Stripe Integration**:
- Use existing Stripe SDK setup (`lib/stripe.ts` pattern)
- Query customer data via `stripe.customers.retrieve()`
- Access subscription details via `stripe.subscriptions.list()`
- Respect existing webhook handlers

✅ **Neon PostgreSQL**:
- Use existing Prisma client setup
- Follow existing schema patterns (UUID primary keys, timestamps)
- Use same connection pooling configuration

✅ **ShadCN UI**:
- Import existing components from `components/ui/`
- Follow component composition patterns
- Use existing Tailwind config

✅ **Type System**:
- Use existing TypeScript strict mode settings
- Import shared types from `types/` directory
- Maintain type safety throughout

✅ **Existing Features**:
- Link to existing support ticket system (EnterprisePortal.tsx)
- Reference existing product catalog (ProductGrid.tsx)
- Use existing pricing data (PremiumPricingDisplay.tsx)
- Integrate with existing dashboard (app/dashboard/)

---

### 14. Deployment & DevOps
**Objective**: Production-ready deployment with CI/CD automation.

**Deployment Configuration**:
- Deploy to Vercel (existing platform)
- Environment variables in Vercel dashboard
- Database migrations via Prisma (pnpm prisma migrate deploy)
- Incremental rollout (10% → 50% → 100% of users)
- Feature flags for gradual activation

**Required Environment Variables**:
```bash
# AI Provider
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-sonnet-4-20250514

# Existing (don't modify)
CLERK_SECRET_KEY=
STRIPE_SECRET_KEY=
DATABASE_URL=

# New for Chat Bot
NEXT_PUBLIC_CHAT_BOT_ENABLED=true
CHAT_BOT_MAX_TOKENS=4096
CHAT_BOT_TEMPERATURE=0.7
KNOWLEDGE_BASE_EMBEDDING_MODEL=claude-3-haiku-20240307
CRAWL_SCHEDULE=0 2 * * * # Daily at 2 AM
```

**CI/CD Pipeline**:
1. Run TypeScript type checks
2. Run linting (ESLint)
3. Run unit tests
4. Run E2E tests
5. Build Next.js production bundle
6. Deploy to Vercel staging
7. Run smoke tests
8. Deploy to production

---

### 15. Documentation Requirements
**Objective**: Comprehensive documentation for maintenance and future development.

**Documentation to Create**:
1. **README_CHATBOT.md**: Overview of chat bot architecture
2. **API_DOCS.md**: API route specifications with examples
3. **KNOWLEDGE_BASE_SETUP.md**: How to configure and update KB
4. **TROUBLESHOOTING.md**: Common issues and solutions
5. **DEPLOYMENT_GUIDE.md**: Step-by-step production deployment
6. **USER_GUIDE.md**: How to use the chat bot (for customers)
7. **ADMIN_GUIDE.md**: Dashboard usage for support team
8. **PROMPT_ENGINEERING.md**: System prompt details and tuning guide

---

## 🏗️ Implementation Phases

### Phase 1: Foundation (Week 1)
- Set up database schema extensions
- Implement basic chat interface (UI only)
- Create API routes for conversation CRUD
- Integrate Clerk authentication

### Phase 2: AI Integration (Week 2)
- Integrate Anthropic Claude API
- Implement streaming responses
- Build basic prompt engineering
- Add conversation history

### Phase 3: Stripe Integration (Week 3)
- Connect to Stripe customer data
- Implement payment status checks
- Build customer context injection
- Add subscription-aware responses

### Phase 4: Knowledge Base (Week 4)
- Build website crawler
- Implement vector search
- Generate embeddings
- Connect KB to bot responses

### Phase 5: Polish & Testing (Week 5)
- Add advanced features (sentiment analysis, etc.)
- Implement analytics dashboard
- Comprehensive testing
- Performance optimization

### Phase 6: Production Deployment (Week 6)
- Security audit
- Load testing
- Staged rollout
- Monitoring setup

---

## ✅ Success Criteria

**Bot Performance**:
- 90%+ of questions answered without escalation
- <2 second average response time
- 80%+ customer satisfaction rating
- <5% escalation rate

**Business Impact**:
- 50% reduction in support ticket volume
- 24/7 instant support availability
- Improved customer retention (track churn rate)
- Increased self-service subscription management

**Technical Quality**:
- 99.99% uptime
- Zero security vulnerabilities
- Full test coverage (>80%)
- TypeScript strict mode compliance

---

## 📦 Deliverables

1. **Working Chat Bot**: Fully functional on app.afilo.io
2. **Knowledge Base**: Crawled and indexed website content
3. **Stripe Integration**: Real-time payment status checks
4. **Admin Dashboard**: Analytics and conversation management
5. **Documentation**: Complete setup and maintenance guides
6. **Test Suite**: Comprehensive automated tests
7. **Deployment Pipeline**: Automated CI/CD workflow

---

## 🚀 Get Started

**Your first step**: Begin by creating the database schema extensions and setting up the basic chat interface component. Use the existing ShadCN UI patterns and ensure Clerk authentication is properly integrated from day one.

**Remember**: This is an enterprise product handling sensitive customer data. Security, reliability, and compliance are non-negotiable. Build with production-quality code from the start, not "MVP shortcuts" that need refactoring later.

**Tech Stack Adherence**: Always use `pnpm` (never npm), maintain TypeScript strict mode, follow existing patterns in the codebase, and integrate seamlessly with Clerk + Stripe + Neon PostgreSQL.

