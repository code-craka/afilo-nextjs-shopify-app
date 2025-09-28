import { NextResponse } from 'next/server';
import { addCartLines, updateCartLines } from '@/lib/shopify';
import { ShopifyCart } from '@/types/shopify';

// Add cart lines
export async function POST(request: Request) {
  try {
    const { cartId, lines } = await request.json();

    if (!cartId || !lines) {
      return NextResponse.json({ message: 'Missing cartId or lines' }, { status: 400 });
    }

    const cart: ShopifyCart = await addCartLines(cartId, lines);
    return NextResponse.json({ cart });
  } catch (error: any) {
    console.error('API /cart/lines POST Error:', error);
    return NextResponse.json(
      { message: 'Failed to add lines to cart.', error: error.message },
      { status: 500 }
    );
  }
}

// Update cart lines
export async function PUT(request: Request) {
  try {
    const { cartId, lines } = await request.json();

    if (!cartId || !lines) {
      return NextResponse.json({ message: 'Missing cartId or lines' }, { status: 400 });
    }

    const cart: ShopifyCart = await updateCartLines(cartId, lines);
    return NextResponse.json({ cart });
  } catch (error: any) {
    console.error('API /cart/lines PUT Error:', error);
    return NextResponse.json(
      { message: 'Failed to update cart lines.', error: error.message },
      { status: 500 }
    );
  }
}