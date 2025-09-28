'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SecureCartStorage } from '@/lib/encryption';

// CRITICAL SECURITY: This store NEVER contains cart secret keys
// All cart operations go through secure server-side APIs

// License types for digital products
export type LicenseType = 'Personal' | 'Commercial' | 'Extended' | 'Enterprise' | 'Developer' | 'Free';

// Educational discount tiers
export type EducationalTier = 'student' | 'teacher' | 'institution' | 'none';

// Subscription intervals
export type SubscriptionInterval = 'monthly' | 'yearly' | 'lifetime' | 'one-time';

// Secure cart session interface (NO secret cart ID)
export interface SecureCartSession {
  sessionId: string; // Safe client identifier ONLY
  checkoutUrl?: string; // Retrieved when needed
  totalQuantity: number;
  cost: {
    totalAmount: {
      amount: string;
      currencyCode: string;
    };
    subtotalAmount: {
      amount: string;
      currencyCode: string;
    };
  };
  lineCount: number;
  lastUpdated: Date;
  expiresAt?: Date; // Optional expiry for security
}

// Digital cart item interface (client-side representation)
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

// Secure cart state interface
interface SecureDigitalCartState {
  // SECURE SESSION DATA (NO SECRET KEYS)
  cartSession: SecureCartSession | null;

  // CLIENT-SIDE CART STATE
  items: DigitalCartItem[];
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;

  // User preferences
  userRegion: string;
  userEducationalStatus: EducationalTier;
  preferredCurrency: string;

  // CLIENT-SIDE CALCULATIONS (validated server-side)
  totals: CartTotals;

  // SECURE ACTIONS (all use server APIs)
  createSecureCart: () => Promise<boolean>;
  addItemToSecureCart: (item: Omit<DigitalCartItem, 'id' | 'addedAt'>) => Promise<boolean>;
  proceedToSecureCheckout: () => Promise<{ success: boolean; checkoutUrl?: string; error?: string }>;

  // CLIENT-SIDE ACTIONS
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

  // Cart operations
  toggleCart: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Tax and totals
  setUserRegion: (region: string) => void;
  calculateTotals: () => void;

  // Session management
  clearSession: () => void;
  validateSession: () => boolean;
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

// Secure cart storage implementation
const secureCartPersistence = {
  name: 'afilo-secure-digital-cart',

  storage: {
    getItem: async (name: string) => {
      try {
        const data = await SecureCartStorage.load();
        return data ? JSON.stringify(data) : null;
      } catch (error) {
        console.error('Failed to load secure cart data:', error);
        return null;
      }
    },

    setItem: async (name: string, value: string) => {
      try {
        const data = JSON.parse(value);
        await SecureCartStorage.save(data);
      } catch (error) {
        console.error('Failed to save secure cart data:', error);
      }
    },

    removeItem: async (name: string) => {
      try {
        SecureCartStorage.clear();
      } catch (error) {
        console.error('Failed to clear secure cart data:', error);
      }
    }
  },

  partialize: (state: SecureDigitalCartState) => ({
    // ONLY persist safe data (NO secret cart information)
    items: state.items,
    userRegion: state.userRegion,
    userEducationalStatus: state.userEducationalStatus,
    preferredCurrency: state.preferredCurrency,
    cartSession: state.cartSession, // Safe session data only
  })
};

// Main secure digital cart store
export const useSecureDigitalCartStore = create<SecureDigitalCartState>()(
  persist(
    (set, get) => ({
      // Initial state
      cartSession: null,
      items: [],
      isOpen: false,
      isLoading: false,
      error: null,
      userRegion: 'US',
      userEducationalStatus: 'none',
      preferredCurrency: 'USD',
      totals: {
        subtotal: 0,
        educationalDiscount: 0,
        bundleDiscount: 0,
        tax: { region: 'US', rate: 0, amount: 0, type: 'None' },
        total: 0,
        currency: 'USD',
        savings: 0
      },

      // SECURE SERVER-SIDE OPERATIONS

      // Create secure cart session
      createSecureCart: async () => {
        try {
          set({ isLoading: true, error: null });

          const response = await fetch('/api/cart/server-create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customAttributes: [
                { key: 'cart_type', value: 'digital_products' },
                { key: 'client_version', value: '2.0_secure' }
              ]
            })
          });

          if (!response.ok) {
            throw new Error(`Failed to create cart: ${response.status}`);
          }

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error || 'Failed to create cart');
          }

          // Store SAFE cart session data (NO secret cart ID)
          set({
            cartSession: {
              sessionId: result.cart.sessionId,
              checkoutUrl: result.cart.checkoutUrl,
              totalQuantity: result.cart.totalQuantity,
              cost: result.cart.cost,
              lineCount: result.cart.lineCount,
              lastUpdated: new Date(),
              expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
            }
          });

