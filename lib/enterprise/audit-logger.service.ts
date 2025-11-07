/**
 * Audit Logger Service - PRODUCTION VERSION
 *
 * Comprehensive audit logging for security and compliance
 * Stores all security events in database for SOC 2 compliance
 */

import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';

export interface AuditLogEntry {
  action: string;
  resource_type: string;
  resource_id?: string;
  clerk_user_id?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
  risk_score?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  tags?: string[];
}

export interface AuditQueryOptions {
  user_id?: string;
  action?: string;
  resource_type?: string;
  severity?: string;
  start_date?: Date;
  end_date?: Date;
  limit?: number;
  offset?: number;
}

export interface AuditSummary {
  total_logs: number;
  high_risk_count: number;
  critical_alerts: number;
  top_actions: { action: string; count: number }[];
  risk_distribution: Record<string, number>;
  recent_alerts: AuditLogEntry[];
}

export class AuditLoggerService {
  /**
   * Log an audit event
   */
  static async log(entry: AuditLogEntry): Promise<void> {
    try {
      // Calculate risk score based on severity if not provided
      let riskScore = entry.risk_score || 0;
      if (!riskScore) {
        switch (entry.severity) {
          case 'critical': riskScore = 90; break;
          case 'high': riskScore = 70; break;
          case 'medium': riskScore = 40; break;
          case 'low': riskScore = 10; break;
        }
      }

      await prisma.audit_logs.create({
        data: {
          id: randomUUID(),
          action: entry.action,
          resource: entry.resource_type,
          resource_id: entry.resource_id || null,
          clerk_user_id: entry.clerk_user_id || 'system',
          details: entry.metadata || {},
          risk_score: riskScore,
          ip_address: entry.ip_address || null,
          user_agent: entry.user_agent || null,
          created_at: new Date(),
        }
      });

      // Log high-risk events to console as well
      if (entry.severity === 'high' || entry.severity === 'critical') {
        console.warn('🚨 High-risk audit event:', {
          action: entry.action,
          resource_type: entry.resource_type,
          risk_score: riskScore,
          user: entry.clerk_user_id
        });
      }
    } catch (error) {
      console.error('Error logging audit event to database:', error);
      // Log to console as fallback
      console.log('[Audit Logger] Fallback log:', {
        action: entry.action,
        resource_type: entry.resource_type,
        severity: entry.severity,
        risk_score: entry.risk_score
      });
    }
  }

