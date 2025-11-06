/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Neon Database Client
 *
 * Simple PostgreSQL client for unified products table
 * Uses Neon serverless Postgres
 */

import { Pool } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * Database client with query method
 */
export const db = {
  query: async (text: string, params?: any[]) => {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;

    if (process.env.NODE_ENV === 'development') {
      console.log('📊 DB Query:', { text, duration, rows: res.rowCount });
    }

    return res;
  },

  /**
   * Get unified products with optional filters
   */
  getUnifiedProducts: async (filters?: {
    active?: boolean;
    tier?: string;
    availableOnShopify?: boolean;
    availableOnStripe?: boolean;
  }) => {
    let query = 'SELECT * FROM unified_products WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.active !== undefined) {
      query += ` AND active = $${paramIndex}`;
      params.push(filters.active);
      paramIndex++;
    }

    if (filters?.tier) {
      query += ` AND tier = $${paramIndex}`;
      params.push(filters.tier);
      paramIndex++;
    }

    if (filters?.availableOnShopify !== undefined) {
      query += ` AND available_on_shopify = $${paramIndex}`;
      params.push(filters.availableOnShopify);
      paramIndex++;
    }

    if (filters?.availableOnStripe !== undefined) {
      query += ` AND available_on_stripe = $${paramIndex}`;
      params.push(filters.availableOnStripe);
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.query(query, params);
    return result.rows;
  },

  /**
   * Get unified product by Shopify ID
   */
  getByShopifyId: async (shopifyProductId: string) => {
    const result = await db.query(
      'SELECT * FROM unified_products WHERE shopify_product_id = $1',
      [shopifyProductId]
    );
    return result.rows[0] || null;
  },

  /**
   * Get unified product by Stripe ID
   */
  getByStripeId: async (stripeProductId: string) => {
    const result = await db.query(
      'SELECT * FROM unified_products WHERE stripe_product_id = $1',
      [stripeProductId]
    );
    return result.rows[0] || null;
  }
};

export default db;
