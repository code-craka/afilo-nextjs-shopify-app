import { notFound } from 'next/navigation';
import { getProduct } from '@/lib/shopify';
import ProductDetailClient from '@/components/ProductDetailClient';

interface ProductPageProps {
  params: {
    handle: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = params;
  const product = await getProduct(handle);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}

// Optional: Add metadata generation
export async function generateMetadata({ params }: ProductPageProps) {
  const { handle } = params;
  const product = await getProduct(handle);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: product.seo?.title || product.title,
    description: product.seo?.description || product.description,
    openGraph: {
      title: product.seo?.title || product.title,
      description: product.seo?.description || product.description,
      images: [
        {
          url: product.featuredImage?.url || '',
          width: product.featuredImage?.width || 800,
          height: product.featuredImage?.height || 600,
          alt: product.featuredImage?.altText || product.title,
        },
      ],
      type: 'product',
    },
  };
}