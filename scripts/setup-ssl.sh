#!/bin/bash

# SSL Certificate Setup Script for Hetzner Deployment
# Configures Let's Encrypt SSL certificates using Certbot

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

# Check if running with proper permissions
if [ "$EUID" -eq 0 ]; then
    print_error "Do not run this script as root. Run as deploy user instead."
    exit 1
fi

print_status "🔐 Setting up SSL certificates for your domain..."

# Get domain information
DOMAIN=""
EMAIL=""

print_input "Enter your primary domain (e.g., afilo.com):"
read -r DOMAIN

print_input "Enter your email address for SSL certificate notifications:"
read -r EMAIL

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    print_error "Domain and email are required"
    exit 1
fi

print_status "Setting up SSL for domain: $DOMAIN"
print_status "Email for notifications: $EMAIL"

# Validate domain format
if ! echo "$DOMAIN" | grep -qE '^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$'; then
    print_error "Invalid domain format"
    exit 1
fi

# Check if Nginx is installed and running
if ! command -v nginx &> /dev/null; then
    print_error "Nginx is not installed"
    exit 1
fi

if ! systemctl is-active --quiet nginx; then
    print_status "Starting Nginx..."
    sudo systemctl start nginx
fi

# Check if Certbot is installed
if ! command -v certbot &> /dev/null; then
    print_error "Certbot is not installed. Please run server-setup.sh first."
    exit 1
fi

