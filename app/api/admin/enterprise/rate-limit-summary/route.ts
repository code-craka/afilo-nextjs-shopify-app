/**
 * Rate Limit Summary API
 *
 * GET /api/admin/enterprise/rate-limit-summary - Get rate limiting summary
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { RateLimiterService } from '@/lib/enterprise/rate-limiter.service';

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

    const analytics = await RateLimiterService.getRateLimitAnalytics(24);
    const blockedIdentifiers = await RateLimiterService.getBlockedIdentifiers();

    const summary = {
      totalRequests: analytics.total_requests,
      blockedRequests: analytics.blocked_requests,
      blockRate: analytics.block_rate,
      activeBlocks: blockedIdentifiers.length,
    };

    return NextResponse.json({
      success: true,
      data: summary,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error getting rate limit summary:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}