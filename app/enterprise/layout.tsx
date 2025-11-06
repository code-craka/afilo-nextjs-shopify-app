import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Enterprise Solutions - Afilo | Fortune 500 Digital Commerce Platform',
  description: 'Enterprise-grade digital commerce solutions for Fortune 500 companies. Custom integrations, dedicated support, SOC 2 compliance, and enterprise SLAs. Trusted by 67 Fortune 500 organizations.',
  keywords: [
    'Fortune 500 solutions',
    'enterprise digital commerce',
    'enterprise software platform',
    'Fortune 500 software',
    'enterprise SaaS',
    'custom enterprise solutions',
    'dedicated support',
    'enterprise integrations',
    'SOC 2 compliance',
    'ISO 27001 certified',
    'HIPAA compliant',
    'enterprise SLA',
    'white-label solutions',
    'enterprise API',
    'scalable enterprise platform'
  ],
  openGraph: {
    title: 'Enterprise Solutions - Afilo | Fortune 500 Digital Commerce',
    description: 'Enterprise solutions for Fortune 500 companies. Custom integrations, dedicated support, SOC 2 compliance. Trusted by 67 Fortune 500 organizations.',
    url: 'https://app.afilo.io/enterprise',
    type: 'website',
    images: [
      {
        url: '/og-enterprise.png',
        width: 1200,
        height: 630,
        alt: 'Afilo Enterprise Solutions for Fortune 500 Companies',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Enterprise Solutions - Afilo | Fortune 500 Digital Commerce',
    description: 'Enterprise solutions for Fortune 500 companies. Trusted by 67 Fortune 500 organizations.',
    images: ['/og-enterprise.png'],
  },
  alternates: {
    canonical: 'https://app.afilo.io/enterprise',
  },
};

export default function EnterpriseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}