'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Check, X, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface Feature {
  name: string;
  professional: boolean | string;
  business: boolean | string;
  enterprise: boolean | string;
  enterprisePlus: boolean | string;
}

const features: Feature[] = [
  // Core Features
  { name: 'User Seats', professional: 'Up to 25', business: 'Up to 100', enterprise: 'Up to 500', enterprisePlus: 'Unlimited' },
  { name: 'API Calls/Month', professional: '100K', business: '500K', enterprise: '2M', enterprisePlus: 'Unlimited' },
  { name: 'Storage', professional: '100 GB', business: '500 GB', enterprise: '2 TB', enterprisePlus: '10 TB+' },
  { name: 'Projects', professional: '10', business: '50', enterprise: '250', enterprisePlus: 'Unlimited' },

  // Security & Compliance
  { name: 'SOC 2 Type II Certified', professional: true, business: true, enterprise: true, enterprisePlus: true },
  { name: 'ISO 27001:2022', professional: true, business: true, enterprise: true, enterprisePlus: true },
  { name: 'HIPAA BAA Available', professional: false, business: true, enterprise: true, enterprisePlus: true },
  { name: 'SSO (SAML/OIDC)', professional: false, business: false, enterprise: true, enterprisePlus: true },
  { name: 'Custom Security Policies', professional: false, business: false, enterprise: false, enterprisePlus: true },

  // Support
  { name: 'Support Response Time', professional: '24 hours', business: '8 hours', enterprise: '4 hours', enterprisePlus: '1 hour' },
  { name: '24/7 Support', professional: false, business: false, enterprise: true, enterprisePlus: true },
  { name: 'Dedicated Account Manager', professional: false, business: false, enterprise: false, enterprisePlus: true },
  { name: 'Onboarding & Training', professional: 'Self-service', business: '2 hours', enterprise: '8 hours', enterprisePlus: 'Custom' },

  // Performance
  { name: 'Uptime SLA', professional: '99.9%', business: '99.9%', enterprise: '99.99%', enterprisePlus: '99.99%' },
  { name: 'SLA Credits', professional: false, business: false, enterprise: true, enterprisePlus: true },
  { name: 'Priority Infrastructure', professional: false, business: false, enterprise: false, enterprisePlus: true },

  // Integrations
  { name: 'Pre-built Integrations', professional: '10', business: '25', enterprise: 'All (25+)', enterprisePlus: 'All + Custom' },
  { name: 'Custom API Development', professional: false, business: false, enterprise: false, enterprisePlus: true },
  { name: 'Webhook Events', professional: 'Basic', business: 'Advanced', enterprise: 'All', enterprisePlus: 'All + Custom' },

  // Advanced Features
  { name: 'Multi-Region Deployment', professional: false, business: false, enterprise: true, enterprisePlus: true },
  { name: 'White-Label Options', professional: false, business: false, enterprise: false, enterprisePlus: true },
  { name: 'Custom Development', professional: false, business: false, enterprise: false, enterprisePlus: true },
  { name: 'Quarterly Business Reviews', professional: false, business: false, enterprise: false, enterprisePlus: true },
];

