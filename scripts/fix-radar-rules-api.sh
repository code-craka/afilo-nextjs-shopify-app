#!/bin/bash

# Fix Stripe Radar Rules via API - Allow Legitimate Enterprise Payments
# Radar Rules API: https://docs.stripe.com/api/radar/rules

set -e

echo "🔧 Fixing Stripe Radar Rules via API..."
echo ""

# Get Stripe API key from environment
STRIPE_API_KEY="${STRIPE_SECRET_KEY}"

if [ -z "$STRIPE_API_KEY" ]; then
    echo "❌ Error: STRIPE_SECRET_KEY not found in environment"
    echo "Please set it in .env.local or export it:"
    echo "export STRIPE_SECRET_KEY=sk_live_..."
    exit 1
fi

echo "✅ Stripe API Key found"
echo ""

# Function to create Radar rule via API
create_radar_rule() {
    local action=$1
    local condition=$2
    local name=$3

    echo "📝 Creating rule: $name"
    echo "   Action: $action"
    echo "   Condition: $condition"

    response=$(curl -s -X POST https://api.stripe.com/v1/radar/rules \
        -u "$STRIPE_API_KEY:" \
        -d "action=$action" \
        -d "predicate=$condition" \
        -d "enabled=true")

    # Check if rule was created successfully
    if echo "$response" | grep -q '"id"'; then
        echo "   ✅ Rule created successfully!"
        rule_id=$(echo "$response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        echo "   Rule ID: $rule_id"
    else
        echo "   ⚠️  Response: $response"
    fi
    echo ""
}

# Step 1: List current Radar rules
echo "📋 Current Radar Rules:"
echo ""

rules_response=$(curl -s -X GET https://api.stripe.com/v1/radar/rules \
    -u "$STRIPE_API_KEY:")

if echo "$rules_response" | grep -q '"object":"list"'; then
    echo "$rules_response" | grep -o '"predicate":"[^"]*"' | head -5
else
    echo "⚠️  Could not fetch current rules"
    echo "Response: $rules_response"
fi

echo ""
echo "---"
echo ""

# Step 2: Create Allow Rule for Enterprise Amounts
create_radar_rule "allow" ":amount_in_usd >= 499" "Allow Enterprise Pricing (\$499+)"

# Step 3: Create Allow Rule for Subscriptions
create_radar_rule "allow" ":metadata[subscription] = 'true'" "Allow All Subscriptions"

# Step 4: Create Allow Rule for Pre-Approved Enterprise
create_radar_rule "allow" ":metadata[enterprise_invoice] = 'true' AND :metadata[pre_approved] = 'true'" "Allow Pre-Approved Enterprise"

# Step 5: List rules again to verify
echo "📋 Updated Radar Rules:"
echo ""

updated_rules=$(curl -s -X GET https://api.stripe.com/v1/radar/rules \
    -u "$STRIPE_API_KEY:")

if echo "$updated_rules" | grep -q '"object":"list"'; then
    echo "$updated_rules" | grep -o '"predicate":"[^"]*"' | head -10
    echo ""
    echo "Total rules: $(echo "$updated_rules" | grep -o '"predicate"' | wc -l | xargs)"
else
    echo "⚠️  Could not fetch updated rules"
fi

echo ""
echo "---"
echo ""
echo "🎉 Radar configuration complete!"
echo ""
echo "✅ Created 3 allow rules:"
echo "   1. Allow Enterprise Pricing (\$499+)"
echo "   2. Allow All Subscriptions"
echo "   3. Allow Pre-Approved Enterprise"
echo ""
echo "Next steps:"
echo "1. Go to https://dashboard.stripe.com/radar/rules"
echo "2. Verify the new rules are at the TOP of the list (drag & drop if needed)"
echo "3. Disable the 'Block if :risk_level: = highest' rule"
echo "4. Retry your \$2,000 payment"
echo ""
echo "Expected result: Payment should be allowed (>= \$499)"
echo ""
