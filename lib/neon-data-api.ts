/**
 * Neon Data API Client with Clerk Authentication
 *
 * This client provides secure access to your Neon database through the Data API
 * with automatic JWT token management from Clerk.
 *
 * Features:
 * - Automatic JWT token injection from Clerk
 * - Row-Level Security (RLS) enforcement
 * - Type-safe PostgREST query builder
 * - Server and client-side support
 */

import { PostgrestClient } from '@supabase/postgrest-js';
import { auth } from '@clerk/nextjs/server';

// Neon Data API endpoint (from your Neon dashboard)
const NEON_DATA_API_URL = process.env.NEXT_PUBLIC_NEON_DATA_API_URL ||
  'https://ep-square-forest-a10q31a6.apirest.ap-southeast-1.aws.neon.tech/neondb/rest/v1';

/**
 * Create a Neon Data API client with Clerk authentication (Server-side)
 *
 * Usage in API routes:
 * ```typescript
 * import { createNeonClient } from '@/lib/neon-data-api';
 *
 * export async function GET() {
 *   const neon = await createNeonClient();
 *
 *   const { data, error } = await neon
 *     .from('cart_items')
 *     .select('*')
 *     .eq('user_id', neon.userId); // RLS will enforce this
 *
 *   return Response.json({ data, error });
 * }
 * ```
 */
export async function createNeonClient() {
  const { userId, getToken } = await auth();

  if (!userId) {
    throw new Error('Unauthorized: No user ID found');
  }

  // Get Clerk JWT token
  const token = await getToken();

  if (!token) {
    throw new Error('Unauthorized: No auth token found');
  }

  const client = new PostgrestClient(NEON_DATA_API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Attach userId for convenience
  return Object.assign(client, { userId });
}

/**
 * Create a Neon Data API client with provided token (Client-side)
 *
 * Usage in React components:
 * ```typescript
 * import { useAuth } from '@clerk/nextjs';
 * import { createNeonClientWithToken } from '@/lib/neon-data-api';
 *
 * function MyComponent() {
 *   const { getToken, userId } = useAuth();
 *
 *   async function fetchData() {
 *     const token = await getToken();
 *     const neon = createNeonClientWithToken(token, userId);
 *
 *     const { data } = await neon
 *       .from('cart_items')
 *       .select('*');
 *
 *     return data;
 *   }
 * }
 * ```
 */
export function createNeonClientWithToken(token: string | null, userId: string | null) {
  if (!token || !userId) {
    throw new Error('Unauthorized: Token and userId required');
  }

  const client = new PostgrestClient(NEON_DATA_API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return Object.assign(client, { userId });
}

/**
 * Type-safe helper functions for common queries
 */
export const NeonQueries = {
  /**
   * Get user's cart items
   */
  async getCartItems(userId: string, token: string) {
    const neon = createNeonClientWithToken(token, userId);

    return await neon
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('added_at', { ascending: false });
  },

  /**
   * Get user's subscription
   */
  async getUserSubscription(userId: string, token: string) {
    const neon = createNeonClientWithToken(token, userId);

    return await neon
      .from('user_subscriptions')
      .select('*')
      .eq('clerk_user_id', userId)
      .eq('status', 'active')
      .single();
  },

  /**
   * Get all products (available to all authenticated users)
   */
  async getProducts(token: string, userId: string) {
    const neon = createNeonClientWithToken(token, userId);

    return await neon
      .from('unified_products')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false });
  },

  /**
   * Get user's profile
   */
  async getUserProfile(userId: string, token: string) {
    const neon = createNeonClientWithToken(token, userId);

    return await neon
      .from('user_profiles')
      .select('*')
      .eq('clerk_user_id', userId)
      .single();
  },

  /**
   * Add item to cart
   */
  async addToCart(userId: string, token: string, item: {
    product_id: string;
    variant_id: string;
    title: string;
    price: number;
    quantity: number;
    license_type: 'personal' | 'commercial';
    image_url?: string;
  }) {
    const neon = createNeonClientWithToken(token, userId);

    return await neon
      .from('cart_items')
      .insert({
        user_id: userId,
        status: 'active',
        ...item,
      })
      .select()
      .single();
  },
};

/**
 * Example usage in an API route:
 *
 * ```typescript
 * // app/api/cart/items-v2/route.ts
 * import { createNeonClient } from '@/lib/neon-data-api';
 *
 * export async function GET() {
 *   try {
 *     const neon = await createNeonClient();
 *
 *     const { data, error } = await neon
 *       .from('cart_items')
 *       .select('*')
 *       .eq('user_id', neon.userId)
 *       .eq('status', 'active');
 *
 *     if (error) throw error;
 *
 *     return Response.json({ success: true, items: data });
 *   } catch (error) {
 *     return Response.json({ error: error.message }, { status: 500 });
 *   }
 * }
 * ```
 */