  /**
   * Log account access
   */
  static async logAccountAccess(
    userId: string,
    action: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      action: `account.${action}`,
      resource_type: 'user_account',
      resource_id: userId,
      clerk_user_id: userId,
      ip_address: ipAddress,
      user_agent: userAgent,
      severity: 'low'
    });
  }

  /**
   * Log payment activity
   */
  static async logPaymentActivity(
    action: string,
    paymentId: string,
    userId: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      action: `payment.${action}`,
      resource_type: 'stripe_payment',
      resource_id: paymentId,
      clerk_user_id: userId,
      metadata,
      severity: 'medium',
      risk_score: 50
    });
  }

  /**
   * Log admin actions
   */
  static async logAdminAction(
    action: string,
    adminUserId: string,
    targetResource: string,
    resourceId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      action: `admin.${action}`,
      resource_type: targetResource,
      resource_id: resourceId,
      clerk_user_id: adminUserId,
      metadata,
      severity: 'high',
      risk_score: 80
    });
  }

  /**
   * Query audit logs
   */
  static async query(options: AuditQueryOptions): Promise<AuditLogEntry[]> {
    try {
      const where: any = {};

      if (options.user_id) where.clerk_user_id = options.user_id;
      if (options.action) where.action = { contains: options.action };
      if (options.resource_type) where.resource = options.resource_type;
      if (options.start_date || options.end_date) {
        where.created_at = {};
        if (options.start_date) where.created_at.gte = options.start_date;
        if (options.end_date) where.created_at.lte = options.end_date;
      }

      const logs = await prisma.audit_logs.findMany({
        where,
        orderBy: { created_at: 'desc' },
        take: options.limit || 50,
        skip: options.offset || 0,
      });

      return logs.map(log => ({
        action: log.action,
        resource_type: log.resource,
        resource_id: log.resource_id || undefined,
        clerk_user_id: log.clerk_user_id,
        ip_address: log.ip_address || undefined,
        user_agent: log.user_agent || undefined,
        metadata: typeof log.details === 'object' ? log.details as Record<string, any> : {},
        risk_score: log.risk_score || 0,
        severity: this.getSeverityFromRiskScore(log.risk_score || 0)
      }));
    } catch (error) {
      console.error('Error querying audit logs:', error);
      return [];
    }
  }

  /**
   * Helper method to determine severity from risk score
   */
  private static getSeverityFromRiskScore(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 30) return 'medium';
    return 'low';
  }

  /**
   * Get audit summary
   */
  static async getSummary(hours = 24): Promise<AuditSummary> {
    try {
      const timeFilter = new Date(Date.now() - hours * 60 * 60 * 1000);

      const [totalLogs, highRiskCount, criticalCount, topActionsData, riskDistData, recentAlertsData] = await Promise.all([
        // Total logs count
        prisma.audit_logs.count({
          where: { created_at: { gte: timeFilter } }
        }),

        // High risk count (60+)
        prisma.audit_logs.count({
          where: {
            created_at: { gte: timeFilter },
            risk_score: { gte: 60 }
          }
        }),

        // Critical count (80+)
        prisma.audit_logs.count({
          where: {
            created_at: { gte: timeFilter },
            risk_score: { gte: 80 }
          }
        }),

        // Top actions
        prisma.audit_logs.groupBy({
          by: ['action'],
          where: { created_at: { gte: timeFilter } },
          _count: { action: true },
          orderBy: { _count: { action: 'desc' } },
          take: 5
        }),

        // Risk distribution
        prisma.$queryRaw`
          SELECT
            CASE
              WHEN risk_score >= 80 THEN 'critical'
              WHEN risk_score >= 60 THEN 'high'
              WHEN risk_score >= 30 THEN 'medium'
              ELSE 'low'
            END as severity,
            COUNT(*) as count
          FROM audit_logs
          WHERE created_at >= ${timeFilter}
          GROUP BY
            CASE
              WHEN risk_score >= 80 THEN 'critical'
              WHEN risk_score >= 60 THEN 'high'
              WHEN risk_score >= 30 THEN 'medium'
              ELSE 'low'
            END
        ` as unknown as { severity: string; count: bigint }[],

        // Recent high-risk alerts
        prisma.audit_logs.findMany({
          where: {
            created_at: { gte: timeFilter },
            risk_score: { gte: 60 }
          },
          orderBy: { created_at: 'desc' },
          take: 10
        })
      ]);

      const topActions = topActionsData.map(item => ({
        action: item.action,
        count: item._count.action
      }));

      const riskDistribution: Record<string, number> = {};
      riskDistData.forEach(item => {
        riskDistribution[item.severity] = Number(item.count);
      });

      const recentAlerts = recentAlertsData.map(log => ({
        action: log.action,
        resource_type: log.resource,
        resource_id: log.resource_id || undefined,
        clerk_user_id: log.clerk_user_id,
        ip_address: log.ip_address || undefined,
        user_agent: log.user_agent || undefined,
        metadata: typeof log.details === 'object' ? log.details as Record<string, any> : {},
        risk_score: log.risk_score || 0,
        severity: this.getSeverityFromRiskScore(log.risk_score || 0)
      }));

      return {
        total_logs: totalLogs,
        high_risk_count: highRiskCount,
        critical_alerts: criticalCount,
        top_actions: topActions,
        risk_distribution: riskDistribution,
        recent_alerts: recentAlerts
      };
    } catch (error) {
      console.error('Error getting audit summary:', error);
      return {
        total_logs: 0,
        high_risk_count: 0,
        critical_alerts: 0,
        top_actions: [],
        risk_distribution: {},
        recent_alerts: []
      };
    }
  }

  /**
   * Get compliance report
   */
  static async getComplianceReport(days = 30): Promise<{
    period: string;
    total_events: number;
    data_access_events: number;
    admin_actions: number;
    failed_attempts: number;
  }> {
    try {
      const timeFilter = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const [totalEvents, dataAccessEvents, adminActions, failedAttempts] = await Promise.all([
        // Total events
        prisma.audit_logs.count({
          where: { created_at: { gte: timeFilter } }
        }),

        // Data access events (view, read, export actions)
        prisma.audit_logs.count({
          where: {
            created_at: { gte: timeFilter },
            action: {
              contains: 'access'
            }
          }
        }),

        // Admin actions
        prisma.audit_logs.count({
          where: {
            created_at: { gte: timeFilter },
            action: {
              startsWith: 'admin.'
            }
          }
        }),

        // Failed attempts (high risk authentication events)
        prisma.audit_logs.count({
          where: {
            created_at: { gte: timeFilter },
            action: {
              in: ['auth.failed_login', 'auth.blocked', 'auth.suspicious']
            }
          }
        })
      ]);

      return {
        period: `${days} days`,
        total_events: totalEvents,
        data_access_events: dataAccessEvents,
        admin_actions: adminActions,
        failed_attempts: failedAttempts
      };
    } catch (error) {
      console.error('Error getting compliance report:', error);
      return {
        period: `${days} days`,
        total_events: 0,
        data_access_events: 0,
        admin_actions: 0,
        failed_attempts: 0
      };
    }
  }

  /**
   * Get audit analytics
   */
  static async getAuditAnalytics(hours = 24): Promise<{
    total_events: number;
    high_risk_events: number;
    risk_score_average: number;
    top_actions: { action: string; count: number }[];
    user_activity: { user_id: string; events: number }[];
  }> {
    try {
      const timeFilter = new Date(Date.now() - hours * 60 * 60 * 1000);

      const [totalEvents, highRiskEvents, avgRiskScore, topActionsData, userActivityData] = await Promise.all([
        // Total events
        prisma.audit_logs.count({
          where: { created_at: { gte: timeFilter } }
        }),

        // High risk events
        prisma.audit_logs.count({
          where: {
            created_at: { gte: timeFilter },
            risk_score: { gte: 60 }
          }
        }),

        // Average risk score
        prisma.audit_logs.aggregate({
          where: { created_at: { gte: timeFilter } },
          _avg: { risk_score: true }
        }),

        // Top actions
        prisma.audit_logs.groupBy({
          by: ['action'],
          where: { created_at: { gte: timeFilter } },
          _count: { action: true },
          orderBy: { _count: { action: 'desc' } },
          take: 5
        }),

        // User activity
        prisma.audit_logs.groupBy({
          by: ['clerk_user_id'],
          where: { created_at: { gte: timeFilter } },
          _count: { clerk_user_id: true },
          orderBy: { _count: { clerk_user_id: 'desc' } },
          take: 10
        })
      ]);

      return {
        total_events: totalEvents,
        high_risk_events: highRiskEvents,
        risk_score_average: Math.round((avgRiskScore._avg.risk_score || 0) * 10) / 10,
        top_actions: topActionsData.map(item => ({
          action: item.action,
          count: item._count.action
        })),
        user_activity: userActivityData.map(item => ({
          user_id: item.clerk_user_id,
          events: item._count.clerk_user_id
        }))
      };
    } catch (error) {
      console.error('Error getting audit analytics:', error);
      return {
        total_events: 0,
        high_risk_events: 0,
        risk_score_average: 0,
        top_actions: [],
        user_activity: []
      };
    }
  }

  /**
   * Get flagged events (high risk score events)
   */
  static async getFlaggedEvents(limit = 10): Promise<AuditLogEntry[]> {
    try {
      const flaggedLogs = await prisma.audit_logs.findMany({
        where: { risk_score: { gte: 70 } },
        orderBy: [
          { risk_score: 'desc' },
          { created_at: 'desc' }
        ],
        take: limit
      });

      return flaggedLogs.map(log => ({
        action: log.action,
        resource_type: log.resource,
        resource_id: log.resource_id || undefined,
        clerk_user_id: log.clerk_user_id,
        ip_address: log.ip_address || undefined,
        user_agent: log.user_agent || undefined,
        metadata: typeof log.details === 'object' ? log.details as Record<string, any> : {},
        risk_score: log.risk_score || 0,
        severity: this.getSeverityFromRiskScore(log.risk_score || 0)
      }));
    } catch (error) {
      console.error('Error getting flagged events:', error);
      return [];
    }
  }

  /**
   * Cleanup old logs (be careful - this permanently deletes audit data!)
   */
  static async cleanup(daysToKeep = 365): Promise<{ deletedCount: number }> {
    try {
      // For compliance, we typically keep audit logs for 1+ years
      const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

      const result = await prisma.audit_logs.deleteMany({
        where: { created_at: { lt: cutoffDate } }
      });

      console.log(`[Audit Logger] Cleaned up ${result.count} audit logs older than ${daysToKeep} days`);

      // Log this cleanup action itself
      await this.log({
        action: 'audit.cleanup',
        resource_type: 'audit_logs',
        clerk_user_id: 'system',
        metadata: {
          days_kept: daysToKeep,
          deleted_count: result.count,
          cutoff_date: cutoffDate.toISOString()
        },
        severity: 'medium',
        risk_score: 50
      });

      return { deletedCount: result.count };
    } catch (error) {
      console.error('Error cleaning up audit logs:', error);
      return { deletedCount: 0 };
    }
  }

  // Legacy method aliases for backward compatibility
  static async logSecurityEvent(
    action: string,
    metadata: Record<string, any>,
    request?: any
  ): Promise<void> {
    await this.log({
      action: `security.${action}`,
      resource_type: 'security_event',
      clerk_user_id: request?.headers?.get('x-clerk-user-id') || 'anonymous',
      ip_address: request?.ip || request?.headers?.get('x-forwarded-for'),
      user_agent: request?.headers?.get('user-agent'),
      metadata,
      severity: 'high',
      risk_score: 80
    });
  }

  static async logAuditEvent(
    action: string,
    resourceType: string,
    metadata: Record<string, any>,
    userId?: string,
    request?: any
  ): Promise<void> {
    await this.log({
      action: `audit.${action}`,
      resource_type: resourceType,
      clerk_user_id: userId || 'system',
      ip_address: request?.ip || request?.headers?.get('x-forwarded-for'),
      user_agent: request?.headers?.get('user-agent'),
      metadata,
      severity: 'medium',
      risk_score: 40
    });
  }

  static async logPaymentEvent(
    action: string,
    paymentId: string,
    metadata: Record<string, any>,
    userId?: string
  ): Promise<void> {
    await this.logPaymentActivity(action, paymentId, userId || 'anonymous', metadata);
  }
}