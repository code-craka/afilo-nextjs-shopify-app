-- AFILO ENTERPRISE MARKETPLACE DATABASE SCHEMA
-- Digital marketplace with authentication, subscriptions, and digital product delivery
-- Compatible with Neon DB (PostgreSQL)

-- Create database tables for the Afilo marketplace
-- This script should be executed in your Neon DB console

-- Users metadata (Clerk handles auth, we store business data)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  company_name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Active subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  shopify_order_id TEXT UNIQUE NOT NULL,
  shopify_customer_id TEXT,
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'trialing')),
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Download links and licenses
CREATE TABLE IF NOT EXISTS downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_title TEXT NOT NULL,
  download_url TEXT NOT NULL,
  license_key TEXT UNIQUE NOT NULL,
  download_count INTEGER DEFAULT 0,
  max_downloads INTEGER DEFAULT 10,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  last_downloaded_at TIMESTAMP
);

-- Payment events log
CREATE TABLE IF NOT EXISTS payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT,
  event_type TEXT NOT NULL,
  shopify_order_id TEXT,
  amount DECIMAL,
  status TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_shopify_order ON subscriptions(shopify_order_id);
CREATE INDEX IF NOT EXISTS idx_downloads_user ON downloads(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_downloads_license ON downloads(license_key);
CREATE INDEX IF NOT EXISTS idx_downloads_subscription ON downloads(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_user ON payment_events(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_order ON payment_events(shopify_order_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_clerk_id ON user_profiles(clerk_user_id);

-- Add updated_at trigger for subscriptions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE
    ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE
    ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing (optional)
-- INSERT INTO user_profiles (clerk_user_id, email, company_name) VALUES
-- ('user_test123', 'test@example.com', 'Test Company');

-- INSERT INTO subscriptions (
--   clerk_user_id, email, shopify_order_id, plan_id, plan_name,
--   amount, status, current_period_start, current_period_end
-- ) VALUES (
--   'user_test123', 'test@example.com', 'gid://shopify/Order/123456',
--   'professional', 'Professional Plan', 499.00, 'active',
--   NOW(), NOW() + INTERVAL '1 month'
-- );

-- Verify tables created successfully
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('user_profiles', 'subscriptions', 'downloads', 'payment_events');