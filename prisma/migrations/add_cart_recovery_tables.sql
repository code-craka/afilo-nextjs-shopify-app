-- Cart Recovery System Database Migration
-- Phase 2 Feature: Enhanced E-commerce Features

-- Cart Recovery Campaigns Table
CREATE TABLE IF NOT EXISTS cart_recovery_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    trigger_delay_hours INTEGER DEFAULT 24, -- Hours after abandonment
    email_template TEXT NOT NULL,
    subject_line VARCHAR(255) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    discount_code VARCHAR(50),

    -- Performance tracking
    total_sent INTEGER DEFAULT 0,
    total_opened INTEGER DEFAULT 0,
    total_clicked INTEGER DEFAULT 0,
    total_converted INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cart Recovery Sessions Table (tracks individual cart recovery attempts)
CREATE TABLE IF NOT EXISTS cart_recovery_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_session_id VARCHAR(255) NOT NULL, -- Groups cart_items by session
    clerk_user_id VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255),

    -- Cart details
    total_items INTEGER DEFAULT 0,
    total_value DECIMAL(10,2) DEFAULT 0,
    cart_data JSONB, -- Snapshot of cart items

    -- Abandonment tracking
    created_at TIMESTAMPTZ DEFAULT NOW(),
    abandoned_at TIMESTAMPTZ,
    last_activity TIMESTAMPTZ DEFAULT NOW(),

    -- Recovery tracking
    status VARCHAR(50) DEFAULT 'active', -- active, abandoned, recovered, expired
    recovery_emails_sent INTEGER DEFAULT 0,
    last_email_sent_at TIMESTAMPTZ,
    recovered_at TIMESTAMPTZ,

    -- Recovery performance
    email_opened BOOLEAN DEFAULT false,
    email_clicked BOOLEAN DEFAULT false,
    recovery_discount_used BOOLEAN DEFAULT false,
    recovery_revenue DECIMAL(10,2) DEFAULT 0,

    UNIQUE(cart_session_id, clerk_user_id)
);

-- Cart Recovery Email Logs Table
CREATE TABLE IF NOT EXISTS cart_recovery_email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recovery_session_id UUID NOT NULL REFERENCES cart_recovery_sessions(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES cart_recovery_campaigns(id) ON DELETE CASCADE,

    -- Email details
    recipient_email VARCHAR(255) NOT NULL,
    subject_line VARCHAR(255) NOT NULL,
    email_content TEXT,
    discount_code VARCHAR(50),

    -- Tracking
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    converted_at TIMESTAMPTZ,

    -- Status
    delivery_status VARCHAR(50) DEFAULT 'sent', -- sent, delivered, opened, clicked, bounced, failed
    error_message TEXT,

    -- Analytics
    cart_value_at_send DECIMAL(10,2),
    recovery_revenue DECIMAL(10,2) DEFAULT 0
);

