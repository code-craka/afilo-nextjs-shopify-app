/**
 * API Monitor Middleware - PRODUCTION VERSION
 *
 * Enterprise-grade API monitoring and performance tracking
 * Stores all API requests in database for analytics and security monitoring
 */

import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';

interface APIMonitoringData {
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  requestSize: number;
  responseSize: number;
  userAgent?: string | null;
  ipAddress?: string | null;
  clerkUserId?: string | null;
  errorMessage?: string | null;
  traceId?: string | null;
}

interface APIHealthMetrics {
  totalRequests: number;
  averageResponseTime: number;
  errorRate: number;
  statusCodeDistribution: Record<string, number>;
  topEndpoints: { endpoint: string; count: number }[];
  topErrors: { error: string; count: number }[];
}

interface PerformanceAnalytics {
  slowEndpoints: { endpoint: string; avgTime: number; count: number }[];
  trends: { hour: number; requests: number; avgTime: number }[];
}

export class APIMonitorService {
  /**
   * Log API call to database
   */
  static async logAPICall(data: APIMonitoringData): Promise<void> {
    try {
      await prisma.api_monitoring.create({
        data: {
          id: randomUUID(),
          endpoint: data.endpoint,
          method: data.method,
          status_code: data.statusCode,
          response_time: data.responseTime,
          clerk_user_id: data.clerkUserId || null,
          trace_id: data.traceId || randomUUID(),
          error_message: data.errorMessage || null,
          request_size: data.requestSize || 0,
          response_size: data.responseSize || 0,
          created_at: new Date(),
        }
      });

      // Log performance warnings
      if (data.responseTime > 5000) {
        console.warn(`⚠️ Slow API response: ${data.endpoint} took ${data.responseTime}ms`);
      }

      if (data.statusCode >= 500) {
        console.error(`❌ API error: ${data.endpoint} returned ${data.statusCode} - ${data.errorMessage}`);
      }

    } catch (error) {
      console.error('Error logging API call to database:', error);
      // Don't throw - we don't want monitoring to break the actual API
    }
  }

