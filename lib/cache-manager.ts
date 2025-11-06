/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cache Manager for Shopify API responses
 *
 * Implements intelligent caching with proper key generation,
 * TTL management, and memory cleanup.
 */

import { log } from './logger';

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
   */
  get<T = any>(key: string, defaultTtl: number = 60000): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update hit statistics
    entry.hits++;
    this.stats.hits++;

    return entry.data as T;
  }

  /**
   * Set data in cache with TTL
   */
  set<T = any>(key: string, data: T, ttl: number = 60000): void {
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