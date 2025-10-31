/**
 * Admin Product Management Dashboard
 *
 * Features:
 * - View all products by category
 * - Sync status with Stripe
 * - Manual sync trigger
 * - View product performance metrics
 * - Monitor enterprise access grants
 * - Track coupon usage
 *
 * URL: /dashboard/admin/products
 * Requires: Admin role
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stripe_synced: boolean;
  last_sync: string;
  sales: number;
  revenue: number;
}

interface SyncStatus {
  status: 'synced' | 'syncing' | 'error';
  lastSync: string;
  productCount: number;
  successCount: number;
  errorCount: number;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    status: 'synced',
    lastSync: new Date().toISOString(),
    productCount: 0,
    successCount: 0,
    errorCount: 0,
  });
  const [filter, setFilter] = useState<'all' | 'developer' | 'business' | 'education' | 'templates'>(
    'all'
  );
  const [isSyncing, setIsSyncing] = useState(false);

  // Load products (mock data for now)
  useEffect(() => {
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'AI Code Assistant Pro',
        category: 'developer',
        price: 4900,
        stripe_synced: true,
        last_sync: new Date().toISOString(),
        sales: 145,
        revenue: 710500,
      },
      {
        id: '2',
        name: 'Business Intelligence Starter',
        category: 'business',
        price: 9900,
        stripe_synced: true,
        last_sync: new Date().toISOString(),
        sales: 67,
        revenue: 663300,
      },
      {
        id: '3',
        name: 'Afilo Platform Mastery Course',
        category: 'education',
        price: 29900,
        stripe_synced: true,
        last_sync: new Date().toISOString(),
        sales: 34,
        revenue: 1016600,
      },
      {
        id: '4',
        name: 'React Component Library Pro',
        category: 'developer',
        price: 14900,
        stripe_synced: true,
        last_sync: new Date().toISOString(),
        sales: 89,
        revenue: 1326100,
      },
    ];

    setProducts(mockProducts);
    setSyncStatus({
      status: 'synced',
      lastSync: new Date(Date.now() - 3600000).toISOString(),
      productCount: mockProducts.length,
      successCount: mockProducts.length,
      errorCount: 0,
    });
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncStatus((prev) => ({ ...prev, status: 'syncing' }));

    try {
      // Simulate sync delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setSyncStatus({
        status: 'synced',
        lastSync: new Date().toISOString(),
        productCount: products.length,
        successCount: products.length,
        errorCount: 0,
      });
    } catch (error) {
      setSyncStatus((prev) => ({ ...prev, status: 'error', errorCount: 1 }));
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredProducts =
    filter === 'all' ? products : products.filter((p) => p.category === filter);

  const totalRevenue = filteredProducts.reduce((sum, p) => sum + p.revenue, 0);
  const totalSales = filteredProducts.reduce((sum, p) => sum + p.sales, 0);

  const categoryStats = {
    developer: products.filter((p) => p.category === 'developer').length,
    business: products.filter((p) => p.category === 'business').length,
    education: products.filter((p) => p.category === 'education').length,
    templates: products.filter((p) => p.category === 'templates').length,
  };

  return (
    <div className="admin-products-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Product Management</h1>
          <p>Manage products, monitor sync status, and view performance metrics</p>
        </div>
        <button onClick={handleSync} disabled={isSyncing} className="sync-button">
          {isSyncing ? 'Syncing...' : '🔄 Sync with Stripe'}
        </button>
      </div>

      {/* Sync Status Card */}
      <div className={`sync-status-card status-${syncStatus.status}`}>
        <div className="status-icon">{syncStatus.status === 'synced' ? '✓' : '⚠️'}</div>
        <div className="status-info">
          <h3>Stripe Sync Status: {syncStatus.status.toUpperCase()}</h3>
          <p>Last sync: {new Date(syncStatus.lastSync).toLocaleString()}</p>
          <div className="status-stats">
            <span>{syncStatus.productCount} products</span>
            <span className="success">✓ {syncStatus.successCount} synced</span>
            {syncStatus.errorCount > 0 && <span className="error">✗ {syncStatus.errorCount} errors</span>}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Products</div>
          <div className="stat-value">{products.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">${(totalRevenue / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Sales</div>
          <div className="stat-value">{totalSales}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Categories</div>
          <div className="stat-value">4</div>
        </div>
      </div>

      {/* Category Overview */}
      <div className="category-overview">
        <h2>Products by Category</h2>
        <div className="category-grid">
          <div className="category-card" onClick={() => setFilter('developer')}>
            <div className="category-icon">👨‍💻</div>
            <div className="category-name">Developer Tools</div>
            <div className="category-count">{categoryStats.developer} products</div>
          </div>
          <div className="category-card" onClick={() => setFilter('business')}>
            <div className="category-icon">📊</div>
            <div className="category-name">Business Intelligence</div>
            <div className="category-count">{categoryStats.business} products</div>
          </div>
          <div className="category-card" onClick={() => setFilter('education')}>
            <div className="category-icon">📚</div>
            <div className="category-name">Education</div>
            <div className="category-count">{categoryStats.education} products</div>
          </div>
          <div className="category-card" onClick={() => setFilter('templates')}>
            <div className="category-icon">📦</div>
            <div className="category-name">Templates</div>
            <div className="category-count">{categoryStats.templates} products</div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="products-section">
        <div className="section-header">
          <h2>Products</h2>
          <div className="filter-buttons">
            <button
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'active' : ''}
            >
              All
            </button>
            <button
              onClick={() => setFilter('developer')}
              className={filter === 'developer' ? 'active' : ''}
            >
              Developer
            </button>
            <button
              onClick={() => setFilter('business')}
              className={filter === 'business' ? 'active' : ''}
            >
              Business
            </button>
            <button
              onClick={() => setFilter('education')}
              className={filter === 'education' ? 'active' : ''}
            >
              Education
            </button>
          </div>
        </div>

        <div className="products-table">
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Sales</th>
                <th>Revenue</th>
                <th>Sync Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td className="product-name">{product.name}</td>
                  <td className="category">{product.category}</td>
                  <td className="price">${(product.price / 100).toFixed(2)}</td>
                  <td className="sales">{product.sales}</td>
                  <td className="revenue">${(product.revenue / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  <td className="sync-status">
                    {product.stripe_synced ? (
                      <span className="synced">✓ Synced</span>
                    ) : (
                      <span className="pending">⏳ Pending</span>
                    )}
                  </td>
                  <td className="actions">
                    <button className="action-btn">Edit</button>
                    <button className="action-btn">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .admin-products-page {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          gap: 2rem;
        }

        .header-content h1 {
          font-size: 2rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
        }

        .header-content p {
          font-size: 1rem;
          color: #6b7280;
          margin: 0;
        }

        .sync-button {
          padding: 0.75rem 1.5rem;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .sync-button:hover:not(:disabled) {
          background-color: #2563eb;
          transform: translateY(-2px);
        }

        .sync-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Sync Status */
        .sync-status-card {
          display: flex;
          gap: 1.5rem;
          padding: 1.5rem;
          border-radius: 0.75rem;
          margin-bottom: 2rem;
          align-items: flex-start;
        }

        .sync-status-card.status-synced {
          background-color: #f0fdf4;
          border: 1px solid #86efac;
        }

        .sync-status-card.status-error {
          background-color: #fef2f2;
          border: 1px solid #fecaca;
        }

        .status-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .status-info h3 {
          font-size: 1.125rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
        }

        .status-info p {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0 0 0.75rem 0;
        }

        .status-stats {
          display: flex;
          gap: 1.5rem;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .status-stats .success {
          color: #10b981;
        }

        .status-stats .error {
          color: #ef4444;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          padding: 1.5rem;
          background-color: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #3b82f6;
        }

        /* Category Overview */
        .category-overview {
          margin-bottom: 2rem;
        }

        .category-overview h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 1rem 0;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        .category-card {
          padding: 1.5rem;
          background-color: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .category-card:hover {
          border-color: #3b82f6;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .category-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .category-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.25rem;
        }

        .category-count {
          font-size: 0.85rem;
          color: #6b7280;
        }

        /* Products Section */
        .products-section {
          background-color: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          gap: 1rem;
        }

        .section-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
        }

        .filter-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .filter-buttons button {
          padding: 0.5rem 1rem;
          border: 1px solid #e5e7eb;
          background-color: white;
          border-radius: 0.375rem;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .filter-buttons button.active {
          background-color: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .products-table {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        thead th {
          text-align: left;
          padding: 1rem;
          background-color: #f9fafb;
          border-bottom: 2px solid #e5e7eb;
          font-weight: 600;
          font-size: 0.875rem;
          color: #6b7280;
        }

        tbody td {
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
          font-size: 0.9rem;
        }

        tbody tr:hover {
          background-color: #f9fafb;
        }

        .product-name {
          font-weight: 600;
          color: #111827;
        }

        .category {
          color: #6b7280;
          text-transform: capitalize;
        }

        .price,
        .sales,
        .revenue {
          text-align: right;
          font-weight: 600;
        }

        .synced {
          color: #10b981;
          font-weight: 600;
        }

        .pending {
          color: #f59e0b;
          font-weight: 600;
        }

        .actions {
          text-align: right;
        }

        .action-btn {
          padding: 0.375rem 0.75rem;
          background-color: transparent;
          border: 1px solid #e5e7eb;
          border-radius: 0.25rem;
          cursor: pointer;
          font-size: 0.8rem;
          margin-left: 0.5rem;
          transition: all 0.2s;
        }

        .action-btn:hover {
          border-color: #3b82f6;
          color: #3b82f6;
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
          }

          .section-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .filter-buttons {
            width: 100%;
            flex-wrap: wrap;
          }

          table {
            font-size: 0.8rem;
          }

          thead th,
          tbody td {
            padding: 0.75rem 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
