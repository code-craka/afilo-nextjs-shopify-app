'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { getProducts, getProductsSimple } from '@/lib/shopify';
import type { ShopifyProduct, ProductsQueryParams } from '@/types/shopify';

// Types
interface ProductGridProps {
  initialProducts?: ShopifyProduct[];
  searchQuery?: string;
  sortBy?: 'TITLE' | 'PRICE' | 'BEST_SELLING' | 'CREATED_AT' | 'UPDATED_AT';
  sortReverse?: boolean;
  className?: string;
  showLoadMore?: boolean;
  productsPerPage?: number;
  onProductClick?: (product: ShopifyProduct) => void;
  onAddToCart?: (product: ShopifyProduct, variantId: string) => Promise<void>; // Pass full product instead of just ID
}

interface ProductCardProps {
  product: ShopifyProduct;
  onProductClick?: (product: ShopifyProduct) => void;
  onAddToCart?: (product: ShopifyProduct, variantId: string) => Promise<void>;
  index: number;
}

// Digital product utilities
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

  // Technologies & Platforms
  if (title.includes('ai') || description.includes('ai') || tags.includes('ai')) techStack.push('AI');
  if (title.includes('machine learning') || description.includes('ml') || tags.includes('ml')) techStack.push('ML');
  if (title.includes('blockchain') || description.includes('web3') || tags.includes('blockchain')) techStack.push('Web3');
  if (title.includes('docker') || description.includes('docker') || tags.includes('docker')) techStack.push('Docker');
  if (title.includes('kubernetes') || description.includes('k8s') || tags.includes('kubernetes')) techStack.push('K8s');
  if (title.includes('aws') || description.includes('aws') || tags.includes('aws')) techStack.push('AWS');
  if (title.includes('firebase') || description.includes('firebase') || tags.includes('firebase')) techStack.push('Firebase');
  if (title.includes('supabase') || description.includes('supabase') || tags.includes('supabase')) techStack.push('Supabase');
  if (title.includes('mongodb') || description.includes('mongo') || tags.includes('mongodb')) techStack.push('MongoDB');
  if (title.includes('postgresql') || description.includes('postgres') || tags.includes('postgresql')) techStack.push('PostgreSQL');

  // CSS & Design
  if (title.includes('tailwind') || description.includes('tailwind') || tags.includes('tailwind')) techStack.push('Tailwind');
  if (title.includes('bootstrap') || description.includes('bootstrap') || tags.includes('bootstrap')) techStack.push('Bootstrap');
  if (title.includes('scss') || description.includes('sass') || tags.includes('scss')) techStack.push('SCSS');

  return techStack.slice(0, 4); // Limit to 4 badges
};

const getLicenseType = (product: ShopifyProduct): string => {
  const title = product.title.toLowerCase();
  const description = product.description.toLowerCase();
  const tags = product.tags || [];

  if (title.includes('personal') || description.includes('personal use') || tags.includes('personal')) return 'Personal';
  if (title.includes('commercial') || description.includes('commercial') || tags.includes('commercial')) return 'Commercial';
  if (title.includes('extended') || description.includes('extended') || tags.includes('extended')) return 'Extended';
  if (title.includes('enterprise') || description.includes('enterprise') || tags.includes('enterprise')) return 'Enterprise';
  if (title.includes('developer') || description.includes('developer') || tags.includes('developer')) return 'Developer';

  // Default based on price range
  const price = parseFloat(product.priceRange?.minVariantPrice?.amount || '0');
  if (price === 0) return 'Free';
  if (price < 50) return 'Personal';
  if (price < 200) return 'Commercial';
  return 'Extended';
};

