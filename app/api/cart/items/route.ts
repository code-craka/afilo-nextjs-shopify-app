import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

/**
 * Cart Items API - PostgreSQL Persistent Cart
 *
 * Manages cart_items table with abandoned cart tracking
 * Uses shared database connection pool to prevent connection exhaustion
 */

// GET - Fetch user's active cart items
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
    });

  } catch (error: unknown) {
    console.error('GET /api/cart/items error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to fetch cart items' },
      { status: 500 }
    );
  }
}

// POST - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      productId,
      variantId,
      title,
      price,
      quantity = 1,
      licenseType,
      imageUrl,
    } = body;

    // Validate required fields
    if (!productId || !variantId || !title || !price || !licenseType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate license type
    if (!['personal', 'commercial'].includes(licenseType)) {
      return NextResponse.json(
        { error: 'Invalid license type' },
        { status: 400 }
      );
    }

    // Check if item already exists
    const existing = await prisma.cart_items.findFirst({
      where: {
        user_id: userId,
        product_id: productId,
        variant_id: variantId,
        license_type: licenseType,
        status: 'active',
      },
    });

    if (existing) {
      // Update quantity
      const newQuantity = existing.quantity + quantity;
      const updated = await prisma.cart_items.update({
        where: { id: existing.id },
        data: {
          quantity: newQuantity,
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
        id: updated.id,
        productId: updated.product_id,
        variantId: updated.variant_id,
        title: updated.title,
        price: updated.price,
        quantity: updated.quantity,
        licenseType: updated.license_type,
        imageUrl: updated.image_url,
        addedAt: updated.added_at,
      });
    }

    // Insert new item
    const created = await prisma.cart_items.create({
      data: {
        user_id: userId,
        product_id: productId,
        variant_id: variantId,
        title,
        price,
        quantity,
        license_type: licenseType,
        image_url: imageUrl,
        status: 'active',
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
      id: created.id,
      productId: created.product_id,
      variantId: created.variant_id,
      title: created.title,
      price: created.price,
      quantity: created.quantity,
      licenseType: created.license_type,
      imageUrl: created.image_url,
      addedAt: created.added_at,
    });

  } catch (error: unknown) {
    console.error('POST /api/cart/items error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to add item' },
      { status: 500 }
    );
  }
}
