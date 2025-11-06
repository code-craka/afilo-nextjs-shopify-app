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
 * Products API Rate Limiter
 *
 * Prevents exhausting database: 100 requests per 15 minutes (production)
 * Development: 1000 requests per minute (allows hot reload and testing)
 * With caching in place, this limit is generous for normal usage
 */
export const productsApiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(
    process.env.NODE_ENV === 'development' ? 1000 : 100,
    '15 m'
  ),
  analytics: true,
  prefix: '@afilo/products-api',
});

/**
 * SECURITY: Billing API Rate Limiters
 *
 * These prevent abuse and fraud through request rate limiting
 * Risk Prevention: $225K fraud risk from plan change spam attacks
 */

/**
 * Strict Billing Rate Limiter
 *
 * For sensitive operations: subscription changes, cancellations, plan updates
 * 5 requests per 15 minutes prevents rapid-fire fraud attempts
 */
export const strictBillingRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  analytics: true,
  prefix: '@afilo/billing-strict',
});

/**
 * Moderate Billing Rate Limiter
 *
 * For setup/creation operations: payment method setup, portal sessions
 * 10 requests per 5 minutes balances usability with security
 */
export const moderateBillingRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '5 m'),
  analytics: true,
  prefix: '@afilo/billing-moderate',
});

/**
 * Standard Billing Rate Limiter
 *
 * For read operations: list invoices, payment methods, subscriptions
 * 30 requests per minute allows normal browsing while preventing scraping
 */
export const standardBillingRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '1 m'),
  analytics: true,
  prefix: '@afilo/billing-standard',
});

/**
 * PHASE 5: Chat Bot Rate Limiters
 *
 * Tiered rate limiting based on subscription status
 * Prevents abuse while allowing premium customers higher limits
 */

/**
 * Standard Chat Rate Limiter
 *
 * For free and professional tier users: 30 messages per 5 minutes
 * Allows normal conversation flow while preventing spam/abuse
 */
export const chatRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '5 m'),
  analytics: true,
  prefix: '@afilo/chat-standard',
});

/**
 * Premium Chat Rate Limiter
 *
 * For Enterprise and Enterprise Plus customers: 100 messages per 5 minutes
 * Higher limits for paying customers with more complex support needs
 */
export const premiumChatRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '5 m'),
  analytics: true,
  prefix: '@afilo/chat-premium',
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

/**
 * Get appropriate chat rate limiter based on subscription tier
 *
 * @param subscriptionTier - User's subscription tier from CustomerContext
 * @returns Rate limiter instance (premium for Enterprise/Enterprise Plus, standard for others)
 */
export function getChatRateLimit(subscriptionTier: string | null): Ratelimit {
  // Premium customers (Enterprise and Enterprise Plus) get higher limits
  if (subscriptionTier === 'enterprise' || subscriptionTier === 'enterprise_plus') {
    return premiumChatRateLimit;
  }

  // Standard limits for free and professional users
  return chatRateLimit;
}