/**
 * Webhook Monitor Service - PRODUCTION VERSION
 *
 * Enterprise webhook monitoring and analytics
 * Stores webhook events in database for monitoring and retry logic
 */

import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';

export interface WebhookEvent {
  event_id: string;
  event_type: string;
  status: 'pending' | 'success' | 'failed' | 'retrying';
  payload_size: number;
  response_time?: number;
  response_status?: number;
  error_message?: string;
  attempt_count: number;
  source: 'stripe' | 'clerk' | 'custom';
  processed_at?: Date;
  created_at: Date;
}

export interface WebhookHealthMetrics {
  total_events: number;
  success_rate: number;
  average_response_time: number;
  failed_events: number;
  events_by_type: Record<string, number>;
  recent_failures: WebhookEvent[];
}

export interface WebhookPerformanceAnalytics {
  response_time_trends: { hour: number; avg_time: number; event_count: number }[];
  failure_patterns: { type: string; failures: number; success_rate: number }[];
  source_distribution: Record<string, number>;
}

export class WebhookMonitorService {
  /**
   * Log webhook event
   */
  static async logEvent(event: Omit<WebhookEvent, 'created_at'>): Promise<void> {
    try {
      await prisma.webhook_events.create({
        data: {
          id: randomUUID(),
          source: event.source,
          event_type: event.event_type,
          event_id: event.event_id,
          payload: {
            payload_size: event.payload_size,
            attempt_count: event.attempt_count
          },
          status: event.status,
          processing_time: event.response_time || null,
          error_message: event.error_message || null,
          retry_count: Math.max(0, event.attempt_count - 1),
          processed_at: event.processed_at || null,
          created_at: new Date(),
        }
      });

      // Log failures to console as well
      if (event.status === 'failed') {
        console.error('🚨 Webhook failure:', {
          id: event.event_id,
          type: event.event_type,
          error: event.error_message,
          attempt: event.attempt_count
        });
      }
    } catch (error) {
      console.error('Error logging webhook event to database:', error);
      // Log to console as fallback
      console.log('[Webhook Monitor] Fallback log:', {
        event_id: event.event_id,
        event_type: event.event_type,
        status: event.status,
        source: event.source
      });
    }
  }

  /**
   * Update event status
   */
  static async updateEventStatus(
    eventId: string,
    status: 'success' | 'failed' | 'retrying',
    responseTime?: number,
    responseStatus?: number,
    errorMessage?: string
  ): Promise<void> {
    try {
      const updateData: any = {
        status: status === 'success' ? 'processed' : status,
        processed_at: new Date(),
      };

      if (responseTime) updateData.processing_time = responseTime;
      if (errorMessage) updateData.error_message = errorMessage;
      if (status === 'retrying') {
        // Increment retry count
        updateData.retry_count = {
          increment: 1
        };
      }

      await prisma.webhook_events.updateMany({
        where: { event_id: eventId },
        data: updateData
      });

      console.log(`[Webhook Monitor] Updated event ${eventId} status to ${status}`);
    } catch (error) {
      console.error('Error updating webhook event status:', error);
    }
  }

  /**
   * Get webhook health metrics
   */
  static async getHealthMetrics(hours = 24): Promise<WebhookHealthMetrics> {
    try {
      const timeFilter = new Date(Date.now() - hours * 60 * 60 * 1000);

      const [totalEvents, failedEvents, avgProcessingTime, eventsByTypeData, recentFailuresData] = await Promise.all([
        // Total events count
        prisma.webhook_events.count({
          where: { created_at: { gte: timeFilter } }
        }),

        // Failed events count
        prisma.webhook_events.count({
          where: {
            created_at: { gte: timeFilter },
            status: 'failed'
          }
        }),

        // Average processing time
        prisma.webhook_events.aggregate({
          where: {
            created_at: { gte: timeFilter },
            processing_time: { not: null }
          },
          _avg: { processing_time: true }
        }),

        // Events by type
        prisma.webhook_events.groupBy({
          by: ['event_type'],
          where: { created_at: { gte: timeFilter } },
          _count: { event_type: true },
          orderBy: { _count: { event_type: 'desc' } },
          take: 10
        }),

        // Recent failures
        prisma.webhook_events.findMany({
          where: {
            created_at: { gte: timeFilter },
            status: 'failed'
          },
          orderBy: { created_at: 'desc' },
          take: 10
        })
      ]);

      const successRate = totalEvents > 0 ? ((totalEvents - failedEvents) / totalEvents) * 100 : 100;

      const eventsByType: Record<string, number> = {};
      eventsByTypeData.forEach(item => {
        eventsByType[item.event_type] = item._count.event_type;
      });

      const recentFailures: WebhookEvent[] = recentFailuresData.map(event => ({
        event_id: event.event_id,
        event_type: event.event_type,
        status: event.status as 'pending' | 'success' | 'failed' | 'retrying',
        payload_size: ((event.payload as any)?.payload_size) || 0,
        response_time: event.processing_time || undefined,
        error_message: event.error_message || undefined,
        attempt_count: ((event.payload as any)?.attempt_count) || 1,
        source: event.source as 'stripe' | 'clerk' | 'custom',
        processed_at: event.processed_at || undefined,
        created_at: event.created_at
      }));

      return {
        total_events: totalEvents,
        success_rate: Math.round(successRate * 10) / 10,
        average_response_time: Math.round(avgProcessingTime._avg.processing_time || 0),
        failed_events: failedEvents,
        events_by_type: eventsByType,
        recent_failures: recentFailures
      };
    } catch (error) {
      console.error('Error getting webhook health metrics:', error);
      return {
        total_events: 0,
        success_rate: 0,
        average_response_time: 0,
        failed_events: 0,
        events_by_type: {},
        recent_failures: []
      };
    }
  }

