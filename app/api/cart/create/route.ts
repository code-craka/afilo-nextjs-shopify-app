import { NextRequest, NextResponse } from 'next/server';
import { createCart, addCartLines } from '@/lib/shopify';

interface CreateCartRequest {
  lineItems: Array<{
    variantId: string;
    quantity: number;
    customAttributes?: Array<{
      key: string;
      value: string;
    }>;
  }>;
  customAttributes?: Array<{
    key: string;
    value: string;
  }>;
  note?: string;
  buyerIdentity?: {
    email?: string;
    phone?: string;
    countryCode?: string;
  };
}

interface CreateCartResponse {
  success: boolean;
  cart?: {
    id: string;
    checkoutUrl: string;
    totalQuantity: number;
    cost: {
      totalAmount: {
        amount: string;
        currencyCode: string;
      };
      subtotalAmount: {
        amount: string;
        currencyCode: string;
      };
    };
  };
  error?: string;
}

// Rate limiting storage
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  return `cart-create:${ip}`;
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 20; // Lower limit for cart creation

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

export async function POST(request: NextRequest): Promise<NextResponse<CreateCartResponse>> {
  try {
    // Rate limiting
    const rateLimitKey = getRateLimitKey(request);
    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded. Please try again later.'
        },
        { status: 429 }
      );
    }

    const body: CreateCartRequest = await request.json();

    // Validate request
    if (!body.lineItems || !Array.isArray(body.lineItems) || body.lineItems.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request: lineItems array is required and cannot be empty'
        },
        { status: 400 }
      );
    }

    // Validate each line item
    for (const item of body.lineItems) {
      if (!item.variantId || !item.quantity || item.quantity <= 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid line item: variantId and positive quantity are required'
          },
          { status: 400 }
        );
      }
    }

    // Create initial cart
    const cartInput = {
      ...(body.note && { note: body.note }),
      ...(body.customAttributes && { attributes: body.customAttributes }),
      ...(body.buyerIdentity && { buyerIdentity: body.buyerIdentity })
    };

    const cart = await createCart(cartInput);

    // Add line items to cart
    const cartLines = body.lineItems.map(item => ({
      merchandiseId: item.variantId,
      quantity: item.quantity,
      ...(item.customAttributes && { attributes: item.customAttributes })
    }));

    const updatedCart = await addCartLines(cart.id, cartLines);

    // Return simplified cart data
    const response: CreateCartResponse = {
      success: true,
      cart: {
        id: updatedCart.id,
        checkoutUrl: updatedCart.checkoutUrl,
        totalQuantity: updatedCart.totalQuantity || 0,
        cost: {
          totalAmount: updatedCart.cost.totalAmount,
          subtotalAmount: updatedCart.cost.subtotalAmount
        }
      }
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Cart creation error:', error);

    let errorMessage = 'Failed to create cart';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;

      // Handle specific Shopify API errors
      if (errorMessage.includes('authentication') || errorMessage.includes('unauthorized')) {
        statusCode = 401;
      } else if (errorMessage.includes('rate limit')) {
        statusCode = 429;
      } else if (errorMessage.includes('not found') || errorMessage.includes('variant')) {
        statusCode = 404;
        errorMessage = 'One or more products are no longer available';
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage
      },
      { status: statusCode }
    );
  }
}