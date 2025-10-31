import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

/**
 * Cart Clear API
 *
 * Removes all active cart items for the user
 */


export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete all active cart items
    const result = await prisma.cart_items.deleteMany({
      where: {
        user_id: userId,
        status: 'active',
      },
    });

    return NextResponse.json({
      success: true,
      message: `Removed ${result.count} items from cart`,
      removedCount: result.count,
    });

  } catch (error: any) {
    console.error('POST /api/cart/clear error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to clear cart' },
      { status: 500 }
    );
  }
}
