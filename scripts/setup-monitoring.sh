#!/bin/bash

# Monitoring and Logging Setup Script for Production
# Sets up comprehensive monitoring, logging, and alerting

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
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

APP_DIR="/var/www/afilo"
LOG_DIR="/var/log/afilo"
MONITOR_DIR="/var/lib/afilo-monitoring"

print_status "📊 Setting up production monitoring and logging..."

# Create necessary directories
print_status "📁 Creating monitoring directories..."
sudo mkdir -p "$LOG_DIR"
sudo mkdir -p "$MONITOR_DIR"
sudo chown -R deploy:deploy "$LOG_DIR"
sudo chown -R deploy:deploy "$MONITOR_DIR"

# Set up comprehensive system monitoring script
print_status "🔍 Creating system monitoring script..."

cat > "$APP_DIR/monitor-system.sh" << 'EOF'
#!/bin/bash

# Comprehensive System Monitoring Script
# Monitors system resources, application health, and performance

LOG_FILE="/var/log/afilo/system-monitor.log"
ALERT_FILE="/var/log/afilo/alerts.log"
METRICS_FILE="/var/log/afilo/metrics.log"
APP_NAME="afilo-app"
DOMAIN="${NEXT_PUBLIC_APP_URL:-https://your-domain.com}"

# Thresholds
CPU_THRESHOLD=80
MEMORY_THRESHOLD=85
DISK_THRESHOLD=80
RESPONSE_THRESHOLD=2000  # milliseconds

# Create log directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"

# Get current timestamp
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
DATE_ISO=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Function to log messages
log_message() {
    echo "[$TIMESTAMP] $1" >> "$LOG_FILE"
}

# Function to log alerts
log_alert() {
    echo "[$TIMESTAMP] ALERT: $1" >> "$ALERT_FILE"
    echo "[$TIMESTAMP] ALERT: $1" >> "$LOG_FILE"
}

# Function to log metrics in JSON format
log_metric() {
    echo "$1" >> "$METRICS_FILE"
}

log_message "Starting system monitoring check"

# System Resource Monitoring
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}' | head -1)
CPU_USAGE=${CPU_USAGE:-0}

MEMORY_INFO=$(free -m)
MEMORY_TOTAL=$(echo "$MEMORY_INFO" | awk '/Mem:/ {print $2}')
MEMORY_USED=$(echo "$MEMORY_INFO" | awk '/Mem:/ {print $3}')
MEMORY_PERCENTAGE=$(echo "$MEMORY_INFO" | awk '/Mem:/ {printf "%.0f", $3/$2 * 100.0}')

DISK_USAGE=$(df /var/www | awk 'NR==2 {print $5}' | sed 's/%//')
DISK_USAGE=${DISK_USAGE:-0}

LOAD_AVERAGE=$(uptime | awk '{print $10}' | sed 's/,//')

# Network monitoring
NETWORK_CONNECTIONS=$(ss -tuln | wc -l)
ACTIVE_CONNECTIONS=$(ss -t | grep ESTAB | wc -l)

# Application Health Monitoring
PM2_STATUS="unknown"
APP_UPTIME="0"
APP_RESTARTS="0"

if command -v pm2 >/dev/null 2>&1; then
    if pm2 list | grep -q "$APP_NAME.*online"; then
        PM2_STATUS="online"
        APP_UPTIME=$(pm2 show "$APP_NAME" | grep "uptime" | awk '{print $3 $4}' | head -1)
        APP_RESTARTS=$(pm2 show "$APP_NAME" | grep "restarts" | awk '{print $3}' | head -1)
    else
        PM2_STATUS="offline"
        log_alert "Application $APP_NAME is not running in PM2"
    fi
fi

# HTTP Health Check
HTTP_STATUS="unknown"
RESPONSE_TIME="0"

