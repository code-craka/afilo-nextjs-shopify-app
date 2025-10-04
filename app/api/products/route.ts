import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/shopify';
import { ShopifyProduct } from '@/types/shopify';
import { ProductSortKeys } from '@/types/shopify';
import { shopifyApiRateLimit, checkRateLimit, getClientIp } from '@/lib/rate-limit';

// Cache products for 60 seconds to reduce Shopify API calls
let cachedProducts: { data: ShopifyProduct[]; timestamp: number } | null = null;
const CACHE_DURATION = 60000; // 60 seconds

export async function GET(request: Request) {
  try {
    // Rate limiting: Skip in development, enforce in production
    const isDevelopment = process.env.NODE_ENV === 'development';

    let rateLimit;
    if (!isDevelopment) {
      const ip = getClientIp(request);
      rateLimit = await checkRateLimit(ip, shopifyApiRateLimit);

      if (!rateLimit.success) {
        return NextResponse.json(
          {
            message: 'Too many requests. Please try again later.',
            error: 'Rate limit exceeded'
          },
          {
            status: 429,
            headers: rateLimit.headers
          }
        );
      }
    } else {
      // Mock rate limit response for development
      rateLimit = {
        success: true,
        limit: 1000,
        remaining: 1000,
        reset: Date.now() + 60000,
        headers: {
          'X-RateLimit-Limit': '1000',
          'X-RateLimit-Remaining': '1000',
          'X-RateLimit-Reset': new Date(Date.now() + 60000).toISOString()
        }
      };
    }

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

    // Check cache for basic product listings (no query/pagination)
    const now = Date.now();
    if (!query && !after && cachedProducts && (now - cachedProducts.timestamp) < CACHE_DURATION) {
      return NextResponse.json({ products: cachedProducts.data }, { headers: rateLimit.headers });
    }

    const products: ShopifyProduct[] = await getProducts(params);

    // Cache basic product listings
    if (!query && !after) {
      cachedProducts = { data: products, timestamp: now };
    }

    return NextResponse.json({ products }, { headers: rateLimit.headers });
  } catch (error: unknown) {
    console.error('API /products/route Error:', error);

    return NextResponse.json(
      { message: 'Failed to fetch products.', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}