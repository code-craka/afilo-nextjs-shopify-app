/**
 * API Monitoring Middleware
 *
 * Phase 2 Feature: Enterprise Integrations
 *
 * Provides:
 * - API endpoint performance monitoring
 * - Request/response logging
 * - Error tracking
 * - Rate limiting enforcement
 * - Security audit logging
 */

import 'server-only';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { headers } from 'next/headers';

export interface APIMonitoringData {
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  requestSize?: number;
  responseSize?: number;
  userAgent?: string;
  ipAddress?: string;
  clerkUserId?: string;
  errorMessage?: string;
  traceId?: string;
}

export class APIMonitorService {
  /**
   * Create a monitoring wrapper for API routes
   */
  static monitor<T extends any[], R>(
    endpoint: string,
    handler: (...args: T) => Promise<NextResponse>
  ) {
    return async (...args: T): Promise<NextResponse> => {
      const startTime = Date.now();
      const traceId = this.generateTraceId();
      const request = args[0] as NextRequest;

      let response: NextResponse;
      let error: Error | null = null;

      try {
        // Add trace ID to request context
        (request as any).traceId = traceId;

        response = await handler(...args);
      } catch (err) {
        error = err instanceof Error ? err : new Error('Unknown error');
        response = NextResponse.json(
          { error: 'Internal server error', traceId },
          { status: 500 }
        );
      } finally {
        const responseTime = Date.now() - startTime;

        // Log the API call asynchronously
        setImmediate(async () => {
          this.logAPICall({
            endpoint,
            method: request.method,
            statusCode: response.status,
            responseTime,
            requestSize: this.getRequestSize(request),
            responseSize: this.getResponseSize(response),
            userAgent: request.headers.get('user-agent') || undefined,
            ipAddress: this.getClientIP(request),
            clerkUserId: await this.getClerkUserId(),
            errorMessage: error?.message,
            traceId,
          });
        });
      }

      return response;
    };
  }

  /**
   * Log API call to database
   */
  static async logAPICall(data: APIMonitoringData): Promise<void> {
    try {
      await prisma.api_monitoring.create({
        data: {
          endpoint: data.endpoint,
          method: data.method,
          status_code: data.statusCode,
          response_time: data.responseTime,
          request_size: data.requestSize,
          response_size: data.responseSize,
          user_agent: data.userAgent,
          ip_address: data.ipAddress,
          clerk_user_id: data.clerkUserId,
          error_message: data.errorMessage,
          trace_id: data.traceId,
        },
      });

      // Log performance warnings
      if (data.responseTime > 5000) {
        console.warn(`⚠️ Slow API response: ${data.endpoint} took ${data.responseTime}ms`);
      }

      if (data.statusCode >= 500) {
        console.error(`❌ API error: ${data.endpoint} returned ${data.statusCode} - ${data.errorMessage}`);
      }

    } catch (error) {
      console.error('Error logging API call:', error);
      // Don't throw - we don't want monitoring to break the actual API
    }
  }

  /**
   * Get API analytics
   */
  static async getAPIAnalytics(
    endpoint?: string,
    hours: number = 24
  ): Promise<{
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
    statusCodeDistribution: Array<{ code: number; count: number }>;
    topEndpoints: Array<{ endpoint: string; count: number; avgResponseTime: number }>;
    topErrors: Array<{ endpoint: string; error: string; count: number }>;
    requestsPerHour: Array<{ hour: string; count: number }>;
  }> {
    try {
      const since = new Date(Date.now() - hours * 60 * 60 * 1000);

      const whereClause = {
        created_at: { gte: since },
        ...(endpoint && { endpoint: { contains: endpoint, mode: 'insensitive' as const } }),
      };

      // Total requests
      const totalRequests = await prisma.api_monitoring.count({
        where: whereClause,
      });

      // Average response time
      const avgResponseTime = await prisma.api_monitoring.aggregate({
        where: whereClause,
        _avg: { response_time: true },
      });

      // Error rate
      const errorCount = await prisma.api_monitoring.count({
        where: {
          ...whereClause,
          status_code: { gte: 400 },
        },
      });

      // Status code distribution
      const statusCodes = await prisma.api_monitoring.groupBy({
        by: ['status_code'],
        where: whereClause,
        _count: true,
        orderBy: { status_code: 'asc' },
      });

      // Top endpoints
      const topEndpoints = await prisma.api_monitoring.groupBy({
        by: ['endpoint'],
        where: whereClause,
        _count: true,
        _avg: { response_time: true },
        orderBy: { _count: { endpoint: 'desc' } },
        take: 10,
      });

      // Top errors
      const topErrors = await prisma.api_monitoring.groupBy({
        by: ['endpoint', 'error_message'],
        where: {
          ...whereClause,
          error_message: { not: null },
        },
        _count: true,
        orderBy: { _count: { endpoint: 'desc' } },
        take: 10,
      });

      // Requests per hour
      const requestsPerHour = await prisma.$queryRaw<Array<{ hour: string; count: bigint }>>`
        SELECT
          DATE_TRUNC('hour', created_at) as hour,
          COUNT(*) as count
        FROM api_monitoring
        WHERE created_at >= ${since}
        ${endpoint ? prisma.$queryRaw`AND endpoint ILIKE ${'%' + endpoint + '%'}` : prisma.$queryRaw``}
        GROUP BY DATE_TRUNC('hour', created_at)
        ORDER BY hour ASC
      `;

      return {
        totalRequests,
        averageResponseTime: avgResponseTime._avg.response_time || 0,
        errorRate: totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0,
        statusCodeDistribution: statusCodes.map(s => ({
          code: s.status_code,
          count: s._count,
        })),
        topEndpoints: topEndpoints.map(e => ({
          endpoint: e.endpoint,
          count: e._count,
          avgResponseTime: e._avg.response_time || 0,
        })),
        topErrors: topErrors.map(e => ({
          endpoint: e.endpoint,
          error: e.error_message || 'Unknown error',
          count: e._count,
        })),
        requestsPerHour: requestsPerHour.map(r => ({
          hour: r.hour,
          count: Number(r.count),
        })),
      };
    } catch (error) {
      console.error('Error getting API analytics:', error);
      throw error;
    }
  }

