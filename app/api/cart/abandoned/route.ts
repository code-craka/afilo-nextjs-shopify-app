import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Pool } from '@neondatabase/serverless';

/**
 * Abandoned Cart API
 *
 * Retrieves user's abandoned cart items for display on dashboard
 */

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await pool.query(
      `SELECT
        id,
        product_id as "productId",
        variant_id as "variantId",
        title,
        price,
        quantity,
        license_type as "licenseType",
        image_url as "imageUrl",
        added_at as "addedAt",
        abandoned_at as "abandonedAt",
        last_modified as "lastModified"
      FROM cart_items
      WHERE user_id = $1 AND status = 'abandoned'
      ORDER BY abandoned_at DESC
      LIMIT 10`,
      [userId]
    );

    return NextResponse.json({
      success: true,
      items: result.rows,
      count: result.rows.length,
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

    const result = await pool.query(
      `UPDATE cart_items
      SET status = 'active',
          abandoned_at = NULL,
          last_modified = NOW()
      WHERE id = $1
        AND user_id = $2
        AND status = 'abandoned'
      RETURNING
        id,
        product_id as "productId",
        variant_id as "variantId",
        title,
        price,
        quantity,
        license_type as "licenseType",
        image_url as "imageUrl",
        added_at as "addedAt"`,
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
      message: 'Item restored to cart',
      item: result.rows[0],
    });

  } catch (error: any) {
    console.error('POST /api/cart/abandoned error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to restore item' },
      { status: 500 }
    );
  }
}
