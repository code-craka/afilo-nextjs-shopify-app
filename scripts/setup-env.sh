#!/bin/bash

# Environment Setup Script for Production
# Run this script to configure production environment variables

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_input() {
    echo -e "${BLUE}[INPUT]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

ENV_FILE=".env.production.local"
TEMPLATE_FILE=".env.production.template"

print_status "🔧 Setting up production environment configuration..."

# Check if template exists
if [ ! -f "$TEMPLATE_FILE" ]; then
    print_error "Template file $TEMPLATE_FILE not found!"
    exit 1
fi

# Copy template if env file doesn't exist
if [ ! -f "$ENV_FILE" ]; then
    print_status "Creating new environment file from template..."
    cp "$TEMPLATE_FILE" "$ENV_FILE"
else
    print_warning "Environment file already exists. Creating backup..."
    cp "$ENV_FILE" "${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
fi

echo
print_status "Let's configure your production environment step by step..."
echo

# Domain configuration
print_input "Enter your production domain (e.g., afilo.com):"
read -r DOMAIN
if [ -n "$DOMAIN" ]; then
    sed -i "s|https://your-domain.com|https://$DOMAIN|g" "$ENV_FILE"
    sed -i "s|noreply@your-domain.com|noreply@$DOMAIN|g" "$ENV_FILE"
    print_status "✅ Domain configured: $DOMAIN"
fi

echo

# Database configuration
print_input "Enter your Neon database URL (postgresql://...):"
read -r DATABASE_URL
if [ -n "$DATABASE_URL" ]; then
    # Escape special characters for sed
    ESCAPED_URL=$(echo "$DATABASE_URL" | sed 's|[[\.*^$()+?{|\\]|\\\0|g')
    sed -i "s|DATABASE_URL=\"postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require\"|DATABASE_URL=\"$DATABASE_URL\"|g" "$ENV_FILE"
    sed -i "s|DIRECT_URL=\"postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require\"|DIRECT_URL=\"$DATABASE_URL\"|g" "$ENV_FILE"
    print_status "✅ Database URL configured"
fi

echo

# Clerk configuration
print_input "Enter your Clerk publishable key (pk_live_...):"
read -r CLERK_PUB_KEY
if [ -n "$CLERK_PUB_KEY" ]; then
    sed -i "s|NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=\"pk_live_xxxxxxxxxxxxxxxxxx\"|NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=\"$CLERK_PUB_KEY\"|g" "$ENV_FILE"
    print_status "✅ Clerk publishable key configured"
fi

print_input "Enter your Clerk secret key (sk_live_...):"
read -r CLERK_SECRET_KEY
if [ -n "$CLERK_SECRET_KEY" ]; then
    sed -i "s|CLERK_SECRET_KEY=\"sk_live_xxxxxxxxxxxxxxxxxx\"|CLERK_SECRET_KEY=\"$CLERK_SECRET_KEY\"|g" "$ENV_FILE"
    print_status "✅ Clerk secret key configured"
fi

echo

# Stripe configuration
print_input "Enter your Stripe publishable key (pk_live_...):"
read -r STRIPE_PUB_KEY
if [ -n "$STRIPE_PUB_KEY" ]; then
    sed -i "s|STRIPE_PUBLISHABLE_KEY=\"pk_live_xxxxxxxxxxxxxxxxxx\"|STRIPE_PUBLISHABLE_KEY=\"$STRIPE_PUB_KEY\"|g" "$ENV_FILE"
    print_status "✅ Stripe publishable key configured"
fi

print_input "Enter your Stripe secret key (sk_live_...):"
read -r STRIPE_SECRET_KEY
if [ -n "$STRIPE_SECRET_KEY" ]; then
    sed -i "s|STRIPE_SECRET_KEY=\"sk_live_xxxxxxxxxxxxxxxxxx\"|STRIPE_SECRET_KEY=\"$STRIPE_SECRET_KEY\"|g" "$ENV_FILE"
    print_status "✅ Stripe secret key configured"
fi

print_input "Enter your Stripe webhook secret (whsec_...):"
read -r STRIPE_WEBHOOK_SECRET
if [ -n "$STRIPE_WEBHOOK_SECRET" ]; then
    sed -i "s|STRIPE_WEBHOOK_SECRET=\"whsec_xxxxxxxxxxxxxxxxxx\"|STRIPE_WEBHOOK_SECRET=\"$STRIPE_WEBHOOK_SECRET\"|g" "$ENV_FILE"
    print_status "✅ Stripe webhook secret configured"
fi

echo

# Resend configuration
print_input "Enter your Resend API key (re_...):"
read -r RESEND_API_KEY
if [ -n "$RESEND_API_KEY" ]; then
    sed -i "s|RESEND_API_KEY=\"re_xxxxxxxxxxxxxxxxxx\"|RESEND_API_KEY=\"$RESEND_API_KEY\"|g" "$ENV_FILE"
    print_status "✅ Resend API key configured"
fi

echo

# Generate encryption key
print_status "Generating secure encryption key..."
ENCRYPTION_KEY=$(openssl rand -hex 32)
sed -i "s|ENCRYPTION_KEY=\"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\"|ENCRYPTION_KEY=\"$ENCRYPTION_KEY\"|g" "$ENV_FILE"
print_status "✅ Encryption key generated"

echo

# Optional configurations
print_input "Do you want to configure Google Analytics? (y/n):"
read -r CONFIGURE_GA
if [[ $CONFIGURE_GA =~ ^[Yy]$ ]]; then
    print_input "Enter your Google Analytics Measurement ID (G-...):"
    read -r GA_ID
    if [ -n "$GA_ID" ]; then
        sed -i "s|NEXT_PUBLIC_GA_MEASUREMENT_ID=\"G-XXXXXXXXXX\"|NEXT_PUBLIC_GA_MEASUREMENT_ID=\"$GA_ID\"|g" "$ENV_FILE"
        sed -i "s|NEXT_PUBLIC_GA_TRACKING_ID=\"G-XXXXXXXXXX\"|NEXT_PUBLIC_GA_TRACKING_ID=\"$GA_ID\"|g" "$ENV_FILE"
        print_status "✅ Google Analytics configured"
    fi
fi

echo

print_input "Do you want to configure the AI Chat Bot? (y/n):"
read -r CONFIGURE_CHATBOT
if [[ $CONFIGURE_CHATBOT =~ ^[Yy]$ ]]; then
    print_input "Enter your Anthropic API key (sk-ant-...):"
    read -r ANTHROPIC_KEY
    if [ -n "$ANTHROPIC_KEY" ]; then
        sed -i "s|ANTHROPIC_API_KEY=\"sk-ant-xxxxxxxxxxxxxxxxxx\"|ANTHROPIC_API_KEY=\"$ANTHROPIC_KEY\"|g" "$ENV_FILE"
        print_status "✅ Anthropic API key configured"
    fi

    print_input "Enter your OpenAI API key (sk-proj-...):"
    read -r OPENAI_KEY
    if [ -n "$OPENAI_KEY" ]; then
        sed -i "s|OPENAI_API_KEY=\"sk-proj-xxxxxxxxxxxxxxxxxx\"|OPENAI_API_KEY=\"$OPENAI_KEY\"|g" "$ENV_FILE"
        print_status "✅ OpenAI API key configured"
    fi
else
    sed -i "s|NEXT_PUBLIC_CHAT_BOT_ENABLED=true|NEXT_PUBLIC_CHAT_BOT_ENABLED=false|g" "$ENV_FILE"
    print_status "✅ Chat bot disabled"
fi

echo

# Set deployment info
CURRENT_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
BUILD_ID="build-$(date +%Y%m%d_%H%M%S)"
sed -i "s|DEPLOYMENT_DATE=\"2024-01-01T00:00:00Z\"|DEPLOYMENT_DATE=\"$CURRENT_DATE\"|g" "$ENV_FILE"
sed -i "s|BUILD_ID=\"build-xxxxxxxxx\"|BUILD_ID=\"$BUILD_ID\"|g" "$ENV_FILE"

print_status "✅ Deployment info configured"

echo
print_status "🎉 Environment configuration completed!"
echo
print_status "📄 Configuration file: $ENV_FILE"
print_warning "⚠️  Please review the file and update any remaining placeholder values"
print_status "🔒 Keep this file secure - it contains sensitive information"

echo
print_status "Next steps:"
echo "  1. Review and update any remaining configuration in $ENV_FILE"
echo "  2. Ensure all API keys and secrets are correct"
echo "  3. Test the configuration with: pnpm build"
echo "  4. Deploy using: ./deploy.sh"

# Security check
chmod 600 "$ENV_FILE"
print_status "✅ Environment file permissions set to 600 (secure)"

echo
print_status "🔍 Configuration summary:"
grep -E "^(NEXT_PUBLIC_APP_URL|NODE_ENV|NEXT_PUBLIC_CHAT_BOT_ENABLED|NEXT_PUBLIC_GA_MEASUREMENT_ID)" "$ENV_FILE" | sed 's/=/ = /' || true

echo
print_warning "Remember to:"
echo "  • Never commit .env.production.local to version control"
echo "  • Keep your API keys secure"
echo "  • Test all integrations before going live"
echo "  • Set up monitoring and backups"