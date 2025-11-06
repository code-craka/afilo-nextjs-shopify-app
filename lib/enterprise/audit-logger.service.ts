/**
 * Audit Logging Service
 *
 * Phase 2 Feature: Enterprise Integrations
 *
 * Provides:
 * - Security event logging
 * - Compliance audit trails
 * - Risk scoring and flagging
 * - Automated threat detection
 * - Admin action tracking
 */

import 'server-only';

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export interface AuditLogEntry {
  action: string;
  resource?: string;
  resourceId?: string;
  clerkUserId?: string;
  adminUserId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  riskScore?: number;
  flagged?: boolean;
}

export class AuditLoggerService {
  /**
   * Risk scoring weights for different actions
   */
  private static readonly RISK_WEIGHTS: Record<string, number> = {
    // High risk actions
    'admin_user_role_change': 80,
    'admin_data_export': 70,
    'admin_system_config_change': 75,
    'payment_refund': 60,
    'subscription_cancellation': 40,

    // Medium risk actions
    'login_failure': 30,
    'password_reset': 25,
    'payment_method_change': 35,
    'billing_address_change': 30,

    // Low risk actions
    'login_success': 5,
    'profile_update': 10,
    'subscription_view': 5,
    'product_view': 0,

    // Default
    'unknown': 20,
  };

  /**
   * Suspicious patterns that increase risk score
   */
  private static readonly SUSPICIOUS_PATTERNS = [
    { pattern: /multiple.*login.*attempt/i, score: 25 },
    { pattern: /admin.*access.*denied/i, score: 40 },
    { pattern: /unauthorized.*access/i, score: 50 },
    { pattern: /privilege.*escalation/i, score: 70 },
    { pattern: /data.*export.*large/i, score: 60 },
    { pattern: /sql.*injection/i, score: 90 },
    { pattern: /xss.*attempt/i, score: 80 },
  ];

  /**
   * Log audit event
   */
  static async logAuditEvent(
    entry: AuditLogEntry,
    request?: NextRequest
  ): Promise<string> {
    try {
      // Enrich entry with request data if available
      const enrichedEntry = request ? await this.enrichFromRequest(entry, request) : entry;

      // Calculate risk score
      const riskScore = this.calculateRiskScore(enrichedEntry);

      // Determine if should be flagged
      const flagged = riskScore >= 50 || enrichedEntry.flagged === true;

      const auditLog = await prisma.audit_logs.create({
        data: {
          action: enrichedEntry.action,
          resource: enrichedEntry.resource,
          resource_id: enrichedEntry.resourceId,
          clerk_user_id: enrichedEntry.clerkUserId,
          admin_user_id: enrichedEntry.adminUserId,
          ip_address: enrichedEntry.ipAddress,
          user_agent: enrichedEntry.userAgent,
          details: enrichedEntry.details || {},
          risk_score: riskScore,
          flagged,
        },
      });

      // Log to console for high-risk events
      if (flagged) {
        console.warn(`🚨 HIGH RISK AUDIT EVENT: ${enrichedEntry.action} (Risk: ${riskScore}) - ${auditLog.id}`);
      }

      return auditLog.id;
    } catch (error) {
      console.error('Error logging audit event:', error);
      throw error;
    }
  }

  /**
   * Log admin action
   */
  static async logAdminAction(
    action: string,
    details: Record<string, any>,
    request?: NextRequest
  ): Promise<string> {
    try {
      const { userId } = await auth();

      return await this.logAuditEvent({
        action: `admin_${action}`,
        adminUserId: userId || undefined,
        details: {
          ...details,
          admin_initiated: true,
          timestamp: new Date().toISOString(),
        },
        flagged: false, // Admin actions are pre-authorized
      }, request);
    } catch (error) {
      console.error('Error logging admin action:', error);
      throw error;
    }
  }

  /**
   * Log security event
   */
  static async logSecurityEvent(
    action: string,
    details: Record<string, any>,
    request?: NextRequest
  ): Promise<string> {
    return await this.logAuditEvent({
      action: `security_${action}`,
      details: {
        ...details,
        security_event: true,
        timestamp: new Date().toISOString(),
      },
      flagged: true, // Security events should always be flagged
    }, request);
  }

  /**
   * Log payment event
   */
  static async logPaymentEvent(
    action: string,
    paymentDetails: {
      amount?: number;
      currency?: string;
      paymentMethodType?: string;
      stripePaymentIntentId?: string;
      customerId?: string;
    },
    request?: NextRequest
  ): Promise<string> {
    return await this.logAuditEvent({
      action: `payment_${action}`,
      resource: 'payment',
      resourceId: paymentDetails.stripePaymentIntentId,
      details: {
        ...paymentDetails,
        payment_event: true,
        timestamp: new Date().toISOString(),
      },
    }, request);
  }

