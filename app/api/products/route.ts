import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/shopify';
import { ShopifyProduct } from '@/types/shopify';

import { ProductSortKeys } from '@/types/shopify';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const first = searchParams.get('first');
    const after = searchParams.get('after');
    const query = searchParams.get('query');
    const sortBy = searchParams.get('sortBy') as ProductSortKeys | null;
    const sortReverse = searchParams.get('sortReverse');

    const params: Record<string, unknown> = {
      first: first ? parseInt(first, 10) : 20,
      after: after || undefined,
      query: query || undefined,
      sortKey: sortBy || 'UPDATED_AT',
      reverse: sortReverse ? sortReverse === 'true' : false
    };

    const products: ShopifyProduct[] = await getProducts(params);

    return NextResponse.json({ products });
  } catch (error: unknown) {
    console.error('API /products/route Error:', error);

    return NextResponse.json(
      { message: 'Failed to fetch products.', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}