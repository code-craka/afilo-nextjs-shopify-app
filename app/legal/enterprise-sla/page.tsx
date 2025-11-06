'use client';

import { motion } from 'framer-motion';

export default function EnterpriseSLA() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Enterprise Service Level Agreement</h1>
            <p className="text-xl text-gray-600">Effective: {new Date().toLocaleDateString()}</p>
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              99.9% Uptime Guarantee
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-8"
        >
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Service Availability</h2>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">99.9%</div>
                <div className="text-sm text-gray-600">Uptime Guarantee</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">&lt;100ms</div>
                <div className="text-sm text-gray-600">API Response Time</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">24/7</div>
                <div className="text-sm text-gray-600">Monitoring</div>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed">
              We guarantee 99.9% uptime for all Enterprise and Enterprise Plus customers, measured monthly. This translates to less than 44 minutes of downtime per month.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Support Response Times</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolution Target</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Critical
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">1 hour</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">4 hours</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        High
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">4 hours</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">24 hours</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Medium
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">24 hours</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">3 business days</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Low
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">3 business days</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">5 business days</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Performance Guarantees</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">API Performance</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• 95% of API calls &lt; 100ms response time</li>
                  <li>• 99% of API calls &lt; 500ms response time</li>
                  <li>• Rate limits: 10,000 requests/hour (Enterprise)</li>
                  <li>• Unlimited requests (Enterprise Plus)</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Processing</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Real-time analytics with &lt;1 second latency</li>
                  <li>• Batch processing within 15 minutes</li>
                  <li>• Data backup every 6 hours</li>
                  <li>• 99.99% data durability guarantee</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Implementation Services</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Enterprise customers receive comprehensive implementation support:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Professional Services</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Dedicated implementation team</li>
                  <li>Custom integration development</li>
                  <li>Data migration assistance</li>
                  <li>Training and onboarding</li>
                  <li>Go-live support and monitoring</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Investment Ranges</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Standard Implementation: $50K - $150K</li>
                  <li>Complex Integration: $150K - $350K</li>
                  <li>Enterprise Transformation: $350K - $500K</li>
                  <li>Custom Development: Quote-based</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Security & Compliance</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="text-2xl mb-2">🛡️</div>
                <h3 className="font-semibold text-gray-900 mb-2">SOC 2 Type II</h3>
                <p className="text-sm text-gray-600">Annual compliance audits</p>
              </div>
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="text-2xl mb-2">🔒</div>
                <h3 className="font-semibold text-gray-900 mb-2">ISO 27001</h3>
                <p className="text-sm text-gray-600">Information security management</p>
              </div>
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="text-2xl mb-2">🌍</div>
                <h3 className="font-semibold text-gray-900 mb-2">GDPR Compliant</h3>
                <p className="text-sm text-gray-600">European data protection</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Service Credits</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              If we fail to meet our SLA commitments, you may be eligible for service credits:
            </p>
            <div className="bg-blue-50 p-6 rounded-lg">
              <table className="w-full">
                <thead>
                  <tr className="text-left">
                    <th className="pb-2 text-gray-700">Uptime Achievement</th>
                    <th className="pb-2 text-gray-700">Service Credit</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  <tr>
                    <td className="py-1">99.0% - 99.9%</td>
                    <td className="py-1">10% of monthly fees</td>
                  </tr>
                  <tr>
                    <td className="py-1">95.0% - 99.0%</td>
                    <td className="py-1">25% of monthly fees</td>
                  </tr>
                  <tr>
                    <td className="py-1">&lt; 95.0%</td>
                    <td className="py-1">50% of monthly fees</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Contact Information</h2>
            <p className="text-gray-600 leading-relaxed">
              For SLA-related inquiries or to report service issues:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700"><strong>Enterprise Support:</strong> enterprise@afilo.io</p>
              <p className="text-gray-700"><strong>Emergency Hotline:</strong> +1 302 415 3171</p>
              <p className="text-gray-700"><strong>Account Manager:</strong> Available through customer portal</p>
              <p className="text-gray-700"><strong>Status Page:</strong> status.afilo.io</p>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}