  /**
   * Get audit logs with filtering
   */
  static async getAuditLogs({
    action,
    clerkUserId,
    adminUserId,
    resource,
    flagged,
    minRiskScore,
    since,
    until,
    limit = 50,
    offset = 0,
  }: {
    action?: string;
    clerkUserId?: string;
    adminUserId?: string;
    resource?: string;
    flagged?: boolean;
    minRiskScore?: number;
    since?: Date;
    until?: Date;
    limit?: number;
    offset?: number;
  } = {}) {
    try {
      const where: any = {};

      if (action) where.action = { contains: action, mode: 'insensitive' };
      if (clerkUserId) where.clerk_user_id = clerkUserId;
      if (adminUserId) where.admin_user_id = adminUserId;
      if (resource) where.resource = resource;
      if (flagged !== undefined) where.flagged = flagged;
      if (minRiskScore !== undefined) where.risk_score = { gte: minRiskScore };
      if (since || until) {
        where.created_at = {};
        if (since) where.created_at.gte = since;
        if (until) where.created_at.lte = until;
      }

      const [logs, total] = await Promise.all([
        prisma.audit_logs.findMany({
          where,
          orderBy: { created_at: 'desc' },
          take: limit,
          skip: offset,
          select: {
            id: true,
            action: true,
            resource: true,
            resource_id: true,
            clerk_user_id: true,
            admin_user_id: true,
            ip_address: true,
            risk_score: true,
            flagged: true,
            reviewed_by: true,
            reviewed_at: true,
            created_at: true,
            details: true,
          },
        }),
        prisma.audit_logs.count({ where }),
      ]);

      return {
        logs,
        total,
        hasMore: offset + logs.length < total,
      };
    } catch (error) {
      console.error('Error getting audit logs:', error);
      throw error;
    }
  }

  /**
   * Get audit analytics
   */
  static async getAuditAnalytics(
    hours: number = 24
  ): Promise<{
    totalEvents: number;
    flaggedEvents: number;
    averageRiskScore: number;
    topActions: Array<{ action: string; count: number; avgRisk: number }>;
    topRiskyUsers: Array<{ userId: string; riskScore: number; eventCount: number }>;
    securityEvents: Array<{ action: string; count: number }>;
    timeline: Array<{ hour: string; events: number; flagged: number }>;
  }> {
    try {
      const since = new Date(Date.now() - hours * 60 * 60 * 1000);

      const whereClause = { created_at: { gte: since } };

      // Total events
      const totalEvents = await prisma.audit_logs.count({
        where: whereClause,
      });

      // Flagged events
      const flaggedEvents = await prisma.audit_logs.count({
        where: { ...whereClause, flagged: true },
      });

      // Average risk score
      const avgRisk = await prisma.audit_logs.aggregate({
        where: whereClause,
        _avg: { risk_score: true },
      });

      // Top actions
      const topActions = await prisma.audit_logs.groupBy({
        by: ['action'],
        where: whereClause,
        _count: true,
        _avg: { risk_score: true },
        orderBy: { _count: { action: 'desc' } },
        take: 10,
      });

      // Top risky users
      const topRiskyUsers = await prisma.audit_logs.groupBy({
        by: ['clerk_user_id'],
        where: {
          ...whereClause,
          clerk_user_id: { not: null },
        },
        _count: true,
        _avg: { risk_score: true },
        orderBy: { _avg: { risk_score: 'desc' } },
        take: 10,
      });

      // Security events
      const securityEvents = await prisma.audit_logs.groupBy({
        by: ['action'],
        where: {
          ...whereClause,
          action: { startsWith: 'security_' },
        },
        _count: true,
        orderBy: { _count: { action: 'desc' } },
      });

      // Timeline
      const timeline = await prisma.$queryRaw<Array<{
        hour: string;
        events: bigint;
        flagged: bigint;
      }>>`
        SELECT
          DATE_TRUNC('hour', created_at) as hour,
          COUNT(*) as events,
          SUM(CASE WHEN flagged = true THEN 1 ELSE 0 END) as flagged
        FROM audit_logs
        WHERE created_at >= ${since}
        GROUP BY DATE_TRUNC('hour', created_at)
        ORDER BY hour ASC
      `;

      return {
        totalEvents,
        flaggedEvents,
        averageRiskScore: avgRisk._avg.risk_score || 0,
        topActions: topActions.map(a => ({
          action: a.action,
          count: a._count,
          avgRisk: a._avg.risk_score || 0,
        })),
        topRiskyUsers: topRiskyUsers
          .filter(u => u.clerk_user_id)
          .map(u => ({
            userId: u.clerk_user_id!,
            riskScore: u._avg.risk_score || 0,
            eventCount: u._count,
          })),
        securityEvents: securityEvents.map(s => ({
          action: s.action,
          count: s._count,
        })),
        timeline: timeline.map(t => ({
          hour: t.hour,
          events: Number(t.events),
          flagged: Number(t.flagged),
        })),
      };
    } catch (error) {
      console.error('Error getting audit analytics:', error);
      throw error;
    }
  }

