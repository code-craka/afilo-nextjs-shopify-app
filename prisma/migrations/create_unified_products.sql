-- Unified Products Table
-- Stores products from both Shopify and Stripe with sync metadata

CREATE TABLE IF NOT EXISTS unified_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Core Product Information
  name VARCHAR(255) NOT NULL,
  description TEXT,
  base_price INTEGER NOT NULL, -- in cents
  currency VARCHAR(3) DEFAULT 'USD',

  -- Shopify Integration
  shopify_product_id VARCHAR(255),
  shopify_variant_id VARCHAR(255),
  shopify_handle VARCHAR(255),
  shopify_synced_at TIMESTAMPTZ,

  -- Stripe Integration
  stripe_product_id VARCHAR(255),
  stripe_price_monthly VARCHAR(255),
  stripe_price_annual VARCHAR(255),
  stripe_synced_at TIMESTAMPTZ,

  -- Product Metadata
  features JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  images JSONB DEFAULT '[]'::jsonb,

  -- Availability Control
  available_on_shopify BOOLEAN DEFAULT true,
  available_on_stripe BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,

  -- Categorization
  tier VARCHAR(50), -- professional, business, enterprise
  user_limit VARCHAR(50),
  product_type VARCHAR(100),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_shopify_product UNIQUE(shopify_product_id),
  CONSTRAINT unique_stripe_product UNIQUE(stripe_product_id),
  CONSTRAINT valid_price CHECK (base_price >= 0)
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_unified_shopify_id ON unified_products(shopify_product_id) WHERE shopify_product_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_unified_stripe_id ON unified_products(stripe_product_id) WHERE stripe_product_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_unified_handle ON unified_products(shopify_handle) WHERE shopify_handle IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_unified_active ON unified_products(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_unified_tier ON unified_products(tier) WHERE tier IS NOT NULL;

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_unified_products_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER unified_products_updated_at
  BEFORE UPDATE ON unified_products
  FOR EACH ROW
  EXECUTE FUNCTION update_unified_products_timestamp();

-- Comments
COMMENT ON TABLE unified_products IS 'Unified product catalog syncing Shopify and Stripe products';
COMMENT ON COLUMN unified_products.shopify_product_id IS 'Shopify product GID (e.g., gid://shopify/Product/123)';
COMMENT ON COLUMN unified_products.stripe_product_id IS 'Stripe product ID (e.g., prod_abc123)';
COMMENT ON COLUMN unified_products.base_price IS 'Base price in cents for calculations';
COMMENT ON COLUMN unified_products.available_on_shopify IS 'Whether product can be purchased via Shopify checkout';
COMMENT ON COLUMN unified_products.available_on_stripe IS 'Whether product can be purchased via Stripe subscriptions';
