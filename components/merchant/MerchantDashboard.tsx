'use client';

/**
 * MerchantDashboard Component
 *
 * ⚠️ DORMANT FEATURE - Prepared for future activation
 *
 * Comprehensive dashboard for merchant management featuring:
 * - Sales analytics and revenue tracking
 * - Order management and fulfillment
 * - Product catalog management
 * - Customer management
 * - Payout and earnings reports
 * - Real-time notifications
 * - Settings and account management
 *
 * Currently disabled - will be activated when marketplace features launch.
 *
 * Features (when enabled):
 * - Real-time sales dashboard
 * - Multi-currency revenue tracking
 * - Advanced analytics (charts, graphs, reports)
 * - Batch order processing
 * - Inventory management
 * - Customer communication tools
 * - Automated payout scheduling
 * - Tax report generation
 *
 * Usage:
 * ```tsx
 * // Currently disabled, will be available when marketplace launches
 * if (isMarketplaceEnabled && isMerchantUser) {
 *   <MerchantDashboard merchantId="merchant_xxx" />
 * }
 * ```
 */

import React, { useState } from 'react';

/**
 * Dashboard sections/tabs
 */
enum DashboardSection {
  Overview = 'overview',
  Sales = 'sales',
  Orders = 'orders',
  Products = 'products',
  Customers = 'customers',
  Payouts = 'payouts',
  Settings = 'settings',
}

/**
 * Component Props
 */
interface MerchantDashboardProps {
  /** Merchant account ID */
  merchantId: string;
  /** Currency preference (optional) */
  currency?: string;
  /** Custom className */
  className?: string;
  /** Initial active section (optional) */
  initialSection?: DashboardSection;
}

/**
 * MerchantDashboard Component
 *
 * ⚠️ DORMANT - This component is prepared but not active.
 * Will be enabled when marketplace features are launched.
 *
 * Provides a comprehensive dashboard for merchants to:
 * - View real-time sales and revenue
 * - Manage orders and fulfillment
 * - Configure products and inventory
 * - Analyze customer behavior
 * - Schedule and track payouts
 * - Generate reports
 * - Update account settings
 *
 * @component
 */
