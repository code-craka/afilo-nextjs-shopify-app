/**
 * TanStack Query Hooks for Products
 *
 * Provides cached product data with smart refetching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface UnifiedProduct {
  id: string;
  name: string;
  description: string;

  // Pricing
  basePrice: number; // in cents
  currency: string;
  formattedPrice: string; // e.g., "$499.00"

  // Shopify Integration
  shopify: {
    productId: string | null;
    variantId: string | null;
    handle: string | null;
    available: boolean;
  };

  // Stripe Integration
  stripe: {
    productId: string | null;
    priceMonthly: string | null;
    priceAnnual: string | null;
    available: boolean;
  };

  // Product Details
  features: string[];
  images: Array<{ url: string; alt?: string }>;
  metadata: Record<string, any>;

  // Categorization
  tier: string | null;
  userLimit: string | null;
  productType: string | null;

  // Status
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProductsFilters {
  active?: boolean;
  tier?: string;
  shopify?: boolean;
  stripe?: boolean;
}

/**
 * Fetch unified products with caching
 *
 * Cache: 5 minutes stale time, 10 minutes cache time
 */
export function useUnifiedProducts(filters?: ProductsFilters) {
  return useQuery({
    queryKey: ['unified-products', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.active !== undefined) params.set('active', String(filters.active));
      if (filters?.tier) params.set('tier', filters.tier);
      if (filters?.shopify !== undefined) params.set('shopify', String(filters.shopify));
      if (filters?.stripe !== undefined) params.set('stripe', String(filters.stripe));

      const response = await fetch(`/api/products/unified?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      return response.json() as Promise<{ products: UnifiedProduct[]; total: number }>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in v5)
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });
}

/**
 * Create Stripe checkout session
 *
 * For subscription-based purchases
 */
export function useCreateStripeCheckout() {
  return useMutation({
    mutationFn: async ({
      priceId,
      billingInterval
    }: {
      priceId: string;
      billingInterval: 'month' | 'year';
    }) => {
      const response = await fetch('/api/stripe/create-subscription-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, billingInterval })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Checkout creation failed');
      }

      return response.json() as Promise<{ url: string; sessionId: string }>;
    },
    onSuccess: (data) => {
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    }
  });
}

/**
 * Create Shopify cart and checkout
 *
 * For one-time purchases
 */
export function useCreateShopifyCart() {
  return useMutation({
    mutationFn: async ({
      variantId,
      quantity = 1
    }: {
      variantId: string;
      quantity?: number;
    }) => {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lineItems: [
            {
              variantId,
              quantity,
              customAttributes: [
                { key: 'purchase_type', value: 'one-time' },
                { key: 'checkout_source', value: 'app.afilo.io' }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Cart creation failed');
      }

      return response.json() as Promise<{ cart: { checkoutUrl: string; id: string } }>;
    },
    onSuccess: (data) => {
      // Redirect to Shopify Checkout
      window.location.href = data.cart.checkoutUrl;
    }
  });
}

/**
 * Sync products from Shopify to Stripe
 *
 * Admin-only function to trigger product sync
 */
export function useSyncProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productIds?: string[]) => {
      const response = await fetch('/api/sync/shopify-to-stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Sync failed');
      }

      return response.json() as Promise<{
        success: boolean;
        synced: number;
        created: number;
        updated: number;
      }>;
    },
    onSuccess: () => {
      // Invalidate products cache to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['unified-products'] });
    }
  });
}
