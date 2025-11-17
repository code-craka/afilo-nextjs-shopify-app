#!/bin/bash

# Database Migration Verification Script
# Verifies all tables from Prisma schema exist in the database

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Icons
CHECK="✅"
ERROR="❌"
INFO="ℹ️ "

# Load environment variables
if [ -f .env.production.local ]; then
    set -a
    source <(grep -v '^#' .env.production.local | grep -v '^$')
    set +a
elif [ -f .env.local ]; then
    set -a
    source <(grep -v '^#' .env.local | grep -v '^$')
    set +a
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🗄️  DATABASE MIGRATION VERIFICATION${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${ERROR} DATABASE_URL not set in environment"
    echo -e "${INFO} Please set DATABASE_URL or ensure .env.production.local exists"
    exit 1
fi

# Extract database info
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\).*/\1/p')
echo -e "${INFO} Database Host: ${BLUE}${DB_HOST}${NC}"
echo ""

# Test database connectivity
echo -e "${BLUE}Step 1: Testing Database Connectivity${NC}"
if ! psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${ERROR} Cannot connect to database"
    exit 1
fi
echo -e "${CHECK} Database connection: ${GREEN}SUCCESS${NC}"
echo ""

# All tables from Prisma schema
CORE_TABLES=(
    # Core Product & User Tables
    "user_profiles"
    "products"
    "product_variants"
    "product_collections"
    "product_collection_products"
    "product_pricing_tiers"
    "unified_products"

    # Cart & Subscriptions
    "cart_items"
    "subscriptions"
    "user_subscriptions"
    "downloads"

    # Social Proof & Marketing
    "product_social_proof"
    "product_testimonials"
    "product_sale_timers"

    # Cart Recovery System
    "cart_recovery_campaigns"
    "cart_recovery_sessions"
    "cart_recovery_email_logs"
    "cart_recovery_analytics"

    # Chat Bot System
    "chat_conversations"
    "chat_messages"
    "knowledge_base"
    "bot_analytics"

    # Enterprise Monitoring
    "api_monitoring"
    "audit_logs"
    "webhook_events"
    "rate_limit_tracking"

    # Cookie Consent
    "cookie_consent_logs"
    "cookie_preferences"
    "consent_audit_trail"

    # Stripe Connect Marketplace
    "stripe_connect_accounts"
    "marketplace_transfers"
    "connect_account_sessions"

    # ACH Authorization (if migrated)
    "ach_authorizations"
    "ach_verification_logs"
    "ach_audit_trail"

    # Payments
    "payment_transactions"

    # Activity Logs
    "user_activity_log"
)

echo -e "${BLUE}Step 2: Verifying Tables (${#CORE_TABLES[@]} tables)${NC}"
echo ""

MISSING_TABLES=()
EXISTING_TABLES=()
TOTAL_RECORDS=0

for table in "${CORE_TABLES[@]}"; do
    # Check if table exists
    TABLE_EXISTS=$(psql "$DATABASE_URL" -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '$table');" 2>/dev/null | tr -d ' ')

    if [ "$TABLE_EXISTS" = "t" ]; then
        # Get record count
        COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM \"$table\";" 2>/dev/null | tr -d ' ')

        if [ -n "$COUNT" ]; then
            echo -e "${CHECK} ${table}: ${GREEN}EXISTS${NC} (${COUNT} records)"
            EXISTING_TABLES+=("$table")
            TOTAL_RECORDS=$((TOTAL_RECORDS + COUNT))
        else
            echo -e "${CHECK} ${table}: ${GREEN}EXISTS${NC}"
            EXISTING_TABLES+=("$table")
        fi
    else
        echo -e "${ERROR} ${table}: ${RED}MISSING${NC}"
        MISSING_TABLES+=("$table")
    fi
done

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 SUMMARY${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${INFO} Total Tables Expected: ${BLUE}${#CORE_TABLES[@]}${NC}"
echo -e "${CHECK} Tables Found: ${GREEN}${#EXISTING_TABLES[@]}${NC}"
echo -e "${INFO} Total Records: ${BLUE}${TOTAL_RECORDS}${NC}"

if [ ${#MISSING_TABLES[@]} -gt 0 ]; then
    echo -e "${ERROR} Missing Tables: ${RED}${#MISSING_TABLES[@]}${NC}"
    echo ""
    echo -e "${RED}Missing tables:${NC}"
    for table in "${MISSING_TABLES[@]}"; do
        echo -e "  - ${table}"
    done
    echo ""
    echo -e "${INFO} To migrate missing tables, run:"
    echo -e "  ${BLUE}psql \"\$DATABASE_URL\" -f prisma/migrations/xxx_add_digital_products_ecosystem/migration.sql${NC}"
    echo ""
    exit 1
else
    echo ""
    echo -e "${CHECK} ${GREEN}All database tables are migrated successfully!${NC}"
    echo ""
fi

# Check for Prisma migrations table
echo -e "${BLUE}Step 3: Checking Migration History${NC}"
MIGRATIONS_TABLE=$(psql "$DATABASE_URL" -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '_prisma_migrations');" 2>/dev/null | tr -d ' ')

if [ "$MIGRATIONS_TABLE" = "t" ]; then
    MIGRATION_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM \"_prisma_migrations\";" 2>/dev/null | tr -d ' ')
    echo -e "${CHECK} Migration tracking: ${GREEN}ENABLED${NC} (${MIGRATION_COUNT} migrations)"

    # Show last migration
    LAST_MIGRATION=$(psql "$DATABASE_URL" -t -c "SELECT migration_name FROM \"_prisma_migrations\" ORDER BY finished_at DESC LIMIT 1;" 2>/dev/null | xargs)
    if [ -n "$LAST_MIGRATION" ]; then
        echo -e "${INFO} Last migration: ${BLUE}${LAST_MIGRATION}${NC}"
    fi
else
    echo -e "${INFO} Migration tracking: ${YELLOW}Not using Prisma Migrate${NC}"
    echo -e "${INFO} (Using manual SQL migrations)"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CHECK} ${GREEN}Database verification completed successfully!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

exit 0
