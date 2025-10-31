'use client';

/**
 * Education Pricing Table Component
 *
 * Displays education courses and learning subscriptions with:
 * - 1-year license badges for courses
 * - Renewal pricing display
 * - Learning subscriptions (monthly)
 * - Certification value proposition
 * - Feature comparison
 * - Testimonials from past students
 *
 * Products:
 * Courses (1-year licenses):
 * - Digital Transformation Mastery ($299, renews $99/year)
 * - Advanced Analytics Certification ($199, renews $59/year)
 * - API & Integration Workshop ($149, renews $49/year)
 * - Data Science Essentials ($89, renews $29/year)
 *
 * Learning Subscriptions (monthly):
 * - Developer Training Program ($79/month or $790/year)
 * - Weekly Insights & Updates ($39/month or $390/year)
 *
 * Usage:
 * ```tsx
 * <EducationPricingTable onProductSelect={(productId) => {}} />
 * ```
 */

import React, { useState } from 'react';
import { EnterpriseBadge } from './EnterpriseBadge';
import type { CurrencyCode } from '@/lib/stripe/types/adaptive-checkout.types';

/**
 * Product definition
 */
interface EducationProduct {
  id: string;
  name: string;
  description: string;
  category: 'course' | 'subscription';
  coursePriceCents?: number; // One-time cost
  renewalPriceCents?: number; // Annual renewal cost
  monthlyPriceCents?: number; // For subscriptions
  annualPriceCents?: number; // For subscriptions
  features: string[];
  icon: string;
  popular?: boolean;
  duration?: string; // e.g., "4 weeks", "Self-paced"
  coupons?: string[];
  prerequisite?: string;
}

/**
 * Component Props
 */
interface EducationPricingTableProps {
  onProductSelect?: (productId: string, productName: string, priceCents: number) => void;
  currency?: CurrencyCode;
  showEnterpriseBadge?: boolean;
  isEnterpriseUser?: boolean;
  className?: string;
}

/**
 * Education Products Catalog
 */
