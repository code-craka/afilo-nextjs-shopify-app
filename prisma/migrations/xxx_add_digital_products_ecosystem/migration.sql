-- Add digital products ecosystem tables
-- This migration extends the existing product catalog to support:
-- - Multiple product categories (Enterprise SaaS, Developer Tools, BI, Education, Templates)
-- - Customer segmentation (Enterprise, Business, Developer, Education)
-- - Licensing models (Subscription, One-time Lifetime, One-time Annual)
-- - Product access tracking for Enterprise customers
-- - Webhook event tracking for idempotency

-- Create enum types for product categories, segments, and license types
CREATE TYPE product_category AS ENUM (
  'ENTERPRISE_SAAS',
  'DEVELOPER_TOOLS',
  'BUSINESS_INTELLIGENCE',
  'EDUCATION_TRAINING',
  'TEMPLATES_ASSETS'
);

CREATE TYPE customer_segment AS ENUM (
  'ENTERPRISE',
  'BUSINESS',
  'DEVELOPER',
  'EDUCATION'
);

CREATE TYPE license_type_enum AS ENUM (
  'SUBSCRIPTION',
  'ONE_TIME_LIFETIME',
  'ONE_TIME_ANNUAL'
);

-- Extend products table with new fields
ALTER TABLE products
ADD COLUMN IF NOT EXISTS category product_category DEFAULT 'ENTERPRISE_SAAS',
ADD COLUMN IF NOT EXISTS segment customer_segment,
ADD COLUMN IF NOT EXISTS license_type license_type_enum DEFAULT 'SUBSCRIPTION',
ADD COLUMN IF NOT EXISTS minimum_price_cents INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS maximum_price_cents INT,
ADD COLUMN IF NOT EXISTS target_company_size VARCHAR(50),
ADD COLUMN IF NOT EXISTS compliance_level VARCHAR(50),
ADD COLUMN IF NOT EXISTS annual_pricing_discount_percent DECIMAL(5,2) DEFAULT 20.00,
ADD COLUMN IF NOT EXISTS is_featured_in_category BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS metadata_extended JSONB DEFAULT '{}';

-- Create index for product category and segment
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_segment ON products(segment);
CREATE INDEX IF NOT EXISTS idx_products_license_type ON products(license_type);

-- Create product_access table to track Enterprise customer access to all marketplace products
CREATE TABLE IF NOT EXISTS product_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id VARCHAR(255) NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  access_type VARCHAR(50) NOT NULL, -- 'enterprise_free', 'purchased', 'trial', 'coupon'
  granted_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  license_expiry_at TIMESTAMP, -- For 1-year licenses
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_access_user ON product_access(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_product_access_product ON product_access(product_id);
CREATE INDEX IF NOT EXISTS idx_product_access_user_product ON product_access(clerk_user_id, product_id);
CREATE INDEX IF NOT EXISTS idx_product_access_type ON product_access(access_type);

-- Create product_coupons table for managing discount codes
CREATE TABLE IF NOT EXISTS product_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  coupon_type VARCHAR(50) NOT NULL, -- 'enterprise', 'developer', 'seasonal', 'referral'
  discount_percent DECIMAL(5,2),
  discount_amount_cents INT,
  applicable_to_categories product_category[] DEFAULT '{}'::product_category[],
  applicable_to_segments customer_segment[] DEFAULT '{}'::customer_segment[],
  max_redemptions INT,
  current_redemptions INT DEFAULT 0,
  valid_from TIMESTAMP NOT NULL,
  valid_until TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON product_coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_coupon_type ON product_coupons(coupon_type);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_period ON product_coupons(valid_from, valid_until);

-- Create product_bundles table for cross-category bundles
CREATE TABLE IF NOT EXISTS product_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  bundle_type VARCHAR(50) NOT NULL, -- 'category_combo', 'learning_path', 'starter_pack'
  products JSONB NOT NULL, -- Array of {product_id, discount_percent}
  bundle_price_cents INT NOT NULL,
  individual_price_cents INT NOT NULL,
  savings_percent DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN individual_price_cents > 0
    THEN ROUND(((individual_price_cents - bundle_price_cents)::DECIMAL / individual_price_cents) * 100, 2)
    ELSE 0 END
  ) STORED,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bundles_type ON product_bundles(bundle_type);

-- Create stripe_events table for webhook idempotency
CREATE TABLE IF NOT EXISTS stripe_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id VARCHAR(255) NOT NULL UNIQUE,
  event_type VARCHAR(100) NOT NULL,
  processed_at TIMESTAMP DEFAULT NOW(),
  idempotency_key VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stripe_events_event_id ON stripe_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_stripe_events_type ON stripe_events(event_type);
