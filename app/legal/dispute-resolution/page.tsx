import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Dispute Resolution Policy | Afilo Enterprise',
  description: 'Dispute resolution process including mandatory arbitration and class action waiver',
};

export default function DisputeResolutionPage() {
  return (
    <div className="space-y-8">
      {/* Introduction */}
      <section>
        <p className="text-gray-700 leading-relaxed mb-4">
          Effective Date: January 30, 2025
        </p>
        <p className="text-gray-700 leading-relaxed">
          This Dispute Resolution Policy outlines the process for resolving disputes between you and TechSci, Inc.
          (operating the Afilo platform) regarding our services, billing, or any other matter arising from your use
          of the Afilo platform.
        </p>
      </section>

      {/* Step 1: Informal Resolution */}
      <section className="bg-blue-50 border-l-4 border-blue-600 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Step 1: Contact Customer Support (Required First Step)
        </h2>
        <div className="space-y-4 text-gray-700">
          <p className="font-semibold">
            Before initiating formal dispute resolution, you MUST contact our support team to resolve the issue informally.
          </p>

          <h3 className="text-xl font-semibold text-gray-900">Contact Methods:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Email:</strong> <a href="mailto:disputes@techsci.io" className="text-blue-600 hover:underline">disputes@techsci.io</a></li>
            <li><strong>Phone:</strong> +1 302 415 3171 (Mon-Fri, 9am-6pm ET)</li>
            <li><strong>Live Chat:</strong> Available at <a href="https://app.afilo.io" className="text-blue-600 hover:underline">app.afilo.io</a> (Mon-Fri, 9am-6pm ET)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Response Timeline:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Initial Response:</strong> Within 2 business days</li>
            <li><strong>Resolution Attempt:</strong> We will make good-faith efforts to resolve disputes within 15 business days</li>
            <li><strong>Status Updates:</strong> Regular updates provided throughout investigation</li>
          </ul>

          <div className="bg-white rounded-lg p-4 mt-4">
            <p className="text-sm">
              <strong>Include in Your Initial Contact:</strong>
            </p>
            <ul className="list-disc pl-6 text-sm mt-2 space-y-1">
              <li>Your name and account email address</li>
              <li>Detailed description of the dispute</li>
              <li>Relevant dates, transaction IDs, or invoice numbers</li>
              <li>Supporting documentation (emails, screenshots, etc.)</li>
              <li>Your desired resolution</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Step 2: Formal Dispute Submission */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Step 2: Formal Dispute Submission
        </h2>
        <div className="space-y-4 text-gray-700">
          <p>
            If informal resolution fails or you are not satisfied with the response, you may submit a formal written dispute.
          </p>

          <h3 className="text-xl font-semibold text-gray-900">Submission Process:</h3>
          <ol className="list-decimal pl-6 space-y-3">
            <li>
              <strong>Send Written Notice to:</strong> <a href="mailto:legal@techsci.io" className="text-blue-600 hover:underline">legal@techsci.io</a>
              <br />
              Subject Line: "Formal Dispute - [Your Account Email]"
            </li>
            <li>
              <strong>Include All Required Information:</strong>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Full legal name and contact information (address, phone, email)</li>
                <li>Account email associated with your Afilo subscription</li>
                <li>Detailed description of the dispute (include timeline of events)</li>
                <li>All relevant documentation and evidence</li>
                <li>Previous support ticket numbers from Step 1</li>
                <li>Specific remedy or resolution you are seeking</li>
                <li>Dollar amount in dispute (if applicable)</li>
              </ul>
            </li>
            <li>
              <strong>Acknowledgment:</strong> We will acknowledge receipt within 3 business days
            </li>
            <li>
              <strong>Investigation:</strong> We will investigate and respond with a proposed resolution within 30 days
            </li>
          </ol>

          <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 mt-4">
            <p className="font-semibold">Important Notice:</p>
            <p className="text-sm mt-1">
              Your formal dispute submission preserves your right to proceed to mediation or arbitration if we cannot
              reach a resolution. Keep copies of all correspondence.
            </p>
          </div>
        </div>
      </section>

      {/* Step 3: Mediation (Optional) */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Step 3: Mediation (Optional, Non-Binding)
        </h2>
        <div className="space-y-4 text-gray-700">
          <p>
            If formal escalation does not resolve the dispute, either party may request <strong>voluntary mediation</strong>
            before proceeding to arbitration.
          </p>

          <h3 className="text-xl font-semibold text-gray-900">Mediation Terms:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Mediation Provider:</strong> American Arbitration Association (AAA) or JAMS</li>
            <li><strong>Location:</strong> Conducted virtually via video conference or in Dover, Delaware</li>
            <li><strong>Cost Sharing:</strong>
              <ul className="list-disc pl-6 mt-1">
                <li>Each party bears their own legal fees and costs</li>
                <li>Mediator fees split 50/50 between parties</li>
              </ul>
            </li>
            <li><strong>Timeline:</strong> Mediation must be completed within 60 days of request</li>
            <li><strong>Non-Binding:</strong> Mediation is non-binding; either party may proceed to arbitration if unsuccessful</li>
            <li><strong>Confidentiality:</strong> All mediation communications are confidential and inadmissible in arbitration</li>
          </ul>
        </div>
      </section>

      {/* Step 4: MANDATORY ARBITRATION */}
      <section className="bg-red-50 border-2 border-red-600 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-red-900 mb-4 flex items-center gap-2">
          <span className="text-3xl">⚖️</span>
          Step 4: Binding Arbitration (MANDATORY)
        </h2>
        <div className="space-y-4 text-gray-900">
          <div className="bg-white rounded-lg p-4 border-2 border-red-600">
            <p className="font-bold text-lg uppercase mb-2">MANDATORY ARBITRATION CLAUSE</p>
            <p className="text-sm">
              ANY DISPUTES THAT CANNOT BE RESOLVED THROUGH INFORMAL RESOLUTION, FORMAL ESCALATION, OR MEDIATION
              SHALL BE RESOLVED BY <strong>BINDING ARBITRATION</strong>, NOT IN COURT. YOU AND AFILO AGREE TO
              WAIVE YOUR RIGHT TO A JURY TRIAL OR TO PARTICIPATE IN A CLASS ACTION.
            </p>
          </div>

          <h3 className="text-xl font-semibold text-gray-900">Arbitration Rules & Procedures:</h3>

          <div className="space-y-3">
            <p>
              <strong>Arbitration Provider:</strong> American Arbitration Association (AAA) under its
              <a href="https://www.adr.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                Commercial Arbitration Rules
              </a>
            </p>

            <p>
              <strong>Location:</strong> Dover, Delaware, United States (Afilo headquarters jurisdiction) or virtual/remote arbitration
            </p>

            <p>
              <strong>Governing Law:</strong> This agreement and arbitration are governed by the laws of the
              <strong> State of Delaware</strong>, United States, without regard to conflict of law principles,
              and the Federal Arbitration Act (FAA).
            </p>

            <p>
              <strong>Number of Arbitrators:</strong> One (1) neutral arbitrator mutually agreed upon by both parties,
              or appointed by AAA if parties cannot agree
            </p>

            <p>
              <strong>Language:</strong> All proceedings conducted in English
            </p>

            <p>
              <strong>Discovery:</strong> Limited discovery as determined by the arbitrator (typically document exchange
              and depositions of key witnesses)
            </p>

            <p>
              <strong>Hearing:</strong> In-person or virtual hearing at arbitrator's discretion
            </p>

            <p>
              <strong>Decision Timeline:</strong> Arbitrator must issue written decision within 30 days of hearing conclusion
            </p>

            <p>
              <strong>Arbitrator's Decision:</strong> The arbitrator's decision is <strong>FINAL and BINDING</strong> on both parties
              and may be entered as a judgment in any court of competent jurisdiction
            </p>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mt-6">Cost Allocation:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Filing Fees:</strong> Initial AAA filing fees paid by the party initiating arbitration</li>
            <li><strong>Arbitrator Fees:</strong> Split equally between parties unless arbitrator rules otherwise</li>
            <li><strong>Legal Fees:</strong> Each party bears their own attorney fees and legal costs</li>
            <li><strong>Exception:</strong> Arbitrator may award attorney fees and costs to the prevailing party if:
              <ul className="list-disc pl-6 mt-1">
                <li>Claim is found to be frivolous or in bad faith</li>
                <li>Applicable law provides for fee shifting</li>
                <li>Contract terms allow for fee recovery</li>
              </ul>
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-6">Scope of Arbitration:</h3>
          <p>The following disputes MUST be resolved through arbitration:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Contract disputes related to Terms of Service or this Dispute Resolution Policy</li>
            <li>Billing and payment disputes (except small claims court eligible amounts)</li>
            <li>Service quality, performance, or availability disputes</li>
            <li>Data privacy or security breach claims</li>
            <li>Intellectual property disputes (trademark, copyright)</li>
            <li>Any other claims arising from your use of Afilo services</li>
          </ul>
        </div>
      </section>

      {/* CLASS ACTION WAIVER */}
      <section className="bg-orange-50 border-2 border-orange-600 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-orange-900 mb-4 flex items-center gap-2">
          <span className="text-3xl">🚫</span>
          Class Action Waiver (IMPORTANT)
        </h2>
        <div className="space-y-4 text-gray-900">
          <div className="bg-white rounded-lg p-4 border-2 border-orange-600">
            <p className="font-bold text-lg uppercase mb-3">WAIVER OF CLASS ACTIONS AND CLASS ARBITRATIONS</p>
            <p className="mb-3">
              <strong>YOU AND AFILO AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL
              CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS OR REPRESENTATIVE PROCEEDING.</strong>
            </p>
            <p className="text-sm">
              This means you cannot participate in a class action lawsuit or class-wide arbitration against Afilo.
              All disputes must be brought individually.
            </p>
          </div>

          <h3 className="text-xl font-semibold text-gray-900">Specific Terms:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>No Class Actions:</strong> You waive your right to participate in any class action lawsuit against Afilo</li>
            <li><strong>No Class Arbitrations:</strong> The arbitrator may not consolidate more than one person's claims</li>
            <li><strong>No Representative Actions:</strong> You may not bring claims on behalf of other users or the general public</li>
            <li><strong>No Joinder:</strong> Multiple users cannot join their individual claims into a single arbitration</li>
            <li><strong>Individual Relief Only:</strong> The arbitrator may award relief only to the individual party seeking relief</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Opt-Out Right:</h3>
          <div className="bg-white rounded-lg p-4">
            <p className="font-semibold mb-2">You may opt out of this arbitration agreement and class action waiver:</p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li><strong>Deadline:</strong> Within <strong>30 days</strong> of creating your Afilo account or accepting updated terms</li>
              <li><strong>Method:</strong> Send written notice via email to <a href="mailto:optout@techsci.io" className="text-blue-600 hover:underline">optout@techsci.io</a></li>
              <li><strong>Required Information:</strong>
                <ul className="list-disc pl-6 mt-1">
                  <li>Your full name and account email</li>
                  <li>Statement: "I opt out of the arbitration agreement and class action waiver"</li>
                  <li>Date of account creation</li>
                </ul>
              </li>
              <li><strong>Effect of Opt-Out:</strong> If you opt out, you may pursue claims in court (subject to applicable jurisdiction and venue rules),
                but you still waive the right to participate in class actions</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Small Claims Court Exception */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Small Claims Court Exception
        </h2>
        <div className="space-y-4 text-gray-700">
          <p>
            <strong>Notwithstanding the mandatory arbitration clause</strong>, either party may bring an individual action
            in small claims court if the claim qualifies under small claims court rules.
          </p>

          <h3 className="text-xl font-semibold text-gray-900">Small Claims Eligibility:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Amount in Controversy:</strong> Must be within small claims court jurisdictional limits (typically $5,000-$10,000 depending on state)</li>
            <li><strong>Jurisdiction:</strong> Small claims court in Sussex County, Delaware OR your county of residence</li>
            <li><strong>Individual Claims Only:</strong> Must be individual claim, not class or representative action</li>
            <li><strong>Appeal Rights:</strong> Either party may remove case to arbitration on appeal</li>
          </ul>
        </div>
      </section>

      {/* Injunctive Relief */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Injunctive Relief and Intellectual Property
        </h2>
        <div className="space-y-4 text-gray-700">
          <p>
            Nothing in this Dispute Resolution Policy prevents either party from seeking <strong>injunctive or equitable relief</strong>
            in court to protect:
          </p>

          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Intellectual Property Rights:</strong> Trademarks, copyrights, patents, trade secrets</li>
            <li><strong>Confidential Information:</strong> Proprietary business information, customer data</li>
            <li><strong>Unauthorized Access:</strong> Security breaches, hacking attempts</li>
            <li><strong>Irreparable Harm:</strong> Situations where monetary damages are inadequate</li>
          </ul>

          <p className="mt-4">
            Such actions may be brought in state or federal courts in Delaware or where the party seeking relief is located.
          </p>
        </div>
      </section>

      {/* Billing Disputes */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Billing and Payment Disputes
        </h2>
        <div className="space-y-4 text-gray-700">
          <h3 className="text-xl font-semibold text-gray-900">Chargeback Prevention:</h3>
          <div className="bg-red-50 border-l-4 border-red-600 p-4">
            <p className="font-semibold mb-2">⚠️ IMPORTANT: Contact us BEFORE filing a chargeback</p>
            <p className="text-sm">
              If you dispute a charge with your bank or credit card company before contacting us, your account will be
              <strong> immediately suspended</strong> pending investigation. Chargebacks may result in:
            </p>
            <ul className="list-disc pl-6 text-sm mt-2 space-y-1">
              <li>Permanent account termination</li>
              <li>$25 chargeback processing fee</li>
              <li>Reporting to fraud prevention databases</li>
              <li>Legal action to recover amounts owed</li>
            </ul>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mt-4">Proper Billing Dispute Process:</h3>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Contact <a href="mailto:billing@techsci.io" className="text-blue-600 hover:underline">billing@techsci.io</a> with:
              <ul className="list-disc pl-6 mt-1">
                <li>Invoice number and transaction date</li>
                <li>Description of disputed charge</li>
                <li>Evidence of error (duplicate charge, incorrect amount, unauthorized transaction)</li>
              </ul>
            </li>
            <li>We will investigate within 5 business days</li>
            <li>Legitimate billing errors corrected within 7 business days with refund issued</li>
            <li>If dispute unresolved, follow Steps 1-4 of this Dispute Resolution Policy</li>
          </ol>
        </div>
      </section>

      {/* Data Disputes */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Data Privacy and Security Disputes
        </h2>
        <div className="space-y-4 text-gray-700">
          <p>
            For disputes related to data privacy, security, or your rights under our{' '}
            <Link href="/legal/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link>:
          </p>

          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Data Deletion Requests:</strong> Contact <a href="mailto:privacy@techsci.io" className="text-blue-600 hover:underline">privacy@techsci.io</a></li>
            <li><strong>Data Breach Claims:</strong> Follow Security Incident Response procedures, then this Dispute Resolution Policy</li>
            <li><strong>Data Accuracy:</strong> Request corrections via <a href="mailto:support@techsci.io" className="text-blue-600 hover:underline">support@techsci.io</a></li>
            <li><strong>HIPAA Violations:</strong> Contact <a href="mailto:hipaa@techsci.io" className="text-blue-600 hover:underline">hipaa@techsci.io</a> immediately</li>
          </ul>
        </div>
      </section>

      {/* Statute of Limitations */}
      <section className="bg-yellow-50 border-l-4 border-yellow-600 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Statute of Limitations
        </h2>
        <div className="space-y-3 text-gray-700">
          <p className="font-bold text-lg">
            Any claim must be brought within ONE (1) YEAR of the date when the event giving rise to the dispute occurred.
          </p>
          <p>
            Claims not brought within this one-year timeframe are <strong>permanently barred</strong> and may not be
            pursued in arbitration, mediation, or court.
          </p>
          <p className="text-sm">
            This limitation period begins when you knew or reasonably should have known about the facts giving rise to the claim.
          </p>
        </div>
      </section>

      {/* Severability */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Severability
        </h2>
        <p className="text-gray-700">
          If any provision of this Dispute Resolution Policy is found to be unenforceable or invalid by a court or arbitrator,
          that provision will be limited or eliminated to the minimum extent necessary so that the remaining provisions remain
          in full force and effect.
        </p>
        <p className="text-gray-700 mt-3">
          <strong>Exception:</strong> If the class action waiver is found unenforceable, the entire arbitration agreement
          shall be void, and disputes will be resolved in court.
        </p>
      </section>

      {/* Changes to Policy */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Changes to This Policy
        </h2>
        <div className="space-y-3 text-gray-700">
          <p>
            We may update this Dispute Resolution Policy from time to time to reflect changes in law or our procedures.
          </p>
          <p>
            <strong>Material changes will be notified via email</strong> to your account address with <strong>30 days' notice</strong>.
          </p>
          <p>
            Continued use of Afilo services after changes take effect constitutes acceptance of the updated policy.
          </p>
          <p className="text-sm">
            <strong>Your opt-out right</strong> (for arbitration and class action waiver) applies to any material changes
            that expand our rights or limit yours. You have 30 days from notification to opt out of changes.
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Contact Information
        </h2>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>General Disputes:</strong><br />
            Email: <a href="mailto:disputes@techsci.io" className="text-blue-600 hover:underline">disputes@techsci.io</a><br />
            Phone: +1 302 415 3171
          </p>

          <p>
            <strong>Legal/Arbitration Notices:</strong><br />
            Email: <a href="mailto:legal@techsci.io" className="text-blue-600 hover:underline">legal@techsci.io</a><br />
            Mailing Address:<br />
            TechSci, Inc. - Legal Department<br />
            1111B S Governors Ave STE 34002<br />
            Dover, DE 19904, United States
          </p>

          <p>
            <strong>Opt-Out (Arbitration/Class Action Waiver):</strong><br />
            Email: <a href="mailto:optout@techsci.io" className="text-blue-600 hover:underline">optout@techsci.io</a>
          </p>
        </div>
      </section>
    </div>
  );
}
