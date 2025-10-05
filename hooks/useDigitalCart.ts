'use client';

import { useCallback, useMemo } from 'react';
import { useDigitalCartStore, type DigitalCartItem, type LicenseType, type EducationalTier, type SubscriptionInterval } from '@/store/digitalCart';
import type { ShopifyProduct } from '@/types/shopify';

// Cart operations hook for digital products
export const useDigitalCart = () => {
  // Get cart state and actions from store
  const {
    items,
    isOpen,
    isLoading,
    error,
    totals,
    userRegion,
    userEducationalStatus,
    preferredCurrency,
    appliedBundles,

    // Actions
    addItem,
    updateItem,
    removeItem,
    clearCart,
    updateLicenseType,
    updateQuantity,
    updateSubscriptionInterval,
    setEducationalStatus,
    applyEducationalDiscount,
    applyBundle,
    removeBundle,
    toggleCart,
    setLoading,
    setError,
    setUserRegion,
    calculateTotals,
    validateLicenseSelection,
    validateQuantityLimits
  } = useDigitalCartStore();

  // Add product to cart with digital-specific configuration
  const addProductToCart = useCallback(async (
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

      // Create cart item
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

      // Add to cart
      addItem(cartItem);

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
  }, [addItem, isOpen, toggleCart, setLoading, setError, userEducationalStatus]);

  // Quick purchase for instant checkout
  const quickPurchase = useCallback(async (
    product: ShopifyProduct,
    licenseType: LicenseType = 'Personal'
  ) => {
    const result = await addProductToCart(product, { licenseType, quantity: 1 });

    if (result.success) {
      // Proceed to Shopify checkout
      return proceedToCheckout();
    }

    return result;
  }, [addProductToCart]);

  // License upgrade/downgrade
  const changeLicense = useCallback((itemId: string, newLicenseType: LicenseType) => {
    const item = items.find(i => i.id === itemId);
    if (!item) {
      setError('Item not found in cart');
      return false;
    }

    // Validate new license supports current quantity
    if (!validateQuantityLimits(itemId, item.quantity)) {
      const maxSeats = getLicenseMaxSeats(newLicenseType);
      // Auto-adjust quantity to fit new license
      updateQuantity(itemId, Math.min(item.quantity, maxSeats));
    }

    updateLicenseType(itemId, newLicenseType);
    return true;
  }, [items, updateLicenseType, updateQuantity, validateQuantityLimits, setError]);

  // Team license management
  const adjustTeamSize = useCallback((itemId: string, newQuantity: number) => {
    if (!validateQuantityLimits(itemId, newQuantity)) {
      const item = items.find(i => i.id === itemId);
      const maxSeats = item ? getLicenseMaxSeats(item.licenseType) : 1;
      setError(`Maximum ${maxSeats} seats allowed for this license type`);
      return false;
    }

    updateQuantity(itemId, newQuantity);
    return true;
  }, [items, updateQuantity, validateQuantityLimits, setError]);

  // Educational discount management
  const applyEducationalStatus = useCallback((tier: EducationalTier) => {
    setEducationalStatus(tier);

    // Apply discount to all eligible items
    items.forEach(item => {
      applyEducationalDiscount(item.id);
    });
  }, [items, setEducationalStatus, applyEducationalDiscount]);

  // Proceed to Stripe checkout (bypassing Shopify cart)
  const proceedToCheckout = useCallback(async () => {
    if (items.length === 0) {
      setError('Cart is empty');
      return { success: false, error: 'Cart is empty' };
    }

    setLoading(true);

    try {
      // CRITICAL: Check authentication FIRST
      console.log('Checking authentication before checkout...');
      const authResponse = await fetch('/api/auth/check');
      const authData = await authResponse.json();

      if (!authData.authenticated || !authData.userId) {
        console.log('Authentication required for checkout. Storing cart and redirecting...');

        // Store intended checkout in session for post-login restoration
        sessionStorage.setItem('checkout_intent', JSON.stringify({
          items: items.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            licenseType: item.licenseType,
            educationalTier: item.educationalDiscount.tier,
            subscriptionInterval: item.subscriptionInterval,
            title: item.title,
            price: item.educationalDiscount.appliedPrice // Use final price with discounts
          })),
          userRegion,
          timestamp: Date.now()
        }));

        // Redirect to sign-in with return URL
        const returnUrl = '/checkout';
        window.location.href = `/sign-in?redirect_url=${encodeURIComponent(returnUrl)}`;
        return { success: false, error: 'Authentication required', requiresAuth: true };
      }

      console.log('User authenticated, proceeding with Stripe checkout for user:', authData.userId);

      // Create Stripe Checkout Session directly (NO Shopify cart validation)
      const checkoutResponse = await fetch('/api/stripe/create-cart-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            title: item.title,
            price: item.educationalDiscount.appliedPrice, // Final price with discounts
            quantity: item.quantity,
            licenseType: item.licenseType,
            image: item.image,
          })),
          userEmail: authData.email, // Pass user email for Stripe
        }),
      });

      if (!checkoutResponse.ok) {
        const errorData = await checkoutResponse.json();
        console.error('Stripe checkout creation failed:', errorData);
        throw new Error(errorData.error || `Checkout failed (${checkoutResponse.status})`);
      }

      const { url: checkoutUrl } = await checkoutResponse.json();

      if (!checkoutUrl) {
        throw new Error('No checkout URL returned from Stripe');
      }

      // Clear any stored checkout intent since we're proceeding
      sessionStorage.removeItem('checkout_intent');

      // Redirect to Stripe checkout
      console.log('Redirecting to Stripe checkout:', checkoutUrl);
      window.location.href = checkoutUrl;

      return { success: true, checkoutUrl };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Checkout failed';
      console.error('Checkout error:', err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [items, userRegion, setLoading, setError]);

  // Prepare Shopify checkout data
  const prepareShopifyCheckout = useCallback(async (userId?: string) => {
    const lineItems = items.map(item => ({
      merchandiseId: item.variantId,  // Shopify API expects "merchandiseId"
      quantity: item.quantity,
      attributes: [  // Shopify API expects "attributes" not "customAttributes"
        { key: 'license_type', value: item.licenseType },
        { key: 'subscription_interval', value: item.subscriptionInterval },
        { key: 'educational_tier', value: item.educationalDiscount.tier },
        { key: 'team_size', value: item.quantity.toString() },
        { key: 'tech_stack', value: item.techStack.join(', ') },
        { key: 'product_type', value: item.productType },
        { key: 'version', value: item.version || 'latest' },
        { key: 'digital_delivery', value: 'true' },
        // CRITICAL: Include user ID for webhook processing
        ...(userId ? [{ key: 'clerk_user_id', value: userId }] : [])
      ]
    }));

    return {
      lineItems,
      customAttributes: [
        { key: 'cart_type', value: 'digital_products' },
        { key: 'user_region', value: userRegion },
        { key: 'total_savings', value: totals.savings.toString() },
        { key: 'applied_bundles', value: appliedBundles.join(', ') },
        // CRITICAL: Include user ID at order level for webhook
        ...(userId ? [{ key: 'clerk_user_id', value: userId }] : [])
      ],
      noteAttributes: [
        // CRITICAL: This is the primary method for passing user ID to webhook
        ...(userId ? [{ name: 'clerk_user_id', value: userId }] : []),
        { name: 'cart_type', value: 'digital_products' },
        { name: 'order_source', value: 'afilo_marketplace' }
      ],
      note: `Digital commerce order - ${items.length} license(s) - User: ${userId || 'guest'} - Total savings: $${totals.savings.toFixed(2)}`
    };
  }, [items, userRegion, totals.savings, appliedBundles]);

  // Create Shopify checkout session
  const createShopifyCheckout = useCallback(async (payload: any): Promise<string> => {
    try {
      console.log('Creating Shopify checkout with payload:', payload);

      // Call our secure server-side API to create the cart
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to create checkout`);
      }

      const result = await response.json();

      if (!result.success || !result.cart?.checkoutUrl) {
        throw new Error(result.error || 'Invalid checkout response');
      }

      return result.cart.checkoutUrl;
    } catch (error) {
      console.error('Shopify checkout creation failed:', error);
      throw error instanceof Error ? error : new Error('Unknown checkout error');
    }
  }, []);

  // Validate cart before checkout
  const validateCart = useCallback(() => {
    const errors: string[] = [];

    items.forEach(item => {
      // Validate license selection
      if (!validateLicenseSelection(item.id)) {
        errors.push(`Invalid license configuration for ${item.title}`);
      }

      // Validate quantity limits
      if (!validateQuantityLimits(item.id, item.quantity)) {
        errors.push(`Quantity exceeds limit for ${item.title}`);
      }

      // Validate pricing
      if (item.price <= 0) {
        errors.push(`Invalid pricing for ${item.title}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [items, validateLicenseSelection, validateQuantityLimits]);

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
      requiresActivation: items.some(item => item.deliveryInfo.activationRequired)
    };
  }, [items, totals]);

  // Return hook interface
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

    // Cart operations
    addProductToCart,
    removeItem,
    clearCart,
    toggleCart,

    // License management
    changeLicense,
    adjustTeamSize,
    updateSubscriptionInterval,

    // Educational discounts
    applyEducationalStatus,

    // Checkout
    quickPurchase,
    proceedToCheckout,
    validateCart,

    // Utility functions
    setUserRegion,
    setError,
    calculateTotals
  };
};

// Helper functions for product analysis
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
  const versionRegex = /v?(\\d+\\.?\\d*\\.?\\d*)/i;
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
  const { LICENSE_DEFINITIONS } = require('@/store/digitalCart');
  return LICENSE_DEFINITIONS[licenseType].features;
}

function getLicenseMaxSeats(licenseType: LicenseType): number {
  const { LICENSE_DEFINITIONS } = require('@/store/digitalCart');
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