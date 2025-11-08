/**
 * Admin Cookie Consent Analytics API
 * Provides analytics and insights for admin dashboard
 *
 * @fileoverview Admin-only endpoints for cookie consent analytics and reporting
 * @version 1.0
 * @compliance CCPA, PIPEDA, UK GDPR, Australia Privacy Act
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import {
  ConsentAnalyticsQuerySchema,
  type ConsentAnalyticsQuery,
} from '@/lib/validations/cookie-consent';

/**
 * GET /api/admin/cookies/analytics
 * Retrieve comprehensive consent analytics for admin dashboard
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check admin permissions
    const userProfile = await prisma.user_profiles.findUnique({
      where: { clerk_user_id: userId },
      select: { role: true },
    });

    if (userProfile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryParams: ConsentAnalyticsQuery = {
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
      country_code: searchParams.get('country_code') || undefined,
      consent_method: searchParams.get('consent_method') as any || undefined,
      group_by: (searchParams.get('group_by') as any) || 'day',
      limit: parseInt(searchParams.get('limit') || '100'),
    };

    const validatedQuery = ConsentAnalyticsQuerySchema.parse(queryParams);

    // Calculate date range defaults
    const endDate = validatedQuery.end_date ? new Date(validatedQuery.end_date) : new Date();
    const startDate = validatedQuery.start_date
      ? new Date(validatedQuery.start_date)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

    // Build where clause for filtering
    const whereClause: any = {
      consent_timestamp: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (validatedQuery.country_code) {
      whereClause.country_code = validatedQuery.country_code;
    }

    if (validatedQuery.consent_method) {
      whereClause.consent_method = validatedQuery.consent_method;
    }

    // === OVERVIEW STATISTICS ===
    const [
      totalConsents,
      activeConsents,
      expiredConsents,
      revokedConsents,
      authenticatedUsers,
      anonymousUsers,
    ] = await Promise.all([
      // Total consents in date range
      prisma.cookie_consent_records.count({
        where: whereClause,
      }),

      // Active consents (not expired or revoked)
      prisma.cookie_consent_records.count({
        where: {
          ...whereClause,
          is_active: true,
          expires_at: { gte: new Date() },
        },
      }),

      // Expired consents
      prisma.cookie_consent_records.count({
        where: {
          ...whereClause,
          expires_at: { lt: new Date() },
        },
      }),

      // Revoked consents
      prisma.cookie_consent_records.count({
        where: {
          ...whereClause,
          is_active: false,
          revoked_at: { not: null },
        },
      }),

      // Authenticated users
      prisma.cookie_consent_records.count({
        where: {
          ...whereClause,
          clerk_user_id: { not: null },
        },
      }),

      // Anonymous users
      prisma.cookie_consent_records.count({
        where: {
          ...whereClause,
          clerk_user_id: null,
        },
      }),
    ]);

    // === CONSENT PREFERENCES BREAKDOWN ===
    const preferencesBreakdown = await prisma.cookie_consent_records.aggregate({
      where: {
        ...whereClause,
        is_active: true,
      },
      _count: {
        analytics_cookies: true,
        marketing_cookies: true,
        preferences_cookies: true,
      },
    });

    const optInRates = await Promise.all([
      // Analytics opt-in rate
      prisma.cookie_consent_records.count({
        where: { ...whereClause, is_active: true, analytics_cookies: true },
      }),
      // Marketing opt-in rate
      prisma.cookie_consent_records.count({
        where: { ...whereClause, is_active: true, marketing_cookies: true },
      }),
      // Preferences opt-in rate
      prisma.cookie_consent_records.count({
        where: { ...whereClause, is_active: true, preferences_cookies: true },
      }),
    ]);

    // === CONSENT METHODS BREAKDOWN ===
    const consentMethods = await prisma.cookie_consent_records.groupBy({
      by: ['consent_method'],
      where: whereClause,
      _count: {
        consent_method: true,
      },
      orderBy: {
        _count: {
          consent_method: 'desc',
        },
      },
    });

    // === GEOGRAPHIC BREAKDOWN ===
    const geographicBreakdown = await prisma.cookie_consent_records.groupBy({
      by: ['country_code'],
      where: {
        ...whereClause,
        country_code: { not: null },
      },
      _count: {
        country_code: true,
      },
      orderBy: {
        _count: {
          country_code: 'desc',
        },
      },
      take: 10, // Top 10 countries
    });

    // === TIME SERIES DATA ===
    let timeSeriesGrouping: any;
    switch (validatedQuery.group_by) {
      case 'week':
        timeSeriesGrouping = {
          year: { consent_timestamp: true },
          week: { consent_timestamp: true },
        };
        break;
      case 'month':
        timeSeriesGrouping = {
          year: { consent_timestamp: true },
          month: { consent_timestamp: true },
        };
        break;
      default: // 'day'
        timeSeriesGrouping = {
          year: { consent_timestamp: true },
          month: { consent_timestamp: true },
          day: { consent_timestamp: true },
        };
    }

    // Note: Prisma doesn't support date_trunc grouping directly,
    // so we'll use a raw query for time series data
    const timeSeriesData = await prisma.$queryRaw`
      SELECT
        DATE_TRUNC(${validatedQuery.group_by}, consent_timestamp) as period,
        COUNT(*) as total_consents,
        COUNT(*) FILTER (WHERE analytics_cookies = true) as analytics_opt_ins,
        COUNT(*) FILTER (WHERE marketing_cookies = true) as marketing_opt_ins,
        COUNT(*) FILTER (WHERE preferences_cookies = true) as preferences_opt_ins,
        COUNT(*) FILTER (WHERE consent_method = 'explicit_accept') as explicit_accepts,
        COUNT(*) FILTER (WHERE consent_method = 'explicit_reject') as explicit_rejects,
        COUNT(DISTINCT clerk_user_id) FILTER (WHERE clerk_user_id IS NOT NULL) as unique_authenticated_users,
        COUNT(*) FILTER (WHERE clerk_user_id IS NULL) as anonymous_consents
      FROM cookie_consent_records
      WHERE consent_timestamp BETWEEN ${startDate} AND ${endDate}
        ${validatedQuery.country_code ? `AND country_code = ${validatedQuery.country_code}` : ''}
        ${validatedQuery.consent_method ? `AND consent_method = ${validatedQuery.consent_method}` : ''}
      GROUP BY period
      ORDER BY period DESC
      LIMIT ${validatedQuery.limit}
    `;

    // === RECENT ACTIVITY ===
    const recentActivity = await prisma.cookie_consent_audit_log.findMany({
      take: 20,
      orderBy: { created_at: 'desc' },
      include: {
        consent_record: {
          select: {
            clerk_user_id: true,
            country_code: true,
          },
        },
      },
      where: {
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // === COMPLIANCE SUMMARY ===
    const complianceFrameworks = await prisma.cookie_consent_records.groupBy({
      by: ['country_code'],
      where: {
        ...whereClause,
        country_code: { not: null },
      },
      _count: {
        country_code: true,
      },
    });

    // Map country codes to compliance frameworks
    const complianceSummary = complianceFrameworks.map(item => {
      const frameworks: Record<string, string> = {
        'US': 'CCPA',
        'CA': 'PIPEDA',
        'GB': 'UK GDPR',
        'AU': 'Australia Privacy Act',
      };

      return {
        country_code: item.country_code,
        framework: frameworks[item.country_code || ''] || 'Unknown',
        consent_count: item._count.country_code,
      };
    });

    // Calculate percentages
    const calculatePercentage = (part: number, total: number) =>
      total > 0 ? Math.round((part / total) * 100 * 100) / 100 : 0;

    // === RESPONSE DATA ===
    return NextResponse.json({
      analytics: {
        overview: {
          total_consents: totalConsents,
          active_consents: activeConsents,
          expired_consents: expiredConsents,
          revoked_consents: revokedConsents,
          authenticated_users: authenticatedUsers,
          anonymous_users: anonymousUsers,
          retention_rate: calculatePercentage(activeConsents, totalConsents),
        },

        opt_in_rates: {
          analytics: {
            count: optInRates[0],
            percentage: calculatePercentage(optInRates[0], activeConsents),
          },
          marketing: {
            count: optInRates[1],
            percentage: calculatePercentage(optInRates[1], activeConsents),
          },
          preferences: {
            count: optInRates[2],
            percentage: calculatePercentage(optInRates[2], activeConsents),
          },
        },

        consent_methods: consentMethods.map(method => ({
          method: method.consent_method,
          count: method._count.consent_method,
          percentage: calculatePercentage(method._count.consent_method, totalConsents),
        })),

        geographic_breakdown: geographicBreakdown.map(geo => ({
          country_code: geo.country_code,
          count: geo._count.country_code,
          percentage: calculatePercentage(geo._count.country_code, totalConsents),
        })),

        time_series: timeSeriesData,

        recent_activity: recentActivity.map(activity => ({
          id: activity.id,
          event_type: activity.event_type,
          changed_by: activity.changed_by,
          change_reason: activity.change_reason,
          created_at: activity.created_at,
          user_type: activity.consent_record?.clerk_user_id ? 'authenticated' : 'anonymous',
          country_code: activity.consent_record?.country_code,
        })),

        compliance_summary: complianceSummary,

        metadata: {
          query_params: validatedQuery,
          date_range: {
            start: startDate,
            end: endDate,
          },
          generated_at: new Date(),
        },
      },
    });

  } catch (error: unknown) {
    console.error('GET /api/admin/cookies/analytics error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Failed to retrieve analytics', message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/cookies/analytics/export
 * Export consent data for compliance reporting
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check admin permissions
    const userProfile = await prisma.user_profiles.findUnique({
      where: { clerk_user_id: userId },
      select: { role: true },
    });

    if (userProfile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { format = 'json', start_date, end_date, include_audit_log = false } = body;

    // Build date range
    const endDate = end_date ? new Date(end_date) : new Date();
    const startDate = start_date
      ? new Date(start_date)
      : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago

    // Get consent records
    const consentRecords = await prisma.cookie_consent_records.findMany({
      where: {
        consent_timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        audit_logs: include_audit_log ? {
          orderBy: { created_at: 'desc' },
        } : false,
      },
      orderBy: { consent_timestamp: 'desc' },
    });

    // Format data based on requested format
    if (format === 'json') {
      return NextResponse.json({
        export: {
          date_range: { start: startDate, end: endDate },
          total_records: consentRecords.length,
          consent_records: consentRecords,
          generated_at: new Date(),
          generated_by: userId,
        },
      });
    }

    // For CSV/XLSX, return a simple JSON that frontend can convert
    const csvData = consentRecords.map(record => ({
      id: record.id,
      user_id: record.clerk_user_id || 'anonymous',
      session_id: record.session_id,
      essential_cookies: record.essential_cookies,
      analytics_cookies: record.analytics_cookies,
      marketing_cookies: record.marketing_cookies,
      preferences_cookies: record.preferences_cookies,
      consent_method: record.consent_method,
      consent_timestamp: record.consent_timestamp,
      country_code: record.country_code,
      is_active: record.is_active,
      expires_at: record.expires_at,
      revoked_at: record.revoked_at,
    }));

    return NextResponse.json({
      export: {
        format,
        date_range: { start: startDate, end: endDate },
        total_records: csvData.length,
        data: csvData,
        generated_at: new Date(),
      },
    });

  } catch (error: unknown) {
    console.error('POST /api/admin/cookies/analytics error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Failed to export data', message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}