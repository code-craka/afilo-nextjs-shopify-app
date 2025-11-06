/**
 * Admin Users API
 *
 * GET /api/admin/users - List all users with stats
 *
 * Phase 2 Feature: User Management Dashboard
 *
 * Returns:
 * - All users with subscription status
 * - User engagement metrics
 * - Revenue statistics
 * - Activity tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { clerkClient } from '@clerk/nextjs/server';

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

    // Get all user profiles from database
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

    // Get Clerk user data for each profile
    const usersWithDetails = await Promise.all(
      userProfiles.map(async (profile) => {
        try {
          const clerk = await clerkClient();
          const clerkUser = await clerk.users.getUser(profile.clerk_user_id);

          // Get subscription data
          const activeSubscription = await prisma.subscriptions.findFirst({
            where: {
              clerk_user_id: profile.clerk_user_id,
              status: { in: ['active', 'trialing'] }
            },
            orderBy: { created_at: 'desc' }
          });

          // Get subscription statistics (as purchases proxy)
          const subscriptions = await prisma.user_subscriptions.findMany({
            where: { user_profile_id: profile.id },
            select: { created_at: true }
          });

          const totalSpent = 0; // No direct purchase tracking available

          // Get last activity from chat messages
          const lastChatMessage = await prisma.chat_messages.findFirst({
            where: {
              conversation: {
                clerk_user_id: profile.clerk_user_id
              }
            },
            orderBy: { created_at: 'desc' },
            select: { created_at: true }
          });

          // Calculate MRR for active subscription (simplified)
          let mrr = 0;
          // MRR calculation would require price data from plan_id lookup

          return {
            id: profile.id,
            clerk_user_id: profile.clerk_user_id,
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            firstName: clerkUser.firstName || '',
            lastName: clerkUser.lastName || '',
            imageUrl: clerkUser.imageUrl,
            role: profile.role,
            created_at: clerkUser.createdAt,
            lastLoginAt: clerkUser.lastSignInAt,
            isActive: !clerkUser.banned && !clerkUser.locked,
            subscription: activeSubscription ? {
              status: activeSubscription.status as 'active' | 'inactive' | 'canceled' | 'trial',
              plan: activeSubscription.plan_id || null,
              mrr: mrr,
              nextBillingDate: activeSubscription.current_period_end
            } : null,
            stats: {
              totalPurchases: subscriptions.length,
              totalSpent: totalSpent,
              chatMessages: 0, // No direct count available
              lastActivity: lastChatMessage?.created_at || null
            }
          };
        } catch (clerkError) {
          console.error(`Error fetching Clerk user ${profile.clerk_user_id}:`, clerkError);

          // Return basic data if Clerk user doesn't exist
          return {
            id: profile.id,
            clerk_user_id: profile.clerk_user_id,
            email: 'Unknown',
            firstName: 'Unknown',
            lastName: 'User',
            imageUrl: null,
            role: profile.role,
            created_at: profile.created_at,
            lastLoginAt: null,
            isActive: false,
            subscription: null,
            stats: {
              totalPurchases: profile._count.user_subscriptions,
              totalSpent: 0,
              chatMessages: 0,
              lastActivity: null
            }
          };
        }
      })
    );

    // Calculate stats
    const totalUsers = usersWithDetails.length;
    const activeUsers = usersWithDetails.filter(user => user.isActive).length;
    const totalRevenue = usersWithDetails.reduce((sum, user) => sum + user.stats.totalSpent, 0);
    const avgMRR = usersWithDetails
      .filter(user => user.subscription)
      .reduce((sum, user) => sum + (user.subscription?.mrr || 0), 0) /
      usersWithDetails.filter(user => user.subscription).length || 0;

    const stats = {
      totalUsers,
      activeUsers,
      totalRevenue,
      avgMRR
    };

    return NextResponse.json({
      success: true,
      users: usersWithDetails,
      stats
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}