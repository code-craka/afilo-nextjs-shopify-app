-- ================================================
-- Cart Items Table Migration
-- ================================================
-- Purpose: Persistent shopping cart with abandoned cart tracking
-- Author: Afilo Development Team
-- Date: 2025-10-13
-- ================================================

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User Reference (Clerk User ID)
  user_id TEXT NOT NULL,

  -- Product Information (from Shopify)
  product_id TEXT NOT NULL,
  variant_id TEXT NOT NULL,
  title TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  license_type TEXT NOT NULL CHECK (license_type IN ('personal', 'commercial')),
  image_url TEXT,

  -- Cart Status Tracking
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'purchased', 'abandoned')),

  -- Timestamps
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  abandoned_at TIMESTAMP WITH TIME ZONE,
  purchased_at TIMESTAMP WITH TIME ZONE,

  -- Stripe Integration
  stripe_session_id TEXT,

  -- Audit Fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- Indexes for Performance
-- ================================================

-- Index for getting user's active cart items (most common query)
CREATE INDEX IF NOT EXISTS idx_cart_items_user_status
  ON cart_items(user_id, status)
  WHERE status = 'active';

-- Index for abandoned cart queries
CREATE INDEX IF NOT EXISTS idx_cart_items_abandoned
  ON cart_items(user_id, abandoned_at)
  WHERE status = 'abandoned';

-- Index for purchase history
CREATE INDEX IF NOT EXISTS idx_cart_items_purchased
  ON cart_items(user_id, purchased_at)
  WHERE status = 'purchased';

-- Index for product lookups
CREATE INDEX IF NOT EXISTS idx_cart_items_product
  ON cart_items(product_id, variant_id);

-- Index for cleanup/analytics (oldest items)
CREATE INDEX IF NOT EXISTS idx_cart_items_created_at
  ON cart_items(created_at);

-- ================================================
-- Triggers for Auto-Update
-- ================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_cart_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_cart_items_updated_at();

-- Auto-update last_modified timestamp
CREATE OR REPLACE FUNCTION update_cart_items_last_modified()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.quantity IS DISTINCT FROM NEW.quantity OR
      OLD.license_type IS DISTINCT FROM NEW.license_type) THEN
    NEW.last_modified = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cart_items_last_modified
  BEFORE UPDATE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_cart_items_last_modified();

-- ================================================
-- Comments for Documentation
-- ================================================

COMMENT ON TABLE cart_items IS 'Persistent shopping cart with abandoned cart tracking';
COMMENT ON COLUMN cart_items.user_id IS 'Clerk user ID (not database foreign key)';
COMMENT ON COLUMN cart_items.status IS 'Cart item status: active (in cart), purchased (completed), abandoned (left > 30 mins)';
COMMENT ON COLUMN cart_items.abandoned_at IS 'Timestamp when cart was marked as abandoned (30+ mins inactive)';
COMMENT ON COLUMN cart_items.stripe_session_id IS 'Stripe checkout session ID when purchased';

-- ================================================
-- Verification Query (run after migration)
-- ================================================

-- SELECT
--   table_name,
--   column_name,
--   data_type,
--   is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'cart_items'
-- ORDER BY ordinal_position;
