'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { SubscriptionCheckout } from '@/components/stripe/SubscriptionCheckout';
import { Check, X } from 'lucide-react';
import SubscriptionManager from '@/components/SubscriptionManager';
import EnterpriseQuoteBuilder, { type EnterpriseQuote } from '@/components/EnterpriseQuoteBuilder';
import EnterprisePortal from '@/components/EnterprisePortal';
import type { Subscription } from '@/components/SubscriptionManager';

// Pricing plans - matches /pricing page
interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  monthlyPriceId: string;
  annualPriceId: string;
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
    annualPrice: 4983,
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
    annualPrice: 14943,
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
    annualPrice: 49743,
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
    annualPrice: 99543,
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

// Mock subscription data
const MOCK_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub_1',
    productName: 'Afilo Enterprise AI Platform',
    planName: 'Professional',
    status: 'active',
    billingPeriod: 'annually',
    currentPrice: 4990,
    currency: 'USD',
    nextBillingDate: '2024-12-01',
    usageMetrics: {
      users: { current: 23, limit: 25 },
      projects: { current: 47, limit: 999999 },
      apiCalls: { current: 85000, limit: 100000 },
      storage: { current: 245, limit: 500, unit: 'GB' }
    },
    features: [
      'Advanced Analytics & Reporting',
      'Priority Email Support',
      'Custom Integrations',
      'Team Collaboration Tools',
      'Advanced Security Features',
      'API Access with Rate Limits',
      'Custom Branding Options',
      'Export & Backup Tools'
    ],
    paymentMethod: {
      type: 'card',
      last4: '4242',
      brand: 'visa',
      expiryDate: '12/25'
    }
  },
  {
    id: 'sub_2',
    productName: 'Afilo Analytics Suite',
    planName: 'Enterprise',
    status: 'trial',
    billingPeriod: 'monthly',
    currentPrice: 1999,
    currency: 'USD',
    nextBillingDate: '2024-02-15',
    trialEndsAt: '2024-02-15',
    usageMetrics: {
      users: { current: 8, limit: 500 },
      projects: { current: 15, limit: 999999 },
      apiCalls: { current: 25000, limit: 999999 },
      storage: { current: 89, limit: 999999, unit: 'GB' }
    },
    features: [
      'Everything in Professional',
      'Advanced AI-Powered Features',
      'Dedicated Account Manager',
      'Custom Development Hours',
      'Enterprise SSO Integration',
      'Advanced Compliance Tools',
      'Unlimited API Access',
      'White-label Solutions'
    ],
    paymentMethod: {
      type: 'card',
      last4: '5555',
      brand: 'mastercard',
      expiryDate: '08/26'
    }
  }
];

