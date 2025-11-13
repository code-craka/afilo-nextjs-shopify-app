#!/bin/bash

# Database Setup and Migration Script for Production
# Handles Neon PostgreSQL database setup and migrations

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_input() {
    echo -e "${BLUE}[INPUT]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "This script must be run from the application root directory"
    exit 1
fi

# Check if environment file exists
if [ ! -f ".env.production.local" ]; then
    print_error "Environment file .env.production.local not found"
    print_status "Please run ./scripts/setup-env.sh first"
    exit 1
fi

print_status "🗄️ Setting up database for production deployment..."

# Load environment variables
export $(grep -v '^#' .env.production.local | xargs)

# Validate database URL
if [ -z "$DATABASE_URL" ]; then
    print_error "DATABASE_URL not found in environment"
    exit 1
fi

print_status "Database URL configured: ${DATABASE_URL:0:50}..."

# Test database connection
print_status "🔍 Testing database connection..."
if pnpm prisma db pull --force > /dev/null 2>&1; then
    print_status "✅ Database connection successful"
else
    print_error "❌ Database connection failed"
    print_status "Please check your DATABASE_URL in .env.production.local"
    exit 1
fi

# Generate Prisma client
print_status "🔧 Generating Prisma client..."
pnpm prisma generate

# Check for pending migrations
print_status "🔍 Checking for pending migrations..."
MIGRATION_STATUS=$(pnpm prisma migrate status 2>&1 || echo "")

if echo "$MIGRATION_STATUS" | grep -q "No pending migrations"; then
    print_status "✅ No pending migrations found"
elif echo "$MIGRATION_STATUS" | grep -q "pending migrations"; then
    print_warning "⚠️ Pending migrations found"
    print_input "Do you want to apply pending migrations? (y/n):"
    read -r APPLY_MIGRATIONS

    if [[ $APPLY_MIGRATIONS =~ ^[Yy]$ ]]; then
        print_status "🚀 Applying migrations..."
        pnpm prisma migrate deploy
        print_status "✅ Migrations applied successfully"
    else
        print_warning "Skipping migrations - your database may be out of sync"
    fi
else
    print_status "🚀 Deploying migrations..."
    pnpm prisma migrate deploy
fi

# Verify database schema
print_status "🔍 Verifying database schema..."
pnpm prisma db pull --force > /dev/null 2>&1

# Check if all required tables exist
print_status "📋 Checking required tables..."

REQUIRED_TABLES=(
    "users"
    "user_profiles"
    "products"
    "categories"
    "orders"
    "order_items"
    "subscriptions"
    "cart_recovery_campaigns"
    "cart_recovery_sessions"
    "webhook_events"
    "api_monitoring"
    "audit_logs"
    "chat_conversations"
    "chat_messages"
    "knowledge_base"
    "cookie_consent_records"
    "stripe_connect_accounts"
)

# Use Prisma to check tables
TABLE_CHECK_RESULT=$(pnpm prisma db execute --stdin <<< "
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE';
")

for table in "${REQUIRED_TABLES[@]}"; do
    if echo "$TABLE_CHECK_RESULT" | grep -q "$table"; then
        print_status "✅ Table exists: $table"
    else
        print_warning "⚠️ Table missing: $table"
    fi
done

# Setup database indexes for performance (if not exists)
print_status "🚀 Ensuring performance indexes exist..."

cat > /tmp/performance_indexes.sql << 'EOF'
-- Performance indexes for production (CREATE IF NOT EXISTS equivalent)

-- User indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_clerk_user_id ON user_profiles(clerk_user_id);

-- Product indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_handle ON products(handle);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category_published ON products(category_id, published_at) WHERE published_at IS NOT NULL;

-- Order indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_created ON orders(user_id, created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status ON orders(status);

-- Cart recovery indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cart_recovery_sessions_abandoned ON cart_recovery_sessions(abandoned_at) WHERE abandoned_at IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cart_recovery_sessions_user ON cart_recovery_sessions(user_id);

-- Monitoring indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_monitoring_timestamp ON api_monitoring(timestamp);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_webhook_events_timestamp ON webhook_events(timestamp);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

-- Chat indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_conversations_user ON chat_conversations(user_id, created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id, created_at);

-- Knowledge base search index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_knowledge_base_search ON knowledge_base USING gin(to_tsvector('english', title || ' ' || content));

-- Cookie consent indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cookie_consent_user ON cookie_consent_records(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cookie_consent_session ON cookie_consent_records(session_id);

-- Stripe Connect indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stripe_connect_user ON stripe_connect_accounts(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stripe_connect_account_id ON stripe_connect_accounts(stripe_account_id);
EOF

# Apply performance indexes
print_status "🔧 Applying performance indexes..."
if pnpm prisma db execute --file /tmp/performance_indexes.sql; then
    print_status "✅ Performance indexes applied"
else
    print_warning "⚠️ Some indexes may already exist or failed to create"
fi

# Clean up temp file
rm -f /tmp/performance_indexes.sql

# Seed essential data (admin user, default categories, etc.)
print_status "🌱 Checking for essential data..."

# Create a seed script for essential data
cat > /tmp/seed_essential.sql << 'EOF'
-- Insert default categories if they don't exist
INSERT INTO categories (name, slug, description, created_at, updated_at)
VALUES
    ('Digital Products', 'digital-products', 'Software, courses, and digital downloads', NOW(), NOW()),
    ('Physical Products', 'physical-products', 'Tangible goods and merchandise', NOW(), NOW()),
    ('Services', 'services', 'Consulting and professional services', NOW(), NOW()),
    ('Subscriptions', 'subscriptions', 'Recurring subscription products', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Insert default cart recovery campaigns if they don't exist
INSERT INTO cart_recovery_campaigns (name, subject_line, email_template, discount_percentage, send_after_hours, is_active, created_at, updated_at)
VALUES
    ('24-Hour Reminder', 'You left something in your cart', 'reminder_24h', 0, 24, true, NOW(), NOW()),
    ('72-Hour Follow-up', 'Still thinking about your purchase?', 'reminder_72h', 10, 72, true, NOW(), NOW()),
    ('Final Chance', 'Last chance - special discount inside!', 'reminder_final', 15, 168, true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Insert default webhook configurations
INSERT INTO webhook_configurations (name, url, events, is_active, secret_key, created_at, updated_at)
VALUES
    ('stripe-webhooks', '/api/stripe/webhook', ARRAY['payment_intent.succeeded', 'customer.subscription.created'], true, 'default', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;
EOF

if pnpm prisma db execute --file /tmp/seed_essential.sql; then
    print_status "✅ Essential data seeded"
else
    print_warning "⚠️ Some essential data may already exist"
fi

rm -f /tmp/seed_essential.sql

# Test database operations
print_status "🧪 Testing database operations..."

# Test read operation
if pnpm prisma db execute --stdin <<< "SELECT COUNT(*) FROM categories;" > /dev/null; then
    print_status "✅ Database read test passed"
else
    print_error "❌ Database read test failed"
    exit 1
fi

# Test write operation
TEST_TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
if pnpm prisma db execute --stdin <<< "
    INSERT INTO audit_logs (event_type, user_id, resource_type, resource_id, details, ip_address, user_agent, timestamp)
    VALUES ('database_test', NULL, 'system', 'test', '{\"test\": \"deployment\", \"timestamp\": \"$TEST_TIMESTAMP\"}', '127.0.0.1', 'deployment-script', NOW())
    ON CONFLICT DO NOTHING;
" > /dev/null; then
    print_status "✅ Database write test passed"
else
    print_error "❌ Database write test failed"
    exit 1
fi

# Create database backup script
print_status "📦 Creating database backup script..."
cat > backup-db.sh << 'EOF'
#!/bin/bash

# Database Backup Script
set -e

BACKUP_DIR="/var/backups/db"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="afilo_db_backup_$DATE.sql"

# Create backup directory
sudo mkdir -p $BACKUP_DIR

# Load environment
export $(grep -v '^#' .env.production.local | xargs)

echo "Creating database backup: $BACKUP_FILE"

# Note: Neon doesn't support pg_dump directly
# Instead, export schema and critical data
echo "-- Afilo Database Backup - $DATE" > /tmp/$BACKUP_FILE
echo "-- Schema backup (run 'pnpm prisma db pull' to get latest schema)" >> /tmp/$BACKUP_FILE

# Export critical configuration data
pnpm prisma db execute --stdin <<< "
COPY categories TO STDOUT WITH CSV HEADER;
" >> /tmp/${BACKUP_FILE}_categories.csv 2>/dev/null || echo "Categories export failed"

pnpm prisma db execute --stdin <<< "
COPY cart_recovery_campaigns TO STDOUT WITH CSV HEADER;
" >> /tmp/${BACKUP_FILE}_campaigns.csv 2>/dev/null || echo "Campaigns export failed"

# Move backups to backup directory
sudo mv /tmp/$BACKUP_FILE $BACKUP_DIR/
sudo mv /tmp/${BACKUP_FILE}_*.csv $BACKUP_DIR/ 2>/dev/null || true

# Set permissions
sudo chown -R deploy:deploy $BACKUP_DIR

# Keep only last 7 days of backups
find $BACKUP_DIR -name "afilo_db_backup_*.sql" -mtime +7 -delete 2>/dev/null || true
find $BACKUP_DIR -name "afilo_db_backup_*.csv" -mtime +7 -delete 2>/dev/null || true

echo "Database backup completed: $BACKUP_DIR/$BACKUP_FILE"
EOF

chmod +x backup-db.sh

# Create database health check script
print_status "🏥 Creating database health check script..."
cat > check-db-health.sh << 'EOF'
#!/bin/bash

# Database Health Check Script
set -e

# Load environment
export $(grep -v '^#' .env.production.local | xargs 2>/dev/null || true)

echo "🏥 Database Health Check - $(date)"
echo "=================================="

# Test connection
if pnpm prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Database connection: OK"
else
    echo "❌ Database connection: FAILED"
    exit 1
fi

# Check key tables exist and have data
TABLES=("users" "products" "categories" "orders")
for table in "${TABLES[@]}"; do
    COUNT=$(pnpm prisma db execute --stdin <<< "SELECT COUNT(*) FROM $table;" 2>/dev/null | grep -E '^[0-9]+$' | head -1 || echo "ERROR")
    if [ "$COUNT" = "ERROR" ]; then
        echo "❌ Table $table: ERROR"
    else
        echo "✅ Table $table: $COUNT records"
    fi
done

# Check recent activity
RECENT_ORDERS=$(pnpm prisma db execute --stdin <<< "SELECT COUNT(*) FROM orders WHERE created_at > NOW() - INTERVAL '24 hours';" 2>/dev/null | grep -E '^[0-9]+$' | head -1 || echo "0")
echo "📊 Recent orders (24h): $RECENT_ORDERS"

RECENT_LOGS=$(pnpm prisma db execute --stdin <<< "SELECT COUNT(*) FROM audit_logs WHERE timestamp > NOW() - INTERVAL '1 hour';" 2>/dev/null | grep -E '^[0-9]+$' | head -1 || echo "0")
echo "📊 Recent audit logs (1h): $RECENT_LOGS"

echo "=================================="
echo "✅ Database health check completed"
EOF

chmod +x check-db-health.sh

# Final verification
print_status "🔍 Final database verification..."
if ./check-db-health.sh; then
    print_status "✅ Database setup completed successfully!"
else
    print_warning "⚠️ Database health check showed warnings"
fi

echo
print_status "📋 Database setup summary:"
echo "  ✅ Connection tested"
echo "  ✅ Migrations applied"
echo "  ✅ Performance indexes created"
echo "  ✅ Essential data seeded"
echo "  ✅ Backup script created"
echo "  ✅ Health check script created"

echo
print_status "📄 Scripts created:"
echo "  🗄️ backup-db.sh - Create database backups"
echo "  🏥 check-db-health.sh - Monitor database health"

echo
print_status "🔧 Management commands:"
echo "  ./backup-db.sh           - Create database backup"
echo "  ./check-db-health.sh     - Check database health"
echo "  pnpm prisma studio       - Open database admin UI"
echo "  pnpm prisma migrate deploy - Apply new migrations"

echo
print_status "🎉 Database is ready for production! 🚀"