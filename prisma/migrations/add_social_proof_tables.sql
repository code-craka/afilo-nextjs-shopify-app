-- Migration: Add Social Proof Tables
-- Created: 2025-01-08
-- Purpose: Track purchase counts, social proof metrics, and testimonials for conversion optimization

-- Product purchase counts and social proof metrics
CREATE TABLE IF NOT EXISTS product_social_proof (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(255) NOT NULL UNIQUE,
    product_handle VARCHAR(255) NOT NULL,

    -- Purchase metrics
    purchases_24h INTEGER DEFAULT 0 NOT NULL,
    purchases_7d INTEGER DEFAULT 0 NOT NULL,
    purchases_30d INTEGER DEFAULT 0 NOT NULL,
    purchases_total INTEGER DEFAULT 0 NOT NULL,

    -- Viewing metrics (simulated for now)
    current_viewers INTEGER DEFAULT 0 NOT NULL,
    views_24h INTEGER DEFAULT 0 NOT NULL,

    -- Social proof
    company_count INTEGER DEFAULT 0 NOT NULL,
    verified_purchases INTEGER DEFAULT 0 NOT NULL,

    -- Popularity indicators
    is_trending BOOLEAN DEFAULT FALSE,
    is_bestseller BOOLEAN DEFAULT FALSE,

    -- Stock simulation (for urgency)
    stock_level INTEGER DEFAULT 999 NOT NULL,
    stock_warning_threshold INTEGER DEFAULT 10 NOT NULL,

    -- Timestamps
    last_purchase_at TIMESTAMP WITH TIME ZONE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Indexes
    CONSTRAINT unique_product_id UNIQUE (product_id),
    CONSTRAINT unique_product_handle UNIQUE (product_handle)
);

-- Product testimonials and reviews
CREATE TABLE IF NOT EXISTS product_testimonials (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(255) NOT NULL,
    product_handle VARCHAR(255) NOT NULL,

    -- Testimonial content
    customer_name VARCHAR(255) NOT NULL,
    customer_company VARCHAR(255),
    customer_role VARCHAR(255),
    customer_avatar_url TEXT,

    -- Review
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    content TEXT NOT NULL,

    -- Verification
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    purchase_date TIMESTAMP WITH TIME ZONE,

    -- Visibility
    is_featured BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sale countdown timers
CREATE TABLE IF NOT EXISTS product_sale_timers (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(255) NOT NULL,
    product_handle VARCHAR(255) NOT NULL,

    -- Sale details
    sale_title VARCHAR(255) NOT NULL,
    discount_percentage INTEGER CHECK (discount_percentage >= 0 AND discount_percentage <= 100),

    -- Timing
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ends_at TIMESTAMP WITH TIME ZONE NOT NULL,

    -- Display
    is_active BOOLEAN DEFAULT TRUE,
    show_timer BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Ensure valid date range
    CONSTRAINT valid_date_range CHECK (ends_at > starts_at)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_social_proof_product_id ON product_social_proof(product_id);
CREATE INDEX IF NOT EXISTS idx_social_proof_product_handle ON product_social_proof(product_handle);
CREATE INDEX IF NOT EXISTS idx_social_proof_trending ON product_social_proof(is_trending) WHERE is_trending = TRUE;
CREATE INDEX IF NOT EXISTS idx_social_proof_bestseller ON product_social_proof(is_bestseller) WHERE is_bestseller = TRUE;

CREATE INDEX IF NOT EXISTS idx_testimonials_product_id ON product_testimonials(product_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_product_handle ON product_testimonials(product_handle);
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON product_testimonials(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON product_testimonials(is_approved) WHERE is_approved = TRUE;

CREATE INDEX IF NOT EXISTS idx_sale_timers_product_id ON product_sale_timers(product_id);
CREATE INDEX IF NOT EXISTS idx_sale_timers_active ON product_sale_timers(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_sale_timers_ends_at ON product_sale_timers(ends_at);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
DROP TRIGGER IF EXISTS update_product_social_proof_updated_at ON product_social_proof;
CREATE TRIGGER update_product_social_proof_updated_at
    BEFORE UPDATE ON product_social_proof
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_testimonials_updated_at ON product_testimonials;
CREATE TRIGGER update_product_testimonials_updated_at
    BEFORE UPDATE ON product_testimonials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_sale_timers_updated_at ON product_sale_timers;
CREATE TRIGGER update_product_sale_timers_updated_at
    BEFORE UPDATE ON product_sale_timers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing (optional - can be removed for production)
-- TODO: Replace with real data after deployment
INSERT INTO product_social_proof (product_id, product_handle, purchases_24h, purchases_7d, purchases_30d, purchases_total, current_viewers, company_count, verified_purchases, is_trending, is_bestseller)
VALUES
    ('sample-product-1', 'sample-product-1', 12, 87, 342, 1250, 8, 127, 1180, true, true),
    ('sample-product-2', 'sample-product-2', 5, 34, 156, 680, 3, 67, 640, false, true),
    ('sample-product-3', 'sample-product-3', 18, 95, 401, 1580, 12, 203, 1520, true, false)
ON CONFLICT (product_id) DO NOTHING;

-- Comment: This migration creates tables for social proof features
-- Run with: psql $DATABASE_URL -f prisma/migrations/add_social_proof_tables.sql
