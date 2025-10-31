'use client';

/**
 * Templates Pricing Table Component
 *
 * Displays design assets and document templates with:
 * - Lifetime license badges
 * - Category organization (Design Assets, Document Templates)
 * - Preview/download links
 * - License terms
 * - Feature comparison
 * - Industry use cases
 *
 * Products:
 * Design Assets (Lifetime):
 * - Dashboard UI Kit ($199) - 100+ components
 * - Email & Marketing Templates ($129) - 50+ templates
 * - Presentation Designs ($79) - 30+ slides
 * - Automation Flow Builder ($89) - 15+ workflows
 *
 * Document Templates (Lifetime):
 * - Legal & Compliance Checklist ($49)
 * - SOC 2 Compliance Guide ($149)
 * - GDPR Toolkit & Documentation ($99)
 *
 * Usage:
 * ```tsx
 * <TemplatesPricingTable onProductSelect={(productId) => {}} />
 * ```
 */

import React, { useState } from 'react';
import { EnterpriseBadge } from './EnterpriseBadge';
import type { CurrencyCode } from '@/lib/stripe/types/adaptive-checkout.types';

/**
 * Product definition
 */
interface TemplateProduct {
  id: string;
  name: string;
  description: string;
  category: 'design_assets' | 'document_templates';
  priceCents: number; // One-time cost
  features: string[];
  icon: string;
  popular?: boolean;
  industry?: string[];
  coupons?: string[];
  previewUrl?: string;
  downloadSize?: string;
  fileFormats?: string[];
}

/**
 * Component Props
 */
interface TemplatesPricingTableProps {
  onProductSelect?: (productId: string, productName: string, priceCents: number) => void;
  currency?: CurrencyCode;
  showEnterpriseBadge?: boolean;
  isEnterpriseUser?: boolean;
  className?: string;
}

/**
 * Templates Catalog
 */
