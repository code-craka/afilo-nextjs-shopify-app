'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ShopifyProduct } from '@/types/shopify';

// Premium pricing tiers for enterprise software
export type PricingTier = 'professional' | 'enterprise' | 'enterprise-plus';
export type BillingPeriod = 'monthly' | 'annually' | 'one-time';

interface PricingTierConfig {
  name: string;
  subtitle: string;
  description: string;
  features: string[];
  limits: {
    users: string;
    projects: string;
    support: string;
    deployment: string;
  };
  pricing: {
    monthly: number;
    annually: number;
    oneTime?: number;
  };
  popular?: boolean;
  enterprise?: boolean;
}

// Enterprise pricing configuration
const PREMIUM_TIERS: Record<PricingTier, PricingTierConfig> = {
  professional: {
    name: 'Professional',
    subtitle: 'For growing teams',
    description: 'Advanced tools for professional development teams',
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
    limits: {
      users: 'Up to 25 users',
      projects: 'Unlimited projects',
      support: '24/7 Email Support',
      deployment: 'Cloud + On-premise'
    },
    pricing: {
      monthly: 499,
      annually: 4990,
      oneTime: 2499
    },
    popular: true
  },
  enterprise: {
    name: 'Enterprise',
    subtitle: 'For large organizations',
    description: 'Complete solution for enterprise-scale deployments',
    features: [
      'Everything in Professional',
      'Advanced AI-Powered Features',
      'Dedicated Account Manager',
      'Custom Development Hours',
      'Enterprise SSO Integration',
      'Advanced Compliance Tools',
      'Unlimited API Access',
      'White-label Solutions',
      'Custom Training Sessions',
      'Advanced Security Auditing'
    ],
    limits: {
      users: 'Up to 500 users',
      projects: 'Unlimited projects',
      support: '24/7 Phone & Email',
      deployment: 'Multi-cloud + Hybrid'
    },
    pricing: {
      monthly: 1999,
      annually: 19990,
      oneTime: 9999
    }
  },
  'enterprise-plus': {
    name: 'Enterprise Plus',
    subtitle: 'For global enterprises',
    description: 'Ultimate solution with unlimited scale and custom features',
    features: [
      'Everything in Enterprise',
      'Unlimited Custom Features',
      'Dedicated Development Team',
      'Global Infrastructure',
      'Advanced AI Training',
      'Custom ML Models',
      'Regulatory Compliance Suite',
      'Global Support Team',
      'Custom SLA Agreements',
      'Executive Training Programs'
    ],
    limits: {
      users: 'Unlimited users',
      projects: 'Unlimited projects',
      support: 'Dedicated Support Team',
      deployment: 'Global Multi-region'
    },
    pricing: {
      monthly: 9999,
      annually: 99990
    },
    enterprise: true
  }
};

interface PremiumPricingDisplayProps {
  product: ShopifyProduct;
  onSelectTier?: (tier: PricingTier, billing: BillingPeriod) => void;
  showComparison?: boolean;
  className?: string;
}

