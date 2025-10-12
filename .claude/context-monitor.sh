#!/bin/bash

# Afilo Context Usage Monitor
# Estimates context token usage for current configuration

echo "🔍 Afilo Context Usage Monitor"
echo ""

# Detect current mode
if [ -L ".claude/mcp-config.json" ]; then
  TARGET=$(readlink .claude/mcp-config.json)
  MODE="${TARGET##*/mcp-config-}"
  MODE="${MODE%.json}"
  echo "Current mode: ${MODE}"
else
  MODE="default (full)"
  echo "Current mode: ${MODE}"
fi

echo ""
echo "📊 Context Load Analysis:"
echo ""

# Check CLAUDE.md
if [ -f "CLAUDE.md" ]; then
  CLAUDE_LINES=$(wc -l < CLAUDE.md)
  CLAUDE_TOKENS=$((CLAUDE_LINES * 15))  # Estimate ~15 tokens per line
  echo "CLAUDE.md: ${CLAUDE_LINES} lines (~${CLAUDE_TOKENS} tokens)"
else
  echo "CLAUDE.md: Not found"
  CLAUDE_TOKENS=0
fi

# Check global CLAUDE.md
if [ -f ~/.claude/CLAUDE.md ]; then
  GLOBAL_LINES=$(wc -l < ~/.claude/CLAUDE.md)
  GLOBAL_TOKENS=$((GLOBAL_LINES * 15))
  echo "~/.claude/CLAUDE.md: ${GLOBAL_LINES} lines (~${GLOBAL_TOKENS} tokens)"
else
  echo "~/.claude/CLAUDE.md: Not found"
  GLOBAL_TOKENS=0
fi

# Check context files
CONTEXT_DIR=".claude/context"
if [ -d "$CONTEXT_DIR" ]; then
  CONTEXT_LINES=$(find "$CONTEXT_DIR" -type f -name "*.md" -exec wc -l {} + | tail -1 | awk '{print $1}')
  CONTEXT_TOKENS=$((CONTEXT_LINES * 15))
  echo ".claude/context/*.md: ${CONTEXT_LINES} lines (~${CONTEXT_TOKENS} tokens)"
else
  echo ".claude/context/: Not found"
  CONTEXT_TOKENS=0
fi

# Check agents
AGENTS_DIR=".claude/agents"
if [ -d "$AGENTS_DIR" ]; then
  AGENTS_LINES=$(find "$AGENTS_DIR" -type f -name "*.md" -exec wc -l {} + | tail -1 | awk '{print $1}')
  AGENTS_TOKENS=$((AGENTS_LINES * 15))
  echo ".claude/agents/*.md: ${AGENTS_LINES} lines (~${AGENTS_TOKENS} tokens)"
else
  echo ".claude/agents/: Not found"
  AGENTS_TOKENS=0
fi

# Calculate total
TOTAL_TOKENS=$((CLAUDE_TOKENS + GLOBAL_TOKENS + CONTEXT_TOKENS + AGENTS_TOKENS))
TOTAL_LINES=$((CLAUDE_LINES + GLOBAL_LINES + CONTEXT_LINES + AGENTS_LINES))

echo ""
echo "📈 Total Estimated Context Load:"
echo "  Lines: ${TOTAL_LINES}"
echo "  Tokens: ~${TOTAL_TOKENS}"
echo ""

# Calculate percentage of budget (200K tokens)
BUDGET=200000
PERCENTAGE=$((TOTAL_TOKENS * 100 / BUDGET))

echo "Budget Usage: ${PERCENTAGE}% of 200,000 tokens"
echo ""

# Recommendations
if [ $TOTAL_TOKENS -gt 10000 ]; then
  echo "⚠️  HIGH CONTEXT LOAD DETECTED"
  echo ""
  echo "Recommendations:"
  echo "  1. Switch to light mode: ./.claude/switch-mode.sh light"
  echo "  2. Update CLAUDE.md: ./.claude/update-claude-md.sh light"
  echo "  3. Archive unused context files in .claude/context/"
  echo ""
elif [ $TOTAL_TOKENS -gt 5000 ]; then
  echo "⚡ MODERATE CONTEXT LOAD"
  echo ""
  echo "Consider switching to a lighter mode for routine tasks"
  echo ""
else
  echo "✅ OPTIMAL CONTEXT LOAD"
  echo ""
  echo "Context usage is efficient for extended development sessions"
  echo ""
fi

# Mode recommendations
echo "💡 Mode Selection Guide:"
echo ""
echo "  light mode      - Quick fixes, component updates (~500 tokens)"
echo "  enterprise mode - Pricing, billing, subscriptions (~3,000 tokens)"
echo "  shopify mode    - Product catalog, cart, API (~2,000 tokens)"
echo "  testing mode    - Debugging, troubleshooting (~1,500 tokens)"
echo ""
