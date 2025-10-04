'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Download, ArrowLeft, FileText } from 'lucide-react';

interface LegalPage {
  id: string;
  title: string;
  href: string;
  icon: string;
}

const legalPages: LegalPage[] = [
  { id: 'privacy', title: 'Privacy Policy', href: '/legal/privacy-policy', icon: '🔒' },
  { id: 'terms', title: 'Terms of Service', href: '/legal/terms-of-service', icon: '📜' },
  { id: 'refund', title: 'Refund & Return Policy', href: '/legal/refund-policy', icon: '💰' },
  { id: 'dispute', title: 'Dispute Resolution', href: '/legal/dispute-resolution', icon: '⚖️' },
  { id: 'acceptable-use', title: 'Acceptable Use Policy', href: '/legal/acceptable-use', icon: '✅' },
  { id: 'dpa', title: 'Data Processing Agreement', href: '/legal/data-processing', icon: '📊' }
];

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [lastUpdated] = React.useState('January 30, 2025');

  // Get current page title
  const currentPage = legalPages.find(page => pathname === page.href);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Afilo</span>
              </Link>
              <div className="hidden md:block w-px h-6 bg-gray-300" />
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  Legal Center
                </h1>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Last updated: <span className="font-medium">{lastUpdated}</span>
              </div>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Print / PDF
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-gray-200 bg-white overflow-hidden"
            >
              <div className="px-4 py-4 space-y-2">
                {legalPages.map((page) => (
                  <Link
                    key={page.id}
                    href={page.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      pathname === page.href
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xl">{page.icon}</span>
                    <span>{page.title}</span>
                  </Link>
                ))}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      window.print();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-900 rounded-lg"
                  >
                    <Download className="w-4 h-4" />
                    Print / PDF
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar Navigation */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Navigation */}
              <nav className="bg-white rounded-xl border border-gray-200 p-4">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">Legal Documents</h2>
                <div className="space-y-1">
                  {legalPages.map((page) => (
                    <Link
                      key={page.id}
                      href={page.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        pathname === page.href
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-base">{page.icon}</span>
                      <span>{page.title}</span>
                    </Link>
                  ))}
                </div>
              </nav>

              {/* Help Box */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Questions?</h3>
                <p className="text-xs text-gray-600 mb-3">
                  Contact our legal team for clarifications
                </p>
                <Link
                  href="mailto:legal@techsci.io"
                  className="block text-center px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  legal@techsci.io
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              {/* Content Header */}
              <div className="border-b border-gray-200 px-8 py-6">
                <div className="flex items-start justify-between">
                  <div>
                    {currentPage && (
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {currentPage.title}
                      </h1>
                    )}
                    <p className="text-sm text-gray-600">
                      Last updated: {lastUpdated}
                    </p>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                </div>
              </div>

              {/* Page Content */}
              <div className="px-8 py-8 prose prose-lg max-w-none">
                {children}
              </div>
            </div>

            {/* Footer Navigation */}
            <div className="mt-8 flex items-center justify-between">
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                ← Back to Homepage
              </Link>
              <Link
                href="/enterprise"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Enterprise Portal →
              </Link>
            </div>
          </main>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          header,
          aside,
          button,
          .no-print {
            display: none !important;
          }
          main {
            max-width: 100% !important;
          }
          .prose {
            font-size: 12pt !important;
            line-height: 1.5 !important;
          }
        }
      `}</style>
    </div>
  );
}
