# Hetzner Ubuntu Server Deployment Guide

## Prerequisites

### Hetzner Server Requirements
- **Instance**: CPX31 or better (4 vCPU, 8GB RAM, 160GB SSD)
- **OS**: Ubuntu 22.04 LTS or 24.04 LTS
- **Network**: Public IPv4 + IPv6 (if needed)
- **Firewall**: Configure ports 22, 80, 443, 3000 (temporary)

### Domain Requirements
- Domain pointed to your Hetzner server IP
- DNS A record: `your-domain.com` → `YOUR_SERVER_IP`
- DNS CNAME record: `www.your-domain.com` → `your-domain.com`

### Required Services
- **Database**: Neon PostgreSQL (already configured)
- **Email**: Resend (already configured)
- **Storage**: Vercel Blob or AWS S3 (for file uploads)
- **Analytics**: Google Analytics 4 (optional)

---

## Phase 1: Initial Server Setup

### 1. Connect to Your Hetzner Server
```bash
# Replace YOUR_SERVER_IP with your actual IP
ssh root@YOUR_SERVER_IP

# Create a non-root user (recommended)
adduser deploy
usermod -aG sudo deploy
su - deploy
```

### 2. Update System and Install Dependencies
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git unzip software-properties-common

# Install Node.js 20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installations
node --version  # Should be v20.x.x
npm --version   # Should be 10.x.x

# Install pnpm globally
sudo npm install -g pnpm@latest
pnpm --version  # Should be 9.x.x

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx for reverse proxy
sudo apt install -y nginx

# Install certbot for SSL certificates
sudo apt install -y certbot python3-certbot-nginx
```

### 3. Configure Firewall
```bash
# Configure UFW firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
sudo ufw status
```

---

## Phase 2: Application Deployment

### 1. Clone Repository
```bash
# Create application directory
sudo mkdir -p /var/www
sudo chown -R deploy:deploy /var/www
cd /var/www

# Clone your repository (replace with your actual repo)
git clone https://github.com/your-username/afilo-nextjs-shopify-app.git afilo
cd afilo

# Set proper permissions
sudo chown -R deploy:deploy /var/www/afilo
```

### 2. Install Dependencies
```bash
cd /var/www/afilo

# Install dependencies
pnpm install

# Build the application
pnpm build

# Test the build
pnpm start
# Press Ctrl+C to stop after verifying it works
```

### 3. Environment Configuration
```bash
# Create production environment file
cp .env.example .env.production.local

# Edit environment variables
nano .env.production.local
```

### Required Environment Variables
```env
# Basic Configuration
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require"
DIRECT_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require"

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_DASHBOARD_URL="/dashboard"

# Stripe
STRIPE_PUBLISHABLE_KEY="pk_live_..." # Use live keys for production
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (Resend)
RESEND_API_KEY="re_..."

# Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"

# Security
ENCRYPTION_KEY="your-64-char-hex-key"

# Chat Bot (Optional)
ANTHROPIC_API_KEY="sk-ant-..."
OPENAI_API_KEY="sk-proj-..."
NEXT_PUBLIC_CHAT_BOT_ENABLED=true
```

---

## Phase 3: Database Setup

### 1. Run Database Migrations
```bash
cd /var/www/afilo

# Generate Prisma client
pnpm prisma generate

# Run pending migrations (if any)
pnpm prisma migrate deploy

# Verify database connection
pnpm prisma db pull
```

---

## Phase 4: Process Management with PM2

### 1. Create PM2 Configuration
```bash
# Create PM2 ecosystem file
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
      min_uptime: '10s'
    }
  ]
};
EOF
```

### 2. Create Custom Server File (if needed)
```bash
# Create server.js for PM2
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
      res.end('internal server error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(\`> Ready on http://\${hostname}:\${port}\`);
  });
});
EOF
```

### 3. Start Application with PM2
```bash
# Create logs directory
mkdir -p logs

# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

# Check application status
pm2 status
pm2 logs afilo-app
```

---

## Phase 5: Nginx Reverse Proxy

### 1. Configure Nginx
```bash
# Create Nginx configuration
sudo tee /etc/nginx/sites-available/afilo << 'EOF'
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Static file caching
    location /_next/static {
        proxy_cache STATIC;
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        proxy_pass http://localhost:3000;
    }
}
EOF

# Enable the site
sudo ln -s /etc/nginx/sites-available/afilo /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## Phase 6: SSL Certificate

### 1. Install SSL Certificate
```bash
# Get SSL certificate from Let's Encrypt
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## Phase 7: Deployment Scripts

### 1. Create Deployment Script
```bash
# Create deployment script
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
sudo tar -czf $BACKUP_DIR/afilo_backup_$DATE.tar.gz -C /var/www afilo

