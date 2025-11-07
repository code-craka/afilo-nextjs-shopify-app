-- ========================================
-- STRIPE CONNECT INTEGRATION MIGRATION
-- ========================================
-- This migration adds support for Stripe Connect marketplace platform
-- Following existing patterns: UUID primary keys, TIMESTAMPTZ, composite indexes
--
-- Tables Created:
-- 1. stripe_connect_accounts - Connected account tracking
-- 2. marketplace_transfers - Platform-to-merchant transfers
-- 3. connect_account_sessions - Embedded component sessions
--
-- Author: Afilo Development Team
-- Date: 2025-11-07
-- ========================================

-- Enable UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- TABLE 1: Stripe Connect Accounts
-- ========================================
-- Tracks all Connected accounts (Standard, Express, Custom)
-- for marketplace vendors/merchants
CREATE TABLE IF NOT EXISTS stripe_connect_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id VARCHAR(255) NOT NULL,
  stripe_account_id VARCHAR(255) NOT NULL UNIQUE,
  account_type VARCHAR(50) NOT NULL CHECK (account_type IN ('standard', 'express', 'custom')),
  business_type VARCHAR(50) CHECK (business_type IN ('individual', 'company')),
  country VARCHAR(2), -- ISO country code (US, CA, GB, etc.)
  default_currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  email VARCHAR(255),
  business_name VARCHAR(255),
  capabilities JSONB DEFAULT '{}',
  requirements JSONB DEFAULT '{}',
  charges_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  payouts_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  details_submitted BOOLEAN NOT NULL DEFAULT FALSE,
  onboarding_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (onboarding_status IN ('pending', 'in_progress', 'completed', 'restricted')),
  onboarding_link TEXT,
  onboarding_expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for stripe_connect_accounts
CREATE INDEX IF NOT EXISTS idx_connect_accounts_clerk_user ON stripe_connect_accounts(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_connect_accounts_stripe_id ON stripe_connect_accounts(stripe_account_id);
CREATE INDEX IF NOT EXISTS idx_connect_accounts_status ON stripe_connect_accounts(onboarding_status);
CREATE INDEX IF NOT EXISTS idx_connect_accounts_capabilities ON stripe_connect_accounts(charges_enabled, payouts_enabled);
CREATE INDEX IF NOT EXISTS idx_connect_accounts_created ON stripe_connect_accounts(created_at DESC);

-- ========================================
-- TABLE 2: Marketplace Transfers
-- ========================================
-- Tracks all platform-to-merchant fund transfers
CREATE TABLE IF NOT EXISTS marketplace_transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_transfer_id VARCHAR(255) NOT NULL UNIQUE,
  destination_account_id UUID NOT NULL REFERENCES stripe_connect_accounts(id) ON DELETE CASCADE,
  stripe_destination_id VARCHAR(255) NOT NULL, -- Stripe's account ID for quick lookups
  source_transaction VARCHAR(255), -- Original payment intent or charge ID
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  application_fee_amount DECIMAL(10, 2) CHECK (application_fee_amount >= 0),
  transfer_group VARCHAR(255), -- Group related transfers
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'canceled')),
  failure_code VARCHAR(100),
  failure_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for marketplace_transfers
CREATE INDEX IF NOT EXISTS idx_transfers_destination ON marketplace_transfers(destination_account_id);
CREATE INDEX IF NOT EXISTS idx_transfers_stripe_id ON marketplace_transfers(stripe_transfer_id);
CREATE INDEX IF NOT EXISTS idx_transfers_status ON marketplace_transfers(status);
CREATE INDEX IF NOT EXISTS idx_transfers_created ON marketplace_transfers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transfers_source ON marketplace_transfers(source_transaction);

-- ========================================
-- TABLE 3: Connect Account Sessions
-- ========================================
-- Tracks embedded component sessions for security and analytics
CREATE TABLE IF NOT EXISTS connect_account_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES stripe_connect_accounts(id) ON DELETE CASCADE,
  stripe_account_id VARCHAR(255) NOT NULL,
  client_secret TEXT NOT NULL UNIQUE,
  components TEXT[] NOT NULL DEFAULT '{}', -- Array of component types: payments, payouts, documents
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for connect_account_sessions
CREATE INDEX IF NOT EXISTS idx_sessions_account ON connect_account_sessions(account_id);
CREATE INDEX IF NOT EXISTS idx_sessions_stripe_account ON connect_account_sessions(stripe_account_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON connect_account_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_created ON connect_account_sessions(created_at DESC);

-- ========================================
-- AUDIT TRAIL SETUP
-- ========================================
-- Add updated_at trigger for stripe_connect_accounts
CREATE OR REPLACE FUNCTION update_stripe_connect_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER stripe_connect_accounts_updated_at
BEFORE UPDATE ON stripe_connect_accounts
FOR EACH ROW
EXECUTE FUNCTION update_stripe_connect_accounts_updated_at();

-- Add updated_at trigger for marketplace_transfers
CREATE OR REPLACE FUNCTION update_marketplace_transfers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER marketplace_transfers_updated_at
BEFORE UPDATE ON marketplace_transfers
FOR EACH ROW
EXECUTE FUNCTION update_marketplace_transfers_updated_at();

-- ========================================
-- COMMENTS FOR DOCUMENTATION
-- ========================================
COMMENT ON TABLE stripe_connect_accounts IS 'Tracks Stripe Connect accounts for marketplace vendors/merchants (Standard, Express, Custom types)';
COMMENT ON TABLE marketplace_transfers IS 'Tracks platform-to-merchant fund transfers with application fees and transfer groups';
COMMENT ON TABLE connect_account_sessions IS 'Tracks embedded component sessions for security and analytics';

COMMENT ON COLUMN stripe_connect_accounts.capabilities IS 'Stripe capabilities JSON: card_payments, transfers, etc.';
COMMENT ON COLUMN stripe_connect_accounts.requirements IS 'Outstanding requirements for account activation';
COMMENT ON COLUMN stripe_connect_accounts.onboarding_status IS 'Current onboarding state: pending, in_progress, completed, restricted';
COMMENT ON COLUMN marketplace_transfers.application_fee_amount IS 'Platform fee collected from this transfer';
COMMENT ON COLUMN marketplace_transfers.transfer_group IS 'Groups related transfers for reporting and reconciliation';
COMMENT ON COLUMN connect_account_sessions.components IS 'Array of embedded component types used in this session';

-- ========================================
-- GRANT PERMISSIONS (if using RLS)
-- ========================================
-- Note: Adjust these based on your RLS policies
-- GRANT SELECT, INSERT, UPDATE, DELETE ON stripe_connect_accounts TO authenticated;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON marketplace_transfers TO authenticated;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON connect_account_sessions TO authenticated;

-- ========================================
-- MIGRATION COMPLETE
-- ========================================
-- Next steps:
-- 1. Run: prisma generate (to update TypeScript types)
-- 2. Verify indexes: SELECT * FROM pg_indexes WHERE tablename LIKE '%connect%' OR tablename LIKE '%transfer%';
-- 3. Test queries with EXPLAIN ANALYZE
-- 4. Deploy to production