  /**
   * Get slow API endpoints
   */
  static async getSlowEndpoints(
    thresholdMs: number = 2000,
    hours: number = 24
  ): Promise<Array<{
    endpoint: string;
    averageResponseTime: number;
    maxResponseTime: number;
    count: number;
  }>> {
    try {
      const since = new Date(Date.now() - hours * 60 * 60 * 1000);

      const slowEndpoints = await prisma.api_monitoring.groupBy({
        by: ['endpoint'],
        where: {
          created_at: { gte: since },
          response_time: { gte: thresholdMs },
        },
        _avg: { response_time: true },
        _max: { response_time: true },
        _count: true,
        orderBy: { _avg: { response_time: 'desc' } },
        take: 20,
      });

      return slowEndpoints.map(e => ({
        endpoint: e.endpoint,
        averageResponseTime: e._avg.response_time || 0,
        maxResponseTime: e._max.response_time || 0,
        count: e._count,
      }));
    } catch (error) {
      console.error('Error getting slow endpoints:', error);
      return [];
    }
  }

  /**
   * Clean up old monitoring data
   */
  static async cleanupOldData(daysToKeep: number = 7): Promise<number> {
    try {
      const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

      const result = await prisma.api_monitoring.deleteMany({
        where: {
          created_at: { lte: cutoffDate },
        },
      });

      console.log(`🧹 Cleaned up ${result.count} old API monitoring records`);
      return result.count;
    } catch (error) {
      console.error('Error cleaning up API monitoring data:', error);
      return 0;
    }
  }

  /**
   * Generate unique trace ID
   */
  private static generateTraceId(): string {
    return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get request size in bytes
   */
  private static getRequestSize(request: NextRequest): number | undefined {
    const contentLength = request.headers.get('content-length');
    return contentLength ? parseInt(contentLength, 10) : undefined;
  }

  /**
   * Get response size in bytes
   */
  private static getResponseSize(response: NextResponse): number | undefined {
    const contentLength = response.headers.get('content-length');
    return contentLength ? parseInt(contentLength, 10) : undefined;
  }

  /**
   * Get client IP address
   */
  private static getClientIP(request: NextRequest): string | undefined {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const remoteAddress = request.headers.get('x-vercel-forwarded-for');

    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }

    return realIP || remoteAddress || undefined;
  }

  /**
   * Get current Clerk user ID
   */
  private static async getClerkUserId(): Promise<string | undefined> {
    try {
      const { userId } = await auth();
      return userId || undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Get API health status
   */
  static async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    averageResponseTime: number;
    errorRate: number;
    requestVolume: number;
    slowEndpoints: number;
  }> {
    try {
      const analytics = await this.getAPIAnalytics(undefined, 1); // Last hour
      const slowEndpoints = await this.getSlowEndpoints(2000, 1); // Last hour

      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

      if (analytics.errorRate > 5 || analytics.averageResponseTime > 3000 || slowEndpoints.length > 5) {
        status = 'unhealthy';
      } else if (analytics.errorRate > 2 || analytics.averageResponseTime > 1500 || slowEndpoints.length > 2) {
        status = 'degraded';
      }

      return {
        status,
        averageResponseTime: analytics.averageResponseTime,
        errorRate: analytics.errorRate,
        requestVolume: analytics.totalRequests,
        slowEndpoints: slowEndpoints.length,
      };
    } catch (error) {
      console.error('Error getting API health status:', error);
      return {
        status: 'unhealthy',
        averageResponseTime: 0,
        errorRate: 0,
        requestVolume: 0,
        slowEndpoints: 0,
      };
    }
  }
}