import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Enterprise Pricing - Afilo | $499-$9,999/month | Fortune 500 Plans',
  description: 'Transparent enterprise pricing for Afilo digital commerce platform. Starting at $499/month for growing businesses up to $9,999/month for Fortune 500 enterprises. 450% average ROI guaranteed.',
  keywords: [
    'enterprise pricing',
    'software pricing plans',
    'Fortune 500 pricing',
    'enterprise subscription',
    'B2B software pricing',
    'ROI calculator',
    'enterprise SaaS pricing',
    'digital commerce pricing',
    'scalable pricing tiers',
    'enterprise software cost',
    'subscription pricing model',
    'volume discounts',
    'custom enterprise pricing'
  ],
  openGraph: {
    title: 'Enterprise Pricing - Afilo | $499-$9,999/month',
    description: 'Transparent enterprise pricing starting at $499/month. 450% average ROI guaranteed. Custom Fortune 500 plans available.',
    url: 'https://app.afilo.io/pricing',
    type: 'website',
    images: [
      {
        url: '/og-pricing.png',
        width: 1200,
        height: 630,
        alt: 'Afilo Enterprise Pricing Plans - $499 to $9,999 per month',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Enterprise Pricing - Afilo | $499-$9,999/month',
    description: 'Transparent enterprise pricing. 450% average ROI guaranteed.',
    images: ['/og-pricing.png'],
  },
  alternates: {
    canonical: 'https://app.afilo.io/pricing',
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}