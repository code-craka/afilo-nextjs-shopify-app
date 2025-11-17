#!/bin/bash

# Redis Installation & Configuration Script
# Part of Performance Optimization - Option A
# Expected Impact: Products page 2.7s → 0.3s (90% faster)

set -e

echo "🔧 Setting up Redis Server..."

# Check if Redis is already installed
if command -v redis-server &> /dev/null; then
    echo "✅ Redis is already installed"
    redis-server --version

    # Check if Redis is running
    if systemctl is-active --quiet redis-server || systemctl is-active --quiet redis; then
        echo "✅ Redis is running"
        systemctl status redis-server || systemctl status redis --no-pager -l
    else
        echo "⚠️  Redis installed but not running. Starting..."
        systemctl start redis-server || systemctl start redis
        systemctl enable redis-server || systemctl enable redis
        echo "✅ Redis started and enabled"
    fi
else
    echo "📦 Installing Redis..."
    apt-get update
    apt-get install -y redis-server

    echo "⚙️  Configuring Redis..."
    # Set maxmemory to 256MB (conservative for 3.7GB RAM system)
    sed -i 's/^# maxmemory .*/maxmemory 256mb/' /etc/redis/redis.conf
    sed -i 's/^maxmemory .*/maxmemory 256mb/' /etc/redis/redis.conf

    # Set eviction policy to LRU (Least Recently Used)
    sed -i 's/^# maxmemory-policy .*/maxmemory-policy allkeys-lru/' /etc/redis/redis.conf
    sed -i 's/^maxmemory-policy .*/maxmemory-policy allkeys-lru/' /etc/redis/redis.conf

    # Enable Redis
    systemctl enable redis-server
    systemctl start redis-server

    echo "✅ Redis installed and started"
fi

echo ""
echo "📊 Redis Status:"
systemctl status redis-server --no-pager -l || systemctl status redis --no-pager -l

echo ""
echo "🧪 Testing Redis connection..."
redis-cli ping

echo ""
echo "📈 Redis Info:"
redis-cli INFO memory | grep -E 'used_memory_human|maxmemory_human|maxmemory_policy'

echo ""
echo "✅ Redis setup complete!"
echo "   Max Memory: 256MB"
echo "   Eviction Policy: allkeys-lru"
echo "   Status: Running"
