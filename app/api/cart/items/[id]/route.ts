import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

/**
 * Cart Item Operations API
 *
 * Individual item management (update, delete)
 */


// PATCH - Update item (quantity or license type)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: itemId } = await params;
    const body = await request.json();
    const { quantity, licenseType } = body;

    // Validate at least one field to update
    if (quantity === undefined && licenseType === undefined) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Validate values
    if (quantity !== undefined && quantity < 1) {
      return NextResponse.json(
        { error: 'Quantity must be at least 1' },
        { status: 400 }
      );
    }

    if (licenseType && !['personal', 'commercial'].includes(licenseType)) {
      return NextResponse.json(
        { error: 'Invalid license type' },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: any = {
      last_modified: new Date(),
    };

    if (quantity !== undefined) {
      updateData.quantity = quantity;
    }

    if (licenseType !== undefined) {
      updateData.license_type = licenseType;
    }

    const updated = await prisma.cart_items.update({
      where: {
        id: itemId,
        user_id: userId,
      },
      data: updateData,
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
      id: updated.id,
      productId: updated.product_id,
      variantId: updated.variant_id,
      title: updated.title,
      price: updated.price,
      quantity: updated.quantity,
      licenseType: updated.license_type,
      imageUrl: updated.image_url,
      addedAt: updated.added_at,
      lastModified: updated.last_modified,
    });

  } catch (error: any) {
    console.error('PATCH /api/cart/items/[id] error:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Item not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to update item' },
      { status: 500 }
    );
  }
}

// DELETE - Remove item from cart
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: itemId } = await params;

    await prisma.cart_items.delete({
      where: {
        id: itemId,
        user_id: userId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Item removed from cart',
    });

  } catch (error: any) {
    console.error('DELETE /api/cart/items/[id] error:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Item not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to remove item' },
      { status: 500 }
    );
  }
}
