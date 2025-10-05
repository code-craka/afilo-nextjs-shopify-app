import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/shopify';
import { ShopifyProduct } from '@/types/shopify';
import { ProductSortKeys } from '@/types/shopify';
import { shopifyApiRateLimit, checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { cacheManager } from '@/lib/cache-manager';
import { requestManager } from '@/lib/request-manager';
import { log } from '@/lib/logger';

const CACHE_DURATION = 60000; // 60 seconds for product listings
const SEARCH_CACHE_DURATION = 30000; // 30 seconds for search results

export async function GET(request: Request) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);

  log.api.request('GET', '/api/products', Object.fromEntries(searchParams));

  try {
    // Rate limiting: Skip in development, enforce in production
    const isDevelopment = process.env.NODE_ENV === 'development';

    let rateLimit;
    if (!isDevelopment) {
      const ip = getClientIp(request);
      rateLimit = await checkRateLimit(ip, shopifyApiRateLimit);

      if (!rateLimit.success) {
        log.warn('Rate limit exceeded', { ip, limit: shopifyApiRateLimit });
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

    // Extract and normalize parameters
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

    // Generate cache key based on all parameters
    const cacheKey = cacheManager.generateKey(params);

    // Determine cache duration based on request type
    const cacheDuration = query ? SEARCH_CACHE_DURATION : CACHE_DURATION;

    // Check cache first
    const cached = cacheManager.get(cacheKey, cacheDuration);
    if (cached) {
      log.debug('Cache hit for products', { cacheKey, params });
      return NextResponse.json({ products: cached }, {
        headers: {
          ...rateLimit.headers,
          'X-Cache': 'HIT'
        }
      });
    }

    log.debug('Cache miss for products', { cacheKey, params });

    // Create deduplicated request to prevent duplicate API calls
    const requestKey = requestManager.generateKey('/api/products', {
      method: 'GET',
      body: JSON.stringify(params)
    });

    const products = await requestManager.deduplicate(
      requestKey,
      async (controller) => {
        return await getProducts(params);
      },
      15000 // 15 second timeout
    );

    // Cache the response
    cacheManager.set(cacheKey, products, cacheDuration);

    const response = NextResponse.json({ products }, {
      headers: {
        ...rateLimit.headers,
        'X-Cache': 'MISS'
      }
    });

    log.api.response('GET', '/api/products', response.status, Date.now() - startTime);

    return response;

  } catch (error: unknown) {
    const duration = Date.now() - startTime;
    log.error('API /products failed', error, {
      url: request.url,
      duration,
      errorCode: 'PRODUCTS_FETCH_ERROR'
    });

    return NextResponse.json(
      {
        message: 'Failed to fetch products.',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}