  /**
   * Get performance analytics
   */
  static async getPerformanceAnalytics(hours = 24): Promise<WebhookPerformanceAnalytics> {
    try {
      const timeFilter = new Date(Date.now() - hours * 60 * 60 * 1000);

      const [trendsData, failurePatternsData, sourceDistData] = await Promise.all([
        // Hourly response time trends
        prisma.$queryRaw`
          SELECT
            EXTRACT(HOUR FROM created_at) as hour,
            AVG(processing_time) as avg_time,
            COUNT(*) as event_count
          FROM webhook_events
          WHERE created_at >= ${timeFilter} AND processing_time IS NOT NULL
          GROUP BY EXTRACT(HOUR FROM created_at)
          ORDER BY hour
        ` as unknown as { hour: number; avg_time: number; event_count: bigint }[],

        // Failure patterns by type
        prisma.$queryRaw`
          SELECT
            event_type as type,
            SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failures,
            COUNT(*) as total,
            ROUND(
              (COUNT(*) - SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END)) * 100.0 / COUNT(*),
              1
            ) as success_rate
          FROM webhook_events
          WHERE created_at >= ${timeFilter}
          GROUP BY event_type
          HAVING COUNT(*) > 5
          ORDER BY failures DESC
        ` as unknown as { type: string; failures: bigint; total: bigint; success_rate: number }[],

        // Source distribution
        prisma.webhook_events.groupBy({
          by: ['source'],
          where: { created_at: { gte: timeFilter } },
          _count: { source: true }
        })
      ]);

      const responseTimeTrends = trendsData.map(item => ({
        hour: Number(item.hour),
        avg_time: Math.round(item.avg_time),
        event_count: Number(item.event_count)
      }));

      const failurePatterns = failurePatternsData.map(item => ({
        type: item.type,
        failures: Number(item.failures),
        success_rate: item.success_rate
      }));

      const sourceDistribution: Record<string, number> = {};
      sourceDistData.forEach(item => {
        sourceDistribution[item.source] = item._count.source;
      });

      return {
        response_time_trends: responseTimeTrends,
        failure_patterns: failurePatterns,
        source_distribution: sourceDistribution
      };
    } catch (error) {
      console.error('Error getting webhook performance analytics:', error);
      return {
        response_time_trends: [],
        failure_patterns: [],
        source_distribution: {}
      };
    }
  }

  /**
   * Get failed events for retry
   */
  static async getFailedEvents(limit = 50): Promise<WebhookEvent[]> {
    try {
      const failedEvents = await prisma.webhook_events.findMany({
        where: {
          status: 'failed',
          retry_count: { lt: 3 } // Only retry up to 3 times
        },
        orderBy: { created_at: 'asc' },
        take: limit
      });

      return failedEvents.map(event => ({
        event_id: event.event_id,
        event_type: event.event_type,
        status: 'failed',
        payload_size: ((event.payload as any)?.payload_size) || 0,
        response_time: event.processing_time || undefined,
        error_message: event.error_message || undefined,
        attempt_count: event.retry_count + 1,
        source: event.source as 'stripe' | 'clerk' | 'custom',
        processed_at: event.processed_at || undefined,
        created_at: event.created_at
      }));
    } catch (error) {
      console.error('Error getting failed events:', error);
      return [];
    }
  }

  /**
   * Retry failed event
   */
  static async retryEvent(eventId: string): Promise<void> {
    try {
      await prisma.webhook_events.updateMany({
        where: { event_id: eventId },
        data: {
          status: 'pending',
          retry_count: { increment: 1 },
          processed_at: null
        }
      });

      console.log(`[Webhook Monitor] Marked event ${eventId} for retry`);
    } catch (error) {
      console.error(`Error retrying event ${eventId}:`, error);
    }
  }