export default function PremiumPricingDisplay({
  product,
  onSelectTier,
  showComparison = true,
  className = ''
}: PremiumPricingDisplayProps) {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('annually');
  const [selectedTier, setSelectedTier] = useState<PricingTier>('professional');
  const [showVolumeCalculator, setShowVolumeCalculator] = useState(false);

  // Format price with proper currency
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Calculate annual savings
  const calculateAnnualSavings = (tier: PricingTierConfig): number => {
    return (tier.pricing.monthly * 12) - tier.pricing.annually;
  };

  const handleTierSelect = (tier: PricingTier) => {
    setSelectedTier(tier);
    onSelectTier?.(tier, billingPeriod);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Premium Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.664 1.319a.75.75 0 01.672 0 41.059 41.059 0 018.198 5.424.75.75 0 01-.254 1.285 31.372 31.372 0 00-7.86 3.83.75.75 0 01-.84 0 31.508 31.508 0 00-2.08-1.287V9.394c0-.244.116-.463.302-.592a35.504 35.504 0 013.305-2.033.75.75 0 00-.714-1.319 37 37 0 00-3.446 2.12A2.216 2.216 0 006 9.393v.38a31.293 31.293 0 00-4.28-1.746.75.75 0 01-.254-1.285 41.059 41.059 0 018.198-5.424zM6 11.459a29.848 29.848 0 00-2.455-1.158 41.029 41.029 0 00-.39 3.114.75.75 0 00.419.74c.528.256 1.046.53 1.554.82-.21-.324-.455-.63-.739-.914a.75.75 0 111.06-1.06c.37.369.69.77.96 1.193a26.61 26.61 0 013.095 2.348.75.75 0 00.992 0 26.547 26.547 0 015.93-3.95.75.75 0 00.42-.739 41.029 41.029 0 00-.39-3.114 29.925 29.925 0 00-5.199 2.801 2.25 2.25 0 01-2.514 0c-.41-.275-.826-.541-1.25-.797a6.985 6.985 0 01-1.084-.63 16.724 16.724 0 01-.549-.415z" clipRule="evenodd" />
          </svg>
          Enterprise Software Solution
        </div>

        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          {product.title}
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Professional-grade software solution trusted by Fortune 500 companies worldwide.
          Choose the plan that scales with your enterprise needs.
        </p>
      </div>

      {/* Billing Period Toggle */}
      <div className="flex justify-center mb-12">
        <div className="bg-gray-100 p-1 rounded-lg inline-flex">
          {(['monthly', 'annually', 'one-time'] as BillingPeriod[]).map((period) => (
            <button
              key={period}
              onClick={() => setBillingPeriod(period)}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                billingPeriod === period
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {period === 'one-time' ? 'One-time Purchase' :
               period === 'annually' ? 'Annual Billing' : 'Monthly Billing'}
              {period === 'annually' && (
                <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                  Save 17%
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Pricing Tiers */}
      <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {(Object.entries(PREMIUM_TIERS) as [PricingTier, PricingTierConfig][]).map(([tierKey, tier]) => (
          <motion.div
            key={tierKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * Object.keys(PREMIUM_TIERS).indexOf(tierKey) }}
            className={`relative bg-white rounded-2xl border-2 p-8 ${
              tier.popular
                ? 'border-blue-500 ring-4 ring-blue-100'
                : tier.enterprise
                ? 'border-purple-500 ring-4 ring-purple-100'
                : 'border-gray-200 hover:border-gray-300'
            } transition-all duration-300 hover:shadow-xl`}
          >
            {/* Popular/Enterprise Badge */}
            {(tier.popular || tier.enterprise) && (
              <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full text-sm font-semibold text-white ${
                tier.popular ? 'bg-blue-500' : 'bg-purple-500'
              }`}>
                {tier.popular ? 'Most Popular' : 'Enterprise'}
              </div>
            )}

            {/* Tier Header */}
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{tier.subtitle}</p>

              {/* Price */}
              <div className="mb-4">
                {billingPeriod === 'one-time' && tier.pricing.oneTime ? (
                  <div>
                    <span className="text-4xl font-bold text-gray-900">
                      {formatPrice(tier.pricing.oneTime)}
                    </span>
                    <span className="text-lg text-gray-600 ml-2">one-time</span>
                  </div>
                ) : (
                  <div>
                    <span className="text-4xl font-bold text-gray-900">
                      {formatPrice(
                        billingPeriod === 'monthly'
                          ? tier.pricing.monthly
                          : tier.pricing.annually / 12
                      )}
                    </span>
                    <span className="text-lg text-gray-600 ml-2">
                      {billingPeriod === 'monthly' ? '/month' : '/month, billed annually'}
                    </span>
                    {billingPeriod === 'annually' && (
                      <div className="text-sm text-green-600 mt-1">
                        Save {formatPrice(calculateAnnualSavings(tier))} per year
                      </div>
                    )}
                  </div>
                )}
              </div>

              <p className="text-gray-600">{tier.description}</p>
            </div>

            {/* Features */}
            <div className="space-y-4 mb-8">
              <h4 className="font-semibold text-gray-900">Key Features</h4>
              <ul className="space-y-3">
                {tier.features.slice(0, 6).map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
                {tier.features.length > 6 && (
                  <li className="text-sm text-gray-500 ml-8">
                    + {tier.features.length - 6} more features
                  </li>
                )}
              </ul>
            </div>

            {/* Limits */}
            <div className="space-y-3 mb-8 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 text-sm">Plan Limits</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-600">Users:</span>
                  <div className="font-medium">{tier.limits.users}</div>
                </div>
                <div>
                  <span className="text-gray-600">Projects:</span>
                  <div className="font-medium">{tier.limits.projects}</div>
                </div>
                <div>
                  <span className="text-gray-600">Support:</span>
                  <div className="font-medium">{tier.limits.support}</div>
                </div>
                <div>
                  <span className="text-gray-600">Deployment:</span>
                  <div className="font-medium">{tier.limits.deployment}</div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => handleTierSelect(tierKey)}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 ${
                tier.popular
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                  : tier.enterprise
                  ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-xl'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              {tier.enterprise ? 'Contact Sales' : 'Start Free Trial'}
            </button>

            {/* Trial Info */}
            <p className="text-center text-sm text-gray-600 mt-4">
              {tier.enterprise ? 'Custom implementation & training included' : '14-day free trial • No credit card required'}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Volume Discount Calculator */}
      <div className="mt-16 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <button
            onClick={() => setShowVolumeCalculator(!showVolumeCalculator)}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            {showVolumeCalculator ? 'Hide' : 'Show'} Volume Discount Calculator
          </button>
        </div>

        <AnimatePresence>
          {showVolumeCalculator && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8"
            >
              <VolumeDiscountCalculator
                tiers={PREMIUM_TIERS}
                billingPeriod={billingPeriod}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Enterprise Features Comparison */}
      {showComparison && (
        <div className="mt-16">
          <FeatureComparisonMatrix tiers={PREMIUM_TIERS} />
        </div>
      )}
    </div>
  );
}

// Volume Discount Calculator Component
interface VolumeDiscountCalculatorProps {
  tiers: Record<PricingTier, PricingTierConfig>;
  billingPeriod: BillingPeriod;
}

function VolumeDiscountCalculator({ tiers, billingPeriod }: VolumeDiscountCalculatorProps) {
  const [userCount, setUserCount] = useState(50);
  const [selectedTier, setSelectedTier] = useState<PricingTier>('professional');

  const calculatePrice = (tier: PricingTierConfig, users: number) => {
    const basePrice = billingPeriod === 'monthly' ? tier.pricing.monthly : tier.pricing.annually;
    const discount = users >= 25 ? Math.min(0.25, users / 2000) : 0;
    return basePrice * (1 - discount);
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-center mb-8">Volume Discount Calculator</h3>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Users
          </label>
          <input
            type="range"
            min="1"
            max="1000"
            value={userCount}
            onChange={(e) => setUserCount(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-600 mt-1">
            <span>1</span>
            <span className="font-semibold">{userCount} users</span>
            <span>1000+</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Tier
          </label>
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value as PricingTier)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          >
            {Object.entries(tiers).map(([key, tier]) => (
              <option key={key} value={key}>
                {tier.name} - {tier.subtitle}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-8 p-6 bg-white rounded-xl border border-gray-200">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 mb-2">
            ${calculatePrice(tiers[selectedTier], userCount).toLocaleString()}
            <span className="text-lg text-gray-600 ml-2">
              /{billingPeriod === 'monthly' ? 'month' : 'year'}
            </span>
          </div>

          {userCount >= 25 && (
            <div className="text-green-600 font-semibold">
              Volume discount applied: {Math.round(Math.min(25, userCount / 20))}% off
            </div>
          )}

          <div className="text-sm text-gray-600 mt-2">
            Price per user: ${(calculatePrice(tiers[selectedTier], userCount) / userCount).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}

// Feature Comparison Matrix Component
interface FeatureComparisonMatrixProps {
  tiers: Record<PricingTier, PricingTierConfig>;
}

function FeatureComparisonMatrix({ tiers }: FeatureComparisonMatrixProps) {
  const allFeatures = Array.from(
    new Set(Object.values(tiers).flatMap(tier => tier.features))
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="p-6 bg-gray-50 border-b border-gray-200">
        <h3 className="text-2xl font-bold text-center">Complete Feature Comparison</h3>
        <p className="text-center text-gray-600 mt-2">
          Compare all features across our enterprise plans
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left p-6 font-semibold text-gray-900">Features</th>
              {Object.entries(tiers).map(([key, tier]) => (
                <th key={key} className="text-center p-6 font-semibold text-gray-900 min-w-[200px]">
                  <div>{tier.name}</div>
                  <div className="text-sm font-normal text-gray-600">{tier.subtitle}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allFeatures.map((feature, index) => (
              <tr key={feature} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="p-6 text-sm text-gray-700">{feature}</td>
                {Object.values(tiers).map((tier, tierIndex) => (
                  <td key={tierIndex} className="p-6 text-center">
                    {tier.features.includes(feature) ? (
                      <svg className="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-300 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}