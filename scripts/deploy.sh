#!/bin/bash

# Production Deployment Script for Afilo Marketplace
# Handles zero-downtime deployment with health checks and rollback capability

set -e

# Configuration
APP_NAME="afilo-app"
APP_DIR="/var/www/afilo"
BACKUP_DIR="/var/backups/afilo"
LOG_FILE="./logs/deploy.log"
DATE=$(date +%Y%m%d_%H%M%S)
HEALTH_TIMEOUT=30
MAX_RETRIES=3

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging functions
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO:${NC} $1" | tee -a "$LOG_FILE"
}

# Create logs directory if it doesn't exist
mkdir -p logs

# Trap to handle script interruption
cleanup() {
    error "Deployment interrupted! Check logs for details."
    exit 1
}
trap cleanup INT TERM

# Function to check if application is healthy
check_health() {
    local retries=0
    local max_retries=${1:-$MAX_RETRIES}

    info "Checking application health..."

    while [ $retries -lt $max_retries ]; do
        if curl -f -s --max-time 10 http://localhost:3000/api/health > /dev/null 2>&1; then
            log "✅ Health check passed"
            return 0
        fi

        retries=$((retries + 1))
        if [ $retries -lt $max_retries ]; then
            info "Health check failed, retrying ($retries/$max_retries)..."
            sleep 5
        fi
    done

    error "❌ Health check failed after $max_retries attempts"
    return 1
}

# Function to wait for application to be ready
wait_for_ready() {
    local timeout=${1:-$HEALTH_TIMEOUT}
    local elapsed=0

    info "Waiting for application to be ready (timeout: ${timeout}s)..."

    while [ $elapsed -lt $timeout ]; do
        if check_health 1; then
            return 0
        fi

        sleep 2
        elapsed=$((elapsed + 2))
        echo -n "."
    done

    echo
    error "Application did not become ready within ${timeout} seconds"
    return 1
}

# Function to create backup
create_backup() {
    log "📦 Creating deployment backup..."

    sudo mkdir -p "$BACKUP_DIR"

    # Create application backup
    sudo tar -czf "$BACKUP_DIR/app_backup_$DATE.tar.gz" \
        -C /var/www afilo \
        --exclude=node_modules \
        --exclude=.next \
        --exclude=logs \
        --exclude=.git \
        --warning=no-file-changed || true

    # Create database backup
    if [ -f "./backup-db.sh" ]; then
        ./backup-db.sh
    fi

    log "✅ Backup created: app_backup_$DATE.tar.gz"
}

# Function to rollback deployment
rollback_deployment() {
    error "🔄 Rolling back deployment..."

    # Find the most recent backup
    LATEST_BACKUP=$(find "$BACKUP_DIR" -name "app_backup_*.tar.gz" -type f -printf '%T@ %p\n' | sort -rn | head -1 | cut -d' ' -f2-)

    if [ -n "$LATEST_BACKUP" ] && [ -f "$LATEST_BACKUP" ]; then
        warn "Restoring from backup: $(basename "$LATEST_BACKUP")"

        # Stop application
        pm2 stop "$APP_NAME" || true

        # Restore backup
        sudo tar -xzf "$LATEST_BACKUP" -C /var/www --overwrite || {
            error "Failed to restore backup"
            exit 1
        }

        # Restart application
        cd "$APP_DIR"
        pm2 restart "$APP_NAME"

        if wait_for_ready; then
            log "✅ Rollback completed successfully"
        else
            error "❌ Rollback failed - manual intervention required"
            exit 1
        fi
    else
        error "No backup found for rollback"
        exit 1
    fi
}

