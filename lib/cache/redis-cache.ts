import { Redis } from '@upstash/redis';

/**
 * Redis Cache Service
 *
 * Multi-layer caching strategy:
 * - Level 1: Redis cache for API responses (5-15 minutes)
 * - Level 2: Next.js ISR for static pages (24 hours)
 * - Level 3: CDN caching headers (7 days for static assets)
 */

// Initialize Redis client with fallback handling
let redis: Redis | null = null;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
} catch (error) {
  console.warn('Redis initialization failed, caching disabled:', error);
}

// Cache key prefixes for organization
const CACHE_PREFIXES = {
  PRODUCTS_LIST: 'products:list',
  PRODUCT_DETAIL: 'product:handle',
  SEARCH_RESULTS: 'search',
  CATEGORY: 'category',
  RELATED_PRODUCTS: 'related',
  USER_CART: 'cart:user',
} as const;

// Cache TTL (Time To Live) in seconds
const CACHE_TTL = {
  PRODUCTS_LIST: 900, // 15 minutes - products change frequently
  PRODUCT_DETAIL: 1800, // 30 minutes - individual products change less
  SEARCH_RESULTS: 600, // 10 minutes - search results need freshness
  CATEGORY: 1200, // 20 minutes - categories change rarely
  RELATED_PRODUCTS: 1800, // 30 minutes - related products are stable
  USER_CART: 300, // 5 minutes - cart data needs to be fresh
} as const;

/**
 * Generate cache key with consistent format
 */
function generateCacheKey(prefix: string, ...parts: string[]): string {
  const sanitizedParts = parts
    .map(part => String(part).replace(/[^a-zA-Z0-9_-]/g, '_'))
    .filter(part => part.length > 0);

  return `${prefix}:${sanitizedParts.join(':')}`;
}

/**
 * Generic cache operations with fallback handling
 */
export class RedisCache {
  /**
   * Get cached data with automatic JSON parsing
   */
  static async get<T>(key: string): Promise<T | null> {
    if (!redis) {
      console.debug('Redis not available, cache miss:', key);
      return null;
    }

    try {
      const cached = await redis.get(key);

      if (cached === null || cached === undefined) {
        console.debug('Cache miss:', key);
        return null;
      }

      console.debug('Cache hit:', key);
      return cached as T;
    } catch (error) {
      console.error('Redis get error:', error);
      return null; // Graceful fallback
    }
  }

  /**
   * Set cached data with automatic JSON serialization and TTL
   */
  static async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    if (!redis) {
      console.debug('Redis not available, skipping cache set:', key);
      return false;
    }

    try {
      if (ttlSeconds) {
        await redis.setex(key, ttlSeconds, value);
      } else {
        await redis.set(key, value);
      }

      console.debug('Cache set:', key, ttlSeconds ? `(TTL: ${ttlSeconds}s)` : '');
      return true;
    } catch (error) {
      console.error('Redis set error:', error);
      return false;
    }
  }

  /**
   * Delete cached data
   */
  static async delete(key: string): Promise<boolean> {
    if (!redis) {
      return false;
    }

    try {
      const result = await redis.del(key);
      console.debug('Cache delete:', key, `(deleted: ${result})`);
      return result > 0;
    } catch (error) {
      console.error('Redis delete error:', error);
      return false;
    }
  }

  /**
   * Delete multiple keys matching a pattern
   */
  static async deletePattern(pattern: string): Promise<number> {
    if (!redis) {
      return 0;
    }

    try {
      // Get all keys matching the pattern
      const keys = await redis.keys(pattern);

      if (keys.length === 0) {
        return 0;
      }

      // Delete all matching keys
      const result = await redis.del(...keys);
      console.debug('Cache pattern delete:', pattern, `(deleted: ${result})`);
      return result;
    } catch (error) {
      console.error('Redis pattern delete error:', error);
      return 0;
    }
  }

  /**
   * Check if Redis is available
   */
  static isAvailable(): boolean {
    return redis !== null;
  }

  /**
   * Get cache statistics
   */
  static async getStats() {
    if (!redis) {
      return { available: false, keys: 0 };
    }

    try {
      // Get basic stats using available methods
      const keys = await redis.keys('*');
      return { available: true, keys: keys.length };
    } catch (error) {
      console.error('Redis stats error:', error);
      return { available: false, keys: 0 };
    }
  }
}

/**
 * Product-specific cache operations
 */
export class ProductCache {
  /**
   * Cache products listing with filters
   */
  static async cacheProductsList(
    filters: Record<string, any>,
    data: any,
    ttl: number = CACHE_TTL.PRODUCTS_LIST
  ): Promise<void> {
    const filterKey = Object.entries(filters)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${value}`)
      .join('_');

    const cacheKey = generateCacheKey(CACHE_PREFIXES.PRODUCTS_LIST, filterKey);
    await RedisCache.set(cacheKey, data, ttl);
  }

  /**
   * Get cached products listing
   */
  static async getProductsList(filters: Record<string, any>): Promise<any | null> {
    const filterKey = Object.entries(filters)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${value}`)
      .join('_');

