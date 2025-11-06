/**
 * Rate Limiting Service
 *
 * Phase 2 Feature: Enterprise Integrations
 *
 * Provides:
 * - Configurable rate limiting per endpoint
 * - IP-based and user-based rate limiting
 * - Sliding window implementation
 * - Rate limit analytics and monitoring
 * - Automatic cleanup of expired windows
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export interface RateLimitConfig {
  windowSizeMinutes: number;
  maxRequests: number;
  identifier?: string; // Override automatic identifier
  identifierType?: 'ip' | 'user' | 'api_key';
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  current: number;
  remaining: number;
  resetTime: Date;
  retryAfter?: number; // Seconds until next request allowed
}

export class RateLimiterService {
  /**
   * Default rate limit configurations for different endpoints
   */
  private static readonly DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
    // Public APIs - more restrictive
    '/api/stripe/webhook': { windowSizeMinutes: 1, maxRequests: 100 },
    '/api/contact': { windowSizeMinutes: 15, maxRequests: 5 },
    '/api/auth/*': { windowSizeMinutes: 15, maxRequests: 20 },

    // Admin APIs - moderate limits
    '/api/admin/*': { windowSizeMinutes: 1, maxRequests: 50 },
    '/api/billing/*': { windowSizeMinutes: 1, maxRequests: 30 },

    // Chat APIs - moderate limits
    '/api/chat/*': { windowSizeMinutes: 1, maxRequests: 20 },

    // Default fallback
    '*': { windowSizeMinutes: 1, maxRequests: 60 },
  };

  /**
   * Check rate limit for request
   */
  static async checkRateLimit(
    request: NextRequest,
    endpoint: string,
    config?: RateLimitConfig
  ): Promise<RateLimitResult> {
    try {
      const finalConfig = config || this.getConfigForEndpoint(endpoint);
      const identifier = await this.getIdentifier(request, finalConfig);
      const identifierType = finalConfig.identifierType || this.detectIdentifierType(identifier);

      const windowStart = this.getWindowStart(finalConfig.windowSizeMinutes);
      const windowEnd = new Date(windowStart.getTime() + finalConfig.windowSizeMinutes * 60 * 1000);

      // Get or create rate limit record
      const rateLimitRecord = await prisma.rate_limit_tracking.upsert({
        where: {
          identifier_endpoint_window_start: {
            identifier,
            endpoint,
            window_start: windowStart,
          },
        },
        update: {
          current_count: { increment: 1 },
          updated_at: new Date(),
        },
        create: {
          identifier,
          identifier_type: identifierType,
          endpoint,
          current_count: 1,
          limit_count: finalConfig.maxRequests,
          window_start: windowStart,
          window_end: windowEnd,
        },
      });

      const allowed = rateLimitRecord.current_count <= finalConfig.maxRequests;
      const remaining = Math.max(0, finalConfig.maxRequests - rateLimitRecord.current_count);

      // Calculate retry after if blocked
      let retryAfter: number | undefined;
      if (!allowed) {
        const now = new Date();
        const windowEndTime = rateLimitRecord.window_end.getTime();
        retryAfter = Math.ceil((windowEndTime - now.getTime()) / 1000);

        // Update blocked_until timestamp
        await prisma.rate_limit_tracking.update({
          where: { id: rateLimitRecord.id },
          data: { blocked_until: new Date(now.getTime() + retryAfter * 1000) },
        });
      }

      return {
        allowed,
        limit: finalConfig.maxRequests,
        current: rateLimitRecord.current_count,
        remaining,
        resetTime: rateLimitRecord.window_end,
        retryAfter,
      };

    } catch (error) {
      console.error('Error checking rate limit:', error);
      // Fail open - allow request if rate limiting fails
      return {
        allowed: true,
        limit: 0,
        current: 0,
        remaining: 0,
        resetTime: new Date(),
      };
    }
  }

  /**
   * Get rate limit analytics
   */
  static async getRateLimitAnalytics(
    hours: number = 24
  ): Promise<{
    totalRequests: number;
    blockedRequests: number;
    blockRate: number;
    topBlockedEndpoints: Array<{ endpoint: string; blocks: number }>;
    topBlockedIPs: Array<{ ip: string; blocks: number }>;
    rateLimitTrends: Array<{ hour: string; requests: number; blocks: number }>;
  }> {
    try {
      const since = new Date(Date.now() - hours * 60 * 60 * 1000);

      // Total requests and blocks
      const totalRequests = await prisma.rate_limit_tracking.aggregate({
        where: { created_at: { gte: since } },
        _sum: { current_count: true },
      });

      const blockedRequests = await prisma.rate_limit_tracking.aggregate({
        where: {
          created_at: { gte: since },
          blocked_until: { not: null },
        },
        _sum: { current_count: true },
      });

      const totalCount = totalRequests._sum.current_count || 0;
      const blockedCount = blockedRequests._sum.current_count || 0;

      // Top blocked endpoints
      const topBlockedEndpoints = await prisma.rate_limit_tracking.groupBy({
        by: ['endpoint'],
        where: {
          created_at: { gte: since },
          blocked_until: { not: null },
        },
        _sum: { current_count: true },
        orderBy: { _sum: { current_count: 'desc' } },
        take: 10,
      });

      // Top blocked IPs
      const topBlockedIPs = await prisma.rate_limit_tracking.groupBy({
        by: ['identifier'],
        where: {
          created_at: { gte: since },
          identifier_type: 'ip',
          blocked_until: { not: null },
        },
        _sum: { current_count: true },
        orderBy: { _sum: { current_count: 'desc' } },
        take: 10,
      });

      // Rate limit trends
      const trends = await prisma.$queryRaw<Array<{
        hour: string;
        requests: bigint;
        blocks: bigint;
      }>>`
        SELECT
          DATE_TRUNC('hour', created_at) as hour,
          SUM(current_count) as requests,
          SUM(CASE WHEN blocked_until IS NOT NULL THEN current_count ELSE 0 END) as blocks
        FROM rate_limit_tracking
        WHERE created_at >= ${since}
        GROUP BY DATE_TRUNC('hour', created_at)
        ORDER BY hour ASC
      `;

      return {
        totalRequests: totalCount,
        blockedRequests: blockedCount,
        blockRate: totalCount > 0 ? (blockedCount / totalCount) * 100 : 0,
        topBlockedEndpoints: topBlockedEndpoints.map(e => ({
          endpoint: e.endpoint,
          blocks: e._sum.current_count || 0,
        })),
        topBlockedIPs: topBlockedIPs.map(ip => ({
          ip: ip.identifier,
          blocks: ip._sum.current_count || 0,
        })),
        rateLimitTrends: trends.map(t => ({
          hour: t.hour,
          requests: Number(t.requests),
          blocks: Number(t.blocks),
        })),
      };
    } catch (error) {
      console.error('Error getting rate limit analytics:', error);
      throw error;
    }
  }

  /**
   * Clean up expired rate limit windows
   */
  static async cleanupExpiredWindows(): Promise<number> {
    try {
      const now = new Date();

      const result = await prisma.rate_limit_tracking.deleteMany({
        where: {
          window_end: { lte: now },
        },
      });

      if (result.count > 0) {
        console.log(`🧹 Cleaned up ${result.count} expired rate limit windows`);
      }

      return result.count;
    } catch (error) {
      console.error('Error cleaning up rate limit windows:', error);
      return 0;
    }
  }

  /**
   * Get currently blocked IPs/users
   */
  static async getBlockedIdentifiers(): Promise<Array<{
    identifier: string;
    identifierType: string;
    endpoint: string;
    blockedUntil: Date;
    currentCount: number;
    limitCount: number;
  }>> {
    try {
      const now = new Date();

      const blocked = await prisma.rate_limit_tracking.findMany({
        where: {
          blocked_until: { gt: now },
        },
        select: {
          identifier: true,
          identifier_type: true,
          endpoint: true,
          blocked_until: true,
          current_count: true,
          limit_count: true,
        },
        orderBy: { blocked_until: 'desc' },
      });

      return blocked.map(b => ({
        identifier: b.identifier,
        identifierType: b.identifier_type,
        endpoint: b.endpoint,
        blockedUntil: b.blocked_until!,
        currentCount: b.current_count,
        limitCount: b.limit_count,
      }));
    } catch (error) {
      console.error('Error getting blocked identifiers:', error);
      return [];
    }
  }

  /**
   * Manually unblock an identifier
   */
  static async unblockIdentifier(
    identifier: string,
    endpoint: string
  ): Promise<boolean> {
    try {
      const result = await prisma.rate_limit_tracking.updateMany({
        where: {
          identifier,
          endpoint,
          blocked_until: { not: null },
        },
        data: {
          blocked_until: null,
          updated_at: new Date(),
        },
      });

      const unblocked = result.count > 0;
      if (unblocked) {
        console.log(`✅ Unblocked identifier: ${identifier} for endpoint: ${endpoint}`);
      }

      return unblocked;
    } catch (error) {
      console.error('Error unblocking identifier:', error);
      return false;
    }
  }

  /**
   * Get configuration for specific endpoint
   */
  private static getConfigForEndpoint(endpoint: string): RateLimitConfig {
    // Direct match
    if (this.DEFAULT_CONFIGS[endpoint]) {
      return this.DEFAULT_CONFIGS[endpoint];
    }

    // Pattern match
    for (const [pattern, config] of Object.entries(this.DEFAULT_CONFIGS)) {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace('*', '.*'));
        if (regex.test(endpoint)) {
          return config;
        }
      }
    }

    // Default fallback
    return this.DEFAULT_CONFIGS['*'];
  }

  /**
   * Get identifier for rate limiting
   */
  private static async getIdentifier(request: NextRequest, config: RateLimitConfig): Promise<string> {
    if (config.identifier) {
      return config.identifier;
    }

    // Try to get user ID first
    try {
      const { userId } = await auth();
      if (userId) {
        return userId;
      }
    } catch {
      // Not authenticated, fall back to IP
    }

    // API key from headers
    const apiKey = request.headers.get('x-api-key');
    if (apiKey) {
      return apiKey;
    }

    // Fall back to IP address
    return this.getClientIP(request) || 'unknown';
  }

  /**
   * Detect identifier type
   */
  private static detectIdentifierType(identifier: string): 'ip' | 'user' | 'api_key' {
    if (identifier.startsWith('user_')) {
      return 'user';
    }

    if (identifier.includes('.') || identifier.includes(':')) {
      return 'ip';
    }

    if (identifier.startsWith('ak_') || identifier.length > 20) {
      return 'api_key';
    }

    return 'ip';
  }

  /**
   * Get window start time (rounded to minute)
   */
  private static getWindowStart(windowSizeMinutes: number): Date {
    const now = new Date();
    const windowSizeMs = windowSizeMinutes * 60 * 1000;

    // Round down to the nearest window boundary
    const windowStart = new Date(Math.floor(now.getTime() / windowSizeMs) * windowSizeMs);

    return windowStart;
  }

  /**
   * Get client IP address
   */
  private static getClientIP(request: NextRequest): string | null {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const remoteAddress = request.headers.get('x-vercel-forwarded-for');

    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }

    return realIP || remoteAddress || null;
  }

  /**
   * Create custom rate limit configuration
   */
  static createConfig(
    windowSizeMinutes: number,
    maxRequests: number,
    options?: {
      identifier?: string;
      identifierType?: 'ip' | 'user' | 'api_key';
    }
  ): RateLimitConfig {
    return {
      windowSizeMinutes,
      maxRequests,
      identifier: options?.identifier,
      identifierType: options?.identifierType,
    };
  }
}