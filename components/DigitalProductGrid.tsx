'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { getProducts, getProductsSimple } from '@/lib/shopify';
import { useDigitalCart } from '@/hooks/useDigitalCart';
import type { ShopifyProduct, ProductsQueryParams } from '@/types/shopify';
import type { LicenseType } from '@/store/digitalCart';

// Types
interface DigitalProductGridProps {
  initialProducts?: ShopifyProduct[];
  searchQuery?: string;
  sortBy?: 'TITLE' | 'PRICE' | 'BEST_SELLING' | 'CREATED_AT' | 'UPDATED_AT';
  sortReverse?: boolean;
  className?: string;
  showLoadMore?: boolean;
  productsPerPage?: number;
  onProductClick?: (product: ShopifyProduct) => void;
}

interface DigitalProductCardProps {
  product: ShopifyProduct;
  onProductClick?: (product: ShopifyProduct) => void;
  index: number;
}

// Digital product utilities (same as ProductGrid but enhanced)
const getTechStackFromProduct = (product: ShopifyProduct): string[] => {
  const title = product.title.toLowerCase();
  const description = product.description.toLowerCase();
  const productType = product.productType?.toLowerCase() || '';
  const tags = product.tags || [];

  const techStack: string[] = [];

  // Frontend frameworks
  if (title.includes('react') || description.includes('react') || tags.includes('react')) techStack.push('React');
  if (title.includes('vue') || description.includes('vue') || tags.includes('vue')) techStack.push('Vue');
  if (title.includes('angular') || description.includes('angular') || tags.includes('angular')) techStack.push('Angular');
  if (title.includes('next') || description.includes('next') || tags.includes('nextjs')) techStack.push('Next.js');
  if (title.includes('svelte') || description.includes('svelte') || tags.includes('svelte')) techStack.push('Svelte');

  // Backend & Languages
  if (title.includes('python') || description.includes('python') || tags.includes('python')) techStack.push('Python');
  if (title.includes('javascript') || description.includes('javascript') || tags.includes('javascript')) techStack.push('JavaScript');
  if (title.includes('typescript') || description.includes('typescript') || tags.includes('typescript')) techStack.push('TypeScript');
  if (title.includes('node') || description.includes('node') || tags.includes('nodejs')) techStack.push('Node.js');
  if (title.includes('php') || description.includes('php') || tags.includes('php')) techStack.push('PHP');
  if (title.includes('java') || description.includes('java') || tags.includes('java')) techStack.push('Java');
  if (title.includes('go') || description.includes('golang') || tags.includes('go')) techStack.push('Go');
  if (title.includes('rust') || description.includes('rust') || tags.includes('rust')) techStack.push('Rust');

  // Technologies
  if (title.includes('ai') || description.includes('ai') || tags.includes('ai')) techStack.push('AI');
  if (title.includes('machine learning') || description.includes('ml') || tags.includes('ml')) techStack.push('ML');
  if (title.includes('web3') || description.includes('blockchain') || tags.includes('web3')) techStack.push('Web3');
  if (title.includes('docker') || description.includes('docker') || tags.includes('docker')) techStack.push('Docker');
  if (title.includes('kubernetes') || description.includes('k8s') || tags.includes('kubernetes')) techStack.push('Kubernetes');

  // Databases
  if (title.includes('mongodb') || description.includes('mongodb') || tags.includes('mongodb')) techStack.push('MongoDB');
  if (title.includes('postgresql') || description.includes('postgres') || tags.includes('postgresql')) techStack.push('PostgreSQL');
  if (title.includes('mysql') || description.includes('mysql') || tags.includes('mysql')) techStack.push('MySQL');
  if (title.includes('redis') || description.includes('redis') || tags.includes('redis')) techStack.push('Redis');

  // Cloud & Services
  if (title.includes('aws') || description.includes('amazon web services') || tags.includes('aws')) techStack.push('AWS');
  if (title.includes('firebase') || description.includes('firebase') || tags.includes('firebase')) techStack.push('Firebase');
  if (title.includes('supabase') || description.includes('supabase') || tags.includes('supabase')) techStack.push('Supabase');

  // Styling
  if (title.includes('tailwind') || description.includes('tailwind') || tags.includes('tailwind')) techStack.push('Tailwind');
  if (title.includes('bootstrap') || description.includes('bootstrap') || tags.includes('bootstrap')) techStack.push('Bootstrap');
  if (title.includes('scss') || description.includes('sass') || tags.includes('scss')) techStack.push('SCSS');

  return techStack.slice(0, 4); // Limit to 4 most relevant
};

