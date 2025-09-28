'use client';

import { motion } from 'framer-motion';

export default function TermsOfService() {
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
            <p className="text-xl text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
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
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing and using Afilo Enterprise Digital Marketplace (&ldquo;the Service&rdquo;), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Service Description</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Afilo provides enterprise-grade digital software solutions including:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>AI-powered business intelligence platforms</li>
              <li>Advanced analytics and automation tools</li>
              <li>Enterprise software licensing and subscriptions</li>
              <li>Custom implementation and professional services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Enterprise Licensing</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Our enterprise software is provided under the following license types:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li><strong>Professional:</strong> Up to 25 users, $499-$2,499/month</li>
              <li><strong>Enterprise:</strong> Up to 500 users, $1,999-$9,999/month</li>
              <li><strong>Enterprise Plus:</strong> Unlimited users, $9,999+/month</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Subscription Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              All enterprise subscriptions are billed in advance on a monthly or annual basis. You may cancel your subscription at any time, but no refunds will be provided for partial billing periods. Annual subscriptions receive a 17% discount.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Enterprise SLA</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              For Enterprise and Enterprise Plus customers, we guarantee:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>99.9% uptime availability</li>
              <li>24/7 priority support with dedicated account manager</li>
              <li>Response time: 1 hour for critical issues</li>
              <li>Custom implementation support up to $500K value</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Intellectual Property</h2>
            <p className="text-gray-600 leading-relaxed">
              All software, documentation, and materials provided through our service remain the intellectual property of Afilo Technologies. Customers receive a non-exclusive, non-transferable license to use the software according to their subscription tier.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Security and Privacy</h2>
            <p className="text-gray-600 leading-relaxed">
              We implement enterprise-grade security measures including SOC 2 compliance, ISO 27001 certification, and GDPR compliance. Customer data is encrypted in transit and at rest, with regular security audits and penetration testing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              In no event shall Afilo Technologies be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with the use of our service, even if we have been advised of the possibility of such damages.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact Information</h2>
            <p className="text-gray-600 leading-relaxed">
              For questions about these Terms of Service, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700"><strong>Email:</strong> legal@afilo.io</p>
              <p className="text-gray-700"><strong>Enterprise Support:</strong> enterprise@afilo.io</p>
              <p className="text-gray-700"><strong>Phone:</strong> +1-800-AFILO-PRO</p>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}