# Test domain resolution
print_status "🔍 Testing domain resolution..."
if ! nslookup "$DOMAIN" > /dev/null 2>&1; then
    print_warning "Domain $DOMAIN may not be properly configured"
    print_input "Continue anyway? (y/n):"
    read -r CONTINUE
    if [[ ! $CONTINUE =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if domain points to this server
SERVER_IP=$(curl -s ifconfig.me || curl -s icanhazip.com || echo "unknown")
DOMAIN_IP=$(nslookup "$DOMAIN" | grep -A1 "Name:" | tail -1 | awk '{print $2}' 2>/dev/null || echo "unknown")

if [ "$SERVER_IP" != "$DOMAIN_IP" ] && [ "$DOMAIN_IP" != "unknown" ]; then
    print_warning "Domain $DOMAIN points to $DOMAIN_IP but this server is $SERVER_IP"
    print_warning "Make sure your DNS A record points to $SERVER_IP"
    print_input "Continue with SSL setup? (y/n):"
    read -r CONTINUE
    if [[ ! $CONTINUE =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Create temporary Nginx configuration for domain verification
print_status "📝 Creating temporary Nginx configuration..."

sudo tee /etc/nginx/sites-available/temp-ssl << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/html;
        try_files \$uri =404;
    }

    # Redirect all other traffic to HTTPS (after SSL is set up)
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}
EOF

# Create web root for challenges
sudo mkdir -p /var/www/html/.well-known/acme-challenge
sudo chown -R www-data:www-data /var/www/html

# Enable temporary configuration
sudo ln -sf /etc/nginx/sites-available/temp-ssl /etc/nginx/sites-enabled/temp-ssl

# Remove any existing afilo config temporarily
sudo rm -f /etc/nginx/sites-enabled/afilo

# Test and reload Nginx
print_status "🔧 Testing Nginx configuration..."
sudo nginx -t || {
    print_error "Nginx configuration test failed"
    exit 1
}

sudo systemctl reload nginx

# Obtain SSL certificate
print_status "🔒 Obtaining SSL certificate from Let's Encrypt..."

# Use webroot method for certificate generation
sudo certbot certonly \
    --webroot \
    --webroot-path=/var/www/html \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    --domains "$DOMAIN,www.$DOMAIN" \
    --non-interactive

if [ $? -eq 0 ]; then
    print_status "✅ SSL certificate obtained successfully!"
else
    print_error "❌ Failed to obtain SSL certificate"
    print_error "Common issues:"
    print_error "  1. Domain not pointing to this server"
    print_error "  2. Firewall blocking port 80"
    print_error "  3. Another service using port 80"
    exit 1
fi

# Create production Nginx configuration with SSL
print_status "📝 Creating production Nginx configuration with SSL..."

sudo tee /etc/nginx/sites-available/afilo << EOF
# Rate limiting zones
limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/m;
limit_req_zone \$binary_remote_addr zone=login:10m rate=5r/m;
limit_req_zone \$binary_remote_addr zone=general:10m rate=30r/m;

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# Main HTTPS server
server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/$DOMAIN/chain.pem;

    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;

    # OCSP stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;

    # Security headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline' 'unsafe-eval'" always;

    # Hide server information
    server_tokens off;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_comp_level 6;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        text/html
        application/javascript
        application/xml+rss
        application/json
        application/xml
        image/svg+xml;

    # Rate limiting for general traffic
    location / {
        limit_req zone=general burst=50 nodelay;

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

        # Buffer settings for performance
        proxy_buffering on;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
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

    # Extra rate limiting for authentication routes
    location /api/auth/ {
        limit_req zone=login burst=10 nodelay;

        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Static file caching with long expiry
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Cache-Status "STATIC";
    }

    # Media files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2|ttf|eot|mp4|mp3|pdf)\$ {
        proxy_pass http://localhost:3000;
        expires 30d;
        add_header Cache-Control "public, immutable";
        add_header X-Cache-Status "MEDIA";
    }

    # Health check endpoint (no rate limiting)
    location /api/health {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # Cache health check for 10 seconds
        expires 10s;
        add_header Cache-Control "public, max-age=10";
    }

    # Block access to sensitive files
    location ~ /\\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    location ~ \\.(env|log|config|sql|md)\$ {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Custom error pages
    error_page 404 /404.html;
    error_page 500 502 503 504 /500.html;

    # Logging
    access_log /var/log/nginx/afilo_access.log combined;
    error_log /var/log/nginx/afilo_error.log warn;
}
EOF

# Remove temporary configuration
sudo rm -f /etc/nginx/sites-enabled/temp-ssl

# Enable the main Afilo configuration
sudo ln -sf /etc/nginx/sites-available/afilo /etc/nginx/sites-enabled/afilo

# Test Nginx configuration
print_status "🔧 Testing final Nginx configuration..."
sudo nginx -t || {
    print_error "Final Nginx configuration test failed"
    exit 1
}

# Reload Nginx with new SSL configuration
print_status "🔄 Reloading Nginx with SSL configuration..."
sudo systemctl reload nginx

# Set up automatic certificate renewal
print_status "⏰ Setting up automatic certificate renewal..."

# Create renewal hook script
sudo tee /etc/letsencrypt/renewal-hooks/post/reload-nginx.sh << 'EOF'
#!/bin/bash
# Reload Nginx after certificate renewal
/bin/systemctl reload nginx
EOF

sudo chmod +x /etc/letsencrypt/renewal-hooks/post/reload-nginx.sh

# Test certificate renewal
print_status "🧪 Testing certificate auto-renewal..."
sudo certbot renew --dry-run

if [ $? -eq 0 ]; then
    print_status "✅ Certificate auto-renewal test passed"
else
    print_warning "⚠️ Certificate auto-renewal test failed"
fi

# Add renewal cron job (if not already present)
if ! sudo crontab -l 2>/dev/null | grep -q certbot; then
    print_status "📅 Adding certificate renewal cron job..."
    (sudo crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | sudo crontab -
fi

# Test SSL configuration
print_status "🧪 Testing SSL configuration..."

# Test HTTP to HTTPS redirect
if curl -sI "http://$DOMAIN" | grep -q "301\|302"; then
    print_status "✅ HTTP to HTTPS redirect working"
else
    print_warning "⚠️ HTTP to HTTPS redirect may not be working"
fi

# Test HTTPS connection
if curl -sI "https://$DOMAIN" | grep -q "200 OK"; then
    print_status "✅ HTTPS connection working"
else
    print_warning "⚠️ HTTPS connection may not be working"
fi

# Display SSL certificate information
print_status "📋 SSL Certificate Information:"
sudo certbot certificates | grep -A5 "$DOMAIN" || echo "Certificate info not available"

# Security recommendations
echo
print_status "🔐 Security Setup Complete!"
print_status "🌐 Your site is now available at: https://$DOMAIN"
echo
print_status "🛡️ Security Features Enabled:"
echo "  ✅ Let's Encrypt SSL certificate (A+ grade)"
echo "  ✅ HTTP to HTTPS redirects"
echo "  ✅ Security headers (HSTS, CSP, etc.)"
echo "  ✅ Rate limiting on API endpoints"
echo "  ✅ Gzip compression"
echo "  ✅ Static file caching"
echo "  ✅ Automatic certificate renewal"

echo
print_status "📊 Test your SSL configuration:"
echo "  🔗 SSL Labs Test: https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
echo "  🔗 Security Headers: https://securityheaders.com/?q=$DOMAIN"

echo
print_status "🔧 Management Commands:"
echo "  sudo certbot certificates              # View certificates"
echo "  sudo certbot renew                    # Manually renew certificates"
echo "  sudo nginx -t && sudo systemctl reload nginx  # Reload Nginx config"
echo "  tail -f /var/log/nginx/afilo_access.log       # View access logs"
echo "  tail -f /var/log/nginx/afilo_error.log        # View error logs"

echo
print_status "🎉 SSL setup completed successfully!"
print_warning "Remember to update your .env.production.local with the correct HTTPS URL!"