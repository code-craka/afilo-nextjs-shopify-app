#!/bin/bash

# Hetzner Ubuntu Server Setup Script
# Run this script as root on a fresh Ubuntu 22.04/24.04 server

set -e

echo "🚀 Starting Hetzner server setup for Afilo marketplace..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "This script must be run as root"
    exit 1
fi

print_status "Updating system packages..."
apt update && apt upgrade -y

print_status "Installing essential packages..."
apt install -y curl wget git unzip software-properties-common ufw fail2ban htop

print_status "Creating deploy user..."
if ! id -u deploy > /dev/null 2>&1; then
    adduser --disabled-password --gecos "" deploy
    usermod -aG sudo deploy
    print_status "Deploy user created"
else
    print_warning "Deploy user already exists"
fi

# Set up SSH key for deploy user (optional)
print_status "Setting up SSH directory for deploy user..."
mkdir -p /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
touch /home/deploy/.ssh/authorized_keys
chmod 600 /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh

print_status "Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

print_status "Installing pnpm..."
npm install -g pnpm@latest

print_status "Installing PM2..."
npm install -g pm2

print_status "Installing Nginx..."
apt install -y nginx

print_status "Installing Certbot for SSL..."
apt install -y certbot python3-certbot-nginx

print_status "Configuring firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

print_status "Configuring fail2ban..."
systemctl enable fail2ban
systemctl start fail2ban

print_status "Creating application directories..."
mkdir -p /var/www
chown -R deploy:deploy /var/www

print_status "Optimizing system settings..."

# Increase file limits for Node.js
cat > /etc/security/limits.d/nodejs.conf << 'EOF'
deploy soft nofile 65536
deploy hard nofile 65536
root soft nofile 65536
root hard nofile 65536
EOF

# Optimize kernel parameters for web server
cat > /etc/sysctl.d/99-afilo.conf << 'EOF'
# Network optimizations
net.core.somaxconn = 65536
net.core.netdev_max_backlog = 5000
net.ipv4.tcp_max_syn_backlog = 8192
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_fin_timeout = 30

# File system optimizations
fs.file-max = 2097152
vm.swappiness = 10
EOF

sysctl -p /etc/sysctl.d/99-afilo.conf

print_status "Setting up log rotation..."
cat > /etc/logrotate.d/nginx << 'EOF'
/var/log/nginx/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 `cat /var/run/nginx.pid`
        fi
    endscript
}
EOF

print_status "Configuring automatic security updates..."
apt install -y unattended-upgrades
cat > /etc/apt/apt.conf.d/50unattended-upgrades << 'EOF'
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}";
    "${distro_id}:${distro_codename}-security";
    "${distro_id}ESMApps:${distro_codename}-apps-security";
    "${distro_id}ESM:${distro_codename}-infra-security";
};
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
EOF

echo 'APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Download-Upgradeable-Packages "1";
APT::Periodic::AutocleanInterval "7";
APT::Periodic::Unattended-Upgrade "1";' > /etc/apt/apt.conf.d/20auto-upgrades

systemctl enable unattended-upgrades

print_status "Setting up system monitoring..."
cat > /usr/local/bin/system-monitor.sh << 'EOF'
#!/bin/bash

# System monitoring script
LOG_FILE="/var/log/system-monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Check disk space
DISK_USAGE=$(df /var/www 2>/dev/null | awk 'NR==2 {print $5}' | sed 's/%//' || echo "0")
DISK_USAGE=${DISK_USAGE:-0}

# Check memory usage
MEMORY_USAGE=$(free | awk '/Mem/ {printf "%.0f", $3/$2 * 100.0}' || echo "0")

# Check CPU load
CPU_LOAD=$(uptime | awk '{print $10}' | sed 's/,//' || echo "0")

echo "[$DATE] Disk: ${DISK_USAGE}%, Memory: ${MEMORY_USAGE}%, Load: ${CPU_LOAD}" >> $LOG_FILE

# Alert if disk usage > 80%
if [ "$DISK_USAGE" -gt 80 ]; then
    echo "[$DATE] WARNING: High disk usage: ${DISK_USAGE}%" >> $LOG_FILE
fi

# Alert if memory usage > 85%
if [ "$MEMORY_USAGE" -gt 85 ]; then
    echo "[$DATE] WARNING: High memory usage: ${MEMORY_USAGE}%" >> $LOG_FILE
fi
EOF

chmod +x /usr/local/bin/system-monitor.sh

# Add to crontab
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/system-monitor.sh") | crontab -

print_status "Cleaning up..."
apt autoremove -y
apt autoclean

print_status "Verifying installations..."
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"
echo "pnpm version: $(pnpm --version)"
echo "PM2 version: $(pm2 --version)"
echo "Nginx version: $(nginx -v 2>&1)"
echo "Certbot version: $(certbot --version)"

print_status "Creating deployment ready indicator..."
touch /tmp/server-setup-complete

echo
echo "🎉 Server setup completed successfully!"
echo
echo "Next steps:"
echo "1. Switch to deploy user: su - deploy"
echo "2. Clone your repository: git clone <your-repo-url> /var/www/afilo"
echo "3. Run the application setup script"
echo
echo "Server is ready for deployment! ✨"