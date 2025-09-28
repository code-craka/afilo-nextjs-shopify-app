import { NextResponse } from 'next/server';
import { getCart, createCart, removeCartLines } from '@/lib/shopify';
import { ShopifyCart } from '@/types/shopify';

// Get cart
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cartId = searchParams.get('cartId');

    if (!cartId) {
      return NextResponse.json({ message: 'Missing cartId parameter' }, { status: 400 });
    }

    const cart: ShopifyCart | null = await getCart(cartId);

    if (!cart) {
      return NextResponse.json({ message: 'Cart not found' }, { status: 404 });
    }

    return NextResponse.json({ cart });
  } catch (error: any) {
    console.error('API /cart GET Error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch cart.', error: error.message },
      { status: 500 }
    );
  }
}

// Create cart
export async function POST(request: Request) {
  try {
    const { lines } = await request.json();
    const cart: ShopifyCart = await createCart({ lines });
    return NextResponse.json({ cart });
  } catch (error: any) {
    console.error('API /cart POST Error:', error);
    return NextResponse.json(
      { message: 'Failed to create cart.', error: error.message },
      { status: 500 }
    );
  }
}

// Remove cart lines
export async function DELETE(request: Request) {
  try {
    const { cartId, lineIds } = await request.json();

    if (!cartId || !lineIds) {
      return NextResponse.json({ message: 'Missing cartId or lineIds' }, { status: 400 });
    }

    const cart: ShopifyCart = await removeCartLines(cartId, lineIds);
    return NextResponse.json({ cart });
  } catch (error: any) {
    console.error('API /cart DELETE Error:', error);
    return NextResponse.json(
      { message: 'Failed to remove cart lines.', error: error.message },
      { status: 500 }
    );
  }
}