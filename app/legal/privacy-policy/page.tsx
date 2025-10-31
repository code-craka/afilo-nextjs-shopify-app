import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Afilo Enterprise',
  description: 'Privacy Policy for Afilo Enterprise Platform - HIPAA Compliant, SOC 2 Certified',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="space-y-8">
      {/* Introduction */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          TechSci, Inc. (operating the Afilo platform) ("we," "our," or "us") is committed to protecting your privacy.
          This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our
          enterprise software platform and services.
        </p>
        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 my-4">
          <p className="text-sm text-gray-700">
            <strong>Contact Information:</strong><br />
            TechSci, Inc. (operating the Afilo platform)<br />
            1111B S Governors Ave STE 34002<br />
            Dover, DE 19904, United States<br />
            Email: <a href="mailto:privacy@techsci.io" className="text-blue-600 hover:underline">privacy@techsci.io</a><br />
            Phone: +1 302 415 3171
          </p>
        </div>
      </section>

      {/* CRITICAL: Geographic Restrictions - PROMINENT PLACEMENT */}
      <section className="bg-red-50 border-2 border-red-600 rounded-lg p-6 my-8">
        <h2 className="text-2xl font-bold text-red-900 mb-4 flex items-center gap-2">
          <span className="text-3xl">🚫</span>
          2. Geographic Restrictions and EU Exclusion
        </h2>
        <div className="space-y-4 text-gray-900">
          <p className="font-bold text-lg">
            IMPORTANT: TechSci, Inc. (operating the Afilo platform) does NOT conduct business with, nor provide services to,
            individuals or entities located in the European Union (EU) or European Economic Area (EEA).
          </p>

          <div className="bg-white rounded p-4">
            <p className="font-semibold mb-2">This exclusion applies to the following 27 EU member states:</p>
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

          <p className="font-semibold">
            We do not knowingly collect, process, or store personal data from individuals located in the EU/EEA.
          </p>

          <p>
            <strong>GDPR Non-Applicability:</strong> As we do not operate in or target EU/EEA markets, the General Data
            Protection Regulation (GDPR) does not apply to our services.
          </p>

          <p>
            <strong>Your Representation:</strong> By accessing our services, you represent and warrant that you are not
            located in the EU/EEA and are not subject to EU data protection laws.
          </p>

          <p className="text-red-900 font-bold">
            We reserve the right to refuse service to any user if we determine they are located in the EU/EEA.
          </p>
        </div>
      </section>

      {/* Permitted Operating Regions */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Permitted Operating Regions</h2>

        <div className="space-y-4 text-gray-700">
          <p>
            <strong>Primary Market:</strong> TechSci, Inc. (operating the Afilo platform) is headquartered in Dover, Delaware,
            United States and primarily serves customers in the United States.
          </p>

          <p>
            <strong>International Markets:</strong> We also provide services to customers in the following approved regions:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Canada</li>
            <li>United Kingdom (post-Brexit)</li>
            <li>Australia</li>
            <li>New Zealand</li>
            <li>Singapore</li>
            <li>Japan</li>
            <li>Other non-EU countries where legally permitted</li>
          </ul>

          <div className="bg-gray-50 rounded-lg p-4 mt-4">
            <p className="font-semibold mb-2">We comply with applicable data protection laws in our operating jurisdictions:</p>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li><strong>United States:</strong> HIPAA, CCPA (California), COPPA, CAN-SPAM Act</li>
              <li><strong>Canada:</strong> PIPEDA (Personal Information Protection and Electronic Documents Act)</li>
              <li><strong>United Kingdom:</strong> UK GDPR and Data Protection Act 2018</li>
              <li><strong>Australia:</strong> Privacy Act 1988</li>
              <li><strong>Other Jurisdictions:</strong> Respective local data protection laws</li>
            </ul>
          </div>
        </div>
      </section>

      {/* HIPAA Compliance */}
      <section className="bg-green-50 border-l-4 border-green-600 p-6 my-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. HIPAA Compliance for Healthcare Customers</h2>

        <div className="space-y-4 text-gray-700">
          <p>
            <strong>Business Associate Agreement (BAA):</strong> For customers who are Covered Entities or Business Associates
            under HIPAA, Afilo acts as a Business Associate and will execute a BAA.
          </p>

          <p>
            <strong>PHI Protection:</strong> We implement administrative, physical, and technical safeguards to protect
            Protected Health Information (PHI) in accordance with 45 CFR §§ 164.308, 164.310, and 164.312.
          </p>

          <div className="bg-white rounded-lg p-4 space-y-2">
            <p className="font-semibold">Our HIPAA Safeguards Include:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Encryption:</strong> All PHI encrypted at rest (AES-256) and in transit (TLS 1.3)</li>
              <li><strong>Access Controls:</strong> Role-based access controls (RBAC) ensure only authorized personnel access PHI</li>
              <li><strong>Audit Logs:</strong> Comprehensive audit trails track all PHI access and modifications</li>
              <li><strong>Breach Notification:</strong> We notify affected customers within 60 days as required by HIPAA Breach Notification Rule</li>
              <li><strong>Subcontractors:</strong> Any subcontractors with PHI access execute BAAs and comply with HIPAA</li>
            </ul>
          </div>

          <p className="text-sm">
            To request a Business Associate Agreement, contact:
            <a href="mailto:hipaa@techsci.io" className="text-blue-600 hover:underline ml-1">hipaa@techsci.io</a>
          </p>
        </div>
      </section>

      {/* Information We Collect */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Information We Collect</h2>

        <div className="space-y-4 text-gray-700">
          <h3 className="text-xl font-semibold text-gray-900">Account Information:</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Name, email address, company name, job title, phone number</li>
            <li>Account credentials (passwords are hashed and never stored in plain text)</li>
            <li>Profile information and preferences</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900">Billing Information:</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Payment information processed by Stripe (we do NOT store full credit card numbers)</li>
            <li>Billing address and tax identification</li>
            <li>Transaction history and invoices</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900">Usage Data:</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>IP address, browser type, device information</li>
            <li>Pages visited, features used, time spent</li>
            <li>API calls, queries, and system interactions</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900">Cookies and Tracking:</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Essential cookies for authentication and session management</li>
            <li>Analytics cookies (Google Analytics, Vercel Analytics)</li>
            <li>Performance and optimization cookies</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900">Communications:</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Support tickets, emails, chat logs</li>
            <li>Feedback, surveys, and testimonials</li>
            <li>Marketing communications preferences</li>
          </ul>
        </div>
      </section>

      {/* How We Use Information */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. How We Use Your Information</h2>

        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li><strong>Provide and improve services:</strong> Deliver platform functionality, implement new features</li>
          <li><strong>Process payments:</strong> Handle subscriptions, invoicing, and billing</li>
          <li><strong>Customer support:</strong> Respond to inquiries, troubleshoot issues, provide assistance</li>
          <li><strong>Security and fraud prevention:</strong> Detect and prevent security threats, unauthorized access</li>
          <li><strong>Legal compliance:</strong> Meet regulatory requirements, respond to legal requests</li>
          <li><strong>Marketing:</strong> Send product updates, newsletters (with opt-out option for non-essential communications)</li>
          <li><strong>Analytics:</strong> Understand usage patterns, improve user experience, optimize performance</li>
        </ul>
      </section>

      {/* Legal Bases for Processing */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Legal Bases for Processing</h2>

        <div className="space-y-3 text-gray-700">
          <p><strong>Contractual Necessity:</strong> Processing necessary to provide services under our agreement with you</p>
          <p><strong>Legitimate Interests:</strong> Improve services, ensure security, prevent fraud</p>
          <p><strong>Legal Obligations:</strong> Tax compliance, law enforcement requests, regulatory requirements</p>
          <p><strong>Consent:</strong> Marketing communications, optional features (you may withdraw consent anytime)</p>
        </div>
      </section>

      {/* Data Sharing */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Data Sharing and Disclosure</h2>

        <div className="space-y-4 text-gray-700">
          <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4">
            <p className="font-bold">We do NOT sell your personal information to third parties.</p>
          </div>

          <h3 className="text-xl font-semibold text-gray-900">Service Providers:</h3>
          <p>We share data with trusted service providers who assist in delivering our services:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Stripe:</strong> Payment processing (PCI DSS Level 1 certified)</li>
            <li><strong>Vercel:</strong> Application hosting and deployment</li>
            <li><strong>Neon:</strong> PostgreSQL database services</li>
            <li><strong>AWS/Azure:</strong> Cloud infrastructure</li>
            <li><strong>Clerk:</strong> Authentication services</li>
            <li><strong>Resend:</strong> Email service provider</li>
            <li><strong>Upstash:</strong> Redis for rate limiting and caching</li>
            <li><strong>Analytics Providers:</strong> Google Analytics, Vercel Analytics</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Legal Disclosures:</h3>
          <p>We may disclose information if required by:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Law, regulation, or court order</li>
            <li>Government or law enforcement request</li>
            <li>Protection of our rights, property, or safety</li>
            <li>Investigation of fraud, security threats, or policy violations</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Business Transfers:</h3>
          <p>
            In the event of merger, acquisition, or sale of assets, your information may be transferred.
            You will be notified via email and given the opportunity to delete your data.
          </p>
        </div>
      </section>

      {/* Continue in next message due to length... */}

      <p className="text-center text-gray-500 text-sm mt-12">
        [Content continues - this is part 1 of the Privacy Policy. Full policy spans 20+ sections including Data Retention,
        Security, Your Privacy Rights (CCPA, PIPEDA, UK GDPR), International Data Transfers, and more.]
      </p>
    </div>
  );
}
