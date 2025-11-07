import { Metadata } from 'next';
import type { Product } from '@/lib/validations/product';

/**
 * Generate SEO metadata for product pages
 */
export function generateProductMetadata(product: Product): Metadata {
  const title = product.seoTitle || `${product.title} | Afilo`;
  const description = product.seoDescription ||
    product.description ||
    `Discover ${product.title} - Premium digital ${product.productType} from Afilo. ${product.tags.slice(0, 3).join(', ')}.`;

  // Format price for display
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: product.currency,
  }).format(product.basePrice);

  // Generate keywords from product data
  const keywords = [
    product.title,
    product.productType,
    product.vendor,
    ...product.tags,
    ...product.techStack,
    'digital product',
    'software',
    'download',
    'license',
  ].filter(Boolean).slice(0, 15).join(', ');

  // Use the featured image or first image for OpenGraph
  const ogImage = product.featuredImageUrl ||
    (product.images.length > 0 ? product.images[0].url : undefined) ||
    '/og-product-default.png';

  const canonical = `https://app.afilo.io/products/${product.handle}`;

  return {
    title,
    description,
    keywords,

    // Basic metadata
    authors: [{ name: product.vendor || 'Afilo', url: 'https://app.afilo.io' }],
    creator: product.vendor || 'Afilo',
    publisher: 'Afilo',

    // OpenGraph metadata
    openGraph: {
      type: 'website', // Use 'website' instead of 'product' for Next.js compatibility
      locale: 'en_US',
      url: canonical,
      title,
      description,
      siteName: 'Afilo',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: product.title,
        },
      ],
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      creator: '@afilo_enterprise',
    },

    // Product-specific structured data
    other: {
      // Add structured data for search engines
      'product:price:amount': product.basePrice.toString(),
      'product:price:currency': product.currency,
      'product:availability': product.availableForSale ? 'in stock' : 'out of stock',
      'product:condition': 'new',
      'product:brand': product.vendor,
      'product:category': product.productType,
    },

    // Canonical URL
    alternates: {
      canonical,
    },

    // Robots
    robots: {
      index: product.status === 'active' && product.availableForSale,
      follow: true,
      nocache: false,
      googleBot: {
        index: product.status === 'active' && product.availableForSale,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Additional metadata
    category: 'Software',
    classification: product.productType,
  };
}

/**
 * Generate JSON-LD structured data for product pages
 */
export function generateProductJsonLd(product: Product): object {
  const formattedPrice = product.basePrice.toString();
  const currency = product.currency;
  const availability = product.availableForSale ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.featuredImageUrl || (product.images.length > 0 ? product.images[0].url : undefined),
    brand: {
      '@type': 'Brand',
      name: product.vendor,
    },
    category: product.productType,
    sku: product.handle,
    offers: {
      '@type': 'Offer',
      price: formattedPrice,
      priceCurrency: currency,
      availability,
      url: `https://app.afilo.io/products/${product.handle}`,
      seller: {
        '@type': 'Organization',
        name: 'Afilo',
        url: 'https://app.afilo.io',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      reviewCount: '1',
      bestRating: '5',
      worstRating: '1',
    },
    ...(product.hasDemo && product.demoUrl && {
      potentialAction: {
        '@type': 'ViewAction',
        name: 'Try Demo',
        target: product.demoUrl,
      },
    }),
  };
}