/**
 * Admin Users Export API
 *
 * GET /api/admin/users/export - Export users data as CSV
 *
 * Phase 2 Feature: User Management Dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { clerkClient } from '@clerk/nextjs/server';
import { format } from 'date-fns';

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

    // Get all user profiles
    const userProfiles = await prisma.user_profiles.findMany({
      include: {
        _count: {
          select: {
            user_subscriptions: true,
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    // Get detailed user data
    const usersData = await Promise.all(
      userProfiles.map(async (profile) => {
        try {
          const clerk = await clerkClient();
          const clerkUser = await clerk.users.getUser(profile.clerk_user_id);

          // Get subscription data
          const activeSubscription = await prisma.subscriptions.findFirst({
            where: {
              clerk_user_id: profile.clerk_user_id,
              status: { in: ['active', 'trialing'] }
            }
          });

          // Get subscription statistics (as purchases proxy)
          const subscriptions = await prisma.user_subscriptions.findMany({
            where: { user_profile_id: profile.id },
            select: { created_at: true }
          });

          const totalSpent = 0; // No direct purchase tracking available

          // Get last chat activity
          const lastChatMessage = await prisma.chat_messages.findFirst({
            where: {
              conversation: {
                clerk_user_id: profile.clerk_user_id
              }
            },
            orderBy: { created_at: 'desc' },
            select: { created_at: true }
          });

          return {
            email: clerkUser.emailAddresses[0]?.emailAddress || 'Unknown',
            firstName: clerkUser.firstName || '',
            lastName: clerkUser.lastName || '',
            role: profile.role,
            created_at: format(new Date(clerkUser.createdAt), 'yyyy-MM-dd HH:mm:ss'),
            lastSignIn: clerkUser.lastSignInAt
              ? format(new Date(clerkUser.lastSignInAt), 'yyyy-MM-dd HH:mm:ss')
              : 'Never',
            isActive: !clerkUser.banned && !clerkUser.locked,
            subscriptionStatus: activeSubscription?.status || 'None',
            subscriptionPlan: activeSubscription?.plan_id || 'None',
            totalPurchases: subscriptions.length,
            totalSpent: totalSpent.toFixed(2),
            chatMessages: 0, // No direct count available
            lastActivity: lastChatMessage?.created_at
              ? format(new Date(lastChatMessage.created_at), 'yyyy-MM-dd HH:mm:ss')
              : 'Never'
          };
        } catch (error) {
          console.error(`Error processing user ${profile.clerk_user_id}:`, error);
          return {
            email: 'Unknown',
            firstName: 'Unknown',
            lastName: 'User',
            role: profile.role,
            created_at: format(new Date(profile.created_at || new Date()), 'yyyy-MM-dd HH:mm:ss'),
            lastSignIn: 'Never',
            isActive: false,
            subscriptionStatus: 'None',
            subscriptionPlan: 'None',
            totalPurchases: profile._count.user_subscriptions,
            totalSpent: '0.00',
            chatMessages: 0,
            lastActivity: 'Never'
          };
        }
      })
    );

    // Generate CSV
    const csvHeaders = [
      'Email',
      'First Name',
      'Last Name',
      'Role',
      'Created At',
      'Last Sign In',
      'Is Active',
      'Subscription Status',
      'Subscription Plan',
      'Total Purchases',
      'Total Spent',
      'Chat Messages',
      'Last Activity'
    ];

    const csvRows = usersData.map(user => [
      user.email,
      user.firstName,
      user.lastName,
      user.role,
      user.created_at,
      user.lastSignIn,
      user.isActive ? 'Yes' : 'No',
      user.subscriptionStatus,
      user.subscriptionPlan,
      user.totalPurchases,
      user.totalSpent,
      user.chatMessages,
      user.lastActivity
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    // Return CSV response
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="users-export-${format(new Date(), 'yyyy-MM-dd')}.csv"`
      }
    });

  } catch (error) {
    console.error('Error exporting users:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}