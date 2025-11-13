# 🚀 Hetzner Deployment Quick Start Guide

**Deploy your Afilo marketplace to production in 30 minutes!**

## Prerequisites ✅

- [ ] Hetzner Cloud server (CPX31 or better - 4 vCPU, 8GB RAM)
- [ ] Ubuntu 22.04 LTS or 24.04 LTS
- [ ] Domain name pointing to your server IP
- [ ] Neon PostgreSQL database ready
- [ ] Stripe account (live keys)
- [ ] Clerk account (production keys)
- [ ] Resend account for emails

---

## Step 1: Initial Server Setup (5 minutes)

```bash
# SSH into your server as root
ssh root@YOUR_SERVER_IP

# Run the automated server setup
curl -fsSL https://raw.githubusercontent.com/your-repo/afilo-nextjs-shopify-app/main/scripts/server-setup.sh | bash

# Switch to deploy user
su - deploy
```

**What this does:**
- Installs Node.js 20, pnpm, PM2, Nginx
- Creates deploy user with sudo access
- Configures firewall and security
- Sets up system monitoring

---

## Step 2: Clone and Setup Application (5 minutes)

```bash
# Clone your repository
git clone https://github.com/your-username/afilo-nextjs-shopify-app.git /var/www/afilo
cd /var/www/afilo

# Make scripts executable
chmod +x scripts/*.sh

# Run application setup (interactive)
./scripts/app-setup.sh
```

**During setup, you'll be prompted for:**
- Domain name (e.g., afilo.com)
- Email for SSL certificate
- Git repository URL

---

## Step 3: Configure Environment (5 minutes)

```bash
# Run interactive environment setup
./scripts/setup-env.sh
```

**You'll need to provide:**
- Neon database URL
- Clerk publishable & secret keys
- Stripe publishable & secret keys
- Stripe webhook secret
- Resend API key
- Optional: Google Analytics ID
- Optional: Anthropic & OpenAI API keys (for chat bot)

---

## Step 4: Database Setup (3 minutes)

```bash
# Setup database with migrations and health checks
./scripts/db-setup.sh

# Verify database health
./check-db-health.sh
```

**What this does:**
- Tests database connection
- Applies pending migrations
- Creates performance indexes
- Seeds essential data
- Creates backup scripts

---

## Step 5: SSL Certificate Setup (5 minutes)

```bash
# Setup Let's Encrypt SSL certificates
./scripts/setup-ssl.sh
```

**This will:**
- Configure Nginx with SSL
- Obtain Let's Encrypt certificates
- Set up automatic renewal
- Enable security headers
- Configure rate limiting

---

## Step 6: Enable Monitoring (2 minutes)

```bash
# Setup production monitoring and logging
./scripts/setup-monitoring.sh

# Check monitoring status
./status-dashboard.sh
```

**Monitoring includes:**
- System resource monitoring (every 5 min)
- Application health checks
- Performance monitoring
- Log rotation and cleanup
- SSL certificate expiry tracking

---

## Step 7: Deploy and Go Live! (5 minutes)

```bash
# Run initial deployment
./scripts/deploy.sh

# Check application status
./status-dashboard.sh
```

**Your application is now live at:**
- 🌐 https://your-domain.com
- 🛡️ SSL A+ grade security
- 📊 Production monitoring active

---

## 🎉 Success! Your marketplace is now live!

### Quick Health Check

```bash
# Check everything is working
curl -s https://your-domain.com/api/health | jq .

# View application status
pm2 status

# Check system resources
./status-dashboard.sh
```

---

## 📋 Post-Deployment Checklist

- [ ] ✅ Application accessible via HTTPS
- [ ] ✅ SSL certificate working (A+ grade)
- [ ] ✅ Database migrations applied
- [ ] ✅ PM2 process running
- [ ] ✅ Monitoring active
- [ ] ✅ Backups configured
- [ ] 🔄 Test user registration/login
- [ ] 🔄 Test product creation
- [ ] 🔄 Test payment processing
- [ ] 🔄 Test email delivery

---

## 🛠️ Daily Management Commands

```bash
# Application Management
pm2 status                    # Check app status
pm2 logs afilo-app            # View logs
pm2 restart afilo-app         # Restart app
./scripts/deploy.sh           # Deploy updates
./scripts/quick-deploy.sh     # Quick deploy for minor changes

# Monitoring & Health
./status-dashboard.sh         # System overview
./check-db-health.sh          # Database health
tail -f /var/log/afilo/system-monitor.log  # Live monitoring

# Maintenance
./backup-db.sh                # Manual database backup
./cleanup-logs.sh             # Clean old logs
./scripts/deploy.sh --rollback # Emergency rollback
```

---

## 🚨 Troubleshooting

### Application won't start
```bash
pm2 logs afilo-app
pm2 restart afilo-app
```

### SSL issues
```bash
sudo certbot renew
sudo nginx -t && sudo systemctl reload nginx
```

### Database connection issues
```bash
./check-db-health.sh
# Check .env.production.local DATABASE_URL
```

### High resource usage
```bash
./status-dashboard.sh
pm2 reload afilo-app  # Graceful restart
```

### Check logs
```bash
# Application logs
tail -f /var/www/afilo/logs/combined.log

# System logs
tail -f /var/log/afilo/system-monitor.log

# Nginx logs
sudo tail -f /var/log/nginx/afilo_error.log
```

---

## 🔗 Important URLs

- **Application**: https://your-domain.com
- **Admin Dashboard**: https://your-domain.com/dashboard/admin
- **Health Check**: https://your-domain.com/api/health
- **SSL Test**: https://www.ssllabs.com/ssltest/analyze.html?d=your-domain.com

---

## 📞 Support

**Documentation:**
- Main guide: `docs/HETZNER_DEPLOYMENT.md`
- Environment setup: `.env.production.template`
- All scripts: `scripts/` directory

**Logs locations:**
- Application: `/var/www/afilo/logs/`
- System: `/var/log/afilo/`
- Nginx: `/var/log/nginx/`

**Need help?** Check the troubleshooting section in the main deployment guide.

---

🎉 **Congratulations!** Your Afilo marketplace is now running in production with enterprise-grade monitoring and security!