export const MerchantDashboard: React.FC<MerchantDashboardProps> = ({
  merchantId,
  currency = 'USD',
  className = '',
  initialSection = DashboardSection.Overview,
}) => {
  const [activeSection, setActiveSection] = useState<DashboardSection>(initialSection);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Render dormant state message
   */
  const renderDormantMessage = () => (
    <div className="dormant-dashboard-container">
      <div className="dormant-dashboard-banner">
        <div className="dormant-icon">🏪</div>
        <div className="dormant-content">
          <h2>Merchant Dashboard Coming Soon</h2>
          <p>
            The merchant dashboard is currently dormant and will be activated
            when Afilo's marketplace features become available.
          </p>

          <div className="dashboard-sections">
            <p>
              <strong>Dashboard will include:</strong>
            </p>
            <div className="section-grid">
              <div className="section-card">
                <div className="section-icon">📊</div>
                <div className="section-name">Overview</div>
                <p className="section-desc">Real-time sales and revenue metrics</p>
              </div>

              <div className="section-card">
                <div className="section-icon">💰</div>
                <div className="section-name">Sales Analytics</div>
                <p className="section-desc">Advanced charts, trends, and forecasting</p>
              </div>

              <div className="section-card">
                <div className="section-icon">📦</div>
                <div className="section-name">Orders</div>
                <p className="section-desc">Fulfillment and order management</p>
              </div>

              <div className="section-card">
                <div className="section-icon">🏷️</div>
                <div className="section-name">Products</div>
                <p className="section-desc">Catalog management and inventory</p>
              </div>

              <div className="section-card">
                <div className="section-icon">👥</div>
                <div className="section-name">Customers</div>
                <p className="section-desc">Customer insights and messaging</p>
              </div>

              <div className="section-card">
                <div className="section-icon">🏦</div>
                <div className="section-name">Payouts</div>
                <p className="section-desc">Multi-currency earnings and transfers</p>
              </div>

              <div className="section-card">
                <div className="section-icon">📄</div>
                <div className="section-name">Reports</div>
                <p className="section-desc">Tax reports and financial statements</p>
              </div>

              <div className="section-card">
                <div className="section-icon">⚙️</div>
                <div className="section-name">Settings</div>
                <p className="section-desc">Account and marketplace configuration</p>
              </div>
            </div>
          </div>

          <div className="activation-info">
            <p className="info-title">🎯 When Activated:</p>
            <ul className="info-list">
              <li>Multi-currency revenue tracking and reporting</li>
              <li>Real-time order processing and fulfillment</li>
              <li>Advanced analytics with forecasting</li>
              <li>Automated payout scheduling</li>
              <li>Tax report generation and compliance</li>
              <li>Customer communication tools</li>
              <li>Bulk operations (orders, products, customers)</li>
              <li>Role-based access control (Admin, Manager, Viewer)</li>
              <li>Mobile app support</li>
              <li>Webhook notifications</li>
            </ul>
          </div>

          <p className="activation-note">
            To activate merchant features, enable the <code>MERCHANT_ACCOUNTS</code> feature flag
            and complete marketplace setup.
          </p>
        </div>
      </div>

      <style jsx>{`
        .dormant-dashboard-container {
          padding: 2rem;
        }

        .dormant-dashboard-banner {
          display: flex;
          gap: 2rem;
          padding: 2rem;
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border: 2px dashed #16a34a;
          border-radius: 0.75rem;
          align-items: flex-start;
        }

        .dormant-icon {
          font-size: 3rem;
          flex-shrink: 0;
        }

        .dormant-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .dormant-content h2 {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0;
          color: #15803d;
        }

        .dormant-content p {
          margin: 0;
          color: #15803d;
          font-size: 0.95rem;
        }

        .dashboard-sections {
          margin: 1rem 0;
        }

        .dashboard-sections p {
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .section-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
        }

        .section-card {
          padding: 1rem;
          background-color: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(22, 163, 74, 0.2);
          border-radius: 0.5rem;
          text-align: center;
          transition: all 0.2s ease;
        }

        .section-card:hover {
          background-color: rgba(255, 255, 255, 0.9);
          border-color: rgba(22, 163, 74, 0.4);
          transform: translateY(-2px);
        }

        .section-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .section-name {
          font-weight: 600;
          color: #15803d;
          font-size: 0.95rem;
          margin-bottom: 0.25rem;
        }

        .section-desc {
          font-size: 0.75rem;
          color: #4ade80;
          margin: 0;
        }

        .activation-info {
          padding: 1.5rem;
          background-color: rgba(255, 255, 255, 0.7);
          border-radius: 0.5rem;
          border-left: 4px solid #16a34a;
        }

        .info-title {
          font-weight: 700;
          color: #15803d;
          margin: 0 0 1rem 0;
        }

        .info-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .info-list li {
          color: #15803d;
          font-size: 0.9rem;
          padding: 0.5rem;
          padding-left: 0;
        }

        .info-list li:before {
          content: '✓ ';
          font-weight: 700;
          color: #16a34a;
          margin-right: 0.5rem;
        }

        .activation-note {
          padding: 1rem;
          background-color: rgba(255, 255, 255, 0.5);
          border-radius: 0.375rem;
          font-size: 0.875rem;
          color: #15803d;
          margin: 0;
        }

        .activation-note code {
          background-color: #f0fdf4;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-weight: 600;
          color: #16a34a;
        }

        @media (max-width: 768px) {
          .dormant-dashboard-banner {
            flex-direction: column;
          }

          .section-grid {
            grid-template-columns: 1fr;
          }

          .info-list {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );

  // Since this is dormant, always show dormant message
  return renderDormantMessage();
};

export default MerchantDashboard;
