'use client';

/**
 * Developer Pricing Table Component
 *
 * Displays developer tools and software products with:
 * - Monthly vs Annual pricing toggle (20% annual savings)
 * - Filter by product type (subscription vs one-time)
 * - Feature comparison
 * - CTA buttons (Add to Cart, Learn More)
 * - Applicable coupon badges
 * - Enterprise "FREE" indicator
 *
 * Products:
 * Subscriptions ($29-$499/month):
 * - AI Code Assistant Pro ($49/mo or $399/yr)
 * - Advanced API Testing Suite ($89/mo or $799/yr)
 * - Database Optimization Toolkit ($129/mo or $1,199/yr)
 * - Enterprise DevOps Dashboard ($199/mo or $1,899/yr)
 *
 * One-time Purchases (lifetime license):
 * - React Component Library Pro ($149)
 * - TypeScript Starter Kit ($79)
 * - Next.js Enterprise Templates ($199)
 * - Stripe Integration Toolkit ($129)
 *
 * Usage:
 * ```tsx
 * <DeveloperPricingTable onProductSelect={(productId) => {}} />
 * ```
 */

import React, { useState } from 'react';
import { EnterpriseBadge } from './EnterpriseBadge';
import type { CurrencyCode } from '@/lib/stripe/types/adaptive-checkout.types';

/**
 * Product definition
 */
interface DeveloperProduct {
  id: string;
  name: string;
  description: string;
  category: 'subscription' | 'one_time';
  monthlyPriceCents?: number;
  annualPriceCents?: number;
  oneTimePriceCents?: number;
  features: string[];
  icon: string;
  popular?: boolean;
  coupons?: string[];
}

/**
 * Component Props
 */
interface DeveloperPricingTableProps {
  onProductSelect?: (productId: string, productName: string, priceCents: number) => void;
  currency?: CurrencyCode;
  showEnterpriseBadge?: boolean;
  isEnterpriseUser?: boolean;
  className?: string;
}

/**
 * Developer Products Catalog
 */