const TEMPLATES_PRODUCTS: TemplateProduct[] = [
  // Design Assets
  {
    id: 'prod_dashboard_ui_kit',
    name: 'Dashboard UI Kit',
    description: '100+ production-ready dashboard components with Figma source files',
    category: 'design_assets',
    priceCents: 19900, // $199
    features: [
      '100+ dashboard components',
      'Figma + Adobe XD files',
      'Light & dark themes',
      'Responsive design system',
      '20+ chart variations',
      'Forms & input components',
      'Data table templates',
      'Free updates (lifetime)',
    ],
    icon: '🎨',
    popular: true,
    industry: ['SaaS', 'Finance', 'Analytics', 'Admin Dashboards'],
    coupons: ['DEVELOPER25'],
    downloadSize: '120 MB',
    fileFormats: ['Figma', 'Adobe XD', 'PNG'],
  },
  {
    id: 'prod_email_marketing',
    name: 'Email & Marketing Templates',
    description: '50+ responsive email and landing page templates for modern marketing',
    category: 'design_assets',
    priceCents: 12900, // $129
    features: [
      '50+ email templates',
      '20+ landing page designs',
      'Responsive layouts',
      'Mailchimp + Klaviyo compatible',
      'Newsletter designs',
      'Promotional templates',
      'Abandoned cart sequences',
      'A/B testing variants',
    ],
    icon: '📧',
    popular: true,
    industry: ['E-commerce', 'SaaS', 'Marketing', 'Agencies'],
    coupons: ['DEVELOPER25'],
    downloadSize: '85 MB',
    fileFormats: ['HTML', 'Figma', 'Adobe XD'],
  },
  {
    id: 'prod_presentations',
    name: 'Presentation Designs',
    description: '30+ professionally designed presentation templates for business communication',
    category: 'design_assets',
    priceCents: 7900, // $79
    features: [
      '30+ presentation templates',
      'PowerPoint & Keynote formats',
      'Business, pitch, & report decks',
      '300+ unique slide designs',
      'Editable graphics & charts',
      'Brand customization guides',
      'Export to PDF/video',
      'Animations & transitions',
    ],
    icon: '📊',
    industry: ['Consulting', 'Sales', 'Education', 'Corporate'],
    coupons: ['DEVELOPER25'],
    downloadSize: '250 MB',
    fileFormats: ['PowerPoint', 'Keynote', 'PDF'],
  },
  {
    id: 'prod_automation_workflows',
    name: 'Automation Flow Builder',
    description: '15+ ready-to-use automation workflows for Zapier, Make, and n8n',
    category: 'design_assets',
    priceCents: 8900, // $89
    features: [
      '15+ pre-built workflows',
      'CRM integrations',
      'Email + Slack notifications',
      'Data synchronization flows',
      'Lead capture sequences',
      'Invoice automation',
      'Scheduled reporting',
      'JSON + YAML source code',
    ],
    icon: '⚙️',
    industry: ['SaaS', 'Agencies', 'E-commerce', 'Startups'],
    coupons: ['DEVELOPER25'],
    downloadSize: '15 MB',
    fileFormats: ['JSON', 'YAML', 'Zapier', 'Make'],
  },

  // Document Templates
  {
    id: 'prod_legal_checklist',
    name: 'Legal & Compliance Checklist',
    description: 'Comprehensive checklist for business legal requirements and regulatory compliance',
    category: 'document_templates',
    priceCents: 4900, // $49
    features: [
      'Business formation checklist',
      'Employment law compliance',
      'Data privacy requirements',
      'Intellectual property guide',
      'Insurance planning checklist',
      'Contract templates (5)',
      'Industry-specific guides',
      'Updateable document',
    ],
    icon: '⚖️',
    industry: ['Startups', 'Consulting', 'Legal Services'],
    coupons: ['STARTUP40'],
    downloadSize: '12 MB',
    fileFormats: ['Word', 'PDF', 'Google Docs'],
  },
  {
    id: 'prod_soc2_guide',
    name: 'SOC 2 Compliance Guide',
    description: 'Complete SOC 2 compliance roadmap with policies, controls, and audit templates',
    category: 'document_templates',
    priceCents: 14900, // $149
    features: [
      'SOC 2 audit roadmap',
      'Policy templates (20+)',
      'Control framework',
      'Risk assessment forms',
      'Audit response templates',
      'Evidence collection guides',
      'Security incident response',
      'Audit timeline planner',
    ],
    icon: '🔒',
    popular: true,
    industry: ['SaaS', 'FinTech', 'Healthcare', 'Enterprise'],
    coupons: ['ENTERPRISE50'],
    downloadSize: '45 MB',
    fileFormats: ['Word', 'PDF', 'Excel'],
  },
  {
    id: 'prod_gdpr_toolkit',
    name: 'GDPR Toolkit & Documentation',
    description: 'Complete GDPR compliance toolkit with policies, privacy notices, and consent forms',
    category: 'document_templates',
    priceCents: 9900, // $99
    features: [
      'Privacy policy template',
      'Data processing agreements',
      'Consent forms & notices',
      'Data subject rights process',
      'DPA audit checklist',
      'Cookie consent banners',
      'International guidance',
      'Incident response plan',
    ],
    icon: '🌍',
    industry: ['E-commerce', 'SaaS', 'Marketing', 'Enterprise'],
    coupons: ['ENTERPRISE50'],
    downloadSize: '28 MB',
    fileFormats: ['Word', 'PDF', 'Google Docs'],
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
 * TemplatesPricingTable Component
 *
 * Displays all design assets and document templates with
 * lifetime licensing and category organization.
 *
 * @component
 */
export const TemplatesPricingTable: React.FC<TemplatesPricingTableProps> = ({
  onProductSelect,
  currency = 'USD',
  showEnterpriseBadge = true,
  isEnterpriseUser = false,
  className = '',
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'design_assets' | 'document_templates'>('all');

  // Filter products by category
  const filteredProducts = activeCategory === 'all'
    ? TEMPLATES_PRODUCTS
    : TEMPLATES_PRODUCTS.filter((p) => p.category === activeCategory);

  // Separate by category
  const designAssets = filteredProducts.filter((p) => p.category === 'design_assets');
  const documentTemplates = filteredProducts.filter((p) => p.category === 'document_templates');

  return (
    <div className={`templates-pricing-table ${className}`}>
      {/* Header */}
      <div className="pricing-header">
        <h2>Professional Templates & Assets</h2>
        <p className="subtitle">High-quality design assets and document templates with lifetime access</p>

        {/* Category Filter */}
        <div className="pricing-controls">
          <div className="category-filter">
            <button
              onClick={() => setActiveCategory('all')}
              className={`filter-btn ${activeCategory === 'all' ? 'active' : ''}`}
            >
              All Templates
            </button>
            <button
              onClick={() => setActiveCategory('design_assets')}
              className={`filter-btn ${activeCategory === 'design_assets' ? 'active' : ''}`}
            >
              Design Assets
            </button>
            <button
              onClick={() => setActiveCategory('document_templates')}
              className={`filter-btn ${activeCategory === 'document_templates' ? 'active' : ''}`}
            >
              Documents
            </button>
          </div>
        </div>
      </div>

      {/* Design Assets Section */}
      {(activeCategory === 'all' || activeCategory === 'design_assets') && designAssets.length > 0 && (
        <div className="products-section">
          <h3 className="section-title">🎨 Design Assets (Lifetime License)</h3>
          <div className="products-grid">
            {designAssets.map((product) => (
              <div
                key={product.id}
                className={`product-card ${product.popular ? 'popular' : ''} ${
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

                {/* Industries */}
                {product.industry && product.industry.length > 0 && (
                  <div className="industries">
                    <span className="label">Best for:</span>
                    <div className="industry-tags">
                      {product.industry.map((ind) => (
                        <span key={ind} className="industry-tag">
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pricing */}
                <div className="pricing">
                  <div className="price">{formatPrice(product.priceCents, currency)}</div>
                  <div className="license-badge">Lifetime License</div>
                </div>

                {/* File Info */}
                {product.fileFormats && (
                  <div className="file-info">
                    <div className="file-item">
                      <span className="label">Formats:</span> {product.fileFormats.join(', ')}
                    </div>
                    {product.downloadSize && (
                      <div className="file-item">
                        <span className="label">Size:</span> {product.downloadSize}
                      </div>
                    )}
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
                    onProductSelect?.(product.id, product.name, product.priceCents)
                  }
                  className={`cta-button ${isEnterpriseUser ? 'enterprise' : ''}`}
                  disabled={isEnterpriseUser}
                  title={
                    isEnterpriseUser ? 'Included in your Enterprise plan' : 'Download now'
                  }
                >
                  {isEnterpriseUser ? '✓ You have access' : 'Download Now'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Document Templates Section */}
      {(activeCategory === 'all' || activeCategory === 'document_templates') && documentTemplates.length > 0 && (
        <div className="products-section">
          <h3 className="section-title">📄 Document Templates (Lifetime License)</h3>
          <div className="products-grid">
            {documentTemplates.map((product) => (
              <div
                key={product.id}
                className={`product-card ${product.popular ? 'popular' : ''} ${
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

                {/* Industries */}
                {product.industry && product.industry.length > 0 && (
                  <div className="industries">
                    <span className="label">Best for:</span>
                    <div className="industry-tags">
                      {product.industry.map((ind) => (
                        <span key={ind} className="industry-tag">
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pricing */}
                <div className="pricing">
                  <div className="price">{formatPrice(product.priceCents, currency)}</div>
                  <div className="license-badge">Lifetime License</div>
                </div>

                {/* File Info */}
                {product.fileFormats && (
                  <div className="file-info">
                    <div className="file-item">
                      <span className="label">Formats:</span> {product.fileFormats.join(', ')}
                    </div>
                    {product.downloadSize && (
                      <div className="file-item">
                        <span className="label">Size:</span> {product.downloadSize}
                      </div>
                    )}
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
                    onProductSelect?.(product.id, product.name, product.priceCents)
                  }
                  className={`cta-button ${isEnterpriseUser ? 'enterprise' : ''}`}
                  disabled={isEnterpriseUser}
                  title={
                    isEnterpriseUser ? 'Included in your Enterprise plan' : 'Download now'
                  }
                >
                  {isEnterpriseUser ? '✓ You have access' : 'Download Now'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .templates-pricing-table {
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

        .category-filter {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          justify-content: center;
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
          border-color: #f59e0b;
        }

        .filter-btn.active {
          background-color: #f59e0b;
          color: white;
          border-color: #f59e0b;
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
          border-color: #f59e0b;
          box-shadow: 0 20px 25px -5px rgba(245, 158, 11, 0.1);
        }

        .product-card.popular {
          border-color: #f59e0b;
          box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.1);
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
          background-color: #f59e0b;
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

        .industries {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .industries .label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
        }

        .industry-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .industry-tag {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background-color: #f0fdf4;
          color: #166534;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
          border: 1px solid #bbf7d0;
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
          color: #f59e0b;
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

        .file-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #6b7280;
          background-color: #f9fafb;
          padding: 0.75rem;
          border-radius: 0.375rem;
        }

        .file-item {
          display: flex;
          gap: 0.5rem;
        }

        .file-item .label {
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
          background-color: #f59e0b;
          color: white;
          border: none;
          border-radius: 0.375rem;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cta-button:hover:not(:disabled) {
          background-color: #d97706;
          box-shadow: 0 10px 15px -3px rgba(245, 158, 11, 0.3);
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

          .category-filter {
            flex-direction: column;
          }

          .filter-btn {
            width: 100%;
          }

          .products-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default TemplatesPricingTable;
