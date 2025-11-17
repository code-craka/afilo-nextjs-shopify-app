/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cache Manager for Shopify API responses
 *
 * Implements 2-layer intelligent caching:
 * - Layer 1: In-memory cache (fastest, 60s TTL)
 * - Layer 2: Redis cache (persistent, 5-min TTL)
 *
 * Part of Performance Optimization - Option A
 * Expected Impact: Products page 2.7s → 0.3s (90% faster)
 */

import { log } from './logger';
import { LocalRedisCache } from './cache/local-redis';

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
}

export class CacheManager {
  private cache = new Map<string, CacheEntry>();
  private stats = { hits: 0, misses: 0 };
  private maxEntries: number;
  private cleanupInterval: NodeJS.Timeout;

  constructor(maxEntries: number = 100) {
    this.maxEntries = maxEntries;

    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Generate a cache key from parameters
   */
  generateKey(params: Record<string, any>): string {
    // Sort keys to ensure consistent ordering
    const sortedKeys = Object.keys(params).sort();

    // Create a normalized parameter object
    const normalizedParams: Record<string, any> = {};

    for (const key of sortedKeys) {
      const value = params[key];

      // Skip undefined and null values
      if (value === undefined || value === null) continue;

      // Normalize boolean values
      if (typeof value === 'boolean') {
        normalizedParams[key] = value ? 'true' : 'false';
        continue;
      }

      // Normalize arrays (sort them)
      if (Array.isArray(value)) {
        normalizedParams[key] = [...value].sort().join(',');
        continue;
      }

      normalizedParams[key] = String(value);
    }

    // Create a stable key using base64 encoding
    const paramString = JSON.stringify(normalizedParams);
    return Buffer.from(paramString).toString('base64').substring(0, 64);
  }

  /**
   * Get cached data if available and not expired
   * Synchronous L1 (memory) check with background L2 (Redis) promotion
   */
  get<T = any>(key: string, defaultTtl: number = 60000): T | null {
    // Layer 1: Check in-memory cache first (fastest)
    const entry = this.cache.get(key);

    if (entry) {
      // Check if entry has expired
      if (Date.now() - entry.timestamp <= entry.ttl) {
        // Update hit statistics
        entry.hits++;
        this.stats.hits++;
        log.debug('Cache hit (L1 memory)', { key });
        return entry.data as T;
      }

      // Expired in memory
      this.cache.delete(key);
    }

    // Layer 2: Check Redis cache (async, non-blocking)
    // This runs in background and promotes to L1 for next request
    LocalRedisCache.get<T>(key).then(redisData => {
      if (redisData) {
        log.debug('Cache hit (L2 Redis) - promoting to L1', { key });
        // Promote to L1 cache for next request
        this.setSync(key, redisData, defaultTtl);
      }
    }).catch(error => {
      log.warn('Redis cache read error', { key, error });
    });

    // Cache miss (returns null, but Redis might populate L1 for next request)
    this.stats.misses++;
    return null;
  }

  /**
   * Async version for when you need to wait for Redis
   * Uses 2-layer caching: Memory (L1) → Redis (L2)
   */
  async getAsync<T = any>(key: string, defaultTtl: number = 60000): Promise<T | null> {
    // Layer 1: Check in-memory cache first (fastest)
    const entry = this.cache.get(key);

    if (entry) {
      // Check if entry has expired
      if (Date.now() - entry.timestamp <= entry.ttl) {
        // Update hit statistics
        entry.hits++;
        this.stats.hits++;
        log.debug('Cache hit (L1 memory)', { key });
        return entry.data as T;
      }

      // Expired in memory
      this.cache.delete(key);
    }

    // Layer 2: Check Redis cache (persistent)
    try {
      const redisData = await LocalRedisCache.get<T>(key);

      if (redisData) {
        log.debug('Cache hit (L2 Redis)', { key });

        // Promote to L1 cache
        this.setSync(key, redisData, defaultTtl);
        this.stats.hits++;

        return redisData;
      }
    } catch (error) {
      log.warn('Redis cache read error, continuing without cache', { key, error });
    }

    // Cache miss on both layers
    this.stats.misses++;
    return null;
  }

  /**
   * Set data in cache with TTL
   * Writes to both L1 (memory) and L2 (Redis)
   */
  set<T = any>(key: string, data: T, ttl: number = 60000): void {
    // Layer 1: Set in memory
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      hits: 0
    };

    this.cache.set(key, entry);

    // Enforce size limit
    if (this.cache.size > this.maxEntries) {
      this.evictLeastUsed();
    }

    // Layer 2: Async write to Redis (fire and forget)
    const redisTtl = Math.max(ttl / 1000, 300); // At least 5 minutes in Redis
    LocalRedisCache.set(key, data, redisTtl)
      .then(() => {
        log.debug('Cache set (L1+L2)', { key, memoryTtl: ttl, redisTtl });
      })
      .catch(error => {
        log.warn('Redis cache write error, continuing with memory cache only', { key, error });
      });
  }

  /**
   * Internal sync version (for Redis promotion)
   */
  private setSync<T = any>(key: string, data: T, ttl: number = 60000): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      hits: 0
    };

    this.cache.set(key, entry);

    // Enforce size limit
    if (this.cache.size > this.maxEntries) {
      this.evictLeastUsed();
    }
  }

  /**
   * Delete a specific cache entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      size: this.cache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: total > 0 ? Math.round((this.stats.hits / total) * 100) : 0
    };
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key));

    if (expiredKeys.length > 0) {
      log.debug('Cache cleanup', { removedEntries: expiredKeys.length });
    }
  }

  /**
   * Evict least recently used entries when cache is full
   */
  private evictLeastUsed(): void {
    let leastUsedKey: string | null = null;
    let minHits = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.hits < minHits) {
        minHits = entry.hits;
        leastUsedKey = key;
      }
    }

    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
      log.debug('Cache eviction', { evictedKey: leastUsedKey, hits: minHits });
    }
  }

  /**
   * Destroy the cache manager and cleanup intervals
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

// Global cache manager instance
export const cacheManager = new CacheManager();

// Development-time access for debugging
if (process.env.NODE_ENV === 'development') {
  (globalThis as any).cacheManager = cacheManager;
}