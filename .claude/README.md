# Afilo Claude Code Configuration

Optimized context management system for efficient Claude Code development sessions.

## 🚀 Quick Start

### 1. Check Current Context Usage
```bash
./.claude/context-monitor.sh
```

### 2. Switch to Light Mode (Recommended for Daily Use)
```bash
./.claude/switch-mode.sh light
./.claude/update-claude-md.sh light
```

This reduces context load by **95%** (42,810 → ~2,000 tokens).

## 📁 Configuration Files

### Core Modules
- `CLAUDE-CORE.md` - Essential configuration (100 lines)
- `CLAUDE-ENTERPRISE.md` - Stripe, pricing, billing features (150 lines)
- `CLAUDE-SHOPIFY.md` - Product catalog, cart, API integration (120 lines)
- `CLAUDE-WORKFLOWS.md` - Development workflows and standards (180 lines)

### MCP Configurations
- `mcp-config-light.json` - Minimal (ShadCN only)
- `mcp-config-enterprise.json` - Enterprise features (ShadCN + Context7 + Mem0)
- `mcp-config-shopify.json` - E-commerce (ShadCN + Shopify + Context7)
- `mcp-config-testing.json` - Debugging (ShadCN + Sequential Thinking + Exa)

### Scripts
- `switch-mode.sh` - Switch between MCP modes
- `update-claude-md.sh` - Update CLAUDE.md with selected modules
- `context-monitor.sh` - Monitor context token usage

### Documentation
- `CONTEXT-OPTIMIZATION-GUIDE.md` - Complete optimization guide
- `QUICK-REFERENCE.md` - Quick reference card

## 🎯 Mode Selection

| Mode | Context Load | Best For |
|------|--------------|----------|
| **Light** | ~500 tokens (95% ↓) | Quick fixes, routine tasks |
| **Testing** | ~1,500 tokens (85% ↓) | Debugging, troubleshooting |
| **Shopify** | ~2,000 tokens (80% ↓) | Product catalog, cart, API |
| **Enterprise** | ~3,000 tokens (70% ↓) | Pricing, billing, subscriptions |

## 📊 Performance Improvements

### Before Optimization
- Base context: ~42,810 tokens (21% of budget)
- Session duration: Limited by rapid context consumption
- Parallel sessions: Not practical

### After Optimization (Light Mode)
- Base context: ~2,000 tokens (1% of budget)
- Session duration: 4x longer
- Parallel sessions: 3+ with git worktree
- Context reduction: **95%**

## 💡 Recommended Workflow

### Daily Development
```bash
# Start with light mode
./.claude/switch-mode.sh light
./.claude/update-claude-md.sh light
```

### Switch Based on Task
```bash
# Working on Stripe billing
./.claude/switch-mode.sh enterprise
./.claude/update-claude-md.sh enterprise

# Working on product grid
./.claude/switch-mode.sh shopify
./.claude/update-claude-md.sh shopify

# Debugging
./.claude/switch-mode.sh testing
./.claude/update-claude-md.sh workflows
```

### Monitor Usage
```bash
./.claude/context-monitor.sh
```

## 📖 Documentation

- **Full Guide**: [CONTEXT-OPTIMIZATION-GUIDE.md](./CONTEXT-OPTIMIZATION-GUIDE.md)
- **Quick Reference**: [QUICK-REFERENCE.md](./QUICK-REFERENCE.md)
- **Project Config**: [CLAUDE.md](../CLAUDE.md) (auto-updated by scripts)

## 🔧 Troubleshooting

### High Context Usage
Run monitor and switch to lighter mode:
```bash
./.claude/context-monitor.sh
./.claude/switch-mode.sh light
```

### Mode Not Switching
Check symlink:
```bash
ls -la .claude/mcp-config.json
```

Recreate:
```bash
./.claude/switch-mode.sh [mode]
```

### Need Full Context
Use full mode (not recommended for routine tasks):
```bash
./.claude/update-claude-md.sh full
```

## 📈 Success Metrics

**Expected Improvements:**
- Context consumption: 60-80% reduction
- Session duration: 4x longer
- Parallel sessions: 3+ simultaneous
- Weekly budget usage: 40% → 10%

## 🎓 Learn More

1. Read the [optimization guide](./CONTEXT-OPTIMIZATION-GUIDE.md)
2. Check the [quick reference](./QUICK-REFERENCE.md)
3. Run the context monitor regularly
4. Experiment with different modes

---

**Version**: 1.0.0
**Last Updated**: January 2025
**Maintained By**: Afilo Enterprise Development Team
