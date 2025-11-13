#!/bin/bash

# Application Setup Script for Afilo Marketplace
# Run this script as the deploy user after server setup

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if running as deploy user
if [ "$USER" != "deploy" ]; then
    print_error "This script should be run as the deploy user"
    print_status "Please run: su - deploy"
    exit 1
fi

APP_DIR="/var/www/afilo"
DOMAIN=""
EMAIL=""
REPO_URL=""

print_status "🚀 Starting Afilo application setup..."

# Get user inputs
print_input "Please enter your domain name (e.g., afilo.com):"
read -r DOMAIN

print_input "Please enter your email for SSL certificate:"
read -r EMAIL

print_input "Please enter your Git repository URL:"
read -r REPO_URL

print_status "Setting up application with domain: $DOMAIN"

# Create application directory if it doesn't exist
if [ ! -d "$APP_DIR" ]; then
    print_status "Creating application directory..."
    mkdir -p "$APP_DIR"
fi

cd "$APP_DIR"

# Clone repository if not already present
if [ ! -f "package.json" ]; then
    print_status "Cloning repository..."
    if [ -n "$REPO_URL" ]; then
        git clone "$REPO_URL" .
    else
        print_error "Repository URL is required"
        exit 1
    fi
fi

print_status "Installing dependencies..."
pnpm install

print_status "Creating environment configuration..."
if [ ! -f ".env.production.local" ]; then
    cp .env.example .env.production.local
    print_warning "Please update .env.production.local with your production values"
    print_status "Opening editor for environment configuration..."
    sleep 2
    nano .env.production.local
fi

print_status "Creating PM2 ecosystem configuration..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'afilo-app',
      script: './server.js',
      cwd: '/var/www/afilo',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_file: '.env.production.local',
      instances: 'max',
      exec_mode: 'cluster',
      max_memory_restart: '2G',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
      kill_timeout: 5000
    }
  ]
};
EOF

print_status "Creating custom server for PM2..."
cat > server.js << 'EOF'
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  })
  .listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  })
  .on('error', (err) => {
    console.error('Server error:', err);
    process.exit(1);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
EOF

print_status "Setting up database..."
pnpm prisma generate
print_status "Running database migrations (if any)..."
pnpm prisma migrate deploy

print_status "Building application..."
pnpm build

print_status "Creating logs directory..."
mkdir -p logs

print_status "Starting application with PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup | grep sudo | bash

print_status "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/afilo << EOF
# Rate limiting
limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/m;
limit_req_zone \$binary_remote_addr zone=login:10m rate=5r/m;

server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline' 'unsafe-eval'" always;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    # Hide Nginx version
    server_tokens off;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        image/svg+xml;

    # Main application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
        proxy_connect_timeout 60;
        proxy_send_timeout 60;
    }

    # Rate limiting for API routes
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Extra rate limiting for auth routes
    location /api/auth/ {
        limit_req zone=login burst=10 nodelay;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Static file caching
    location /_next/static {
        proxy_cache STATIC;
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2|ttf|eot)\$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        proxy_pass http://localhost:3000;
    }

    # Block access to sensitive files
    location ~ /\\. {
        deny all;
    }

    location ~ \\.(env|log|config)\$ {
        deny all;
    }
}
EOF

print_status "Enabling Nginx site..."
sudo ln -sf /etc/nginx/sites-available/afilo /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

print_status "Testing Nginx configuration..."
sudo nginx -t

print_status "Restarting Nginx..."
sudo systemctl restart nginx

print_status "Setting up SSL certificate..."
sudo certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --email "$EMAIL" --agree-tos --non-interactive

print_status "Creating deployment script..."
cat > deploy.sh << 'EOF'
#!/bin/bash

set -e

echo "🚀 Starting deployment..."

# Variables
APP_DIR="/var/www/afilo"
BACKUP_DIR="/var/backups/afilo"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
echo "📦 Creating backup..."
sudo mkdir -p $BACKUP_DIR
sudo tar -czf $BACKUP_DIR/afilo_backup_$DATE.tar.gz -C /var/www afilo --exclude=node_modules --exclude=.next

# Navigate to app directory
cd $APP_DIR

# Pull latest changes
echo "⬇️ Pulling latest changes..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Run database migrations
echo "🗄️ Running database migrations..."
pnpm prisma generate
pnpm prisma migrate deploy

# Build application
echo "🔨 Building application..."
pnpm build

# Restart application
echo "🔄 Restarting application..."
pm2 reload afilo-app

# Wait for app to start
sleep 15

