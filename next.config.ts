import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image Optimization (Week 4)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.myshopify.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      }
    ],
    formats: ['image/avif', 'image/webp'], // Modern image formats
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840], // Responsive breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Icon sizes
    minimumCacheTTL: 31536000, // Cache for 1 year (immutable Shopify CDN)
    dangerouslyAllowSVG: false, // Security: block SVG uploads
    contentDispositionType: 'attachment', // Security: force download for unknown types
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;", // CSP for images
  },

  // Performance Optimization (Week 4)
  compress: true, // Gzip compression
  poweredByHeader: false, // Remove X-Powered-By header (security)
  generateEtags: true, // Enable ETags for caching

  // Production Optimizations
  productionBrowserSourceMaps: false, // Disable source maps in production (security)
  reactStrictMode: true, // Enable React strict mode
  // swcMinify is now default in Next.js 15+ (removed deprecated option)

  // Turbopack Configuration
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Build Configuration
  outputFileTracingRoot: __dirname,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false, // Enforce TypeScript strict mode
  },

  // Security Headers (Enterprise-grade)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://static.cloudflareinsights.com https://www.googletagmanager.com https://js.stripe.com https://*.clerk.accounts.dev https://clerk.app.afilo.io",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.shopify.com https://api.stripe.com https://challenges.cloudflare.com https://cloudflareinsights.com https://www.google-analytics.com https://clerk.*.com https://*.clerk.accounts.dev https://clerk.app.afilo.io",
              "frame-src 'self' https://challenges.cloudflare.com https://js.stripe.com https://*.clerk.accounts.dev",
              "worker-src 'self' blob:",
              "base-uri 'self'",
              "form-action 'self'",
              "object-src 'none'",
              "upgrade-insecure-requests"
            ].join('; ')
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(self), interest-cohort=()'
          }
        ]
      }
    ];
  },

  // Redirects for SEO & Cross-Domain Legal Pages
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/legal',
        destination: '/legal/terms-of-service',
        permanent: true,
      },
      // Cross-domain legal redirects (from afilo.io)
      // Note: These only work if user directly hits app.afilo.io
      // For afilo.io -> app.afilo.io, configure in marketing site
    ];
  },
};

export default nextConfig;