if [ "$PM2_STATUS" = "online" ]; then
    HEALTH_CHECK=$(curl -s -w "%{http_code},%{time_total}" -o /dev/null --max-time 10 http://localhost:3000/api/health 2>/dev/null || echo "000,0")
    HTTP_STATUS=$(echo "$HEALTH_CHECK" | cut -d',' -f1)
    RESPONSE_TIME_SECONDS=$(echo "$HEALTH_CHECK" | cut -d',' -f2)
    RESPONSE_TIME=$(echo "$RESPONSE_TIME_SECONDS * 1000" | bc 2>/dev/null | cut -d'.' -f1 2>/dev/null || echo "0")

    if [ "$HTTP_STATUS" != "200" ]; then
        log_alert "HTTP health check failed: Status $HTTP_STATUS"
    fi

    if [ "$RESPONSE_TIME" -gt "$RESPONSE_THRESHOLD" ]; then
        log_alert "Slow response time: ${RESPONSE_TIME}ms (threshold: ${RESPONSE_THRESHOLD}ms)"
    fi
fi

# Database Connection Check
DB_STATUS="unknown"
if [ -f "/var/www/afilo/check-db-health.sh" ]; then
    if /var/www/afilo/check-db-health.sh >/dev/null 2>&1; then
        DB_STATUS="connected"
    else
        DB_STATUS="failed"
        log_alert "Database health check failed"
    fi
fi

# SSL Certificate Check (if domain is configured)
SSL_DAYS_LEFT="unknown"
if [ "$DOMAIN" != "https://your-domain.com" ]; then
    DOMAIN_NAME=$(echo "$DOMAIN" | sed 's|https://||' | sed 's|http://||')
    if command -v openssl >/dev/null 2>&1; then
        SSL_EXPIRY=$(echo | openssl s_client -servername "$DOMAIN_NAME" -connect "$DOMAIN_NAME:443" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null | grep notAfter | cut -d= -f2)
        if [ -n "$SSL_EXPIRY" ]; then
            SSL_EXPIRY_EPOCH=$(date -d "$SSL_EXPIRY" +%s 2>/dev/null || echo "0")
            CURRENT_EPOCH=$(date +%s)
            SSL_DAYS_LEFT=$(((SSL_EXPIRY_EPOCH - CURRENT_EPOCH) / 86400))

            if [ "$SSL_DAYS_LEFT" -lt 30 ]; then
                log_alert "SSL certificate expires in $SSL_DAYS_LEFT days"
            fi
        fi
    fi
fi

# Check for errors in application logs
ERROR_COUNT=0
if [ -f "/var/www/afilo/logs/err.log" ]; then
    ERROR_COUNT=$(tail -100 /var/www/afilo/logs/err.log 2>/dev/null | grep -i error | wc -l || echo "0")
    if [ "$ERROR_COUNT" -gt 5 ]; then
        log_alert "High error count in application logs: $ERROR_COUNT errors in last 100 lines"
    fi
fi

# Resource alerts
if [ "${CPU_USAGE%.*}" -gt "$CPU_THRESHOLD" ]; then
    log_alert "High CPU usage: ${CPU_USAGE}% (threshold: ${CPU_THRESHOLD}%)"
fi

if [ "$MEMORY_PERCENTAGE" -gt "$MEMORY_THRESHOLD" ]; then
    log_alert "High memory usage: ${MEMORY_PERCENTAGE}% (threshold: ${MEMORY_THRESHOLD}%)"
fi

if [ "$DISK_USAGE" -gt "$DISK_THRESHOLD" ]; then
    log_alert "High disk usage: ${DISK_USAGE}% (threshold: ${DISK_THRESHOLD}%)"
fi

# Log metrics in JSON format for potential monitoring tools
METRICS_JSON=$(cat << EOL
{
  "timestamp": "$DATE_ISO",
  "system": {
    "cpu_usage": $CPU_USAGE,
    "memory_percentage": $MEMORY_PERCENTAGE,
    "memory_used_mb": $MEMORY_USED,
    "memory_total_mb": $MEMORY_TOTAL,
    "disk_usage": $DISK_USAGE,
    "load_average": "$LOAD_AVERAGE",
    "network_connections": $NETWORK_CONNECTIONS,
    "active_connections": $ACTIVE_CONNECTIONS
  },
  "application": {
    "pm2_status": "$PM2_STATUS",
    "uptime": "$APP_UPTIME",
    "restarts": $APP_RESTARTS,
    "http_status": "$HTTP_STATUS",
    "response_time_ms": $RESPONSE_TIME,
    "error_count": $ERROR_COUNT
  },
  "database": {
    "status": "$DB_STATUS"
  },
  "ssl": {
    "days_until_expiry": $SSL_DAYS_LEFT
  }
}
EOL
)

log_metric "$METRICS_JSON"

# Summary log
log_message "System check completed - CPU: ${CPU_USAGE}%, Memory: ${MEMORY_PERCENTAGE}%, Disk: ${DISK_USAGE}%, HTTP: $HTTP_STATUS, DB: $DB_STATUS"

# Check if we need to send alerts (placeholder for notification integration)
if [ -f "$ALERT_FILE" ] && [ "$(wc -l < "$ALERT_FILE")" -gt 0 ]; then
    # In production, this could send alerts via Slack, email, etc.
    log_message "Alerts detected - check $ALERT_FILE"
fi
EOF

chmod +x "$APP_DIR/monitor-system.sh"

# Set up log rotation for monitoring logs
print_status "📝 Setting up log rotation..."

sudo tee /etc/logrotate.d/afilo-monitoring << 'EOF'
/var/log/afilo/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 deploy deploy
    postrotate
        # Optional: restart monitoring service if needed
    endscript
}
EOF

