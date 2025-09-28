'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// License types for digital products
export type LicenseType = 'Personal' | 'Commercial' | 'Extended' | 'Enterprise' | 'Developer' | 'Free';

// Educational discount tiers
export type EducationalTier = 'student' | 'teacher' | 'institution' | 'none';

// Subscription intervals
export type SubscriptionInterval = 'monthly' | 'yearly' | 'lifetime' | 'one-time';

// Digital cart item interface
export interface DigitalCartItem {
  id: string;
  productId: string;
  variantId: string;
  title: string;
  handle: string;
  price: number;
  originalPrice: number;
  currency: string;
  image?: string;
  vendor: string;

  // Digital product specific fields
  licenseType: LicenseType;
  subscriptionInterval: SubscriptionInterval;
  quantity: number; // For team licenses (number of seats)
  maxSeats?: number; // Maximum allowed seats for this license

  // License terms
  licenseTerms: {
    commercialUse: boolean;
    teamUse: boolean;
    extendedSupport: boolean;
    sourceCodeIncluded: boolean;
    redistributionAllowed: boolean;
    customizationAllowed: boolean;
  };

  // Educational discount
  educationalDiscount: {
    tier: EducationalTier;
    discountPercent: number;
    appliedPrice: number;
  };

  // Bundle information
  bundleInfo?: {
    isBundleItem: boolean;
    bundleId?: string;
    bundleDiscount?: number;
  };

  // Instant delivery preparation
  deliveryInfo: {
    downloadLinks: string[];
    accessInstructions: string;
    licenseKey?: string;
    activationRequired: boolean;
  };

  // Metadata
  addedAt: Date;
  techStack: string[];
  productType: string;
  hasDocumentation: boolean;
  hasDemo: boolean;
  version?: string;
}

// Tax calculation interface
export interface TaxCalculation {
  region: string;
  rate: number;
  amount: number;
  type: 'VAT' | 'GST' | 'Sales Tax' | 'None';
}

// Bundle discount interface
export interface BundleDiscount {
  id: string;
  name: string;
  productIds: string[];
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minItems: number;
  description: string;
}

// Cart totals interface
export interface CartTotals {
  subtotal: number;
  educationalDiscount: number;
  bundleDiscount: number;
  tax: TaxCalculation;
  total: number;
  currency: string;
  savings: number;
}

// Digital cart state interface
interface DigitalCartState {
  items: DigitalCartItem[];
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;

  // User preferences
  userRegion: string;
  userEducationalStatus: EducationalTier;
  preferredCurrency: string;

  // Available bundles and discounts
  availableBundles: BundleDiscount[];
  appliedBundles: string[];

  // Totals
  totals: CartTotals;

  // Actions
  addItem: (item: Omit<DigitalCartItem, 'id' | 'addedAt'>) => void;
  updateItem: (itemId: string, updates: Partial<DigitalCartItem>) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;

  // License management
  updateLicenseType: (itemId: string, licenseType: LicenseType) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateSubscriptionInterval: (itemId: string, interval: SubscriptionInterval) => void;

  // Educational discounts
  setEducationalStatus: (tier: EducationalTier) => void;
  applyEducationalDiscount: (itemId: string) => void;

  // Bundle management
  applyBundle: (bundleId: string) => void;
  removeBundle: (bundleId: string) => void;
  checkBundleEligibility: () => void;

  // Cart operations
  toggleCart: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Tax and totals
  setUserRegion: (region: string) => void;
  calculateTotals: () => void;

  // Validation
  validateLicenseSelection: (itemId: string) => boolean;
  validateQuantityLimits: (itemId: string, quantity: number) => boolean;
}