const getDigitalProductType = (product: ShopifyProduct): { type: string; color: string; icon: string } => {
  const title = product.title.toLowerCase();
  const productType = product.productType?.toLowerCase() || '';
  const description = product.description.toLowerCase();

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

  // Look for version patterns like v1.0, v2.1.3, version 1.0, etc.
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

// Product Card Component
const ProductCard = ({ product, onProductClick, onAddToCart, index }: ProductCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Get primary and secondary images - safe access
  const images = product.images?.edges?.map(edge => edge.node) || [];
  const primaryImage = product.featuredImage || images[0];
  const secondaryImage = images[1];

  // Get default variant for pricing and availability - safe access with fallbacks
  const defaultVariant = product.variants?.edges?.[0]?.node;
  // For digital products, if product is available for sale, consider it available even if variant isn't explicitly marked
  const isAvailable = product.availableForSale || (defaultVariant?.availableForSale ?? true);

  // Digital product specific data
  const techStack = getTechStackFromProduct(product);
  const licenseType = getLicenseType(product);
  const digitalType = getDigitalProductType(product);
  const hasDoc = hasDocumentation(product);
  const hasLiveDemo = hasDemo(product);
  const version = getVersionNumber(product);

  // Debug logging (remove in production)
  // console.log('🎯 ProductCard rendering:', { title: product.title, techStack, licenseType, digitalType });

  // Format price with premium/subscription detection
  const formatPrice = (amount: string, currencyCode: string) => {
    const price = parseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(price);
  };

  // Detect if this is a premium subscription product
  const isPremiumProduct = () => {
    const price = parseFloat(defaultVariant?.price?.amount || product.priceRange?.minVariantPrice?.amount || '0');
    return price >= 999; // Products priced $999+ are considered premium
  };

  // Detect if this is an enterprise product
  const isEnterpriseProduct = () => {
    const title = product.title.toLowerCase();
    const tags = product.tags || [];
    return title.includes('enterprise') || tags.includes('enterprise') ||
           title.includes('professional') || tags.includes('professional');
  };

  // Get subscription billing info
  const getSubscriptionInfo = () => {
    const title = product.title.toLowerCase();
    const description = product.description.toLowerCase();
    const tags = product.tags || [];

    if (title.includes('monthly') || description.includes('monthly') || tags.includes('monthly')) {
      return { billing: 'Monthly', period: '/month' };
    }
    if (title.includes('annual') || description.includes('annual') || tags.includes('annual')) {
      return { billing: 'Annual', period: '/year' };
    }

    // For premium products, default to monthly subscription
    if (isPremiumProduct()) {
      return { billing: 'Monthly', period: '/month' };
    }

    return { billing: 'One-time', period: '' };
  };

  // Handle add to cart
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!defaultVariant || !onAddToCart || isLoading) return;

    setIsLoading(true);
    try {
      await onAddToCart(product, defaultVariant.id); // Pass full product instead of just ID
    } catch (error) {
      console.error('Add to cart failed:', error);
    } finally {
      setIsLoading(false);
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
        ease: [0.25, 0.25, 0, 1] as const
      }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-gray-300 hover:scale-[1.02] cursor-pointer"
      onClick={handleProductClick}
      role="button"
      tabIndex={0}
      aria-label={`View ${product.title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleProductClick();
        }
      }}
    >
      {/* Product Image */}
      <div
        className="relative aspect-square overflow-hidden bg-gray-100"
        onMouseEnter={() => secondaryImage && setCurrentImageIndex(1)}
        onMouseLeave={() => setCurrentImageIndex(0)}
      >
        <AnimatePresence mode="wait">
          {primaryImage && !imageError ? (
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-full h-full"
            >
              <Image
                src={currentImageIndex === 0 ? primaryImage.url : (secondaryImage?.url || primaryImage.url)}
                alt={primaryImage.altText || product.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                loading="lazy"
                onError={() => setImageError(true)}
              />
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 text-gray-600">
              {/* Digital product icon based on type */}
              {product.productType?.toLowerCase().includes('ai') || product.title?.toLowerCase().includes('ai') ? (
                <svg className="w-16 h-16 mb-2 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 9.95 9 11 5.16-1.05 9-5.45 9-11V7l-10-5z"/>
                  <path d="M12 7l-3 3h2v4h2v-4h2l-3-3z"/>
                </svg>
              ) : product.productType?.toLowerCase().includes('template') ? (
                <svg className="w-16 h-16 mb-2 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
              ) : product.productType?.toLowerCase().includes('script') || product.productType?.toLowerCase().includes('code') ? (
                <svg className="w-16 h-16 mb-2 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8,3A2,2 0 0,0 6,5V9A2,2 0 0,1 4,11H3V13H4A2,2 0 0,1 6,15V19A2,2 0 0,0 8,21H10V19H8V14A2,2 0 0,0 6,12A2,2 0 0,0 8,10V5H10V3M16,3A2,2 0 0,1 18,5V9A2,2 0 0,0 20,11H21V13H20A2,2 0 0,0 18,15V19A2,2 0 0,1 16,21H14V19H16V14A2,2 0 0,1 18,12A2,2 0 0,1 16,10V5H14V3H16Z"/>
                </svg>
              ) : (
                <svg className="w-16 h-16 mb-2 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z"/>
                </svg>
              )}
              <p className="text-sm font-medium text-center px-2">
                {product.productType || 'Digital Product'}
              </p>
            </div>
          )}
        </AnimatePresence>

        {/* Digital Product Type Badge */}
        <div className={`absolute top-2 left-2 ${digitalType.color} text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1`}>
          <span>{digitalType.icon}</span>
          <span>{digitalType.type}</span>
        </div>

        {/* Version Badge */}
        {version && (
          <div className="absolute top-2 right-2 bg-black text-white text-xs font-semibold px-2 py-1 rounded">
            v{version}
          </div>
        )}

        {/* Sale Badge */}
        {defaultVariant?.compareAtPrice && (
          <div className="absolute top-12 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
            Sale
          </div>
        )}

        {/* Instant Download Badge */}
        <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Instant Download
        </div>

        {/* Demo/Preview Button */}
        {hasLiveDemo && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ opacity: 1, scale: 1 }}
            className="absolute bottom-2 right-2 bg-blue-500 text-white text-xs font-medium px-3 py-2 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center gap-1"
            onClick={(e) => {
              e.stopPropagation();
              // Handle demo click
              console.log('Demo clicked for:', product.title);
            }}
            aria-label={`View demo of ${product.title}`}
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Demo
          </motion.button>
        )}

      </div>

      {/* Product Details */}
      <div className="p-4 space-y-3">
        {/* Header Row: Vendor & Features */}
        <div className="flex items-center justify-between">
          {product.vendor && (
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
              {product.vendor}
            </p>
          )}
          <div className="flex items-center gap-1">
            {hasDoc && (
              <div className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded flex items-center gap-1" title="Documentation included">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                Docs
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-black transition-colors leading-tight">
          {product.title}
        </h3>

        {/* Tech Stack Badges */}
        {techStack.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {techStack.map((tech, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* Price & License Row */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              {defaultVariant?.price ? (
                <>
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-1">
                      <span className={`font-bold text-lg ${isPremiumProduct() ? 'text-purple-700' : 'text-gray-900'}`}>
                        {formatPrice(defaultVariant.price.amount, defaultVariant.price.currencyCode)}
                      </span>
                      {getSubscriptionInfo().period && (
                        <span className="text-sm text-gray-600 font-medium">
                          {getSubscriptionInfo().period}
                        </span>
                      )}
                    </div>
                    {isPremiumProduct() && (
                      <div className="flex items-center gap-1">
                        <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                          PREMIUM
                        </span>
                        {isEnterpriseProduct() && (
                          <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                            ENTERPRISE
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  {defaultVariant.compareAtPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(defaultVariant.compareAtPrice.amount, defaultVariant.compareAtPrice.currencyCode)}
                    </span>
                  )}
                </>
              ) : product.priceRange?.minVariantPrice ? (
                <>
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-1">
                      <span className={`font-bold text-lg ${isPremiumProduct() ? 'text-purple-700' : 'text-gray-900'}`}>
                        {formatPrice(product.priceRange.minVariantPrice.amount, product.priceRange.minVariantPrice.currencyCode)}
                      </span>
                      {getSubscriptionInfo().period && (
                        <span className="text-sm text-gray-600 font-medium">
                          {getSubscriptionInfo().period}
                        </span>
                      )}
                    </div>
                    {isPremiumProduct() && (
                      <div className="flex items-center gap-1">
                        <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                          PREMIUM
                        </span>
                        {isEnterpriseProduct() && (
                          <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                            ENTERPRISE
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <span className="font-bold text-lg text-gray-900">Free</span>
              )}
            </div>

            {/* License Type & Subscription Info */}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-600 font-medium">
                {licenseType} License
              </span>
              {getSubscriptionInfo().billing !== 'One-time' && (
                <span className="text-xs text-blue-600 font-medium">
                  {getSubscriptionInfo().billing} Subscription
                </span>
              )}
            </div>
          </div>

          {/* Digital Status */}
          <div className="text-right">
            <div className="flex items-center justify-end">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs ml-1 text-green-600 font-medium">
                Digital
              </span>
            </div>
            <span className="text-xs text-gray-500">
              Instant Access
            </span>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex gap-2 pt-2">
          {/* Quick Add to Cart / Subscribe */}
          {isAvailable && onAddToCart && (
            <button
              onClick={handleAddToCart}
              disabled={isLoading}
              className={`flex-1 ${isPremiumProduct()
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                : 'bg-black hover:bg-gray-800'
              } text-white text-sm font-medium px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${isPremiumProduct()
                ? 'focus:ring-purple-500'
                : 'focus:ring-black'
              } disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2`}
              aria-label={`${isPremiumProduct() ? 'Subscribe to' : 'Add'} ${product.title} ${isPremiumProduct() ? '' : 'to cart'}`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" />
                  {isPremiumProduct() ? 'Subscribing...' : 'Adding...'}
                </>
              ) : (
                <>
                  {isPremiumProduct() ? (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      Start Subscription
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 1.5M7 13h10m-10 0l1.5-1.5m8.5 1.5H9" />
                      </svg>
                      Add to Cart
                    </>
                  )}
                </>
              )}
            </button>
          )}

          {/* View Details */}
          <button
            onClick={handleProductClick}
            className="bg-gray-100 text-gray-700 text-sm font-medium px-3 py-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors flex items-center gap-1"
            aria-label={`View details for ${product.title}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Details
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Main ProductGrid Component
export default function ProductGrid({
  initialProducts = [],
  searchQuery = '',
  sortBy = 'UPDATED_AT',
  sortReverse = false,
  className = '',
  showLoadMore = true,
  productsPerPage = 12,
  onProductClick,
  onAddToCart
}: ProductGridProps) {
  const [products, setProducts] = useState<ShopifyProduct[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);

  // Memoized query parameters
  const queryParams = useMemo<ProductsQueryParams>(() => ({
    first: productsPerPage,
    query: searchQuery || undefined,
    sortKey: sortBy,
    reverse: sortReverse,
    after: cursor || undefined
  }), [searchQuery, sortBy, sortReverse, productsPerPage, cursor]);

  // Load products function with enhanced debugging
  const loadProducts = useCallback(async (isLoadMore = false) => {
    try {
      console.log('🚀 ProductGrid loadProducts called:', { isLoadMore, queryParams });

      if (isLoadMore) {
        setLoadingMore(true);
        console.log('⏳ Loading more products...');
      } else {
        setLoading(true);
        setError(null);
        console.log('⏳ Loading initial products...');
      }

      // Use the working simple query instead of complex fragments
      console.log('🔍 Calling getProductsSimple...');
      const newProducts = await getProductsSimple(queryParams);
      console.log('✅ getProductsSimple returned:', newProducts.length, 'products');

      // Log raw products data before transformation
      console.log('🔍 Raw products sample:', newProducts[0]);

      // Transform the data to match our ShopifyProduct interface
      const transformedProducts = newProducts.map((product, index) => {
        console.log(`🔄 Transforming product ${index + 1}:`, {
          title: product.title,
          hasImages: !!product.images,
          imageStructure: product.images,
          hasVariants: !!product.variants,
          variantStructure: product.variants,
          availableForSale: product.availableForSale
        });

        return {
          ...product,
          // Ensure proper structure for any missing fields
          images: product.images || { edges: [] },
          variants: product.variants || { edges: [] },
          options: product.options || [],
          tags: product.tags || [],
          seo: product.seo || { title: null, description: null },
          priceRange: product.priceRange || {
            minVariantPrice: { amount: '0', currencyCode: 'USD' },
            maxVariantPrice: { amount: '0', currencyCode: 'USD' }
          }
        };
      });

      console.log('🔄 Transformed products:', transformedProducts.map(p => p.title));

      if (isLoadMore) {
        setProducts(prev => {
          const combined = [...prev, ...transformedProducts];
          console.log('📦 Combined products count:', combined.length);
          return combined;
        });
      } else {
        setProducts(transformedProducts);
        console.log('📦 Set initial products count:', transformedProducts.length);
      }

      // Check if there are more products (simplified logic)
      setHasMore(newProducts.length === productsPerPage);
      console.log('🔮 Has more products:', newProducts.length === productsPerPage);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load products';
      console.error('❌ ProductGrid loadProducts failed:', err);
      console.error('❌ Error details:', {
        message: errorMessage,
        stack: err instanceof Error ? err.stack : 'No stack trace',
        queryParams
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      console.log('🏁 ProductGrid loadProducts finished');
    }
  }, [queryParams, productsPerPage]);

  // Load more products
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    // Set cursor to the last product's cursor (simplified)
    if (products.length > 0) {
      setCursor(products[products.length - 1].id);
    }

    await loadProducts(true);
  }, [loadProducts, loadingMore, hasMore, products]);

  // Initial load and reload on query changes
  useEffect(() => {
    console.log('🔄 ProductGrid useEffect triggered:', {
      initialProductsLength: initialProducts.length,
      queryParams
    });

    if (initialProducts.length === 0) {
      setCursor(null);
      loadProducts(false);
    } else {
      console.log('📦 Using initial products:', initialProducts.length);
      setProducts(initialProducts);
    }
  }, [loadProducts, initialProducts.length]);

  // Retry function
  const retry = () => {
    setCursor(null);
    loadProducts(false);
  };

  // Loading state
  if (loading && products.length === 0) {
    console.log('🔄 Showing loading state');
    return (
      <div className={className}>
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-blue-700">🔄 Loading products...</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: productsPerPage }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error && products.length === 0) {
    console.log('❌ Showing error state:', error);
    return (
      <div className={className}>
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-700">❌ Error: {error}</p>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load products</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={retry}
              className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state - only show if not loading and no error
  if (!loading && !error && products.length === 0) {
    console.log('📭 Showing empty state');
    return (
      <div className={className}>
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded">
          <p className="text-gray-700">📭 No products to display</p>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">
              {searchQuery ? `No products match "${searchQuery}"` : 'No products available at the moment'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  console.log('🎯 Rendering products grid with', products.length, 'products');

  return (
    <div className={className}>
      {/* Debug Info - Hidden in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded text-xs">
          <span className="font-medium">Debug:</span> Loading: {loading.toString()} | Products: {products.length} | Error: {error || 'none'}
        </div>
      )}

      {/* Products Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            onProductClick={onProductClick}
            onAddToCart={onAddToCart}
            index={index}
          />
        ))}
      </motion.div>

      {/* Load More Button */}
      {showLoadMore && hasMore && products.length > 0 && (
        <div className="flex justify-center mt-12">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="bg-black text-white px-8 py-3 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            {loadingMore ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" />
                <span>Loading More...</span>
              </div>
            ) : (
              'Load More Products'
            )}
          </button>
        </div>
      )}

      {/* Loading More Skeletons */}
      {loadingMore && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {Array.from({ length: Math.min(4, productsPerPage) }).map((_, index) => (
            <ProductCardSkeleton key={`loading-${index}`} />
          ))}
        </div>
      )}
    </div>
  );
}