# Main deployment function
main_deployment() {
    log "🚀 Starting deployment of Afilo Marketplace..."
    info "Deployment ID: deploy_$DATE"

    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        error "This script must be run from the application root directory"
        exit 1
    fi

    # Check if environment file exists
    if [ ! -f ".env.production.local" ]; then
        error "Environment file .env.production.local not found"
        exit 1
    fi

    # Pre-deployment checks
    log "🔍 Running pre-deployment checks..."

    # Check if PM2 is running
    if ! pm2 list | grep -q "$APP_NAME"; then
        error "Application not found in PM2. Please run initial setup first."
        exit 1
    fi

    # Check disk space
    DISK_USAGE=$(df "$APP_DIR" | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$DISK_USAGE" -gt 85 ]; then
        error "Disk usage is too high: ${DISK_USAGE}%. Please free up space."
        exit 1
    fi

    # Check if git repo is clean (if .git exists)
    if [ -d ".git" ]; then
        if ! git diff --quiet || ! git diff --cached --quiet; then
            warn "Working directory has uncommitted changes"
            info "Uncommitted changes will be included in deployment"
        fi
    fi

    log "✅ Pre-deployment checks passed"

    # Create backup
    create_backup

    # Pull latest changes (if git repo)
    if [ -d ".git" ]; then
        log "⬇️ Pulling latest changes from repository..."
        git fetch origin
        CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
        git pull origin "$CURRENT_BRANCH" || {
            error "Failed to pull changes from repository"
            exit 1
        }

        # Show what changed
        info "Recent commits:"
        git log --oneline -5 || true
    fi

    # Load environment variables
    export $(grep -v '^#' .env.production.local | xargs)

    # Install dependencies
    log "📦 Installing/updating dependencies..."
    pnpm install --frozen-lockfile || {
        error "Failed to install dependencies"
        rollback_deployment
    }

    # Run database migrations
    log "🗄️ Running database migrations..."
    pnpm prisma generate || {
        error "Failed to generate Prisma client"
        rollback_deployment
    }

    pnpm prisma migrate deploy || {
        error "Failed to run database migrations"
        rollback_deployment
    }

    # Build application
    log "🔨 Building application..."
    pnpm build || {
        error "Build failed"
        rollback_deployment
    }

    # Run tests (if test script exists)
    if pnpm run --silent test --version >/dev/null 2>&1; then
        log "🧪 Running tests..."
        pnpm test || {
            warn "Tests failed - deployment will continue"
        }
    fi

    # Update PM2 configuration
    log "🔄 Reloading application..."

    # Reload application (zero-downtime)
    pm2 reload "$APP_NAME" --update-env || {
        error "Failed to reload application"
        rollback_deployment
    }

    # Wait for application to be ready
    if ! wait_for_ready; then
        error "Application failed to start properly"
        rollback_deployment
    fi

    # Post-deployment health checks
    log "🏥 Running post-deployment health checks..."

    # Extended health check
    if ! check_health 5; then
        error "Extended health check failed"
        rollback_deployment
    fi

    # Check critical endpoints
    ENDPOINTS=("/api/health" "/")
    for endpoint in "${ENDPOINTS[@]}"; do
        if curl -f -s --max-time 10 "http://localhost:3000$endpoint" > /dev/null; then
            info "✅ Endpoint $endpoint is responding"
        else
            warn "⚠️ Endpoint $endpoint is not responding properly"
        fi
    done

    # Update deployment info in environment
    sed -i "s|DEPLOYMENT_DATE=.*|DEPLOYMENT_DATE=\"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"|g" .env.production.local
    sed -i "s|BUILD_ID=.*|BUILD_ID=\"deploy_$DATE\"|g" .env.production.local

    # Clean up old builds and logs
    log "🧹 Cleaning up old files..."

    # Clean old PM2 logs
    pm2 flush || true

    # Clean old backups (keep last 7)
    find "$BACKUP_DIR" -name "app_backup_*.tar.gz" -mtime +7 -delete 2>/dev/null || true

    # Clean old deployment logs
    find ./logs -name "deploy.log.*" -mtime +14 -delete 2>/dev/null || true

    # Archive current log
    cp "$LOG_FILE" "${LOG_FILE}.${DATE}"

    # Final status check
    FINAL_STATUS=$(curl -s http://localhost:3000/api/health | jq -r '.status' 2>/dev/null || echo "unknown")

    log "🎉 Deployment completed successfully!"
    log "📊 Application Status: $FINAL_STATUS"
    log "🌐 Application URL: ${NEXT_PUBLIC_APP_URL:-https://your-domain.com}"
    log "⏱️ Deployment ID: deploy_$DATE"

    # Show deployment summary
    info "📋 Deployment Summary:"
    pm2 show "$APP_NAME" | grep -E "(status|uptime|restarts)" || true

    # Show system status
    info "💾 System Resources:"
    echo "  Disk Usage: ${DISK_USAGE}%"
    echo "  Memory: $(free -m | awk '/Mem/ {printf "%.0f%%", $3/$2 * 100.0}')"
    echo "  Load: $(uptime | awk '{print $10}' | sed 's/,//')"

    log "✨ Deployment pipeline completed! Your marketplace is live!"
}

# Handle script arguments
case "${1:-}" in
    --rollback)
        log "🔄 Initiating rollback..."
        rollback_deployment
        ;;
    --health-check)
        check_health
        ;;
    --help|-h)
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --rollback      Rollback to previous deployment"
        echo "  --health-check  Check application health"
        echo "  --help, -h      Show this help message"
        echo ""
        echo "Default: Run full deployment pipeline"
        ;;
    "")
        main_deployment
        ;;
    *)
        error "Unknown option: $1"
        echo "Use '$0 --help' for usage information"
        exit 1
        ;;
esac