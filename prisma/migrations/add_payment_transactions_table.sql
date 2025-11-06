-- Add payment_transactions table for webhook logging
-- This table tracks all payment events from Stripe webhooks

CREATE TABLE IF NOT EXISTS payment_transactions (
  id SERIAL PRIMARY KEY,
  stripe_payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
  customer_email VARCHAR(255),
  amount INTEGER NOT NULL, -- Amount in cents
  currency VARCHAR(3) NOT NULL DEFAULT 'usd',
  status VARCHAR(50) NOT NULL, -- 'processing', 'completed', 'failed', 'canceled', 'refunded'
  payment_method_type VARCHAR(50), -- 'card', 'ach', 'bank_transfer', etc.
  risk_level VARCHAR(20), -- 'normal', 'elevated', 'highest'
  failure_reason TEXT,
  cancellation_reason VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_payment_transactions_email ON payment_transactions(customer_email);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_payment_transactions_updated_at
    BEFORE UPDATE ON payment_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON payment_transactions TO neondb_owner;
GRANT USAGE, SELECT ON SEQUENCE payment_transactions_id_seq TO neondb_owner;

-- ========================================
-- Fraud Prevention Tables
-- ========================================

-- Table for tracking manual fraud reviews
CREATE TABLE IF NOT EXISTS fraud_reviews (
  id SERIAL PRIMARY KEY,
  stripe_review_id VARCHAR(255) UNIQUE NOT NULL,
  payment_intent_id VARCHAR(255),
  reason VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  priority VARCHAR(20) NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for tracking early fraud warnings
CREATE TABLE IF NOT EXISTS fraud_alerts (
  id SERIAL PRIMARY KEY,
  stripe_charge_id VARCHAR(255) NOT NULL,
  stripe_warning_id VARCHAR(255) UNIQUE NOT NULL,
  fraud_type VARCHAR(100),
  severity VARCHAR(20) NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  actionable BOOLEAN DEFAULT false,
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'resolved', 'dismissed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for fraud tables
CREATE INDEX IF NOT EXISTS idx_fraud_reviews_status ON fraud_reviews(status);
CREATE INDEX IF NOT EXISTS idx_fraud_reviews_priority ON fraud_reviews(priority);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_severity ON fraud_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_status ON fraud_alerts(status);

-- Add updated_at triggers for fraud tables
CREATE TRIGGER update_fraud_reviews_updated_at
    BEFORE UPDATE ON fraud_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fraud_alerts_updated_at
    BEFORE UPDATE ON fraud_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions for fraud tables
GRANT ALL PRIVILEGES ON fraud_reviews TO neondb_owner;
GRANT ALL PRIVILEGES ON fraud_alerts TO neondb_owner;
GRANT USAGE, SELECT ON SEQUENCE fraud_reviews_id_seq TO neondb_owner;
GRANT USAGE, SELECT ON SEQUENCE fraud_alerts_id_seq TO neondb_owner;