import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Pool } from '@neondatabase/serverless';

/**
 * Cart Item Operations API
 *
 * Individual item management (update, delete)
 */

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

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

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (quantity !== undefined) {
      updates.push(`quantity = $${paramIndex++}`);
      values.push(quantity);
    }

    if (licenseType !== undefined) {
      updates.push(`license_type = $${paramIndex++}`);
      values.push(licenseType);
    }

    updates.push(`last_modified = NOW()`);

    // Add WHERE clause parameters
    values.push(itemId);
    values.push(userId);

    const result = await pool.query(
      `UPDATE cart_items
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex++}
        AND user_id = $${paramIndex}
        AND status = 'active'
      RETURNING
        id,
        product_id as "productId",
        variant_id as "variantId",
        title,
        price,
        quantity,
        license_type as "licenseType",
        image_url as "imageUrl",
        added_at as "addedAt",
        last_modified as "lastModified"`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Item not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      ...result.rows[0],
    });

  } catch (error: any) {
    console.error('PATCH /api/cart/items/[id] error:', error);
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

    const result = await pool.query(
      `DELETE FROM cart_items
      WHERE id = $1
        AND user_id = $2
        AND status = 'active'
      RETURNING id`,
      [itemId, userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Item not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Item removed from cart',
    });

  } catch (error: any) {
    console.error('DELETE /api/cart/items/[id] error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to remove item' },
      { status: 500 }
    );
  }
}
