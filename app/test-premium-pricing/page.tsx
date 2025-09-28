'use client';

import { useState } from 'react';
import ProductGrid from '@/components/ProductGrid';
import PremiumPricingDisplay from '@/components/PremiumPricingDisplay';
import SubscriptionManager from '@/components/SubscriptionManager';
import EnterpriseQuoteBuilder from '@/components/EnterpriseQuoteBuilder';
import type { ShopifyProduct } from '@/types/shopify';

// Mock premium products for testing
const mockPremiumProducts: ShopifyProduct[] = [
  {
    id: 'gid://shopify/Product/1',
    handle: 'ai-image-generator-enterprise',
    title: 'AI Image Generator Tool - Enterprise Edition',
    description: 'Enterprise-grade AI image generation with unlimited usage, advanced features, and dedicated support.',
    descriptionHtml: '<p>Enterprise-grade AI image generation with unlimited usage, advanced features, and dedicated support.</p>',
    availableForSale: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-28T00:00:00Z',
    publishedAt: '2025-01-01T00:00:00Z',
    vendor: 'Afilo Enterprise',
    productType: 'AI Tool',
    tags: ['enterprise', 'ai', 'image-generator', 'monthly', 'premium'],
    images: {
      edges: [
        {
          node: {
            id: 'gid://shopify/ProductImage/1',
            url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop',
            altText: 'AI Image Generator Enterprise',
            width: 800,
            height: 600
          }
        }
      ]
    },
    variants: {
      edges: [
        {
          node: {
            id: 'gid://shopify/ProductVariant/1',
            title: 'Default Title',
            availableForSale: true,
            selectedOptions: [{ name: 'Title', value: 'Default Title' }],
            price: { amount: '1999.00', currencyCode: 'USD' },
            sku: 'AI-GEN-ENT-001'
          }
        }
      ]
    },
    options: [{ id: '1', name: 'Title', values: ['Default Title'] }],
    priceRange: {
      minVariantPrice: { amount: '1999.00', currencyCode: 'USD' },
      maxVariantPrice: { amount: '1999.00', currencyCode: 'USD' }
    },
    featuredImage: {
      id: 'gid://shopify/ProductImage/1',
      url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop',
      altText: 'AI Image Generator Enterprise',
      width: 800,
      height: 600
    },
    seo: {
      title: 'AI Image Generator Enterprise - Afilo',
      description: 'Enterprise AI image generation solution'
    }
  },
  {
    id: 'gid://shopify/Product/2',
    handle: 'react-ecommerce-template-enterprise',
    title: 'React E-commerce Template - Enterprise Package',
    description: 'Complete React e-commerce solution with enterprise features, unlimited sites, and premium support.',
    descriptionHtml: '<p>Complete React e-commerce solution with enterprise features, unlimited sites, and premium support.</p>',
    availableForSale: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-28T00:00:00Z',
    publishedAt: '2025-01-01T00:00:00Z',
    vendor: 'Afilo Enterprise',
    productType: 'Template',
    tags: ['enterprise', 'react', 'ecommerce', 'template', 'monthly', 'premium'],
    images: {
      edges: [
        {
          node: {
            id: 'gid://shopify/ProductImage/2',
            url: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800&h=600&fit=crop',
            altText: 'React E-commerce Template',
            width: 800,
            height: 600
          }
        }
      ]
    },
    variants: {
      edges: [
        {
          node: {
            id: 'gid://shopify/ProductVariant/2',
            title: 'Default Title',
            availableForSale: true,
            selectedOptions: [{ name: 'Title', value: 'Default Title' }],
            price: { amount: '2499.00', currencyCode: 'USD' },
            sku: 'REACT-TEMP-ENT-002'
          }
        }
      ]
    },
    options: [{ id: '2', name: 'Title', values: ['Default Title'] }],
    priceRange: {
      minVariantPrice: { amount: '2499.00', currencyCode: 'USD' },
      maxVariantPrice: { amount: '2499.00', currencyCode: 'USD' }
    },
    featuredImage: {
      id: 'gid://shopify/ProductImage/2',
      url: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800&h=600&fit=crop',
      altText: 'React E-commerce Template',
      width: 800,
      height: 600
    },
    seo: {
      title: 'React E-commerce Template Enterprise - Afilo',
      description: 'Enterprise React e-commerce template solution'
    }
  },
  {
    id: 'gid://shopify/Product/3',
    handle: 'python-data-analysis-professional',
    title: 'Python Data Analysis Script - Professional Suite',
    description: 'Advanced Python analytics with enterprise data processing, machine learning capabilities, and 24/7 support.',
    descriptionHtml: '<p>Advanced Python analytics with enterprise data processing, machine learning capabilities, and 24/7 support.</p>',
    availableForSale: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-28T00:00:00Z',
    publishedAt: '2025-01-01T00:00:00Z',
    vendor: 'Afilo Professional',
    productType: 'Script',
    tags: ['professional', 'python', 'analytics', 'data-science', 'monthly', 'premium'],
    images: {
      edges: [
        {
          node: {
            id: 'gid://shopify/ProductImage/3',
            url: 'https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?w=800&h=600&fit=crop',
            altText: 'Python Data Analysis Script',
            width: 800,
            height: 600
          }
        }
      ]
    },
    variants: {
      edges: [
        {
          node: {
            id: 'gid://shopify/ProductVariant/3',
            title: 'Default Title',
            availableForSale: true,
            selectedOptions: [{ name: 'Title', value: 'Default Title' }],
            price: { amount: '999.00', currencyCode: 'USD' },
            sku: 'PYTHON-ANALYTICS-PRO-003'
          }
        }
      ]
    },
    options: [{ id: '3', name: 'Title', values: ['Default Title'] }],
    priceRange: {
      minVariantPrice: { amount: '999.00', currencyCode: 'USD' },
      maxVariantPrice: { amount: '999.00', currencyCode: 'USD' }
    },
    featuredImage: {
      id: 'gid://shopify/ProductImage/3',
      url: 'https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?w=800&h=600&fit=crop',
      altText: 'Python Data Analysis Script',
      width: 800,
      height: 600
    },
    seo: {
      title: 'Python Data Analysis Professional - Afilo',
      description: 'Professional Python data analysis and machine learning suite'
    }
  }
];

