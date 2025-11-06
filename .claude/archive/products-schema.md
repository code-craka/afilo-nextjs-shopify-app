# Products Schema

Digital marketplace product data model with complex licensing and pricing structures.

## Core Tables

### products
Main product information:
- **id**: UUID primary key
- **handle**: Unique slug for URLs
- **title**: Display name
- **description**: Product description (text + HTML)
- **base_price**: Starting price in cents
- **product_type**: Category (e.g., "Digital Tool", "Template")
- **vendor**: Creator/company (default: "Afilo")
- **tags**: Array of searchable tags
- **tech_stack**: Array of technologies used
- **stripe_product_id**: Stripe integration link

### product_variants
Licensing and pricing options:
- **product_id**: Links to parent product
- **title**: Variant name (e.g., "Personal License")
- **license_type**: "Personal", "Commercial", "Enterprise"
- **max_seats**: Maximum users allowed
- **license_terms**: JSON object with permissions
- **price**: Variant-specific pricing
- **stripe_price_id**: Stripe price integration

### product_pricing_tiers
Volume/feature-based pricing:
- **product_id** + **variant_id**: Links to specific variant
- **tier_name**: Display name
- **minimum_quantity** / **maximum_quantity**: Quantity rules
- **price**: Tier-specific pricing
- **features**: Array of included features
- **user_limits**: JSON with min/max user constraints

### product_collections
Product categorization:
- **handle**: URL-friendly identifier
- **title**: Collection name
- **description**: Category description
- Links via product_collection_products junction table

## License Terms Structure

```json
{
  "teamUse": false,
  "commercialUse": true,
  "extendedSupport": false,
  "sourceCodeIncluded": true,
  "customizationAllowed": true,
  "redistributionAllowed": false
}
```

## Pricing Strategy

1. **Base Price**: Starting point for product
2. **Variant Pricing**: License-specific pricing
3. **Tiered Pricing**: Volume discounts
4. **Price Multipliers**: Dynamic pricing adjustments

## Stripe Integration

- **Sync Strategy**: Local products sync with Stripe
- **Product Mapping**: stripe_product_id links products
- **Price Mapping**: stripe_price_id for each variant
- **Webhook Updates**: Keep pricing in sync

## Query Patterns

### Get Product with All Options
```typescript
const product = await prisma.products.findUnique({
  where: { handle: 'design-toolkit' },
  include: {
    product_variants: {
      where: { available_for_sale: true },
      include: {
        product_pricing_tiers: {
          orderBy: { minimum_quantity: 'asc' }
        }
      }
    },
    product_collection_products: {
      include: {
        product_collections: true
      }
    }
  }
});
```

### Search Products by Tags
```typescript
const products = await prisma.products.findMany({
  where: {
    tags: {
      hasSome: ['React', 'TypeScript']
    },
    available_for_sale: true
  }
});
```

## Indexes for Performance

- **handle**: Unique URLs
- **stripe_product_id**: Stripe sync
- **tags**: GIN index for array searches
- **tech_stack**: GIN index for filtering
- **product_type**: Category filtering
- **vendor**: Publisher filtering

## Data Validation Rules

- **Prices**: Must be positive decimals
- **Handles**: URL-safe, unique strings
- **License Types**: Predefined enum values
- **Tags/Tech Stack**: Standardized taxonomy
- **User Limits**: Logical min <= max constraints