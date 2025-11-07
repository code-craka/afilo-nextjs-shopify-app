-- ACH Authorization System Migration
-- NACHA Compliant - 7-Year Retention Required
-- Run this migration after updating Prisma schema

-- ACH Authorizations Table
CREATE TABLE IF NOT EXISTS ach_authorizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Customer Information
    clerk_user_id VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_ip_address VARCHAR(45),
    user_agent TEXT,

    -- Bank Account Information (encrypted)
    bank_account_last4 VARCHAR(4) NOT NULL,
    bank_routing_number TEXT NOT NULL, -- Encrypted
    bank_account_type VARCHAR(20) NOT NULL, -- 'checking' or 'savings'
    bank_name VARCHAR(255),

    -- Authorization Details
    authorization_type VARCHAR(20) NOT NULL, -- 'one_time', 'recurring', 'both'
    authorization_text TEXT NOT NULL,
    payment_amount DECIMAL(10,2),
    recurring_frequency VARCHAR(20), -- 'daily', 'weekly', 'monthly', 'yearly'
    recurring_max_amount DECIMAL(10,2),

    -- Consent Capture
    consent_method VARCHAR(50) NOT NULL, -- 'electronic_checkbox', 'electronic_signature', 'verbal'
    consent_timestamp TIMESTAMPTZ NOT NULL,
    consent_ip_address VARCHAR(45) NOT NULL,
    consent_user_agent TEXT NOT NULL,
    consent_signature_data TEXT,
    consent_recording_url TEXT,

    -- Transaction Context
    transaction_description TEXT NOT NULL,
    invoice_id VARCHAR(255),
    subscription_id VARCHAR(255),
    stripe_payment_method_id VARCHAR(255),
    stripe_mandate_id VARCHAR(255),

    -- Terms Displayed
    terms_version VARCHAR(50) NOT NULL,
    refund_policy_version VARCHAR(50) NOT NULL,
    tos_accepted BOOLEAN DEFAULT FALSE,
    privacy_accepted BOOLEAN DEFAULT FALSE,

    -- Revocation
    is_revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMPTZ,
    revocation_reason TEXT,

    -- Audit Trail
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- ACH Authorization Evidence Table
CREATE TABLE IF NOT EXISTS ach_authorization_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    authorization_id UUID NOT NULL REFERENCES ach_authorizations(id) ON DELETE CASCADE,

    -- Evidence Details
    evidence_type VARCHAR(100) NOT NULL,
    evidence_description TEXT NOT NULL,

    -- File Storage
    file_url TEXT,
    file_name VARCHAR(500),
    file_size INTEGER,
    file_type VARCHAR(100),

    -- Hash for integrity verification
    file_hash VARCHAR(64), -- SHA-256 hash

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ACH Dispute Inquiries Table
CREATE TABLE IF NOT EXISTS ach_dispute_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    authorization_id UUID REFERENCES ach_authorizations(id) ON DELETE SET NULL,

    -- Stripe Dispute Details
    stripe_dispute_id VARCHAR(255) UNIQUE NOT NULL,
    stripe_charge_id VARCHAR(255) NOT NULL,
    stripe_payment_intent_id VARCHAR(255),

    -- Inquiry Details
    inquiry_reason VARCHAR(255) NOT NULL,
    inquiry_date TIMESTAMPTZ NOT NULL,
    inquiry_status VARCHAR(50) NOT NULL, -- 'open', 'evidence_submitted', 'won', 'lost'

    -- Evidence Submission
    evidence_submitted_at TIMESTAMPTZ,
    evidence_documents JSONB DEFAULT '[]'::jsonb,

    -- Resolution
    resolved_at TIMESTAMPTZ,
    resolution VARCHAR(50),
    resolution_notes TEXT,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for ACH Authorizations
CREATE INDEX IF NOT EXISTS idx_ach_auth_user ON ach_authorizations(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_ach_auth_email ON ach_authorizations(customer_email);
CREATE INDEX IF NOT EXISTS idx_ach_auth_stripe_pm ON ach_authorizations(stripe_payment_method_id);
CREATE INDEX IF NOT EXISTS idx_ach_auth_timestamp ON ach_authorizations(consent_timestamp);
CREATE INDEX IF NOT EXISTS idx_ach_auth_revoked ON ach_authorizations(is_revoked);

-- Indexes for ACH Authorization Evidence
CREATE INDEX IF NOT EXISTS idx_ach_evidence_auth ON ach_authorization_evidence(authorization_id);
CREATE INDEX IF NOT EXISTS idx_ach_evidence_type ON ach_authorization_evidence(evidence_type);

-- Indexes for ACH Dispute Inquiries
CREATE INDEX IF NOT EXISTS idx_ach_dispute_stripe ON ach_dispute_inquiries(stripe_dispute_id);
CREATE INDEX IF NOT EXISTS idx_ach_dispute_auth ON ach_dispute_inquiries(authorization_id);
CREATE INDEX IF NOT EXISTS idx_ach_dispute_status ON ach_dispute_inquiries(inquiry_status);

-- Comments for documentation
COMMENT ON TABLE ach_authorizations IS 'NACHA compliant ACH authorization records - 7 year retention required';
COMMENT ON TABLE ach_authorization_evidence IS 'Supporting evidence for ACH authorizations - used for dispute protection';
COMMENT ON TABLE ach_dispute_inquiries IS 'Stripe dispute tracking with automatic evidence submission';

COMMENT ON COLUMN ach_authorizations.bank_routing_number IS 'Encrypted routing number - use encryption utilities';
COMMENT ON COLUMN ach_authorizations.authorization_text IS 'Full NACHA mandate text presented to customer';
COMMENT ON COLUMN ach_authorizations.consent_timestamp IS 'Timestamp when customer provided consent (critical for disputes)';

-- Deployment Instructions:
-- 1. Run: psql "$DATABASE_URL" -f prisma/migrations/add_ach_authorization_system.sql
-- 2. Run: npx prisma generate
-- 3. Verify tables created: \dt ach_*
