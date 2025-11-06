import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { ClerkProvider } from '@clerk/nextjs';
import { Providers } from "./providers";
import "./globals.css";
import DigitalCartWidget from "@/components/DigitalCartWidget";
import PerformanceMonitor from "@/components/PerformanceMonitor";
import ToastProvider from "@/components/providers/ToastProvider";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

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
    'Stripe payments',
    'Stripe subscriptions',
    'Neon PostgreSQL',
    'Clerk authentication'
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
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300`}
        >
          <ThemeProvider defaultTheme="system" storageKey="afilo-theme">
            <Providers>
              {children}
              <ToastProvider />
            </Providers>
            <DigitalCartWidget />
            <ChatWidget />
            {/* <PerformanceMonitor /> */}
          </ThemeProvider>
          {GA_MEASUREMENT_ID && (
            <>
              <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
                strategy="lazyOnload"
              />
              <Script id="ga-init" strategy="lazyOnload">
                {`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_MEASUREMENT_ID}', {
                    page_path: window.location.pathname,
                    send_page_view: true,
                    // Enhanced tracking for enterprise customers
                    custom_map: {
                      'dimension1': 'user_type',
                      'dimension2': 'subscription_tier',
                      'dimension3': 'company_size'
                    },
                    // Privacy settings
                    anonymize_ip: true,
                    allow_google_signals: true,
                    allow_ad_personalization_signals: false
                  });

                  // Track initial page load with enhanced context
                  gtag('event', 'page_view', {
                    page_title: document.title,
                    page_location: window.location.href,
                    content_group1: 'Enterprise Platform'
                  });
                `}
              </Script>
            </>
          )}

          {/* Cloudflare Web Analytics - Production Only */}
          {process.env.NODE_ENV === 'production' && (
            <Script
              defer
              src='https://static.cloudflareinsights.com/beacon.min.js'
              data-cf-beacon='{"token": "5871c7284ba4474ca46670b50b73502c"}'
              strategy="lazyOnload"
            />
          )}
        </body>
      </html>
    </ClerkProvider>
  );
}
