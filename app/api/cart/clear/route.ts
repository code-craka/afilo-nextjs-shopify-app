import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Pool } from '@neondatabase/serverless';

/**
 * Cart Clear API
 *
 * Removes all active cart items for the user
 */

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete all active cart items
    const result = await pool.query(
      `DELETE FROM cart_items
      WHERE user_id = $1 AND status = 'active'
      RETURNING id`,
      [userId]
    );

    return NextResponse.json({
      success: true,
      message: `Removed ${result.rows.length} items from cart`,
      removedCount: result.rows.length,
    });

  } catch (error: any) {
    console.error('POST /api/cart/clear error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to clear cart' },
      { status: 500 }
    );
  }
}
