/**
 * Cart Recovery Carts API
 *
 * GET /api/admin/cart-recovery/carts - Get abandoned carts list
 *
 * Phase 2 Feature: Enhanced E-commerce Features
 *
 * Returns:
 * - List of abandoned cart sessions
 * - Cart items and user details
 * - Recovery attempt history
 * - Email tracking data
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status') || 'all';

    // Build where condition
    const whereCondition: any = {};
    if (status !== 'all') {
      whereCondition.status = status;
    }

    // Get cart recovery sessions
    const cartSessions = await prisma.cart_recovery_sessions.findMany({
      where: whereCondition,
      include: {
        email_logs: {
          orderBy: { sent_at: 'desc' },
          take: 3, // Last 3 emails
        },
      },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
    });

    // Transform data for frontend
    const abandonedCarts = await Promise.all(
      cartSessions.map(async (session) => {
        try {
          // Try to get updated user info from Clerk
          let userName = session.user_name || 'Unknown User';
          let userEmail = session.user_email;

          try {
            const clerk = await clerkClient();
            const clerkUser = await clerk.users.getUser(session.clerk_user_id);
            userName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || userName;
            userEmail = clerkUser.emailAddresses[0]?.emailAddress || userEmail;
          } catch (clerkError) {
            // Use stored data if Clerk user not found
            console.warn(`Clerk user not found for ${session.clerk_user_id}:`, clerkError);
          }

          // Parse cart data to get items
          const cartData = session.cart_data as any;
          const items = cartData?.items || [];

          return {
            id: session.id,
            userId: session.clerk_user_id,
            userEmail,
            userName,
            items: items.map((item: any) => ({
              productId: item.product_id || item.productId,
              title: item.title,
              price: parseFloat(item.price?.toString() || '0'),
              quantity: item.quantity || 1,
              imageUrl: item.image_url || item.imageUrl,
            })),
            totalValue: parseFloat(session.total_value.toString()),
            createdAt: session.created_at.toISOString(),
            lastUpdated: session.last_activity.toISOString(),
            emailsSent: session.recovery_emails_sent,
            status: session.status,
            recoveryAttempts: session.email_logs.length,
          };
        } catch (error) {
          console.error('Error processing cart session:', error);
          return {
            id: session.id,
            userId: session.clerk_user_id,
            userEmail: session.user_email,
            userName: session.user_name || 'Unknown User',
            items: [],
            totalValue: parseFloat(session.total_value.toString()),
            createdAt: session.created_at.toISOString(),
            lastUpdated: session.last_activity.toISOString(),
            emailsSent: session.recovery_emails_sent,
            status: session.status,
            recoveryAttempts: session.email_logs.length,
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      data: abandonedCarts,
    });

  } catch (error) {
    console.error('Error fetching abandoned carts:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}