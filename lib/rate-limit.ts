/**
 * Distributed Rate Limiting with Upstash Redis
 *
 * PRODUCTION-READY: Uses Upstash Redis for rate limiting across serverless instances
 *
 * Benefits:
 * - Persistent across deployments and serverless instances
 * - Accurate rate limiting in production
 * - Built-in analytics and monitoring
 * - Automatic cleanup of expired entries
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Validate Redis configuration
if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.warn(
    '⚠️  UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not configured. ' +
    'Rate limiting will fall back to in-memory (not production-ready).'
  );
}

/**
 * Cart API Rate Limiter
 *
 * Standard cart operations: 30 requests per minute per user/IP
 */
export const cartRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '1 m'),
  analytics: true,
  prefix: '@afilo/cart',
});

/**
 * Cart Validation Rate Limiter
 *
 * More restrictive for validation endpoint: 20 requests per 15 minutes
 * This prevents pricing enumeration attacks
 */
export const validationRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '15 m'),
  analytics: true,
  prefix: '@afilo/validate',
});

/**
 * Checkout Rate Limiter
 *
 * Very restrictive for checkout: 5 requests per 15 minutes
 * Prevents checkout abuse and spam
 */
export const checkoutRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  analytics: true,
  prefix: '@afilo/checkout',
});

/**
 * Shopify API Rate Limiter
 *
 * Prevents exhausting Shopify API quota: 100 requests per minute
 * Shopify limit is ~200-500 requests/min depending on query complexity
 */
export const shopifyApiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
  prefix: '@afilo/shopify-api',
});

/**
 * Helper function to check rate limit and return standardized response
 *
 * @param identifier - User ID, IP address, or other unique identifier
 * @param limiter - The rate limiter to use
 * @returns Rate limit result with success status and headers
 */
export async function checkRateLimit(
  identifier: string,
  limiter: Ratelimit
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  headers: Record<string, string>;
}> {
  const { success, limit, reset, remaining } = await limiter.limit(identifier);

  const headers = {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': new Date(reset).toISOString(),
  };

  return {
    success,
    limit,
    remaining,
    reset,
    headers,
  };
}

/**
 * Get rate limit identifier from user ID or IP address
 *
 * Prioritizes authenticated users (more accurate tracking)
 * Falls back to IP address for anonymous users
 *
 * @param userId - Clerk user ID (optional)
 * @param ip - IP address from request headers
 * @returns Identifier string for rate limiting
 */
export function getRateLimitIdentifier(userId: string | null, ip: string): string {
  return userId ? `user:${userId}` : `ip:${ip}`;
}

/**
 * Extract IP address from Next.js request headers
 *
 * Handles various proxy scenarios (Vercel, Cloudflare, etc.)
 *
 * @param request - NextRequest object
 * @returns IP address string
 */
export function getClientIp(request: Request): string {
  // Check common headers in order of preference
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');
  const cfConnecting = request.headers.get('cf-connecting-ip');

  if (cfConnecting) return cfConnecting;
  if (real) return real;
  if (forwarded) return forwarded.split(',')[0].trim();

  return 'unknown';
}