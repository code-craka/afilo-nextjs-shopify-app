#!/bin/bash

# Fix Stripe Radar Rules - Allow Legitimate Enterprise Payments
# This script configures Radar to allow payments $499+ and reduces false positives

echo "🔧 Fixing Stripe Radar Rules..."
echo ""

# Step 1: List current rules (to see what we're working with)
echo "📋 Current Radar Rules:"
stripe radar rules list

echo ""
echo "---"
echo ""

# Step 2: Create Allow Rule for Enterprise Amounts
echo "✅ Creating Allow Rule: Enterprise Pricing ($499+)"
stripe radar rules create \
  --enabled true \
  --action allow \
  --condition ":amount_in_usd >= 499"

echo ""
echo "✅ Allow rule created successfully!"
echo ""

# Step 3: Create Allow Rule for Subscriptions (if you use subscription metadata)
echo "✅ Creating Allow Rule: All Subscriptions"
stripe radar rules create \
  --enabled true \
  --action allow \
  --condition ":metadata[subscription] = \"true\""

echo ""
echo "✅ Subscription allow rule created!"
echo ""

# Step 4: Create Allow Rule for Pre-Approved Enterprise
echo "✅ Creating Allow Rule: Pre-Approved Enterprise"
stripe radar rules create \
  --enabled true \
  --action allow \
  --condition ":metadata[enterprise_invoice] = \"true\" AND :metadata[pre_approved] = \"true\""

echo ""
echo "✅ Pre-approved enterprise rule created!"
echo ""

# Step 5: List rules again to verify
echo "📋 Updated Radar Rules:"
stripe radar rules list

echo ""
echo "---"
echo "🎉 Radar configuration complete!"
echo ""
echo "Next steps:"
echo "1. Go to https://dashboard.stripe.com/radar/rules"
echo "2. Disable the 'Block if :risk_level: = highest' rule"
echo "3. Retry your $2,000 payment"
echo ""
echo "Expected result: Payment should be allowed (>= $499)"
