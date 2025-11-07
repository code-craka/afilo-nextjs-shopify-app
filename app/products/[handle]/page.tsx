import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Navigation from '@/components/Navigation';
import ProductDetailClient from '@/components/ProductDetailClient';
import ProductDetailSkeleton from '@/components/skeletons/ProductDetailSkeleton';
import { getProductByHandle, getRelatedProducts } from '@/lib/db/products';
import { generateProductMetadata } from '@/lib/seo/product-metadata';

interface ProductPageProps {
  params: Promise<{ handle: string }>;
}

// Generate static params for popular products (ISR optimization)
export async function generateStaticParams() {
  // Pre-generate pages for featured products only to avoid build timeouts
  try {
    // We'll implement this after fixing the basic routing
    return [];
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  try {
    const { handle } = await params;
    const product = await getProductByHandle(handle);

    if (!product) {
      return {
        title: 'Product Not Found | Afilo',
        description: 'The requested product could not be found.',
      };
    }

    return generateProductMetadata(product);
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Product | Afilo',
      description: 'Discover premium digital products and AI tools.',
    };
  }
}

// Main product page component (Server Component)
export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;

  // Fetch product data on the server
  const [product, relatedProducts] = await Promise.allSettled([
    getProductByHandle(handle),
    getRelatedProducts(handle, 4).catch(() => []), // Graceful fallback for related products
  ]);

  // Handle product not found
  if (product.status === 'rejected' || !product.value) {
    notFound();
  }

  const productData = product.value;
  const relatedProductsData = relatedProducts.status === 'fulfilled' ? relatedProducts.value : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      {/* Main product detail content */}
      <main className="pt-20">
        <Suspense fallback={<ProductDetailSkeleton />}>
          <ProductDetailClient
            product={productData}
            relatedProducts={relatedProductsData}
          />
        </Suspense>
      </main>
    </div>
  );
}

// Enable ISR with revalidation
export const revalidate = 3600; // Revalidate every hour