// License type definitions with pricing multipliers and features
export const LICENSE_DEFINITIONS: Record<LicenseType, {
  priceMultiplier: number;
  maxSeats: number;
  features: {
    commercialUse: boolean;
    teamUse: boolean;
    extendedSupport: boolean;
    sourceCodeIncluded: boolean;
    redistributionAllowed: boolean;
    customizationAllowed: boolean;
  };
  description: string;
}> = {
  Free: {
    priceMultiplier: 0,
    maxSeats: 1,
    features: {
      commercialUse: false,
      teamUse: false,
      extendedSupport: false,
      sourceCodeIncluded: false,
      redistributionAllowed: false,
      customizationAllowed: false,
    },
    description: 'Personal use only, no commercial applications'
  },
  Personal: {
    priceMultiplier: 1,
    maxSeats: 1,
    features: {
      commercialUse: false,
      teamUse: false,
      extendedSupport: false,
      sourceCodeIncluded: false,
      redistributionAllowed: false,
      customizationAllowed: true,
    },
    description: 'Individual use, customization allowed'
  },
  Commercial: {
    priceMultiplier: 2.5,
    maxSeats: 5,
    features: {
      commercialUse: true,
      teamUse: true,
      extendedSupport: true,
      sourceCodeIncluded: false,
      redistributionAllowed: false,
      customizationAllowed: true,
    },
    description: 'Commercial use, up to 5 team members'
  },
  Extended: {
    priceMultiplier: 4,
    maxSeats: 25,
    features: {
      commercialUse: true,
      teamUse: true,
      extendedSupport: true,
      sourceCodeIncluded: true,
      redistributionAllowed: true,
      customizationAllowed: true,
    },
    description: 'Extended rights, redistribution allowed'
  },
  Enterprise: {
    priceMultiplier: 8,
    maxSeats: 999,
    features: {
      commercialUse: true,
      teamUse: true,
      extendedSupport: true,
      sourceCodeIncluded: true,
      redistributionAllowed: true,
      customizationAllowed: true,
    },
    description: 'Unlimited enterprise use, full rights'
  },
  Developer: {
    priceMultiplier: 1.5,
    maxSeats: 3,
    features: {
      commercialUse: true,
      teamUse: true,
      extendedSupport: true,
      sourceCodeIncluded: true,
      redistributionAllowed: false,
      customizationAllowed: true,
    },
    description: 'Developer tools, source code included'
  }
};

// Educational discount rates
export const EDUCATIONAL_DISCOUNTS: Record<EducationalTier, number> = {
  student: 0.5, // 50% discount
  teacher: 0.3, // 30% discount
  institution: 0.4, // 40% discount
  none: 0 // No discount
};

// Tax rates by region (simplified)
export const TAX_RATES: Record<string, { rate: number; type: TaxCalculation['type'] }> = {
  'US': { rate: 0.08, type: 'Sales Tax' },
  'CA': { rate: 0.13, type: 'GST' },
  'GB': { rate: 0.20, type: 'VAT' },
  'DE': { rate: 0.19, type: 'VAT' },
  'AU': { rate: 0.10, type: 'GST' },
  'Default': { rate: 0, type: 'None' }
};