export default function TestPremiumPricingPage() {
  const [activeTab, setActiveTab] = useState<'products' | 'pricing' | 'subscriptions' | 'quotes'>('products');

  const handleAddToCart = async (product: ShopifyProduct, variantId: string) => {
    console.log('🛒 Premium product subscription requested:', {
      product: product.title,
      variantId,
      price: product.variants.edges[0]?.node.price,
      isPremium: true
    });

    // Simulate subscription flow
    alert(`Starting subscription for ${product.title} at ${product.variants.edges[0]?.node.price.amount} ${product.variants.edges[0]?.node.price.currencyCode}/month`);
  };

  const handleProductClick = (product: ShopifyProduct) => {
    console.log('👀 Product details requested:', product.title);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Premium Pricing Test Suite
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Test the complete premium pricing flow including product display, subscription management, and enterprise quotes.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-lg border border-gray-200">
            {(['products', 'pricing', 'subscriptions', 'quotes'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-md font-medium transition-all duration-300 ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-7xl mx-auto">
          {activeTab === 'products' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Premium Products Display</h2>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <ProductGrid
                  initialProducts={mockPremiumProducts}
                  onAddToCart={handleAddToCart}
                  onProductClick={handleProductClick}
                  showLoadMore={false}
                  className="premium-products-test"
                />
              </div>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Enterprise Pricing Tiers</h2>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <PremiumPricingDisplay
                  onSelectTier={(tier: string, billing: string) => {
                    console.log('💎 Enterprise tier selected:', { tier, billing });
                    alert(`Selected ${tier} tier with ${billing} billing`);
                  }}
                  showComparison={true}
                />
              </div>
            </div>
          )}

          {activeTab === 'subscriptions' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Subscription Management</h2>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <SubscriptionManager />
              </div>
            </div>
          )}

          {activeTab === 'quotes' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Enterprise Quote Builder</h2>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <EnterpriseQuoteBuilder />
              </div>
            </div>
          )}
        </div>

        {/* Testing Instructions */}
        <div className="mt-12 bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-amber-800 mb-4">🧪 Testing Instructions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-amber-700">
            <div>
              <h4 className="font-semibold mb-2">Premium Products:</h4>
              <ul className="space-y-1">
                <li>• Products ≥$999 show PREMIUM badges</li>
                <li>• Enterprise products show ENTERPRISE badges</li>
                <li>• Subscription pricing shows /month</li>
                <li>• Premium buttons are purple gradient</li>
                <li>• "Start Subscription" instead of "Add to Cart"</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Enterprise Features:</h4>
              <ul className="space-y-1">
                <li>• Pricing tiers: Professional, Enterprise, Enterprise Plus</li>
                <li>• Volume discounts: 10-25% for 25-500+ users</li>
                <li>• Educational discounts: 50% student, 30% teacher</li>
                <li>• ROI calculator with 3-year projections</li>
                <li>• Custom quotes $50K-$500K range</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Console Log Helper */}
        <div className="mt-6 bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm">
          <p className="text-gray-400 mb-2">Console Log Preview:</p>
          <p>💡 Open browser console to see detailed interaction logs</p>
          <p>🛒 Premium subscription flows logged in detail</p>
          <p>💎 Enterprise tier selections tracked</p>
        </div>
      </div>
    </div>
  );
}