#!/bin/bash

# Log Cleanup Script for Afilo Marketplace
# Cleans old logs, temporary files, and caches

set -e

# Configuration
APP_DIR="/var/www/afilo"
LOG_RETENTION_DAYS=14
TEMP_FILE_RETENTION_DAYS=7

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARN:${NC} $1"
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO:${NC} $1"
}

log "🧹 Starting cleanup process..."

# Change to app directory if it exists
if [ -d "$APP_DIR" ]; then
    cd "$APP_DIR"
else
    cd /var/www/afilo 2>/dev/null || cd .
fi

CLEANED_SIZE=0

# ==========================================
# 1. Clean old application logs
# ==========================================
info "Cleaning old application logs (>${LOG_RETENTION_DAYS} days)..."

if [ -d "logs" ]; then
    OLD_LOGS=$(find logs -name "*.log.*" -mtime +$LOG_RETENTION_DAYS 2>/dev/null)

    if [ -n "$OLD_LOGS" ]; then
        SIZE_BEFORE=$(du -sb logs 2>/dev/null | cut -f1)
        echo "$OLD_LOGS" | xargs rm -f
        SIZE_AFTER=$(du -sb logs 2>/dev/null | cut -f1)
        CLEANED=$((SIZE_BEFORE - SIZE_AFTER))
        CLEANED_SIZE=$((CLEANED_SIZE + CLEANED))

        log "✅ Removed old application logs: $(numfmt --to=iec $CLEANED 2>/dev/null || echo ${CLEANED}bytes)"
    else
        info "No old application logs to remove"
    fi
fi

# ==========================================
# 2. Clean PM2 logs
# ==========================================
info "Flushing PM2 logs..."
pm2 flush 2>/dev/null && log "✅ PM2 logs flushed" || warn "PM2 not running or no logs to flush"

# ==========================================
# 3. Clean old Nginx logs
# ==========================================
if [ -d "/var/log/nginx" ] && [ -w "/var/log/nginx" ]; then
    info "Compressing old Nginx logs..."

    OLD_NGINX_LOGS=$(find /var/log/nginx -name "*.log.*" -mtime +$LOG_RETENTION_DAYS 2>/dev/null)
    if [ -n "$OLD_NGINX_LOGS" ]; then
        echo "$OLD_NGINX_LOGS" | xargs sudo rm -f 2>/dev/null
        log "✅ Removed old Nginx logs"
    fi
fi

# ==========================================
# 4. Clean Next.js cache
# ==========================================
info "Cleaning Next.js cache..."

if [ -d ".next/cache" ]; then
    SIZE_BEFORE=$(du -sb .next/cache 2>/dev/null | cut -f1 || echo 0)
    rm -rf .next/cache/* 2>/dev/null || true
    SIZE_AFTER=$(du -sb .next/cache 2>/dev/null | cut -f1 || echo 0)
    CLEANED=$((SIZE_BEFORE - SIZE_AFTER))
    CLEANED_SIZE=$((CLEANED_SIZE + CLEANED))

    if [ $CLEANED -gt 0 ]; then
        log "✅ Cleaned Next.js cache: $(numfmt --to=iec $CLEANED 2>/dev/null || echo ${CLEANED}bytes)"
    fi
fi

# ==========================================
# 5. Clean temporary files
# ==========================================
info "Cleaning temporary files..."

TEMP_DIRS=("tmp" ".tmp" "temp")
for temp_dir in "${TEMP_DIRS[@]}"; do
    if [ -d "$temp_dir" ]; then
        OLD_TEMP=$(find "$temp_dir" -type f -mtime +$TEMP_FILE_RETENTION_DAYS 2>/dev/null)

        if [ -n "$OLD_TEMP" ]; then
            SIZE_BEFORE=$(du -sb "$temp_dir" 2>/dev/null | cut -f1 || echo 0)
            echo "$OLD_TEMP" | xargs rm -f 2>/dev/null || true
            SIZE_AFTER=$(du -sb "$temp_dir" 2>/dev/null | cut -f1 || echo 0)
            CLEANED=$((SIZE_BEFORE - SIZE_AFTER))
            CLEANED_SIZE=$((CLEANED_SIZE + CLEANED))

            if [ $CLEANED -gt 0 ]; then
                log "✅ Cleaned $temp_dir: $(numfmt --to=iec $CLEANED 2>/dev/null || echo ${CLEANED}bytes)"
            fi
        fi
    fi
done

# ==========================================
# 6. Clean old deployment backups
# ==========================================
if [ -d "/var/backups/afilo" ]; then
    info "Cleaning old deployment backups (>30 days)..."

    OLD_BACKUPS=$(find /var/backups/afilo -name "app_backup_*.tar.gz" -mtime +30 2>/dev/null)
    if [ -n "$OLD_BACKUPS" ]; then
        echo "$OLD_BACKUPS" | xargs sudo rm -f 2>/dev/null
        log "✅ Removed old deployment backups"
    fi
fi

# ==========================================
# 7. Clean package manager cache
# ==========================================
info "Cleaning pnpm cache..."
if command -v pnpm &> /dev/null; then
    pnpm store prune 2>/dev/null && log "✅ pnpm cache cleaned" || info "pnpm cache already clean"
fi

# ==========================================
# 8. Clean system package cache (optional)
# ==========================================
if [ "$(id -u)" = "0" ] || sudo -n true 2>/dev/null; then
    info "Cleaning system package cache..."
    sudo apt-get clean 2>/dev/null && log "✅ System package cache cleaned" || true
    sudo apt-get autoremove -y 2>/dev/null && log "✅ Removed unused packages" || true
fi

# ==========================================
# 9. Display disk usage
# ==========================================
info "Current disk usage:"
df -h / /var 2>/dev/null | grep -v "Filesystem"

# ==========================================
# Summary
# ==========================================
log "📊 Cleanup Summary:"
if [ $CLEANED_SIZE -gt 0 ]; then
    echo "   - Total space freed: $(numfmt --to=iec $CLEANED_SIZE 2>/dev/null || echo ${CLEANED_SIZE}bytes)"
else
    echo "   - No significant space freed (system already clean)"
fi

log "🎉 Cleanup completed successfully!"

exit 0
