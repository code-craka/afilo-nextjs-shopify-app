#!/bin/bash

# Production Monitoring Setup for Root User
# Simplified version for current deployment

APP_DIR="/root/afilo-nextjs-shopify-app"
LOG_DIR="/var/log/afilo"

echo "✅ Setting up production monitoring..."

# Create log directories
mkdir -p "$LOG_DIR"
mkdir -p "$APP_DIR/logs"

# Set up cron jobs for monitoring
echo "✅ Setting up cron jobs..."

# Create monitoring cron entries
(crontab -l 2>/dev/null | grep -v "afilo-monitoring"; cat <<CRON
# Afilo Production Monitoring (every 5 minutes)
*/5 * * * * cd $APP_DIR && ./status-dashboard.sh >> $LOG_DIR/dashboard.log 2>&1

# PM2 status check (every 10 minutes)
*/10 * * * * pm2 status >> $LOG_DIR/pm2-status.log 2>&1

# Log rotation (daily at 2 AM)
0 2 * * * find $LOG_DIR -name "*.log" -mtime +7 -delete

# Disk space check (every hour)
0 * * * * df -h > $LOG_DIR/disk-usage.log 2>&1

# Nginx access log rotation (daily at 3 AM)
0 3 * * * find /var/log/nginx -name "afilo_*.log" -mtime +7 -exec gzip {} \;

CRON
) | crontab -

echo "✅ Monitoring setup complete!"
echo ""
echo "Monitoring features enabled:"
echo "  - System dashboard (every 5 min) → $LOG_DIR/dashboard.log"
echo "  - PM2 status (every 10 min) → $LOG_DIR/pm2-status.log"
echo "  - Log rotation (daily)"
echo "  - Disk monitoring (hourly)"
echo ""
echo "View status: ./status-dashboard.sh"
echo "View logs: ls -lh $LOG_DIR"
