'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProductGrid from '@/components/ProductGrid';
import { useDigitalCart } from '@/hooks/useDigitalCart';

export default function HomePageProductGrid() {
  const { addProductToCart } = useDigitalCart();
  const router = useRouter();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          Featured Products
        </h2>
        <p className="mt-4 text-xl text-gray-600">
          Explore our latest AI-powered tools and solutions
        </p>
      </div>

      <ProductGrid
        productsPerPage={8}
        showLoadMore={false}
        onProductClick={(product) => {
          router.push(`/products/${product.handle}`);
        }}
        onAddToCart={async (product, variantId) => {
          console.log('Adding to digital cart:', { product: product.title, variantId });

          const result = await addProductToCart(product, {
            variantId,
            licenseType: 'Personal', // Default license type
            quantity: 1,
          });

          if (result.success) {
            console.log('✅ Product added to digital cart successfully!');
          } else {
            console.error('❌ Failed to add to cart:', result.error);
          }
        }}
      />

      <div className="text-center mt-12">
        <Link
          href="/products"
          className="bg-black text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
        >
          View All Products
        </Link>
      </div>
    </div>
  );
}