const DEVELOPER_PRODUCTS: DeveloperProduct[] = [
  // Subscriptions
  {
    id: 'prod_ai_code_assistant',
    name: 'AI Code Assistant Pro',
    description: 'Advanced AI-powered code suggestions, refactoring, and documentation',
    category: 'subscription',
    monthlyPriceCents: 4900, // $49
    annualPriceCents: 39900, // $399/year (18% savings)
    features: [
      'Real-time code suggestions',
      'Refactoring recommendations',
      'Auto-generated documentation',
      'Multi-language support',
      'IDE integration (VS Code, JetBrains)',
      'Priority support',
    ],
    icon: '🤖',
    popular: true,
    coupons: ['DEVELOPER25', 'STUDENT50'],
  },
  {
    id: 'prod_api_testing',
    name: 'Advanced API Testing Suite',
    description: 'Professional API testing, monitoring, and debugging tools',
    category: 'subscription',
    monthlyPriceCents: 8900, // $89
    annualPriceCents: 79900, // $799/year
    features: [
      'Visual API designer',
      'Automated testing',
      'Performance monitoring',
      'Load testing (10K req/sec)',
      'Team collaboration',
      'Webhook testing',
      'Rate limiting simulation',
      '99.9% uptime SLA',
    ],
    icon: '🧪',
    coupons: ['DEVELOPER25'],
  },
  {
    id: 'prod_db_optimization',
    name: 'Database Optimization Toolkit',
    description: 'Query optimization, indexing, and performance analysis tools',
    category: 'subscription',
    monthlyPriceCents: 12900, // $129
    annualPriceCents: 119900, // $1,199/year
    features: [
      'Query analyzer & optimizer',
      'Index recommendations',
      'Performance metrics dashboard',
      'Slow query detection',
      'Backup management',
      'Replication monitoring',
      'Schema migration tools',
      'PostgreSQL + MySQL + MongoDB',
    ],
    icon: '⚙️',
    coupons: ['DEVELOPER25'],
  },
  {
    id: 'prod_devops_dashboard',
    name: 'Enterprise DevOps Dashboard',
    description: 'Unified DevOps platform for deployment, monitoring, and incident management',
    category: 'subscription',
    monthlyPriceCents: 19900, // $199
    annualPriceCents: 189900, // $1,899/year
    features: [
      'Multi-cloud deployment',
      'Real-time monitoring (100+ metrics)',
      'Incident management',
      'Automated scaling',
      'Cost optimization',
      'Team management (unlimited seats)',
      'Audit logs',
      'HIPAA + SOC 2 compliant',
    ],
    icon: '🚀',
    popular: true,
    coupons: ['DEVELOPER25'],
  },

  // One-time purchases
  {
    id: 'prod_react_library',
    name: 'React Component Library Pro',
    description: '500+ production-ready React components with TypeScript support',
    category: 'one_time',
    oneTimePriceCents: 14900, // $149
    features: [
      '500+ components',
      'TypeScript support',
      'Tailwind CSS & Styled Components',
      'Storybook documentation',
      'Figma design files',
      'Free lifetime updates',
      'MIT License (commercial use allowed)',
      'Priority support (1 year)',
    ],
    icon: '⚛️',
    coupons: ['DEVELOPER25', 'STUDENT50'],
  },
  {
    id: 'prod_typescript_kit',
    name: 'TypeScript Starter Kit',
    description: 'Complete TypeScript project setup with build tools and best practices',
    category: 'one_time',
    oneTimePriceCents: 7900, // $79
    features: [
      'Vite build configuration',
      'ESLint + Prettier setup',
      'Jest testing framework',
      'CI/CD workflows (GitHub Actions)',
      'Docker configuration',
      'TypeScript strict mode',
      'Pre-commit hooks',
      'Documentation templates',
    ],
    icon: '📘',
    coupons: ['DEVELOPER25', 'STUDENT50'],
  },
  {
    id: 'prod_nextjs_templates',
    name: 'Next.js Enterprise Templates',
    description: 'Production-ready Next.js 15 templates with authentication, payments, analytics',
    category: 'one_time',
    oneTimePriceCents: 19900, // $199
    features: [
      'SaaS starter template',
      'E-commerce template',
      'Content management template',
      'Admin dashboard template',
      'API & database setup',
      'Clerk auth integration',
      'Stripe payments included',
      'Vercel deployment ready',
    ],
    icon: '▲',
    popular: true,
    coupons: ['DEVELOPER25'],
  },
  {
    id: 'prod_stripe_toolkit',
    name: 'Stripe Integration Toolkit',
    description: 'Complete TypeScript utilities for Stripe v1 & v2, Accounts, Checkout, Portal',
    category: 'one_time',
    oneTimePriceCents: 12900, // $129
    features: [
      'Full Stripe v2 Accounts API wrapper',
      'Checkout + Portal integration',
      'Webhook handler with idempotency',
      'Type-safe customer/payment operations',
      'Multi-currency support',
      'Rate limiting utilities',
      'Testing utilities & mocks',
      'Complete TypeScript documentation',
    ],
    icon: '💳',
    coupons: ['DEVELOPER25'],
  },
];

/**
 * Format price for display
 */
