import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Refund & Return Policy | Afilo Enterprise',
  description: '30-Day Money-Back Guarantee - Clear refund terms for enterprise subscriptions',
};

export default function RefundPolicyPage() {
  return (
    <div className="space-y-8">
      {/* Introduction */}
      <section>
        <p className="text-gray-700 leading-relaxed mb-4">
          Effective Date: January 30, 2025
        </p>
        <p className="text-gray-700 leading-relaxed">
          This Refund and Return Policy outlines the terms under which TechSci, Inc. (operating the Afilo platform)
          provides refunds for our digital software-as-a-service (SaaS) subscriptions.
        </p>
      </section>

      {/* Digital Goods Statement */}
      <section className="bg-blue-50 border-l-4 border-blue-600 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Digital Software Services</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>Afilo provides digital software-as-a-service (SaaS) subscriptions. No physical goods are sold or shipped.</strong></p>
          <p>
            Due to the nature of digital services, <strong>all sales are final once access is granted</strong>, subject
            to the exceptions outlined in this policy.
          </p>
        </div>
      </section>

      {/* 30-Day Money-Back Guarantee */}
      <section className="bg-green-50 border-2 border-green-600 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-3xl">✅</span>
          2. 30-Day Satisfaction Guarantee
        </h2>
        <div className="space-y-4 text-gray-700">
          <p className="text-lg font-semibold">
            If you are not satisfied with Afilo within the first 30 days of your initial paid subscription,
            you may request a full refund.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Eligibility Requirements:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>First-time customers only</strong> (one refund per organization)</li>
            <li><strong>Must be within 30 days</strong> of initial payment date</li>
            <li><strong>Account must not have violated</strong> our{' '}
              <Link href="/legal/terms-of-service" className="text-blue-600 hover:underline">Terms of Service</Link> or{' '}
              <Link href="/legal/acceptable-use" className="text-blue-600 hover:underline">Acceptable Use Policy</Link>
            </li>
            <li><strong>Good faith usage</strong> (no abuse or fraudulent intent)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Refund Process:</h3>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Contact <a href="mailto:support@techsci.io" className="text-blue-600 hover:underline">support@techsci.io</a> with:
              <ul className="list-disc pl-6 mt-1 space-y-1">
                <li>Your account email address</li>
                <li>Reason for requesting refund</li>
                <li>Invoice or transaction ID</li>
              </ul>
            </li>
            <li>Our team will review your request within <strong>2 business days</strong></li>
            <li>If approved, refund processed within <strong>7-10 business days</strong> to original payment method</li>
            <li>Account access will be terminated upon refund issuance</li>
          </ol>
        </div>
      </section>

      {/* Free Trial Policy */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Enterprise Evaluation Programs</h2>
        <div className="space-y-4 text-gray-700">
          <p>
            <strong>No Free Trials:</strong> Afilo does not offer free trials. All plans require immediate payment
            to ensure enterprise-grade commitment and access to premium features.
          </p>

          <h3 className="text-xl font-semibold text-gray-900">Evaluation Options:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>30-Day Money-Back Guarantee:</strong> Full refund if not satisfied within first 30 days</li>
            <li><strong>Live Demo Sessions:</strong> Free personalized demos with our solutions team (no commitment)</li>
            <li><strong>Enterprise Pilots:</strong> Custom evaluation programs for Enterprise Plus customers (contact sales)</li>
            <li><strong>Sandbox Access:</strong> Test environment available for API integration testing (paid plans only)</li>
          </ul>

          <div className="bg-blue-50 rounded-lg p-4 mt-4 border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>Why No Free Trials?</strong> Enterprise software requires serious commitment. Our pay-first model
              ensures you get dedicated onboarding, priority support, and immediate access to all features. Protected by
              our 30-day money-back guarantee, you can evaluate risk-free with full enterprise resources.
            </p>
          </div>
        </div>
      </section>

      {/* Subscription Cancellation */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Subscription Cancellation</h2>
        <div className="space-y-4 text-gray-700">
          <h3 className="text-xl font-semibold text-gray-900">How to Cancel:</h3>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Log in to your dashboard at <a href="https://app.afilo.io" className="text-blue-600 hover:underline">app.afilo.io</a></li>
            <li>Navigate to <strong>Billing → Manage Subscription</strong></li>
            <li>Click <strong>"Cancel Subscription"</strong> and confirm</li>
            <li>You will receive email confirmation of cancellation</li>
          </ol>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Cancellation Terms:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Effective Date:</strong> Cancellation takes effect at the <strong>end of your current billing period</strong></li>
            <li><strong>Access Retention:</strong> You retain full access until the period ends</li>
            <li><strong>No Pro-Rata Refunds:</strong> No refunds for unused time in current billing cycle (except 30-day guarantee)</li>
            <li><strong>Data Export:</strong> Export your data before cancellation (available for 90 days post-cancellation)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Annual Subscriptions:</h3>
          <p>
            Annual subscriptions can be cancelled, but <strong>no refund is provided for unused months</strong> (except
            within the first 30 days under our satisfaction guarantee). You retain access until the end of the annual term.
          </p>
        </div>
      </section>

      {/* Non-Refundable Scenarios */}
      <section className="bg-red-50 border-l-4 border-red-600 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Non-Refundable Scenarios</h2>
        <div className="space-y-3 text-gray-700">
          <p>The following are <strong>NOT eligible for refunds:</strong></p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Subscription renewals</strong> after the initial 30-day satisfaction guarantee period</li>
            <li><strong>Mid-cycle cancellations</strong> (no pro-rata refunds for partial months)</li>
            <li><strong>Add-on services</strong> or custom implementations (unless otherwise specified in contract)</li>
            <li><strong>Enterprise contracts</strong> with signed multi-year agreements (unless contract specifies otherwise)</li>
            <li><strong>Accounts terminated</strong> for violations of Terms of Service or Acceptable Use Policy</li>
            <li><strong>Chargeback disputes</strong> (results in permanent account suspension)</li>
            <li><strong>Downgrade requests</strong> (price difference not refunded mid-cycle)</li>
            <li><strong>Free trial abuse</strong> (multiple trials using different identities)</li>
          </ul>
        </div>
      </section>

      {/* Downgrade Policy */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Plan Downgrade Policy</h2>
        <div className="space-y-4 text-gray-700">
          <p>
            You may <strong>downgrade your subscription plan</strong> at any time from your account settings.
          </p>

          <h3 className="text-xl font-semibold text-gray-900">Downgrade Terms:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Effective Date:</strong> Downgrade takes effect at the <strong>start of next billing cycle</strong></li>
            <li><strong>No Refund:</strong> No refund issued for price difference during current billing period</li>
            <li><strong>Data Limits:</strong> New plan limits apply immediately; excess data may be subject to:
              <ul className="list-disc pl-6 mt-1 space-y-1">
                <li>30-day grace period to reduce usage below new limits</li>
                <li>Automatic deletion of excess data after grace period (with 7-day warning)</li>
                <li>Option to upgrade back to retain all data</li>
              </ul>
            </li>
            <li><strong>Feature Access:</strong> Premium features unavailable after downgrade takes effect</li>
          </ul>
        </div>
      </section>

      {/* Service Outages & SLA Credits */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Service Outages and SLA Credits</h2>
        <div className="space-y-4 text-gray-700">
          <p>
            <strong>99.99% Uptime SLA:</strong> If we fail to meet our 99.99% monthly uptime SLA, you may be eligible
            for <strong>service credits</strong> (not cash refunds).
          </p>

          <h3 className="text-xl font-semibold text-gray-900">SLA Credit Calculation:</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-2">Monthly Uptime</th>
                  <th className="text-left py-2">Service Credit</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-2">99.9% - 99.99%</td>
                  <td className="py-2 font-semibold">10% of monthly fee</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-2">99.0% - 99.9%</td>
                  <td className="py-2 font-semibold">25% of monthly fee</td>
                </tr>
                <tr>
                  <td className="py-2">&lt;99.0%</td>
                  <td className="py-2 font-semibold">50% of monthly fee</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Claim Process:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Submit claim to <a href="mailto:support@techsci.io" className="text-blue-600 hover:underline">support@techsci.io</a> within <strong>30 days of outage</strong></li>
            <li>Include dates/times of service disruption and impact description</li>
            <li>We will investigate and respond within 10 business days</li>
            <li><strong>Maximum credit:</strong> Total SLA credits in one billing period cannot exceed one month's subscription fee</li>
            <li><strong>Credits applied</strong> to future billing; <strong>not refundable as cash</strong></li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Exclusions from SLA:</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Scheduled maintenance (announced 7+ days in advance)</li>
            <li>Force majeure events (natural disasters, pandemics, war)</li>
            <li>Issues caused by customer's actions or third-party services</li>
            <li>Beta/experimental features explicitly labeled as such</li>
          </ul>
        </div>
      </section>

      {/* Payment Processing */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Payment Processing and Refund Timing</h2>
        <div className="space-y-4 text-gray-700">
          <p>
            <strong>Payment Processor:</strong> All payments processed by{' '}
            <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Stripe, Inc.</a>
          </p>

          <h3 className="text-xl font-semibold text-gray-900">Refund Timing:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Processing Time:</strong> Refunds processed within 7-10 business days of approval</li>
            <li><strong>Credit Card:</strong> Typically appears in 5-10 business days (depends on issuing bank)</li>
            <li><strong>ACH/Bank Transfer:</strong> May take 7-14 business days</li>
            <li><strong>Original Payment Method:</strong> Refunds issued to original payment method only</li>
          </ul>

          <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 mt-4">
            <p className="font-semibold">Important Note:</p>
            <p className="text-sm mt-1">
              We cannot expedite refund processing beyond our control (bank processing times vary). If you don't receive
              your refund within the stated timeframe, contact your bank or credit card issuer.
            </p>
          </div>
        </div>
      </section>

      {/* Dispute Resolution */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Billing Disputes and Chargebacks</h2>
        <div className="space-y-4 text-gray-700">
          <p className="font-semibold text-lg">
            ⚠️ Before filing a chargeback, please contact us at{' '}
            <a href="mailto:billing@techsci.io" className="text-blue-600 hover:underline">billing@techsci.io</a> to resolve the issue.
          </p>

          <div className="bg-red-50 border-l-4 border-red-600 p-4">
            <p><strong>Chargeback Consequences:</strong></p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Immediate account suspension (all access terminated)</li>
              <li>$25 chargeback processing fee charged to your account</li>
              <li>Permanent ban from Afilo services</li>
              <li>Report to fraud prevention databases</li>
            </ul>
          </div>

          <p className="mt-4">
            For legitimate billing disputes, we will work with you to resolve them quickly and fairly. See our{' '}
            <Link href="/legal/dispute-resolution" className="text-blue-600 hover:underline">Dispute Resolution Policy</Link> for more information.
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact for Refunds and Billing</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>Refund Requests:</strong><br />
            Email: <a href="mailto:support@techsci.io" className="text-blue-600 hover:underline">support@techsci.io</a> or{' '}
            <a href="mailto:billing@techsci.io" className="text-blue-600 hover:underline">billing@techsci.io</a><br />
            Phone: +1 302 415 3171 (Mon-Fri, 9am-5pm ET)
          </p>

          <p><strong>Expected Response Time:</strong> Within 1-2 business days</p>

          <p className="text-sm">
            For questions about this Refund Policy, contact{' '}
            <a href="mailto:legal@techsci.io" className="text-blue-600 hover:underline">legal@techsci.io</a>
          </p>
        </div>
      </section>

      {/* Policy Updates */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to This Policy</h2>
        <p className="text-gray-700">
          We may update this Refund Policy from time to time. Material changes will be communicated via email to your account
          address. Continued use of our services after changes constitutes acceptance of the updated policy.
        </p>
      </section>
    </div>
  );
}