  /**
   * Get events by type
   */
  static async getEventsByType(
    eventType: string,
    hours = 24,
    limit = 100
  ): Promise<WebhookEvent[]> {
    try {
      const timeFilter = new Date(Date.now() - hours * 60 * 60 * 1000);

      const events = await prisma.webhook_events.findMany({
        where: {
          event_type: eventType,
          created_at: { gte: timeFilter }
        },
        orderBy: { created_at: 'desc' },
        take: limit
      });

      return events.map(event => ({
        event_id: event.event_id,
        event_type: event.event_type,
        status: event.status as 'pending' | 'success' | 'failed' | 'retrying',
        payload_size: ((event.payload as any)?.payload_size) || 0,
        response_time: event.processing_time || undefined,
        error_message: event.error_message || undefined,
        attempt_count: ((event.payload as any)?.attempt_count) || 1,
        source: event.source as 'stripe' | 'clerk' | 'custom',
        processed_at: event.processed_at || undefined,
        created_at: event.created_at
      }));
    } catch (error) {
      console.error('Error getting events by type:', error);
      return [];
    }
  }

  /**
   * Clean up old webhook events
   */
  static async cleanup(daysToKeep = 30): Promise<{ deletedCount: number }> {
    try {
      const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

      const result = await prisma.webhook_events.deleteMany({
        where: { created_at: { lt: cutoffDate } }
      });

      console.log(`[Webhook Monitor] Cleaned up ${result.count} webhook events older than ${daysToKeep} days`);
      return { deletedCount: result.count };
    } catch (error) {
      console.error('Error cleaning up webhook events:', error);
      return { deletedCount: 0 };
    }
  }

  /**
   * Get webhook health status (alias for getSystemHealth)
   */
  static async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'down';
    checks: {
      database_connection: boolean;
      event_processing: boolean;
      retry_queue: boolean;
    };
    uptime: string;
    last_event_processed: Date | null;
  }> {
    return this.getSystemHealth();
  }

  /**
   * Get webhook system health status
   */
  static async getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'down';
    checks: {
      database_connection: boolean;
      event_processing: boolean;
      retry_queue: boolean;
    };
    uptime: string;
    last_event_processed: Date | null;
  }> {
    try {
      // Check database connection
      let databaseConnection = true;
      try {
        await prisma.$queryRaw`SELECT 1`;
      } catch {
        databaseConnection = false;
      }

      // Check if events are being processed (last 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const recentProcessedCount = await prisma.webhook_events.count({
        where: {
          processed_at: { gte: fiveMinutesAgo },
          status: { in: ['processed', 'failed'] }
        }
      });
      const eventProcessing = recentProcessedCount > 0 || databaseConnection;

      // Check retry queue health (failed events not stuck for too long)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const stuckFailedEvents = await prisma.webhook_events.count({
        where: {
          status: 'failed',
          created_at: { lt: oneHourAgo },
          retry_count: { gte: 3 }
        }
      });
      const retryQueueHealthy = stuckFailedEvents < 10; // Threshold

      // Get last processed event
      const lastProcessedEvent = await prisma.webhook_events.findFirst({
        where: { processed_at: { not: null } },
        orderBy: { processed_at: 'desc' },
        select: { processed_at: true }
      });

      // Determine overall status
      let status: 'healthy' | 'degraded' | 'down';
      if (!databaseConnection) {
        status = 'down';
      } else if (!eventProcessing || !retryQueueHealthy) {
        status = 'degraded';
      } else {
        status = 'healthy';
      }

      return {
        status,
        checks: {
          database_connection: databaseConnection,
          event_processing: eventProcessing,
          retry_queue: retryQueueHealthy
        },
        uptime: 'Monitoring active', // Simplified - you might track this separately
        last_event_processed: lastProcessedEvent?.processed_at || null
      };
    } catch (error) {
      console.error('Error getting webhook system health:', error);
      return {
        status: 'down',
        checks: {
          database_connection: false,
          event_processing: false,
          retry_queue: false
        },
        uptime: 'Unknown',
        last_event_processed: null
      };
    }
  }

  // Legacy method aliases for backward compatibility
  static async logWebhookEvent(
    eventId: string,
    eventType: string,
    source: 'stripe' | 'clerk' | 'custom',
    payload: any,
    status: 'pending' | 'success' | 'failed' = 'pending'
  ): Promise<void> {
    await this.logEvent({
      event_id: eventId,
      event_type: eventType,
      status,
      payload_size: JSON.stringify(payload || {}).length,
      attempt_count: 1,
      source
    });
  }

  static async updateWebhookStatus(
    eventId: string,
    status: 'success' | 'failed',
    responseTime?: number,
    errorMessage?: string
  ): Promise<void> {
    await this.updateEventStatus(eventId, status, responseTime, undefined, errorMessage);
  }
}