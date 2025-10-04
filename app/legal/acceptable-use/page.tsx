import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Acceptable Use Policy | Afilo Enterprise',
  description: 'Prohibited activities and acceptable use guidelines for the Afilo platform',
};

export default function AcceptableUsePage() {
  return (
    <div className="space-y-8">
      {/* Introduction */}
      <section>
        <p className="text-gray-700 leading-relaxed mb-4">
          Effective Date: January 30, 2025
        </p>
        <p className="text-gray-700 leading-relaxed">
          This Acceptable Use Policy ("AUP") defines prohibited uses of the Afilo platform and services provided by
          TechSci, Inc. By using Afilo, you agree to comply with this policy and all applicable laws and regulations.
        </p>
      </section>

      {/* Section 1: Illegal Activities */}
      <section className="bg-red-50 border-l-4 border-red-600 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          1. Prohibited Illegal Activities
        </h2>
        <div className="space-y-3 text-gray-700">
          <p className="font-semibold">You may NOT use Afilo for any illegal purposes, including but not limited to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Fraud:</strong> Any fraudulent activity, deception, or misrepresentation</li>
            <li><strong>Money Laundering:</strong> Facilitating or engaging in money laundering activities</li>
            <li><strong>Terrorism/Extremism:</strong> Supporting, promoting, or financing terrorism or violent extremism</li>
            <li><strong>Malware Distribution:</strong> Creating, distributing, or hosting viruses, ransomware, trojans, or other malicious code</li>
            <li><strong>Hacking:</strong> Unauthorized access to computer systems, networks, or data</li>
            <li><strong>Phishing:</strong> Impersonating others to steal credentials or sensitive information</li>
            <li><strong>Intellectual Property Theft:</strong> Piracy, trademark infringement, copyright violation, or patent infringement</li>
            <li><strong>Identity Theft:</strong> Stealing or using another person's identity</li>
            <li><strong>Drug Trafficking:</strong> Facilitating illegal drug sales or distribution</li>
            <li><strong>Weapons Sales:</strong> Illegal sale of firearms, explosives, or weapons</li>
            <li><strong>Human Trafficking:</strong> Any involvement in human trafficking or exploitation</li>
          </ul>
        </div>
      </section>

      {/* Section 2: Abusive Behavior */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          2. Prohibited Abusive Behavior
        </h2>
        <div className="space-y-3 text-gray-700">
          <p>The following behaviors are strictly prohibited on the Afilo platform:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Harassment:</strong> Bullying, threatening, or intimidating other users or Afilo staff</li>
            <li><strong>Hate Speech:</strong> Content promoting hatred, discrimination, or violence based on:
              <ul className="list-disc pl-6 mt-1">
                <li>Race, ethnicity, national origin</li>
                <li>Religion or religious affiliation</li>
                <li>Gender, sexual orientation, gender identity</li>
                <li>Disability or medical condition</li>
                <li>Age or veteran status</li>
              </ul>
            </li>
            <li><strong>Spam:</strong> Sending unsolicited bulk messages, commercial advertisements, or repetitive content</li>
            <li><strong>Impersonation:</strong> Pretending to be another person, organization, or Afilo employee</li>
            <li><strong>Misrepresentation:</strong> Providing false, misleading, or deceptive information</li>
            <li><strong>Stalking:</strong> Persistent unwanted contact or monitoring of individuals</li>
            <li><strong>Doxxing:</strong> Publishing private information about individuals without consent</li>
          </ul>
        </div>
      </section>

      {/* Section 3: System Abuse */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          3. System Abuse and Security Violations
        </h2>
        <div className="space-y-3 text-gray-700">
          <p>You may NOT engage in the following activities:</p>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">API and Resource Abuse:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Excessive API Calls:</strong> Exceeding rate limits defined in your{' '}
              <Link href="/enterprise" className="text-blue-600 hover:underline">Enterprise Agreement</Link> (typically 100 requests/minute)</li>
            <li><strong>DDoS Attacks:</strong> Attempting to overwhelm our systems with traffic</li>
            <li><strong>Resource Hogging:</strong> Using excessive compute, storage, or bandwidth resources</li>
            <li><strong>Benchmarking:</strong> Competitive benchmarking or performance testing without written authorization</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Security Circumvention:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Bypass Security:</strong> Attempting to circumvent authentication, access controls, or encryption</li>
            <li><strong>Reverse Engineering:</strong> Decompiling, disassembling, or reverse engineering our software</li>
            <li><strong>Vulnerability Exploitation:</strong> Exploiting security vulnerabilities for unauthorized access (report to <a href="mailto:security@techsci.io" className="text-blue-600 hover:underline">security@techsci.io</a> instead)</li>
            <li><strong>Credential Sharing:</strong> Sharing login credentials or authentication tokens</li>
            <li><strong>Session Hijacking:</strong> Stealing or reusing session tokens</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Automated Abuse:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Scraping:</strong> Automated data scraping or crawling (except via approved APIs)</li>
            <li><strong>Bot Usage:</strong> Automated bot usage for non-approved purposes</li>
            <li><strong>Account Farming:</strong> Creating multiple accounts to abuse free trials or promotions</li>
          </ul>

          <div className="bg-blue-50 rounded-lg p-4 mt-4">
            <p className="font-semibold text-sm">Responsible Disclosure:</p>
            <p className="text-sm mt-1">
              If you discover a security vulnerability, please report it responsibly to{' '}
              <a href="mailto:security@techsci.io" className="text-blue-600 hover:underline">security@techsci.io</a>.
              We offer a bug bounty program for verified vulnerabilities.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Content Restrictions */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          4. Prohibited Content
        </h2>
        <div className="space-y-3 text-gray-700">
          <p>You may NOT upload, store, or share the following types of content:</p>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Illegal Content:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Child Exploitation Material (CSAM):</strong> Any content involving minors in sexual or exploitative situations (zero tolerance - immediate account termination and law enforcement reporting)</li>
            <li><strong>Illegal Drugs:</strong> Content promoting or facilitating illegal drug sales</li>
            <li><strong>Weapons:</strong> Content facilitating illegal weapons sales</li>
            <li><strong>Stolen Goods:</strong> Content related to stolen property or theft</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Adult Content:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Pornography:</strong> Sexually explicit or pornographic material</li>
            <li><strong>Adult Services:</strong> Escort services, prostitution, or adult entertainment</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Violent Content:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Violence Promotion:</strong> Content promoting, glorifying, or inciting violence</li>
            <li><strong>Terrorism:</strong> Terrorist propaganda or recruitment materials</li>
            <li><strong>Self-Harm:</strong> Content promoting suicide or self-harm</li>
            <li><strong>Gore:</strong> Graphic violence or disturbing imagery (except legitimate medical/educational use)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Fraudulent Content:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Scams:</strong> Pyramid schemes, Ponzi schemes, or other fraudulent schemes</li>
            <li><strong>Counterfeit Goods:</strong> Fake or counterfeit products</li>
            <li><strong>False Information:</strong> Deliberately false or misleading content causing harm</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Rights Violations:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Copyright Infringement:</strong> Unauthorized copyrighted content (see{' '}
              <a href="#dmca" className="text-blue-600 hover:underline">DMCA section</a>)</li>
            <li><strong>Trademark Infringement:</strong> Unauthorized use of trademarks or brand names</li>
            <li><strong>Privacy Violations:</strong> Content violating others' privacy rights</li>
          </ul>
        </div>
      </section>

      {/* Section 5: Enterprise-Specific Restrictions */}
      <section className="bg-yellow-50 border-l-4 border-yellow-600 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          5. Enterprise-Specific Restrictions
        </h2>
        <div className="space-y-3 text-gray-700">
          <p>The following restrictions apply to enterprise customers:</p>

          <ul className="list-disc pl-6 space-y-2">
            <li><strong>No Reselling:</strong> You may not resell, sublicense, or redistribute platform access without written authorization from Afilo</li>
            <li><strong>Credential Security:</strong> You may not share enterprise credentials outside authorized users listed in your account</li>
            <li><strong>License Limits:</strong> You must not exceed purchased license limits:
              <ul className="list-disc pl-6 mt-1">
                <li>User seats (number of active users)</li>
                <li>Storage capacity (GB/TB limits)</li>
                <li>API call limits (requests per minute/month)</li>
                <li>Compute resources (processing power)</li>
              </ul>
            </li>
            <li><strong>Competitive Use:</strong> You may not use Afilo for competitive benchmarking, analysis, or to develop competing products without prior written consent</li>
            <li><strong>Data Isolation:</strong> Agencies and consultants must maintain data isolation between client accounts (no cross-contamination)</li>
          </ul>
        </div>
      </section>

      {/* Section 6: Data Restrictions */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          6. Data Processing Restrictions
        </h2>
        <div className="space-y-3 text-gray-700">
          <p>You must comply with the following data restrictions:</p>

          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Privacy Laws:</strong> Do not upload data violating privacy laws (HIPAA, CCPA, PIPEDA, etc.) unless you have proper authorization and a signed{' '}
              <Link href="/legal/data-processing" className="text-blue-600 hover:underline">Data Processing Agreement</Link></li>
            <li><strong>Unauthorized Personal Data:</strong> Do not process personal data without proper legal basis and consent</li>
            <li><strong>HIPAA Compliance:</strong> For healthcare customers:
              <ul className="list-disc pl-6 mt-1">
                <li>You must have a signed Business Associate Agreement (BAA) before processing PHI</li>
                <li>Contact <a href="mailto:hipaa@techsci.io" className="text-blue-600 hover:underline">hipaa@techsci.io</a> to request BAA</li>
                <li>Without BAA, do NOT upload Protected Health Information</li>
              </ul>
            </li>
            <li><strong>Purpose Limitation:</strong> Use data only for stated purposes in your agreement with Afilo</li>
            <li><strong>EU/EEA Data:</strong> As stated in our{' '}
              <Link href="/legal/privacy-policy#geographic-restrictions" className="text-blue-600 hover:underline">Privacy Policy</Link>,
              we do not serve EU/EEA customers. Do not process EU/EEA personal data on our platform.</li>
          </ul>
        </div>
      </section>

      {/* Enforcement Actions */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          7. Enforcement Actions
        </h2>
        <div className="space-y-4 text-gray-700">
          <h3 className="text-xl font-semibold text-gray-900">Warning System (Progressive Discipline):</h3>

          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div>
              <p className="font-semibold">First Violation:</p>
              <ul className="list-disc pl-6 text-sm mt-1">
                <li>Written warning via email</li>
                <li>48-hour correction period to remedy violation</li>
                <li>Technical guidance provided if applicable</li>
                <li>Violation documented in account record</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold">Second Violation:</p>
              <ul className="list-disc pl-6 text-sm mt-1">
                <li>Temporary account suspension (7-30 days depending on severity)</li>
                <li>Required acknowledgment of AUP before reinstatement</li>
                <li>Possible account restrictions or monitoring</li>
                <li>Escalation to account management team</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold">Third Violation:</p>
              <ul className="list-disc pl-6 text-sm mt-1">
                <li>Permanent account termination</li>
                <li>No refund of remaining subscription balance</li>
                <li>30-day data export window (then permanent deletion)</li>
                <li>Ban from creating new Afilo accounts</li>
              </ul>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mt-6">Immediate Termination (No Warning):</h3>
          <div className="bg-red-50 border-l-4 border-red-600 p-4">
            <p className="font-semibold mb-2">The following violations result in IMMEDIATE account termination:</p>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li><strong>Illegal Activities:</strong> Any illegal activity (reported to law enforcement)</li>
              <li><strong>Security Threats:</strong> Hacking attempts, malware distribution, DDoS attacks</li>
              <li><strong>CSAM:</strong> Any child exploitation material (reported to NCMEC and law enforcement)</li>
              <li><strong>Terrorism:</strong> Terrorism-related activities or content</li>
              <li><strong>Fraud:</strong> Fraudulent activity or financial crimes</li>
              <li><strong>Extreme Violence:</strong> Extreme violations threatening safety or causing harm</li>
            </ul>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mt-6">Investigation Process:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>We reserve the right to investigate suspected AUP violations</li>
            <li>We may access account data as necessary for investigation (with notice unless legally prohibited)</li>
            <li>We may suspend accounts pending investigation to protect other users and system integrity</li>
            <li>You must cooperate with investigations (failure to cooperate may result in termination)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-6">Appeal Process:</h3>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Submit appeal to <a href="mailto:appeals@techsci.io" className="text-blue-600 hover:underline">appeals@techsci.io</a> within 14 days of enforcement action</li>
            <li>Include:
              <ul className="list-disc pl-6 mt-1">
                <li>Account email</li>
                <li>Copy of violation notice</li>
                <li>Detailed explanation of circumstances</li>
                <li>Evidence supporting your appeal</li>
              </ul>
            </li>
            <li>Review completed within 10 business days</li>
            <li>Decision is final (no further appeals)</li>
          </ol>
        </div>
      </section>

      {/* Reporting Violations */}
      <section className="bg-green-50 border-l-4 border-green-600 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          8. Reporting AUP Violations
        </h2>
        <div className="space-y-4 text-gray-700">
          <h3 className="text-xl font-semibold text-gray-900">How to Report:</h3>
          <p>If you become aware of AUP violations by other users:</p>

          <ol className="list-decimal pl-6 space-y-2">
            <li><strong>Email:</strong> <a href="mailto:abuse@techsci.io" className="text-blue-600 hover:underline">abuse@techsci.io</a></li>
            <li><strong>Include in Your Report:</strong>
              <ul className="list-disc pl-6 mt-1 space-y-1">
                <li>Your contact information (optional for anonymity, but helpful for follow-up)</li>
                <li>Account or user engaging in violation (if known)</li>
                <li>Detailed description of the violation</li>
                <li>Evidence: screenshots, URLs, timestamps, email headers, etc.</li>
                <li>Specific AUP section being violated</li>
                <li>Impact or harm caused (if applicable)</li>
              </ul>
            </li>
            <li><strong>Response Timeline:</strong>
              <ul className="list-disc pl-6 mt-1">
                <li>Acknowledgment within 24 hours</li>
                <li>Investigation within 3-5 business days</li>
                <li>Action taken (if warranted) within 7 business days</li>
              </ul>
            </li>
          </ol>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Protection for Reporters:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>We do not retaliate against good-faith reporters of AUP violations</li>
            <li>Reporter identity kept confidential (except where legally required to disclose)</li>
            <li>False reports made in bad faith may result in account action against the reporter</li>
          </ul>
        </div>
      </section>

      {/* DMCA Compliance */}
      <section id="dmca">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          9. Copyright Infringement (DMCA)
        </h2>
        <div className="space-y-4 text-gray-700">
          <p>
            Afilo complies with the Digital Millennium Copyright Act (DMCA). We respond to valid copyright infringement notices.
          </p>

          <h3 className="text-xl font-semibold text-gray-900">Designated DMCA Agent:</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-semibold">TechSci, Inc. - DMCA Agent</p>
            <p className="text-sm mt-1">
              Email: <a href="mailto:dmca@techsci.io" className="text-blue-600 hover:underline">dmca@techsci.io</a><br />
              Mailing Address:<br />
              TechSci, Inc. - DMCA Agent<br />
              1111B S Governors Ave STE 34002<br />
              Dover, DE 19904, United States
            </p>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">DMCA Notice Requirements (per 17 U.S.C. § 512(c)):</h3>
          <p>To file a valid DMCA takedown notice, include:</p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Physical or electronic signature of copyright owner or authorized agent</li>
            <li>Identification of copyrighted work claimed to be infringed</li>
            <li>Identification of infringing material (URL or specific location in our system)</li>
            <li>Your contact information (address, phone number, email)</li>
            <li>Statement of good faith belief that use is unauthorized</li>
            <li>Statement of accuracy under penalty of perjury that you are authorized to act</li>
          </ol>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Our Response:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>We will investigate within 3 business days</li>
            <li>We will remove/disable access to allegedly infringing material upon valid notice</li>
            <li>We will notify the user who posted the content</li>
            <li>User may submit counter-notice per DMCA procedures</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Repeat Infringers:</h3>
          <p className="font-semibold">
            Accounts with <strong>3 or more valid DMCA complaints</strong> will be permanently terminated.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Trademark Infringement:</h3>
          <p>
            Report trademark infringement to <a href="mailto:legal@techsci.io" className="text-blue-600 hover:underline">legal@techsci.io</a> with:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Proof of trademark ownership (registration certificate)</li>
            <li>Description of infringement and location</li>
            <li>Contact information</li>
          </ul>
        </div>
      </section>

      {/* User Content Responsibility */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          10. User-Generated Content Responsibility
        </h2>
        <div className="space-y-3 text-gray-700">
          <p className="font-semibold">
            You are solely responsible for all content you upload, create, or share via the Afilo platform.
          </p>

          <ul className="list-disc pl-6 space-y-2">
            <li>Afilo is not responsible for user-generated content</li>
            <li>We reserve the right to remove content violating this AUP without prior notice</li>
            <li>We do not actively monitor all user content</li>
            <li>Automated systems may flag potentially violating content for review</li>
            <li>We respond to user reports and legal requests</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Content Backup:</h3>
          <p>
            We are <strong>not responsible</strong> for backing up your content. Maintain your own backups.
            Deleted content may be unrecoverable after 90 days.
          </p>
        </div>
      </section>

      {/* Policy Updates */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          11. Changes to This Policy
        </h2>
        <p className="text-gray-700">
          We may update this Acceptable Use Policy at any time to reflect new threats, legal requirements, or service changes.
          Material changes will be notified via email with 14 days' notice. Continued use after changes constitutes acceptance.
        </p>
      </section>

      {/* Contact */}
      <section className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          12. Contact Information
        </h2>
        <div className="grid md:grid-cols-2 gap-4 text-gray-700 text-sm">
          <div>
            <p className="font-semibold">General Questions:</p>
            <p><a href="mailto:support@techsci.io" className="text-blue-600 hover:underline">support@techsci.io</a></p>
          </div>
          <div>
            <p className="font-semibold">Report AUP Violations:</p>
            <p><a href="mailto:abuse@techsci.io" className="text-blue-600 hover:underline">abuse@techsci.io</a></p>
          </div>
          <div>
            <p className="font-semibold">Copyright (DMCA):</p>
            <p><a href="mailto:dmca@techsci.io" className="text-blue-600 hover:underline">dmca@techsci.io</a></p>
          </div>
          <div>
            <p className="font-semibold">Legal/Trademark:</p>
            <p><a href="mailto:legal@techsci.io" className="text-blue-600 hover:underline">legal@techsci.io</a></p>
          </div>
        </div>
      </section>
    </div>
  );
}
