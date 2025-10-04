import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getProductsByIds } from '@/lib/shopify-server';
import { LICENSE_DEFINITIONS, EDUCATIONAL_DISCOUNTS, TAX_RATES } from '@/store/digitalCart';
import { logSecurityEvent } from '@/lib/cart-security';
import {
  validationRateLimit,
  checkRateLimit as checkDistributedRateLimit,
  getRateLimitIdentifier,
  getClientIp
} from '@/lib/rate-limit';

interface CartValidationRequest {
  items: Array<{
    productId: string;
    variantId: string;
    quantity: number;
    licenseType: string;
    educationalTier: string;
    clientPrice: number;
  }>;
  userRegion: string;
}

interface CartValidationResponse {
  valid: boolean;
  serverTotals: {
    subtotal: number;
    educationalDiscount: number;
    tax: number;
    total: number;
  };
  discrepancies?: Array<{
    itemId: string;
    field: string;
    clientValue: number;
    serverValue: number;
  }>;
  error?: string;
}

// Rate limiting storage (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(userId: string | null, ip: string): string {
  // Prioritize user-based rate limiting for authenticated users
  return userId ? `cart-validate:user:${userId}` : `cart-validate:ip:${ip}`;
}

function checkRateLimit(key: string, isAuthenticated: boolean): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  // ��� SECURITY FIX: Reduced rate limit from 100 to 20 for authenticated users
  const maxRequests = isAuthenticated ? 20 : 10; // Even stricter for unauthenticated

  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

// Clean up expired rate limit entries
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes

export async function POST(request: NextRequest): Promise<NextResponse<CartValidationResponse>> {
  try {
    // 🔒 CRITICAL SECURITY FIX: Require authentication
    const { userId } = await auth();

    if (!userId) {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

      await logSecurityEvent({
        type: 'UNAUTHORIZED_ACCESS',
        userId: null,
        ip,
        details: {
          endpoint: '/api/cart/validate',
          message: 'Unauthenticated cart validation attempt'
        }
      });

      return NextResponse.json(
        {
          valid: false,
          error: 'Authentication required for cart validation',
          serverTotals: { subtotal: 0, educationalDiscount: 0, tax: 0, total: 0 }
        },
        { status: 401 }
      );
    }

    // 🚀 Distributed rate limiting with Upstash Redis (20 req/15min)
    const ip = getClientIp(request);
    const identifier = getRateLimitIdentifier(userId, ip);
    const rateLimit = await checkDistributedRateLimit(identifier, validationRateLimit);

    if (!rateLimit.success) {
      await logSecurityEvent({
        type: 'RATE_LIMIT',
        userId,
        ip,
        details: {
          endpoint: 'POST /api/cart/validate',
          limit: rateLimit.limit,
          reset: rateLimit.reset
        }
      });

      return NextResponse.json(
        {
          valid: false,
          error: 'Rate limit exceeded. Please try again later.',
          serverTotals: { subtotal: 0, educationalDiscount: 0, tax: 0, total: 0 }
        },
        {
          status: 429,
          headers: rateLimit.headers
        }
      );
    }

    const body: CartValidationRequest = await request.json();

    if (!body.items || !Array.isArray(body.items)) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Invalid request format',
          serverTotals: { subtotal: 0, educationalDiscount: 0, tax: 0, total: 0 }
        },
        { status: 400 }
      );
    }

    const discrepancies: CartValidationResponse['discrepancies'] = [];
    let serverSubtotal = 0;
    let totalEducationalDiscount = 0;

    // 🚀 PERFORMANCE OPTIMIZATION: Batch fetch all products in single API call
    const productIds = [...new Set(body.items.map(item => item.productId))];
    let products;

    try {
      products = await getProductsByIds(productIds);
    } catch (error) {
      console.error('Failed to fetch products for validation:', error);
      return NextResponse.json(
        {
          valid: false,
          error: 'Failed to validate cart items. Please try again.',
          serverTotals: { subtotal: 0, educationalDiscount: 0, tax: 0, total: 0 }
        },
        { status: 500 }
      );
    }

    // Create a product lookup map for O(1) access
    const productMap = new Map(products.map(p => [p.id, p]));

    // Validate each item
    for (const item of body.items) {
      try {
        // Fetch product from map (already batched)
        const product = productMap.get(item.productId);
        if (!product) {
          return NextResponse.json(
            {
              valid: false,
              error: `Product not found: ${item.productId}`,
              serverTotals: { subtotal: 0, educationalDiscount: 0, tax: 0, total: 0 }
            },
            { status: 404 }
          );
        }

        // Find the variant
        const variant = product.variants.edges.find(
          edge => edge.node.id === item.variantId
        )?.node;

        if (!variant) {
          return NextResponse.json(
            {
              valid: false,
              error: `Variant not found: ${item.variantId}`,
              serverTotals: { subtotal: 0, educationalDiscount: 0, tax: 0, total: 0 }
            },
            { status: 404 }
          );
        }

        // Calculate server-side price
        const basePrice = parseFloat(variant.price.amount);

        // Validate license type exists
        const validLicenseTypes: string[] = ['Personal', 'Commercial', 'Extended', 'Enterprise', 'Developer', 'Free'];
        if (!validLicenseTypes.includes(item.licenseType)) {
          return NextResponse.json(
            {
              valid: false,
              error: `Invalid license type: ${item.licenseType}. Valid types: ${validLicenseTypes.join(', ')}`,
              serverTotals: { subtotal: 0, educationalDiscount: 0, tax: 0, total: 0 }
            },
            { status: 400 }
          );
        }

        const licenseDefinition = LICENSE_DEFINITIONS[item.licenseType as keyof typeof LICENSE_DEFINITIONS];

        // This should never happen now, but keep as safety check
        if (!licenseDefinition) {
          console.error('CRITICAL: License definition not found for validated type:', item.licenseType);
          return NextResponse.json(
            {
              valid: false,
              error: `License configuration error for type: ${item.licenseType}`,
              serverTotals: { subtotal: 0, educationalDiscount: 0, tax: 0, total: 0 }
            },
            { status: 500 }
          );
        }

        // Validate quantity limits
        if (item.quantity > licenseDefinition.maxSeats) {
          return NextResponse.json(
            {
              valid: false,
              error: `Quantity ${item.quantity} exceeds license limit ${licenseDefinition.maxSeats} for ${item.licenseType}`,
              serverTotals: { subtotal: 0, educationalDiscount: 0, tax: 0, total: 0 }
            },
            { status: 400 }
          );
        }

        // Calculate server price with license multiplier
        let serverPrice = basePrice * licenseDefinition.priceMultiplier;

        // Apply bulk discounts for team licenses
        if (item.quantity > 1) {
          const bulkDiscountRate = item.quantity >= 10 ? 0.2 : item.quantity >= 5 ? 0.1 : 0;
          serverPrice = serverPrice * item.quantity * (1 - bulkDiscountRate);
        }

        // Apply educational discount
        const educationalDiscountRate = EDUCATIONAL_DISCOUNTS[item.educationalTier as keyof typeof EDUCATIONAL_DISCOUNTS] || 0;
        const educationalDiscountAmount = serverPrice * educationalDiscountRate;
        const finalPrice = serverPrice - educationalDiscountAmount;

        // Check for price discrepancies (allow 1 cent tolerance for rounding)
        const tolerance = 0.01;
        if (Math.abs(item.clientPrice - finalPrice) > tolerance) {
          discrepancies.push({
            itemId: item.productId,
            field: 'price',
            clientValue: item.clientPrice,
            serverValue: finalPrice
          });
        }

        serverSubtotal += finalPrice;
        totalEducationalDiscount += educationalDiscountAmount;

      } catch (error) {
        console.error('Error validating item:', error);
        return NextResponse.json(
          {
            valid: false,
            error: 'Internal server error during validation',
            serverTotals: { subtotal: 0, educationalDiscount: 0, tax: 0, total: 0 }
          },
          { status: 500 }
        );
      }
    }

    // Calculate tax
    const taxInfo = TAX_RATES[body.userRegion] || TAX_RATES['Default'];
    const taxAmount = serverSubtotal * taxInfo.rate;
    const total = serverSubtotal + taxAmount;

    const serverTotals = {
      subtotal: Math.round(serverSubtotal * 100) / 100,
      educationalDiscount: Math.round(totalEducationalDiscount * 100) / 100,
      tax: Math.round(taxAmount * 100) / 100,
      total: Math.round(total * 100) / 100
    };

    const response: CartValidationResponse = {
      valid: discrepancies.length === 0,
      serverTotals,
      ...(discrepancies.length > 0 && { discrepancies })
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Cart validation error:', error);
    return NextResponse.json(
      {
        valid: false,
        error: 'Internal server error',
        serverTotals: { subtotal: 0, educationalDiscount: 0, tax: 0, total: 0 }
      },
      { status: 500 }
    );
  }
}