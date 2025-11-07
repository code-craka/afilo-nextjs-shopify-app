import { Metadata } from 'next';
import { Suspense } from 'react';
import { getProducts } from '@/lib/db/products';
import { ProductCache } from '@/lib/cache/redis-cache';
import Navigation from '@/components/Navigation';
import ProductsPageClient from '@/components/ProductsPageClient';
import ProductGridSkeleton from '@/components/ProductGridSkeleton';

// Cache the page for 5 minutes with ISR
export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Digital Products | Afilo - Premium AI Tools & Software',
  description: 'Discover cutting-edge AI tools, premium templates, and digital software solutions. Browse our collection of high-quality digital products for developers and businesses.',
  keywords: 'digital products, AI tools, software, templates, scripts, plugins, enterprise solutions, developer tools',
  openGraph: {
    title: 'Digital Products | Afilo',
    description: 'Discover cutting-edge AI tools and premium software solutions',
    type: 'website',
    url: 'https://app.afilo.io/products',
    siteName: 'Afilo',
    images: [
      {
        url: '/og-products.png',
        width: 1200,
        height: 630,
        alt: 'Afilo Digital Products',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Digital Products | Afilo',
    description: 'Discover cutting-edge AI tools and premium software solutions',
    images: ['/og-products.png'],
    creator: '@afilo_enterprise',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://app.afilo.io/products',
  },
};

interface ProductsPageProps {
  searchParams?: Promise<{
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  // Extract search parameters
  const params = await searchParams;
  const searchQuery = params?.search || '';
  const urlSortBy = (params?.sortBy as 'title' | 'price' | 'createdAt' | 'updatedAt') || 'updatedAt';
  const sortOrder = (params?.sortOrder as 'asc' | 'desc') || 'desc';
  const page = parseInt(params?.page || '1', 10);
  const productsPerPage = 16;

  // Map URL sortBy to database schema field names
  const sortByMapping = {
    'title': 'title',
    'price': 'basePrice', // URL uses "price" but DB schema uses "basePrice"
    'createdAt': 'createdAt',
    'updatedAt': 'updatedAt',
  } as const;

  const sortBy = sortByMapping[urlSortBy];

  // Create filters object for caching
  const filters = {
    query: searchQuery || undefined,
    sortBy,
    sortOrder,
    first: productsPerPage,
    offset: (page - 1) * productsPerPage,
    status: 'active' as const,
    availableForSale: true,
  };

  // Try to get cached data first
  let initialProducts;
  try {
    const cachedResult = await ProductCache.getProductsList(filters);
    if (cachedResult) {
      initialProducts = Array.isArray(cachedResult) ? cachedResult : cachedResult.products;
    }
  } catch (error) {
    console.warn('Failed to get cached products:', error);
  }

  // If not cached, fetch from database
  if (!initialProducts) {
    try {
      const result = await getProducts(filters);
      initialProducts = result.products;

      // Cache the results using ProductCache method
      try {
        await ProductCache.cacheProductsList(filters, result.products, 300); // 5 minutes
      } catch (error) {
        console.warn('Failed to cache products:', error);
      }
    } catch (error) {
      console.error('Failed to fetch initial products:', error);
      initialProducts = [];
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductsPageClient
          initialProducts={initialProducts || []}
          initialSearchQuery={searchQuery}
          initialSortBy={urlSortBy}
          initialSortOrder={sortOrder}
          initialPage={page}
          productsPerPage={productsPerPage}
        />
      </Suspense>
    </div>
  );
}