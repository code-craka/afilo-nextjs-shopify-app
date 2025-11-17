#!/bin/bash

# Database Health Check Script
# Tests connectivity, performance, and integrity of PostgreSQL database

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Icons
CHECK="✅"
WARNING="⚠️ "
ERROR="❌"
INFO="ℹ️ "

# Load environment variables
if [ -f .env.production.local ]; then
    export $(grep -v '^#' .env.production.local | xargs)
elif [ -f .env.local ]; then
    export $(grep -v '^#' .env.local | xargs)
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🗄️  DATABASE HEALTH CHECK${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${ERROR} DATABASE_URL not set in environment"
    exit 1
fi

# Extract database info (safely)
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\).*/\1/p')
echo -e "${INFO} Database Host: ${BLUE}${DB_HOST}${NC}"
echo ""

# ==========================================
# Test 1: Basic Connectivity
# ==========================================
echo -e "${BLUE}Test 1: Basic Connectivity${NC}"
START_TIME=$(date +%s%3N)

if psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    END_TIME=$(date +%s%3N)
    LATENCY=$((END_TIME - START_TIME))
    echo -e "${CHECK} Connection: ${GREEN}SUCCESS${NC} (${LATENCY}ms)"
else
    echo -e "${ERROR} Connection: ${RED}FAILED${NC}"
    exit 1
fi

# ==========================================
# Test 2: Query Performance
# ==========================================
echo -e "${BLUE}Test 2: Query Performance${NC}"
START_TIME=$(date +%s%3N)

if psql "$DATABASE_URL" -c "SELECT NOW();" > /dev/null 2>&1; then
    END_TIME=$(date +%s%3N)
    QUERY_LATENCY=$((END_TIME - START_TIME))

    if [ "$QUERY_LATENCY" -lt 100 ]; then
        echo -e "${CHECK} Query Speed: ${GREEN}EXCELLENT${NC} (${QUERY_LATENCY}ms)"
    elif [ "$QUERY_LATENCY" -lt 500 ]; then
        echo -e "${CHECK} Query Speed: ${GREEN}GOOD${NC} (${QUERY_LATENCY}ms)"
    elif [ "$QUERY_LATENCY" -lt 1000 ]; then
        echo -e "${WARNING}Query Speed: ${YELLOW}SLOW${NC} (${QUERY_LATENCY}ms)"
    else
        echo -e "${ERROR} Query Speed: ${RED}VERY SLOW${NC} (${QUERY_LATENCY}ms)"
    fi
else
    echo -e "${ERROR} Query: ${RED}FAILED${NC}"
fi

# ==========================================
# Test 3: Table Counts
# ==========================================
echo -e "${BLUE}Test 3: Critical Tables${NC}"

TABLES=("user_profiles" "products" "categories" "orders")

for table in "${TABLES[@]}"; do
    COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM \"$table\";" 2>/dev/null | tr -d ' ')

    if [ -n "$COUNT" ] && [ "$COUNT" -ge 0 ]; then
        echo -e "${CHECK} ${table}: ${GREEN}${COUNT} records${NC}"
    else
        echo -e "${WARNING}${table}: ${YELLOW}Unable to count${NC}"
    fi
done

# ==========================================
# Test 4: Recent Activity
# ==========================================
echo -e "${BLUE}Test 4: Recent Activity (24h)${NC}"

# Check recent orders
RECENT_ORDERS=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM orders WHERE \"createdAt\" > NOW() - INTERVAL '24 hours';" 2>/dev/null | tr -d ' ')
if [ -n "$RECENT_ORDERS" ]; then
    echo -e "${INFO} New Orders: ${GREEN}${RECENT_ORDERS}${NC}"
fi

# Check recent audit logs (if table exists)
RECENT_AUDITS=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM audit_logs WHERE timestamp > NOW() - INTERVAL '24 hours';" 2>/dev/null | tr -d ' ')
if [ -n "$RECENT_AUDITS" ]; then
    echo -e "${INFO} Audit Logs: ${GREEN}${RECENT_AUDITS}${NC}"
fi

# ==========================================
# Test 5: Connection Pool
# ==========================================
echo -e "${BLUE}Test 5: Active Connections${NC}"

ACTIVE_CONNECTIONS=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active';" 2>/dev/null | tr -d ' ')
TOTAL_CONNECTIONS=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM pg_stat_activity;" 2>/dev/null | tr -d ' ')

if [ -n "$ACTIVE_CONNECTIONS" ] && [ -n "$TOTAL_CONNECTIONS" ]; then
    echo -e "${INFO} Connections: ${GREEN}${ACTIVE_CONNECTIONS} active${NC} / ${TOTAL_CONNECTIONS} total"

    MAX_CONNECTIONS=$(psql "$DATABASE_URL" -t -c "SHOW max_connections;" 2>/dev/null | tr -d ' ')
    if [ -n "$MAX_CONNECTIONS" ]; then
        CONN_PERCENT=$((TOTAL_CONNECTIONS * 100 / MAX_CONNECTIONS))

        if [ "$CONN_PERCENT" -gt 80 ]; then
            echo -e "${WARNING}Connection Pool: ${YELLOW}${CONN_PERCENT}% used${NC}"
        else
            echo -e "${CHECK} Connection Pool: ${GREEN}${CONN_PERCENT}% used${NC}"
        fi
    fi
fi

# ==========================================
# Test 6: Database Size
# ==========================================
echo -e "${BLUE}Test 6: Database Size${NC}"

DB_SIZE=$(psql "$DATABASE_URL" -t -c "SELECT pg_size_pretty(pg_database_size(current_database()));" 2>/dev/null | tr -d ' ')
if [ -n "$DB_SIZE" ]; then
    echo -e "${INFO} Total Size: ${GREEN}${DB_SIZE}${NC}"
fi

# ==========================================
# Test 7: Slowest Queries (if pg_stat_statements enabled)
# ==========================================
echo -e "${BLUE}Test 7: Performance Monitoring${NC}"

SLOW_QUERIES=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM pg_stat_statements WHERE mean_exec_time > 1000 LIMIT 1;" 2>/dev/null | tr -d ' ')

if [ -n "$SLOW_QUERIES" ] && [ "$SLOW_QUERIES" != "0" ]; then
    echo -e "${WARNING}Slow Queries: ${YELLOW}${SLOW_QUERIES} queries > 1s${NC}"
elif [ -n "$SLOW_QUERIES" ]; then
    echo -e "${CHECK} Query Performance: ${GREEN}No slow queries${NC}"
else
    echo -e "${INFO} pg_stat_statements: ${YELLOW}Not enabled${NC}"
fi

# ==========================================
# Summary
# ==========================================
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CHECK} ${GREEN}Database health check completed${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

exit 0
