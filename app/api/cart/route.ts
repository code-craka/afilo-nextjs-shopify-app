import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createCart, addCartLines, getCart, removeCartLines } from '@/lib/shopify-server';
import { validateCartOwnership, logSecurityEvent } from '@/lib/cart-security';
import { cartRateLimit, checkRateLimit, getRateLimitIdentifier, getClientIp } from '@/lib/rate-limit';

// GET - Fetch cart
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(request.url);
    const cartId = searchParams.get('cartId');

    if (!cartId) {
      return NextResponse.json({ error: 'Missing cartId' }, { status: 400 });
    }

    // 🔒 CRITICAL SECURITY FIX: Validate cart ownership before fetching
    const hasAccess = await validateCartOwnership(cartId, userId);

    if (!hasAccess) {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

      await logSecurityEvent({
        type: 'CART_OWNERSHIP_VIOLATION',
        userId,
        cartId,
        ip,
        details: {
          action: 'GET',
          message: 'Attempted to access cart without ownership'
        }
      });

      return NextResponse.json(
        { error: 'Unauthorized: You do not have access to this cart' },
        { status: 403 }
      );
    }

    const cart = await getCart(cartId);

    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, cart });
  } catch (error) {
    console.error('GET /api/cart error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

// POST - Create cart or add items
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();

    // 🚀 Distributed rate limiting with Upstash Redis
    const ip = getClientIp(request);
    const identifier = getRateLimitIdentifier(userId, ip);
    const rateLimit = await checkRateLimit(identifier, cartRateLimit);

    if (!rateLimit.success) {
      await logSecurityEvent({
        type: 'RATE_LIMIT',
        userId,
        ip,
        details: {
          endpoint: 'POST /api/cart',
          limit: rateLimit.limit,
          reset: rateLimit.reset
        }
      });

      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        {
          status: 429,
          headers: rateLimit.headers
        }
      );
    }

    const body = await request.json();
    const { cartId, lineItems, note, customAttributes, noteAttributes } = body;

    // Detect if this is a validation request (from Phase 6 implementation)
    if (body.items && !lineItems) {
      // This is a cart validation request
      return handleCartValidation(body, userId);
    }

    // Validate request
    if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: lineItems required' },
        { status: 400 }
      );
    }

    // Validate line items
    for (const item of lineItems) {
      if (!item.merchandiseId || !item.quantity || item.quantity <= 0) {
        return NextResponse.json(
          { error: 'Invalid line item: merchandiseId and quantity required' },
          { status: 400 }
        );
      }
    }

    let cart;

    if (cartId) {
      // 🔒 CRITICAL SECURITY FIX: Validate cart ownership before modifying
      const hasAccess = await validateCartOwnership(cartId, userId);

      if (!hasAccess) {
        await logSecurityEvent({
          type: 'CART_OWNERSHIP_VIOLATION',
          userId,
          cartId,
          ip,
          details: {
            action: 'POST (add items)',
            message: 'Attempted to modify cart without ownership'
          }
        });

        return NextResponse.json(
          { error: 'Unauthorized: You do not have access to this cart' },
          { status: 403 }
        );
      }

      // Add to existing cart
      cart = await addCartLines(cartId, lineItems);
    } else {
      // Create new cart
      const cartInput: any = {
        lines: lineItems.map((item: any) => ({
          merchandiseId: item.variantId || item.merchandiseId,
          quantity: item.quantity,
          ...(item.attributes && { attributes: item.attributes }),
          ...(item.customAttributes && { attributes: item.customAttributes })
        })),
        ...(note && { note }),
        ...(customAttributes && { attributes: customAttributes }),
        ...(noteAttributes && { noteAttributes })
      };

      // CRITICAL: Add user ID for webhook processing if authenticated
      if (userId) {
        cartInput.attributes = [
          ...(cartInput.attributes || []),
          { key: 'clerk_user_id', value: userId }
        ];
        cartInput.noteAttributes = [
          ...(cartInput.noteAttributes || []),
          { name: 'clerk_user_id', value: userId }
        ];
      }

      cart = await createCart(cartInput);
    }

    return NextResponse.json({ success: true, cart });

  } catch (error) {
    console.error('POST /api/cart error:', error);
    return NextResponse.json(
      { error: 'Cart operation failed' },
      { status: 500 }
    );
  }
}

// DELETE - Remove cart lines
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    const { cartId, lineIds } = await request.json();

    if (!cartId || !lineIds || !Array.isArray(lineIds)) {
      return NextResponse.json(
        { error: 'Invalid request: cartId and lineIds required' },
        { status: 400 }
      );
    }

    // 🔒 CRITICAL SECURITY FIX: Validate cart ownership before deletion
    const hasAccess = await validateCartOwnership(cartId, userId);

    if (!hasAccess) {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

      await logSecurityEvent({
        type: 'CART_OWNERSHIP_VIOLATION',
        userId,
        cartId,
        ip,
        details: {
          action: 'DELETE',
          lineIds,
          message: 'Attempted to delete cart items without ownership'
        }
      });

      return NextResponse.json(
        { error: 'Unauthorized: You do not have access to this cart' },
        { status: 403 }
      );
    }

    const cart = await removeCartLines(cartId, lineIds);

    return NextResponse.json({ success: true, cart });

  } catch (error) {
    console.error('DELETE /api/cart error:', error);
    return NextResponse.json(
      { error: 'Failed to remove items' },
      { status: 500 }
    );
  }
}

// Helper function to handle cart validation (from Phase 6)
async function handleCartValidation(body: any, userId: string | null) {
  try {
    const { items, userRegion } = body;

    // Basic validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({
        valid: false,
        error: 'Cart is empty'
      });
    }

    // Validate each item
    for (const item of items) {
      if (!item.productId || !item.variantId || !item.quantity || item.quantity <= 0) {
        return NextResponse.json({
          valid: false,
          error: 'Invalid cart item'
        });
      }
    }

    // For now, return valid - in a real app, you might check inventory, pricing, etc.
    return NextResponse.json({
      valid: true,
      message: 'Cart validation successful'
    });

  } catch (error) {
    console.error('Cart validation error:', error);
    return NextResponse.json({
      valid: false,
      error: 'Cart validation failed'
    }, { status: 500 });
  }
}