  /**
   * Mark audit log as reviewed
   */
  static async markAsReviewed(
    auditLogId: string,
    reviewedBy: string
  ): Promise<boolean> {
    try {
      await prisma.audit_logs.update({
        where: { id: auditLogId },
        data: {
          reviewed_by: reviewedBy,
          reviewed_at: new Date(),
        },
      });

      console.log(`✅ Audit log ${auditLogId} marked as reviewed by ${reviewedBy}`);
      return true;
    } catch (error) {
      console.error('Error marking audit log as reviewed:', error);
      return false;
    }
  }

  /**
   * Get flagged events needing review
   */
  static async getFlaggedEvents(limit: number = 20) {
    try {
      return await prisma.audit_logs.findMany({
        where: {
          flagged: true,
          reviewed_at: null,
        },
        orderBy: [
          { risk_score: 'desc' },
          { created_at: 'desc' },
        ],
        take: limit,
        select: {
          id: true,
          action: true,
          resource: true,
          resource_id: true,
          clerk_user_id: true,
          admin_user_id: true,
          ip_address: true,
          risk_score: true,
          created_at: true,
          details: true,
        },
      });
    } catch (error) {
      console.error('Error getting flagged events:', error);
      return [];
    }
  }

  /**
   * Calculate risk score for audit entry
   */
  private static calculateRiskScore(entry: AuditLogEntry): number {
    let riskScore = entry.riskScore || 0;

    // Base risk from action type
    const baseRisk = this.RISK_WEIGHTS[entry.action] || this.RISK_WEIGHTS['unknown'];
    riskScore += baseRisk;

    // Pattern-based risk scoring
    const detailsText = JSON.stringify(entry.details || {}).toLowerCase();
    for (const { pattern, score } of this.SUSPICIOUS_PATTERNS) {
      if (pattern.test(detailsText)) {
        riskScore += score;
      }
    }

    // Time-based risk (unusual hours)
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) {
      riskScore += 10; // Unusual hours
    }

    // IP-based risk (could be enhanced with geolocation)
    if (entry.ipAddress && this.isUnusualIP(entry.ipAddress)) {
      riskScore += 15;
    }

    // Cap at 100
    return Math.min(100, Math.max(0, riskScore));
  }

  /**
   * Enrich audit entry from request
   */
  private static async enrichFromRequest(entry: AuditLogEntry, request: NextRequest): Promise<AuditLogEntry> {
    return {
      ...entry,
      ipAddress: entry.ipAddress || this.getClientIP(request),
      userAgent: entry.userAgent || request.headers.get('user-agent') || undefined,
      clerkUserId: entry.clerkUserId || await this.getClerkUserId(),
    };
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
   * Check if IP is unusual (placeholder for geolocation logic)
   */
  private static isUnusualIP(ipAddress: string): boolean {
    // Placeholder for more sophisticated IP analysis
    // Could integrate with MaxMind GeoIP2 or similar

    // Simple checks for now
    const localPatterns = [
      /^127\./, // localhost
      /^192\.168\./, // private network
      /^10\./, // private network
      /^172\.(1[6-9]|2[0-9]|3[01])\./, // private network
    ];

    return !localPatterns.some(pattern => pattern.test(ipAddress));
  }

  /**
   * Clean up old audit logs
   */
  static async cleanupOldLogs(daysToKeep: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

      const result = await prisma.audit_logs.deleteMany({
        where: {
          created_at: { lte: cutoffDate },
          flagged: false, // Keep flagged logs longer
          reviewed_at: { not: null }, // Only delete reviewed logs
        },
      });

      console.log(`🧹 Cleaned up ${result.count} old audit logs`);
      return result.count;
    } catch (error) {
      console.error('Error cleaning up audit logs:', error);
      return 0;
    }
  }
}