import Link from 'next/link';
import { Shield, Lock, Award, FileText, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Company Info - Column 1 */}
          <div className="lg:col-span-2">
            <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Afilo
            </h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Enterprise-grade digital marketplace commanding Fortune 500 pricing. Premium AI-powered software platform
              built for high-value software products with enterprise pricing ($499-$9,999+/month).
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-lg">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-semibold">SOC 2 Type II</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-lg">
                <Lock className="w-4 h-4 text-green-400" />
                <span className="text-xs font-semibold">ISO 27001</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-lg">
                <Award className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold">HIPAA</span>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>651 N Broad St, Suite 201<br />Middletown Delaware 19709<br />United States</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <a href="tel:+13024153171" className="hover:text-white transition-colors">
                  +1 302 415 3171
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <a href="mailto:support@techsci.io" className="hover:text-white transition-colors">
                  support@techsci.io
                </a>
              </div>
            </div>
          </div>

          {/* Products & Services - Column 2 */}
          <div>
            <h4 className="text-lg font-bold mb-4">Products</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  Product Catalog
                </Link>
              </li>
              <li>
                <Link href="/enterprise" className="hover:text-white transition-colors">
                  Enterprise Portal
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Pricing Plans
                </Link>
              </li>
              <li>
                <Link href="/enterprise#subscriptions" className="hover:text-white transition-colors">
                  Subscriptions
                </Link>
              </li>
              <li>
                <Link href="/enterprise#quote" className="hover:text-white transition-colors">
                  Custom Quote
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Company - Column 3 */}
          <div>
            <h4 className="text-lg font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/#about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/#customers" className="hover:text-white transition-colors">
                  Customer Stories
                </Link>
              </li>
              <li>
                <Link href="/#technology" className="hover:text-white transition-colors">
                  Technology
                </Link>
              </li>
              <li>
                <Link href="/#security" className="hover:text-white transition-colors">
                  Security & Compliance
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <a href="mailto:enterprise@techsci.io" className="hover:text-white transition-colors">
                  Contact Sales
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Support - Column 4 */}
          <div>
            <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Legal & Support
            </h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/legal/terms-of-service" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/refund-policy" className="hover:text-white transition-colors">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/dispute-resolution" className="hover:text-white transition-colors">
                  Dispute Resolution
                </Link>
              </li>
              <li>
                <Link href="/legal/acceptable-use" className="hover:text-white transition-colors">
                  Acceptable Use
                </Link>
              </li>
              <li>
                <Link href="/legal/data-processing" className="hover:text-white transition-colors">
                  Data Processing (DPA)
                </Link>
              </li>
            </ul>

            {/* Support Links */}
            <div className="mt-6">
              <h5 className="text-sm font-semibold mb-2">Support</h5>
              <ul className="space-y-1 text-sm text-gray-400">
                <li>
                  <a href="mailto:support@techsci.io" className="hover:text-white transition-colors">
                    Customer Support
                  </a>
                </li>
                <li>
                  <a href="mailto:billing@techsci.io" className="hover:text-white transition-colors">
                    Billing Help
                  </a>
                </li>
                <li>
                  <a href="mailto:security@techsci.io" className="hover:text-white transition-colors">
                    Security Issues
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Geographic Restriction Notice */}
        <div className="py-6 border-t border-gray-800">
          <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <span className="text-2xl">🚫</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-red-400 mb-1">Geographic Restrictions</p>
                <p className="text-xs text-gray-400">
                  TechSci, Inc. (operating the Afilo platform) does NOT provide services to individuals or entities located
                  in the European Union (EU) or European Economic Area (EEA). By using our services, you represent that
                  you are not located in the EU/EEA and are not subject to EU data protection laws (GDPR).
                  See our{' '}
                  <Link href="/legal/privacy-policy#geographic-restrictions" className="text-blue-400 hover:text-blue-300 underline">
                    Privacy Policy
                  </Link>{' '}
                  for details.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {new Date().getFullYear()} TechSci, Inc. (operating the Afilo platform). All rights reserved.{' '}
              <span className="inline-block">Afilo® is a registered trademark of TechSci, Inc.</span>
            </p>

            {/* Tech Stack Badge */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Powered by</span>
              <a
                href="https://stripe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-gray-400 hover:text-white transition-colors"
              >
                Stripe
              </a>
              <span>•</span>
              <a
                href="https://nextjs.org"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-gray-400 hover:text-white transition-colors"
              >
                Next.js
              </a>
              <span>•</span>
              <a
                href="https://stripe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-gray-400 hover:text-white transition-colors"
              >
                Stripe
              </a>
            </div>
          </div>
        </div>

        {/* Compliance & Certifications Row */}
        <div className="pb-8">
          <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              SOC 2 Type II Certified
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3" />
              ISO 27001:2022
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Award className="w-3 h-3" />
              HIPAA Compliant
            </span>
            <span>•</span>
            <span>CCPA Compliant</span>
            <span>•</span>
            <span>PCI DSS Level 1</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
