import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

/**
 * Cart Sync API
 *
 * Synchronizes local cart state with server database
 * Handles abandoned cart detection (30+ minutes inactive)
 */


const ABANDONED_CART_THRESHOLD = 30 * 60 * 1000; // 30 minutes in milliseconds

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { localItems = [] } = body;

    // Calculate the cutoff time for abandoned carts
    const thirtyMinutesAgo = new Date(Date.now() - ABANDONED_CART_THRESHOLD);

    // Mark abandoned carts (items not modified in 30+ minutes)
    await prisma.$executeRaw`
      UPDATE cart_items
      SET status = 'abandoned',
          abandoned_at = NOW()
      WHERE user_id = ${userId}
        AND status = 'active'
        AND last_modified < ${thirtyMinutesAgo}
    `;

    // Get all active items from server
    const items = await prisma.cart_items.findMany({
      where: {
        user_id: userId,
        status: 'active',
      },
      orderBy: {
        added_at: 'desc',
      },
      select: {
        id: true,
        product_id: true,
        variant_id: true,
        title: true,
        price: true,
        quantity: true,
        license_type: true,
        image_url: true,
        added_at: true,
        last_modified: true,
      },
    });

    return NextResponse.json({
      success: true,
      items: items.map(item => ({
        id: item.id,
        productId: item.product_id,
        variantId: item.variant_id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        licenseType: item.license_type,
        imageUrl: item.image_url,
        addedAt: item.added_at,
        lastModified: item.last_modified,
      })),
      syncedAt: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('POST /api/cart/sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync cart' },
      { status: 500 }
    );
  }
}