          return true;

        } catch (error) {
          console.error('Failed to create secure cart:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to create cart' });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      // Add item to secure cart
      addItemToSecureCart: async (itemData) => {
        try {
          const state = get();

          // Ensure we have a secure cart session
          if (!state.cartSession) {
            const cartCreated = await get().createSecureCart();
            if (!cartCreated) {
              return false;
            }
          }

          set({ isLoading: true, error: null });

          const response = await fetch('/api/cart/lines/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: state.cartSession!.sessionId,
              lines: [{
                merchandiseId: itemData.variantId,
                quantity: itemData.quantity,
                attributes: [
                  { key: 'license_type', value: itemData.licenseType },
                  { key: 'subscription_interval', value: itemData.subscriptionInterval },
                  { key: 'educational_tier', value: itemData.educationalDiscount.tier },
                  { key: 'team_size', value: itemData.quantity.toString() },
                  { key: 'tech_stack', value: itemData.techStack.join(', ') },
                  { key: 'digital_delivery', value: 'true' }
                ]
              }]
            })
          });

          if (!response.ok) {
            throw new Error(`Failed to add item: ${response.status}`);
          }

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error || 'Failed to add item');
          }

          // Update cart session with new data
          set({
            cartSession: {
              ...state.cartSession!,
              totalQuantity: result.cart.totalQuantity,
              cost: result.cart.cost,
              lineCount: result.cart.lineCount,
              lastUpdated: new Date()
            }
          });

          return true;

        } catch (error) {
          console.error('Failed to add item to secure cart:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to add item' });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      // Proceed to secure checkout
      proceedToSecureCheckout: async () => {
        try {
          const state = get();

          if (!state.cartSession) {
            return { success: false, error: 'No cart session available' };
          }

          set({ isLoading: true, error: null });

          // Validate cart on server before checkout
          const validationResponse = await fetch('/api/cart/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              items: state.items.map(item => ({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
                licenseType: item.licenseType,
                educationalTier: item.educationalDiscount.tier,
                clientPrice: item.educationalDiscount.appliedPrice
              })),
              userRegion: state.userRegion
            }),
          });

          if (!validationResponse.ok) {
            throw new Error('Cart validation failed');
          }

          const validation = await validationResponse.json();

          if (!validation.valid) {
            return {
              success: false,
              error: validation.discrepancies ? 'Price validation failed. Please refresh your cart.' : validation.error
            };
          }

          // Get secure checkout URL
          const checkoutResponse = await fetch('/api/cart/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: state.cartSession.sessionId,
              buyerIdentity: {
                countryCode: state.userRegion === 'US' ? 'US' : state.userRegion
              }
            })
          });

          if (!checkoutResponse.ok) {
            throw new Error('Failed to get checkout URL');
          }

          const checkoutResult = await checkoutResponse.json();

          if (!checkoutResult.success) {
            throw new Error(checkoutResult.error || 'Failed to get checkout URL');
          }

          return {
            success: true,
            checkoutUrl: checkoutResult.checkoutUrl
          };

        } catch (error) {
          console.error('Secure checkout failed:', error);
          const errorMessage = error instanceof Error ? error.message : 'Checkout failed';
          set({ error: errorMessage });
          return { success: false, error: errorMessage };
        } finally {
          set({ isLoading: false });
        }
      },

      // CLIENT-SIDE OPERATIONS (for UI state only)

      // Add item to client-side state
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
      },

      // Clear entire cart
      clearCart: () => {
        set({
          items: [],
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

        const licenseDefinition = LICENSE_DEFINITIONS[item.licenseType];
        if (quantity <= 0 || quantity > licenseDefinition.maxSeats) {
          set({ error: `Quantity must be between 1 and ${licenseDefinition.maxSeats} for ${item.licenseType} license` });
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

        // Calculate subtotal and educational discounts
        state.items.forEach(item => {
          subtotal += item.price;
          totalEducationalDiscount += (item.price - item.educationalDiscount.appliedPrice);
        });

        const discountedSubtotal = subtotal - totalEducationalDiscount;
        const tax = calculateTax(discountedSubtotal, state.userRegion);
        const total = discountedSubtotal + tax.amount;
        const savings = totalEducationalDiscount;

        set({
          totals: {
            subtotal,
            educationalDiscount: totalEducationalDiscount,
            bundleDiscount: 0, // TODO: Implement bundle discounts
            tax,
            total,
            currency: state.preferredCurrency,
            savings
          }
        });
      },

      // Clear cart session
      clearSession: () => {
        set({ cartSession: null });
      },

      // Validate cart session
      validateSession: () => {
        const state = get();
        if (!state.cartSession) return false;

        // Check if session has expired
        if (state.cartSession.expiresAt && new Date() > state.cartSession.expiresAt) {
          get().clearSession();
          return false;
        }

        return true;
      }
    }),
    secureCartPersistence
  )
);

// Export helper functions for external use
export {
  calculateLicensePrice,
  calculateEducationalDiscount,
  calculateTax,
  generateCartItemId
};