const EDUCATION_PRODUCTS: EducationProduct[] = [
  // Courses (1-year licenses)
  {
    id: 'prod_digital_transformation',
    name: 'Digital Transformation Mastery',
    description: 'Comprehensive course on digital strategy, cloud migration, and organizational change',
    category: 'course',
    coursePriceCents: 29900, // $299
    renewalPriceCents: 9900, // $99/year
    features: [
      'Self-paced learning (40+ hours)',
      'Certificate of Completion',
      '1-year platform access',
      'Lifetime access to course materials',
      'Monthly live Q&A sessions',
      'Community forum access',
      'Resume credential',
      'Job board access',
    ],
    icon: '🚀',
    popular: true,
    duration: 'Self-paced',
    coupons: ['STUDENT50'],
  },
  {
    id: 'prod_analytics_cert',
    name: 'Advanced Analytics Certification',
    description: 'Master data analysis, visualization, and business intelligence platforms',
    category: 'course',
    coursePriceCents: 19900, // $199
    renewalPriceCents: 5900, // $59/year
    features: [
      'Self-paced learning (35+ hours)',
      'Certification exam included',
      '1-year platform access',
      'Industry-recognized credential',
      'Excel + Tableau masterclasses',
      'Real-world case studies',
      'Mentorship (1 session/month)',
      'Portfolio project review',
    ],
    icon: '📊',
    popular: true,
    duration: 'Self-paced',
    coupons: ['STUDENT50'],
    prerequisite: 'Basic SQL knowledge',
  },
  {
    id: 'prod_api_workshop',
    name: 'API & Integration Workshop',
    description: 'Hands-on training for REST APIs, webhooks, and system integration patterns',
    category: 'course',
    coursePriceCents: 14900, // $149
    renewalPriceCents: 4900, // $49/year
    features: [
      'Instructor-led training (20+ hours)',
      '1-year platform access',
      'Live coding sessions (weekly)',
      'GitHub integration templates',
      'Postman collection library',
      'Debugging techniques',
      'API security best practices',
      'Capstone project',
    ],
    icon: '🔌',
    duration: '8 weeks',
    coupons: ['STUDENT50'],
  },
  {
    id: 'prod_data_science',
    name: 'Data Science Essentials',
    description: 'Introduction to Python, data analysis, and machine learning fundamentals',
    category: 'course',
    coursePriceCents: 8900, // $89
    renewalPriceCents: 2900, // $29/year
    features: [
      'Self-paced learning (25+ hours)',
      'Python & pandas mastery',
      '1-year platform access',
      'Jupyter notebooks included',
      'Dataset repository access',
      'Monthly office hours',
      'Beginner-friendly projects',
      'Certificate of completion',
    ],
    icon: '🐍',
    duration: 'Self-paced',
    coupons: ['STUDENT50'],
  },

  // Learning Subscriptions
  {
    id: 'prod_developer_training',
    name: 'Developer Training Program',
    description: 'Continuous learning with monthly modules on latest technologies and best practices',
    category: 'subscription',
    monthlyPriceCents: 7900, // $79/month
    annualPriceCents: 79000, // $790/year (roughly $66/month)
    features: [
      'New modules every month',
      'Advanced & expert-level content',
      'Hands-on labs & environments',
      'Certification tracks',
      'Live instructor sessions',
      'Code review service',
      'Priority support',
      'Community Slack access',
    ],
    icon: '🎓',
    popular: true,
    duration: 'Ongoing',
    coupons: ['DEVELOPER25', 'STUDENT50'],
  },
  {
    id: 'prod_weekly_insights',
    name: 'Weekly Insights & Updates',
    description: 'Weekly newsletters and micro-courses on industry trends, tools, and best practices',
    category: 'subscription',
    monthlyPriceCents: 3900, // $39/month
    annualPriceCents: 39000, // $390/year (roughly $33/month)
    features: [
      'Weekly curated insights',
      'Industry news digest',
      'Tool & framework reviews',
      'Quick-start tutorials',
      'Expert interviews',
      'Resource library',
      'Community discussions',
      'Downloadable guides',
    ],
    icon: '📰',
    duration: 'Ongoing',
    coupons: ['DEVELOPER25', 'STUDENT50'],
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
 * EducationPricingTable Component
 *
 * Displays all education courses and learning subscriptions with
 * licensing information, renewal costs, and feature comparison.
 *
 * @component
 */
export const EducationPricingTable: React.FC<EducationPricingTableProps> = ({
  onProductSelect,
  currency = 'USD',
  showEnterpriseBadge = true,
  isEnterpriseUser = false,
  className = '',
}) => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  // Separate courses and subscriptions
  const courses = EDUCATION_PRODUCTS.filter((p) => p.category === 'course');
  const subscriptions = EDUCATION_PRODUCTS.filter((p) => p.category === 'subscription');

  return (
    <div className={`education-pricing-table ${className}`}>
      {/* Header */}
      <div className="pricing-header">
        <h2>Education & Professional Development</h2>
        <p className="subtitle">Certification courses and continuous learning subscriptions</p>

        {/* Billing Period Toggle */}
        <div className="pricing-controls">
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
              <span className="savings-badge">Save ~2%</span>
            </button>
          </div>
        </div>
      </div>

      {/* Courses Section */}
      <div className="products-section">
        <h3 className="section-title">📚 Certification Courses (1-Year License)</h3>
        <div className="courses-grid">
          {courses.map((product) => (
            <div
              key={product.id}
              className={`product-card course ${product.popular ? 'popular' : ''} ${
                isEnterpriseUser ? 'enterprise-free' : ''
              }`}
            >
              {product.popular && <div className="popular-badge">Most Popular</div>}

              {isEnterpriseUser && showEnterpriseBadge && (
                <EnterpriseBadge text="FREE for Enterprise" position="top-right" />
              )}

              <div className="product-icon">{product.icon}</div>

              <h4 className="product-name">{product.name}</h4>
              <p className="product-description">{product.description}</p>

              {product.prerequisite && (
                <div className="prerequisite">
                  <span className="label">Prerequisite:</span> {product.prerequisite}
                </div>
              )}

              {/* License & Duration */}
              <div className="license-info">
                <div className="duration-badge">{product.duration}</div>
                <div className="license-badge">1-Year License</div>
              </div>

              {/* Pricing */}
              <div className="pricing course-pricing">
                <div className="price">
                  {formatPrice(product.coursePriceCents || 0, currency)}
                </div>
                <div className="renewal-price">
                  Renews at {formatPrice(product.renewalPriceCents || 0, currency)}/year
                </div>
              </div>

              {/* Features */}
              <ul className="features-list">
                {product.features.map((feature) => (
                  <li key={feature}>
                    <span className="checkmark">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Coupons */}
              {product.coupons && product.coupons.length > 0 && (
                <div className="coupons">
                  <span className="coupon-label">Available coupons:</span>
                  <div className="coupon-codes">
                    {product.coupons.map((coupon) => (
                      <span key={coupon} className="coupon-code">
                        {coupon}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <button
                onClick={() =>
                  onProductSelect?.(
                    product.id,
                    product.name,
                    product.coursePriceCents || 0
                  )
                }
                className={`cta-button ${isEnterpriseUser ? 'enterprise' : ''}`}
                disabled={isEnterpriseUser}
                title={
                  isEnterpriseUser ? 'Included in your Enterprise plan' : 'Enroll now'
                }
              >
                {isEnterpriseUser ? '✓ You have access' : 'Enroll Now'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Subscriptions Section */}
      <div className="products-section">
        <h3 className="section-title">📖 Learning Subscriptions</h3>
        <div className="subscriptions-grid">
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
                className={`product-card subscription ${product.popular ? 'popular' : ''} ${
                  isEnterpriseUser ? 'enterprise-free' : ''
                }`}
              >
                {product.popular && <div className="popular-badge">Most Popular</div>}

                {isEnterpriseUser && showEnterpriseBadge && (
                  <EnterpriseBadge text="FREE for Enterprise" position="top-right" />
                )}

                <div className="product-icon">{product.icon}</div>

                <h4 className="product-name">{product.name}</h4>
                <p className="product-description">{product.description}</p>

                {/* Pricing */}
                <div className="pricing subscription-pricing">
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

                {/* Features */}
                <ul className="features-list">
                  {product.features.map((feature) => (
                    <li key={feature}>
                      <span className="checkmark">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Coupons */}
                {product.coupons && product.coupons.length > 0 && (
                  <div className="coupons">
                    <span className="coupon-label">Available coupons:</span>
                    <div className="coupon-codes">
                      {product.coupons.map((coupon) => (
                        <span key={coupon} className="coupon-code">
                          {coupon}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA */}
                <button
                  onClick={() =>
                    onProductSelect?.(
                      product.id,
                      product.name,
                      price || 0
                    )
                  }
                  className={`cta-button ${isEnterpriseUser ? 'enterprise' : ''}`}
                  disabled={isEnterpriseUser}
                  title={
                    isEnterpriseUser ? 'Included in your Enterprise plan' : 'Subscribe'
                  }
                >
                  {isEnterpriseUser ? '✓ You have access' : 'Subscribe'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .education-pricing-table {
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

        .courses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 2rem;
        }

        .subscriptions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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
          border-color: #8b5cf6;
          box-shadow: 0 20px 25px -5px rgba(139, 92, 246, 0.1);
        }

        .product-card.popular {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.1);
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
          background-color: #8b5cf6;
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

        .prerequisite {
          display: flex;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #7c3aed;
          background-color: #f5f3ff;
          padding: 0.75rem;
          border-radius: 0.375rem;
          border-left: 2px solid #8b5cf6;
        }

        .prerequisite .label {
          font-weight: 600;
        }

        .license-info {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .duration-badge {
          display: inline-block;
          padding: 0.375rem 0.75rem;
          background-color: #dbeafe;
          color: #0c4a6e;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .license-badge {
          display: inline-block;
          padding: 0.375rem 0.75rem;
          background-color: #fecaca;
          color: #7c2d12;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 600;
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
          color: #8b5cf6;
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
        }

        .period {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        .renewal-price {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
          font-style: italic;
        }

        .savings-text {
          font-size: 0.875rem;
          color: #10b981;
          font-weight: 600;
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
          background-color: #8b5cf6;
          color: white;
          border: none;
          border-radius: 0.375rem;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cta-button:hover:not(:disabled) {
          background-color: #7c3aed;
          box-shadow: 0 10px 15px -3px rgba(139, 92, 246, 0.3);
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

          .courses-grid,
          .subscriptions-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default EducationPricingTable;
