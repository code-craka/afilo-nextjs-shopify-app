#!/bin/bash

# Quick Deploy Script - Fast deployment for minor updates
# Use this for small changes that don't require full deployment pipeline

set -e

APP_NAME="afilo-app"
LOG_FILE="./logs/quick-deploy.log"
DATE=$(date +%Y%m%d_%H%M%S)

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date '+%H:%M:%S')] WARN:${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date '+%H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

# Create logs directory
mkdir -p logs

log "⚡ Quick deploy started - $DATE"

# Check basic requirements
if [ ! -f "package.json" ]; then
    error "Must run from app directory"
    exit 1
fi

if ! pm2 list | grep -q "$APP_NAME"; then
    error "App not found in PM2"
    exit 1
fi

# Quick health check
if ! curl -f -s --max-time 5 http://localhost:3000/api/health > /dev/null; then
    error "App not healthy before deploy"
    exit 1
fi

# Pull changes if git repo
if [ -d ".git" ]; then
    log "⬇️ Pulling changes..."
    git pull origin $(git rev-parse --abbrev-ref HEAD)
fi

# Quick dependency check
log "📦 Checking dependencies..."
pnpm install --prefer-offline

# Build
log "🔨 Building..."
pnpm build

# Restart
log "🔄 Restarting app..."
pm2 restart "$APP_NAME"

# Quick health check
sleep 5
if curl -f -s --max-time 10 http://localhost:3000/api/health > /dev/null; then
    log "✅ Quick deploy completed successfully!"
else
    error "❌ Health check failed after restart"
    exit 1
fi

log "⏱️ Deploy took: $(($(date +%s) - $(date -d "$DATE" +%s 2>/dev/null || echo 0)))s"