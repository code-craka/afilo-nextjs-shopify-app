/**
 * Cart Tracking API Route
 *
 * POST /api/cart/track - Track cart session for recovery
 *
 * Handles client-side cart tracking by creating recovery sessions
 * in the database for abandoned cart email campaigns.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { CartRecoveryService } from '@/lib/cart-recovery-service';

interface CartTrackingRequest {
  sessionId: string;
  userId: string;
  items: Array<{
    productId: string;
    variantId?: string;
    title: string;
    price: number;
    quantity: number;
    imageUrl?: string;
    licenseType?: string;
  }>;
  totalValue: number;
  userEmail?: string;
  userName?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse the request body
    const body: CartTrackingRequest = await request.json();

    // Validate required fields
    if (!body.sessionId || !body.userId || !body.items || !Array.isArray(body.items)) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Ensure the authenticated user matches the cart user
    if (body.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'User mismatch' },
        { status: 403 }
      );
    }

    // Track the cart session using the recovery service
    await CartRecoveryService.trackCartSession({
      sessionId: body.sessionId,
      userId: body.userId,
      items: body.items,
      totalValue: body.totalValue,
      userEmail: body.userEmail,
      userName: body.userName,
    });

    return NextResponse.json({
      success: true,
      message: 'Cart session tracked successfully',
      sessionId: body.sessionId,
    });

  } catch (error) {
    console.error('Error tracking cart session:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}