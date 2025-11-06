/**
 * Webhook Monitoring Service
 *
 * Phase 2 Feature: Enterprise Integrations
 *
 * Provides:
 * - Webhook event logging and tracking
 * - Performance monitoring
 * - Error tracking and retry logic
 * - Real-time analytics
 */

import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

export interface WebhookEvent {
  source: string;
  eventType: string;
  eventId?: string;
  payload: any;
  headers?: Record<string, string>;
}

export interface WebhookProcessingResult {
  success: boolean;
  processingTime: number;
  errorMessage?: string;
  retryCount?: number;
}

export class WebhookMonitorService {
  /**
   * Log incoming webhook event
   */
  static async logWebhookEvent(
    event: WebhookEvent,
    request?: NextRequest
  ): Promise<string> {
    try {
      const headers = request ? this.extractHeaders(request) : event.headers;

      const webhookLog = await prisma.webhook_events.create({
        data: {
          source: event.source,
          event_type: event.eventType,
          event_id: event.eventId,
          payload: event.payload,
          headers: headers || {},
          status: 'received',
        },
      });

      console.log(`📥 Webhook logged: ${event.source}.${event.eventType} (${webhookLog.id})`);
      return webhookLog.id;
    } catch (error) {
      console.error('Error logging webhook event:', error);
      throw error;
    }
  }

  /**
   * Update webhook processing status
   */
  static async updateWebhookStatus(
    webhookId: string,
    result: WebhookProcessingResult
  ): Promise<void> {
    try {
      await prisma.webhook_events.update({
        where: { id: webhookId },
        data: {
          status: result.success ? 'completed' : 'failed',
          processing_time: result.processingTime,
          error_message: result.errorMessage,
          retry_count: result.retryCount || 0,
          processed_at: new Date(),
          updated_at: new Date(),
        },
      });

      const statusIcon = result.success ? '✅' : '❌';
      console.log(`${statusIcon} Webhook ${webhookId} ${result.success ? 'completed' : 'failed'} in ${result.processingTime}ms`);
    } catch (error) {
      console.error('Error updating webhook status:', error);
    }
  }

  /**
   * Get webhook analytics
   */
  static async getWebhookAnalytics(
    source?: string,
    hours: number = 24
  ): Promise<{
    totalEvents: number;
    successRate: number;
    averageProcessingTime: number;
    errorRate: number;
    topEventTypes: Array<{ eventType: string; count: number }>;
    recentErrors: Array<{ eventType: string; errorMessage: string; createdAt: Date }>;
  }> {
    try {
      const since = new Date(Date.now() - hours * 60 * 60 * 1000);

      const whereClause = {
        created_at: { gte: since },
        ...(source && { source }),
      };

      // Total events
      const totalEvents = await prisma.webhook_events.count({
        where: whereClause,
      });

      // Success/failure counts
      const statusCounts = await prisma.webhook_events.groupBy({
        by: ['status'],
        where: whereClause,
        _count: true,
      });

      const completedCount = statusCounts.find(s => s.status === 'completed')?._count || 0;
      const failedCount = statusCounts.find(s => s.status === 'failed')?._count || 0;

      // Average processing time
      const avgProcessingTime = await prisma.webhook_events.aggregate({
        where: {
          ...whereClause,
          processing_time: { not: null },
        },
        _avg: { processing_time: true },
      });

      // Top event types
      const topEventTypes = await prisma.webhook_events.groupBy({
        by: ['event_type'],
        where: whereClause,
        _count: true,
        orderBy: { _count: { event_type: 'desc' } },
        take: 10,
      });

      // Recent errors
      const recentErrors = await prisma.webhook_events.findMany({
        where: {
          ...whereClause,
          status: 'failed',
        },
        select: {
          event_type: true,
          error_message: true,
          created_at: true,
        },
        orderBy: { created_at: 'desc' },
        take: 10,
      });

      return {
        totalEvents,
        successRate: totalEvents > 0 ? (completedCount / totalEvents) * 100 : 0,
        averageProcessingTime: avgProcessingTime._avg.processing_time || 0,
        errorRate: totalEvents > 0 ? (failedCount / totalEvents) * 100 : 0,
        topEventTypes: topEventTypes.map(t => ({
          eventType: t.event_type,
          count: t._count,
        })),
        recentErrors: recentErrors.map(e => ({
          eventType: e.event_type,
          errorMessage: e.error_message || 'Unknown error',
          createdAt: e.created_at,
        })),
      };
    } catch (error) {
      console.error('Error getting webhook analytics:', error);
      throw error;
    }
  }

