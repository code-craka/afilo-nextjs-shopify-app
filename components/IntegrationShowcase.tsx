'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Plug2, CheckCircle2, ArrowRight, Filter } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  category: string;
  description: string;
  logo: string; // Emoji for now (can replace with actual logos later)
  status: 'native' | 'api' | 'webhook';
  setupTime: string;
}

const integrations: Integration[] = [
  // E-Commerce
  { id: 'shopify', name: 'Shopify', category: 'E-Commerce', description: 'Complete storefront integration', logo: '🛍️', status: 'native', setupTime: '5 min' },
  { id: 'woocommerce', name: 'WooCommerce', category: 'E-Commerce', description: 'WordPress e-commerce sync', logo: '🛒', status: 'api', setupTime: '10 min' },
  { id: 'magento', name: 'Magento', category: 'E-Commerce', description: 'Enterprise commerce platform', logo: '🏪', status: 'api', setupTime: '15 min' },

  // Payments
  { id: 'stripe', name: 'Stripe', category: 'Payments', description: 'Credit card & ACH processing', logo: '💳', status: 'native', setupTime: '5 min' },
  { id: 'paypal', name: 'PayPal', category: 'Payments', description: 'Global payment gateway', logo: '💰', status: 'api', setupTime: '10 min' },
  { id: 'square', name: 'Square', category: 'Payments', description: 'POS and online payments', logo: '⬛', status: 'api', setupTime: '10 min' },

  // CRM
  { id: 'salesforce', name: 'Salesforce', category: 'CRM', description: 'Customer relationship management', logo: '☁️', status: 'api', setupTime: '20 min' },
  { id: 'hubspot', name: 'HubSpot', category: 'CRM', description: 'Inbound marketing & sales', logo: '🎯', status: 'native', setupTime: '15 min' },
  { id: 'pipedrive', name: 'Pipedrive', category: 'CRM', description: 'Sales pipeline management', logo: '📊', status: 'api', setupTime: '15 min' },

  // Communication
  { id: 'slack', name: 'Slack', category: 'Communication', description: 'Team messaging & notifications', logo: '💬', status: 'webhook', setupTime: '3 min' },
  { id: 'teams', name: 'Microsoft Teams', category: 'Communication', description: 'Enterprise collaboration', logo: '👥', status: 'webhook', setupTime: '5 min' },
  { id: 'discord', name: 'Discord', category: 'Communication', description: 'Community & team chat', logo: '🎮', status: 'webhook', setupTime: '3 min' },

  // Email & Marketing
  { id: 'mailchimp', name: 'Mailchimp', category: 'Marketing', description: 'Email marketing campaigns', logo: '📧', status: 'api', setupTime: '10 min' },
  { id: 'sendgrid', name: 'SendGrid', category: 'Marketing', description: 'Transactional email delivery', logo: '📨', status: 'native', setupTime: '5 min' },
  { id: 'klaviyo', name: 'Klaviyo', category: 'Marketing', description: 'E-commerce email automation', logo: '✉️', status: 'api', setupTime: '15 min' },

  // Analytics
  { id: 'google-analytics', name: 'Google Analytics', category: 'Analytics', description: 'Web traffic & behavior tracking', logo: '📈', status: 'native', setupTime: '5 min' },
  { id: 'mixpanel', name: 'Mixpanel', category: 'Analytics', description: 'Product analytics & insights', logo: '📊', status: 'api', setupTime: '10 min' },
  { id: 'segment', name: 'Segment', category: 'Analytics', description: 'Customer data platform', logo: '🔀', status: 'native', setupTime: '10 min' },

  // Authentication
  { id: 'clerk', name: 'Clerk', category: 'Authentication', description: 'User authentication & SSO', logo: '🔐', status: 'native', setupTime: '5 min' },
  { id: 'auth0', name: 'Auth0', category: 'Authentication', description: 'Identity management platform', logo: '🛡️', status: 'api', setupTime: '15 min' },
  { id: 'okta', name: 'Okta', category: 'Authentication', description: 'Enterprise SSO & directory', logo: '🔑', status: 'api', setupTime: '20 min' },

  // Database & Storage
  { id: 'neon', name: 'Neon Database', category: 'Database', description: 'Serverless PostgreSQL', logo: '🗄️', status: 'native', setupTime: '5 min' },
  { id: 'aws-s3', name: 'AWS S3', category: 'Storage', description: 'Cloud object storage', logo: '☁️', status: 'api', setupTime: '10 min' },
  { id: 'cloudflare', name: 'Cloudflare R2', category: 'Storage', description: 'S3-compatible storage', logo: '🌐', status: 'api', setupTime: '10 min' },

  // Productivity
  { id: 'notion', name: 'Notion', category: 'Productivity', description: 'Workspace & documentation', logo: '📝', status: 'api', setupTime: '15 min' },
  { id: 'airtable', name: 'Airtable', category: 'Productivity', description: 'Collaborative spreadsheet DB', logo: '📋', status: 'api', setupTime: '10 min' },
  { id: 'zapier', name: 'Zapier', category: 'Automation', description: '5,000+ app integrations', logo: '⚡', status: 'webhook', setupTime: '5 min' }
];