// Generate unique ID for cart items
const generateCartItemId = (): string => {
  return `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Calculate license price based on type and quantity
const calculateLicensePrice = (
  basePrice: number,
  licenseType: LicenseType,
  quantity: number
): number => {
  const definition = LICENSE_DEFINITIONS[licenseType];
  const licensePrice = basePrice * definition.priceMultiplier;

  // For team licenses, calculate per-seat pricing with potential discounts
  if (quantity > 1) {
    const bulkDiscountRate = quantity >= 10 ? 0.2 : quantity >= 5 ? 0.1 : 0;
    return licensePrice * quantity * (1 - bulkDiscountRate);
  }

  return licensePrice;
};

// Calculate educational discount
const calculateEducationalDiscount = (
  price: number,
  tier: EducationalTier
): number => {
  return price * EDUCATIONAL_DISCOUNTS[tier];
};

// Calculate tax for a region
const calculateTax = (amount: number, region: string): TaxCalculation => {
  const taxInfo = TAX_RATES[region] || TAX_RATES['Default'];
  return {
    region,
    rate: taxInfo.rate,
    amount: amount * taxInfo.rate,
    type: taxInfo.type
  };
};

// Main digital cart store
export const useDigitalCartStore = create<DigitalCartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isLoading: false,
      error: null,
      userRegion: 'US',
      userEducationalStatus: 'none',
      preferredCurrency: 'USD',
      availableBundles: [],
      appliedBundles: [],
      totals: {
        subtotal: 0,
        educationalDiscount: 0,
        bundleDiscount: 0,
        tax: { region: 'US', rate: 0, amount: 0, type: 'None' },
        total: 0,
        currency: 'USD',
        savings: 0
      },

      // Add item to cart
      addItem: (itemData) => {
        const state = get();
        const itemId = generateCartItemId();

        // Check if item already exists with same configuration
        const existingItem = state.items.find(
          item =>
            item.productId === itemData.productId &&
            item.variantId === itemData.variantId &&
            item.licenseType === itemData.licenseType
        );

        if (existingItem) {
          // Update quantity instead of adding duplicate
          const newQuantity = existingItem.quantity + itemData.quantity;
          get().updateQuantity(existingItem.id, newQuantity);
          return;
        }

        // Calculate initial license price
        const licensePrice = calculateLicensePrice(
          itemData.price,
          itemData.licenseType,
          itemData.quantity
        );

        // Apply educational discount if applicable
        const educationalDiscount = calculateEducationalDiscount(
          licensePrice,
          state.userEducationalStatus
        );

        const newItem: DigitalCartItem = {
          ...itemData,
          id: itemId,
          price: licensePrice,
          addedAt: new Date(),
          educationalDiscount: {
            tier: state.userEducationalStatus,
            discountPercent: EDUCATIONAL_DISCOUNTS[state.userEducationalStatus] * 100,
            appliedPrice: licensePrice - educationalDiscount
          }
        };

        set({
          items: [...state.items, newItem],
          error: null
        });

        get().calculateTotals();
        get().checkBundleEligibility();
      },

      // Update item in cart
      updateItem: (itemId, updates) => {
        const state = get();
        const updatedItems = state.items.map(item =>
          item.id === itemId ? { ...item, ...updates } : item
        );

        set({ items: updatedItems });
        get().calculateTotals();
      },

      // Remove item from cart
      removeItem: (itemId) => {
        const state = get();
        const updatedItems = state.items.filter(item => item.id !== itemId);

        set({ items: updatedItems });
        get().calculateTotals();
        get().checkBundleEligibility();
      },

      // Clear entire cart
      clearCart: () => {
        set({
          items: [],
          appliedBundles: [],
          error: null
        });
        get().calculateTotals();
      },

      // Update license type for an item
      updateLicenseType: (itemId, licenseType) => {
        const state = get();
        const item = state.items.find(i => i.id === itemId);
        if (!item) return;

        const licenseDefinition = LICENSE_DEFINITIONS[licenseType];
        const newPrice = calculateLicensePrice(
          item.originalPrice,
          licenseType,
          item.quantity
        );

        // Validate quantity against new license limits
        const validQuantity = Math.min(item.quantity, licenseDefinition.maxSeats);

        get().updateItem(itemId, {
          licenseType,
          price: newPrice,
          quantity: validQuantity,
          maxSeats: licenseDefinition.maxSeats,
          licenseTerms: licenseDefinition.features
        });
      },

      // Update quantity for team licenses
      updateQuantity: (itemId, quantity) => {
        const state = get();
        const item = state.items.find(i => i.id === itemId);
        if (!item) return;

        if (!get().validateQuantityLimits(itemId, quantity)) {
          set({ error: `Quantity exceeds license limit for ${item.licenseType}` });
          return;
        }

        const newPrice = calculateLicensePrice(
          item.originalPrice,
          item.licenseType,
          quantity
        );

        get().updateItem(itemId, {
          quantity,
          price: newPrice
        });
      },

      // Update subscription interval
      updateSubscriptionInterval: (itemId, interval) => {
        get().updateItem(itemId, { subscriptionInterval: interval });
      },

      // Set educational status
      setEducationalStatus: (tier) => {
        set({ userEducationalStatus: tier });

        // Recalculate all educational discounts
        const state = get();
        state.items.forEach(item => {
          get().applyEducationalDiscount(item.id);
        });
      },

      // Apply educational discount to item
      applyEducationalDiscount: (itemId) => {
        const state = get();
        const item = state.items.find(i => i.id === itemId);
        if (!item) return;

        const discountAmount = calculateEducationalDiscount(
          item.price,
          state.userEducationalStatus
        );

        get().updateItem(itemId, {
          educationalDiscount: {
            tier: state.userEducationalStatus,
            discountPercent: EDUCATIONAL_DISCOUNTS[state.userEducationalStatus] * 100,
            appliedPrice: item.price - discountAmount
          }
        });
      },

      // Apply bundle discount
      applyBundle: (bundleId) => {
        const state = get();
        if (state.appliedBundles.includes(bundleId)) return;

        set({
          appliedBundles: [...state.appliedBundles, bundleId]
        });
        get().calculateTotals();
      },

      // Remove bundle discount
      removeBundle: (bundleId) => {
        const state = get();
        set({
          appliedBundles: state.appliedBundles.filter(id => id !== bundleId)
        });
        get().calculateTotals();
      },

      // Check bundle eligibility
      checkBundleEligibility: () => {
        const state = get();
        const productIds = state.items.map(item => item.productId);

        // Simple bundle detection logic
        const eligibleBundles = state.availableBundles.filter(bundle => {
          const bundleProductsInCart = bundle.productIds.filter(
            productId => productIds.includes(productId)
          );
          return bundleProductsInCart.length >= bundle.minItems;
        });

        // Auto-apply beneficial bundles
        eligibleBundles.forEach(bundle => {
          if (!state.appliedBundles.includes(bundle.id)) {
            get().applyBundle(bundle.id);
          }
        });
      },

      // Toggle cart visibility
      toggleCart: () => {
        set(state => ({ isOpen: !state.isOpen }));
      },

      // Set loading state
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      // Set error state
      setError: (error) => {
        set({ error });
      },

      // Set user region for tax calculation
      setUserRegion: (region) => {
        set({ userRegion: region });
        get().calculateTotals();
      },

      // Calculate cart totals
      calculateTotals: () => {
        const state = get();

        let subtotal = 0;
        let totalEducationalDiscount = 0;
        let totalBundleDiscount = 0;

        // Calculate subtotal and educational discounts
        state.items.forEach(item => {
          subtotal += item.price;
          totalEducationalDiscount += (item.price - item.educationalDiscount.appliedPrice);
        });

        // Calculate bundle discounts
        state.appliedBundles.forEach(bundleId => {
          const bundle = state.availableBundles.find(b => b.id === bundleId);
          if (bundle) {
            if (bundle.discountType === 'percentage') {
              totalBundleDiscount += subtotal * (bundle.discountValue / 100);
            } else {
              totalBundleDiscount += bundle.discountValue;
            }
          }
        });

        const discountedSubtotal = subtotal - totalEducationalDiscount - totalBundleDiscount;
        const tax = calculateTax(discountedSubtotal, state.userRegion);
        const total = discountedSubtotal + tax.amount;
        const savings = totalEducationalDiscount + totalBundleDiscount;

        set({
          totals: {
            subtotal,
            educationalDiscount: totalEducationalDiscount,
            bundleDiscount: totalBundleDiscount,
            tax,
            total,
            currency: state.preferredCurrency,
            savings
          }
        });
      },

      // Validate license selection
      validateLicenseSelection: (itemId) => {
        const state = get();
        const item = state.items.find(i => i.id === itemId);
        if (!item) return false;

        const licenseDefinition = LICENSE_DEFINITIONS[item.licenseType];
        return item.quantity <= licenseDefinition.maxSeats;
      },

      // Validate quantity limits
      validateQuantityLimits: (itemId, quantity) => {
        const state = get();
        const item = state.items.find(i => i.id === itemId);
        if (!item) return false;

        const licenseDefinition = LICENSE_DEFINITIONS[item.licenseType];
        return quantity > 0 && quantity <= licenseDefinition.maxSeats;
      }
    }),
    {
      name: 'afilo-digital-cart',
      partialize: (state) => ({
        items: state.items,
        userRegion: state.userRegion,
        userEducationalStatus: state.userEducationalStatus,
        preferredCurrency: state.preferredCurrency,
        appliedBundles: state.appliedBundles
      })
    }
  )
);

// Export helper functions for external use
export {
  calculateLicensePrice,
  calculateEducationalDiscount,
  calculateTax,
  generateCartItemId
};