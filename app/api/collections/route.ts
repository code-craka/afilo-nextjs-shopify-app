import { NextResponse } from 'next/server';
import { getCollections } from '@/lib/shopify';
import { ShopifyCollection } from '@/types/shopify';
import { CollectionSortKeys } from '@/types/shopify';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const first = searchParams.get('first');
    const query = searchParams.get('query');
    const sortBy = searchParams.get('sortBy') as CollectionSortKeys | null;
    const sortReverse = searchParams.get('sortReverse');

    const params: any = {
      first: first ? parseInt(first, 10) : 20,
      query: query || undefined,
      sortKey: sortBy || 'UPDATED_AT',
      reverse: sortReverse ? sortReverse === 'true' : false
    };

    const collections: ShopifyCollection[] = await getCollections(params);

    return NextResponse.json({ collections });
  } catch (error: any) {
    console.error('API /collections/route Error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch collections.', error: error.message },
      { status: 500 }
    );
  }
}