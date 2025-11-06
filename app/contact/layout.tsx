import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Enterprise Sales - Afilo | Get Custom Quote & Demo',
  description: 'Contact Afilo enterprise sales team for custom quotes, product demos, and enterprise solutions. Schedule a consultation for Fortune 500 digital commerce platform.',
  keywords: [
    'enterprise sales',
    'contact sales team',
    'enterprise demo',
    'custom quote',
    'enterprise consultation',
    'Fortune 500 sales',
    'enterprise support',
    'product demonstration',
    'sales inquiry',
    'enterprise pricing',
    'custom solutions',
    'implementation services',
    'enterprise onboarding',
    'dedicated account manager'
  ],
  openGraph: {
    title: 'Contact Enterprise Sales - Afilo | Get Custom Quote & Demo',
    description: 'Contact our enterprise sales team for custom quotes and product demos. Schedule a consultation for Fortune 500 solutions.',
    url: 'https://app.afilo.io/contact',
    type: 'website',
    images: [
      {
        url: '/og-contact.png',
        width: 1200,
        height: 630,
        alt: 'Contact Afilo Enterprise Sales Team',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Enterprise Sales - Afilo',
    description: 'Get custom quotes and product demos for Fortune 500 solutions.',
    images: ['/og-contact.png'],
  },
  alternates: {
    canonical: 'https://app.afilo.io/contact',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}