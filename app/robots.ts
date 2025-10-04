import type { MetadataRoute } from 'next';

/**
 * Robots.txt Configuration (Week 4 - Enhanced)
 * Controls search engine crawling behavior
 * Blocks: API routes, test pages, admin routes, private user data
 * Allows: All public pages, legal pages, product catalog
 */

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://app.afilo.io';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/products',
          '/enterprise',
          '/pricing',
          '/automation',
          '/contact',
          '/sign-in',
          '/sign-up',
          '/legal/',
        ],
        disallow: [
          '/api/', // Block all API routes
          '/dashboard/', // Block user dashboards
          '/test-*', // Block all test pages
          '/automation/', // Block automation testing
          '/_next/static/development/', // Block dev builds
          '/sso-callback', // Block OAuth callbacks
          '/subscribe/success', // Block subscription success pages (user-specific)
        ],
        crawlDelay: 10, // Respectful crawl delay
      },
      // Special rules for aggressive crawlers
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'Google-Extended', 'CCBot', 'anthropic-ai', 'Claude-Web'],
        disallow: '/', // Block AI scrapers from all content
      },
      // Special rules for well-behaved search engines
      {
        userAgent: ['Googlebot', 'Bingbot', 'Slurp', 'DuckDuckBot'],
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/test-*',
          '/automation/',
          '/sso-callback',
          '/subscribe/success',
        ],
        crawlDelay: 5, // Faster crawl for major search engines
      },
    ],
    sitemap: `${siteUrl.replace(/\/$/, '')}/sitemap.xml`,
    host: siteUrl.replace(/\/$/, ''),
  };
}