    const cacheKey = generateCacheKey(CACHE_PREFIXES.PRODUCTS_LIST, filterKey);
    return RedisCache.get(cacheKey);
  }

  /**
   * Cache individual product
   */
  static async cacheProduct(
    handle: string,
    data: any,
    ttl: number = CACHE_TTL.PRODUCT_DETAIL
  ): Promise<void> {
    const cacheKey = generateCacheKey(CACHE_PREFIXES.PRODUCT_DETAIL, handle);
    await RedisCache.set(cacheKey, data, ttl);
  }

  /**
   * Get cached individual product
   */
  static async getProduct(handle: string): Promise<any | null> {
    const cacheKey = generateCacheKey(CACHE_PREFIXES.PRODUCT_DETAIL, handle);
    return RedisCache.get(cacheKey);
  }

  /**
   * Cache search results
   */
  static async cacheSearchResults(
    query: string,
    filters: Record<string, any>,
    data: any,
    ttl: number = CACHE_TTL.SEARCH_RESULTS
  ): Promise<void> {
    const filterKey = Object.entries(filters)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${value}`)
      .join('_');

    const cacheKey = generateCacheKey(CACHE_PREFIXES.SEARCH_RESULTS, query, filterKey);
    await RedisCache.set(cacheKey, data, ttl);
  }

  /**
   * Get cached search results
   */
  static async getSearchResults(
    query: string,
    filters: Record<string, any>
  ): Promise<any | null> {
    const filterKey = Object.entries(filters)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${value}`)
      .join('_');

    const cacheKey = generateCacheKey(CACHE_PREFIXES.SEARCH_RESULTS, query, filterKey);
    return RedisCache.get(cacheKey);
  }

  /**
   * Cache related products
   */
  static async cacheRelatedProducts(
    handle: string,
    data: any,
    ttl: number = CACHE_TTL.RELATED_PRODUCTS
  ): Promise<void> {
    const cacheKey = generateCacheKey(CACHE_PREFIXES.RELATED_PRODUCTS, handle);
    await RedisCache.set(cacheKey, data, ttl);
  }

  /**
   * Get cached related products
   */
  static async getRelatedProducts(handle: string): Promise<any | null> {
    const cacheKey = generateCacheKey(CACHE_PREFIXES.RELATED_PRODUCTS, handle);
    return RedisCache.get(cacheKey);
  }

  /**
   * Invalidate all product caches (use after product updates)
   */
  static async invalidateAll(): Promise<void> {
    await Promise.all([
      RedisCache.deletePattern(`${CACHE_PREFIXES.PRODUCTS_LIST}:*`),
      RedisCache.deletePattern(`${CACHE_PREFIXES.PRODUCT_DETAIL}:*`),
      RedisCache.deletePattern(`${CACHE_PREFIXES.SEARCH_RESULTS}:*`),
      RedisCache.deletePattern(`${CACHE_PREFIXES.RELATED_PRODUCTS}:*`),
    ]);
  }

  /**
   * Invalidate specific product cache
   */
  static async invalidateProduct(handle: string): Promise<void> {
    await Promise.all([
      RedisCache.delete(generateCacheKey(CACHE_PREFIXES.PRODUCT_DETAIL, handle)),
      RedisCache.delete(generateCacheKey(CACHE_PREFIXES.RELATED_PRODUCTS, handle)),
      // Also invalidate listings that might include this product
      RedisCache.deletePattern(`${CACHE_PREFIXES.PRODUCTS_LIST}:*`),
      RedisCache.deletePattern(`${CACHE_PREFIXES.SEARCH_RESULTS}:*`),
    ]);
  }
}

/**
 * Cache warming utilities
 */
export class CacheWarmer {
  /**
   * Warm up popular product caches
   */
  static async warmPopularProducts(handles: string[]): Promise<void> {
    console.log('🔥 Warming product caches for:', handles.length, 'products');

    // This would typically be called from a cron job or after deployment
    // Implementation would fetch and cache popular products
    // For now, just log the intent
    console.log('Cache warming would fetch and cache products:', handles);
  }

  /**
   * Warm up products listing cache with common filters
   */
  static async warmProductsListings(): Promise<void> {
    console.log('🔥 Warming products listing caches');

    const commonFilters = [
      { sortBy: 'updatedAt', sortOrder: 'desc', first: 16 },
      { featured: true, sortBy: 'updatedAt', sortOrder: 'desc', first: 8 },
      { productType: 'ai-tool', sortBy: 'updatedAt', sortOrder: 'desc', first: 16 },
      { productType: 'template', sortBy: 'updatedAt', sortOrder: 'desc', first: 16 },
    ];

    // Would implement actual cache warming here
    console.log('Cache warming would pre-fetch listings with filters:', commonFilters);
  }
}

export { CACHE_PREFIXES, CACHE_TTL };