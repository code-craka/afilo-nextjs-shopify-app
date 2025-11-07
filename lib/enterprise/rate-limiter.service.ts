/**
 * Rate Limiting Service - PRODUCTION VERSION
 *
 * Enterprise rate limiting with analytics and enforcement
 * Uses sliding window algorithm with database persistence
 */

import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';

export interface RateLimitConfig {
  identifier: string;
  limit: number;
  windowMs: number;
  skipOnError?: boolean;
  keyGenerator?: (req: any) => string;
}

export interface RateLimitStats {
  identifier: string;
  requests: number;
  blocks: number;
  window_start: Date;
  window_end: Date;
}

export interface RateLimitSummary {
  total_requests: number;
  total_blocks: number;
  block_rate: number;
  top_blocked_ips: { ip: string; blocks: number }[];
  hourly_stats: { hour: number; requests: number; blocks: number }[];
}

export class RateLimiterService {
  /**
   * Check rate limit for identifier using sliding window algorithm
   */
  static async checkLimit(config: RateLimitConfig): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: Date;
  }> {
    try {
      const now = new Date();
      const windowStart = new Date(now.getTime() - config.windowMs);

      // Clean up old windows and get current count
      await prisma.rate_limit_tracking.deleteMany({
        where: {
          identifier: config.identifier,
          window_start: { lt: windowStart }
        }
      });

      // Find or create current tracking record
      let currentWindow = await prisma.rate_limit_tracking.findFirst({
        where: {
          identifier: config.identifier,
          endpoint: 'default',
          window_start: { gte: windowStart }
        },
        orderBy: { window_start: 'desc' }
      });

      if (!currentWindow) {
        currentWindow = await prisma.rate_limit_tracking.create({
          data: {
            id: randomUUID(),
            identifier: config.identifier,
            identifier_type: config.identifier.includes('@') ? 'user' : 'ip',
            endpoint: 'default',
            request_count: 0,
            window_start: now,
            blocked: false,
            created_at: now,
            updated_at: now
          }
        });
      }

      // Check if currently blocked
      if (currentWindow.blocked && currentWindow.blocked_until && currentWindow.blocked_until > now) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: currentWindow.blocked_until
        };
      }

      // Clear block if expired
      if (currentWindow.blocked && (!currentWindow.blocked_until || currentWindow.blocked_until <= now)) {
        await prisma.rate_limit_tracking.update({
          where: { id: currentWindow.id },
          data: {
            blocked: false,
            blocked_until: null,
            request_count: 0,
            window_start: now
          }
        });
        currentWindow.request_count = 0;
        currentWindow.blocked = false;
      }

      const allowed = currentWindow.request_count < config.limit;
      const remaining = Math.max(0, config.limit - currentWindow.request_count - 1);

      // If allowed, increment counter
      if (allowed) {
        await prisma.rate_limit_tracking.update({
          where: { id: currentWindow.id },
          data: {
            request_count: { increment: 1 },
            updated_at: now
          }
        });
      } else {
        // Block the identifier for window duration
        await prisma.rate_limit_tracking.update({
          where: { id: currentWindow.id },
          data: {
            blocked: true,
            blocked_until: new Date(now.getTime() + config.windowMs),
            updated_at: now
          }
        });
      }

      return {
        allowed,
        remaining,
        resetTime: new Date(currentWindow.window_start.getTime() + config.windowMs)
      };
    } catch (error) {
      console.error('Error checking rate limit:', error);
      // On error, allow the request if skipOnError is true
      return {
        allowed: config.skipOnError !== false,
        remaining: config.limit,
        resetTime: new Date(Date.now() + config.windowMs)
      };
    }
  }

  /**
   * Record rate limit attempt (for analytics)
   */
  static async recordAttempt(
    identifier: string,
    allowed: boolean,
    ipAddress?: string,
    endpoint?: string
  ): Promise<void> {
    try {
      const now = new Date();
      const windowStart = new Date(now.getTime() - (now.getTime() % (60 * 60 * 1000))); // Hour boundary

      // This method is mainly for recording analytics data
      // The actual rate limiting is handled in checkLimit

      await prisma.rate_limit_tracking.create({
        data: {
          id: randomUUID(),
          identifier,
          identifier_type: identifier.includes('@') ? 'user' : 'ip',
          endpoint: endpoint || 'default',
          request_count: 1,
          window_start: windowStart,
          blocked: !allowed,
          blocked_until: allowed ? null : new Date(now.getTime() + 60 * 60 * 1000), // 1 hour block
          created_at: now,
          updated_at: now
        }
      });

      if (!allowed) {
        console.warn(`🚨 Rate limit block: ${identifier} on ${endpoint || 'default'}`);
      }
    } catch (error) {
      console.error('Error recording rate limit attempt:', error);
    }
  }

  /**
   * Get rate limit statistics
   */
  static async getStats(identifier?: string, hours = 24): Promise<RateLimitStats[]> {
    try {
      const timeFilter = new Date(Date.now() - hours * 60 * 60 * 1000);
      const where: any = { created_at: { gte: timeFilter } };
      if (identifier) where.identifier = identifier;

      const statsData = await prisma.rate_limit_tracking.findMany({
        where,
        select: {
          identifier: true,
          request_count: true,
          blocked: true,
          window_start: true,
          created_at: true
        },
        orderBy: { created_at: 'desc' },
        take: 100
      });

      // Group by identifier and window
      const grouped = new Map<string, RateLimitStats>();

      statsData.forEach(record => {
        const key = `${record.identifier}_${record.window_start.getTime()}`;
        if (!grouped.has(key)) {
          grouped.set(key, {
            identifier: record.identifier,
            requests: 0,
            blocks: 0,
            window_start: record.window_start,
            window_end: new Date(record.window_start.getTime() + 60 * 60 * 1000) // 1 hour window
          });
        }

        const stats = grouped.get(key)!;
        stats.requests += record.request_count;
        if (record.blocked) stats.blocks += 1;
      });

      return Array.from(grouped.values()).sort(
        (a, b) => b.window_start.getTime() - a.window_start.getTime()
      );
    } catch (error) {
      console.error('Error getting rate limit stats:', error);
      return [];
    }
  }

  /**
   * Get rate limiting summary
   */
  static async getSummary(hours = 24): Promise<RateLimitSummary> {
    try {
      const timeFilter = new Date(Date.now() - hours * 60 * 60 * 1000);

      const [totalRequests, totalBlocks, topBlockedData, hourlyStatsData] = await Promise.all([
        // Total requests
        prisma.rate_limit_tracking.aggregate({
          where: { created_at: { gte: timeFilter } },
          _sum: { request_count: true }
        }),

        // Total blocks
        prisma.rate_limit_tracking.count({
          where: {
            created_at: { gte: timeFilter },
            blocked: true
          }
        }),

        // Top blocked IPs/identifiers
        prisma.rate_limit_tracking.groupBy({
          by: ['identifier'],
          where: {
            created_at: { gte: timeFilter },
            blocked: true,
            identifier_type: 'ip'
          },
          _count: { identifier: true },
          orderBy: { _count: { identifier: 'desc' } },
          take: 10
        }),

        // Hourly stats
        prisma.$queryRaw`
          SELECT
            EXTRACT(HOUR FROM created_at) as hour,
            SUM(request_count) as requests,
            COUNT(CASE WHEN blocked = true THEN 1 END) as blocks
          FROM rate_limit_tracking
          WHERE created_at >= ${timeFilter}
          GROUP BY EXTRACT(HOUR FROM created_at)
          ORDER BY hour
        ` as unknown as { hour: number; requests: bigint; blocks: bigint }[]
      ]);

      const totalRequestsSum = totalRequests._sum.request_count || 0;
      const blockRate = totalRequestsSum > 0 ? (totalBlocks / totalRequestsSum) * 100 : 0;

      const topBlockedIps = topBlockedData.map(item => ({
        ip: item.identifier,
        blocks: item._count.identifier
      }));

      const hourlyStats = hourlyStatsData.map(item => ({
        hour: Number(item.hour),
        requests: Number(item.requests),
        blocks: Number(item.blocks)
      }));

      return {
        total_requests: totalRequestsSum,
        total_blocks: totalBlocks,
        block_rate: Math.round(blockRate * 10) / 10,
        top_blocked_ips: topBlockedIps,
        hourly_stats: hourlyStats
      };
    } catch (error) {
      console.error('Error getting rate limit summary:', error);
      return {
        total_requests: 0,
        total_blocks: 0,
        block_rate: 0,
        top_blocked_ips: [],
        hourly_stats: []
      };
    }
  }

  /**
   * Clear rate limit for identifier
   */
  static async clearLimit(identifier: string): Promise<void> {
    try {
      await prisma.rate_limit_tracking.updateMany({
        where: { identifier },
        data: {
          blocked: false,
          blocked_until: null,
          request_count: 0
        }
      });

      console.log(`[Rate Limiter] Cleared limits for ${identifier}`);
    } catch (error) {
      console.error('Error clearing rate limit:', error);
    }
  }

  /**
   * Get blocked IPs
   */
  static async getBlockedIPs(hours = 24): Promise<{
    ip: string;
    blocks: number;
    first_blocked: Date;
    last_blocked: Date;
  }[]> {
    try {
      const timeFilter = new Date(Date.now() - hours * 60 * 60 * 1000);

      const blockedIPs = await prisma.$queryRaw`
        SELECT
          identifier as ip,
          COUNT(*) as blocks,
          MIN(created_at) as first_blocked,
          MAX(created_at) as last_blocked
        FROM rate_limit_tracking
        WHERE created_at >= ${timeFilter}
          AND blocked = true
          AND identifier_type = 'ip'
        GROUP BY identifier
        ORDER BY blocks DESC
      ` as Array<{
        ip: string;
        blocks: bigint;
        first_blocked: Date;
        last_blocked: Date;
      }>;

      return blockedIPs.map(item => ({
        ip: item.ip,
        blocks: Number(item.blocks),
        first_blocked: item.first_blocked,
        last_blocked: item.last_blocked
      }));
    } catch (error) {
      console.error('Error getting blocked IPs:', error);
      return [];
    }
  }

  /**
   * Get rate limit analytics
   */
  static async getRateLimitAnalytics(hours = 24): Promise<{
    total_requests: number;
    blocked_requests: number;
    block_rate: number;
    top_endpoints: { endpoint: string; blocks: number }[];
    hourly_trends: { hour: number; requests: number; blocks: number }[];
  }> {
    try {
      const timeFilter = new Date(Date.now() - hours * 60 * 60 * 1000);

      const [totalRequests, blockedRequests, topEndpointsData, hourlyTrendsData] = await Promise.all([
        // Total requests
        prisma.rate_limit_tracking.aggregate({
          where: { created_at: { gte: timeFilter } },
          _sum: { request_count: true }
        }),

        // Blocked requests
        prisma.rate_limit_tracking.count({
          where: {
            created_at: { gte: timeFilter },
            blocked: true
          }
        }),

        // Top blocked endpoints
        prisma.rate_limit_tracking.groupBy({
          by: ['endpoint'],
          where: {
            created_at: { gte: timeFilter },
            blocked: true
          },
          _count: { endpoint: true },
          orderBy: { _count: { endpoint: 'desc' } },
          take: 10
        }),

        // Hourly trends
        prisma.$queryRaw`
          SELECT
            EXTRACT(HOUR FROM created_at) as hour,
            SUM(request_count) as requests,
            COUNT(CASE WHEN blocked = true THEN 1 END) as blocks
          FROM rate_limit_tracking
          WHERE created_at >= ${timeFilter}
          GROUP BY EXTRACT(HOUR FROM created_at)
          ORDER BY hour
        ` as unknown as { hour: number; requests: bigint; blocks: bigint }[]
      ]);

      const totalRequestsSum = totalRequests._sum.request_count || 0;
      const blockRate = totalRequestsSum > 0 ? (blockedRequests / totalRequestsSum) * 100 : 0;

      return {
        total_requests: totalRequestsSum,
        blocked_requests: blockedRequests,
        block_rate: Math.round(blockRate * 10) / 10,
        top_endpoints: topEndpointsData.map(item => ({
          endpoint: item.endpoint,
          blocks: item._count.endpoint
        })),
        hourly_trends: hourlyTrendsData.map(item => ({
          hour: Number(item.hour),
          requests: Number(item.requests),
          blocks: Number(item.blocks)
        }))
      };
    } catch (error) {
      console.error('Error getting rate limit analytics:', error);
      return {
        total_requests: 0,
        blocked_requests: 0,
        block_rate: 0,
        top_endpoints: [],
        hourly_trends: []
      };
    }
  }

  /**
   * Get blocked identifiers
   */
  static async getBlockedIdentifiers(): Promise<{
    identifier: string;
    blocks: number;
    last_blocked: Date;
    reason: string;
  }[]> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const blockedIdentifiers = await prisma.$queryRaw`
        SELECT
          identifier,
          COUNT(*) as blocks,
          MAX(created_at) as last_blocked,
          CASE
            WHEN identifier_type = 'ip' THEN 'Excessive API requests'
            WHEN identifier_type = 'user' THEN 'Failed authentication attempts'
            ELSE 'Rate limit exceeded'
          END as reason
        FROM rate_limit_tracking
        WHERE blocked = true
          AND (blocked_until IS NULL OR blocked_until > ${new Date()})
        GROUP BY identifier, identifier_type
        ORDER BY blocks DESC, last_blocked DESC
        LIMIT 20
      ` as Array<{
        identifier: string;
        blocks: bigint;
        last_blocked: Date;
        reason: string;
      }>;

      return blockedIdentifiers.map(item => ({
        identifier: item.identifier,
        blocks: Number(item.blocks),
        last_blocked: item.last_blocked,
        reason: item.reason
      }));
    } catch (error) {
      console.error('Error getting blocked identifiers:', error);
      return [];
    }
  }

  /**
   * Cleanup old rate limit records
   */
  static async cleanup(daysToKeep = 7): Promise<{ deletedCount: number }> {
    try {
      const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

      const result = await prisma.rate_limit_tracking.deleteMany({
        where: { created_at: { lt: cutoffDate } }
      });

      console.log(`[Rate Limiter] Cleaned up ${result.count} rate limit records older than ${daysToKeep} days`);
      return { deletedCount: result.count };
    } catch (error) {
      console.error('Error cleaning up rate limit records:', error);
      return { deletedCount: 0 };
    }
  }
}