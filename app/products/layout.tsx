import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Enterprise Digital Products - Afilo | Digital Commerce Solutions',
  description: 'Browse our catalog of enterprise digital products and solutions. AI tools, automation software, API integrations, and custom development services for Fortune 500 companies.',
  keywords: [
    'digital products',
    'enterprise software',
    'AI tools',
    'automation software',
    'API integrations',
    'digital solutions',
    'enterprise tools',
    'business software',
    'SaaS products',
    'enterprise applications',
    'digital transformation tools',
    'custom development',
    'enterprise APIs',
    'business automation',
    'workflow optimization'
  ],
  openGraph: {
    title: 'Enterprise Digital Products - Afilo | Digital Commerce Solutions',
    description: 'Browse our catalog of enterprise digital products and solutions. AI tools, automation software, API integrations for Fortune 500 companies.',
    url: 'https://app.afilo.io/products',
    type: 'website',
    images: [
      {
        url: '/og-products.png',
        width: 1200,
        height: 630,
        alt: 'Afilo Enterprise Digital Products and Solutions',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Enterprise Digital Products - Afilo',
    description: 'AI tools, automation software, API integrations for Fortune 500 companies.',
    images: ['/og-products.png'],
  },
  alternates: {
    canonical: 'https://app.afilo.io/products',
  },
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}