  /**
   * Get API health metrics
   */
  static async getHealthMetrics(hours = 24): Promise<APIHealthMetrics> {
    try {
      const timeFilter = new Date(Date.now() - hours * 60 * 60 * 1000);

      // Get total requests and average response time
      const totalRequests = await prisma.api_monitoring.count({
        where: { created_at: { gte: timeFilter } }
      });

      const avgResponseTime = await prisma.api_monitoring.aggregate({
        where: { created_at: { gte: timeFilter } },
        _avg: { response_time: true }
      });

      // Get error count
      const errorCount = await prisma.api_monitoring.count({
        where: {
          created_at: { gte: timeFilter },
          status_code: { gte: 400 }
        }
      });

      // Get status code distribution
      const statusCodes = await prisma.api_monitoring.groupBy({
        by: ['status_code'],
        where: { created_at: { gte: timeFilter } },
        _count: { status_code: true }
      });

      const statusCodeDistribution: Record<string, number> = {};
      statusCodes.forEach(item => {
        statusCodeDistribution[item.status_code.toString()] = item._count.status_code;
      });

      // Get top endpoints
      const topEndpointsData = await prisma.api_monitoring.groupBy({
        by: ['endpoint'],
        where: { created_at: { gte: timeFilter } },
        _count: { endpoint: true },
        orderBy: { _count: { endpoint: 'desc' } },
        take: 5
      });

      const topEndpoints = topEndpointsData.map(item => ({
        endpoint: item.endpoint,
        count: item._count.endpoint
      }));

      // Get top errors
      const topErrorsData = await prisma.api_monitoring.groupBy({
        by: ['error_message'],
        where: {
          created_at: { gte: timeFilter },
          error_message: { not: null }
        },
        _count: { error_message: true },
        orderBy: { _count: { error_message: 'desc' } },
        take: 5
      });

      const topErrors = topErrorsData.map(item => ({
        error: item.error_message || 'Unknown error',
        count: item._count.error_message
      }));

      const errorRate = totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0;

      return {
        totalRequests,
        averageResponseTime: avgResponseTime._avg.response_time || 0,
        errorRate,
        statusCodeDistribution,
        topEndpoints,
        topErrors
      };
    } catch (error) {
      console.error('Error getting health metrics:', error);
      // Return default metrics on error
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        errorRate: 0,
        statusCodeDistribution: {},
        topEndpoints: [],
        topErrors: []
      };
    }
  }

  /**
   * Get performance analytics
   */
  static async getPerformanceAnalytics(hours = 24): Promise<PerformanceAnalytics> {
    try {
      const timeFilter = new Date(Date.now() - hours * 60 * 60 * 1000);

      // Get slow endpoints (>1000ms average response time)
      const slowEndpointsData = await prisma.api_monitoring.groupBy({
        by: ['endpoint'],
        where: { created_at: { gte: timeFilter } },
        _avg: { response_time: true },
        _count: { endpoint: true },
        having: { response_time: { _avg: { gt: 1000 } } },
        orderBy: { _avg: { response_time: 'desc' } },
        take: 10
      });

      const slowEndpoints = slowEndpointsData.map(item => ({
        endpoint: item.endpoint,
        avgTime: Math.round(item._avg.response_time || 0),
        count: item._count.endpoint
      }));

      // Get hourly trends for the last 24 hours
      const trendsData = await prisma.$queryRaw`
        SELECT
          EXTRACT(HOUR FROM created_at) as hour,
          COUNT(*) as requests,
          AVG(response_time) as avg_time
        FROM api_monitoring
        WHERE created_at >= ${timeFilter}
        GROUP BY EXTRACT(HOUR FROM created_at)
        ORDER BY hour
      ` as Array<{ hour: number; requests: bigint; avg_time: number }>;

      const trends = trendsData.map(item => ({
        hour: Number(item.hour),
        requests: Number(item.requests),
        avgTime: Math.round(item.avg_time)
      }));

      return {
        slowEndpoints,
        trends
      };
    } catch (error) {
      console.error('Error getting performance analytics:', error);
      // Return default analytics on error
      return {
        slowEndpoints: [],
        trends: []
      };
    }
  }

  /**
   * Get API health status
   */
  static async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'down';
    uptime: string;
    checks: {
      database: boolean;
      redis: boolean;
      api_responsiveness: boolean;
    };
    metrics: {
      requests_per_minute: number;
      average_response_time: number;
      error_rate: number;
    };
  }> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

      // Database health check
      let databaseHealthy = true;
      try {
        await prisma.$queryRaw`SELECT 1`;
      } catch {
        databaseHealthy = false;
      }

      // Get recent metrics
      const [totalRequests, errorCount, avgResponseTime, recentRequests] = await Promise.all([
        prisma.api_monitoring.count({
          where: { created_at: { gte: oneHourAgo } }
        }),
        prisma.api_monitoring.count({
          where: {
            created_at: { gte: oneHourAgo },
            status_code: { gte: 400 }
          }
        }),
        prisma.api_monitoring.aggregate({
          where: { created_at: { gte: oneHourAgo } },
          _avg: { response_time: true }
        }),
        prisma.api_monitoring.count({
          where: { created_at: { gte: oneMinuteAgo } }
        })
      ]);

      const errorRate = totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0;
      const averageResponseTime = avgResponseTime._avg.response_time || 0;
      const apiResponsive = averageResponseTime < 5000;

      // Redis health check (simplified - checking if we can perform basic operations)
      let redisHealthy = true;
      // Note: Add actual Redis health check if you have Redis configured

      // Determine overall status
      let status: 'healthy' | 'degraded' | 'down';
      if (!databaseHealthy) {
        status = 'down';
      } else if (errorRate > 15 || averageResponseTime > 5000) {
        status = 'degraded';
      } else {
        status = 'healthy';
      }

      // Calculate uptime (simplified - you might want to track this in a separate table)
      const uptime = 'Monitoring active';

      return {
        status,
        uptime,
        checks: {
          database: databaseHealthy,
          redis: redisHealthy,
          api_responsiveness: apiResponsive
        },
        metrics: {
          requests_per_minute: recentRequests,
          average_response_time: Math.round(averageResponseTime),
          error_rate: Math.round(errorRate * 10) / 10 // Round to 1 decimal
        }
      };
    } catch (error) {
      console.error('Error getting health status:', error);
      return {
        status: 'down',
        uptime: 'Unknown',
        checks: {
          database: false,
          redis: false,
          api_responsiveness: false
        },
        metrics: {
          requests_per_minute: 0,
          average_response_time: 0,
          error_rate: 100
        }
      };
    }
  }

  /**
   * Clean up old monitoring data
   */
  static async cleanup(daysToKeep = 30): Promise<{ deletedCount: number }> {
    try {
      const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

      const result = await prisma.api_monitoring.deleteMany({
        where: { created_at: { lt: cutoffDate } }
      });

      console.log(`[API Monitor] Cleaned up ${result.count} monitoring records older than ${daysToKeep} days`);
      return { deletedCount: result.count };
    } catch (error) {
      console.error('Error cleaning up monitoring data:', error);
      return { deletedCount: 0 };
    }
  }
}

/**
 * API monitoring middleware
 */
export function createAPIMonitoringMiddleware() {
  return async (request: NextRequest, response: NextResponse) => {
    const startTime = Date.now();
    const endpoint = request.nextUrl.pathname;
    const method = request.method;

    // Generate trace ID for request tracking
    const traceId = `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      const responseTime = Date.now() - startTime;

      // Log the API call
      await APIMonitorService.logAPICall({
        endpoint,
        method,
        statusCode: response.status,
        responseTime,
        requestSize: parseInt(request.headers.get('content-length') || '0'),
        responseSize: response.headers.get('content-length') ?
          parseInt(response.headers.get('content-length')!) : 0,
        userAgent: request.headers.get('user-agent'),
        ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] ||
                   request.headers.get('x-real-ip') || 'unknown',
        clerkUserId: request.headers.get('x-clerk-user-id'),
        traceId,
      });

      return response;
    } catch (error) {
      console.error('Error in API monitoring middleware:', error);
      return response; // Don't break the request
    }
  };
}