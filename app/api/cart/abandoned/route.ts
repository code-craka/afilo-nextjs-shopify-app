import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

/**
 * Abandoned Cart API
 *
 * Retrieves user's abandoned cart items for display on dashboard
 */


export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const items = await prisma.cart_items.findMany({
      where: {
        user_id: userId,
        status: 'abandoned',
      },
      orderBy: {
        abandoned_at: 'desc',
      },
      take: 10,
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
        abandoned_at: true,
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
        abandonedAt: item.abandoned_at,
        lastModified: item.last_modified,
      })),
      count: items.length,
    });

  } catch (error: any) {
    console.error('GET /api/cart/abandoned error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch abandoned carts' },
      { status: 500 }
    );
  }
}

// POST - Restore abandoned cart item to active
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { itemId } = body;

    if (!itemId) {
      return NextResponse.json(
        { error: 'Missing itemId' },
        { status: 400 }
      );
    }

    const updated = await prisma.cart_items.update({
      where: {
        id: itemId,
        user_id: userId,
      },
      data: {
        status: 'active',
        abandoned_at: null,
        last_modified: new Date(),
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
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Item restored to cart',
      item: {
        id: updated.id,
        productId: updated.product_id,
        variantId: updated.variant_id,
        title: updated.title,
        price: updated.price,
        quantity: updated.quantity,
        licenseType: updated.license_type,
        imageUrl: updated.image_url,
        addedAt: updated.added_at,
      },
    });

  } catch (error: any) {
    console.error('POST /api/cart/abandoned error:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Item not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to restore item' },
      { status: 500 }
    );
  }
}
