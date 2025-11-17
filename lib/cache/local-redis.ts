/**
 * Local Redis Client for On-Premise Redis Server
 *
 * This implementation connects to a local Redis server running on the same machine
 * Part of Performance Optimization - Option A
 *
 * Expected Impact: Products page 2.7s → 0.3s (90% faster)
 */

import Redis from 'ioredis';

// Initialize local Redis client with fallback handling
let redis: Redis | null = null;
let redisError: Error | null = null;

try {
  const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
  const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
  const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

  redis = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    lazyConnect: true, // Don't connect immediately
  });

  // Handle connection events
  redis.on('error', (err) => {
    console.error('Redis connection error:', err.message);
    redisError = err;
  });

  redis.on('connect', () => {
    console.log('✅ Redis connected successfully');
    redisError = null;
  });

  redis.on('ready', () => {
    console.log('✅ Redis ready to accept commands');
  });

  // Connect to Redis
  redis.connect().catch((err) => {
    console.warn('Redis initial connection failed, caching disabled:', err.message);
    redisError = err;
  });

} catch (error) {
  console.warn('Redis initialization failed, caching disabled:', error);
  redisError = error as Error;
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
  PRODUCTS_LIST: 300, // 5 minutes - products change frequently
  PRODUCT_DETAIL: 600, // 10 minutes - individual products change less
  SEARCH_RESULTS: 300, // 5 minutes - search results need freshness
  CATEGORY: 900, // 15 minutes - categories change rarely
  RELATED_PRODUCTS: 600, // 10 minutes - related products are stable
  USER_CART: 180, // 3 minutes - cart data needs to be fresh
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
export class LocalRedisCache {
  /**
   * Get cached data with automatic JSON parsing
   */
  static async get<T>(key: string): Promise<T | null> {
    if (!redis || redisError) {
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
      return JSON.parse(cached) as T;
    } catch (error) {
      console.error('Redis get error:', error);
      return null; // Graceful fallback
    }
  }

  /**
   * Set cached data with automatic JSON serialization and TTL
   */
  static async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    if (!redis || redisError) {
      console.debug('Redis not available, skipping cache set:', key);
      return false;
    }

    try {
      const serialized = JSON.stringify(value);

      if (ttlSeconds) {
        await redis.setex(key, ttlSeconds, serialized);
      } else {
        await redis.set(key, serialized);
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
    if (!redis || redisError) {
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
    if (!redis || redisError) {
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
    return redis !== null && redisError === null && redis.status === 'ready';
  }

  /**
   * Get cache statistics
   */
  static async getStats() {
    if (!redis || redisError) {
      return { available: false, keys: 0, memory: '0B', error: redisError?.message };
    }

    try {
      const info = await redis.info('stats');
      const dbsize = await redis.dbsize();
      const memory = await redis.info('memory');

      // Parse memory info
      const memoryMatch = memory.match(/used_memory_human:(.+)/);
      const memoryUsed = memoryMatch ? memoryMatch[1].trim() : 'unknown';

      return {
        available: true,
        keys: dbsize,
        memory: memoryUsed,
        status: redis.status,
      };
    } catch (error) {
      console.error('Redis stats error:', error);
      return { available: false, keys: 0, memory: '0B', error: (error as Error).message };
    }
  }

  /**
   * Flush all cache (use with caution!)
   */
  static async flushAll(): Promise<boolean> {
    if (!redis || redisError) {
      return false;
    }

    try {
      await redis.flushdb();
      console.warn('⚠️  Redis cache flushed!');
      return true;
    } catch (error) {
      console.error('Redis flush error:', error);
      return false;
    }
  }

  /**
   * Close Redis connection (for graceful shutdown)
   */
  static async disconnect(): Promise<void> {
    if (redis) {
      await redis.quit();
    }
  }
}

/**
 * Product-specific cache operations using local Redis
 */
export class LocalProductCache {
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
    await LocalRedisCache.set(cacheKey, data, ttl);
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
    return LocalRedisCache.get(cacheKey);
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
    await LocalRedisCache.set(cacheKey, data, ttl);
  }

  /**
   * Get cached individual product
   */
  static async getProduct(handle: string): Promise<any | null> {
    const cacheKey = generateCacheKey(CACHE_PREFIXES.PRODUCT_DETAIL, handle);
    return LocalRedisCache.get(cacheKey);
  }

  /**
   * Invalidate all product caches (use after product updates)
   */
  static async invalidateAll(): Promise<void> {
    await Promise.all([
      LocalRedisCache.deletePattern(`${CACHE_PREFIXES.PRODUCTS_LIST}:*`),
      LocalRedisCache.deletePattern(`${CACHE_PREFIXES.PRODUCT_DETAIL}:*`),
      LocalRedisCache.deletePattern(`${CACHE_PREFIXES.SEARCH_RESULTS}:*`),
      LocalRedisCache.deletePattern(`${CACHE_PREFIXES.RELATED_PRODUCTS}:*`),
    ]);
  }

  /**
   * Invalidate specific product cache
   */
  static async invalidateProduct(handle: string): Promise<void> {
    await Promise.all([
      LocalRedisCache.delete(generateCacheKey(CACHE_PREFIXES.PRODUCT_DETAIL, handle)),
      LocalRedisCache.delete(generateCacheKey(CACHE_PREFIXES.RELATED_PRODUCTS, handle)),
      // Also invalidate listings that might include this product
      LocalRedisCache.deletePattern(`${CACHE_PREFIXES.PRODUCTS_LIST}:*`),
      LocalRedisCache.deletePattern(`${CACHE_PREFIXES.SEARCH_RESULTS}:*`),
    ]);
  }
}

export { CACHE_PREFIXES, CACHE_TTL };