CREATE INDEX IF NOT EXISTS idx_stripe_events_processed_at ON stripe_events(processed_at);

-- Create product_analytics table for tracking sales by segment
CREATE TABLE IF NOT EXISTS product_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  segment customer_segment NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  revenue_cents INT DEFAULT 0,
  unit_count INT DEFAULT 0,
  customer_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_product ON product_analytics(product_id);
CREATE INDEX IF NOT EXISTS idx_analytics_segment ON product_analytics(segment);
CREATE INDEX IF NOT EXISTS idx_analytics_period ON product_analytics(period_start, period_end);

-- Create customer_segment_profiles table to track customer segment membership
CREATE TABLE IF NOT EXISTS customer_segment_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id VARCHAR(255) NOT NULL UNIQUE,
  primary_segment customer_segment NOT NULL,
  highest_plan_tier VARCHAR(50), -- For enterprise: 'starter', 'professional', 'enterprise', 'fortune500'
  monthly_spend_cents INT DEFAULT 0,
  annual_spend_cents INT DEFAULT 0,
  is_enterprise_customer BOOLEAN DEFAULT FALSE,
  enterprise_access_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_segment_user ON customer_segment_profiles(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_customer_segment_primary ON customer_segment_profiles(primary_segment);
CREATE INDEX IF NOT EXISTS idx_customer_segment_enterprise ON customer_segment_profiles(is_enterprise_customer);

-- Create product_pricing_history table for tracking price changes
CREATE TABLE IF NOT EXISTS product_pricing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  old_price_cents INT,
  new_price_cents INT NOT NULL,
  change_reason VARCHAR(100),
  effective_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pricing_history_product ON product_pricing_history(product_id);
CREATE INDEX IF NOT EXISTS idx_pricing_history_effective_date ON product_pricing_history(effective_date);

-- Create triggers to automatically update customer segment when Enterprise subscription is purchased
CREATE OR REPLACE FUNCTION update_customer_segment_on_enterprise_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO customer_segment_profiles (clerk_user_id, primary_segment, is_enterprise_customer, enterprise_access_expires_at)
  VALUES (NEW.clerk_user_id, 'ENTERPRISE', TRUE, CURRENT_TIMESTAMP + INTERVAL '1 year')
  ON CONFLICT (clerk_user_id) DO UPDATE SET
    is_enterprise_customer = TRUE,
    primary_segment = 'ENTERPRISE',
    enterprise_access_expires_at = CURRENT_TIMESTAMP + INTERVAL '1 year';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Grant Afilo marketplace products to all Enterprise customers when subscription is created
CREATE OR REPLACE FUNCTION grant_enterprise_access_to_products()
RETURNS TRIGGER AS $$
DECLARE
  product_row RECORD;
BEGIN
  -- Grant access to all marketplace products (non-enterprise categories)
  FOR product_row IN
    SELECT id FROM products
    WHERE category != 'ENTERPRISE_SAAS'
  LOOP
    INSERT INTO product_access (clerk_user_id, product_id, access_type, granted_at)
    VALUES (NEW.clerk_user_id, product_row.id, 'enterprise_free', CURRENT_TIMESTAMP)
    ON CONFLICT DO NOTHING;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger when user subscription is created
-- Note: Link this to your actual subscription table update event

-- Add comments for documentation
COMMENT ON TABLE product_access IS 'Tracks which products each customer has access to and how they got it (enterprise free, purchased, trial, coupon)';
COMMENT ON TABLE product_coupons IS 'Manages discount codes for different customer segments and product categories';
COMMENT ON TABLE product_bundles IS 'Pre-packaged product combinations with bundle pricing';
COMMENT ON TABLE stripe_events IS 'Webhook event log for idempotency - prevents duplicate processing';
COMMENT ON TABLE product_analytics IS 'Revenue and sales tracking by product and customer segment';
COMMENT ON TABLE customer_segment_profiles IS 'Customer segment classification (Enterprise, Business, Developer, Education)';
COMMENT ON TABLE product_pricing_history IS 'Audit log of price changes for historical analysis';

-- Enable Row Level Security (optional, but recommended for user data)
ALTER TABLE product_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_segment_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_access (users can only see their own access)
CREATE POLICY product_access_select_policy ON product_access
  FOR SELECT
  USING (clerk_user_id = current_setting('app.current_user_id', TRUE) OR current_setting('app.is_admin', TRUE) = 'true');

-- RLS Policies for customer_segment_profiles (users can only see their own profile)
CREATE POLICY customer_segment_select_policy ON customer_segment_profiles
  FOR SELECT
  USING (clerk_user_id = current_setting('app.current_user_id', TRUE) OR current_setting('app.is_admin', TRUE) = 'true');
