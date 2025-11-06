/**
 * Webhook Health API
 *
 * GET /api/admin/enterprise/webhook-health - Get webhook system health status
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { WebhookMonitorService } from '@/lib/enterprise/webhook-monitor.service';

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

    const healthStatus = await WebhookMonitorService.getHealthStatus();

    return NextResponse.json({
      success: true,
      data: healthStatus,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error getting webhook health:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}