# Create performance monitoring script
print_status "⚡ Creating performance monitoring script..."

cat > "$APP_DIR/monitor-performance.sh" << 'EOF'
#!/bin/bash

# Application Performance Monitoring Script
# Monitors API response times, database performance, and user experience metrics

LOG_FILE="/var/log/afilo/performance.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

log_message() {
    echo "[$TIMESTAMP] $1" >> "$LOG_FILE"
}

log_message "Starting performance monitoring"

# Test critical endpoints
ENDPOINTS=(
    "/"
    "/api/health"
    "/api/products"
    "/dashboard"
)

for endpoint in "${ENDPOINTS[@]}"; do
    if [ -f "/var/www/afilo/.env.production.local" ]; then
        DOMAIN=$(grep NEXT_PUBLIC_APP_URL /var/www/afilo/.env.production.local | cut -d= -f2 | tr -d '"' 2>/dev/null || echo "http://localhost:3000")
        URL="${DOMAIN}${endpoint}"
    else
        URL="http://localhost:3000${endpoint}"
    fi

    RESPONSE=$(curl -s -w "%{http_code},%{time_total},%{size_download}" -o /dev/null "$URL" 2>/dev/null || echo "000,0,0")
    STATUS=$(echo "$RESPONSE" | cut -d',' -f1)
    TIME=$(echo "$RESPONSE" | cut -d',' -f2)
    SIZE=$(echo "$RESPONSE" | cut -d',' -f3)

    TIME_MS=$(echo "$TIME * 1000" | bc 2>/dev/null | cut -d'.' -f1 || echo "0")

    log_message "Endpoint $endpoint - Status: $STATUS, Time: ${TIME_MS}ms, Size: ${SIZE}b"

    # Alert on slow responses
    if [ "$TIME_MS" -gt 3000 ]; then
        echo "[$TIMESTAMP] ALERT: Slow response for $endpoint: ${TIME_MS}ms" >> /var/log/afilo/alerts.log
    fi
done

