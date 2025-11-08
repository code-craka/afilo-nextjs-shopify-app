/**
 * Cookie Policy Page
 * Comprehensive cookie policy for CCPA/PIPEDA/UK GDPR compliance
 *
 * @fileoverview Legal cookie policy page with detailed explanations
 * @version 1.0
 * @compliance CCPA, PIPEDA, UK GDPR, Australia Privacy Act
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Shield,
  BarChart3,
  Megaphone,
  Palette,
  Globe,
  Clock,
  Settings,
  ExternalLink,
  AlertTriangle,
  Info,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Cookie Policy | Afilo Enterprise Platform',
  description: 'Learn about how Afilo uses cookies and similar technologies to enhance your experience and comply with privacy regulations.',
  keywords: [
    'cookie policy',
    'privacy',
    'CCPA',
    'PIPEDA',
    'UK GDPR',
    'Australia Privacy Act',
    'cookies',
    'tracking',
    'consent'
  ],
};

export default function CookiePolicyPage() {
  return (
    <div className="container max-w-4xl py-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Cookie Policy</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <span>Last updated: January 30, 2025</span>
          <Badge variant="outline">Version 1.0</Badge>
        </div>
        <p className="text-lg text-muted-foreground">
          This Cookie Policy explains how TechSci, Inc. (operating the Afilo platform) uses cookies
          and similar technologies on our website and platform.
        </p>
      </div>

      {/* Quick Navigation */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Manage your cookie preferences or learn about your rights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/dashboard/settings/privacy"
              className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span className="font-medium">Privacy Settings</span>
            </Link>
            <Link
              href="#cookie-categories"
              className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <Info className="h-4 w-4" />
              <span className="font-medium">Cookie Types</span>
            </Link>
            <Link
              href="#your-rights"
              className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <Shield className="h-4 w-4" />
              <span className="font-medium">Your Rights</span>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="prose prose-slate dark:prose-invert max-w-none">

        {/* 1. Introduction */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
          <p className="mb-4">
            TechSci, Inc. (operating the Afilo platform) ("we," "our," or "us") uses cookies and
            similar tracking technologies on our website and platform located at{' '}
            <Link href="https://afilo.io" className="text-primary underline">afilo.io</Link>.
          </p>
          <p className="mb-4">
            This Cookie Policy explains what cookies are, how we use them, your choices regarding
            cookies, and provides information about the legal basis for our cookie usage under
            applicable privacy laws.
          </p>

          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Important: EU/EEA Service Restriction
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  TechSci, Inc. does NOT provide services to individuals or entities located in the
                  European Union (EU) or European Economic Area (EEA). This policy addresses compliance
                  with CCPA, PIPEDA, UK GDPR, and Australia Privacy Act only.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. What Are Cookies */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">2. What Are Cookies?</h2>
          <p className="mb-4">
            Cookies are small text files stored on your device (computer, tablet, or mobile phone)
            when you visit a website. They help websites remember information about your visit,
            such as your preferred language and other settings.
          </p>

          <h3 className="text-xl font-semibold mb-3">Types of Technologies We Use:</h3>
          <ul className="space-y-2 mb-4">
            <li><strong>Cookies:</strong> Small text files stored by your browser</li>
            <li><strong>Local Storage:</strong> Browser storage for larger amounts of data</li>
            <li><strong>Session Storage:</strong> Temporary storage that expires when you close your browser</li>
            <li><strong>Web Beacons:</strong> Tiny graphics used to track email opens and website visits</li>
          </ul>
        </section>

        {/* 3. Cookie Categories */}
        <section className="mb-8" id="cookie-categories">
          <h2 className="text-2xl font-bold mb-4">3. Types of Cookies We Use</h2>

          {/* Essential Cookies */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                <CardTitle>Essential Cookies (Always Active)</CardTitle>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                  Required
                </Badge>
              </div>
              <CardDescription>
                These cookies are necessary for the platform to function and cannot be disabled.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-3">
                <strong>Purpose:</strong> Enable core features like user authentication, security,
                shopping cart functionality, and load balancing.
              </p>

              <h4 className="font-semibold mb-2">Examples:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="font-medium">Authentication Cookies (Clerk)</p>
                  <ul className="text-sm text-muted-foreground list-disc ml-4">
                    <li>Session management</li>
                    <li>User authentication state</li>
                    <li>Security tokens</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium">Payment Cookies (Stripe)</p>
                  <ul className="text-sm text-muted-foreground list-disc ml-4">
                    <li>Fraud prevention</li>
                    <li>Checkout functionality</li>
                    <li>Payment processing</li>
                  </ul>
                </div>
              </div>

              <p className="text-sm">
                <strong>Legal Basis:</strong> Contractual necessity (required to provide the service)
              </p>
              <p className="text-sm">
                <strong>Duration:</strong> Session cookies to 1 year
              </p>
            </CardContent>
          </Card>

          {/* Analytics Cookies */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <CardTitle>Analytics Cookies (Optional)</CardTitle>
                <Badge variant="outline">You can opt out</Badge>
              </div>
              <CardDescription>
                Help us understand how you use the platform so we can improve it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-3">
                <strong>Purpose:</strong> Track page views, user behavior, performance metrics,
                and help us optimize the user experience.
              </p>

              <h4 className="font-semibold mb-2">Services We Use:</h4>
              <div className="space-y-3 mb-4">
                <div className="border rounded-lg p-3">
                  <p className="font-medium">Google Analytics</p>
                  <p className="text-sm text-muted-foreground mb-2">
                    Tracks visitor behavior, demographics, and site performance
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <strong>Cookies:</strong> _ga, _gid, _gat_gtag_*
                  </p>
                </div>
                <div className="border rounded-lg p-3">
                  <p className="font-medium">Vercel Analytics</p>
                  <p className="text-sm text-muted-foreground mb-2">
                    Monitors web performance and Core Web Vitals
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <strong>Storage:</strong> Performance metrics in browser storage
                  </p>
                </div>
              </div>

              <p className="text-sm">
                <strong>Legal Basis:</strong> Consent (you can opt-out at any time)
              </p>
              <p className="text-sm">
                <strong>Duration:</strong> Up to 2 years
              </p>
              <p className="text-sm">
                <strong>Third Parties:</strong> Google LLC, Vercel Inc.
              </p>
            </CardContent>
          </Card>

          {/* Marketing Cookies */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-purple-600" />
                <CardTitle>Marketing Cookies (Optional)</CardTitle>
                <Badge variant="outline">You can opt out</Badge>
              </div>
              <CardDescription>
                Used for targeted advertising and conversion tracking (currently not active).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-3">
                <strong>Purpose:</strong> Track your browsing habits to show you relevant
                advertisements and measure advertising effectiveness.
              </p>

              <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-orange-900 dark:text-orange-100 mb-1">
                      Currently Not Active
                    </p>
                    <p className="text-sm text-orange-800 dark:text-orange-200">
                      We do not currently use marketing cookies, but we may in the future.
                      If we do, we will update this policy and request your consent.
                    </p>
                  </div>
                </div>
              </div>

              <h4 className="font-semibold mb-2">Potential Future Use:</h4>
              <ul className="text-sm text-muted-foreground list-disc ml-4 mb-4">
                <li>Google Ads conversion tracking</li>
                <li>LinkedIn Insights Tag</li>
                <li>Remarketing pixels</li>
                <li>Social media advertising integrations</li>
              </ul>

              <p className="text-sm">
                <strong>Legal Basis:</strong> Consent (when implemented)</p>
              <p className="text-sm">
                <strong>Duration:</strong> Up to 1 year (when implemented)
              </p>
            </CardContent>
          </Card>

          {/* Preference Cookies */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-orange-600" />
                <CardTitle>Preference Cookies (Optional)</CardTitle>
                <Badge variant="outline">You can opt out</Badge>
              </div>
              <CardDescription>
                Remember your settings and preferences to personalize your experience.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-3">
                <strong>Purpose:</strong> Store your preferences to provide a personalized
                experience across sessions.
              </p>

              <h4 className="font-semibold mb-2">What We Remember:</h4>
              <ul className="text-sm text-muted-foreground list-disc ml-4 mb-4">
                <li>UI theme (dark/light mode)</li>
                <li>Language preferences</li>
                <li>Dashboard layout settings</li>
                <li>Notification preferences</li>
                <li>Timezone settings</li>
              </ul>

              <p className="text-sm">
                <strong>Legal Basis:</strong> Consent
              </p>
              <p className="text-sm">
                <strong>Duration:</strong> Up to 1 year
              </p>
            </CardContent>
          </Card>
        </section>

        {/* 4. Third-Party Cookies */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">4. Third-Party Cookies and Services</h2>

          <p className="mb-4">
            Some cookies are set by third-party services we use to provide our platform.
            These third parties have their own privacy policies and cookie practices.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Stripe</CardTitle>
                <CardDescription>Payment processing and fraud prevention</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-2">
                  Essential for payment processing and fraud detection.
                </p>
                <Link
                  href="https://stripe.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary underline inline-flex items-center gap-1"
                >
                  Stripe Privacy Policy
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Clerk</CardTitle>
                <CardDescription>Authentication and user management</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-2">
                  Handles user authentication, session management, and security.
                </p>
                <Link
                  href="https://clerk.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary underline inline-flex items-center gap-1"
                >
                  Clerk Privacy Policy
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Google</CardTitle>
                <CardDescription>Analytics and security services</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-2">
                  Analytics tracking and reCAPTCHA for bot protection.
                </p>
                <Link
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary underline inline-flex items-center gap-1"
                >
                  Google Privacy Policy
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vercel</CardTitle>
                <CardDescription>Hosting and performance analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-2">
                  Platform hosting and web performance monitoring.
                </p>
                <Link
                  href="https://vercel.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary underline inline-flex items-center gap-1"
                >
                  Vercel Privacy Policy
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 5. Cookie Lifespan */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">5. Cookie Lifespan and Expiration</h2>

          <p className="mb-4">
            Cookies may be either "session" cookies or "persistent" cookies:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <CardTitle className="text-lg">Session Cookies</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3">
                  Deleted automatically when you close your browser.
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Used for:</strong> Authentication sessions, shopping cart state,
                  temporary form data
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <CardTitle className="text-lg">Persistent Cookies</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3">
                  Remain on your device until expiration or manual deletion.
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Used for:</strong> User preferences, analytics tracking,
                  "remember me" functionality
                </p>
              </CardContent>
            </Card>
          </div>

          <h3 className="text-xl font-semibold mb-3">Specific Cookie Lifespans:</h3>
          <div className="overflow-x-auto">
            <table className="w-full border border-border rounded-lg">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 border-b">Cookie Type</th>
                  <th className="text-left p-3 border-b">Lifespan</th>
                  <th className="text-left p-3 border-b">Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3 border-b">Clerk Session</td>
                  <td className="p-3 border-b">30 days</td>
                  <td className="p-3 border-b">User authentication</td>
                </tr>
                <tr>
                  <td className="p-3 border-b">Google Analytics</td>
                  <td className="p-3 border-b">2 years</td>
                  <td className="p-3 border-b">Usage analytics</td>
                </tr>
                <tr>
                  <td className="p-3 border-b">Preference Storage</td>
                  <td className="p-3 border-b">1 year</td>
                  <td className="p-3 border-b">UI settings and preferences</td>
                </tr>
                <tr>
                  <td className="p-3 border-b">Consent Record</td>
                  <td className="p-3 border-b">1 year</td>
                  <td className="p-3 border-b">Cookie consent preferences</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            Your cookie consent expires after 12 months, at which point you'll be asked to
            confirm your preferences again.
          </p>
        </section>

        {/* 6. Managing Your Preferences */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">6. Managing Your Cookie Preferences</h2>

          <h3 className="text-xl font-semibold mb-3">Through Our Platform</h3>
          <p className="mb-4">
            You can manage your cookie preferences at any time through our platform:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Privacy Settings Page</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Complete control over all cookie categories with detailed explanations.
                </p>
                <Link
                  href="/dashboard/settings/privacy"
                  className="text-sm text-primary underline"
                >
                  Go to Privacy Settings →
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Cookie Banner</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Appears on your first visit with options to accept, reject, or customize.
                </p>
                <p className="text-xs text-muted-foreground">
                  The banner will reappear if your consent expires or our policy changes.
                </p>
              </CardContent>
            </Card>
          </div>

          <h3 className="text-xl font-semibold mb-3">Through Your Browser</h3>
          <p className="mb-4">
            Most browsers allow you to control cookies through their settings. Note that
            disabling essential cookies may affect platform functionality.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Link
              href="https://support.google.com/chrome/answer/95647"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <p className="font-medium text-sm">Chrome</p>
              <ExternalLink className="h-3 w-3 mt-1" />
            </Link>
            <Link
              href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <p className="font-medium text-sm">Firefox</p>
              <ExternalLink className="h-3 w-3 mt-1" />
            </Link>
            <Link
              href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <p className="font-medium text-sm">Safari</p>
              <ExternalLink className="h-3 w-3 mt-1" />
            </Link>
            <Link
              href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <p className="font-medium text-sm">Edge</p>
              <ExternalLink className="h-3 w-3 mt-1" />
            </Link>
          </div>

          <h3 className="text-xl font-semibold mb-3">Third-Party Opt-Out Tools</h3>
          <ul className="space-y-2 mb-4">
            <li>
              <Link
                href="https://tools.google.com/dlpage/gaoptout"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline inline-flex items-center gap-1"
              >
                Google Analytics Opt-Out Browser Add-on
                <ExternalLink className="h-3 w-3" />
              </Link>
            </li>
            <li>
              <Link
                href="http://optout.aboutads.info/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline inline-flex items-center gap-1"
              >
                Digital Advertising Alliance Opt-Out
                <ExternalLink className="h-3 w-3" />
              </Link>
            </li>
            <li>
              <Link
                href="http://optout.networkadvertising.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline inline-flex items-center gap-1"
              >
                Network Advertising Initiative Opt-Out
                <ExternalLink className="h-3 w-3" />
              </Link>
            </li>
          </ul>
        </section>

        {/* 7. Your Privacy Rights by Region */}
        <section className="mb-8" id="your-rights">
          <h2 className="text-2xl font-bold mb-4">7. Your Privacy Rights by Region</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  <CardTitle>California Residents (CCPA)</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3">
                  Under the California Consumer Privacy Act, you have the right to opt-out of
                  the "sale" of personal information. We do not sell your personal information.
                  You can still opt-out of non-essential cookies through our settings.
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Your Rights:</strong> Opt-out, data deletion, information disclosure
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  <CardTitle>Canadian Residents (PIPEDA)</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3">
                  Under PIPEDA, you have the right to withdraw consent for non-essential cookies
                  and request deletion of your data. We obtain express consent before using
                  analytics or marketing cookies.
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Your Rights:</strong> Consent withdrawal, data access, correction, deletion
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  <CardTitle>UK Residents (UK GDPR)</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3">
                  Under UK GDPR, you have rights including consent withdrawal, data portability,
                  and the right to object to cookie usage. We provide granular consent controls
                  for all non-essential cookies.
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Your Rights:</strong> Consent management, data portability, objection, deletion
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  <CardTitle>Australian Residents</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3">
                  Under the Privacy Act 1988, you have rights to access and correct your personal
                  information. We provide transparency about our cookie usage and respect your
                  preferences.
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Your Rights:</strong> Data access, correction, complaint resolution
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 8. Updates to This Policy */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">8. Updates to This Policy</h2>

          <p className="mb-4">
            We may update this Cookie Policy from time to time to reflect changes in our
            practices, technology, legal requirements, or other factors.
          </p>

          <h3 className="text-xl font-semibold mb-3">When We Make Changes:</h3>
          <ul className="list-disc ml-6 mb-4 space-y-1">
            <li>Update the "Last updated" date at the top of this policy</li>
            <li>Notify you via email if changes are material and affect your rights</li>
            <li>Request renewed consent if required by applicable law</li>
            <li>Post updates on our platform and provide notice through our cookie banner</li>
          </ul>

          <p className="text-sm text-muted-foreground">
            We encourage you to review this policy periodically to stay informed about our
            cookie practices.
          </p>
        </section>

        {/* 9. Contact Us */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">9. Contact Us</h2>

          <p className="mb-4">
            If you have questions about our use of cookies or this Cookie Policy, please contact us:
          </p>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">TechSci, Inc. (operating the Afilo platform)</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium mb-1">Email</p>
                  <Link href="mailto:privacy@techsci.io" className="text-primary underline">
                    privacy@techsci.io
                  </Link>
                </div>

                <div>
                  <p className="font-medium mb-1">Phone</p>
                  <Link href="tel:+13024153171" className="text-primary underline">
                    +1 302 415 3171
                  </Link>
                </div>

                <div className="md:col-span-2">
                  <p className="font-medium mb-1">Mailing Address</p>
                  <address className="not-italic text-sm text-muted-foreground">
                    1111B S Governors Ave STE 34002<br />
                    Dover, DE 19904<br />
                    United States
                  </address>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="mt-4 text-sm text-muted-foreground">
            For immediate assistance with cookie preferences, you can also visit our{' '}
            <Link href="/dashboard/settings/privacy" className="text-primary underline">
              Privacy Settings
            </Link>{' '}
            page.
          </p>
        </section>

      </div>
    </div>
  );
}