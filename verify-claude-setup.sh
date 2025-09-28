#!/bin/bash
echo "Verifying Claude Code setup for Afilo project..."

echo "Checking Claude Code installation..."
if command -v claude &> /dev/null; then
    echo "✅ Claude Code is installed"
    claude --version
else
    echo "❌ Claude Code not found"
    exit 1
fi

echo "Checking authentication..."
if claude whoami &> /dev/null; then
    echo "✅ Claude Code is authenticated"
    claude whoami
else
    echo "❌ Claude Code not authenticated. Run 'claude login'"
    exit 1
fi

echo "Checking directory structure..."
dirs=(".claude/agents" ".claude/commands" ".claude/context" ".github/workflows")
for dir in "${dirs[@]}"; do
    if [ -d "$dir" ]; then
        echo "✅ $dir exists"
    else
        echo "❌ $dir missing"
    fi
done

echo "Checking configuration files..."
files=(
    "CLAUDE.md"
    ".claude/agents/shopify-code-review.md"
    ".claude/agents/nextjs-design-review.md"
    ".claude/agents/ecommerce-security-review.md"
    ".claude/commands/code-review.md"
    ".claude/commands/design-review.md"
    ".claude/commands/security-review.md"
    ".claude/context/shopify-design-system.md"
    ".claude/context/ecommerce-security-guidelines.md"
    ".github/workflows/claude-code-review.yml"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
    fi
done

echo "Testing Shopify MCP connection..."
if curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}' \
  https://fzjdsw-ma.myshopify.com/api/mcp >/dev/null 2>&1; then
    echo "✅ Shopify MCP endpoint is accessible"
else
    echo "⚠️  Shopify MCP endpoint test failed (may be normal if store restricts access)"
fi

echo "Checking project configuration..."
if [ -f "next.config.ts" ]; then
    echo "✅ next.config.ts found"
else
    echo "⚠️  next.config.ts not found"
fi

if [ -f "components.json" ]; then
    echo "✅ ShadCN components.json found"
else
    echo "⚠️  ShadCN components.json not found"
fi

if [ -f "package.json" ]; then
    echo "✅ package.json found"
    if grep -q "15.5.4" package.json; then
        echo "✅ Next.js 15.5.4 detected"
    fi
    if grep -q "tailwindcss.*4" package.json; then
        echo "✅ Tailwind CSS v4 detected"
    fi
else
    echo "❌ package.json not found"
fi

echo ""
echo "🎉 Afilo Claude Code setup verification complete!"
echo ""
echo "📚 Quick Usage Guide:"
echo "  • claude                         - Start interactive session"
echo "  • /code-review                   - Review current branch"
echo "  • /design-review                 - Review UI changes"
echo "  • /security-review               - Security audit"
echo "  • @shopify-code-review          - Expert Shopify reviewer"
echo "  • @nextjs-design-review         - Design specialist"
echo "  • @ecommerce-security-review    - Security specialist"
echo ""
echo "🔧 Next Steps:"
echo "  1. Test with: claude"
echo "  2. Make a test PR to verify automated reviews work"
echo "  3. Add CLAUDE_CODE_OAUTH_TOKEN to GitHub repository secrets"
echo ""
echo "🚀 Ready for Afilo e-commerce development with AI-powered reviews!"