export default function EnterprisePage() {
  const [activeSection, setActiveSection] = useState<'pricing' | 'subscriptions' | 'quote' | 'portal'>('pricing');
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('annual');

  const handleSubscriptionAction = (action: string, subscriptionId: string, ...args: unknown[]) => {
    console.log('Subscription action:', action, 'for:', subscriptionId, 'args:', args);
    // Handle subscription management
  };

  const handleQuoteSubmit = (quote: EnterpriseQuote) => {
    console.log('Enterprise quote submitted:', quote);
    // Handle quote submission - send to sales team
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enterprise Hero Section */}
      <div className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.664 1.319a.75.75 0 01.672 0 41.059 41.059 0 018.198 5.424.75.75 0 01-.254 1.285 31.372 31.372 0 00-7.86 3.83.75.75 0 01-.84 0 31.508 31.508 0 00-2.08-1.287V9.394c0-.244.116-.463.302-.592a35.504 35.504 0 013.305-2.033.75.75 0 00-.714-1.319 37 37 0 00-3.446 2.12A2.216 2.216 0 006 9.393v.38a31.293 31.293 0 00-4.28-1.746.75.75 0 01-.254-1.285 41.059 41.059 0 018.198-5.424zM6 11.459a29.848 29.848 0 00-2.455-1.158 41.029 41.029 0 00-.39 3.114.75.75 0 00.419.74c.528.256 1.046.53 1.554.82-.21-.324-.455-.63-.739-.914a.75.75 0 111.06-1.06c.37.369.69.77.96 1.193a26.61 26.61 0 013.095 2.348.75.75 0 00.992 0 26.547 26.547 0 015.93-3.95.75.75 0 00.42-.739 41.029 41.029 0 00-.39-3.114 29.925 29.925 0 00-5.199 2.801 2.25 2.25 0 01-2.514 0c-.41-.275-.826-.541-1.25-.797a6.985 6.985 0 01-1.084-.63 16.724 16.724 0 01-.549-.415z" clipRule="evenodd" />
              </svg>
              Trusted by Fortune 500 Companies
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Enterprise
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block">
                AI Platform
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-8">
              Transform your organization with cutting-edge artificial intelligence, advanced analytics,
              and seamless enterprise integration. Built for scale, security, and global deployment.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setActiveSection('quote')}
                className="bg-white text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
              >
                Get Enterprise Quote
              </button>
              <button
                onClick={() => setActiveSection('pricing')}
                className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
              >
                View Pricing Plans
              </button>
            </div>

            {/* Enterprise Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
              {[
                { value: '500+', label: 'Enterprise Clients' },
                { value: '99.9%', label: 'Uptime SLA' },
                { value: '150+', label: 'Countries Deployed' },
                { value: '24/7', label: 'Global Support' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-gray-300">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {[
              { id: 'pricing', name: 'Enterprise Pricing', icon: '💰' },
              { id: 'subscriptions', name: 'Subscription Management', icon: '📊' },
              { id: 'quote', name: 'Custom Quote Builder', icon: '📋' },
              { id: 'portal', name: 'Enterprise Portal', icon: '🏢' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as 'pricing' | 'subscriptions' | 'quote' | 'portal')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  activeSection === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeSection === 'pricing' && (
          <motion.div
            key="pricing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Pricing Header */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Enterprise Subscription Pricing
              </h2>
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
                      <p className="text-sm font-semibold text-gray-900 mb-3">What&apos;s included:</p>
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
            </div>
          </motion.div>
        )}

        {activeSection === 'subscriptions' && (
          <motion.div
            key="subscriptions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SubscriptionManager
              subscriptions={MOCK_SUBSCRIPTIONS}
              onUpgrade={(id, plan) => handleSubscriptionAction('upgrade', id, plan)}
              onDowngrade={(id, plan) => handleSubscriptionAction('downgrade', id, plan)}
              onCancel={(id) => handleSubscriptionAction('cancel', id)}
              onReactivate={(id) => handleSubscriptionAction('reactivate', id)}
              onUpdatePayment={(id) => handleSubscriptionAction('updatePayment', id)}
            />
          </motion.div>
        )}

        {activeSection === 'quote' && (
          <motion.div
            key="quote"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <EnterpriseQuoteBuilder
              onSubmitQuote={handleQuoteSubmit}
            />
          </motion.div>
        )}

        {activeSection === 'portal' && (
          <motion.div
            key="portal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <EnterprisePortal />
          </motion.div>
        )}
      </div>

      {/* Enterprise Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Enterprise-Grade Features
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Built for the most demanding enterprise environments with security, scalability, and compliance at the core.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🔒',
                title: 'Enterprise Security',
                description: 'SOC 2 Type II, GDPR, HIPAA compliance with advanced encryption and audit trails.',
                features: ['Multi-factor Authentication', 'Role-based Access Control', 'Advanced Threat Detection']
              },
              {
                icon: '🌐',
                title: 'Global Infrastructure',
                description: 'Multi-region deployment with 99.99% uptime SLA and disaster recovery.',
                features: ['Global CDN', 'Auto-scaling', 'Disaster Recovery']
              },
              {
                icon: '🤖',
                title: 'AI-Powered Analytics',
                description: 'Advanced machine learning algorithms for predictive analytics and insights.',
                features: ['Predictive Models', 'Real-time Analytics', 'Custom ML Training']
              },
              {
                icon: '🔗',
                title: 'Enterprise Integrations',
                description: 'Seamless integration with existing enterprise systems and workflows.',
                features: ['SSO Integration', 'API Gateway', 'Custom Connectors']
              },
              {
                icon: '📞',
                title: '24/7 Support',
                description: 'Dedicated support team with guaranteed response times and SLA.',
                features: ['Dedicated Account Manager', 'Priority Support', 'Custom Training']
              },
              {
                icon: '⚙️',
                title: 'Custom Development',
                description: 'Tailored solutions with custom features and white-label options.',
                features: ['Custom Features', 'White-label Solutions', 'Professional Services']
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <ul className="space-y-1">
                  {feature.features.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Enterprise?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join Fortune 500 companies who trust Afilo for their AI and analytics needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setActiveSection('quote')}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Custom Quote
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Schedule Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}