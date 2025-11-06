/**
 * API Health API
 *
 * GET /api/admin/enterprise/api-health - Get API system health status
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { APIMonitorService } from '@/lib/enterprise/api-monitor.middleware';

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

    const healthStatus = await APIMonitorService.getHealthStatus();

    return NextResponse.json({
      success: true,
      data: healthStatus,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error getting API health:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}