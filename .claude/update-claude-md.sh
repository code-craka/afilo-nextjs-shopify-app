#!/bin/bash

# Afilo CLAUDE.md Updater
# Usage: ./.claude/update-claude-md.sh [light|enterprise|shopify|workflows]

MODE=$1

if [ -z "$MODE" ]; then
  echo "🎯 Afilo CLAUDE.md Updater"
  echo ""
  echo "Usage: ./.claude/update-claude-md.sh [mode]"
  echo ""
  echo "Available modes:"
  echo "  light     - Core essentials only (~100 lines)"
  echo "  enterprise - Add enterprise features (~300 lines)"
  echo "  shopify   - Add Shopify integration (~250 lines)"
  echo "  workflows - Add development workflows (~200 lines)"
  echo ""
  echo "Current CLAUDE.md: $(wc -l < CLAUDE.md) lines"
  exit 0
fi

case $MODE in
  light)
    cp .claude/CLAUDE-CORE.md CLAUDE.md
    echo "✅ CLAUDE.md updated to light mode (core essentials only)"
    ;;
  enterprise)
    cat .claude/CLAUDE-CORE.md > CLAUDE.md
    echo "" >> CLAUDE.md
    echo "---" >> CLAUDE.md
    echo "" >> CLAUDE.md
    cat .claude/CLAUDE-ENTERPRISE.md >> CLAUDE.md
    echo "✅ CLAUDE.md updated with enterprise features"
    ;;
  shopify)
    cat .claude/CLAUDE-CORE.md > CLAUDE.md
    echo "" >> CLAUDE.md
    echo "---" >> CLAUDE.md
    echo "" >> CLAUDE.md
    cat .claude/CLAUDE-SHOPIFY.md >> CLAUDE.md
    echo "✅ CLAUDE.md updated with Shopify integration"
    ;;
  workflows)
    cat .claude/CLAUDE-CORE.md > CLAUDE.md
    echo "" >> CLAUDE.md
    echo "---" >> CLAUDE.md
    echo "" >> CLAUDE.md
    cat .claude/CLAUDE-WORKFLOWS.md >> CLAUDE.md
    echo "✅ CLAUDE.md updated with development workflows"
    ;;
  full)
    cat .claude/CLAUDE-CORE.md > CLAUDE.md
    echo "" >> CLAUDE.md
    echo "---" >> CLAUDE.md
    echo "" >> CLAUDE.md
    cat .claude/CLAUDE-ENTERPRISE.md >> CLAUDE.md
    echo "" >> CLAUDE.md
    echo "---" >> CLAUDE.md
    echo "" >> CLAUDE.md
    cat .claude/CLAUDE-SHOPIFY.md >> CLAUDE.md
    echo "" >> CLAUDE.md
    echo "---" >> CLAUDE.md
    echo "" >> CLAUDE.md
    cat .claude/CLAUDE-WORKFLOWS.md >> CLAUDE.md
    echo "✅ CLAUDE.md updated to full mode (all modules)"
    ;;
  *)
    echo "❌ Invalid mode: $MODE"
    echo "Available modes: light, enterprise, shopify, workflows, full"
    exit 1
    ;;
esac

echo ""
echo "Updated CLAUDE.md: $(wc -l < CLAUDE.md) lines"
