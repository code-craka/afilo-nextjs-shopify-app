#!/bin/bash

# Database Backup Script for Afilo Marketplace
# Creates timestamped backups of PostgreSQL database

set -e

# Configuration
BACKUP_DIR="/var/backups/afilo/database"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO:${NC} $1"
}

# Load environment variables
if [ -f /var/www/afilo/.env.production.local ]; then
    export $(grep -v '^#' /var/www/afilo/.env.production.local | grep DATABASE_URL | xargs)
elif [ -f .env.production.local ]; then
    export $(grep -v '^#' .env.production.local | grep DATABASE_URL | xargs)
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    error "DATABASE_URL not found in environment"
    exit 1
fi

log "🗄️  Starting database backup..."

# Create backup directory
sudo mkdir -p "$BACKUP_DIR"
sudo chown -R $(whoami):$(whoami) "$BACKUP_DIR" 2>/dev/null || true

# Generate backup filename
BACKUP_FILE="$BACKUP_DIR/afilo_db_backup_$DATE.sql"
BACKUP_FILE_COMPRESSED="$BACKUP_FILE.gz"

# Perform backup
info "Creating backup: $(basename $BACKUP_FILE)"

if pg_dump "$DATABASE_URL" > "$BACKUP_FILE" 2>/dev/null; then
    log "✅ Database dump created successfully"

    # Get backup size
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    info "Backup size: $BACKUP_SIZE"

    # Compress backup
    info "Compressing backup..."
    gzip "$BACKUP_FILE"

    if [ -f "$BACKUP_FILE_COMPRESSED" ]; then
        COMPRESSED_SIZE=$(du -h "$BACKUP_FILE_COMPRESSED" | cut -f1)
        log "✅ Backup compressed: $COMPRESSED_SIZE"
    fi
else
    error "Failed to create database backup"
    exit 1
fi

# Clean up old backups
info "Cleaning up old backups (retention: $RETENTION_DAYS days)..."
OLD_BACKUPS=$(find "$BACKUP_DIR" -name "afilo_db_backup_*.sql.gz" -mtime +$RETENTION_DAYS 2>/dev/null)

if [ -n "$OLD_BACKUPS" ]; then
    echo "$OLD_BACKUPS" | while read -r old_backup; do
        rm -f "$old_backup"
        info "Removed old backup: $(basename $old_backup)"
    done
else
    info "No old backups to remove"
fi

# Count total backups
TOTAL_BACKUPS=$(find "$BACKUP_DIR" -name "afilo_db_backup_*.sql.gz" 2>/dev/null | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)

log "📊 Backup Summary:"
echo "   - Total backups: $TOTAL_BACKUPS"
echo "   - Total size: $TOTAL_SIZE"
echo "   - Latest backup: $(basename $BACKUP_FILE_COMPRESSED)"

log "🎉 Database backup completed successfully!"

exit 0
