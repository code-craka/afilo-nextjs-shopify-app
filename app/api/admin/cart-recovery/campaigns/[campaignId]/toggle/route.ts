/**
 * Cart Recovery Campaign Toggle API
 *
 * PATCH /api/admin/cart-recovery/campaigns/[campaignId]/toggle - Toggle campaign active status
 *
 * Phase 2 Feature: Enhanced E-commerce Features
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { userId } = await auth();
    const { campaignId } = await params;

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

    const { isActive } = await request.json();

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'isActive must be a boolean' },
        { status: 400 }
      );
    }

    // Update campaign status
    const campaign = await prisma.cart_recovery_campaigns.update({
      where: { id: campaignId },
      data: { is_active: isActive },
    });

    return NextResponse.json({
      success: true,
      message: `Campaign ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        id: campaign.id,
        name: campaign.name,
        isActive: campaign.is_active,
      },
    });

  } catch (error) {
    console.error('Error toggling campaign:', error);

    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}