const categories = ['All', ...Array.from(new Set(integrations.map(i => i.category)))];

export default function IntegrationShowcase() {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('All');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('all');

  const filteredIntegrations = integrations.filter(integration => {
    const categoryMatch = selectedCategory === 'All' || integration.category === selectedCategory;
    const statusMatch = selectedStatus === 'all' || integration.status === selectedStatus;
    return categoryMatch && statusMatch;
  });

  const getStatusBadge = (status: Integration['status']) => {
    const badges = {
      native: { label: 'Native', color: 'bg-green-100 text-green-700 border-green-300' },
      api: { label: 'API', color: 'bg-blue-100 text-blue-700 border-blue-300' },
      webhook: { label: 'Webhook', color: 'bg-purple-100 text-purple-700 border-purple-300' }
    };
    return badges[status];
  };

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Plug2 className="w-4 h-4" />
            Integrations
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Connect with{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Everything
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Seamlessly integrate with 25+ popular platforms and services. Native integrations, REST APIs, and webhooks for maximum flexibility.
          </p>

          {/* Integration Stats */}
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                25+
              </div>
              <div className="text-sm text-gray-600">Integrations</div>
            </div>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                5 min
              </div>
              <div className="text-sm text-gray-600">Avg Setup Time</div>
            </div>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                99.9%
              </div>
              <div className="text-sm text-gray-600">API Uptime</div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            {/* Category Filter */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Filter className="w-4 h-4" />
                Filter by Category
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      selectedCategory === category
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <CheckCircle2 className="w-4 h-4" />
                Integration Type
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedStatus('all')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    selectedStatus === 'all'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Types
                </button>
                <button
                  onClick={() => setSelectedStatus('native')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    selectedStatus === 'native'
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                  }`}
                >
                  Native (Fastest)
                </button>
                <button
                  onClick={() => setSelectedStatus('api')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    selectedStatus === 'api'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                  }`}
                >
                  REST API
                </button>
                <button
                  onClick={() => setSelectedStatus('webhook')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    selectedStatus === 'webhook'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                  }`}
                >
                  Webhooks
                </button>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing <span className="font-bold text-gray-900">{filteredIntegrations.length}</span> integrations
              </p>
            </div>
          </div>
        </div>

        {/* Integration Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredIntegrations.map((integration, index) => {
            const statusBadge = getStatusBadge(integration.status);

            return (
              <motion.div
                key={integration.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all group"
              >
                {/* Logo & Status */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-4xl">
                    {integration.logo}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold border ${statusBadge.color}`}>
                    {statusBadge.label}
                  </div>
                </div>

                {/* Name & Category */}
                <h3 className="text-xl font-bold text-gray-900 mb-1">{integration.name}</h3>
                <p className="text-sm text-gray-500 mb-3">{integration.category}</p>

                {/* Description */}
                <p className="text-sm text-gray-700 mb-4 line-clamp-2">{integration.description}</p>

                {/* Setup Time */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Setup: {integration.setupTime}</span>
                  </div>
                  <button className="flex items-center gap-2 text-blue-600 font-semibold text-sm group-hover:gap-3 transition-all">
                    <span>Connect</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Empty State */}
        {filteredIntegrations.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Filter className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No integrations found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters to see more results</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedStatus('all');
              }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Reset Filters
            </button>
          </motion.div>
        )}

        {/* Custom Integration CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white shadow-2xl"
        >
          <h3 className="text-3xl font-bold mb-4">Need a Custom Integration?</h3>
          <p className="text-lg mb-6 text-blue-100">
            Our Enterprise team can build custom integrations for your specific tools and workflows
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/enterprise#quote"
              className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:shadow-xl transition-all"
            >
              Request Custom Integration
            </a>
            <a
              href="https://docs.afilo.io/integrations"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-bold hover:bg-white/20 transition-all border border-white/30"
            >
              View API Documentation
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
