'use client';

/**
 * Business Intelligence Pricing Table
 *
 * Displays BI and analytics products with:
 * - Tiered pricing (Starter, Advanced, Enterprise)
 * - Feature comparison matrix
 * - ROI calculator
 * - Use case examples
 *
 * Products ($99-$999/month subscriptions + $89-$199 one-time templates)
 */

import React, { useState } from 'react';
import { EnterpriseBadge } from './EnterpriseBadge';
import type { CurrencyCode } from '@/lib/stripe/types/adaptive-checkout.types';

interface BIProduct {
  id: string;
  name: string;
  description: string;
  type: 'subscription' | 'template';
  monthlyPrice?: number;
  annualPrice?: number;
  oneTimePrice?: number;
  features: string[];
  useCase: string;
  icon: string;
}

const BI_PRODUCTS: BIProduct[] = [
  {
    id: 'prod_bi_starter',
    name: 'Business Intelligence Starter',
    description: 'Essential analytics for growing businesses',
    type: 'subscription',
    monthlyPrice: 99,
    annualPrice: 990,
    features: ['10K events/month', 'Basic dashboards', 'Email reports', 'Up to 5 users'],
    useCase: 'Startups & SMBs',
    icon: '📊',
  },
  {
    id: 'prod_bi_advanced',
    name: 'Advanced Analytics Suite',
    description: 'Professional-grade analytics with AI insights',
    type: 'subscription',
    monthlyPrice: 249,
    annualPrice: 2490,
    features: ['1M events/month', 'Advanced dashboards', 'Real-time alerts', 'Unlimited users', 'API access'],
    useCase: 'Mid-market companies',
    icon: '📈',
  },
  {
    id: 'prod_bi_enterprise',
    name: 'Enterprise Reporting Engine',
    description: 'Complete analytics platform for large organizations',
    type: 'subscription',
    monthlyPrice: 499,
    annualPrice: 4990,
    features: ['Unlimited events', 'Custom dashboards', 'Predictive analytics', 'Dedicated support', 'SLA guarantee'],
    useCase: 'Enterprise organizations',
    icon: '🏢',
  },
  {
    id: 'prod_financial_dashboards',
    name: 'Financial Dashboard Templates',
    description: 'Pre-built templates for financial analysis',
    type: 'template',
    oneTimePrice: 199,
    features: ['10+ dashboard templates', 'Financial KPIs', 'Budget vs actual', 'Lifetime access'],
    useCase: 'Finance teams',
    icon: '💰',
  },
  {
    id: 'prod_kpi_tracking',
    name: 'KPI Tracking Spreadsheets',
    description: 'Excel templates for key performance indicators',
    type: 'template',
    oneTimePrice: 89,
    features: ['30+ KPI templates', 'Auto-calculate metrics', 'Excel + Google Sheets', 'Documentation'],
    useCase: 'Management teams',
    icon: '📋',
  },
  {
    id: 'prod_business_plan_generator',
    name: 'Business Plan Generator Pro',
    description: 'AI-powered business planning toolkit',
    type: 'template',
    oneTimePrice: 149,
    features: ['Planning templates', 'Financial projections', 'Pitch deck templates', 'Strategic frameworks'],
    useCase: 'Entrepreneurs',
    icon: '📝',
  },
];

interface BusinessPricingTableProps {
  onProductSelect?: (productId: string, name: string, price: number) => void;
  currency?: CurrencyCode;
  isEnterpriseUser?: boolean;
  className?: string;
}

