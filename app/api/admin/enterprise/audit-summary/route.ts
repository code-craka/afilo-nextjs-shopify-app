/**
 * Audit Summary API
 *
 * GET /api/admin/enterprise/audit-summary - Get security audit summary
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { AuditLoggerService } from '@/lib/enterprise/audit-logger.service';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check admin role
    const userProfile = await prisma.user_profiles.findUnique({
      where: { clerk_user_id: userId },
      select: { role: true }
    });

    if (!userProfile || (userProfile.role !== 'admin' && userProfile.role !== 'owner')) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const analytics = await AuditLoggerService.getAuditAnalytics(24);
    const flaggedEvents = await AuditLoggerService.getFlaggedEvents(10);

    const summary = {
      totalEvents: analytics.totalEvents,
      flaggedEvents: analytics.flaggedEvents,
      averageRiskScore: analytics.averageRiskScore,
      pendingReviews: flaggedEvents.length,
    };

    return NextResponse.json({
      success: true,
      data: summary,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error getting audit summary:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}