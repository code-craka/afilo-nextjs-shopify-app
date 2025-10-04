import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { ClerkProvider } from '@clerk/nextjs';
import { Providers } from "./providers";
import "./globals.css";
import DigitalCartWidget from "@/components/DigitalCartWidget";
import PerformanceMonitor from "@/components/PerformanceMonitor";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Enhanced SEO Metadata (Week 4)
export const metadata: Metadata = {
  metadataBase: new URL('https://app.afilo.io'),
  title: {
    default: 'Afilo Enterprise | Fortune 500 Digital Commerce Platform - $499-$9,999/month',
    template: '%s | Afilo Enterprise'
  },
  description: 'Enterprise-grade digital commerce platform trusted by 847 companies including 67 Fortune 500 organizations. SOC 2, ISO 27001, HIPAA certified. Pricing: $499-$9,999+/month with 450% average ROI.',
  keywords: [
    'enterprise digital commerce',
    'Fortune 500 software platform',
    'SOC 2 certified platform',
    'ISO 27001 compliance',
    'HIPAA compliant software',
    'enterprise SaaS',
    'B2B digital marketplace',
    'subscription software',
    'enterprise pricing',
    '$499-$9999 per month',
    'ROI calculator',
    'business automation',
    'Next.js enterprise',
    'TypeScript platform',
    'Shopify integration',
    'Stripe subscriptions'
  ],
  authors: [{ name: 'TechSci, Inc.', url: 'https://app.afilo.io' }],
  creator: 'TechSci, Inc.',
  publisher: 'TechSci, Inc.',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://app.afilo.io',
    title: 'Afilo Enterprise | Fortune 500 Digital Commerce Platform',
    description: 'Trusted by 847 enterprises including 67 Fortune 500 companies. SOC 2, ISO 27001, HIPAA certified. 450% average ROI. Pricing: $499-$9,999+/month.',
    siteName: 'Afilo Enterprise',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Afilo Enterprise - Fortune 500 Digital Commerce Platform',
        type: 'image/png',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Afilo Enterprise | Fortune 500 Digital Commerce Platform',
    description: '847 enterprises trust Afilo. SOC 2, ISO 27001, HIPAA certified. 450% ROI. $499-$9,999+/month.',
    images: ['/og-image.png'],
    creator: '@afilo_enterprise',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: 'https://app.afilo.io',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    // Note: Bing verification uses meta tag instead of Next.js metadata API
    // Add manually in head if needed: <meta name="msvalidate.01" content="..." />
  },
  category: 'Enterprise Software',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Providers>
            {children}
            <DigitalCartWidget />
            <PerformanceMonitor />
          </Providers>
          {GA_MEASUREMENT_ID && (
            <>
              <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
                strategy="afterInteractive"
              />
              <Script id="ga-init" strategy="afterInteractive">
                {`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_MEASUREMENT_ID}', {
                    page_path: window.location.pathname,
                  });
                `}
              </Script>
            </>
          )}

          {/* Cloudflare Web Analytics */}
          <Script
            defer
            src='https://static.cloudflareinsights.com/beacon.min.js'
            data-cf-beacon='{"token": "5871c7284ba4474ca46670b50b73502c"}'
            strategy="afterInteractive"
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