export const BusinessPricingTable: React.FC<BusinessPricingTableProps> = ({
  onProductSelect,
  currency = 'USD',
  isEnterpriseUser = false,
  className = '',
}) => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const subscriptions = BI_PRODUCTS.filter((p) => p.type === 'subscription');
  const templates = BI_PRODUCTS.filter((p) => p.type === 'template');

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(cents);
  };

  return (
    <div className={`business-pricing-table ${className}`}>
      <div className="pricing-header">
        <h2>Business Intelligence & Analytics</h2>
        <p>Data-driven insights for smarter business decisions</p>

        <div className="billing-toggle">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={billingPeriod === 'monthly' ? 'active' : ''}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod('annual')}
            className={billingPeriod === 'annual' ? 'active' : ''}
          >
            Annual <span className="badge">Save 20%</span>
          </button>
        </div>
      </div>

      {/* Subscriptions */}
      <div className="products-section">
        <h3>📊 Subscription Plans</h3>
        <div className="subscriptions-grid">
          {subscriptions.map((product) => (
            <div
              key={product.id}
              className={`product-card subscription-card ${isEnterpriseUser ? 'enterprise-free' : ''}`}
            >
              {isEnterpriseUser && <EnterpriseBadge />}

              <div className="product-header">
                <span className="icon">{product.icon}</span>
                <h4>{product.name}</h4>
              </div>

              <p className="description">{product.description}</p>

              <div className="pricing-box">
                <div className="price">
                  ${billingPeriod === 'monthly' ? product.monthlyPrice : Math.round(product.annualPrice! / 12)}/month
                </div>
                <div className="billing-info">
                  {billingPeriod === 'annual' && (
                    <div className="annual-total">Billed ${product.annualPrice}/year</div>
                  )}
                </div>
              </div>

              <ul className="features">
                {product.features.map((f) => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>

              <button
                onClick={() =>
                  onProductSelect?.(
                    product.id,
                    product.name,
                    billingPeriod === 'monthly' ? product.monthlyPrice! * 100 : product.annualPrice! * 100
                  )
                }
                className={`cta-btn ${isEnterpriseUser ? 'disabled' : ''}`}
                disabled={isEnterpriseUser}
              >
                {isEnterpriseUser ? '✓ Included' : 'Get Started'}
              </button>

              <div className="use-case">Best for: {product.useCase}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Templates */}
      <div className="products-section">
        <h3>📦 One-Time Templates (Lifetime License)</h3>
        <div className="templates-grid">
          {templates.map((product) => (
            <div key={product.id} className={`template-card ${isEnterpriseUser ? 'enterprise-free' : ''}`}>
              {isEnterpriseUser && <EnterpriseBadge text="FREE" />}

              <span className="icon">{product.icon}</span>
              <h4>{product.name}</h4>
              <p className="description">{product.description}</p>

              <div className="price-badge">{formatPrice(product.oneTimePrice! * 100)}</div>

              <ul className="features-compact">
                {product.features.map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>

              <button
                onClick={() =>
                  onProductSelect?.(product.id, product.name, product.oneTimePrice! * 100)
                }
                className={`cta-btn compact ${isEnterpriseUser ? 'disabled' : ''}`}
                disabled={isEnterpriseUser}
              >
                {isEnterpriseUser ? '✓ Access' : 'Buy Now'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .business-pricing-table {
          padding: 3rem 2rem;
        }

        .pricing-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .pricing-header h2 {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
        }

        .pricing-header p {
          font-size: 1.125rem;
          color: #6b7280;
          margin: 0 0 2rem 0;
        }

        .billing-toggle {
          display: flex;
          gap: 1rem;
          justify-content: center;
          background-color: #f3f4f6;
          padding: 0.5rem;
          border-radius: 0.5rem;
          width: fit-content;
          margin: 0 auto;
        }

        .billing-toggle button {
          padding: 0.75rem 1.5rem;
          border: none;
          background-color: transparent;
          border-radius: 0.375rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .billing-toggle button.active {
          background-color: white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .badge {
          margin-left: 0.5rem;
          padding: 0.25rem 0.75rem;
          background-color: #10b981;
          color: white;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .products-section {
          margin-bottom: 3rem;
        }

        .products-section h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 2rem 0;
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
          position: relative;
          transition: all 0.3s;
        }

        .product-card:hover {
          border-color: #3b82f6;
          box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.1);
        }

        .product-card.enterprise-free {
          background-color: #f0fdf4;
          border-color: #10b981;
        }

        .product-header {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .icon {
          font-size: 2.5rem;
          flex-shrink: 0;
        }

        .product-header h4 {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0;
          flex: 1;
        }

        .description {
          font-size: 0.95rem;
          color: #6b7280;
          margin: 0;
        }

        .pricing-box {
          padding: 1rem;
          background-color: #f9fafb;
          border-radius: 0.375rem;
        }

        .price {
          font-size: 1.875rem;
          font-weight: 700;
          color: #3b82f6;
        }

        .billing-info {
          font-size: 0.875rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }

        .features {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .features li {
          font-size: 0.9rem;
          color: #4b5563;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .cta-btn {
          padding: 0.75rem 1.5rem;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.375rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .cta-btn:hover:not(.disabled) {
          background-color: #2563eb;
          transform: translateY(-2px);
        }

        .cta-btn.disabled {
          background-color: #10b981;
          cursor: default;
        }

        .use-case {
          font-size: 0.875rem;
          color: #6b7280;
          font-style: italic;
          border-top: 1px solid #e5e7eb;
          padding-top: 1rem;
          margin-top: auto;
        }

        .templates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .template-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1.5rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          background-color: white;
          text-align: center;
          position: relative;
        }

        .template-card.enterprise-free {
          background-color: #f0fdf4;
          border-color: #10b981;
        }

        .template-card h4 {
          font-size: 1rem;
          font-weight: 700;
          margin: 0;
        }

        .price-badge {
          padding: 0.75rem;
          background-color: #f9fafb;
          border-radius: 0.375rem;
          font-size: 1.5rem;
          font-weight: 700;
          color: #3b82f6;
        }

        .features-compact {
          list-style: none;
          padding: 0;
          margin: 0;
          font-size: 0.875rem;
          color: #6b7280;
          text-align: left;
        }

        .features-compact li {
          margin: 0.25rem 0;
        }

        .cta-btn.compact {
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .subscriptions-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default BusinessPricingTable;
