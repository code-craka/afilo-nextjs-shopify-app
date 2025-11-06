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
 * For subscription and one-time purchases
 */
export function useCreateStripeCheckout() {
  return useMutation({
    mutationFn: async ({
      priceId,
      billingInterval,
      customerEmail
    }: {
      priceId: string;
      billingInterval?: 'month' | 'year';
      customerEmail: string;
    }) => {
      const response = await fetch('/api/stripe/create-subscription-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, billingInterval, customerEmail })
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
 * Sync products from Stripe
 *
 * Admin-only function to trigger product sync from Stripe catalog
 */
export function useSyncProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/products/sync-stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Sync failed');
      }

      return response.json() as Promise<{
        success: boolean;
        synced: number;
        message: string;
      }>;
    },
    onSuccess: () => {
      // Invalidate products cache to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['unified-products'] });
    }
  });
}
