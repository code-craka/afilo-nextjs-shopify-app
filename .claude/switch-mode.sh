#!/bin/bash

# Afilo Claude Code Mode Switcher
# Usage: ./.claude/switch-mode.sh [light|enterprise|shopify|testing]

MODE=$1

if [ -z "$MODE" ]; then
  echo "🎯 Afilo Claude Code - Mode Switcher"
  echo ""
  echo "Usage: ./.claude/switch-mode.sh [mode]"
  echo ""
  echo "Available modes:"
  echo "  light      - Minimal context (quick fixes, routine tasks)"
  echo "  enterprise - Full enterprise features (pricing, billing, subscriptions)"
  echo "  shopify    - E-commerce focus (product catalog, cart, API)"
  echo "  testing    - Debugging tools (testing, troubleshooting)"
  echo ""
  echo "Current configuration:"
  if [ -L ".claude/mcp-config.json" ]; then
    TARGET=$(readlink .claude/mcp-config.json)
    echo "  Mode: ${TARGET##*/mcp-config-}"
  else
    echo "  Mode: default (not using switcher)"
  fi
  exit 0
fi

case $MODE in
  light|enterprise|shopify|testing)
    # Backup original if it exists and is not a symlink
    if [ -f ".claude/mcp-config.json" ] && [ ! -L ".claude/mcp-config.json" ]; then
      mv .claude/mcp-config.json .claude/mcp-config-original.json
      echo "📦 Original config backed up to mcp-config-original.json"
    fi

    # Remove existing symlink if present
    if [ -L ".claude/mcp-config.json" ]; then
      rm .claude/mcp-config.json
    fi

    # Create symlink to selected config
    ln -s "mcp-config-${MODE}.json" .claude/mcp-config.json

    echo "✅ Switched to ${MODE} mode"
    echo ""
    echo "Context load: $(grep -o '"contextLoad": "[^"]*"' .claude/mcp-config-${MODE}.json | cut -d'"' -f4)"
    echo "Usage: $(grep -o '"usage": "[^"]*"' .claude/mcp-config-${MODE}.json | cut -d'"' -f4)"
    echo ""
    echo "To update CLAUDE.md, run:"
    echo "  ./.claude/update-claude-md.sh ${MODE}"
    ;;
  *)
    echo "❌ Invalid mode: $MODE"
    echo "Available modes: light, enterprise, shopify, testing"
    exit 1
    ;;
esac