# Monitor database performance
if command -v pnpm >/dev/null 2>&1 && [ -f "/var/www/afilo/package.json" ]; then
    cd /var/www/afilo

    # Test simple database query performance
    DB_START=$(date +%s%3N)
    if pnpm prisma db execute --stdin <<< "SELECT 1;" >/dev/null 2>&1; then
        DB_END=$(date +%s%3N)
        DB_TIME=$((DB_END - DB_START))
        log_message "Database query time: ${DB_TIME}ms"

        if [ "$DB_TIME" -gt 1000 ]; then
            echo "[$TIMESTAMP] ALERT: Slow database query: ${DB_TIME}ms" >> /var/log/afilo/alerts.log
        fi
    else
        log_message "Database query failed"
        echo "[$TIMESTAMP] ALERT: Database query failed" >> /var/log/afilo/alerts.log
    fi
fi

log_message "Performance monitoring completed"
EOF

chmod +x "$APP_DIR/monitor-performance.sh"

# Create disk cleanup script
print_status "🧹 Creating disk cleanup script..."

cat > "$APP_DIR/cleanup-logs.sh" << 'EOF'
#!/bin/bash

# Automated log and cache cleanup script
# Prevents disk space issues by cleaning old files

LOG_FILE="/var/log/afilo/cleanup.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

log_message() {
    echo "[$TIMESTAMP] $1" >> "$LOG_FILE"
}

log_message "Starting cleanup process"

# Clean old PM2 logs
pm2 flush >/dev/null 2>&1 || true
log_message "PM2 logs flushed"

# Clean old application logs (keep 30 days)
find /var/www/afilo/logs -name "*.log*" -mtime +30 -delete 2>/dev/null || true
log_message "Old application logs cleaned"

# Clean old monitoring logs (keep 60 days)
find /var/log/afilo -name "*.log*" -mtime +60 -delete 2>/dev/null || true
log_message "Old monitoring logs cleaned"

# Clean old backups (keep 14 days)
find /var/backups/afilo -name "*.tar.gz" -mtime +14 -delete 2>/dev/null || true
log_message "Old backups cleaned"

# Clean system logs if getting large
SYSLOG_SIZE=$(du -m /var/log/syslog 2>/dev/null | cut -f1 || echo "0")
if [ "$SYSLOG_SIZE" -gt 100 ]; then
    sudo truncate -s 50M /var/log/syslog 2>/dev/null || true
    log_message "System log truncated (was ${SYSLOG_SIZE}M)"
fi

# Clean package cache
if command -v pnpm >/dev/null 2>&1; then
    cd /var/www/afilo
    pnpm store prune >/dev/null 2>&1 || true
    log_message "Package cache pruned"
fi

# Report disk usage after cleanup
DISK_USAGE=$(df /var/www | awk 'NR==2 {print $5}' | sed 's/%//')
log_message "Cleanup completed - Disk usage: ${DISK_USAGE}%"

# Alert if still high
if [ "$DISK_USAGE" -gt 85 ]; then
    echo "[$TIMESTAMP] ALERT: Disk usage still high after cleanup: ${DISK_USAGE}%" >> /var/log/afilo/alerts.log
fi
EOF

chmod +x "$APP_DIR/cleanup-logs.sh"

# Create status dashboard script
print_status "📊 Creating status dashboard script..."

cat > "$APP_DIR/status-dashboard.sh" << 'EOF'
#!/bin/bash

# Status Dashboard - Quick overview of system health
# Run this script to get a real-time status overview

APP_NAME="afilo-app"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}=================================${NC}"
    echo -e "${BLUE}    AFILO MARKETPLACE STATUS     ${NC}"
    echo -e "${BLUE}=================================${NC}"
    echo "Generated: $(date)"
    echo
}

print_status() {
    local status=$1
    local message=$2

    case $status in
        "OK")
            echo -e "${GREEN}✅${NC} $message"
            ;;
        "WARN")
            echo -e "${YELLOW}⚠️${NC} $message"
            ;;
        "ERROR")
            echo -e "${RED}❌${NC} $message"
            ;;
        *)
            echo -e "${BLUE}ℹ️${NC} $message"
            ;;
    esac
}

print_header

