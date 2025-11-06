/**
 * Cart Recovery Stats API
 *
 * GET /api/admin/cart-recovery/stats - Get cart recovery statistics
 *
 * Phase 2 Feature: Enhanced E-commerce Features
 *
 * Returns:
 * - Abandoned cart metrics
 * - Recovery performance data
 * - Email campaign statistics
 * - Revenue analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { subDays, startOfDay, endOfDay } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    // Calculate date range
    const endDate = endOfDay(new Date());
    const startDate = startOfDay(subDays(new Date(), days));

    // Get abandoned cart statistics
    const abandonedCarts = await prisma.cart_recovery_sessions.findMany({
      where: {
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        status: true,
        total_value: true,
        recovery_revenue: true,
        created_at: true,
        abandoned_at: true,
        recovered_at: true,
        recovery_emails_sent: true,
        email_opened: true,
        email_clicked: true,
      },
    });

    // Get email campaign statistics
    const emailStats = await prisma.cart_recovery_email_logs.aggregate({
      where: {
        sent_at: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        id: true,
        opened_at: true,
        clicked_at: true,
        converted_at: true,
      },
      _sum: {
        recovery_revenue: true,
      },
    });

    // Calculate metrics
    const totalAbandonedCarts = abandonedCarts.filter(cart => cart.status === 'abandoned').length;
    const recoveredCarts = abandonedCarts.filter(cart => cart.status === 'recovered').length;
    const totalLostRevenue = abandonedCarts
      .filter(cart => cart.status === 'abandoned')
      .reduce((sum, cart) => sum + parseFloat(cart.total_value.toString()), 0);
    const recoveredRevenue = abandonedCarts
      .reduce((sum, cart) => sum + parseFloat(cart.recovery_revenue.toString()), 0);

    const emailsSent = emailStats._count.id || 0;
    const emailsOpened = emailStats._count.opened_at || 0;
    const emailsClicked = emailStats._count.clicked_at || 0;
    const emailsConverted = emailStats._count.converted_at || 0;

    // Calculate rates
    const recoveryRate = totalAbandonedCarts > 0
      ? (recoveredCarts / (totalAbandonedCarts + recoveredCarts)) * 100
      : 0;
    const emailOpenRate = emailsSent > 0 ? (emailsOpened / emailsSent) * 100 : 0;
    const emailClickRate = emailsOpened > 0 ? (emailsClicked / emailsOpened) * 100 : 0;
    const conversionRate = emailsSent > 0 ? (emailsConverted / emailsSent) * 100 : 0;

    const stats = {
      totalAbandonedCarts,
      totalLostRevenue,
      recoveredCarts,
      recoveredRevenue,
      recoveryRate,
      emailsSent,
      emailOpenRate,
      emailClickRate,
      conversionRate,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });

  } catch (error) {
    console.error('Error fetching cart recovery stats:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}