const getLicenseType = (product: ShopifyProduct): LicenseType => {
  const price = parseFloat(product.variants?.edges?.[0]?.node?.price?.amount || '0');
  const title = product.title.toLowerCase();
  const description = product.description.toLowerCase();

  // Check for explicit license mentions
  if (title.includes('enterprise') || description.includes('enterprise')) return 'Enterprise';
  if (title.includes('commercial') || description.includes('commercial')) return 'Commercial';
  if (title.includes('developer') || description.includes('developer')) return 'Developer';
  if (title.includes('extended') || description.includes('extended')) return 'Extended';

  // Price-based classification
  if (price === 0) return 'Free';
  if (price < 50) return 'Personal';
  if (price < 200) return 'Commercial';
  return 'Extended';
};

const getDigitalProductType = (product: ShopifyProduct): { type: string; color: string; icon: string } => {
  const title = product.title.toLowerCase();
  const description = product.description.toLowerCase();
  const productType = product.productType?.toLowerCase() || '';

  if (title.includes('template') || productType.includes('template')) {
    return { type: 'Template', color: 'bg-purple-100 text-purple-800', icon: '📄' };
  }
  if (title.includes('script') || title.includes('code') || productType.includes('script')) {
    return { type: 'Script', color: 'bg-green-100 text-green-800', icon: '⚡' };
  }
  if (title.includes('ai') || title.includes('artificial intelligence') || productType.includes('ai')) {
    return { type: 'AI Tool', color: 'bg-blue-100 text-blue-800', icon: '🤖' };
  }
  if (title.includes('plugin') || title.includes('extension') || productType.includes('plugin')) {
    return { type: 'Plugin', color: 'bg-orange-100 text-orange-800', icon: '🔌' };
  }
  if (title.includes('theme') || productType.includes('theme')) {
    return { type: 'Theme', color: 'bg-pink-100 text-pink-800', icon: '🎨' };
  }
  if (title.includes('app') || title.includes('application') || productType.includes('app')) {
    return { type: 'Application', color: 'bg-indigo-100 text-indigo-800', icon: '📱' };
  }
  if (title.includes('api') || title.includes('service') || productType.includes('api')) {
    return { type: 'API/Service', color: 'bg-teal-100 text-teal-800', icon: '🔗' };
  }
  if (title.includes('data') || title.includes('dataset') || productType.includes('data')) {
    return { type: 'Dataset', color: 'bg-yellow-100 text-yellow-800', icon: '📊' };
  }

  return { type: 'Software', color: 'bg-gray-100 text-gray-800', icon: '💻' };
};

const hasDocumentation = (product: ShopifyProduct): boolean => {
  const description = product.description.toLowerCase();
  const tags = product.tags || [];

  return description.includes('documentation') ||
         description.includes('docs') ||
         description.includes('guide') ||
         description.includes('tutorial') ||
         tags.includes('documented') ||
         tags.includes('docs');
};

const hasDemo = (product: ShopifyProduct): boolean => {
  const description = product.description.toLowerCase();
  const tags = product.tags || [];

  return description.includes('demo') ||
         description.includes('preview') ||
         description.includes('live demo') ||
         tags.includes('demo') ||
         tags.includes('preview');
};

const getVersionNumber = (product: ShopifyProduct): string | null => {
  const title = product.title;
  const description = product.description;

  const versionRegex = /v?(\d+\.?\d*\.?\d*)/i;
  const titleMatch = title.match(versionRegex);
  const descMatch = description.match(versionRegex);

  return titleMatch?.[1] || descMatch?.[1] || null;
};

// Loading skeleton component
const ProductCardSkeleton = () => (
  <div className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden">
    <div className="aspect-square bg-gray-200 animate-pulse" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded animate-pulse" />
      <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
      <div className="flex justify-between items-center">
        <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse" />
        <div className="h-8 bg-gray-200 rounded w-20 animate-pulse" />
      </div>
    </div>
  </div>
);

