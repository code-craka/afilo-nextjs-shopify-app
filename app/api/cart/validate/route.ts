import { NextRequest, NextResponse } from 'next/server';
import { getProductById } from '@/lib/shopify';
import { LICENSE_DEFINITIONS, EDUCATIONAL_DISCOUNTS, TAX_RATES } from '@/store/digitalCart';

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

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  return `cart-validate:${ip}`;
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100;

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
    // Rate limiting
    const rateLimitKey = getRateLimitKey(request);
    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Rate limit exceeded. Please try again later.',
          serverTotals: { subtotal: 0, educationalDiscount: 0, tax: 0, total: 0 }
        },
        { status: 429 }
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

    // Validate each item
    for (const item of body.items) {
      try {
        // Fetch product from Shopify to get authoritative pricing
        const product = await getProductById(item.productId);
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
        const licenseDefinition = LICENSE_DEFINITIONS[item.licenseType as keyof typeof LICENSE_DEFINITIONS];

        if (!licenseDefinition) {
          return NextResponse.json(
            {
              valid: false,
              error: `Invalid license type: ${item.licenseType}`,
              serverTotals: { subtotal: 0, educationalDiscount: 0, tax: 0, total: 0 }
            },
            { status: 400 }
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