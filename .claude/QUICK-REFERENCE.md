# Afilo Context Optimization - Quick Reference Card

## 🚀 Quick Commands

### Check Context Usage
```bash
./.claude/context-monitor.sh
```

### Switch Modes
```bash
./.claude/switch-mode.sh [light|enterprise|shopify|testing]
./.claude/update-claude-md.sh [light|enterprise|shopify|workflows]
```

## 📊 Mode Selection Guide

| Task Type | Mode | Context Load | Commands |
|-----------|------|--------------|----------|
| Quick fixes, component updates | **light** | ~500 tokens | `switch-mode.sh light` + `update-claude-md.sh light` |
| Pricing, billing, subscriptions | **enterprise** | ~3,000 tokens | `switch-mode.sh enterprise` + `update-claude-md.sh enterprise` |
| Product catalog, cart, API | **shopify** | ~2,000 tokens | `switch-mode.sh shopify` + `update-claude-md.sh shopify` |
| Debugging, troubleshooting | **testing** | ~1,500 tokens | `switch-mode.sh testing` + `update-claude-md.sh workflows` |

## 🎯 Common Workflows

### Morning Routine
```bash
# Start with light mode
./.claude/switch-mode.sh light
./.claude/update-claude-md.sh light
```

### Working on Stripe Billing
```bash
./.claude/switch-mode.sh enterprise
./.claude/update-claude-md.sh enterprise
```

### Working on Product Grid
```bash
./.claude/switch-mode.sh shopify
./.claude/update-claude-md.sh shopify
```

### Debugging Issue
```bash
./.claude/switch-mode.sh testing
./.claude/update-claude-md.sh workflows
```

## 📁 Module Files

- `CLAUDE-CORE.md` - Essential config (always loaded)
- `CLAUDE-ENTERPRISE.md` - Stripe, pricing, billing
- `CLAUDE-SHOPIFY.md` - Products, cart, API
- `CLAUDE-WORKFLOWS.md` - Development workflows

## 🔧 Troubleshooting

**High context usage?**
```bash
./.claude/context-monitor.sh
# Then switch to lighter mode
```

**Mode not switching?**
```bash
ls -la .claude/mcp-config.json
# Verify symlink points to correct config
```

**Need full context?**
```bash
./.claude/update-claude-md.sh full
```

## 💡 Tips

- Start every session with light mode
- Switch modes based on current task
- Run context monitor periodically
- Archive unused .claude/context/ files
- Use agents on-demand (/code-review, /design-review)

## 📈 Expected Improvements

- **Context reduction**: 60-80%
- **Session duration**: 4x longer
- **Parallel sessions**: 3+ with git worktree
- **Weekly budget**: 40% → 10% usage

---

**Full Guide**: `.claude/CONTEXT-OPTIMIZATION-GUIDE.md`