// Digital Product Card Component with Cart Integration
const DigitalProductCard = ({ product, onProductClick, index }: DigitalProductCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  // Digital cart integration
  const { addProductToCart, quickPurchase, isLoading, error } = useDigitalCart();

  // Get primary and secondary images
  const images = product.images?.edges?.map(edge => edge.node) || [];
  const primaryImage = product.featuredImage || images[0];
  const secondaryImage = images[1];

  // Get default variant for pricing
  const defaultVariant = product.variants?.edges?.[0]?.node;
  const isAvailable = product.availableForSale || (defaultVariant?.availableForSale ?? true);

  // Digital product specific data
  const techStack = getTechStackFromProduct(product);
  const licenseType = getLicenseType(product);
  const digitalType = getDigitalProductType(product);
  const hasDoc = hasDocumentation(product);
  const hasLiveDemo = hasDemo(product);
  const version = getVersionNumber(product);

  // Format price
  const formatPrice = (amount: string, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(parseFloat(amount));
  };

  // Handle add to cart with digital cart
  const handleAddToCart = async (e: React.MouseEvent, licenseOption: LicenseType = licenseType) => {
    e.stopPropagation();
    if (!defaultVariant || !isAvailable) return;

    const result = await addProductToCart(product, {
      licenseType: licenseOption,
      quantity: 1,
      variantId: defaultVariant.id
    });

    if (!result.success && result.error) {
      console.error('Failed to add to cart:', result.error);
    }
  };

  // Handle quick purchase
  const handleQuickPurchase = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!defaultVariant || !isAvailable) return;

    const result = await quickPurchase(product, licenseType);

    if (!result.success && result.error) {
      console.error('Quick purchase failed:', result.error);
    }
  };

  // Handle product click
  const handleProductClick = () => {
    onProductClick?.(product);
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.4, 0, 0.2, 1] as const
      }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-xl hover:border-gray-300 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
      onClick={handleProductClick}
    >
      {/* Product Type Badge */}
      <div className="absolute top-3 left-3 z-10 flex gap-2">
        <span className={`${digitalType.color} px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1`}>
          <span>{digitalType.icon}</span>
          {digitalType.type}
        </span>

        {version && (
          <span className="bg-black text-white px-2 py-1 rounded-full text-xs font-medium">
            v{version}
          </span>
        )}
      </div>

      {/* Sale Badge */}
      {defaultVariant?.compareAtPrice && parseFloat(defaultVariant.compareAtPrice.amount) > parseFloat(defaultVariant.price.amount) && (
        <div className="absolute top-3 right-3 z-10">
          <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            SALE
          </span>
        </div>
      )}

      {/* Product Image */}
      <div className="aspect-square relative bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-blue-50 group-hover:to-purple-50 transition-all duration-300">
        {primaryImage && !imageError ? (
          <>
            <Image
              src={primaryImage.url}
              alt={primaryImage.altText || product.title}
              fill
              className={`object-cover transition-opacity duration-300 ${
                currentImageIndex === 0 ? 'opacity-100' : 'opacity-0'
              }`}
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
              loading="lazy"
              onError={() => setImageError(true)}
            />

            {secondaryImage && (
              <Image
                src={secondaryImage.url}
                alt={secondaryImage.altText || product.title}
                fill
                className={`object-cover transition-opacity duration-300 ${
                  currentImageIndex === 1 ? 'opacity-100' : 'opacity-0'
                }`}
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
                loading="lazy"
                onMouseEnter={() => setCurrentImageIndex(1)}
                onMouseLeave={() => setCurrentImageIndex(0)}
              />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            {digitalType.icon}
          </div>
        )}

        {/* Instant Download Badge */}
        <div className="absolute bottom-3 left-3">
          <div className="bg-green-500 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Instant Download
          </div>
        </div>

        {/* Demo Button */}
        {hasLiveDemo && (
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('View demo for:', product.title);
              }}
              className="bg-blue-500 text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-blue-600 transition-colors flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Demo
            </button>
          </div>
        )}
      </div>

      {/* Product Content */}
      <div className="p-4">
        {/* Vendor and Documentation */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500 font-medium">{product.vendor}</span>
          {hasDoc && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-medium">
              Docs
            </span>
          )}
        </div>

        {/* Product Title */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.title}
        </h3>

        {/* Tech Stack Badges */}
        {techStack.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {techStack.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* Price and License */}
        <div className="flex items-center justify-between mb-3">
          <div>
            {defaultVariant && (
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(defaultVariant.price.amount, defaultVariant.price.currencyCode)}
                </span>
                {defaultVariant.compareAtPrice && parseFloat(defaultVariant.compareAtPrice.amount) > parseFloat(defaultVariant.price.amount) && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(defaultVariant.compareAtPrice.amount, defaultVariant.compareAtPrice.currencyCode)}
                  </span>
                )}
              </div>
            )}
            <span className="text-xs text-gray-600">{licenseType} License</span>
          </div>

          <div className="text-right">
            <div className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-medium">
              Digital
            </div>
            <span className="text-xs text-green-600 font-medium">Instant Access</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Add to Cart */}
          {isAvailable && (
            <button
              onClick={(e) => handleAddToCart(e)}
              disabled={isLoading}
              className="flex-1 bg-black text-white text-sm font-medium px-3 py-2 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              aria-label={`Add ${product.title} to cart`}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border border-white border-t-transparent" />
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9m-9 0v-2m9 2v-2" />
                  </svg>
                  Add to Cart
                </>
              )}
            </button>
          )}

          {/* Quick Purchase */}
          {isAvailable && (
            <button
              onClick={handleQuickPurchase}
              disabled={isLoading}
              className="px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors"
              aria-label={`Quick purchase ${product.title}`}
            >
              Buy Now
            </button>
          )}
        </div>

        {error && (
          <div className="mt-2 text-xs text-red-600">
            {error}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Main Digital Product Grid Component
export default function DigitalProductGrid({
  initialProducts = [],
  searchQuery = '',
  sortBy = 'UPDATED_AT',
  sortReverse = false,
  className = '',
  showLoadMore = true,
  productsPerPage = 12,
  onProductClick
}: DigitalProductGridProps) {
  const [products, setProducts] = useState<ShopifyProduct[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);

  // Query parameters for API calls
  const queryParams = useMemo(() => ({
    first: productsPerPage,
    query: searchQuery || undefined,
    sortKey: sortBy,
    reverse: sortReverse,
    after: cursor || undefined
  }), [searchQuery, sortBy, sortReverse, productsPerPage, cursor]);

  // Load products function
  const loadProducts = useCallback(async (isLoadMore = false) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🎯 Loading products with params:', queryParams);

      const response = await getProductsSimple(queryParams);
      console.log('📦 Products response:', response);

      if (response && Array.isArray(response)) {
        if (isLoadMore) {
          setProducts(prev => [...prev, ...response]);
        } else {
          setProducts(response);
          setCursor(null);
        }

        setHasMore(response.length === productsPerPage);
      } else {
        console.warn('⚠️ Invalid products response:', response);
        setProducts([]);
        setHasMore(false);
      }
    } catch (err) {
      console.error('❌ Failed to load products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
      if (!isLoadMore) {
        setProducts([]);
      }
    } finally {
      setLoading(false);
    }
  }, [queryParams, productsPerPage]);

  // Load more products
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadProducts(true);
    }
  }, [loading, hasMore, loadProducts]);

  // Load products on mount and when query changes
  useEffect(() => {
    loadProducts();
  }, [searchQuery, sortBy, sortReverse]);

  // Loading state
  if (loading && products.length === 0) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
        {Array.from({ length: productsPerPage }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  // Error state
  if (error && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load products</h3>
        <p className="text-gray-600 mb-4 text-center max-w-md">
          {error}
        </p>
        <button
          onClick={() => loadProducts()}
          className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Empty state
  if (!loading && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m0 0v-2a2 2 0 011-1h6a2 2 0 011 1v2m-6 0h6" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-600">
          {searchQuery ? `No products match "${searchQuery}"` : 'No products available at the moment'}
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Products Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {products.map((product, index) => (
            <DigitalProductCard
              key={product.id}
              product={product}
              onProductClick={onProductClick}
              index={index}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Load More Button */}
      {showLoadMore && hasMore && !loading && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMore}
            className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors font-medium"
          >
            Load More Products
          </button>
        </div>
      )}

      {/* Loading indicator for load more */}
      {loading && products.length > 0 && (
        <div className="flex justify-center mt-8">
          <div className="animate-spin rounded-full h-8 w-8 border border-gray-300 border-t-black"></div>
        </div>
      )}

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
          <div>Loading: {loading.toString()}</div>
          <div>Products: {products.length}</div>
          <div>Has More: {hasMore.toString()}</div>
          <div>Error: {error || 'none'}</div>
          <div>Search: {searchQuery || 'none'}</div>
          <div>Sort: {sortBy} ({sortReverse ? 'desc' : 'asc'})</div>
        </div>
      )}
    </div>
  );
}