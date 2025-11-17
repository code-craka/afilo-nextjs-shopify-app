#!/bin/bash

# Status Dashboard - Real-time system overview
# Displays comprehensive status of Afilo Marketplace production environment

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'
BOLD='\033[1m'

# Icons
CHECK="✅"
WARNING="⚠️ "
ERROR="❌"
INFO="ℹ️ "

clear

echo -e "${BOLD}${CYAN}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║           AFILO MARKETPLACE - PRODUCTION STATUS                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo -e "${BLUE}📅 $(date '+%A, %B %d, %Y - %H:%M:%S %Z')${NC}"
echo ""

# ==========================================
# APPLICATION STATUS
# ==========================================
echo -e "${BOLD}${MAGENTA}🚀 APPLICATION STATUS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if pm2 list | grep -q "afilo-app.*online"; then
    echo -e "${CHECK} PM2 Process: ${GREEN}RUNNING${NC}"

    # Get PM2 details
    UPTIME=$(pm2 info afilo-app | grep "uptime" | awk '{print $3, $4}' | head -1)
    RESTARTS=$(pm2 info afilo-app | grep "restarts" | awk '{print $3}' | head -1)
    MEMORY=$(pm2 info afilo-app | grep "memory" | awk '{print $3}' | head -1)
    CPU=$(pm2 info afilo-app | grep "cpu" | awk '{print $3}' | head -1)

    echo -e "   ${INFO}Uptime: ${GREEN}${UPTIME}${NC}"
    echo -e "   ${INFO}Restarts: ${YELLOW}${RESTARTS}${NC}"
    echo -e "   ${INFO}Memory: ${CYAN}${MEMORY}${NC}"
    echo -e "   ${INFO}CPU: ${CYAN}${CPU}${NC}"
else
    echo -e "${ERROR} PM2 Process: ${RED}STOPPED${NC}"
fi

