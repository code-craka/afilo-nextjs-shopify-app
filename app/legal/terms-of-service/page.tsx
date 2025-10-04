import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service | Afilo Enterprise',
  description: 'Enterprise Software as a Service Agreement - Comprehensive Terms & Conditions',
};

export default function TermsOfServicePage() {
  return (
    <div className="space-y-8">
      {/* Introduction */}
      <section>
        <p className="text-gray-700 leading-relaxed mb-4">
          Effective Date: January 30, 2025
        </p>
        <p className="text-gray-700 leading-relaxed mb-4">
          These Terms of Service ("Terms", "Agreement") govern your use of the Afilo enterprise software platform
          ("Service", "Platform") operated by TechSci, Inc. ("we", "us", "our", "Company").
        </p>
        <p className="text-gray-700 leading-relaxed">
          <strong>IMPORTANT:</strong> By accessing or using our Service, you ("Customer", "you", "your") agree to be bound
          by these Terms. If you do not agree to these Terms, do not use our Service.
        </p>
      </section>

      {/* Geographic Restrictions - PROMINENT */}
      <section className="bg-red-50 border-2 border-red-600 rounded-lg p-6 my-8">
        <h2 className="text-2xl font-bold text-red-900 mb-4 flex items-center gap-2">
          <span className="text-3xl">🚫</span>
          1. Geographic Restrictions and Service Availability
        </h2>
        <div className="space-y-4 text-gray-900">
          <p className="font-bold text-lg">
            CRITICAL: TechSci, Inc. (operating the Afilo platform) does NOT provide services to individuals or entities
            located in the European Union (EU) or European Economic Area (EEA).
          </p>

          <div className="bg-white rounded p-4">
            <p className="font-semibold mb-2">Excluded Jurisdictions (27 EU Member States):</p>
            <ul className="grid grid-cols-2 gap-2 text-sm">
              <li>• Austria</li>
              <li>• Belgium</li>
              <li>• Bulgaria</li>
              <li>• Croatia</li>
              <li>• Cyprus</li>
              <li>• Czech Republic</li>
              <li>• Denmark</li>
              <li>• Estonia</li>
              <li>• Finland</li>
              <li>• France</li>
              <li>• Germany</li>
              <li>• Greece</li>
              <li>• Hungary</li>
              <li>• Ireland</li>
              <li>• Italy</li>
              <li>• Latvia</li>
              <li>• Lithuania</li>
              <li>• Luxembourg</li>
              <li>• Malta</li>
              <li>• Netherlands</li>
              <li>• Poland</li>
              <li>• Portugal</li>
              <li>• Romania</li>
              <li>• Slovakia</li>
              <li>• Slovenia</li>
              <li>• Spain</li>
              <li>• Sweden</li>
            </ul>
          </div>

          <p className="font-semibold">Your Representation and Warranty:</p>
          <p>
            By using our Service, you represent and warrant that:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>You are not located in the EU/EEA</li>
            <li>You are not subject to EU data protection laws (GDPR)</li>
            <li>You will not use our Service to process data of EU/EEA residents</li>
            <li>You will not access our Service from within the EU/EEA</li>
          </ul>

          <p className="font-bold text-red-900">
            We reserve the right to immediately terminate service to any user determined to be located in or subject to
            EU/EEA jurisdiction, without refund or liability.
          </p>

          <div className="bg-green-50 rounded p-4 mt-4 border border-green-600">
            <p className="font-semibold mb-2">Approved Service Regions:</p>
            <ul className="text-sm space-y-1">
              <li>• United States (primary market)</li>
              <li>• Canada</li>
              <li>• United Kingdom (post-Brexit)</li>
              <li>• Australia</li>
              <li>• New Zealand</li>
              <li>• Singapore</li>
              <li>• Japan</li>
              <li>• Other non-EU countries where legally permitted</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Account Registration */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Account Registration and Eligibility</h2>

        <div className="space-y-4 text-gray-700">
          <h3 className="text-xl font-semibold text-gray-900">Eligibility Requirements:</h3>
          <p>To create an account and use our Service, you must:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Age:</strong> Be at least 18 years old or the age of majority in your jurisdiction</li>
            <li><strong>Authority:</strong> Have the legal authority to enter into binding contracts</li>
            <li><strong>Business Entity:</strong> Represent a legitimate business or organization (for Enterprise plans)</li>
            <li><strong>Accurate Information:</strong> Provide true, accurate, current, and complete information</li>
            <li><strong>Geographic Compliance:</strong> Be located in an approved service region (NOT EU/EEA)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Account Responsibilities:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Security:</strong> Maintain confidentiality of account credentials (username, password, API keys)</li>
            <li><strong>Unauthorized Access:</strong> Notify us immediately at security@techsci.io of any unauthorized use</li>
            <li><strong>Account Sharing:</strong> Do not share accounts across multiple organizations or entities</li>
            <li><strong>Accuracy:</strong> Keep account information up-to-date (email, billing address, contact information)</li>
            <li><strong>One Account Per Organization:</strong> Maintain only one active subscription per organization (no duplicate accounts to circumvent limits)</li>
          </ul>

          <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4">
            <p className="font-semibold">Account Suspension/Termination:</p>
            <p className="text-sm mt-1">
              We reserve the right to suspend or terminate accounts that violate these Terms, provide false information,
              engage in fraudulent activity, or pose security risks. See Section 14 for termination procedures.
            </p>
          </div>
        </div>
      </section>

      {/* Subscription Plans and Pricing */}
      <section className="bg-blue-50 border-l-4 border-blue-600 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Subscription Plans, Pricing, and Billing</h2>

        <div className="space-y-4 text-gray-700">
          <h3 className="text-xl font-semibold text-gray-900">Available Plans:</h3>
          <div className="bg-white rounded-lg p-4">
            <ul className="space-y-2">
              <li><strong>Professional:</strong> $499 - $2,499/month (up to 25 users)</li>
              <li><strong>Business:</strong> $999 - $4,999/month (up to 100 users)</li>
              <li><strong>Enterprise:</strong> $1,999 - $9,999/month (up to 500 users)</li>
              <li><strong>Enterprise Plus:</strong> $9,999+/month (unlimited users, custom pricing)</li>
            </ul>
            <p className="text-sm mt-3 text-gray-600">
              Exact pricing based on number of users, features selected, and annual vs. monthly billing.
              See <Link href="/enterprise" className="text-blue-600 hover:underline">Enterprise Pricing</Link> for details.
            </p>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Billing Terms:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Billing Cycle:</strong> Monthly or Annual (annual billing offers 17% discount)</li>
            <li><strong>Payment Method:</strong> Credit card, ACH direct debit, or wire transfer (Enterprise Plus only)</li>
            <li><strong>Auto-Renewal:</strong> Subscriptions automatically renew unless cancelled before renewal date</li>
            <li><strong>Price Changes:</strong> We may change pricing with 30 days' notice (existing subscriptions honored until renewal)</li>
            <li><strong>Taxes:</strong> Prices exclude applicable sales tax, VAT, or other taxes (Customer responsible)</li>
            <li><strong>Currency:</strong> All prices in US Dollars (USD)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Payment Processing:</h3>
          <p>
            Payments processed by <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Stripe, Inc.</a> (PCI DSS Level 1 certified).
            By providing payment information, you authorize us to charge your payment method for all fees.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Late Payment:</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Accounts unpaid for 15 days will be suspended (read-only access)</li>
            <li>Accounts unpaid for 30 days will be terminated (data deleted after 90 days)</li>
            <li>Late fee: 1.5% per month on overdue balances (or maximum allowed by law)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Refund Policy:</h3>
          <p>
            See our <Link href="/legal/refund-policy" className="text-blue-600 hover:underline">Refund & Return Policy</Link> for complete refund terms,
            including our 30-day satisfaction guarantee for new customers.
          </p>
        </div>
      </section>

      {/* Service Description */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Service Description and Availability</h2>

        <div className="space-y-4 text-gray-700">
          <h3 className="text-xl font-semibold text-gray-900">What We Provide:</h3>
          <p>
            Afilo is an enterprise-grade software platform providing:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Cloud-based SaaS application accessible via web browser and API</li>
            <li>User management, authentication, and access control</li>
            <li>Data storage, processing, and analytics</li>
            <li>Integration capabilities with third-party services (Shopify, Stripe, etc.)</li>
            <li>Customer support via email, chat, and phone (plan-dependent)</li>
            <li>Security features including encryption, backups, and monitoring</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Service Level Agreement (SLA):</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p><strong>Uptime Guarantee:</strong> 99.99% monthly uptime for Enterprise and Enterprise Plus plans</p>
            <p className="mt-2"><strong>Support Response Times:</strong></p>
            <ul className="list-disc pl-6 space-y-1 text-sm mt-1">
              <li>Professional: 24-hour response time (business days)</li>
              <li>Business: 8-hour response time (business days)</li>
              <li>Enterprise: 4-hour response time (24/7)</li>
              <li>Enterprise Plus: 1-hour response time (24/7 dedicated support)</li>
            </ul>
            <p className="mt-2 text-sm">
              For SLA credits and outage compensation, see our{' '}
              <Link href="/legal/refund-policy#sla-credits" className="text-blue-600 hover:underline">Refund Policy Section 7</Link>.
            </p>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Service Limitations:</h3>
          <p>We reserve the right to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Impose usage limits (API calls, storage, bandwidth) based on your plan</li>
            <li>Perform scheduled maintenance (announced 7+ days in advance when possible)</li>
            <li>Modify, suspend, or discontinue features with reasonable notice</li>
            <li>Refuse service to users violating these Terms or applicable laws</li>
          </ul>

          <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 mt-4">
            <p className="font-semibold">Beta Features:</p>
            <p className="text-sm mt-1">
              Features labeled "Beta", "Alpha", or "Experimental" are provided AS-IS without warranties or SLA guarantees.
              We may discontinue Beta features at any time without notice.
            </p>
          </div>
        </div>
      </section>

      {/* Acceptable Use */}
      <section className="bg-red-50 border-l-4 border-red-600 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Acceptable Use and Prohibited Activities</h2>

        <div className="space-y-4 text-gray-700">
          <p className="font-semibold">
            You agree NOT to use our Service for any illegal, harmful, or abusive purposes. See our complete{' '}
            <Link href="/legal/acceptable-use" className="text-blue-600 hover:underline">Acceptable Use Policy</Link> for detailed restrictions.
          </p>

          <h3 className="text-xl font-semibold text-gray-900">Prohibited Activities Include:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Illegal Activity:</strong> Fraud, money laundering, terrorist financing, drug trafficking, CSAM, weapons sales</li>
            <li><strong>Abuse:</strong> Harassment, hate speech, threats, doxxing, spam, phishing</li>
            <li><strong>System Abuse:</strong> Hacking, DDoS attacks, malware distribution, unauthorized access, excessive API usage</li>
            <li><strong>Intellectual Property Violations:</strong> Piracy, trademark infringement, unauthorized distribution of copyrighted material</li>
            <li><strong>Data Violations:</strong> Scraping, unauthorized data collection, HIPAA violations without BAA, EU/EEA data processing</li>
            <li><strong>Reselling:</strong> Unauthorized resale of Afilo services without written permission</li>
          </ul>

          <div className="bg-white rounded-lg p-4 mt-4">
            <p className="font-semibold">Enforcement:</p>
            <p className="text-sm mt-1">
              Violations may result in warnings, temporary suspension, or permanent termination without refund.
              Severe violations (CSAM, terrorism, violence) result in <strong>immediate termination</strong> and law enforcement reporting.
            </p>
          </div>

          <p className="mt-4">
            Report violations: <a href="mailto:abuse@techsci.io" className="text-blue-600 hover:underline">abuse@techsci.io</a>
          </p>
        </div>
      </section>

      {/* Intellectual Property */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Intellectual Property Rights</h2>

        <div className="space-y-4 text-gray-700">
          <h3 className="text-xl font-semibold text-gray-900">Our Rights:</h3>
          <p>
            The Service and its original content, features, and functionality (including but not limited to software, design,
            text, graphics, logos) are owned by TechSci, Inc. (operating the Afilo platform) and protected by:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>United States and international copyright laws</li>
            <li>Trademark laws and treaties</li>
            <li>Trade secret protections</li>
            <li>Patent rights (pending and issued)</li>
          </ul>

          <p className="mt-2">
            <strong>Afilo®</strong> is a registered trademark of TechSci, Inc. (operating the Afilo platform). You may not use our trademarks
            without prior written permission.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Your Rights (License Grant):</h3>
          <p>
            Subject to these Terms, we grant you a <strong>limited, non-exclusive, non-transferable, revocable license</strong> to:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Access and use the Service for your internal business purposes</li>
            <li>Use the Service within the scope of your subscription plan</li>
            <li>Create derivative works from your own data stored in the Service</li>
          </ul>

          <p className="mt-2 font-semibold">You may NOT:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Reverse engineer, decompile, or disassemble the Service</li>
            <li>Copy, modify, or create derivative works of the Service itself</li>
            <li>Rent, lease, loan, resell, or sublicense access to the Service</li>
            <li>Remove or alter any proprietary notices (copyright, trademarks)</li>
            <li>Use the Service to build a competitive product</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Your Content:</h3>
          <p>
            You retain all ownership rights to content you upload or create using the Service ("Customer Data").
            By uploading content, you grant us a <strong>limited license</strong> to:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Store, process, and transmit Customer Data as necessary to provide the Service</li>
            <li>Create backups and derivative works for service delivery</li>
            <li>Use aggregated, anonymized data for analytics and service improvement</li>
          </ul>

          <p className="mt-2">
            We will NOT use your Customer Data for any purpose other than providing the Service without your consent.
            See our <Link href="/legal/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link> and{' '}
            <Link href="/legal/data-processing" className="text-blue-600 hover:underline">Data Processing Agreement</Link> for details.
          </p>
        </div>
      </section>

      {/* Data Privacy and Security */}
      <section className="bg-green-50 border-l-4 border-green-600 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Privacy, Security, and Compliance</h2>

        <div className="space-y-4 text-gray-700">
          <h3 className="text-xl font-semibold text-gray-900">Our Commitments:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>SOC 2 Type II Certified:</strong> Annual independent audit of security controls</li>
            <li><strong>ISO 27001:2022 Certified:</strong> Information security management system</li>
            <li><strong>HIPAA Compliant:</strong> Execute Business Associate Agreements for healthcare customers</li>
            <li><strong>CCPA Compliant:</strong> California Consumer Privacy Act compliance</li>
            <li><strong>Encryption:</strong> AES-256 at rest, TLS 1.3 in transit</li>
            <li><strong>Access Controls:</strong> RBAC, MFA, least privilege principle</li>
            <li><strong>Audit Logging:</strong> Comprehensive logs of all data access and modifications</li>
            <li><strong>Regular Testing:</strong> Penetration testing, vulnerability scans, security assessments</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Your Responsibilities:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Maintain strong passwords and enable multi-factor authentication</li>
            <li>Ensure compliance with applicable laws for YOUR data and use cases</li>
            <li>Do NOT upload PHI without executing a HIPAA Business Associate Agreement</li>
            <li>Do NOT process EU/EEA personal data using our Service</li>
            <li>Notify us immediately of suspected security incidents or unauthorized access</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Related Policies:</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li><Link href="/legal/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link> - How we collect, use, and protect personal information</li>
            <li><Link href="/legal/data-processing" className="text-blue-600 hover:underline">Data Processing Agreement</Link> - HIPAA/SOC 2 compliance, data processing terms</li>
            <li><Link href="/legal/acceptable-use" className="text-blue-600 hover:underline">Acceptable Use Policy</Link> - Data usage restrictions and prohibited content</li>
          </ul>

          <div className="bg-white rounded-lg p-4 mt-4">
            <p className="font-semibold">HIPAA Customers:</p>
            <p className="text-sm mt-1">
              To process Protected Health Information (PHI), you MUST execute a Business Associate Agreement (BAA) before
              uploading any PHI. Request BAA: <a href="mailto:hipaa@techsci.io" className="text-blue-600 hover:underline">hipaa@techsci.io</a>
            </p>
          </div>
        </div>
      </section>

      {/* Warranties and Disclaimers */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Warranties and Disclaimers</h2>

        <div className="space-y-4 text-gray-700">
          <h3 className="text-xl font-semibold text-gray-900">Our Limited Warranty:</h3>
          <p>
            We warrant that the Service will perform substantially in accordance with our documentation and will meet
            our 99.99% uptime SLA (for Enterprise plans).
          </p>

          <p className="mt-2">
            <strong>Your Exclusive Remedy:</strong> If we fail to meet this warranty, your sole remedy is service credits
            as outlined in our <Link href="/legal/refund-policy#sla-credits" className="text-blue-600 hover:underline">Refund Policy</Link>.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-4 uppercase">Disclaimer of Warranties:</h3>
          <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-300">
            <p className="font-bold uppercase">
              EXCEPT AS EXPRESSLY PROVIDED ABOVE, THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES
              OF ANY KIND, EITHER EXPRESS OR IMPLIED.
            </p>
            <p className="mt-2 font-semibold">
              WE DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>IMPLIED WARRANTIES OF MERCHANTABILITY</li>
              <li>FITNESS FOR A PARTICULAR PURPOSE</li>
              <li>NON-INFRINGEMENT</li>
              <li>WARRANTIES ARISING FROM COURSE OF DEALING OR USAGE OF TRADE</li>
            </ul>
            <p className="mt-2">
              WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
            </p>
          </div>

          <p className="mt-4 text-sm">
            Some jurisdictions do not allow disclaimer of implied warranties, so the above disclaimer may not apply to you
            to the extent prohibited by law.
          </p>
        </div>
      </section>

      {/* Limitation of Liability */}
      <section className="bg-red-50 border-2 border-red-600 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 uppercase">9. Limitation of Liability</h2>

        <div className="space-y-4 text-gray-700">
          <div className="bg-white rounded-lg p-4 border-2 border-red-600">
            <p className="font-bold uppercase text-lg">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW:
            </p>

            <p className="mt-3 font-semibold">
              IN NO EVENT SHALL TECHSCI, INC. (OPERATING THE AFILO PLATFORM), ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, OR AFFILIATES
              BE LIABLE FOR ANY:
            </p>

            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES</strong></li>
              <li><strong>LOSS OF PROFITS, REVENUE, DATA, OR BUSINESS OPPORTUNITIES</strong></li>
              <li><strong>COST OF SUBSTITUTE GOODS OR SERVICES</strong></li>
              <li><strong>BUSINESS INTERRUPTION OR LOSS OF USE</strong></li>
            </ul>

            <p className="mt-3">
              WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), PRODUCT LIABILITY, OR ANY OTHER LEGAL THEORY,
              AND WHETHER OR NOT WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>

            <p className="mt-3 font-bold text-lg">
              OUR TOTAL LIABILITY FOR ALL CLAIMS ARISING FROM OR RELATED TO THE SERVICE SHALL NOT EXCEED THE GREATER OF:
            </p>
            <ul className="list-disc pl-6 mt-2">
              <li>$100 USD, OR</li>
              <li>The amount you paid us in the 12 months prior to the event giving rise to liability</li>
            </ul>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Exceptions:</h3>
          <p>
            The above limitations do NOT apply to:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Our indemnification obligations (Section 10)</li>
            <li>Your payment obligations</li>
            <li>Liability that cannot be excluded under applicable law (death, personal injury caused by negligence)</li>
            <li>Fraud or willful misconduct</li>
          </ul>

          <p className="mt-4 text-sm">
            Some jurisdictions do not allow limitation of liability for incidental or consequential damages, so the above
            limitations may not apply to you to the extent prohibited by law.
          </p>
        </div>
      </section>

      {/* Indemnification */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Indemnification</h2>

        <div className="space-y-4 text-gray-700">
          <h3 className="text-xl font-semibold text-gray-900">Your Indemnification Obligations:</h3>
          <p>
            You agree to indemnify, defend, and hold harmless TechSci, Inc. (operating the Afilo platform), its officers, directors,
            employees, agents, and affiliates from any third-party claims, damages, losses, or expenses (including reasonable
            attorneys' fees) arising from:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Your use or misuse of the Service</li>
            <li>Your violation of these Terms or applicable laws</li>
            <li>Your Customer Data (including infringement of third-party IP rights)</li>
            <li>Your violation of our <Link href="/legal/acceptable-use" className="text-blue-600 hover:underline">Acceptable Use Policy</Link></li>
            <li>Breach of your representations and warranties (including geographic restrictions)</li>
            <li>Your negligence, willful misconduct, or fraud</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Our Indemnification Obligations:</h3>
          <p>
            We will indemnify you from third-party claims that the Service infringes a valid US patent, copyright, or trademark,
            provided you:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Promptly notify us in writing of the claim</li>
            <li>Grant us sole control of the defense and settlement</li>
            <li>Provide reasonable assistance in the defense (at our expense)</li>
          </ul>

          <p className="mt-2">
            <strong>Our Remedy:</strong> If the Service is found to infringe, we may (at our option):
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Obtain a license for continued use</li>
            <li>Modify the Service to be non-infringing</li>
            <li>Replace with non-infringing equivalent</li>
            <li>Terminate your subscription and refund prepaid fees (pro-rated)</li>
          </ul>

          <div className="bg-gray-50 rounded-lg p-4 mt-4">
            <p className="font-semibold">Indemnification Exclusions:</p>
            <p className="text-sm mt-1">
              We are NOT obligated to indemnify for claims arising from: (a) modification of the Service by anyone other than us,
              (b) use of the Service in combination with third-party products, (c) your Customer Data, or (d) your violation of these Terms.
            </p>
          </div>
        </div>
      </section>

      {/* Third-Party Services */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Third-Party Services and Integrations</h2>

        <div className="space-y-4 text-gray-700">
          <p>
            Our Service integrates with third-party services and platforms (e.g., Shopify, Stripe, Google OAuth).
          </p>

          <h3 className="text-xl font-semibold text-gray-900">Third-Party Terms:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Use of third-party services is subject to their own terms and privacy policies</li>
            <li>We are not responsible for third-party services' availability, security, or content</li>
            <li>You are responsible for complying with third-party terms when using integrations</li>
            <li>We may disable integrations at any time if third-party terms change or services become unavailable</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Third-Party Links:</h3>
          <p>
            Our Service may contain links to third-party websites. We do not endorse or control these websites and are
            not responsible for their content, accuracy, or practices.
          </p>

          <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 mt-4">
            <p className="font-semibold">Disclaimer:</p>
            <p className="text-sm mt-1">
              Your use of third-party services is at your own risk. We disclaim all liability for third-party services,
              content, or actions.
            </p>
          </div>
        </div>
      </section>

      {/* Confidentiality */}
      <section className="bg-blue-50 border-l-4 border-blue-600 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Confidentiality</h2>

        <div className="space-y-4 text-gray-700">
          <h3 className="text-xl font-semibold text-gray-900">Definition:</h3>
          <p>
            "Confidential Information" means non-public information disclosed by one party ("Discloser") to the other party
            ("Recipient"), including but not limited to:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Business plans, strategies, and financial information</li>
            <li>Technical data, algorithms, and source code</li>
            <li>Customer Data and Personal Data</li>
            <li>Pricing, discounts, and contractual terms</li>
            <li>Information marked "Confidential" or that reasonably should be understood as confidential</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Obligations:</h3>
          <p>Recipient agrees to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Protect Confidential Information using at least the same degree of care as for its own confidential information (minimum: reasonable care)</li>
            <li>Use Confidential Information only for purposes of the Agreement</li>
            <li>Disclose Confidential Information only to employees/contractors with need-to-know and confidentiality obligations</li>
            <li>Not disclose Confidential Information to third parties without prior written consent</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Exclusions:</h3>
          <p>Confidentiality obligations do NOT apply to information that:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Is or becomes publicly available through no breach of this Agreement</li>
            <li>Was rightfully known prior to disclosure</li>
            <li>Is independently developed without use of Confidential Information</li>
            <li>Is rightfully received from a third party without confidentiality obligation</li>
            <li>Must be disclosed by law or court order (with prior notice to Discloser when permitted)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Duration:</h3>
          <p>
            Confidentiality obligations survive for <strong>3 years</strong> after termination of the Agreement,
            except for trade secrets which remain confidential indefinitely.
          </p>
        </div>
      </section>

      {/* Modifications to Service and Terms */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Modifications to Service and Terms</h2>

        <div className="space-y-4 text-gray-700">
          <h3 className="text-xl font-semibold text-gray-900">Service Changes:</h3>
          <p>
            We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time, with or without notice.
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li><strong>Feature Changes:</strong> We may add, modify, or remove features</li>
            <li><strong>Scheduled Maintenance:</strong> Announced 7+ days in advance when possible</li>
            <li><strong>Emergency Maintenance:</strong> May occur without notice for security or stability</li>
            <li><strong>Beta Features:</strong> May be discontinued at any time</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Terms Changes:</h3>
          <p>
            We may update these Terms from time to time. When we make material changes, we will:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Update the "Effective Date" at the top of this page</li>
            <li>Notify you via email at least <strong>30 days</strong> before changes take effect</li>
            <li>Post prominent notice in your account dashboard</li>
          </ul>

          <p className="mt-2">
            <strong>Your Options:</strong> If you do not agree to updated Terms, you may:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Cancel your subscription within 30 days of notification (no penalty)</li>
            <li>Continue using the Service under the new Terms (acceptance via continued use)</li>
          </ul>

          <p className="mt-2 font-semibold">
            Continued use of the Service after the effective date of changes constitutes acceptance of the updated Terms.
          </p>
        </div>
      </section>

      {/* Termination */}
      <section className="bg-red-50 border-l-4 border-red-600 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Termination</h2>

        <div className="space-y-4 text-gray-700">
          <h3 className="text-xl font-semibold text-gray-900">Termination by You:</h3>
          <p>
            You may cancel your subscription at any time from your account dashboard or by contacting support@techsci.io.
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Cancellation effective at end of current billing period</li>
            <li>No pro-rata refunds for mid-cycle cancellations (except 30-day guarantee)</li>
            <li>Access retained until end of billing period</li>
            <li>Data export available for 90 days post-cancellation</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Termination by Us:</h3>
          <p>We may suspend or terminate your account immediately if:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Violation of Terms:</strong> Breach of these Terms, Acceptable Use Policy, or other policies</li>
            <li><strong>Non-Payment:</strong> Account unpaid for 30+ days</li>
            <li><strong>Illegal Activity:</strong> Fraud, CSAM, terrorism, or other illegal conduct</li>
            <li><strong>Security Risk:</strong> Account poses security threat to Service or other users</li>
            <li><strong>False Information:</strong> Provided materially false account information</li>
            <li><strong>Geographic Violation:</strong> Determined to be located in EU/EEA</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Effect of Termination:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Immediate:</strong> Access to Service revoked</li>
            <li><strong>7 days:</strong> Final opportunity to export data</li>
            <li><strong>90 days:</strong> All Customer Data permanently deleted from production systems</li>
            <li><strong>120 days:</strong> Data deleted from backups (as backups expire)</li>
          </ul>

          <div className="bg-white rounded-lg p-4 mt-4">
            <p className="font-semibold">No Refunds for Cause:</p>
            <p className="text-sm mt-1">
              If we terminate your account for cause (violation of Terms), you are NOT entitled to any refund of prepaid fees.
              We may also pursue legal remedies for damages caused by your violations.
            </p>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Survival:</h3>
          <p>
            The following sections survive termination: Sections 6 (Intellectual Property), 8 (Disclaimers), 9 (Limitation of Liability),
            10 (Indemnification), 12 (Confidentiality), 15 (Dispute Resolution), and 16 (General Provisions).
          </p>
        </div>
      </section>

      {/* Dispute Resolution */}
      <section className="bg-orange-50 border-2 border-orange-600 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 uppercase">15. Dispute Resolution and Arbitration</h2>

        <div className="space-y-4 text-gray-700">
          <div className="bg-white rounded-lg p-4 border-2 border-red-600">
            <p className="font-bold uppercase text-lg">MANDATORY ARBITRATION CLAUSE</p>
            <p className="mt-2 font-semibold">
              ANY DISPUTES BETWEEN YOU AND TECHSCI, INC. (OPERATING THE AFILO PLATFORM) SHALL BE RESOLVED BY BINDING ARBITRATION,
              NOT IN COURT, EXCEPT AS PROVIDED BELOW.
            </p>
          </div>

          <p>
            For complete dispute resolution procedures, see our{' '}
            <Link href="/legal/dispute-resolution" className="text-blue-600 hover:underline">Dispute Resolution Policy</Link>.
          </p>

          <h3 className="text-xl font-semibold text-gray-900">4-Step Process:</h3>
          <ol className="list-decimal pl-6 space-y-2">
            <li><strong>Informal Resolution (30 days):</strong> Contact support@techsci.io</li>
            <li><strong>Formal Complaint (60 days):</strong> Written notice to legal@techsci.io</li>
            <li><strong>Mediation (Optional):</strong> Non-binding mediation attempt</li>
            <li><strong>Binding Arbitration (Mandatory):</strong> AAA rules, Delaware venue, individual arbitration only</li>
          </ol>

          <h3 className="text-xl font-semibold text-gray-900 mt-4 uppercase">Class Action Waiver:</h3>
          <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-600">
            <p className="font-bold uppercase">
              YOU AND TECHSCI, INC. (OPERATING THE AFILO PLATFORM) AGREE TO WAIVE THE RIGHT TO PARTICIPATE IN CLASS ACTIONS,
              CLASS ARBITRATIONS, OR REPRESENTATIVE PROCEEDINGS.
            </p>
            <p className="mt-2">
              All disputes must be brought individually. You may NOT bring claims on behalf of other customers or users.
            </p>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Opt-Out Right:</h3>
          <p>
            You may opt out of arbitration by sending written notice to{' '}
            <a href="mailto:optout@techsci.io" className="text-blue-600 hover:underline">optout@techsci.io</a> within{' '}
            <strong>30 days</strong> of account creation. Include your name, email, and statement "I opt out of arbitration."
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Governing Law:</h3>
          <p>
            These Terms are governed by the laws of the <strong>State of Delaware, United States</strong>, without regard
            to conflict of law principles.
          </p>
        </div>
      </section>

      {/* General Provisions */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">16. General Provisions</h2>

        <div className="space-y-4 text-gray-700">
          <h3 className="text-xl font-semibold text-gray-900">Entire Agreement:</h3>
          <p>
            These Terms, together with our <Link href="/legal/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link>,{' '}
            <Link href="/legal/acceptable-use" className="text-blue-600 hover:underline">Acceptable Use Policy</Link>,{' '}
            <Link href="/legal/refund-policy" className="text-blue-600 hover:underline">Refund Policy</Link>,{' '}
            <Link href="/legal/dispute-resolution" className="text-blue-600 hover:underline">Dispute Resolution Policy</Link>, and{' '}
            <Link href="/legal/data-processing" className="text-blue-600 hover:underline">Data Processing Agreement</Link>,
            constitute the entire agreement between you and TechSci, Inc. (operating the Afilo platform) regarding the Service.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Severability:</h3>
          <p>
            If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will remain in full force and effect.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Waiver:</h3>
          <p>
            Our failure to enforce any right or provision of these Terms will not be deemed a waiver of such right or provision.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Assignment:</h3>
          <p>
            You may not assign or transfer these Terms or your account without our prior written consent. We may assign our rights
            and obligations without restriction (e.g., in connection with a merger or acquisition).
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Force Majeure:</h3>
          <p>
            We are not liable for failure to perform due to causes beyond our reasonable control, including natural disasters,
            war, terrorism, pandemics, labor disputes, government actions, or failures of third-party services.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Export Compliance:</h3>
          <p>
            The Service is subject to US export control laws. You agree not to export, re-export, or transfer the Service or
            any technical data to prohibited countries or individuals under US sanctions (e.g., Cuba, Iran, North Korea, Syria, Crimea).
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Government Use:</h3>
          <p>
            If you are a US government entity, the Service is a "commercial item" as defined in FAR 2.101 and is provided with
            only those rights granted to non-governmental customers under these Terms.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Independent Contractors:</h3>
          <p>
            The parties are independent contractors. These Terms do not create a partnership, joint venture, agency, or employment relationship.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Notices:</h3>
          <p>
            Legal notices to TechSci, Inc. (operating the Afilo platform) must be sent to:{' '}
            <a href="mailto:legal@techsci.io" className="text-blue-600 hover:underline">legal@techsci.io</a> or 1111B S Governors Ave STE 34002, Dover, DE 19904.
          </p>
          <p>
            We will send notices to the email address associated with your account.
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">17. Contact Information</h2>

        <div className="space-y-3 text-gray-700">
          <p>
            <strong>Company:</strong> TechSci, Inc. (operating the Afilo platform)<br />
            <strong>Address:</strong> 1111B S Governors Ave STE 34002, Dover, DE 19904, United States
          </p>

          <p>
            <strong>General Support:</strong><br />
            Email: <a href="mailto:support@techsci.io" className="text-blue-600 hover:underline">support@techsci.io</a><br />
            Phone: +1 302 415 3171 (Mon-Fri, 9am-5pm ET)
          </p>

          <p>
            <strong>Legal Inquiries:</strong><br />
            Email: <a href="mailto:legal@techsci.io" className="text-blue-600 hover:underline">legal@techsci.io</a>
          </p>

          <p>
            <strong>Billing & Refunds:</strong><br />
            Email: <a href="mailto:billing@techsci.io" className="text-blue-600 hover:underline">billing@techsci.io</a>
          </p>

          <p>
            <strong>Security Issues:</strong><br />
            Email: <a href="mailto:security@techsci.io" className="text-blue-600 hover:underline">security@techsci.io</a><br />
            24/7 Hotline: +1 302 415 3171
          </p>

          <p>
            <strong>Privacy & Data Protection:</strong><br />
            Email: <a href="mailto:privacy@techsci.io" className="text-blue-600 hover:underline">privacy@techsci.io</a>
          </p>
        </div>
      </section>

      {/* Acknowledgment */}
      <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border-2 border-blue-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Acknowledgment and Acceptance</h2>
        <p className="text-gray-700 mb-4">
          BY ACCESSING OR USING THE AFILO SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS OF SERVICE.
        </p>
        <p className="text-gray-700 mb-4 font-semibold">
          YOU SPECIFICALLY ACKNOWLEDGE AND AGREE TO:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-gray-700">
          <li>Geographic restrictions (NO EU/EEA services)</li>
          <li>Mandatory arbitration clause and class action waiver</li>
          <li>Limitation of liability and disclaimer of warranties</li>
          <li>Data processing terms and privacy practices</li>
          <li>Acceptable use restrictions</li>
        </ul>
        <p className="text-gray-700 mt-4">
          If you have questions about these Terms, contact:{' '}
          <a href="mailto:legal@techsci.io" className="text-blue-600 hover:underline">legal@techsci.io</a>
        </p>
      </section>
    </div>
  );
}
