import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Pool } from '@neondatabase/serverless';

/**
 * Cart Items API - PostgreSQL Persistent Cart
 *
 * Manages cart_items table with abandoned cart tracking
 */

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// GET - Fetch user's active cart items
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
        last_modified as "lastModified"
      FROM cart_items
      WHERE user_id = $1 AND status = 'active'
      ORDER BY added_at DESC`,
      [userId]
    );

    return NextResponse.json({
      success: true,
      items: result.rows,
    });

  } catch (error: any) {
    console.error('GET /api/cart/items error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch cart items' },
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
    const existing = await pool.query(
      `SELECT id, quantity
      FROM cart_items
      WHERE user_id = $1
        AND product_id = $2
        AND variant_id = $3
        AND license_type = $4
        AND status = 'active'`,
      [userId, productId, variantId, licenseType]
    );

    if (existing.rows.length > 0) {
      // Update quantity
      const newQuantity = existing.rows[0].quantity + quantity;
      const updateResult = await pool.query(
        `UPDATE cart_items
        SET quantity = $1,
            last_modified = NOW()
        WHERE id = $2
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
        [newQuantity, existing.rows[0].id]
      );

      return NextResponse.json({
        success: true,
        ...updateResult.rows[0],
      });
    }

    // Insert new item
    const result = await pool.query(
      `INSERT INTO cart_items (
        user_id,
        product_id,
        variant_id,
        title,
        price,
        quantity,
        license_type,
        image_url,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active')
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
      [userId, productId, variantId, title, price, quantity, licenseType, imageUrl]
    );

    return NextResponse.json({
      success: true,
      ...result.rows[0],
    });

  } catch (error: any) {
    console.error('POST /api/cart/items error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add item' },
      { status: 500 }
    );
  }
}
