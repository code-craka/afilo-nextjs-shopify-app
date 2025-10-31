import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Data Processing Agreement | Afilo Enterprise',
  description: 'HIPAA & SOC 2 Compliant Data Processing Agreement - Enterprise Data Protection Terms',
};

export default function DataProcessingPage() {
  return (
    <div className="space-y-8">
      {/* Introduction */}
      <section>
        <p className="text-gray-700 leading-relaxed mb-4">
          Effective Date: January 30, 2025
        </p>
        <p className="text-gray-700 leading-relaxed mb-4">
          This Data Processing Agreement ("DPA") forms part of the agreement between TechSci, Inc. (operating the Afilo platform)
          ("Data Processor" or "we") and you ("Data Controller" or "Customer") for the provision of Afilo enterprise software services.
        </p>
        <p className="text-gray-700 leading-relaxed">
          This DPA governs the processing of personal data by TechSci, Inc. (operating the Afilo platform) on behalf of Customer and reflects
          our commitment to data protection, security, and compliance with HIPAA, SOC 2 Type II, and ISO 27001 standards.
        </p>
      </section>

      {/* Key Definitions */}
      <section className="bg-blue-50 border-l-4 border-blue-600 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Definitions</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>"Personal Data":</strong> Any information relating to an identified or identifiable natural person that is processed by Afilo on behalf of Customer.</p>
          <p><strong>"Data Controller":</strong> Customer (you), who determines the purposes and means of processing Personal Data.</p>
          <p><strong>"Data Processor":</strong> TechSci, Inc. (operating the Afilo platform), who processes Personal Data on behalf of Customer.</p>
          <p><strong>"Sub-Processor":</strong> Any third-party service provider engaged by Afilo to process Personal Data.</p>
          <p><strong>"Protected Health Information (PHI)":</strong> Health information defined under HIPAA (45 CFR § 160.103).</p>
          <p><strong>"Processing":</strong> Any operation performed on Personal Data, including collection, storage, use, disclosure, or deletion.</p>
          <p><strong>"Data Subject":</strong> The individual to whom Personal Data relates.</p>
        </div>
      </section>

      {/* Scope of Processing */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Scope of Data Processing</h2>

        <div className="space-y-4 text-gray-700">
          <h3 className="text-xl font-semibold text-gray-900">Subject Matter:</h3>
          <p>Provision of Afilo enterprise software platform and related services as described in the Terms of Service.</p>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Duration of Processing:</h3>
          <p>
            From the date of account activation until <strong>90 days after subscription termination</strong>, at which point
            all Customer data is permanently deleted unless otherwise required by law.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Nature and Purpose of Processing:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide platform functionality and features to Customer</li>
            <li>Store and manage Customer account data and user information</li>
            <li>Process transactions and billing</li>
            <li>Provide customer support and troubleshooting</li>
            <li>Ensure security, prevent fraud, and maintain service integrity</li>
            <li>Comply with legal obligations and regulatory requirements</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Types of Personal Data Processed:</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Account Information:</strong> Name, email, company name, job title, phone number</li>
            <li><strong>Authentication Data:</strong> Hashed passwords, OAuth tokens, session identifiers</li>
            <li><strong>Usage Data:</strong> IP addresses, device information, activity logs, API calls</li>
            <li><strong>Billing Data:</strong> Payment information (processed by Stripe), billing address, tax ID</li>
            <li><strong>Support Data:</strong> Support tickets, chat logs, email communications</li>
            <li><strong>PHI (if applicable):</strong> Health information for HIPAA-covered customers with executed BAA</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Categories of Data Subjects:</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Customer's employees, contractors, and authorized users</li>
            <li>Customer's clients and end users (if applicable)</li>
            <li>Customer's patients or healthcare recipients (if HIPAA BAA in effect)</li>
          </ul>
        </div>
      </section>

      {/* Data Processor Obligations */}
      <section className="bg-green-50 border-l-4 border-green-600 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Data Processor Obligations</h2>

        <div className="space-y-4 text-gray-700">
          <h3 className="text-xl font-semibold text-gray-900">Afilo commits to:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Process only on instructions:</strong> Process Personal Data only as instructed by Customer or as required by applicable law</li>
            <li><strong>Confidentiality:</strong> Ensure personnel processing data are bound by confidentiality obligations</li>
            <li><strong>Security measures:</strong> Implement and maintain administrative, physical, and technical safeguards to protect Personal Data</li>
            <li><strong>Sub-processor management:</strong> Ensure Sub-Processors are contractually bound by equivalent data protection obligations</li>
            <li><strong>Assist with data subject rights:</strong> Provide reasonable assistance to Customer in responding to data subject requests</li>
            <li><strong>Data breach notification:</strong> Notify Customer of Personal Data breaches without undue delay</li>
            <li><strong>Deletion/return of data:</strong> Delete or return all Personal Data upon termination (subject to legal retention requirements)</li>
            <li><strong>Audit cooperation:</strong> Make available information necessary to demonstrate compliance and permit audits</li>
          </ul>

          <div className="bg-white rounded-lg p-4 mt-4">
            <p className="font-semibold mb-2">Technical and Organizational Security Measures:</p>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li><strong>Encryption:</strong> AES-256 encryption at rest, TLS 1.3 encryption in transit</li>
              <li><strong>Access Controls:</strong> Role-based access control (RBAC), multi-factor authentication (MFA)</li>
              <li><strong>Audit Logging:</strong> Comprehensive audit trails for all data access and modifications</li>
              <li><strong>Network Security:</strong> Firewall protection, intrusion detection systems (IDS), DDoS mitigation</li>
              <li><strong>Vulnerability Management:</strong> Regular security assessments, penetration testing, patch management</li>
              <li><strong>Incident Response:</strong> 24/7 security monitoring, defined incident response procedures</li>
              <li><strong>Data Backup:</strong> Encrypted daily backups with 30-day retention, disaster recovery plan</li>
              <li><strong>Physical Security:</strong> SOC 2 certified data centers with restricted access, surveillance, environmental controls</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Sub-Processors */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Sub-Processors</h2>

        <div className="space-y-4 text-gray-700">
          <p>
            Customer authorizes Afilo to engage the following Sub-Processors for processing Personal Data:
          </p>

          <div className="bg-gray-50 rounded-lg p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-2">Sub-Processor</th>
                  <th className="text-left py-2">Purpose</th>
                  <th className="text-left py-2">Location</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-2">Vercel Inc.</td>
                  <td className="py-2">Application hosting and deployment</td>
                  <td className="py-2">United States</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-2">Amazon Web Services (AWS)</td>
                  <td className="py-2">Cloud infrastructure and storage</td>
                  <td className="py-2">United States</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-2">Stripe, Inc.</td>
                  <td className="py-2">Payment processing (PCI DSS Level 1)</td>
                  <td className="py-2">United States</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-2">Neon Inc.</td>
                  <td className="py-2">Database services (PostgreSQL)</td>
                  <td className="py-2">United States</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-2">Clerk.com</td>
                  <td className="py-2">Authentication services</td>
                  <td className="py-2">United States</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-2">Resend Inc.</td>
                  <td className="py-2">Transactional email delivery</td>
                  <td className="py-2">United States</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-2">Neon Database</td>
                  <td className="py-2">Database management (PostgreSQL)</td>
                  <td className="py-2">United States</td>
                </tr>
                <tr>
                  <td className="py-2">Upstash Inc.</td>
                  <td className="py-2">Rate limiting and caching (Redis)</td>
                  <td className="py-2">United States</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Sub-Processor Changes:</h3>
          <p>
            Afilo will provide <strong>30 days' prior notice</strong> before engaging new Sub-Processors or replacing existing ones.
            Customer may object to new Sub-Processors within 14 days of notification. If Customer objects, Customer may terminate
            the subscription without penalty.
          </p>

          <p className="mt-2">
            To receive Sub-Processor change notifications, subscribe at:{' '}
            <a href="mailto:dpo@techsci.io?subject=Subscribe%20to%20Sub-Processor%20Updates" className="text-blue-600 hover:underline">
              dpo@techsci.io
            </a>
          </p>
        </div>
      </section>

      {/* Data Subject Rights */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Assistance with Data Subject Rights</h2>

        <div className="space-y-4 text-gray-700">
          <p>
            Afilo will provide reasonable assistance to Customer in responding to requests from Data Subjects exercising their rights under applicable data protection laws.
          </p>

          <h3 className="text-xl font-semibold text-gray-900">Data Subject Rights Include:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Right of Access:</strong> Obtain confirmation of data processing and access to Personal Data</li>
            <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete Personal Data</li>
            <li><strong>Right to Erasure ("Right to be Forgotten"):</strong> Request deletion of Personal Data (subject to legal retention requirements)</li>
            <li><strong>Right to Restrict Processing:</strong> Limit processing under certain circumstances</li>
            <li><strong>Right to Data Portability:</strong> Receive Personal Data in structured, commonly used, machine-readable format</li>
            <li><strong>Right to Object:</strong> Object to processing based on legitimate interests or for direct marketing</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Afilo's Assistance:</h3>
          <p>
            Upon Customer request, Afilo will within <strong>10 business days</strong>:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Provide export of Customer data in JSON or CSV format</li>
            <li>Assist in correcting, deleting, or restricting data</li>
            <li>Provide audit logs related to data subject's Personal Data</li>
            <li>Cooperate with Customer's legal obligations under applicable privacy laws</li>
          </ul>

          <p className="mt-4">
            <strong>Important:</strong> Customer is responsible for verifying data subject identity and determining the validity of requests.
            Afilo will not respond directly to data subject requests unless legally required.
          </p>
        </div>
      </section>

      {/* Data Breach Notification */}
      <section className="bg-red-50 border-l-4 border-red-600 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Breach Notification</h2>

        <div className="space-y-4 text-gray-700">
          <p className="font-semibold text-lg">
            Afilo will notify Customer of any Personal Data breach without undue delay and in compliance with applicable law.
          </p>

          <h3 className="text-xl font-semibold text-gray-900">Notification Timeline:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>General Data Breaches:</strong> Within <strong>72 hours</strong> of discovery</li>
            <li><strong>HIPAA Breaches (PHI):</strong> Within <strong>60 days</strong> as required by HIPAA Breach Notification Rule (45 CFR § 164.410)</li>
            <li><strong>Critical/High-Risk Breaches:</strong> Within <strong>24 hours</strong> (immediate notification)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Breach Notification Contents:</h3>
          <p>Afilo will provide Customer with the following information (to the extent known):</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Nature of the breach (description of what happened)</li>
            <li>Categories and approximate number of affected Data Subjects</li>
            <li>Categories and approximate number of Personal Data records affected</li>
            <li>Likely consequences of the breach</li>
            <li>Measures taken or proposed to address the breach and mitigate harm</li>
            <li>Contact information for further inquiries (security@techsci.io)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Afilo's Response Actions:</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Immediate containment and mitigation of the breach</li>
            <li>Investigation to determine cause, scope, and impact</li>
            <li>Implementation of remediation measures to prevent recurrence</li>
            <li>Cooperation with Customer's breach notification obligations to data subjects and regulators</li>
            <li>Forensic analysis and incident report documentation</li>
          </ul>

          <div className="bg-white rounded-lg p-4 mt-4">
            <p className="font-semibold">Security Incident Contact:</p>
            <p className="text-sm mt-1">
              Email: <a href="mailto:security@techsci.io" className="text-blue-600 hover:underline">security@techsci.io</a><br />
              Phone: +1 302 415 3171 (24/7 Security Hotline)<br />
              Encrypted Communication: Available upon request (PGP key)
            </p>
          </div>
        </div>
      </section>

      {/* Security Audits and Certifications */}
      <section className="bg-green-50 border-l-4 border-green-600 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Security Audits and Certifications</h2>

        <div className="space-y-4 text-gray-700">
          <h3 className="text-xl font-semibold text-gray-900">Current Certifications:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>SOC 2 Type II:</strong> Annual audit by independent third-party (most recent: 2024)</li>
            <li><strong>ISO 27001:2022:</strong> Information Security Management System certification</li>
            <li><strong>HIPAA Compliance:</strong> Administrative, physical, and technical safeguards implemented</li>
            <li><strong>PCI DSS:</strong> Payment Card Industry compliance via Stripe (Level 1 Service Provider)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Customer Audit Rights:</h3>
          <p>
            Customer may audit Afilo's compliance with this DPA <strong>once per year</strong>, subject to the following conditions:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Notice:</strong> Provide 30 days' advance written notice</li>
            <li><strong>Scope:</strong> Limited to data processing activities relevant to Customer</li>
            <li><strong>Non-Disruption:</strong> Conducted during business hours without disrupting operations</li>
            <li><strong>Confidentiality:</strong> Auditor must execute NDA before accessing systems</li>
            <li><strong>Cost:</strong> Customer bears all audit costs unless non-compliance found</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Audit Alternatives:</h3>
          <p>
            In lieu of on-site audits, Customer may request:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Copy of most recent SOC 2 Type II report</li>
            <li>ISO 27001 certificate and Statement of Applicability (SoA)</li>
            <li>Completed security questionnaire (annually)</li>
            <li>Third-party penetration test results summary</li>
          </ul>

          <p className="mt-4">
            To request audit documentation, contact:{' '}
            <a href="mailto:compliance@techsci.io" className="text-blue-600 hover:underline">compliance@techsci.io</a>
          </p>
        </div>
      </section>

      {/* Data Retention and Deletion */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Data Retention and Deletion</h2>

        <div className="space-y-4 text-gray-700">
          <h3 className="text-xl font-semibold text-gray-900">Retention Period:</h3>
          <p>
            Afilo retains Customer Personal Data for the duration of the subscription plus <strong>90 days</strong> after termination.
          </p>

          <div className="bg-gray-50 rounded-lg p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-2">Data Type</th>
                  <th className="text-left py-2">Retention Period</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-2">Account & User Data</td>
                  <td className="py-2">90 days post-cancellation</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-2">Usage Logs & Analytics</td>
                  <td className="py-2">90 days post-cancellation</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-2">PHI (if HIPAA BAA)</td>
                  <td className="py-2">90 days post-cancellation (unless longer retention required by law)</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-2">Billing Records</td>
                  <td className="py-2">7 years (tax/legal compliance)</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-2">Backups</td>
                  <td className="py-2">30 days rolling (deleted after 30 days)</td>
                </tr>
                <tr>
                  <td className="py-2">Security Logs</td>
                  <td className="py-2">1 year (security/compliance)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Deletion Process:</h3>
          <p>
            Upon subscription termination or Customer request, Afilo will:
          </p>
          <ol className="list-decimal pl-6 space-y-2">
            <li><strong>Immediate:</strong> Revoke Customer access to the platform</li>
            <li><strong>Within 7 days:</strong> Provide option to export all Customer data (JSON/CSV format)</li>
            <li><strong>Within 90 days:</strong> Permanently delete all Customer data from production systems</li>
            <li><strong>Within 120 days:</strong> Delete all data from backups and archives (as backups expire)</li>
            <li><strong>Certification:</strong> Provide written confirmation of deletion upon request</li>
          </ol>

          <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 mt-4">
            <p className="font-semibold">Legal Retention Exceptions:</p>
            <p className="text-sm mt-1">
              Afilo may retain certain data beyond the 90-day period if required by law (e.g., billing records for tax compliance,
              security logs for regulatory requirements). Such retention will be limited to the minimum required by law.
            </p>
          </div>
        </div>
      </section>

      {/* International Data Transfers */}
      <section className="bg-blue-50 border-l-4 border-blue-600 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">9. International Data Transfers</h2>

        <div className="space-y-4 text-gray-700">
          <p className="font-semibold text-lg">
            Afilo operates exclusively in the United States and approved international markets. We do NOT process data from
            individuals located in the European Union (EU) or European Economic Area (EEA).
          </p>

          <h3 className="text-xl font-semibold text-gray-900">Data Storage Locations:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Primary:</strong> United States (AWS US-East-1, Vercel US regions)</li>
            <li><strong>Backup:</strong> United States (geographically redundant US data centers)</li>
            <li><strong>Sub-Processors:</strong> Primarily US-based (see Section 4 for complete list)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Approved Regions for Customer Data:</h3>
          <p>Customer data may be processed for customers located in:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>United States (primary market)</li>
            <li>Canada (PIPEDA compliance)</li>
            <li>United Kingdom (UK GDPR and Data Protection Act 2018)</li>
            <li>Australia (Privacy Act 1988)</li>
            <li>New Zealand</li>
            <li>Singapore</li>
            <li>Japan</li>
          </ul>

          <div className="bg-red-50 rounded-lg p-4 mt-4 border-2 border-red-600">
            <p className="font-bold text-red-900">EU/EEA Exclusion:</p>
            <p className="text-sm text-gray-900 mt-1">
              Afilo does NOT offer services to customers in the EU/EEA. By using our services, Customer represents that it is not
              located in the EU/EEA and will not process Personal Data of EU/EEA residents using our platform. See our{' '}
              <Link href="/legal/privacy-policy#geographic-restrictions" className="text-blue-600 hover:underline">
                Privacy Policy Section 2
              </Link> for the complete list of excluded countries.
            </p>
          </div>
        </div>
      </section>

      {/* Return and Deletion of Data */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Return and Deletion of Customer Data</h2>

        <div className="space-y-4 text-gray-700">
          <p>
            Upon termination or expiration of the subscription, Customer may choose to:
          </p>

          <h3 className="text-xl font-semibold text-gray-900">Option 1: Data Export</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Format:</strong> JSON, CSV, or API export</li>
            <li><strong>Timeline:</strong> Available for <strong>90 days</strong> after cancellation</li>
            <li><strong>Process:</strong> Self-service export from dashboard or request via support@techsci.io</li>
            <li><strong>Cost:</strong> No additional charge for standard exports (large data sets may incur fees)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Option 2: Immediate Deletion</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Request:</strong> Email dpo@techsci.io with deletion request</li>
            <li><strong>Timeline:</strong> Deletion within <strong>30 days</strong> of request</li>
            <li><strong>Certification:</strong> Written confirmation of deletion provided upon request</li>
            <li><strong>Irreversible:</strong> Once deleted, data cannot be recovered</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Deletion Exclusions:</h3>
          <p>The following data may be retained beyond deletion request for legal compliance:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Billing records and invoices (7 years for tax compliance)</li>
            <li>Security logs (1 year for incident investigation)</li>
            <li>Aggregated/anonymized analytics (no Personal Data)</li>
            <li>Data required by court order, subpoena, or legal hold</li>
          </ul>
        </div>
      </section>

      {/* Liability and Indemnification */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Liability and Indemnification</h2>

        <div className="space-y-4 text-gray-700">
          <h3 className="text-xl font-semibold text-gray-900">Limitation of Liability:</h3>
          <p>
            To the maximum extent permitted by law, Afilo's total liability arising out of or related to this DPA
            (whether in contract, tort, or otherwise) shall not exceed the fees paid by Customer in the <strong>12 months</strong> prior
            to the event giving rise to liability.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Indemnification by Afilo:</h3>
          <p>
            Afilo will indemnify, defend, and hold harmless Customer from third-party claims arising from:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Afilo's breach of this DPA</li>
            <li>Afilo's violation of applicable data protection laws</li>
            <li>Unauthorized disclosure of Customer data by Afilo</li>
            <li>Afilo's gross negligence or willful misconduct</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Indemnification by Customer:</h3>
          <p>
            Customer will indemnify Afilo from third-party claims arising from:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Customer's breach of this DPA or Terms of Service</li>
            <li>Customer's violation of applicable laws (including privacy laws)</li>
            <li>Customer's unauthorized instructions to process data</li>
            <li>Customer content or data that violates third-party rights</li>
          </ul>

          <div className="bg-gray-50 rounded-lg p-4 mt-4">
            <p className="font-semibold">Insurance:</p>
            <p className="text-sm mt-1">
              Afilo maintains cyber liability insurance with coverage of at least <strong>$5,000,000</strong> per incident.
              Certificate of insurance available upon request.
            </p>
          </div>
        </div>
      </section>

      {/* HIPAA Business Associate Addendum */}
      <section className="bg-green-50 border-2 border-green-600 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">12. HIPAA Business Associate Addendum (If Applicable)</h2>

        <div className="space-y-4 text-gray-700">
          <p className="font-semibold text-lg">
            For Customers who are Covered Entities or Business Associates under HIPAA, the following additional terms apply:
          </p>

          <h3 className="text-xl font-semibold text-gray-900">Permitted Uses and Disclosures of PHI:</h3>
          <p>
            Afilo may use and disclose PHI only as permitted by this DPA, the BAA, and HIPAA (45 CFR Parts 160 and 164).
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">HIPAA Safeguards:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Administrative Safeguards:</strong> Security management process, workforce training, contingency planning</li>
            <li><strong>Physical Safeguards:</strong> Facility access controls, workstation security, device and media controls</li>
            <li><strong>Technical Safeguards:</strong> Access controls (RBAC), audit controls, integrity controls, transmission security</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Breach Notification (HIPAA):</h3>
          <p>
            Afilo will notify Customer of any unauthorized use or disclosure of PHI within <strong>60 days</strong> of discovery,
            as required by 45 CFR § 164.410 (HIPAA Breach Notification Rule).
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Patient Rights Assistance:</h3>
          <p>
            Afilo will provide access to PHI in electronic health record format within <strong>30 days</strong> of Customer request
            to enable Customer to meet HIPAA patient access requirements (45 CFR § 164.524).
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Minimum Necessary:</h3>
          <p>
            Afilo will limit PHI use, disclosure, and requests to the minimum necessary to accomplish the intended purpose,
            as required by 45 CFR § 164.502(b).
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Subcontractors (HIPAA):</h3>
          <p>
            All Sub-Processors with access to PHI will execute Business Associate Agreements with equivalent HIPAA obligations.
          </p>

          <div className="bg-white rounded-lg p-4 mt-4">
            <p className="font-semibold">Request Business Associate Agreement (BAA):</p>
            <p className="text-sm mt-1">
              To execute a HIPAA BAA, contact: <a href="mailto:hipaa@techsci.io" className="text-blue-600 hover:underline">hipaa@techsci.io</a><br />
              BAA execution typically completed within <strong>5 business days</strong> of request.
            </p>
          </div>
        </div>
      </section>

      {/* Governing Law and Disputes */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Governing Law and Dispute Resolution</h2>

        <div className="space-y-4 text-gray-700">
          <p>
            This DPA is governed by the laws of the <strong>State of Delaware, United States</strong>, without regard to conflict of law principles.
          </p>

          <p>
            Any disputes arising from this DPA will be resolved in accordance with the dispute resolution procedures outlined
            in our <Link href="/legal/dispute-resolution" className="text-blue-600 hover:underline">Dispute Resolution Policy</Link>,
            including mandatory arbitration under the American Arbitration Association (AAA) rules.
          </p>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-semibold">Dispute Resolution Process:</p>
            <ol className="list-decimal pl-6 space-y-1 text-sm mt-2">
              <li>Informal resolution via support@techsci.io (30 days)</li>
              <li>Formal written complaint to legal@techsci.io (60 days)</li>
              <li>Mediation (optional, non-binding)</li>
              <li>Binding arbitration (mandatory, AAA rules, Delaware venue)</li>
            </ol>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Data Protection Contacts</h2>

        <div className="space-y-3 text-gray-700">
          <p>
            <strong>Data Protection Officer (DPO):</strong><br />
            Email: <a href="mailto:dpo@techsci.io" className="text-blue-600 hover:underline">dpo@techsci.io</a><br />
            Phone: +1 302 415 3171<br />
            Mail: TechSci, Inc. (operating the Afilo platform), 1111B S Governors Ave STE 34002, Dover, DE 19904
          </p>

          <p>
            <strong>Privacy Inquiries:</strong><br />
            Email: <a href="mailto:privacy@techsci.io" className="text-blue-600 hover:underline">privacy@techsci.io</a>
          </p>

          <p>
            <strong>Security Incidents:</strong><br />
            Email: <a href="mailto:security@techsci.io" className="text-blue-600 hover:underline">security@techsci.io</a><br />
            24/7 Hotline: +1 302 415 3171
          </p>

          <p>
            <strong>HIPAA BAA Requests:</strong><br />
            Email: <a href="mailto:hipaa@techsci.io" className="text-blue-600 hover:underline">hipaa@techsci.io</a>
          </p>

          <p>
            <strong>Compliance & Audit Requests:</strong><br />
            Email: <a href="mailto:compliance@techsci.io" className="text-blue-600 hover:underline">compliance@techsci.io</a>
          </p>
        </div>
      </section>

      {/* Amendment and Termination */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Amendment and Termination of DPA</h2>

        <div className="space-y-4 text-gray-700">
          <h3 className="text-xl font-semibold text-gray-900">Amendments:</h3>
          <p>
            Afilo may update this DPA from time to time to reflect changes in law, regulations, or business practices.
            Material changes will be communicated to Customer via email at least <strong>30 days</strong> before taking effect.
          </p>

          <p>
            Continued use of Afilo services after the effective date of changes constitutes acceptance of the updated DPA.
            If Customer does not agree to changes, Customer may terminate the subscription without penalty by providing
            written notice within 30 days of notification.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Termination:</h3>
          <p>
            This DPA remains in effect for the duration of the subscription and automatically terminates upon subscription cancellation,
            subject to data retention periods outlined in Section 8.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Survival:</h3>
          <p>
            The following provisions survive termination: Section 6 (Data Breach Notification), Section 8 (Data Retention and Deletion),
            Section 10 (Return and Deletion of Data), Section 11 (Liability and Indemnification).
          </p>
        </div>
      </section>

      {/* Entire Agreement */}
      <section className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Entire Agreement</h2>
        <p className="text-gray-700">
          This Data Processing Agreement, together with the{' '}
          <Link href="/legal/terms-of-service" className="text-blue-600 hover:underline">Terms of Service</Link>,{' '}
          <Link href="/legal/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link>, and any executed
          Business Associate Agreement (if HIPAA applicable), constitutes the entire agreement between Customer and Afilo
          regarding data processing and supersedes all prior or contemporaneous understandings.
        </p>

        <p className="text-gray-700 mt-4">
          In the event of conflict, the order of precedence is: (1) Business Associate Agreement (if executed), (2) Data Processing Agreement,
          (3) Terms of Service, (4) Privacy Policy.
        </p>
      </section>

      {/* Acknowledgment */}
      <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border-2 border-blue-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Acknowledgment</h2>
        <p className="text-gray-700">
          By using Afilo's services, Customer acknowledges that it has read, understood, and agrees to be bound by this Data Processing Agreement.
        </p>
        <p className="text-gray-700 mt-2 font-semibold">
          For questions about this DPA or to request a signed copy, contact:{' '}
          <a href="mailto:dpo@techsci.io" className="text-blue-600 hover:underline">dpo@techsci.io</a>
        </p>
      </section>
    </div>
  );
}