function formatPrice(priceCents: number, currency: string = 'USD'): string {
  const amount = priceCents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculate annual savings percentage
 */
function calculateSavings(monthlyPriceCents: number, annualPriceCents: number): number {
  const monthlyAnnual = monthlyPriceCents * 12;
  const savings = monthlyAnnual - annualPriceCents;
  return Math.round((savings / monthlyAnnual) * 100);
}

/**
 * DeveloperPricingTable Component
 *
 * Displays all developer tools with flexible pricing options,
 * feature comparison, and product filtering.
 *
 * @component
 */
export const DeveloperPricingTable: React.FC<DeveloperPricingTableProps> = ({
  onProductSelect,
  currency = 'USD',
  showEnterpriseBadge = true,
  isEnterpriseUser = false,
  className = '',
}) => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [productType, setProductType] = useState<'all' | 'subscription' | 'one_time'>('all');

  // Filter products
  const filteredProducts = DEVELOPER_PRODUCTS.filter((product) => {
    if (productType === 'all') return true;
    return product.category === productType;
  });

  // Separate subscriptions and one-time purchases
  const subscriptions = filteredProducts.filter((p) => p.category === 'subscription');
  const oneTimePurchases = filteredProducts.filter((p) => p.category === 'one_time');

  return (
    <div className={`developer-pricing-table ${className}`}>
      {/* Header */}
      <div className="pricing-header">
        <h2>Developer Tools & Software</h2>
        <p className="subtitle">Professional-grade tools for developers, engineers, and technical teams</p>

        {/* Controls */}
        <div className="pricing-controls">
          {/* Billing Period Toggle */}
          <div className="billing-toggle">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`toggle-btn ${billingPeriod === 'monthly' ? 'active' : ''}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`toggle-btn ${billingPeriod === 'annual' ? 'active' : ''}`}
            >
              Annual
              <span className="savings-badge">Save 20%</span>
            </button>
          </div>

          {/* Product Type Filter */}
          <div className="product-filter">
            <button
              onClick={() => setProductType('all')}
              className={`filter-btn ${productType === 'all' ? 'active' : ''}`}
            >
              All
            </button>
            <button
              onClick={() => setProductType('subscription')}
              className={`filter-btn ${productType === 'subscription' ? 'active' : ''}`}
            >
              Subscriptions
            </button>
            <button
              onClick={() => setProductType('one_time')}
              className={`filter-btn ${productType === 'one_time' ? 'active' : ''}`}
            >
              One-time
            </button>
          </div>
        </div>
      </div>

      {/* Subscriptions Section */}
      {(productType === 'all' || productType === 'subscription') && subscriptions.length > 0 && (
        <div className="products-section">
          <h3 className="section-title">💳 Subscription Plans</h3>
          <div className="products-grid">
            {subscriptions.map((product) => {
              const price =
                billingPeriod === 'monthly' ? product.monthlyPriceCents : product.annualPriceCents;
              const savings =
                billingPeriod === 'annual' && product.monthlyPriceCents && product.annualPriceCents
                  ? calculateSavings(product.monthlyPriceCents, product.annualPriceCents)
                  : 0;

              return (
                <div
                  key={product.id}
                  className={`product-card ${product.popular ? 'popular' : ''} ${
                    isEnterpriseUser ? 'enterprise-free' : ''
                  }`}
                >
                  {product.popular && <div className="popular-badge">Most Popular</div>}

                  {isEnterpriseUser && showEnterpriseBadge && (
                    <EnterpriseBadge text="FREE for Enterprise" />
                  )}

                  <div className="product-icon">{product.icon}</div>

                  <h4 className="product-name">{product.name}</h4>
                  <p className="product-description">{product.description}</p>

                  {/* Pricing */}
                  <div className="pricing">
                    <div className="price">
                      {price ? formatPrice(price, currency) : 'N/A'}
                      <span className="period">
                        {billingPeriod === 'monthly' ? '/month' : '/year'}
                      </span>
                    </div>
                    {savings > 0 && (
                      <div className="savings-text">Save {savings}% annually</div>
                    )}
                  </div>

                  {/* Coupons */}
                  {product.coupons && product.coupons.length > 0 && (
                    <div className="coupons">
                      <span className="coupon-label">Applicable coupons:</span>
                      <div className="coupon-codes">
                        {product.coupons.map((coupon) => (
                          <span key={coupon} className="coupon-code">
                            {coupon}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Features */}
                  <ul className="features-list">
                    {product.features.map((feature) => (
                      <li key={feature}>
                        <span className="checkmark">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={() => onProductSelect?.(product.id, product.name, price || 0)}
                    className={`cta-button ${isEnterpriseUser ? 'enterprise' : ''}`}
                    disabled={isEnterpriseUser}
                    title={
                      isEnterpriseUser ? 'Included in your Enterprise plan' : 'Add to cart'
                    }
                  >
                    {isEnterpriseUser ? '✓ You have access' : 'Add to Cart'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* One-time Purchases Section */}
      {(productType === 'all' || productType === 'one_time') && oneTimePurchases.length > 0 && (
        <div className="products-section">
          <h3 className="section-title">📦 One-time Purchases (Lifetime License)</h3>
          <div className="products-grid">
            {oneTimePurchases.map((product) => (
              <div
                key={product.id}
                className={`product-card one-time ${product.popular ? 'popular' : ''} ${
                  isEnterpriseUser ? 'enterprise-free' : ''
                }`}
              >
                {product.popular && <div className="popular-badge">Most Popular</div>}

                {isEnterpriseUser && showEnterpriseBadge && (
                  <EnterpriseBadge text="FREE for Enterprise" />
                )}

                <div className="product-icon">{product.icon}</div>

                <h4 className="product-name">{product.name}</h4>
                <p className="product-description">{product.description}</p>

                {/* Pricing */}
                <div className="pricing one-time">
                  <div className="price">
                    {formatPrice(product.oneTimePriceCents || 0, currency)}
                  </div>
                  <div className="license-badge">Lifetime License</div>
                </div>

                {/* Coupons */}
                {product.coupons && product.coupons.length > 0 && (
                  <div className="coupons">
                    <span className="coupon-label">Applicable coupons:</span>
                    <div className="coupon-codes">
                      {product.coupons.map((coupon) => (
                        <span key={coupon} className="coupon-code">
                          {coupon}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Features */}
                <ul className="features-list">
                  {product.features.map((feature) => (
                    <li key={feature}>
                      <span className="checkmark">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() =>
                    onProductSelect?.(
                      product.id,
                      product.name,
                      product.oneTimePriceCents || 0
                    )
                  }
                  className={`cta-button ${isEnterpriseUser ? 'enterprise' : ''}`}
                  disabled={isEnterpriseUser}
                  title={
                    isEnterpriseUser ? 'Included in your Enterprise plan' : 'Add to cart'
                  }
                >
                  {isEnterpriseUser ? '✓ You have access' : 'Buy Now'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .developer-pricing-table {
          display: flex;
          flex-direction: column;
          gap: 3rem;
          padding: 2rem;
        }

        .pricing-header {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          text-align: center;
        }

        .pricing-header h2 {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0;
          color: #111827;
        }

        .subtitle {
          font-size: 1.125rem;
          color: #6b7280;
          margin: 0;
        }

        .pricing-controls {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-top: 1.5rem;
          align-items: center;
        }

        .billing-toggle {
          display: flex;
          gap: 1rem;
          background-color: #f3f4f6;
          padding: 0.5rem;
          border-radius: 0.5rem;
        }

        .toggle-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          background-color: transparent;
          border-radius: 0.375rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .toggle-btn.active {
          background-color: white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .savings-badge {
          display: inline-block;
          margin-left: 0.5rem;
          padding: 0.25rem 0.75rem;
          background-color: #10b981;
          color: white;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .product-filter {
          display: flex;
          gap: 0.75rem;
        }

        .filter-btn {
          padding: 0.5rem 1rem;
          border: 1px solid #e5e7eb;
          background-color: white;
          border-radius: 0.375rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-btn:hover {
          border-color: #3b82f6;
        }

        .filter-btn.active {
          background-color: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .products-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
          color: #111827;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 2rem;
        }

        .product-card {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding: 1.5rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          background-color: white;
          transition: all 0.3s ease;
          position: relative;
        }

        .product-card:hover {
          border-color: #3b82f6;
          box-shadow: 0 20px 25px -5px rgba(59, 130, 246, 0.1);
        }

        .product-card.popular {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .product-card.enterprise-free {
          background-color: #f0fdf4;
          border-color: #10b981;
        }

        .popular-badge {
          position: absolute;
          top: -0.75rem;
          left: 1.5rem;
          padding: 0.375rem 1rem;
          background-color: #3b82f6;
          color: white;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .product-icon {
          font-size: 3rem;
        }

        .product-name {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0;
          color: #111827;
        }

        .product-description {
          font-size: 0.95rem;
          color: #6b7280;
          margin: 0;
        }

        .pricing {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 1rem;
          background-color: #f9fafb;
          border-radius: 0.375rem;
        }

        .price {
          font-size: 2rem;
          font-weight: 700;
          color: #3b82f6;
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
        }

        .period {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        .savings-text {
          font-size: 0.875rem;
          color: #10b981;
          font-weight: 600;
        }

        .license-badge {
          display: inline-block;
          padding: 0.375rem 0.75rem;
          background-color: #dbeafe;
          color: #0c4a6e;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 600;
          text-align: center;
        }

        .coupons {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 0.75rem;
          background-color: #fef3c7;
          border-radius: 0.375rem;
          border-left: 2px solid #f59e0b;
        }

        .coupon-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #b45309;
        }

        .coupon-codes {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .coupon-code {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          background-color: white;
          border: 1px dashed #f59e0b;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: #d97706;
          font-family: monospace;
        }

        .features-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .features-list li {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          font-size: 0.9rem;
          color: #4b5563;
        }

        .checkmark {
          color: #10b981;
          font-weight: 700;
          flex-shrink: 0;
        }

        .cta-button {
          padding: 0.75rem 1.5rem;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.375rem;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cta-button:hover:not(:disabled) {
          background-color: #2563eb;
          box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
        }

        .cta-button.enterprise {
          background-color: #10b981;
          cursor: default;
        }

        .cta-button:disabled {
          opacity: 0.9;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .pricing-header h2 {
            font-size: 1.875rem;
          }

          .pricing-controls {
            flex-direction: column;
            gap: 1rem;
          }

          .billing-toggle {
            width: 100%;
          }

          .toggle-btn {
            flex: 1;
          }

          .product-filter {
            flex-wrap: wrap;
            justify-content: center;
          }

          .products-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default DeveloperPricingTable;
