#!/bin/bash

# Swap Space Setup Script
# Creates 2GB swap file for emergency RAM buffer
# Part of Performance Optimization - Option A

set -e

echo "🔧 Setting up 2GB Swap Space..."

# Check if swap already exists
if [ -f /swapfile ] && swapon --show | grep -q '/swapfile'; then
    echo "✅ Swap file already exists and is active"
    swapon --show
    free -h
    exit 0
fi

# Check if swap file exists but not enabled
if [ -f /swapfile ]; then
    echo "⚠️  Swap file exists but not enabled. Enabling..."
    chmod 600 /swapfile
    swapon /swapfile
    if ! grep -q '/swapfile' /etc/fstab; then
        echo '/swapfile none swap sw 0 0' >> /etc/fstab
    fi
    echo "✅ Swap enabled successfully"
    swapon --show
    free -h
    exit 0
fi

# Create new swap file
echo "📦 Creating 2GB swap file..."
fallocate -l 2G /swapfile
chmod 600 /swapfile

echo "🔨 Formatting swap file..."
mkswap /swapfile

echo "🚀 Enabling swap..."
swapon /swapfile

# Make swap permanent across reboots
if ! grep -q '/swapfile' /etc/fstab; then
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    echo "✅ Added swap to /etc/fstab for persistence"
fi

# Set swappiness to 10 (only use swap when needed)
sysctl vm.swappiness=10
if ! grep -q 'vm.swappiness' /etc/sysctl.conf; then
    echo 'vm.swappiness=10' >> /etc/sysctl.conf
    echo "✅ Set swappiness to 10 (conservative)"
fi

echo ""
echo "✅ Swap setup complete!"
echo ""
echo "Current Memory Status:"
free -h
echo ""
echo "Swap Details:"
swapon --show
