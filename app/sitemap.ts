import type { MetadataRoute } from 'next';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://app.afilo.io').replace(/\/$/, '');

const staticRoutes = [
  '/',
  '/products',
  '/enterprise',
  '/automation',
  '/contact',
  '/legal/privacy',
  '/legal/terms',
  '/legal/enterprise-sla',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return staticRoutes.map((route) => ({
    url: `${siteUrl}${route === '/' ? '' : route}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: route === '/' ? 1.0 : 0.7,
  }));
}