# Navigate to app directory
cd $APP_DIR

# Pull latest changes
echo "⬇️ Pulling latest changes..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Build application
echo "🔨 Building application..."
pnpm build

# Run database migrations
echo "🗄️ Running database migrations..."
pnpm prisma generate
pnpm prisma migrate deploy

# Restart application
echo "🔄 Restarting application..."
pm2 restart afilo-app

# Wait for app to start
sleep 10

# Check application health
echo "🏥 Checking application health..."
if curl -f http://localhost:3000/api/health; then
    echo "✅ Deployment successful!"
else
    echo "❌ Health check failed. Rolling back..."
    pm2 restart afilo-app
    exit 1
fi

echo "🎉 Deployment completed successfully!"
EOF

# Make executable
chmod +x deploy.sh
```

### 2. Create Health Check Endpoint
```bash
# This should be added to your Next.js app
mkdir -p app/api/health
cat > app/api/health/route.ts << 'EOF'
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
EOF
```

---

## Phase 8: Monitoring and Logging

### 1. Log Rotation
```bash
# Configure log rotation for PM2
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
        pm2 reloadLogs
    endscript
}
EOF
```

### 2. System Monitoring Script
```bash
# Create monitoring script
cat > monitor.sh << 'EOF'
#!/bin/bash

# Check if application is running
if pm2 list | grep -q "afilo-app.*online"; then
    echo "✅ Application is running"
else
    echo "❌ Application is down"
    pm2 restart afilo-app
fi

# Check disk space
DISK_USAGE=$(df /var/www | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "⚠️ Disk usage is high: ${DISK_USAGE}%"
fi

# Check memory usage
MEMORY_USAGE=$(free | awk '/Mem/ {printf "%.0f", $3/$2 * 100.0}')
if [ $MEMORY_USAGE -gt 80 ]; then
    echo "⚠️ Memory usage is high: ${MEMORY_USAGE}%"
fi

echo "📊 System Status:"
echo "Disk: ${DISK_USAGE}%"
echo "Memory: ${MEMORY_USAGE}%"
EOF

chmod +x monitor.sh

# Add to crontab for regular checks
(crontab -l 2>/dev/null; echo "*/5 * * * * /var/www/afilo/monitor.sh >> /var/www/afilo/logs/monitor.log 2>&1") | crontab -
```

---

## Phase 9: Final Steps

### 1. Security Hardening
```bash
# Disable root SSH login (optional)
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart ssh

# Install fail2ban for brute force protection
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 2. Backup Strategy
```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/var/backups/afilo"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
sudo mkdir -p $BACKUP_DIR

# Backup application files
sudo tar -czf $BACKUP_DIR/app_$DATE.tar.gz -C /var/www afilo

# Keep only last 7 days of backups
find $BACKUP_DIR -name "app_*.tar.gz" -mtime +7 -delete

echo "Backup completed: app_$DATE.tar.gz"
EOF

chmod +x backup.sh

# Schedule daily backups
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/afilo/backup.sh") | crontab -
```

---

## Quick Deployment Commands

```bash
# Initial deployment
git clone https://github.com/your-username/afilo-nextjs-shopify-app.git /var/www/afilo
cd /var/www/afilo
cp .env.example .env.production.local
# Edit .env.production.local with your values
pnpm install
pnpm build
pm2 start ecosystem.config.js
pm2 save
sudo certbot --nginx -d your-domain.com

# Future deployments
cd /var/www/afilo && ./deploy.sh
```

---

## Troubleshooting

### Common Issues

1. **Application won't start**:
   ```bash
   pm2 logs afilo-app
   pm2 restart afilo-app
   ```

2. **Database connection issues**:
   ```bash
   pnpm prisma db pull  # Test connection
   ```

3. **SSL certificate issues**:
   ```bash
   sudo certbot renew
   sudo nginx -t && sudo systemctl reload nginx
   ```

4. **High memory usage**:
   ```bash
   pm2 reload afilo-app  # Graceful restart
   ```

### Monitoring Commands
```bash
# Check application status
pm2 status
pm2 monit

# Check system resources
htop
df -h
free -h

# Check logs
pm2 logs afilo-app
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## Post-Deployment Checklist

- [ ] Application accessible via domain
- [ ] SSL certificate working (https://)
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] PM2 process running
- [ ] Nginx reverse proxy working
- [ ] Monitoring scripts active
- [ ] Backup system configured
- [ ] Log rotation configured

Your Afilo marketplace should now be fully deployed and running on Hetzner! 🎉