# Check application health endpoint
if curl -f -s --max-time 5 http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "${CHECK} Health Endpoint: ${GREEN}HEALTHY${NC}"

    # Get detailed health info
    HEALTH_DATA=$(curl -s --max-time 5 http://localhost:3000/api/health 2>/dev/null)
    if command -v jq &> /dev/null && [ -n "$HEALTH_DATA" ]; then
        APP_STATUS=$(echo "$HEALTH_DATA" | jq -r '.status' 2>/dev/null || echo "unknown")
        DB_LATENCY=$(echo "$HEALTH_DATA" | jq -r '.latency.database' 2>/dev/null || echo "N/A")
        APP_UPTIME=$(echo "$HEALTH_DATA" | jq -r '.system.uptime' 2>/dev/null || echo "N/A")

        if [ "$DB_LATENCY" != "N/A" ] && [ "$DB_LATENCY" != "null" ]; then
            echo -e "   ${INFO}API Status: ${GREEN}${APP_STATUS}${NC}"
            echo -e "   ${INFO}DB Latency: ${CYAN}${DB_LATENCY}ms${NC}"
            echo -e "   ${INFO}App Uptime: ${CYAN}${APP_UPTIME}s${NC}"
        fi
    fi
else
    echo -e "${ERROR} Health Endpoint: ${RED}UNHEALTHY${NC}"
fi

# Check HTTPS
if curl -f -s --max-time 5 https://app.afilo.io > /dev/null 2>&1; then
    echo -e "${CHECK} HTTPS Access: ${GREEN}ACCESSIBLE${NC}"
else
    echo -e "${WARNING}HTTPS Access: ${YELLOW}CHECK REQUIRED${NC}"
fi

echo ""

# ==========================================
# SYSTEM RESOURCES
# ==========================================
echo -e "${BOLD}${MAGENTA}💻 SYSTEM RESOURCES${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# CPU Load
LOAD_AVG=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
echo -e "🖥️  CPU Load (1min): ${CYAN}${LOAD_AVG}${NC}"

# Memory Usage
MEMORY_TOTAL=$(free -h | awk '/^Mem:/ {print $2}')
MEMORY_USED=$(free -h | awk '/^Mem:/ {print $3}')
MEMORY_PERCENT=$(free | awk '/^Mem:/ {printf "%.0f", $3/$2 * 100.0}')

if [ "$MEMORY_PERCENT" -gt 85 ]; then
    MEMORY_COLOR=$RED
    MEMORY_ICON=$ERROR
elif [ "$MEMORY_PERCENT" -gt 70 ]; then
    MEMORY_COLOR=$YELLOW
    MEMORY_ICON=$WARNING
else
    MEMORY_COLOR=$GREEN
    MEMORY_ICON=$CHECK
fi

echo -e "${MEMORY_ICON} Memory: ${MEMORY_COLOR}${MEMORY_USED}${NC} / ${MEMORY_TOTAL} (${MEMORY_COLOR}${MEMORY_PERCENT}%${NC})"

# Disk Usage
DISK_USAGE=$(df /var/www 2>/dev/null | awk 'NR==2 {print $5}' | sed 's/%//')
DISK_USED=$(df -h /var/www 2>/dev/null | awk 'NR==2 {print $3}')
DISK_TOTAL=$(df -h /var/www 2>/dev/null | awk 'NR==2 {print $2}')

if [ -n "$DISK_USAGE" ]; then
    if [ "$DISK_USAGE" -gt 85 ]; then
        DISK_COLOR=$RED
        DISK_ICON=$ERROR
    elif [ "$DISK_USAGE" -gt 70 ]; then
        DISK_COLOR=$YELLOW
        DISK_ICON=$WARNING
    else
        DISK_COLOR=$GREEN
        DISK_ICON=$CHECK
    fi

    echo -e "${DISK_ICON} Disk: ${DISK_COLOR}${DISK_USED}${NC} / ${DISK_TOTAL} (${DISK_COLOR}${DISK_USAGE}%${NC})"
else
    echo -e "${INFO} Disk: ${YELLOW}N/A${NC}"
fi

# Network
if command -v ss &> /dev/null; then
    CONNECTIONS=$(ss -tn | grep -c ESTAB)
    echo -e "🌐 Network Connections: ${CYAN}${CONNECTIONS}${NC}"
fi

echo ""

# ==========================================
# DATABASE STATUS
# ==========================================
echo -e "${BOLD}${MAGENTA}🗄️  DATABASE STATUS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "./check-db-health.sh" ]; then
    ./check-db-health.sh 2>/dev/null | head -5
else
    echo -e "${INFO} Database: ${YELLOW}Health check script not found${NC}"
fi

echo ""

# ==========================================
# NGINX STATUS
# ==========================================
echo -e "${BOLD}${MAGENTA}🌐 WEB SERVER (NGINX)${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if systemctl is-active --quiet nginx 2>/dev/null; then
    echo -e "${CHECK} Nginx: ${GREEN}RUNNING${NC}"

    # Get Nginx info
    if [ -f /var/log/nginx/access.log ]; then
        REQUESTS_TODAY=$(grep "$(date +%d/%b/%Y)" /var/log/nginx/access.log 2>/dev/null | wc -l)
        echo -e "   ${INFO}Requests Today: ${CYAN}${REQUESTS_TODAY}${NC}"
    fi
else
    echo -e "${ERROR} Nginx: ${RED}STOPPED${NC}"
fi

echo ""

# ==========================================
# SSL CERTIFICATE
# ==========================================
echo -e "${BOLD}${MAGENTA}🔒 SSL CERTIFICATE${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v openssl &> /dev/null; then
    SSL_EXPIRY=$(echo | openssl s_client -servername app.afilo.io -connect app.afilo.io:443 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)

    if [ -n "$SSL_EXPIRY" ]; then
        EXPIRY_EPOCH=$(date -d "$SSL_EXPIRY" +%s 2>/dev/null || date -j -f "%b %d %H:%M:%S %Y %Z" "$SSL_EXPIRY" +%s 2>/dev/null)
        NOW_EPOCH=$(date +%s)
        DAYS_LEFT=$(( ($EXPIRY_EPOCH - $NOW_EPOCH) / 86400 ))

        if [ "$DAYS_LEFT" -lt 7 ]; then
            SSL_COLOR=$RED
            SSL_ICON=$ERROR
        elif [ "$DAYS_LEFT" -lt 30 ]; then
            SSL_COLOR=$YELLOW
            SSL_ICON=$WARNING
        else
            SSL_COLOR=$GREEN
            SSL_ICON=$CHECK
        fi

        echo -e "${SSL_ICON} Certificate Expires: ${SSL_COLOR}${DAYS_LEFT} days${NC} (${SSL_EXPIRY})"
    else
        echo -e "${INFO} Certificate: ${YELLOW}Unable to check${NC}"
    fi
else
    echo -e "${INFO} OpenSSL not installed"
fi

echo ""

# ==========================================
# RECENT LOGS
# ==========================================
echo -e "${BOLD}${MAGENTA}📋 RECENT ACTIVITY${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f /var/www/afilo/logs/combined.log ]; then
    echo -e "${INFO} Last 3 log entries:"
    tail -3 /var/www/afilo/logs/combined.log 2>/dev/null | sed 's/^/   /' || echo "   No recent logs"
else
    echo -e "${INFO} No logs found"
fi

echo ""

# ==========================================
# QUICK ACTIONS
# ==========================================
echo -e "${BOLD}${MAGENTA}⚡ QUICK ACTIONS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${INFO} View logs:       ${CYAN}pm2 logs afilo-app${NC}"
echo -e "${INFO} Restart app:     ${CYAN}pm2 restart afilo-app${NC}"
echo -e "${INFO} Deploy updates:  ${CYAN}./scripts/deploy.sh${NC}"
echo -e "${INFO} Check database:  ${CYAN}./check-db-health.sh${NC}"
echo -e "${INFO} Monitor system:  ${CYAN}pm2 monit${NC}"

echo ""
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
