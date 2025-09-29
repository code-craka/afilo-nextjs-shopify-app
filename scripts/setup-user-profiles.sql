-- User profiles table for Afilo Enterprise authentication system
CREATE TABLE IF NOT EXISTS user_profiles (
  id SERIAL PRIMARY KEY,
  clerk_user_id VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  oauth_signup BOOLEAN DEFAULT FALSE,
  subscription_tier VARCHAR(50) DEFAULT 'free',
  company VARCHAR(255),
  job_title VARCHAR(255),
  phone VARCHAR(50),
  avatar_url TEXT,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_clerk_user_id ON user_profiles(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_tier ON user_profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at);

-- User subscription history table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id SERIAL PRIMARY KEY,
  user_profile_id INTEGER REFERENCES user_profiles(id) ON DELETE CASCADE,
  subscription_tier VARCHAR(50) NOT NULL,
  price_paid DECIMAL(10,2),
  billing_period VARCHAR(20), -- 'monthly', 'annual'
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'trial'
  shopify_subscription_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for subscription table
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_profile_id ON user_subscriptions(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_shopify_id ON user_subscriptions(shopify_subscription_id);

-- User activity log table
CREATE TABLE IF NOT EXISTS user_activity_log (
  id SERIAL PRIMARY KEY,
  user_profile_id INTEGER REFERENCES user_profiles(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL, -- 'login', 'logout', 'subscription_change', 'purchase', etc.
  activity_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for activity log
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_profile_id ON user_activity_log(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_activity_type ON user_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON user_activity_log(created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing (optional)
-- INSERT INTO user_profiles (clerk_user_id, email, first_name, last_name, subscription_tier, oauth_signup)
-- VALUES
--   ('test_user_1', 'john.doe@example.com', 'John', 'Doe', 'professional', false),
--   ('test_user_2', 'jane.smith@company.com', 'Jane', 'Smith', 'enterprise', true);

-- Display table information
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name IN ('user_profiles', 'user_subscriptions', 'user_activity_log')
ORDER BY table_name, ordinal_position;