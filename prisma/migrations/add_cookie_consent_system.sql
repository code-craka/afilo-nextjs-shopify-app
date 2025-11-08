-- Cookie Consent Management System Migration
-- Implements CCPA, PIPEDA, UK GDPR, and Australia Privacy Act compliance
-- Created: January 30, 2025

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table 1: Main cookie consent records
CREATE TABLE cookie_consent_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- User Identification
  clerk_user_id VARCHAR(255), -- Clerk user ID for authenticated users (NULL for anonymous)
  session_id VARCHAR(255) NOT NULL, -- Browser fingerprint for anonymous tracking

  -- Consent Preferences (Granular Categories)
  essential_cookies BOOLEAN DEFAULT TRUE NOT NULL, -- Always true (required for platform functionality)
  analytics_cookies BOOLEAN DEFAULT FALSE NOT NULL, -- Google Analytics, Vercel Analytics
  marketing_cookies BOOLEAN DEFAULT FALSE NOT NULL, -- Future advertising pixels, remarketing
  preferences_cookies BOOLEAN DEFAULT FALSE NOT NULL, -- UI preferences, theme, language

  -- Consent Metadata
  consent_method VARCHAR(50) NOT NULL, -- 'explicit_accept', 'explicit_reject', 'settings_update', 'banner_dismiss'
  consent_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  consent_version VARCHAR(50) NOT NULL DEFAULT '1.0', -- Policy version at time of consent
  consent_source VARCHAR(20) DEFAULT 'web', -- 'web', 'mobile_app'

  -- Device/Browser Context (Audit Trail)
  ip_address INET, -- User IP address for geographic compliance
  user_agent TEXT, -- Browser information
  browser_language VARCHAR(10), -- Accept-Language header
  country_code VARCHAR(2), -- ISO 3166-1 alpha-2 country code
  region_code VARCHAR(10), -- State/province code

  -- Expiration Management
  expires_at TIMESTAMPTZ NOT NULL, -- 12 months from consent_timestamp
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  revoked_at TIMESTAMPTZ, -- When user explicitly revoked consent

  -- Audit Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Metadata (extensible JSON field)
  metadata JSONB
);

-- Table 2: Audit log for consent changes (compliance requirement)
CREATE TABLE cookie_consent_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consent_record_id UUID NOT NULL REFERENCES cookie_consent_records(id) ON DELETE CASCADE,

  -- Audit Event Details
  event_type VARCHAR(50) NOT NULL, -- 'consent_given', 'consent_updated', 'consent_revoked', 'consent_expired'
  previous_state JSONB, -- Before state for 'updated' events
  new_state JSONB NOT NULL, -- After state

  -- Change Context
  changed_by VARCHAR(50) NOT NULL DEFAULT 'user', -- 'user', 'system_expiration', 'admin'
  change_reason TEXT, -- Optional description of change
  ip_address INET, -- IP address when change occurred
  user_agent TEXT, -- Browser when change occurred

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table 3: Cookie policy versions (legal requirement tracking)
CREATE TABLE cookie_policy_versions (
  id SERIAL PRIMARY KEY,
  version VARCHAR(50) UNIQUE NOT NULL, -- '1.0', '1.1', '2.0'
  effective_date DATE NOT NULL,
  policy_content TEXT NOT NULL, -- Full HTML content of policy
  policy_summary TEXT, -- Brief summary of key changes
  changelog TEXT, -- Detailed changes from previous version
  is_current BOOLEAN DEFAULT FALSE NOT NULL, -- Only one version can be current
  requires_reconsent BOOLEAN DEFAULT FALSE, -- Whether existing users need to re-consent
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by VARCHAR(255) -- Admin user who created this version
);

-- Performance Indexes for cookie_consent_records
CREATE INDEX idx_consent_clerk_user ON cookie_consent_records(clerk_user_id) WHERE clerk_user_id IS NOT NULL;
CREATE INDEX idx_consent_session ON cookie_consent_records(session_id);
CREATE INDEX idx_consent_active_expires ON cookie_consent_records(is_active, expires_at) WHERE is_active = TRUE;
CREATE INDEX idx_consent_timestamp ON cookie_consent_records(consent_timestamp DESC);
CREATE INDEX idx_consent_country ON cookie_consent_records(country_code) WHERE country_code IS NOT NULL;
CREATE INDEX idx_consent_method ON cookie_consent_records(consent_method);
CREATE INDEX idx_consent_version ON cookie_consent_records(consent_version);

-- Performance Indexes for cookie_consent_audit_log
CREATE INDEX idx_audit_consent_record ON cookie_consent_audit_log(consent_record_id);
CREATE INDEX idx_audit_event_type ON cookie_consent_audit_log(event_type);
CREATE INDEX idx_audit_created ON cookie_consent_audit_log(created_at DESC);
CREATE INDEX idx_audit_changed_by ON cookie_consent_audit_log(changed_by);

