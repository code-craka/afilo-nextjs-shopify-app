# Afilo Shopify Integration Module

**Load this when working on: Product catalog, cart, checkout, Shopify API**

## Shopify Configuration

- **Store**: fzjdsw-ma.myshopify.com
- **API**: Storefront API v2024.10
- **Client**: lib/shopify.ts with retry logic

## Digital Product Architecture

### ProductGrid Component (Enhanced)

**Key Features:**
- Smart tech stack detection (React, Python, AI, TypeScript)
- Dynamic product type badges (AI Tool, Template, Script, Plugin)
- License type indicators (Personal, Commercial, Extended, Enterprise)
- Version numbering and update indicators
- Documentation availability badges
- Live demo/preview buttons

**Digital Commerce Elements:**
- Instant download indicators
- No shipping/inventory elements
- License terms preview
- System requirements display
- Digital status indicators

### Product Data Structure

Products use Shopify metafields for enhanced attributes:
- Tech stack (JSON array)
- License types
- Version numbers
- Documentation links
- Demo availability

## Cart System

### Files
```
components/
├── DigitalCartWidget.tsx      # Advanced cart with licensing
└── DigitalProductGrid.tsx     # Cart-integrated grid

store/
└── digitalCart.ts             # Zustand cart state

hooks/
└── useDigitalCart.ts          # Cart operations
```

### Features
- License management per product
- Volume discounts (10-25% for bulk)
- Educational discounts (50% student, 30% teacher, 40% institution)
- Subscription pricing detection
- Secure cart validation

## API Integration

### Shopify Storefront GraphQL

**Key Operations:**
- Product queries with metafields
- Collection browsing
- Cart create/update/checkout
- Customer authentication

**Performance:**
- Response time: <200ms target
- Retry logic with exponential backoff
- Comprehensive error handling

### API Files
```
lib/
└── shopify.ts                 # Main API client

types/
└── shopify.ts                 # TypeScript definitions
```

## Testing Pages

- `/test-shopify` - API testing and debugging
- `/products` - Full product catalog
- `/` - Homepage with product grid

---

**Related Modules:**
- Enterprise features: `.claude/CLAUDE-ENTERPRISE.md`
- Development workflows: `.claude/CLAUDE-WORKFLOWS.md`
