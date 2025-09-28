import { NextRequest, NextResponse } from 'next/server';
import { serverAddCartLines } from '@/lib/shopify-server';
import { getSecretCartId } from '@/app/api/cart/server-create/route';

// CRITICAL SECURITY: All cart operations happen server-side
// Cart secret IDs never exposed to client

interface AddCartLinesRequest {
  sessionId: string; // Safe client identifier
  lines: Array<{
    merchandiseId: string;
    quantity: number;
    attributes?: Array<{
      key: string;
      value: string;
    }>;
    sellingPlanId?: string; // For subscriptions
  }>;
}

interface AddCartLinesResponse {
  success: boolean;
  cart?: {
    sessionId: string;
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
    lineCount: number;
  };
  error?: string;
}

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(request: NextRequest): boolean {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  const key = `cart-lines-add:${ip}`;

  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 50; // Higher limit for line operations

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

export async function POST(request: NextRequest): Promise<NextResponse<AddCartLinesResponse>> {
  try {
    // Rate limiting
    if (!checkRateLimit(request)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded. Please try again later.'
        },
        { status: 429 }
      );
    }

    const body: AddCartLinesRequest = await request.json();

    // Validate request
    if (!body.sessionId || !body.lines || !Array.isArray(body.lines) || body.lines.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request: sessionId and lines array are required'
        },
        { status: 400 }
      );
    }

    // CRITICAL SECURITY: Retrieve secret cart ID server-side ONLY
    const secretCartId = getSecretCartId(body.sessionId);

    if (!secretCartId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid cart session. Please refresh your cart.'
        },
        { status: 404 }
      );
    }

    // Validate each line item
    for (const line of body.lines) {
      if (!line.merchandiseId || !line.quantity || line.quantity <= 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid line item: merchandiseId and positive quantity are required'
          },
          { status: 400 }
        );
      }

      // Validate quantity limits (enterprise-specific)
      if (line.quantity > 999) {
        return NextResponse.json(
          {
            success: false,
            error: 'Quantity exceeds maximum allowed (999)'
          },
          { status: 400 }
        );
      }
    }

    // Prepare cart lines for Shopify
    const cartLines = body.lines.map(line => ({
      merchandiseId: line.merchandiseId,
      quantity: line.quantity,
      ...(line.attributes && { attributes: line.attributes }),
      ...(line.sellingPlanId && { sellingPlanId: line.sellingPlanId })
    }));

    // Execute Shopify cartLinesAdd mutation
    const result = await serverAddCartLines(secretCartId, cartLines);

    if (result.cartLinesAdd.userErrors.length > 0) {
      const errorMessage = result.cartLinesAdd.userErrors
        .map(error => error.message)
        .join(', ');

      return NextResponse.json(
        {
          success: false,
          error: `Failed to add items: ${errorMessage}`
        },
        { status: 400 }
      );
    }

    const cart = result.cartLinesAdd.cart;

    // Return SAFE cart data to client (NO secret cart ID)
    const response: AddCartLinesResponse = {
      success: true,
      cart: {
        sessionId: body.sessionId, // Return the same safe session ID
        checkoutUrl: cart.checkoutUrl,
        totalQuantity: cart.totalQuantity || 0,
        cost: {
          totalAmount: cart.cost.totalAmount,
          subtotalAmount: cart.cost.subtotalAmount
        },
        lineCount: cart.lines.edges.length
      }
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Cart lines add error:', error);

    let errorMessage = 'Failed to add items to cart';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;

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