# Check application health
echo "🏥 Checking application health..."
if curl -f -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ Deployment successful!"
    echo "🌐 Application is available at: https://$(hostname -d || echo 'your-domain.com')"
else
    echo "❌ Health check failed. Check logs:"
    pm2 logs afilo-app --lines 20
fi

# Clean old backups (keep last 7)
find $BACKUP_DIR -name "afilo_backup_*.tar.gz" -mtime +7 -delete 2>/dev/null || true

echo "🎉 Deployment completed!"
EOF

chmod +x deploy.sh

print_status "Creating monitoring script..."
cat > monitor.sh << 'EOF'
#!/bin/bash

APP_NAME="afilo-app"
LOG_FILE="./logs/monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Function to log messages
log_message() {
    echo "[$DATE] $1" | tee -a $LOG_FILE
}

# Check if PM2 is running the app
if ! pm2 list | grep -q "$APP_NAME.*online"; then
    log_message "❌ Application is down, attempting restart..."
    pm2 restart $APP_NAME
    sleep 10

    if pm2 list | grep -q "$APP_NAME.*online"; then
        log_message "✅ Application restarted successfully"
    else
        log_message "🚨 Failed to restart application"
    fi
else
    log_message "✅ Application is running"
fi

# Check application health endpoint
if curl -f -s http://localhost:3000/api/health > /dev/null; then
    log_message "✅ Health check passed"
else
    log_message "⚠️ Health check failed"
fi

# Check disk space
DISK_USAGE=$(df /var/www | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    log_message "⚠️ Disk usage is high: ${DISK_USAGE}%"
fi

# Check memory usage
MEMORY_USAGE=$(free | awk '/Mem/ {printf "%.0f", $3/$2 * 100.0}')
if [ $MEMORY_USAGE -gt 85 ]; then
    log_message "⚠️ Memory usage is high: ${MEMORY_USAGE}%"
fi

log_message "📊 Status - Disk: ${DISK_USAGE}%, Memory: ${MEMORY_USAGE}%"
EOF

chmod +x monitor.sh

print_status "Setting up monitoring cron job..."
(crontab -l 2>/dev/null; echo "*/5 * * * * cd /var/www/afilo && ./monitor.sh") | crontab -

print_status "Setting up PM2 log rotation..."
sudo tee /etc/logrotate.d/pm2-deploy << 'EOF'
/var/www/afilo/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 deploy deploy
    postrotate
        /usr/bin/pm2 reloadLogs
    endscript
}
EOF

print_status "Creating backup script..."
cat > backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/var/backups/afilo"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
sudo mkdir -p $BACKUP_DIR

# Backup application files (excluding heavy directories)
sudo tar -czf $BACKUP_DIR/app_$DATE.tar.gz \
    -C /var/www afilo \
    --exclude=node_modules \
    --exclude=.next \
    --exclude=logs \
    --exclude=.git

# Keep only last 7 days of backups
find $BACKUP_DIR -name "app_*.tar.gz" -mtime +7 -delete 2>/dev/null || true

echo "Backup completed: app_$DATE.tar.gz"
EOF

chmod +x backup.sh

# Schedule daily backups
(crontab -l 2>/dev/null; echo "0 2 * * * cd /var/www/afilo && ./backup.sh") | crontab -

print_status "Checking application status..."
sleep 5
pm2 status
pm2 logs afilo-app --lines 10

echo
echo "🎉 Application setup completed successfully!"
echo
echo "✅ Your Afilo marketplace is now running at:"
echo "   🌐 https://$DOMAIN"
echo "   🌐 https://www.$DOMAIN"
echo
echo "📋 Important files created:"
echo "   📄 /var/www/afilo/deploy.sh - For future deployments"
echo "   📄 /var/www/afilo/monitor.sh - Application monitoring"
echo "   📄 /var/www/afilo/backup.sh - Backup script"
echo "   📄 /var/www/afilo/.env.production.local - Environment config"
echo
echo "🔧 Management commands:"
echo "   pm2 status          - Check app status"
echo "   pm2 logs afilo-app  - View logs"
echo "   pm2 restart afilo-app - Restart app"
echo "   ./deploy.sh         - Deploy updates"
echo "   ./monitor.sh        - Check system health"
echo
echo "📊 Monitoring:"
echo "   🔍 System monitoring runs every 5 minutes"
echo "   💾 Daily backups at 2 AM"
echo "   📝 Log rotation configured"
echo
echo "🚀 Deployment ready! Your marketplace is live! ✨"