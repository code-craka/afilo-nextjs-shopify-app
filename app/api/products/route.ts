import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getProducts, createProduct } from '@/lib/db/products';
import { syncProductWithStripe } from '@/lib/stripe-products';
import type { ProductsQueryParams, ProductsResponse } from '@/types/product';
import { productsApiRateLimit, checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { cacheManager } from '@/lib/cache-manager';
import { requestManager } from '@/lib/request-manager';
import { log } from '@/lib/logger';

const CACHE_DURATION = 60000; // 60 seconds for product listings
const SEARCH_CACHE_DURATION = 30000; // 30 seconds for search results

// GET /api/products - List products with filtering and pagination
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const searchParams = request.nextUrl.searchParams;

  log.api.request('GET', '/api/products', Object.fromEntries(searchParams));

  try {
    // Rate limiting: Skip in development, enforce in production
    const isDevelopment = process.env.NODE_ENV === 'development';

    let rateLimit;
    if (!isDevelopment) {
      const ip = getClientIp(request);
      rateLimit = await checkRateLimit(ip, productsApiRateLimit);

      if (!rateLimit.success) {
        log.warn('Rate limit exceeded', { ip, limit: productsApiRateLimit });
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

    // Build query parameters from URL search params
    const queryParams: ProductsQueryParams = {
      first: parseInt(searchParams.get('first') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
      after: searchParams.get('after') || undefined, // Cursor-based pagination
      query: searchParams.get('query') || undefined,
      productType: searchParams.get('productType') as ProductsQueryParams['productType'] || undefined,
      vendor: searchParams.get('vendor') || undefined,
      minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
      status: (searchParams.get('status') as ProductsQueryParams['status']) || 'active',
      availableForSale: searchParams.get('availableForSale') === 'true' ? true : undefined,
      featured: searchParams.get('featured') === 'true' ? true : undefined,
      sortBy: (searchParams.get('sortBy') as ProductsQueryParams['sortBy']) || 'updatedAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    };

    // Parse array parameters
    const tags = searchParams.get('tags');
    if (tags) {
      queryParams.tags = tags.split(',');
    }

    const techStack = searchParams.get('techStack');
    if (techStack) {
      queryParams.techStack = techStack.split(',');
    }

    const licenseTypes = searchParams.get('licenseTypes');
    if (licenseTypes) {
      queryParams.licenseTypes = licenseTypes.split(',') as ProductsQueryParams['licenseTypes'];
    }

    // Generate cache key based on all parameters
    const cacheKey = cacheManager.generateKey(queryParams);

    // Determine cache duration based on request type
    const cacheDuration = queryParams.query ? SEARCH_CACHE_DURATION : CACHE_DURATION;

    // Check cache first
    const cached = cacheManager.get(cacheKey, cacheDuration);
    if (cached) {
      log.debug('Cache hit for products', { cacheKey, queryParams });
      return NextResponse.json(cached, {
        headers: {
          ...rateLimit.headers,
          'X-Cache': 'HIT'
        }
      });
    }

    log.debug('Cache miss for products', { cacheKey, queryParams });

    // Create deduplicated request to prevent duplicate API calls
    const requestKey = requestManager.generateKey('/api/products', {
      method: 'GET',
      body: JSON.stringify(queryParams)
    });

    const result: ProductsResponse = await requestManager.deduplicate(
      requestKey,
      async () => {
        return await getProducts(queryParams);
      },
      15000 // 15 second timeout
    );

    const responseData = {
      success: true,
      products: result.products,
      total: result.total,
      hasMore: result.hasMore,
      nextCursor: result.nextCursor,
      pageInfo: result.pageInfo,
      pagination: {
        first: queryParams.first,
        offset: queryParams.offset,
        after: queryParams.after,
        nextOffset: !queryParams.after && result.hasMore ? (queryParams.offset || 0) + (queryParams.first || 20) : null,
        nextCursor: result.nextCursor,
      },
    };

    // Cache the response
    cacheManager.set(cacheKey, responseData, cacheDuration);

    const response = NextResponse.json(responseData, {
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
        success: false,
        error: 'Failed to fetch products',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// POST /api/products - Create a new product (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Add admin role check here
    // const userRole = await getUserRole(userId);
    // if (userRole !== 'admin') {
    //   return NextResponse.json(
    //     { success: false, error: 'Forbidden - Admin access required' },
    //     { status: 403 }
    //   );
    // }

    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.handle || !body.title || !body.basePrice || !body.productType) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          message: 'Missing required fields: handle, title, basePrice, productType',
        },
        { status: 400 }
      );
    }

    // Create product in database
    const product = await createProduct({
      handle: body.handle,
      title: body.title,
      description: body.description || '',
      descriptionHtml: body.descriptionHtml,
      basePrice: parseFloat(body.basePrice),
      currency: body.currency || 'USD',
      compareAtPrice: body.compareAtPrice ? parseFloat(body.compareAtPrice) : undefined,
      productType: body.productType,
      vendor: body.vendor || 'Afilo',
      tags: body.tags || [],
      techStack: body.techStack || [],
      version: body.version,
      availableLicenses: body.availableLicenses || ['Personal', 'Commercial', 'Enterprise'],
      subscriptionSupported: body.subscriptionSupported || false,
      subscriptionInterval: body.subscriptionInterval,
      trialPeriodDays: body.trialPeriodDays || 0,
      minimumUsers: body.minimumUsers || 1,
      maximumUsers: body.maximumUsers,
      complianceStandards: body.complianceStandards || [],
      integrationCapabilities: body.integrationCapabilities || [],
      supportLevel: body.supportLevel || 'standard',
      hasDocumentation: body.hasDocumentation || false,
      hasDemo: body.hasDemo || false,
      demoUrl: body.demoUrl,
      documentationUrl: body.documentationUrl,
      systemRequirements: body.systemRequirements,
      downloadLinks: body.downloadLinks || [],
      accessInstructions: body.accessInstructions,
      activationRequired: body.activationRequired || false,
      availableForSale: body.availableForSale !== false,
      featured: body.featured || false,
      status: body.status || 'active',
      featuredImageUrl: body.featuredImageUrl,
      images: body.images || [],
      seoTitle: body.seoTitle,
      seoDescription: body.seoDescription,
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : new Date(),
    });

    // Sync with Stripe if requested
    if (body.syncStripe !== false) {
      try {
        await syncProductWithStripe(product);
      } catch (stripeError) {
        console.error('Stripe sync failed:', stripeError);
        // Don't fail the entire request if Stripe sync fails
        return NextResponse.json({
          success: true,
          product,
          warning: 'Product created but Stripe sync failed',
          stripeError: stripeError instanceof Error ? stripeError.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        product,
        message: 'Product created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/products failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create product',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}