'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { SubscriptionCheckout } from '@/components/stripe/SubscriptionCheckout';
import { Check, X } from 'lucide-react';

/**
 * Enterprise Subscription Plans
 *
 * IMPORTANT: Update these Price IDs after running the subscription products script!
 *
 * To get the Price IDs:
 * 1. Run: pnpm tsx scripts/create-enterprise-subscriptions-no-trial.ts
 * 2. Copy the Price IDs from the output
 * 3. Update the monthlyPriceId and annualPriceId fields below
 *
 * Or get them from Stripe Dashboard:
 * - Go to Products → Select product → Copy Price ID
 */
interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  monthlyPriceId: string; // Stripe Price ID for monthly billing
  annualPriceId: string;  // Stripe Price ID for annual billing
  users: string;
  popular?: boolean;
  features: string[];
  notIncluded?: string[];
}

const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'professional',
    name: 'Professional Plan',
    description: 'Perfect for growing teams and small businesses',
    monthlyPrice: 499,
    annualPrice: 4983, // 17% discount
    monthlyPriceId: 'price_1SE5j3FcrRhjqzak0S0YtNNF',
    annualPriceId: 'price_1SE5j4FcrRhjqzakFVaLCQOo',
    users: 'Up to 25 users',
    features: [
      'Up to 25 users',
      'Advanced analytics',
      'Priority support',
      'API access',
      'Custom integrations',
      'Instant access via email',
      'SOC 2 Type II certified',
      '99.9% uptime SLA',
    ],
    notIncluded: [
      'Dedicated support team',
      'White-label options',
      'Custom development',
    ],
  },
  {
    id: 'business',
    name: 'Business Plan',
    description: 'Advanced features for scaling businesses',
    monthlyPrice: 1499,
    annualPrice: 14943, // 17% discount
    monthlyPriceId: 'price_1SE5j5FcrRhjqzakCZvxb66W',
    annualPriceId: 'price_1SE5j6FcrRhjqzakcykXemDQ',
    users: 'Up to 100 users',
    popular: true,
    features: [
      'Up to 100 users',
      'Advanced security',
      'Dedicated support',
      'Custom SLA',
      'SSO integration',
      'Instant access via email',
      'SOC 2 + ISO 27001 certified',
      '99.95% uptime SLA',
      'Priority onboarding',
      'Advanced reporting',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    description: 'Full-scale solution for large organizations',
    monthlyPrice: 4999,
    annualPrice: 49743, // 17% discount
    monthlyPriceId: 'price_1SE5j7FcrRhjqzakIgQYqQ7W',
    annualPriceId: 'price_1SE5j8FcrRhjqzak41GYphlk',
    users: 'Up to 500 users',
    features: [
      'Up to 500 users',
      'Enterprise security',
      'Account manager',
      'Custom onboarding',
      'White-label options',
      'Instant access via email',
      'All compliance certifications',
      '99.97% uptime SLA',
      'Priority feature requests',
      'Custom training programs',
      '24/7 phone support',
    ],
  },
  {
    id: 'enterprise_plus',
    name: 'Enterprise Plus',
    description: 'Unlimited scale for Fortune 500 companies',
    monthlyPrice: 9999,
    annualPrice: 99543, // 17% discount
    monthlyPriceId: 'price_1SE5jAFcrRhjqzak9J5AC3hc',
    annualPriceId: 'price_1SE5jAFcrRhjqzaknOHV8m6f',
    users: 'Unlimited users',
    features: [
      'Unlimited users',
      'Premium security',
      'Dedicated team',
      'Custom development',
      'Full white-label',
      'Instant access via email',
      'All compliance + custom audits',
      '99.99% uptime SLA',
      'Dedicated infrastructure',
      'Custom feature development',
      'Executive business reviews',
      'Global 24/7 support',
    ],
  },
];

export default function PricingPage() {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('annual');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-4">
            Enterprise Subscription Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Choose the perfect plan for your organization. All plans include immediate access with NO free trials.
            Get instant credentials via email after payment.
          </p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                billingInterval === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('annual')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors relative ${
                billingInterval === 'annual'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Annual
              <Badge variant="success" className="absolute -top-2 -right-2 text-xs">
                Save 17%
              </Badge>
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {PRICING_PLANS.map((plan) => {
            const price = billingInterval === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
            const priceId = billingInterval === 'monthly' ? plan.monthlyPriceId : plan.annualPriceId;
            const monthlyEquivalent = billingInterval === 'annual' ? (price / 12).toFixed(2) : null;

            return (
              <Card
                key={plan.id}
                className={`relative p-8 ${
                  plan.popular
                    ? 'border-2 border-blue-600 shadow-2xl scale-105'
                    : 'border border-gray-200 shadow-lg'
                }`}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <Badge
                    variant="popular"
                    className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1"
                  >
                    ⭐ MOST POPULAR
                  </Badge>
                )}

                {/* Plan header */}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{plan.description}</p>

                  {/* Price */}
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-gray-900">
                      ${price.toLocaleString()}
                    </span>
                    <span className="text-gray-600">
                      /{billingInterval === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  </div>

                  {/* Monthly equivalent for annual */}
                  {monthlyEquivalent && (
                    <p className="text-sm text-gray-500">
                      ${monthlyEquivalent}/mo billed annually
                    </p>
                  )}

                  {/* User limit */}
                  <p className="text-sm font-medium text-blue-600 mt-2">{plan.users}</p>
                </div>

                {/* Subscribe button */}
                <div className="mb-6">
                  <SubscriptionCheckout
                    priceId={priceId}
                    planName={plan.name}
                    buttonText="Subscribe Now"
                    variant={plan.popular ? 'default' : 'outline'}
                    fullWidth
                  />
                </div>

                {/* Features list */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-900 mb-3">What's included:</p>
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}

                  {/* Not included (optional) */}
                  {plan.notIncluded && plan.notIncluded.length > 0 && (
                    <>
                      <div className="pt-4 border-t border-gray-200 mt-4">
                        <p className="text-sm font-semibold text-gray-900 mb-3">Not included:</p>
                        {plan.notIncluded.map((feature, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <X className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-400">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Trust indicators */}
        <div className="text-center space-y-6 border-t border-gray-200 pt-12">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span>No credit card for trial</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span>Instant access via email</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span>SOC 2 + ISO 27001 certified</span>
            </div>
          </div>

          {/* Payment methods */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">Accepted payment methods:</p>
            <p className="text-xs text-gray-600">
              💳 Credit Card (Visa, Mastercard, Amex, Discover) • 🏦 ACH Direct Debit (US only)
            </p>
          </div>

          {/* FAQ link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Questions?{' '}
              <a
                href="/contact"
                className="text-blue-600 hover:text-blue-700 font-medium underline"
              >
                Contact our sales team
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
