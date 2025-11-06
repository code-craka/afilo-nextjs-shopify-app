/**
 * Cart Recovery Campaigns API
 *
 * GET /api/admin/cart-recovery/campaigns - Get all email campaigns
 * POST /api/admin/cart-recovery/campaigns - Create new email campaign
 *
 * Phase 2 Feature: Enhanced E-commerce Features
 *
 * Returns:
 * - List of email campaigns with performance metrics
 * - Campaign configuration and settings
 * - Success/failure rates and revenue data
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

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

    // Get all campaigns with their performance metrics
    const campaigns = await prisma.cart_recovery_campaigns.findMany({
      orderBy: { created_at: 'desc' },
    });

    // Transform campaigns data
    const campaignsData = campaigns.map(campaign => ({
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      isActive: campaign.is_active,
      triggerDelay: campaign.trigger_delay_hours,
      emailTemplate: campaign.email_template,
      subject: campaign.subject_line,
      discountPercent: parseFloat(campaign.discount_percent.toString()),
      discountCode: campaign.discount_code,
      sent: campaign.total_sent,
      opened: campaign.total_opened,
      clicked: campaign.total_clicked,
      converted: campaign.total_converted,
      revenue: parseFloat(campaign.total_revenue.toString()),
      createdAt: campaign.created_at.toISOString(),
      updatedAt: campaign.updated_at.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: campaignsData,
    });

  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const {
      name,
      description,
      triggerDelayHours,
      emailTemplate,
      subjectLine,
      discountPercent,
      discountCode,
      isActive = true,
    } = await request.json();

    // Validate required fields
    if (!name || !emailTemplate || !subjectLine) {
      return NextResponse.json(
        { success: false, error: 'Name, email template, and subject line are required' },
        { status: 400 }
      );
    }

    if (triggerDelayHours < 1 || triggerDelayHours > 720) { // Max 30 days
      return NextResponse.json(
        { success: false, error: 'Trigger delay must be between 1 and 720 hours' },
        { status: 400 }
      );
    }

    // Create new campaign
    const campaign = await prisma.cart_recovery_campaigns.create({
      data: {
        name,
        description,
        is_active: isActive,
        trigger_delay_hours: triggerDelayHours,
        email_template: emailTemplate,
        subject_line: subjectLine,
        discount_percent: discountPercent || 0,
        discount_code: discountCode,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: campaign.id,
        name: campaign.name,
        description: campaign.description,
        isActive: campaign.is_active,
        triggerDelay: campaign.trigger_delay_hours,
        emailTemplate: campaign.email_template,
        subject: campaign.subject_line,
        discountPercent: parseFloat(campaign.discount_percent.toString()),
        discountCode: campaign.discount_code,
        sent: campaign.total_sent,
        opened: campaign.total_opened,
        clicked: campaign.total_clicked,
        converted: campaign.total_converted,
        revenue: parseFloat(campaign.total_revenue.toString()),
        createdAt: campaign.created_at.toISOString(),
        updatedAt: campaign.updated_at.toISOString(),
      },
    });

  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}