export default function PricingComparisonTable() {
  const renderCell = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-green-500 mx-auto" />
      ) : (
        <X className="w-5 h-5 text-gray-300 mx-auto" />
      );
    }
    return <span className="text-sm font-semibold text-gray-900">{value}</span>;
  };

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
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
            <Sparkles className="w-4 h-4" />
            Compare Plans
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Choose the{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Perfect Plan
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transparent pricing with enterprise features. All plans include 30-day money-back guarantee and 17% savings with annual billing.
          </p>
        </motion.div>

        {/* Pricing Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
        >
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              {/* Header */}
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-blue-50">
                  <th className="py-6 px-6 text-left">
                    <div className="text-lg font-bold text-gray-900">Features</div>
                    <div className="text-sm text-gray-600 mt-1">Compare all plan features</div>
                  </th>
                  <th className="py-6 px-6 text-center border-l border-gray-200">
                    <div className="text-lg font-bold text-gray-900">Professional</div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-2">
                      $499-$2,499<span className="text-lg">/mo</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Up to 25 users</div>
                  </th>
                  <th className="py-6 px-6 text-center border-l border-gray-200">
                    <div className="text-lg font-bold text-gray-900">Business</div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-2">
                      $999-$4,999<span className="text-lg">/mo</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Up to 100 users</div>
                  </th>
                  <th className="py-6 px-6 text-center border-l border-gray-200 bg-gradient-to-br from-blue-50 to-purple-50">
                    <div className="flex items-center justify-center gap-2">
                      <div className="text-lg font-bold text-gray-900">Enterprise</div>
                      <div className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">POPULAR</div>
                    </div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-2">
                      $1,999-$9,999<span className="text-lg">/mo</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Up to 500 users</div>
                  </th>
                  <th className="py-6 px-6 text-center border-l border-gray-200 bg-gradient-to-br from-purple-50 to-pink-50">
                    <div className="flex items-center justify-center gap-2">
                      <div className="text-lg font-bold text-gray-900">Enterprise Plus</div>
                      <div className="px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full">PREMIUM</div>
                    </div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mt-2">
                      $9,999+<span className="text-lg">/mo</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Unlimited users</div>
                  </th>
                </tr>
              </thead>

              {/* Body */}
              <tbody>
                {features.map((feature, index) => (
                  <tr
                    key={index}
                    className={`border-t border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="py-4 px-6 text-sm text-gray-900 font-medium">{feature.name}</td>
                    <td className="py-4 px-6 text-center border-l border-gray-200">{renderCell(feature.professional)}</td>
                    <td className="py-4 px-6 text-center border-l border-gray-200">{renderCell(feature.business)}</td>
                    <td className="py-4 px-6 text-center border-l border-gray-200 bg-blue-50/50">{renderCell(feature.enterprise)}</td>
                    <td className="py-4 px-6 text-center border-l border-gray-200 bg-purple-50/50">{renderCell(feature.enterprisePlus)}</td>
                  </tr>
                ))}
              </tbody>

              {/* Footer CTA */}
              <tfoot>
                <tr className="bg-gradient-to-r from-gray-50 to-blue-50">
                  <td className="py-6 px-6"></td>
                  <td className="py-6 px-6 text-center border-l border-gray-200">
                    <Link
                      href="/pricing"
                      className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all group"
                    >
                      <span>Get Started</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </td>
                  <td className="py-6 px-6 text-center border-l border-gray-200">
                    <Link
                      href="/pricing"
                      className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all group"
                    >
                      <span>Get Started</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </td>
                  <td className="py-6 px-6 text-center border-l border-gray-200 bg-blue-50/50">
                    <Link
                      href="/pricing"
                      className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:shadow-xl transition-all group shadow-lg"
                    >
                      <span>Get Started</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </td>
                  <td className="py-6 px-6 text-center border-l border-gray-200 bg-purple-50/50">
                    <Link
                      href="/enterprise#quote"
                      className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-bold hover:shadow-xl transition-all group shadow-lg"
                    >
                      <span>Contact Sales</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Mobile Accordion */}
          <div className="lg:hidden p-6 space-y-6">
            {['Professional', 'Business', 'Enterprise', 'Enterprise Plus'].map((plan, planIndex) => (
              <div key={plan} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                  <h3 className="text-2xl font-bold mb-2">{plan}</h3>
                  <div className="text-3xl font-bold">
                    {planIndex === 0 && '$499-$2,499'}
                    {planIndex === 1 && '$999-$4,999'}
                    {planIndex === 2 && '$1,999-$9,999'}
                    {planIndex === 3 && '$9,999+'}
                    <span className="text-lg">/mo</span>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  {features.map((feature, index) => {
                    const value =
                      planIndex === 0 ? feature.professional :
                      planIndex === 1 ? feature.business :
                      planIndex === 2 ? feature.enterprise :
                      feature.enterprisePlus;

                    return (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <span className="text-sm text-gray-700">{feature.name}</span>
                        <div>{renderCell(value)}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="p-6 pt-0">
                  <Link
                    href={planIndex === 3 ? '/enterprise#quote' : '/pricing'}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all group"
                  >
                    <span>{planIndex === 3 ? 'Contact Sales' : 'Get Started'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 text-center space-y-4"
        >
          <p className="text-gray-600">
            <strong>17% savings</strong> with annual billing • <strong>30-day money-back guarantee</strong> for new customers • <strong>No setup fees</strong>
          </p>
          <p className="text-sm text-gray-500">
            All prices in USD. Volume discounts available for 25+ users. Educational discounts: 50% students, 30% teachers, 40% institutions.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
