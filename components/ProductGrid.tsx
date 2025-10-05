'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
// No longer importing from shopify lib directly on client
import type { ShopifyProduct, ProductsQueryParams } from '@/types/shopify';
import { log } from '@/lib/logger';

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
      log.error('Add to cart failed', error, { component: 'ProductGrid', action: 'addToCart' });
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
      whileHover={{ y: -10, scale: 1.02 }}
      className="group relative backdrop-blur-xl bg-white/80 border border-gray-200/50 rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:border-blue-200 cursor-pointer"
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
      {/* Glassmorphic Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
      {/* Product Image */}
      <div
        className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100"
        onMouseEnter={() => secondaryImage && setCurrentImageIndex(1)}
        onMouseLeave={() => setCurrentImageIndex(0)}
      >
        {/* Image Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
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

        {/* Digital Product Type Badge - Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute top-3 left-3 backdrop-blur-xl bg-white/80 border border-white/40 text-xs font-bold px-3 py-2 rounded-2xl flex items-center gap-1.5 shadow-lg z-20"
        >
          <span className="text-xl">{digitalType.icon}</span>
          <span className="text-gray-900">{digitalType.type}</span>
        </motion.div>

        {/* Version Badge - Glassmorphism */}
        {version && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="absolute top-3 right-3 backdrop-blur-xl bg-black/80 border border-white/20 text-white text-xs font-bold px-3 py-2 rounded-2xl shadow-lg z-20"
          >
            v{version}
          </motion.div>
        )}

        {/* Sale Badge - Premium Style */}
        {defaultVariant?.compareAtPrice && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="absolute top-16 left-3 backdrop-blur-xl bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-2 rounded-2xl shadow-lg z-20"
          >
            🔥 Sale
          </motion.div>
        )}

        {/* Download Badge - Glassmorphism (Icon Only) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="absolute bottom-3 left-3 backdrop-blur-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold p-2.5 rounded-2xl flex items-center justify-center shadow-lg z-20"
          title="Instant Download"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </motion.div>

        {/* Demo/Preview Button - Glassmorphism */}
        {hasLiveDemo && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            whileHover={{ scale: 1.05, y: 0 }}
            whileTap={{ scale: 0.95 }}
            className="absolute bottom-3 right-3 backdrop-blur-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-4 py-2.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 flex items-center gap-1.5 z-20"
            onClick={(e) => {
              e.stopPropagation();
              log.debug('Demo clicked', { productTitle: product.title, productId: product.id });
            }}
            aria-label={`View demo of ${product.title}`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Live Demo
          </motion.button>
        )}

      </div>

      {/* Product Details */}
      <div className="relative p-6 space-y-4">
        {/* Header Row: Vendor & Features */}
        <div className="flex items-center justify-between">
          {product.vendor && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-gray-500 uppercase tracking-wider font-bold"
            >
              {product.vendor}
            </motion.p>
          )}
          <div className="flex items-center gap-1.5">
            {hasDoc && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="backdrop-blur-xl bg-blue-50/80 border border-blue-200/50 text-blue-700 text-xs px-2.5 py-1.5 rounded-xl flex items-center gap-1 font-semibold"
                title="Documentation included"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                Docs
              </motion.div>
            )}
          </div>
        </div>

        {/* Title */}
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-bold text-lg text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight"
        >
          {product.title}
        </motion.h3>

        {/* Tech Stack Badges - Premium Style */}
        {techStack.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-2"
          >
            {techStack.map((tech, index) => (
              <motion.span
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                whileHover={{ scale: 1.1, y: -2 }}
                className="backdrop-blur-xl bg-gradient-to-r from-gray-100/80 to-gray-50/80 border border-gray-200/50 text-gray-800 text-xs px-3 py-1.5 rounded-xl font-semibold hover:border-blue-300 transition-all"
              >
                {tech}
              </motion.span>
            ))}
          </motion.div>
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

        {/* Action Buttons Row - Premium Style */}
        <div className="flex gap-3 pt-4">
          {/* Quick Add to Cart / Subscribe - Glassmorphism */}
          {isAvailable && onAddToCart && (
            <motion.button
              onClick={handleAddToCart}
              disabled={isLoading}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 relative overflow-hidden group ${isPremiumProduct()
                ? 'bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 hover:shadow-2xl hover:shadow-purple-500/50'
                : 'bg-gradient-to-r from-gray-900 to-black hover:shadow-2xl hover:shadow-black/50'
              } text-white text-sm font-bold px-4 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 ${isPremiumProduct()
                ? 'focus:ring-purple-500'
                : 'focus:ring-black'
              } disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2`}
              aria-label={`${isPremiumProduct() ? 'Subscribe to' : 'Add'} ${product.title} ${isPremiumProduct() ? '' : 'to cart'}`}
            >
              {/* Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="relative z-10">{isPremiumProduct() ? 'Subscribing...' : 'Adding...'}</span>
                </>
              ) : (
                <>
                  {isPremiumProduct() ? (
                    <>
                      <svg className="w-5 h-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      <span className="relative z-10">Subscribe</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <span className="relative z-10">Add to Cart</span>
                    </>
                  )}
                </>
              )}
            </motion.button>
          )}

          {/* View Details - Glassmorphism */}
          <motion.button
            onClick={handleProductClick}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="backdrop-blur-xl bg-gray-100/80 border border-gray-200/50 text-gray-900 text-sm font-bold px-4 py-3.5 rounded-2xl hover:bg-gray-200/80 hover:border-gray-300/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300 flex items-center gap-2"
            aria-label={`View details for ${product.title}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </motion.button>
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

  // Fetch products using TanStack Query for automatic caching
  const fetchProducts = async (): Promise<ShopifyProduct[]> => {
    const urlParams = new URLSearchParams({
      first: String(queryParams.first),
      ...(queryParams.after && { after: queryParams.after }),
      ...(queryParams.query && { query: queryParams.query }),
      ...(queryParams.sortKey && { sortBy: queryParams.sortKey }),
      ...(queryParams.reverse && { sortReverse: String(queryParams.reverse) }),
    });

    const response = await fetch(`/api/products?${urlParams.toString()}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch products' }));
      throw new Error(errorData.message || 'Failed to fetch products from API');
    }

    const { products: newProducts } = await response.json();
    return newProducts;
  };

  // Use TanStack Query for data fetching with automatic caching
  const {
    data: fetchedProducts,
    isLoading: queryLoading,
    isError,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: ['products', queryParams],
    queryFn: fetchProducts,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    enabled: true, // Always fetch
  });

  // Sync query results to local state
  useEffect(() => {
    if (fetchedProducts) {
      setProducts(fetchedProducts);
      setHasMore(fetchedProducts.length === productsPerPage);
      setError(null);
    }
  }, [fetchedProducts, productsPerPage]);

  // Handle query errors
  useEffect(() => {
    if (isError && queryError) {
      const errorMessage = queryError instanceof Error ? queryError.message : 'Failed to load products';
      setError(errorMessage);
      log.error('ProductGrid query failed', {
        message: errorMessage,
        queryParams
      });
    }
  }, [isError, queryError, queryParams]);

  // Update loading state
  useEffect(() => {
    setLoading(queryLoading);
  }, [queryLoading]);

  // Load more products
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    // Set cursor to the last product's cursor
    if (products.length > 0) {
      setCursor(products[products.length - 1].id);
    }
  }, [loadingMore, hasMore, products]);

  // Handle initial products
  useEffect(() => {
    if (initialProducts.length > 0) {
      log.debug('Using initial products', { count: initialProducts.length });
      setProducts(initialProducts);
    }
  }, [initialProducts]);

  // Retry function
  const retry = () => {
    setCursor(null);
    refetch();
  };

  // Loading state
  if (loading && products.length === 0) {
    log.debug('Showing loading state');
    return (
      <div className={className}>
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
    log.debug('Showing error state', { error });
    return (
      <div className={className}>
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
    log.debug('Showing empty state');
    return (
      <div className={className}>
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

  log.debug('Rendering products grid', { productsCount: products.length });

  return (
    <div className={className}>
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