# Application Status
echo -e "${BLUE}📱 APPLICATION STATUS${NC}"
if pm2 list | grep -q "$APP_NAME.*online"; then
    UPTIME=$(pm2 show "$APP_NAME" | grep "uptime" | awk '{print $3 $4}' | head -1)
    RESTARTS=$(pm2 show "$APP_NAME" | grep "restarts" | awk '{print $3}' | head -1)
    MEMORY=$(pm2 show "$APP_NAME" | grep "memory usage" | awk '{print $4 $5}' | head -1)
    print_status "OK" "Application running (uptime: $UPTIME, restarts: $RESTARTS, memory: $MEMORY)"
else
    print_status "ERROR" "Application not running"
fi

# HTTP Health Check
HTTP_CHECK=$(curl -s -w "%{http_code}" -o /dev/null --max-time 5 http://localhost:3000/api/health 2>/dev/null || echo "000")
if [ "$HTTP_CHECK" = "200" ]; then
    print_status "OK" "HTTP health check passed"
else
    print_status "ERROR" "HTTP health check failed (status: $HTTP_CHECK)"
fi

# System Resources
echo
echo -e "${BLUE}💻 SYSTEM RESOURCES${NC}"

CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}' | head -1)
if [ "${CPU_USAGE%.*}" -lt 70 ]; then
    print_status "OK" "CPU usage: ${CPU_USAGE}%"
elif [ "${CPU_USAGE%.*}" -lt 85 ]; then
    print_status "WARN" "CPU usage: ${CPU_USAGE}%"
else
    print_status "ERROR" "CPU usage: ${CPU_USAGE}%"
fi

MEMORY_USAGE=$(free | awk '/Mem/ {printf "%.0f", $3/$2 * 100.0}')
if [ "$MEMORY_USAGE" -lt 70 ]; then
    print_status "OK" "Memory usage: ${MEMORY_USAGE}%"
elif [ "$MEMORY_USAGE" -lt 85 ]; then
    print_status "WARN" "Memory usage: ${MEMORY_USAGE}%"
else
    print_status "ERROR" "Memory usage: ${MEMORY_USAGE}%"
fi

DISK_USAGE=$(df /var/www | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 70 ]; then
    print_status "OK" "Disk usage: ${DISK_USAGE}%"
elif [ "$DISK_USAGE" -lt 85 ]; then
    print_status "WARN" "Disk usage: ${DISK_USAGE}%"
else
    print_status "ERROR" "Disk usage: ${DISK_USAGE}%"
fi

# Database Status
echo
echo -e "${BLUE}🗄️ DATABASE STATUS${NC}"
if [ -f "/var/www/afilo/check-db-health.sh" ]; then
    if /var/www/afilo/check-db-health.sh >/dev/null 2>&1; then
        print_status "OK" "Database connection healthy"
    else
        print_status "ERROR" "Database connection failed"
    fi
else
    print_status "INFO" "Database health script not found"
fi

# SSL Certificate
echo
echo -e "${BLUE}🔐 SSL CERTIFICATE${NC}"
if [ -f "/var/www/afilo/.env.production.local" ]; then
    DOMAIN=$(grep NEXT_PUBLIC_APP_URL /var/www/afilo/.env.production.local | cut -d= -f2 | tr -d '"' | sed 's|https://||' | sed 's|http://||' 2>/dev/null)
    if [ -n "$DOMAIN" ] && [ "$DOMAIN" != "your-domain.com" ]; then
        if command -v openssl >/dev/null 2>&1; then
            SSL_EXPIRY=$(echo | openssl s_client -servername "$DOMAIN" -connect "$DOMAIN:443" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null | grep notAfter | cut -d= -f2)
            if [ -n "$SSL_EXPIRY" ]; then
                SSL_EXPIRY_EPOCH=$(date -d "$SSL_EXPIRY" +%s 2>/dev/null || echo "0")
                CURRENT_EPOCH=$(date +%s)
                SSL_DAYS_LEFT=$(((SSL_EXPIRY_EPOCH - CURRENT_EPOCH) / 86400))

                if [ "$SSL_DAYS_LEFT" -gt 30 ]; then
                    print_status "OK" "SSL certificate valid ($SSL_DAYS_LEFT days remaining)"
                elif [ "$SSL_DAYS_LEFT" -gt 7 ]; then
                    print_status "WARN" "SSL certificate expires soon ($SSL_DAYS_LEFT days)"
                else
                    print_status "ERROR" "SSL certificate expires very soon ($SSL_DAYS_LEFT days)"
                fi
            else
                print_status "ERROR" "Could not check SSL certificate"
            fi
        fi
    else
        print_status "INFO" "Domain not configured for SSL check"
    fi
