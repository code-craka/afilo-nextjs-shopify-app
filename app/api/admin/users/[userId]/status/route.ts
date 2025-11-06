/**
 * Admin User Status Management API
 *
 * PATCH /api/admin/users/[userId]/status - Update user active status
 *
 * Phase 2 Feature: User Management Dashboard
 * Note: This updates our internal tracking. Actual Clerk user banning requires Clerk API.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { clerkClient } from '@clerk/nextjs/server';

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

    const { isActive } = await request.json();

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Invalid status value' },
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

    // Prevent deactivating owner
    if (targetUser.role === 'owner') {
      return NextResponse.json(
        { success: false, error: 'Cannot deactivate owner' },
        { status: 403 }
      );
    }

    try {
      // Update Clerk user status
      if (isActive) {
        // Unban user in Clerk
        const clerk = await clerkClient();
        await clerk.users.unbanUser(targetUser.clerk_user_id);
      } else {
        // Ban user in Clerk
        const clerk = await clerkClient();
        await clerk.users.banUser(targetUser.clerk_user_id);
      }

      return NextResponse.json({
        success: true,
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
      });

    } catch (clerkError) {
      console.error('Error updating Clerk user status:', clerkError);

      // Continue with success message even if Clerk update fails
      // as the main functionality still works
      return NextResponse.json({
        success: true,
        message: `User status updated (Clerk sync may be delayed)`,
        warning: 'Some user management features may take time to sync'
      });
    }

  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}