-- Performance Indexes for cookie_policy_versions
CREATE INDEX idx_policy_version ON cookie_policy_versions(version);
CREATE INDEX idx_policy_current ON cookie_policy_versions(is_current) WHERE is_current = TRUE;
CREATE INDEX idx_policy_effective ON cookie_policy_versions(effective_date DESC);

-- Triggers for automatic updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cookie_consent_records_updated_at
    BEFORE UPDATE ON cookie_consent_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Constraint: Only one current policy version allowed
CREATE UNIQUE INDEX idx_policy_single_current ON cookie_policy_versions(is_current) WHERE is_current = TRUE;

-- Constraint: Ensure consent expiration is in the future when created
ALTER TABLE cookie_consent_records
ADD CONSTRAINT chk_consent_expires_future
CHECK (expires_at > consent_timestamp);

-- Constraint: Revoked consent must have revoked_at timestamp
ALTER TABLE cookie_consent_records
ADD CONSTRAINT chk_revoked_timestamp
CHECK ((is_active = TRUE AND revoked_at IS NULL) OR (is_active = FALSE AND revoked_at IS NOT NULL));

-- Insert initial cookie policy version
INSERT INTO cookie_policy_versions (
  version,
  effective_date,
  policy_content,
  policy_summary,
  changelog,
  is_current,
  requires_reconsent,
  created_by
) VALUES (
  '1.0',
  CURRENT_DATE,
  '<h1>Cookie Policy</h1><p>Initial cookie policy for Afilo platform compliance with CCPA, PIPEDA, UK GDPR, and Australia Privacy Act.</p>',
  'Initial cookie policy establishing consent framework for analytics, marketing, and preference cookies.',
  'Initial version - establishes cookie consent categories and legal compliance framework.',
  TRUE,
  FALSE,
  'system'
);

-- Create a view for easy consent analytics (admin dashboard)
CREATE VIEW consent_analytics AS
SELECT
  DATE_TRUNC('day', consent_timestamp) as consent_date,
  COUNT(*) as total_consents,
  COUNT(*) FILTER (WHERE analytics_cookies = TRUE) as analytics_opt_ins,
  COUNT(*) FILTER (WHERE marketing_cookies = TRUE) as marketing_opt_ins,
  COUNT(*) FILTER (WHERE preferences_cookies = TRUE) as preferences_opt_ins,
  COUNT(*) FILTER (WHERE consent_method = 'explicit_accept') as explicit_accepts,
  COUNT(*) FILTER (WHERE consent_method = 'explicit_reject') as explicit_rejects,
  COUNT(DISTINCT clerk_user_id) FILTER (WHERE clerk_user_id IS NOT NULL) as authenticated_users,
  COUNT(*) FILTER (WHERE clerk_user_id IS NULL) as anonymous_users,
  ROUND(
    (COUNT(*) FILTER (WHERE analytics_cookies = TRUE) * 100.0 / COUNT(*)), 2
  ) as analytics_opt_in_rate
FROM cookie_consent_records
WHERE is_active = TRUE
GROUP BY DATE_TRUNC('day', consent_timestamp)
ORDER BY consent_date DESC;

-- Comments for documentation
COMMENT ON TABLE cookie_consent_records IS 'Main table storing user cookie consent preferences and metadata for CCPA/PIPEDA/UK GDPR compliance';
COMMENT ON TABLE cookie_consent_audit_log IS 'Audit trail for all consent changes, required for legal compliance and dispute resolution';
COMMENT ON TABLE cookie_policy_versions IS 'Version control for cookie policies, tracks changes and reconsent requirements';
COMMENT ON VIEW consent_analytics IS 'Pre-aggregated analytics view for admin dashboard performance';

COMMENT ON COLUMN cookie_consent_records.essential_cookies IS 'Always TRUE - required cookies for authentication, security, and core functionality';
COMMENT ON COLUMN cookie_consent_records.analytics_cookies IS 'Google Analytics, Vercel Analytics - user can opt-out';
COMMENT ON COLUMN cookie_consent_records.marketing_cookies IS 'Advertising pixels, remarketing - user can opt-out';
COMMENT ON COLUMN cookie_consent_records.preferences_cookies IS 'UI theme, language preferences - user can opt-out';
COMMENT ON COLUMN cookie_consent_records.expires_at IS '12-month expiration per legal best practices - user will be re-prompted';

-- Final verification query
DO $$
BEGIN
  RAISE NOTICE 'Cookie consent system migration completed successfully!';
  RAISE NOTICE 'Tables created: cookie_consent_records, cookie_consent_audit_log, cookie_policy_versions';
  RAISE NOTICE 'Indexes created: 14 total for optimal query performance';
  RAISE NOTICE 'Initial policy version 1.0 inserted and marked as current';
  RAISE NOTICE 'Consent analytics view created for admin dashboard';
END $$;