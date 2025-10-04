import type { MetadataRoute } from 'next';

/**
 * Dynamic Sitemap Generator (Week 4 - Enhanced)
 * Automatically generates XML sitemap for search engines
 * Priority: 1.0 (homepage) to 0.5 (legal pages)
 * Change frequency: daily (homepage) to monthly (legal)
 */

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://app.afilo.io').replace(/\/$/, '');

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // Homepage - Highest priority (Updated daily with new content)
    {
      url: `${siteUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },

    // Enterprise Portal - Very high priority (Main conversion page)
    {
      url: `${siteUrl}/enterprise`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },

    // Pricing Page - Very high priority (Direct revenue)
    {
      url: `${siteUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },

    // Products Catalog - High priority (Updated frequently)
    {
      url: `${siteUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },

    // User Dashboard - High priority (User engagement)
    {
      url: `${siteUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },

    // Business Automation - Medium priority
    {
      url: `${siteUrl}/automation`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },

    // Contact Page - Medium priority
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },

    // Authentication Pages - Medium priority
    {
      url: `${siteUrl}/sign-in`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${siteUrl}/sign-up`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },

    // Legal Pages (6 comprehensive pages - Week 2 deliverables)
    // Last modified: January 30, 2025 (Week 2 completion)
    {
      url: `${siteUrl}/legal/terms-of-service`,
      lastModified: new Date('2025-01-30'),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${siteUrl}/legal/privacy-policy`,
      lastModified: new Date('2025-01-30'),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${siteUrl}/legal/refund-policy`,
      lastModified: new Date('2025-01-30'),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${siteUrl}/legal/dispute-resolution`,
      lastModified: new Date('2025-01-30'),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${siteUrl}/legal/acceptable-use`,
      lastModified: new Date('2025-01-30'),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${siteUrl}/legal/data-processing`,
      lastModified: new Date('2025-01-30'),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },

    // Legacy legal routes (redirects)
    {
      url: `${siteUrl}/legal/privacy`,
      lastModified: new Date('2025-01-30'),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${siteUrl}/legal/terms`,
      lastModified: new Date('2025-01-30'),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${siteUrl}/legal/enterprise-sla`,
      lastModified: new Date('2025-01-30'),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
  ];
}