  /**
   * Get failed webhooks for retry
   */
  static async getFailedWebhooks(
    maxRetryCount: number = 3,
    olderThanMinutes: number = 5
  ): Promise<Array<{
    id: string;
    source: string;
    eventType: string;
    payload: any;
    retryCount: number;
    errorMessage: string | null;
  }>> {
    try {
      const retryThreshold = new Date(Date.now() - olderThanMinutes * 60 * 1000);

      const failedWebhooks = await prisma.webhook_events.findMany({
        where: {
          status: 'failed',
          retry_count: { lt: maxRetryCount },
          created_at: { lte: retryThreshold },
        },
        select: {
          id: true,
          source: true,
          event_type: true,
          payload: true,
          retry_count: true,
          error_message: true,
        },
        orderBy: { created_at: 'asc' },
        take: 50, // Limit to prevent overwhelming
      });

      return failedWebhooks.map(w => ({
        id: w.id,
        source: w.source,
        eventType: w.event_type,
        payload: w.payload,
        retryCount: w.retry_count,
        errorMessage: w.error_message,
      }));
    } catch (error) {
      console.error('Error getting failed webhooks:', error);
      return [];
    }
  }

  /**
   * Mark webhook for retry
   */
  static async markForRetry(webhookId: string): Promise<void> {
    try {
      await prisma.webhook_events.update({
        where: { id: webhookId },
        data: {
          status: 'processing',
          retry_count: { increment: 1 },
          updated_at: new Date(),
        },
      });

      console.log(`🔄 Webhook ${webhookId} marked for retry`);
    } catch (error) {
      console.error('Error marking webhook for retry:', error);
    }
  }

  /**
   * Clean up old webhook logs
   */
  static async cleanupOldLogs(daysToKeep: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

      const result = await prisma.webhook_events.deleteMany({
        where: {
          created_at: { lte: cutoffDate },
          status: { in: ['completed', 'failed'] }, // Keep processing webhooks
        },
      });

      console.log(`🧹 Cleaned up ${result.count} old webhook logs`);
      return result.count;
    } catch (error) {
      console.error('Error cleaning up webhook logs:', error);
      return 0;
    }
  }

  /**
   * Get webhook event details
   */
  static async getWebhookDetails(webhookId: string) {
    try {
      return await prisma.webhook_events.findUnique({
        where: { id: webhookId },
      });
    } catch (error) {
      console.error('Error getting webhook details:', error);
      return null;
    }
  }

  /**
   * Search webhook events
   */
  static async searchWebhooks({
    source,
    eventType,
    status,
    since,
    until,
    limit = 50,
    offset = 0,
  }: {
    source?: string;
    eventType?: string;
    status?: string;
    since?: Date;
    until?: Date;
    limit?: number;
    offset?: number;
  }) {
    try {
      const where: any = {};

      if (source) where.source = source;
      if (eventType) where.event_type = { contains: eventType, mode: 'insensitive' };
      if (status) where.status = status;
      if (since || until) {
        where.created_at = {};
        if (since) where.created_at.gte = since;
        if (until) where.created_at.lte = until;
      }

      const [webhooks, total] = await Promise.all([
        prisma.webhook_events.findMany({
          where,
          orderBy: { created_at: 'desc' },
          take: limit,
          skip: offset,
          select: {
            id: true,
            source: true,
            event_type: true,
            event_id: true,
            status: true,
            processing_time: true,
            error_message: true,
            retry_count: true,
            created_at: true,
            processed_at: true,
          },
        }),
        prisma.webhook_events.count({ where }),
      ]);

      return {
        webhooks,
        total,
        hasMore: offset + webhooks.length < total,
      };
    } catch (error) {
      console.error('Error searching webhooks:', error);
      return { webhooks: [], total: 0, hasMore: false };
    }
  }

  /**
   * Extract relevant headers from request
   */
  private static extractHeaders(request: NextRequest): Record<string, string> {
    const relevantHeaders = [
      'user-agent',
      'stripe-signature',
      'x-github-delivery',
      'x-slack-signature',
      'content-type',
      'x-forwarded-for',
      'x-real-ip',
    ];

    const headers: Record<string, string> = {};

    relevantHeaders.forEach(header => {
      const value = request.headers.get(header);
      if (value) {
        headers[header] = value;
      }
    });

    return headers;
  }

  /**
   * Get webhook health status
   */
  static async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    lastHourEvents: number;
    successRate: number;
    averageProcessingTime: number;
    failedWebhooks: number;
  }> {
    try {
      const analytics = await this.getWebhookAnalytics(undefined, 1); // Last hour
      const failedWebhooks = await this.getFailedWebhooks();

      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

      if (analytics.errorRate > 10 || failedWebhooks.length > 10) {
        status = 'unhealthy';
      } else if (analytics.errorRate > 5 || analytics.averageProcessingTime > 5000) {
        status = 'degraded';
      }

      return {
        status,
        lastHourEvents: analytics.totalEvents,
        successRate: analytics.successRate,
        averageProcessingTime: analytics.averageProcessingTime,
        failedWebhooks: failedWebhooks.length,
      };
    } catch (error) {
      console.error('Error getting webhook health status:', error);
      return {
        status: 'unhealthy',
        lastHourEvents: 0,
        successRate: 0,
        averageProcessingTime: 0,
        failedWebhooks: 0,
      };
    }
  }
}