'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Download,
  Shield,
  Clock,
  Users,
  ExternalLink,
  Check,
  Heart,
  Share2,
  ShoppingCart,
  Play,
  BookOpen,
  Award,
  Zap,
} from 'lucide-react';
import { useDigitalCart } from '@/hooks/useDigitalCart';
import type { Product, ProductVariant } from '@/lib/validations/product';

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const { addProductToCart } = useDigitalCart();
  const router = useRouter();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants?.[0] || null
  );
  const [activeTab, setActiveTab] = useState<'description' | 'features' | 'requirements' | 'support'>('description');
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Format price for display
  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!selectedVariant) return;

    const result = await addProductToCart(product, {
      variantId: selectedVariant.id,
      licenseType: selectedVariant.licenseType,
      quantity: 1,
    });

    if (result.success) {
      // Show success message or redirect to cart
      console.log('✅ Product added to cart successfully!');
    } else {
      console.error('❌ Failed to add to cart:', result.error);
    }
  };

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // Could show toast notification here
    }
  };

  const currentPrice = selectedVariant?.price || product.basePrice;
  const comparePrice = selectedVariant?.compareAtPrice || product.compareAtPrice;
  const discount = comparePrice ? Math.round(((comparePrice - currentPrice) / comparePrice) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
        <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-200">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/products" className="hover:text-gray-700 dark:hover:text-gray-200">
          Products
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 dark:text-white font-medium">{product.title}</span>
      </nav>

      {/* Main product section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden relative group">
            {product.images.length > 0 ? (
              <Image
                src={product.images[selectedImageIndex]?.url || '/placeholder-product.png'}
                alt={product.images[selectedImageIndex]?.alt || product.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-3">
                    <Download className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">Digital Product</p>
                </div>
              </div>
            )}

            {/* Image navigation */}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImageIndex(prev =>
                    prev === 0 ? product.images.length - 1 : prev - 1
                  )}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setSelectedImageIndex(prev =>
                    prev === product.images.length - 1 ? 0 : prev + 1
                  )}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Images */}
          {product.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    index === selectedImageIndex
                      ? 'border-blue-500'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={image.alt || `${product.title} image ${index + 1}`}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Product Type Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
            <Zap className="h-4 w-4" />
            {product.productType.replace('-', ' ').toUpperCase()}
          </div>

          {/* Title */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {product.title}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              by {product.vendor}
            </p>
          </div>

          {/* Rating & Reviews */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">5.0 (1 review)</span>
            </div>
            {product.featured && (
              <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                <Award className="h-4 w-4" />
                <span className="text-sm font-medium">Featured</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center gap-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatPrice(currentPrice, product.currency)}
              </span>
              {comparePrice && (
                <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                  {formatPrice(comparePrice, product.currency)}
                </span>
              )}
            </div>
            {discount > 0 && (
              <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-1 rounded text-sm font-medium">
                {discount}% OFF
              </span>
            )}
          </div>

          {/* Short Description */}
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {product.description.length > 200
              ? `${product.description.substring(0, 200)}...`
              : product.description
            }
          </p>

          {/* Key Features */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Download className="h-4 w-4 text-green-500" />
              Instant Download
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Shield className="h-4 w-4 text-blue-500" />
              Secure License
            </div>
            {product.hasDocumentation && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <BookOpen className="h-4 w-4 text-purple-500" />
                Documentation
              </div>
            )}
            {product.hasDemo && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Play className="h-4 w-4 text-orange-500" />
                Live Demo
              </div>
            )}
          </div>

          {/* License Selection */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900 dark:text-white">Choose License Type:</h3>
              <div className="grid grid-cols-1 gap-3">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`p-4 rounded-lg border-2 text-left transition-colors ${
                      selectedVariant?.id === variant.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {variant.title}
                      </h4>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {formatPrice(variant.price, product.currency)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        Up to {variant.maxSeats} seats
                      </span>
                      {variant.licenseTerms.commercialUse && (
                        <span className="flex items-center gap-1">
                          <Check className="h-4 w-4 text-green-500" />
                          Commercial Use
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleAddToCart}
              disabled={!selectedVariant}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`p-3 rounded-lg border transition-colors ${
                  isWishlisted
                    ? 'border-red-500 text-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400'
                }`}
                title="Add to Wishlist"
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={handleShare}
                className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400 transition-colors"
                title="Share Product"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Demo & Documentation Links */}
          {(product.hasDemo || product.hasDocumentation) && (
            <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {product.hasDemo && product.demoUrl && (
                <a
                  href={product.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  <ExternalLink className="h-4 w-4" />
                  Try Live Demo
                </a>
              )}
              {product.hasDocumentation && product.documentationUrl && (
                <a
                  href={product.documentationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
                >
                  <BookOpen className="h-4 w-4" />
                  View Documentation
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mb-16">
        {/* Tab Headers */}
        <div className="flex space-x-8 border-b border-gray-200 dark:border-gray-700 mb-8">
          {[
            { id: 'description', label: 'Description' },
            { id: 'features', label: 'Features' },
            { id: 'requirements', label: 'Requirements' },
            { id: 'support', label: 'Support' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="prose dark:prose-invert max-w-none">
          {activeTab === 'description' && (
            <div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {product.description}
              </p>
              {product.descriptionHtml && (
                <div
                  className="mt-6"
                  dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                />
              )}
            </div>
          )}

          {activeTab === 'features' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Key Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.tags.map((tag, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">{tag}</span>
                  </div>
                ))}
              </div>

              {product.techStack.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Tech Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.techStack.map((tech, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'requirements' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">System Requirements</h3>
              {product.systemRequirements ? (
                <div className="space-y-3">
                  {Object.entries(product.systemRequirements).map(([key, value]) => (
                    <div key={key}>
                      <span className="font-medium text-gray-900 dark:text-white capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">
                  No specific system requirements. Compatible with most modern systems.
                </p>
              )}
            </div>
          )}

          {activeTab === 'support' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Support Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Support Level: <span className="font-medium capitalize">{product.supportLevel}</span>
                  </span>
                </div>

                {product.hasDocumentation && (
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-purple-500" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Comprehensive documentation included
                    </span>
                  </div>
                )}

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-blue-800 dark:text-blue-300 text-sm">
                    Need help? Contact our support team at{' '}
                    <a href="mailto:support@afilo.io" className="font-medium underline">
                      support@afilo.io
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <motion.div
                key={relatedProduct.id}
                whileHover={{ y: -4 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden cursor-pointer"
                onClick={() => router.push(`/products/${relatedProduct.handle}`)}
              >
                <div className="aspect-video bg-gray-100 dark:bg-gray-700 relative">
                  {relatedProduct.featuredImageUrl ? (
                    <Image
                      src={relatedProduct.featuredImageUrl}
                      alt={relatedProduct.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Download className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {relatedProduct.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {relatedProduct.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg text-gray-900 dark:text-white">
                      {formatPrice(relatedProduct.basePrice, relatedProduct.currency)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {relatedProduct.productType.replace('-', ' ')}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}