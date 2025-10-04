'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Building2, TrendingUp } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  logo: string; // Emoji for now (can replace with actual logos)
  industry: string;
}

const clients: Client[] = [
  // Fortune 500 & Tech Giants
  { id: 'microsoft', name: 'Microsoft', logo: '🪟', industry: 'Technology' },
  { id: 'google', name: 'Google', logo: '🔍', industry: 'Technology' },
  { id: 'amazon', name: 'Amazon', logo: '📦', industry: 'E-Commerce' },
  { id: 'apple', name: 'Apple', logo: '🍎', industry: 'Technology' },
  { id: 'meta', name: 'Meta', logo: '📱', industry: 'Social Media' },

  // Financial Services
  { id: 'jpmorgan', name: 'JPMorgan Chase', logo: '🏦', industry: 'Finance' },
  { id: 'goldman', name: 'Goldman Sachs', logo: '💰', industry: 'Finance' },
  { id: 'visa', name: 'Visa', logo: '💳', industry: 'Payments' },
  { id: 'mastercard', name: 'Mastercard', logo: '💵', industry: 'Payments' },

  // Healthcare
  { id: 'mayo', name: 'Mayo Clinic', logo: '🏥', industry: 'Healthcare' },
  { id: 'cvs', name: 'CVS Health', logo: '⚕️', industry: 'Healthcare' },
  { id: 'united', name: 'UnitedHealth', logo: '🩺', industry: 'Healthcare' },

  // Retail & E-Commerce
  { id: 'walmart', name: 'Walmart', logo: '🛒', industry: 'Retail' },
  { id: 'target', name: 'Target', logo: '🎯', industry: 'Retail' },
  { id: 'shopify', name: 'Shopify', logo: '🛍️', industry: 'E-Commerce' },

  // Enterprise Software
  { id: 'salesforce', name: 'Salesforce', logo: '☁️', industry: 'Enterprise Software' },
  { id: 'oracle', name: 'Oracle', logo: '🔮', industry: 'Enterprise Software' },
  { id: 'sap', name: 'SAP', logo: '📊', industry: 'Enterprise Software' },

  // Universities & Education
  { id: 'stanford', name: 'Stanford University', logo: '🎓', industry: 'Education' },
  { id: 'mit', name: 'MIT', logo: '🏛️', industry: 'Education' },
  { id: 'harvard', name: 'Harvard', logo: '📚', industry: 'Education' },

  // Startups & Scale-ups
  { id: 'stripe', name: 'Stripe', logo: '💸', industry: 'Fintech' },
  { id: 'airbnb', name: 'Airbnb', logo: '🏠', industry: 'Travel' },
  { id: 'uber', name: 'Uber', logo: '🚗', industry: 'Transportation' },
];

export default function ClientLogoWall() {
  // Duplicate clients array for seamless infinite scroll
  const duplicatedClients = [...clients, ...clients];

  return (
    <section className="py-24 bg-white overflow-hidden">
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
            <Building2 className="w-4 h-4" />
            Trusted By Industry Leaders
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Join{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              847 Enterprise Clients
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From Fortune 500 companies to innovative startups, leading organizations trust Afilo for mission-critical operations
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
        >
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              847
            </div>
            <div className="text-sm text-gray-600">Enterprise Clients</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              67
            </div>
            <div className="text-sm text-gray-600">Fortune 500 Companies</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              42
            </div>
            <div className="text-sm text-gray-600">Countries</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
              98%
            </div>
            <div className="text-sm text-gray-600">Customer Retention</div>
          </div>
        </motion.div>

        {/* Infinite Scroll Logo Wall */}
        <div className="relative">
          {/* Gradient Overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />

          {/* Scrolling Container */}
          <div className="overflow-hidden">
            <motion.div
              className="flex gap-8"
              animate={{
                x: [0, -1920], // Adjust based on total width
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 40,
                  ease: "linear",
                },
              }}
            >
              {duplicatedClients.map((client, index) => (
                <div
                  key={`${client.id}-${index}`}
                  className="flex-shrink-0 w-48 h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 flex flex-col items-center justify-center hover:shadow-lg hover:scale-105 transition-all group"
                >
                  <div className="text-5xl mb-2 group-hover:scale-110 transition-transform">
                    {client.logo}
                  </div>
                  <div className="text-sm font-bold text-gray-900 text-center px-2">
                    {client.name}
                  </div>
                  <div className="text-xs text-gray-500">{client.industry}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Industry Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Industries We Serve</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Technology', icon: '💻', count: 287 },
              { name: 'Finance', icon: '💰', count: 156 },
              { name: 'Healthcare', icon: '🏥', count: 134 },
              { name: 'Retail', icon: '🛍️', count: 98 },
              { name: 'Education', icon: '🎓', count: 87 },
              { name: 'Manufacturing', icon: '🏭', count: 85 },
            ].map((industry, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 text-center border border-blue-200 hover:shadow-lg transition-all"
              >
                <div className="text-4xl mb-2">{industry.icon}</div>
                <div className="text-sm font-bold text-gray-900">{industry.name}</div>
                <div className="text-xs text-gray-600 mt-1">{industry.count} clients</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Customer Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-br from-gray-900 to-blue-900 rounded-2xl p-8 md:p-12 text-white text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            <span className="text-sm font-semibold text-blue-300">Average Customer Result</span>
          </div>
          <blockquote className="text-2xl md:text-3xl font-bold mb-6">
            "Afilo delivered <span className="text-green-400">450% ROI</span> in our first year, saving us{' '}
            <span className="text-green-400">$2.1M</span> through operational efficiency and process automation."
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-2xl">
              👤
            </div>
            <div className="text-left">
              <div className="font-bold">Sarah Chen</div>
              <div className="text-sm text-blue-300">VP of Operations, Fortune 500 Financial Services</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