-- Cart Recovery Analytics Table (daily aggregates)
CREATE TABLE IF NOT EXISTS cart_recovery_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,

    -- Daily metrics
    carts_abandoned INTEGER DEFAULT 0,
    carts_recovered INTEGER DEFAULT 0,
    emails_sent INTEGER DEFAULT 0,
    emails_opened INTEGER DEFAULT 0,
    emails_clicked INTEGER DEFAULT 0,

    -- Revenue metrics
    potential_revenue DECIMAL(10,2) DEFAULT 0,
    recovered_revenue DECIMAL(10,2) DEFAULT 0,
    recovery_rate DECIMAL(5,2) DEFAULT 0,

    -- Performance metrics
    open_rate DECIMAL(5,2) DEFAULT 0,
    click_rate DECIMAL(5,2) DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cart_recovery_sessions_user ON cart_recovery_sessions(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_cart_recovery_sessions_status ON cart_recovery_sessions(status);
CREATE INDEX IF NOT EXISTS idx_cart_recovery_sessions_abandoned ON cart_recovery_sessions(abandoned_at);
CREATE INDEX IF NOT EXISTS idx_cart_recovery_sessions_created ON cart_recovery_sessions(created_at);

CREATE INDEX IF NOT EXISTS idx_cart_recovery_email_logs_session ON cart_recovery_email_logs(recovery_session_id);
CREATE INDEX IF NOT EXISTS idx_cart_recovery_email_logs_campaign ON cart_recovery_email_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_cart_recovery_email_logs_sent ON cart_recovery_email_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_cart_recovery_email_logs_status ON cart_recovery_email_logs(delivery_status);

CREATE INDEX IF NOT EXISTS idx_cart_recovery_analytics_date ON cart_recovery_analytics(date);

-- Create triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cart_recovery_campaigns_updated_at
    BEFORE UPDATE ON cart_recovery_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_recovery_analytics_updated_at
    BEFORE UPDATE ON cart_recovery_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default cart recovery campaigns
INSERT INTO cart_recovery_campaigns (name, description, trigger_delay_hours, email_template, subject_line, discount_percent, discount_code)
VALUES
(
    'First Reminder - 24 Hours',
    'Initial cart recovery email sent 24 hours after abandonment',
    24,
    '<h2>You left something behind!</h2>
    <p>Hi {{user_name}},</p>
    <p>We noticed you left some great items in your cart. Don''t miss out on these digital products!</p>

    <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0;">
        {{cart_items}}
    </div>

    <p><strong>Total: ${{cart_total}}</strong></p>

    <p>Complete your purchase now and get instant access to your digital products.</p>

    <a href="{{checkout_url}}" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Complete Purchase</a>

    <p>This offer is valid for 7 days. Don''t wait!</p>',
    'You left something in your cart!',
    0,
    NULL
),
(
    'Second Reminder - 72 Hours',
    'Follow-up cart recovery email with 10% discount',
    72,
    '<h2>Still thinking it over?</h2>
    <p>Hi {{user_name}},</p>
    <p>Your cart is still waiting for you! As a special thank you for your interest, we''re offering you 10% off your purchase.</p>

    <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0;">
        {{cart_items}}
    </div>

    <p><strong>Original Total: ${{cart_total}}</strong></p>
    <p><strong>Your Price: ${{discounted_total}} (10% off!)</strong></p>

    <p>Use code <strong>{{discount_code}}</strong> at checkout to get your discount.</p>

    <a href="{{checkout_url}}" style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Get 10% Off Now</a>

    <p>This exclusive offer expires in 3 days.</p>',
    'Save 10% on your abandoned cart!',
    10,
    'SAVE10NOW'
),
(
    'Final Reminder - 168 Hours (7 days)',
    'Last chance email with 15% discount',
    168,
    '<h2>Last chance to save!</h2>
    <p>Hi {{user_name}},</p>
    <p>This is your final reminder about the items in your cart. We''re offering our biggest discount - 15% off your entire purchase!</p>

    <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0;">
        {{cart_items}}
    </div>

    <p><strong>Original Total: ${{cart_total}}</strong></p>
    <p><strong>Final Price: ${{discounted_total}} (15% off!)</strong></p>

    <p>Use code <strong>{{discount_code}}</strong> at checkout.</p>

    <a href="{{checkout_url}}" style="background: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Save 15% - Final Offer</a>

    <p><em>This offer expires in 24 hours and won''t be repeated.</em></p>',
    'Final chance: 15% off your cart expires soon!',
    15,
    'FINAL15OFF'
) ON CONFLICT DO NOTHING;

-- Function to mark carts as abandoned after inactivity
CREATE OR REPLACE FUNCTION mark_abandoned_carts()
RETURNS INTEGER AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    -- Mark cart sessions as abandoned if no activity for 24+ hours and not already marked
    UPDATE cart_recovery_sessions
    SET
        status = 'abandoned',
        abandoned_at = NOW()
    WHERE
        status = 'active'
        AND last_activity < NOW() - INTERVAL '24 hours'
        AND abandoned_at IS NULL;

    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    RETURN affected_rows;
END;
$$ LANGUAGE plpgsql;

-- Create a function to update daily analytics
CREATE OR REPLACE FUNCTION update_cart_recovery_analytics()
RETURNS VOID AS $$
BEGIN
    INSERT INTO cart_recovery_analytics (
        date,
        carts_abandoned,
        carts_recovered,
        emails_sent,
        emails_opened,
        emails_clicked,
        potential_revenue,
        recovered_revenue
    )
    SELECT
        CURRENT_DATE,
        COUNT(*) FILTER (WHERE status = 'abandoned' AND DATE(abandoned_at) = CURRENT_DATE),
        COUNT(*) FILTER (WHERE status = 'recovered' AND DATE(recovered_at) = CURRENT_DATE),
        (SELECT COUNT(*) FROM cart_recovery_email_logs WHERE DATE(sent_at) = CURRENT_DATE),
        (SELECT COUNT(*) FROM cart_recovery_email_logs WHERE DATE(opened_at) = CURRENT_DATE),
        (SELECT COUNT(*) FROM cart_recovery_email_logs WHERE DATE(clicked_at) = CURRENT_DATE),
        COALESCE(SUM(total_value) FILTER (WHERE status = 'abandoned' AND DATE(abandoned_at) = CURRENT_DATE), 0),
        COALESCE(SUM(recovery_revenue) FILTER (WHERE status = 'recovered' AND DATE(recovered_at) = CURRENT_DATE), 0)
    FROM cart_recovery_sessions
    ON CONFLICT (date) DO UPDATE SET
        carts_abandoned = EXCLUDED.carts_abandoned,
        carts_recovered = EXCLUDED.carts_recovered,
        emails_sent = EXCLUDED.emails_sent,
        emails_opened = EXCLUDED.emails_opened,
        emails_clicked = EXCLUDED.emails_clicked,
        potential_revenue = EXCLUDED.potential_revenue,
        recovered_revenue = EXCLUDED.recovered_revenue,
        updated_at = NOW();

    -- Update calculated rates
    UPDATE cart_recovery_analytics
    SET
        recovery_rate = CASE
            WHEN carts_abandoned > 0 THEN (carts_recovered::DECIMAL / carts_abandoned::DECIMAL) * 100
            ELSE 0
        END,
        open_rate = CASE
            WHEN emails_sent > 0 THEN (emails_opened::DECIMAL / emails_sent::DECIMAL) * 100
            ELSE 0
        END,
        click_rate = CASE
            WHEN emails_opened > 0 THEN (emails_clicked::DECIMAL / emails_opened::DECIMAL) * 100
            ELSE 0
        END,
        conversion_rate = CASE
            WHEN emails_sent > 0 THEN (carts_recovered::DECIMAL / emails_sent::DECIMAL) * 100
            ELSE 0
        END
    WHERE date = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;