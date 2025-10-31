/**
 * Neon REST API Client
 *
 * Provides direct database access via Neon's REST API endpoint.
 * Used for read-heavy operations (analytics, dashboards, stats).
 *
 * Authentication: Clerk JWT via JWKS
 * Endpoint: https://ep-square-forest-a10q31a6.apirest.ap-southeast-1.aws.neon.tech/neondb/rest/v1
 */

import { useAuth } from '@clerk/nextjs';
import { useState, useCallback } from 'react';

// Neon REST API configuration
const NEON_REST_ENDPOINT = process.env.NEXT_PUBLIC_NEON_REST_API_URL ||
  'https://ep-square-forest-a10q31a6.apirest.ap-southeast-1.aws.neon.tech/neondb/rest/v1';

export interface NeonQueryResult<T = any> {
  rows: T[];
  rowCount: number;
  fields: Array<{ name: string; dataTypeID: number }>;
}

export interface NeonQueryOptions {
  params?: any[];
  timeout?: number; // milliseconds
}

/**
 * Hook for using Neon REST API in client components
 *
 * @example
 * ```tsx
 * const { query, isLoading, error } = useNeonAPI();
 *
 * const stats = await query<{ total: number }>(`
 *   SELECT COUNT(*) as total FROM cart_items WHERE user_id = $1
 * `, { params: [userId] });
 * ```
 */
export function useNeonAPI() {
  const { getToken, userId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const query = useCallback(async <T = any>(
    sql: string,
    options?: NeonQueryOptions
  ): Promise<NeonQueryResult<T>> => {
    setIsLoading(true);
    setError(null);

    try {
      // Get Clerk JWT token for authentication
      const token = await getToken();

      if (!token) {
        throw new Error('Authentication required. Please sign in.');
      }

      // Make request to Neon REST API
      const response = await fetch(NEON_REST_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: sql,
          params: options?.params || [],
        }),
        signal: options?.timeout
          ? AbortSignal.timeout(options.timeout)
          : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
          `Neon API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      return {
        rows: data.rows || [],
        rowCount: data.rowCount || 0,
        fields: data.fields || [],
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  return {
    query,
    isLoading,
    error,
    userId,
  };
}

/**
 * Server-side Neon API client (for API routes and Server Actions)
 *
 * @example
 * ```ts
 * // app/api/analytics/route.ts
 * import { neonQuery } from '@/lib/neon-rest-client';
 *
 * const stats = await neonQuery(
 *   'SELECT COUNT(*) FROM cart_items WHERE status = $1',
 *   { params: ['active'], token: clerkJWT }
 * );
 * ```
 */
export async function neonQuery<T = any>(
  sql: string,
  options: NeonQueryOptions & { token: string }
): Promise<NeonQueryResult<T>> {
  const { token, params, timeout } = options;

  const response = await fetch(NEON_REST_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: sql,
      params: params || [],
    }),
    signal: timeout ? AbortSignal.timeout(timeout) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message ||
      `Neon API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  return {
    rows: data.rows || [],
    rowCount: data.rowCount || 0,
    fields: data.fields || [],
  };
}

/**
 * Utility: Execute multiple queries in parallel
 */
export async function neonBatchQuery<T extends Record<string, any>>(
  queries: Record<keyof T, { sql: string; params?: any[] }>,
  token: string
): Promise<T> {
  const results = await Promise.all(
    Object.entries(queries).map(async ([key, { sql, params }]) => {
      const result = await neonQuery(sql, { token, params });
      return [key, result];
    })
  );

  return Object.fromEntries(results) as T;
}

/**
 * Type-safe query builders for common operations
 */
export const NeonQueries = {
  /**
   * Get cart statistics for a user
   */
  getCartStats: (userId: string) => ({
    sql: `
      SELECT
        COUNT(CASE WHEN status = 'active' THEN 1 END)::int as active_items,
        COUNT(CASE WHEN status = 'abandoned' THEN 1 END)::int as abandoned_items,
        COUNT(CASE WHEN status = 'purchased' THEN 1 END)::int as purchased_items,
        COALESCE(SUM(CASE WHEN status = 'active' THEN price * quantity ELSE 0 END), 0)::decimal as active_value,
        COALESCE(SUM(CASE WHEN status = 'abandoned' THEN price * quantity ELSE 0 END), 0)::decimal as abandoned_value,
        COALESCE(SUM(CASE WHEN status = 'purchased' THEN price * quantity ELSE 0 END), 0)::decimal as total_revenue
      FROM cart_items
      WHERE user_id = $1
    `,
    params: [userId],
  }),

  /**
   * Get top products by revenue
   */
  getTopProducts: (limit: number = 10) => ({
    sql: `
      SELECT
        product_id,
        title,
        COUNT(*)::int as purchase_count,
        SUM(price * quantity)::decimal as revenue,
        image_url
      FROM cart_items
      WHERE status = 'purchased'
      GROUP BY product_id, title, image_url
      ORDER BY revenue DESC
      LIMIT $1
    `,
    params: [limit],
  }),

  /**
   * Get abandoned cart trends over time
   */
  getAbandonedCartTrends: (days: number = 30) => ({
    sql: `
      SELECT
        DATE_TRUNC('day', abandoned_at)::date as date,
        COUNT(*)::int as cart_count,
        SUM(price * quantity)::decimal as lost_revenue
      FROM cart_items
      WHERE status = 'abandoned'
        AND abandoned_at > NOW() - INTERVAL '1 day' * $1
      GROUP BY DATE_TRUNC('day', abandoned_at)
      ORDER BY date DESC
    `,
    params: [days],
  }),

  /**
   * Get recent purchases
   */
  getRecentPurchases: (userId: string, limit: number = 5) => ({
    sql: `
      SELECT
        id,
        title,
        price,
        quantity,
        license_type,
        image_url,
        purchased_at
      FROM cart_items
      WHERE user_id = $1
        AND status = 'purchased'
      ORDER BY purchased_at DESC
      LIMIT $2
    `,
    params: [userId, limit],
  }),
};