fi

# Recent Alerts
echo
echo -e "${BLUE}🚨 RECENT ALERTS${NC}"
if [ -f "/var/log/afilo/alerts.log" ]; then
    ALERT_COUNT=$(tail -50 /var/log/afilo/alerts.log 2>/dev/null | wc -l || echo "0")
    if [ "$ALERT_COUNT" -eq 0 ]; then
        print_status "OK" "No recent alerts"
    else
        print_status "WARN" "$ALERT_COUNT alerts in last 50 entries"
        echo "Recent alerts:"
        tail -5 /var/log/afilo/alerts.log 2>/dev/null | sed 's/^/  /' || echo "  (none)"
    fi
else
    print_status "INFO" "No alert log found"
fi

echo
echo -e "${BLUE}=================================${NC}"
echo "Run './monitor-system.sh' for detailed monitoring"
echo "Run 'pm2 monit' for real-time PM2 monitoring"
echo "Logs: /var/log/afilo/ and /var/www/afilo/logs/"
echo -e "${BLUE}=================================${NC}"
EOF

chmod +x "$APP_DIR/status-dashboard.sh"

# Set up cron jobs for monitoring
print_status "⏰ Setting up monitoring cron jobs..."

# Create monitoring crontab
cat > /tmp/monitoring-crontab << EOF
# Afilo Marketplace Monitoring Cron Jobs

# System monitoring every 5 minutes
*/5 * * * * cd /var/www/afilo && ./monitor-system.sh

# Performance monitoring every 15 minutes
*/15 * * * * cd /var/www/afilo && ./monitor-performance.sh

# Daily cleanup at 3 AM
0 3 * * * cd /var/www/afilo && ./cleanup-logs.sh

# Weekly status report on Sundays at 8 AM
0 8 * * 0 cd /var/www/afilo && ./status-dashboard.sh > /var/log/afilo/weekly-report.log 2>&1
EOF

# Install monitoring cron jobs
crontab -l 2>/dev/null | grep -v "Afilo Marketplace Monitoring" > /tmp/current-crontab || true
cat /tmp/monitoring-crontab >> /tmp/current-crontab
crontab /tmp/current-crontab

# Clean up temp files
rm -f /tmp/monitoring-crontab /tmp/current-crontab

print_status "✅ Monitoring cron jobs installed"

# Create monitoring service status script
print_status "🔍 Creating monitoring service status..."

cat > "$APP_DIR/check-monitoring.sh" << 'EOF'
#!/bin/bash

# Check if monitoring services are working properly

echo "🔍 Monitoring Service Status Check"
echo "=================================="

# Check if monitoring scripts exist
SCRIPTS=("monitor-system.sh" "monitor-performance.sh" "cleanup-logs.sh" "status-dashboard.sh")
for script in "${SCRIPTS[@]}"; do
    if [ -x "/var/www/afilo/$script" ]; then
        echo "✅ $script is executable"
    else
        echo "❌ $script is missing or not executable"
    fi
done

# Check if log directories exist
LOG_DIRS=("/var/log/afilo" "/var/www/afilo/logs")
for dir in "${LOG_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo "✅ Log directory $dir exists"
    else
        echo "❌ Log directory $dir is missing"
    fi
done

