/**
 * Admin User Role Management API
 *
 * PATCH /api/admin/users/[userId]/role - Update user role
 *
 * Phase 2 Feature: User Management Dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: adminUserId } = await auth();
    const { userId } = await params;

    if (!adminUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if current user is admin
    const adminProfile = await prisma.user_profiles.findUnique({
      where: { clerk_user_id: adminUserId },
      select: { role: true }
    });

    if (!adminProfile || (adminProfile.role !== 'admin' && adminProfile.role !== 'owner')) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { role } = await request.json();

    if (!['user', 'admin'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Get target user profile
    const targetUser = await prisma.user_profiles.findUnique({
      where: { clerk_user_id: userId },
      select: { role: true, clerk_user_id: true }
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent changing owner role
    if (targetUser.role === 'owner') {
      return NextResponse.json(
        { success: false, error: 'Cannot change owner role' },
        { status: 403 }
      );
    }

    // Update user role
    await prisma.user_profiles.update({
      where: { clerk_user_id: userId },
      data: { role }
    });

    return NextResponse.json({
      success: true,
      message: `User role updated to ${role}`
    });

  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}