-- Add role and purchase_type columns to user_profiles
-- Run this in Neon Database Console

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS purchase_type VARCHAR(20);

-- Create index for faster role lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Update existing subscription users to premium (if any)
UPDATE user_profiles
SET role = 'premium', purchase_type = 'subscription'
WHERE clerk_user_id IN (
  SELECT DISTINCT clerk_user_id
  FROM subscriptions
  WHERE status = 'active'
);

-- Verify migration
SELECT role, purchase_type, COUNT(*)
FROM user_profiles
GROUP BY role, purchase_type;