# Check if cron jobs are installed
if crontab -l | grep -q "monitor-system.sh"; then
    echo "✅ System monitoring cron job is installed"
else
    echo "❌ System monitoring cron job is missing"
fi

# Check recent monitoring activity
if [ -f "/var/log/afilo/system-monitor.log" ]; then
    LAST_CHECK=$(tail -1 /var/log/afilo/system-monitor.log 2>/dev/null | grep -o '\[.*\]' | head -1)
    echo "ℹ️ Last system check: $LAST_CHECK"
else
    echo "⚠️ No system monitoring log found"
fi

echo
echo "Run './status-dashboard.sh' for current system status"
EOF

chmod +x "$APP_DIR/check-monitoring.sh"

# Set up alerting configuration (placeholder for future integrations)
print_status "🚨 Setting up alerting configuration..."

cat > "$APP_DIR/alert-config.json" << 'EOF'
{
  "alerting": {
    "enabled": true,
    "channels": {
      "email": {
        "enabled": false,
        "recipients": [],
        "smtp_server": "",
        "smtp_port": 587,
        "username": "",
        "password": ""
      },
      "slack": {
        "enabled": false,
        "webhook_url": "",
        "channel": "#alerts"
      },
      "discord": {
        "enabled": false,
        "webhook_url": ""
      }
    },
    "thresholds": {
      "cpu_percent": 80,
      "memory_percent": 85,
      "disk_percent": 80,
      "response_time_ms": 2000,
      "ssl_days_warning": 30
    },
    "notification_intervals": {
      "critical": 300,
      "warning": 1800,
      "info": 3600
    }
  }
}
EOF

# Create initial log files with proper permissions
print_status "📝 Creating initial log files..."
touch /var/log/afilo/system-monitor.log
touch /var/log/afilo/performance.log
touch /var/log/afilo/cleanup.log
touch /var/log/afilo/alerts.log
touch /var/log/afilo/metrics.log

# Set proper permissions
sudo chown -R deploy:deploy /var/log/afilo
chmod 644 /var/log/afilo/*.log

print_status "🧪 Running initial monitoring check..."
cd "$APP_DIR"
./monitor-system.sh
./check-monitoring.sh

echo
print_status "📊 Monitoring and Logging Setup Complete!"
echo
print_status "🛠️ Available monitoring scripts:"
echo "  📊 ./status-dashboard.sh      - Real-time system status overview"
echo "  🔍 ./monitor-system.sh        - Comprehensive system check"
echo "  ⚡ ./monitor-performance.sh    - Application performance monitoring"
echo "  🧹 ./cleanup-logs.sh          - Log and cache cleanup"
echo "  🔧 ./check-monitoring.sh      - Verify monitoring service status"

echo
print_status "📁 Log locations:"
echo "  📋 System logs: /var/log/afilo/"
echo "  📋 Application logs: /var/www/afilo/logs/"
echo "  📋 Nginx logs: /var/log/nginx/"

echo
print_status "⏰ Automated monitoring schedule:"
echo "  🔍 System monitoring: Every 5 minutes"
echo "  ⚡ Performance monitoring: Every 15 minutes"
echo "  🧹 Log cleanup: Daily at 3 AM"
echo "  📊 Weekly reports: Sundays at 8 AM"

echo
print_status "🚨 Alert thresholds configured:"
echo "  💻 CPU usage: >80%"
echo "  💾 Memory usage: >85%"
echo "  💾 Disk usage: >80%"
echo "  🌐 Response time: >2000ms"
echo "  🔐 SSL certificate: <30 days"

echo
print_status "🔧 Management commands:"
echo "  tail -f /var/log/afilo/system-monitor.log  # View monitoring logs"
echo "  tail -f /var/log/afilo/alerts.log         # View alerts"
echo "  crontab -l                                # View scheduled jobs"
echo "  ./status-dashboard.sh                     # Quick status check"

echo
print_status "🎉 Production monitoring is now active! 🚀"
print_warning "Configure alerting in alert-config.json for notifications"