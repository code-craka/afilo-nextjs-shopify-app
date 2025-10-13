import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Pool } from '@neondatabase/serverless';

/**
 * Cart Sync API
 *
 * Synchronizes local cart state with server database
 * Handles abandoned cart detection (30+ minutes inactive)
 */

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const ABANDONED_CART_THRESHOLD = 30 * 60 * 1000; // 30 minutes in milliseconds

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { localItems = [] } = body;

    // Mark abandoned carts (items not modified in 30+ minutes)
    await pool.query(
      `UPDATE cart_items
      SET status = 'abandoned',
          abandoned_at = NOW()
      WHERE user_id = $1
        AND status = 'active'
        AND last_modified < NOW() - INTERVAL '30 minutes'`,
      [userId]
    );

    // Get all active items from server
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
        last_modified as "lastModified"
      FROM cart_items
      WHERE user_id = $1 AND status = 'active'
      ORDER BY added_at DESC`,
      [userId]
    );

    return NextResponse.json({
      success: true,
      items: result.rows,
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
