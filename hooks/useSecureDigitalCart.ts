'use client';

import { useCallback, useMemo } from 'react';
import { useSecureDigitalCartStore, type DigitalCartItem, type LicenseType, type EducationalTier, type SubscriptionInterval } from '@/store/secureDigitalCart';
import type { ShopifyProduct } from '@/types/shopify';

// CRITICAL SECURITY: This hook NEVER handles cart secret keys
// All cart operations use secure server-side APIs

export const useSecureDigitalCart = () => {
  // Get secure cart state and actions from store
  const {
    cartSession,
    items,
    isOpen,
    isLoading,
    error,
    totals,
    userRegion,
    userEducationalStatus,
    preferredCurrency,

    // Secure server-side actions
    createSecureCart,
    addItemToSecureCart,
    proceedToSecureCheckout,

    // Client-side actions
    addItem,
    updateItem,
    removeItem,
    clearCart,
    updateLicenseType,
    updateQuantity,
    updateSubscriptionInterval,
    setEducationalStatus,
    applyEducationalDiscount,
    toggleCart,
    setLoading,
    setError,
    setUserRegion,
    calculateTotals,
    clearSession,
    validateSession
  } = useSecureDigitalCartStore();

  // Add product to secure cart (both client-side state and server-side cart)
  const addProductToSecureCart = useCallback(async (
    product: ShopifyProduct,
    options: {
      licenseType?: LicenseType;
      quantity?: number;
      subscriptionInterval?: SubscriptionInterval;
      variantId?: string;
    } = {}
  ) => {
    setLoading(true);
    setError(null);

    try {
      // Default to first available variant if not specified
      const variant = product.variants?.edges?.[0]?.node;
      if (!variant) {
        throw new Error('No variants available for this product');
      }

      // Determine default license type based on product analysis
      const defaultLicenseType = determineDefaultLicenseType(product);

      // Extract tech stack and product info for cart item
      const techStack = getTechStackFromProduct(product);
      const hasDocumentation = hasDocumentationDetection(product);
      const hasDemo = hasDemoDetection(product);
      const version = extractVersionNumber(product);
      const productType = getDigitalProductType(product);

      // Create cart item for client-side state
      const cartItem: Omit<DigitalCartItem, 'id' | 'addedAt'> = {
        productId: product.id,
        variantId: options.variantId || variant.id,
        title: product.title,
        handle: product.handle,
        price: parseFloat(variant.price.amount),
        originalPrice: parseFloat(variant.price.amount),
        currency: variant.price.currencyCode,
        image: product.featuredImage?.url,
        vendor: product.vendor || 'Afilo',

        // Digital product configuration
        licenseType: options.licenseType || defaultLicenseType,
        subscriptionInterval: options.subscriptionInterval || 'one-time',
        quantity: options.quantity || 1,
        maxSeats: getLicenseMaxSeats(options.licenseType || defaultLicenseType),

        // License terms based on type
        licenseTerms: getLicenseTerms(options.licenseType || defaultLicenseType),

        // Educational discount (will be calculated in store)
        educationalDiscount: {
          tier: userEducationalStatus,
          discountPercent: 0,
          appliedPrice: parseFloat(variant.price.amount)
        },

        // Bundle info (will be calculated if applicable)
        bundleInfo: {
          isBundleItem: false
        },

        // Instant delivery setup
        deliveryInfo: {
          downloadLinks: [], // Will be populated post-purchase
          accessInstructions: generateAccessInstructions(product),
          activationRequired: requiresActivation(product)
        },

        // Metadata
        techStack,
        productType: productType.type,
        hasDocumentation,
        hasDemo,
        version
      };

      // Add to client-side state first (for immediate UI feedback)
      addItem(cartItem);

      // Add to secure server-side cart
      const serverSuccess = await addItemToSecureCart(cartItem);

      if (!serverSuccess) {
        // If server operation failed, remove from client state
        const addedItemId = items[items.length - 1]?.id;
        if (addedItemId) {
          removeItem(addedItemId);
        }
        throw new Error('Failed to add item to secure cart');
      }

      // Auto-open cart for immediate feedback
      if (!isOpen) {
        toggleCart();
      }

      return { success: true, itemId: cartItem.productId };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add item to cart';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [
    addItem,
    addItemToSecureCart,
    removeItem,
    items,
    isOpen,
    toggleCart,
    setLoading,
    setError,
    userEducationalStatus
  ]);

  // Quick purchase for instant checkout
  const quickPurchase = useCallback(async (
    product: ShopifyProduct,
    licenseType: LicenseType = 'Personal'
  ) => {
    const result = await addProductToSecureCart(product, { licenseType, quantity: 1 });

    if (result.success) {
      // Proceed to secure checkout
      return proceedToSecureCheckout();
    }

    return result;
  }, [addProductToSecureCart, proceedToSecureCheckout]);

  // License upgrade/downgrade
  const changeLicense = useCallback((itemId: string, newLicenseType: LicenseType) => {
    const item = items.find(i => i.id === itemId);
    if (!item) {
      setError('Item not found in cart');
      return false;
    }

    updateLicenseType(itemId, newLicenseType);
    return true;
  }, [items, updateLicenseType, setError]);

  // Team license management
  const adjustTeamSize = useCallback((itemId: string, newQuantity: number) => {
    const item = items.find(i => i.id === itemId);
    if (!item) {
      setError('Item not found in cart');
      return false;
    }

    updateQuantity(itemId, newQuantity);
    return true;
  }, [items, updateQuantity, setError]);

  // Educational discount management
  const applyEducationalStatus = useCallback((tier: EducationalTier) => {
    setEducationalStatus(tier);

    // Apply discount to all eligible items
    items.forEach(item => {
      applyEducationalDiscount(item.id);
    });
  }, [items, setEducationalStatus, applyEducationalDiscount]);

  // Secure checkout with validation
  const proceedToCheckout = useCallback(async () => {
    if (items.length === 0) {
      setError('Cart is empty');
      return { success: false, error: 'Cart is empty' };
    }

    // Validate session before checkout
    if (!validateSession()) {
      setError('Cart session expired. Please refresh your cart.');
      return { success: false, error: 'Cart session expired' };
    }

    setLoading(true);

    try {
      const result = await proceedToSecureCheckout();

      if (result.success && result.checkoutUrl) {
        // Redirect to Shopify checkout
        window.location.href = result.checkoutUrl;
      }

      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Checkout failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [
    items,
    validateSession,
    proceedToSecureCheckout,
    setLoading,
    setError
  ]);

  // Initialize secure cart if needed
  const initializeSecureCart = useCallback(async () => {
    if (!cartSession && items.length > 0) {
      return await createSecureCart();
    }
    return true;
  }, [cartSession, items, createSecureCart]);

  // Cart validation
  const validateCart = useCallback(() => {
    const errors: string[] = [];

    items.forEach(item => {
      // Validate pricing
      if (item.price <= 0) {
        errors.push(`Invalid pricing for ${item.title}`);
      }

      // Validate quantity limits
      if (item.quantity <= 0 || (item.maxSeats && item.quantity > item.maxSeats)) {
        errors.push(`Invalid quantity for ${item.title}`);
      }
    });

    // Validate session
    if (!validateSession()) {
      errors.push('Cart session expired');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [items, validateSession]);

  // Cart summary with digital-specific information
  const cartSummary = useMemo(() => {
    const totalItems = items.length;
    const totalSeats = items.reduce((sum, item) => sum + item.quantity, 0);
    const licenseTypes = [...new Set(items.map(item => item.licenseType))];
    const hasEducationalDiscount = totals.educationalDiscount > 0;
    const hasBundleDiscount = totals.bundleDiscount > 0;

    return {
      totalItems,
      totalSeats,
      licenseTypes,
      hasEducationalDiscount,
      hasBundleDiscount,
      totalSavings: totals.savings,
      estimatedDelivery: 'Instant', // Digital products
      requiresActivation: items.some(item => item.deliveryInfo.activationRequired),
      hasSecureSession: !!cartSession,
      sessionValid: validateSession()
    };
  }, [items, totals, cartSession, validateSession]);

  // Return secure hook interface
  return {
    // State
    items,
    isOpen,
    isLoading,
    error,
    totals,
    cartSummary,
    userRegion,
    userEducationalStatus,
    cartSession,

    // Secure cart operations
    addProductToSecureCart,
    removeItem,
    clearCart,
    toggleCart,
    initializeSecureCart,

    // License management
    changeLicense,
    adjustTeamSize,
    updateSubscriptionInterval,

    // Educational discounts
    applyEducationalStatus,

    // Secure checkout
    quickPurchase,
    proceedToCheckout,
    validateCart,

    // Session management
    clearSession,
    validateSession,

    // Utility functions
    setUserRegion,
    setError,
    calculateTotals
  };
};

// Helper functions for product analysis (moved from original hook)
function determineDefaultLicenseType(product: ShopifyProduct): LicenseType {
  const price = parseFloat(product.variants?.edges?.[0]?.node?.price?.amount || '0');

  if (price === 0) return 'Free';
  if (price < 50) return 'Personal';
  if (price < 200) return 'Commercial';
  return 'Extended';
}

function getTechStackFromProduct(product: ShopifyProduct): string[] {
  const title = product.title.toLowerCase();
  const description = product.description.toLowerCase();
  const tags = product.tags || [];

  const techStack: string[] = [];

  // Frontend frameworks
  if (title.includes('react') || description.includes('react') || tags.includes('react')) techStack.push('React');
  if (title.includes('vue') || description.includes('vue') || tags.includes('vue')) techStack.push('Vue');
  if (title.includes('angular') || description.includes('angular') || tags.includes('angular')) techStack.push('Angular');
  if (title.includes('next') || description.includes('next') || tags.includes('nextjs')) techStack.push('Next.js');

  // Backend & Languages
  if (title.includes('python') || description.includes('python') || tags.includes('python')) techStack.push('Python');
  if (title.includes('javascript') || description.includes('javascript') || tags.includes('javascript')) techStack.push('JavaScript');
  if (title.includes('typescript') || description.includes('typescript') || tags.includes('typescript')) techStack.push('TypeScript');
  if (title.includes('node') || description.includes('node') || tags.includes('nodejs')) techStack.push('Node.js');

  // AI/ML
  if (title.includes('ai') || description.includes('ai') || tags.includes('ai')) techStack.push('AI');
  if (title.includes('machine learning') || description.includes('ml') || tags.includes('ml')) techStack.push('ML');

  return techStack.slice(0, 4); // Limit to 4 most relevant
}

function hasDocumentationDetection(product: ShopifyProduct): boolean {
  const description = product.description.toLowerCase();
  const tags = product.tags || [];

  return description.includes('documentation') ||
         description.includes('docs') ||
         description.includes('guide') ||
         tags.includes('documented');
}

function hasDemoDetection(product: ShopifyProduct): boolean {
  const description = product.description.toLowerCase();
  const tags = product.tags || [];

  return description.includes('demo') ||
         description.includes('preview') ||
         description.includes('live demo') ||
         tags.includes('demo');
}

function extractVersionNumber(product: ShopifyProduct): string | undefined {
  const versionRegex = /v?(\d+\.?\d*\.?\d*)/i;
  const titleMatch = product.title.match(versionRegex);
  const descMatch = product.description.match(versionRegex);

  return titleMatch?.[1] || descMatch?.[1] || undefined;
}

function getDigitalProductType(product: ShopifyProduct): { type: string; color: string; icon: string } {
  const title = product.title.toLowerCase();
  const description = product.description.toLowerCase();
  const productType = product.productType?.toLowerCase() || '';

  if (title.includes('ai') || description.includes('artificial intelligence') || productType.includes('ai')) {
    return { type: 'AI Tool', color: 'bg-blue-100 text-blue-800', icon: '🤖' };
  }
  if (title.includes('template') || productType.includes('template')) {
    return { type: 'Template', color: 'bg-purple-100 text-purple-800', icon: '📄' };
  }
  if (title.includes('script') || productType.includes('script')) {
    return { type: 'Script', color: 'bg-green-100 text-green-800', icon: '⚡' };
  }
  if (title.includes('plugin') || productType.includes('plugin')) {
    return { type: 'Plugin', color: 'bg-orange-100 text-orange-800', icon: '🔌' };
  }
  if (title.includes('theme') || productType.includes('theme')) {
    return { type: 'Theme', color: 'bg-pink-100 text-pink-800', icon: '🎨' };
  }
  if (title.includes('app') || productType.includes('application')) {
    return { type: 'Application', color: 'bg-indigo-100 text-indigo-800', icon: '📱' };
  }

  return { type: 'Software', color: 'bg-gray-100 text-gray-800', icon: '💻' };
}

function getLicenseTerms(licenseType: LicenseType) {
  const { LICENSE_DEFINITIONS } = require('@/store/secureDigitalCart');
  return LICENSE_DEFINITIONS[licenseType].features;
}

function getLicenseMaxSeats(licenseType: LicenseType): number {
  const { LICENSE_DEFINITIONS } = require('@/store/secureDigitalCart');
  return LICENSE_DEFINITIONS[licenseType].maxSeats;
}

function generateAccessInstructions(product: ShopifyProduct): string {
  return `After purchase, you will receive instant access to download ${product.title}. Check your email for download links and license information.`;
}

function requiresActivation(product: ShopifyProduct): boolean {
  const description = product.description.toLowerCase();
  return description.includes('license key') ||
         description.includes('activation') ||
         description.includes('serial number');
}