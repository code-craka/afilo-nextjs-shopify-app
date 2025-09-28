import { NextRequest, NextResponse } from 'next/server';
import { shopifyFetch } from '@/lib/shopify-server';

// CRITICAL SECURITY: Cart secret keys NEVER exposed to client
// Official Shopify Warning: "Never expose the secret part of the ID. Treat it like a password"

interface SecureCartCreateRequest {
  lineItems?: Array<{
    merchandiseId: string;
    quantity: number;
    attributes?: Array<{
      key: string;
      value: string;
    }>;
    sellingPlanId?: string; // For subscriptions
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
    customerAccessToken?: string;
  };
  metafields?: Array<{
    key: string;
    value: string;
    type: string;
    namespace: string;
  }>;
}

interface SecureCartResponse {
  success: boolean;
  cart?: {
    sessionId: string; // Safe client identifier (NOT the secret cart ID)
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

// Server-side cart storage (in production, use Redis/Database)
// CRITICAL: Cart secret IDs stored server-side ONLY
const cartSecretStorage = new Map<string, {
  secretCartId: string;
  createdAt: number;
  lastAccessed: number;
}>();

// Generate safe session ID for client
function generateSafeSessionId(): string {
  return `cart_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Clean up expired cart sessions (30 minutes)
function cleanupExpiredCarts() {
  const now = Date.now();
  const expiry = 30 * 60 * 1000; // 30 minutes

  for (const [sessionId, data] of cartSecretStorage.entries()) {
    if (now - data.lastAccessed > expiry) {
      cartSecretStorage.delete(sessionId);
    }
  }
}

// Run cleanup periodically
setInterval(cleanupExpiredCarts, 5 * 60 * 1000); // Every 5 minutes

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(request: NextRequest): boolean {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  const key = `cart-create:${ip}`;

  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 10; // Conservative limit for cart creation

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

export async function POST(request: NextRequest): Promise<NextResponse<SecureCartResponse>> {
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

    const body: SecureCartCreateRequest = await request.json();

    // Official Shopify cartCreate mutation
    const CART_CREATE_MUTATION = `
      mutation cartCreate($input: CartInput!) {
        cartCreate(input: $input) {
          cart {
            id
            checkoutUrl
            totalQuantity
            createdAt
            updatedAt
            cost {
              totalAmount {
                amount
                currencyCode
              }
              subtotalAmount {
                amount
                currencyCode
              }
              totalTaxAmount {
                amount
                currencyCode
              }
            }
            lines(first: 250) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      price {
                        amount
                        currencyCode
                      }
                      product {
                        id
                        title
                        handle
                      }
                    }
                  }
                  cost {
                    totalAmount {
                      amount
                      currencyCode
                    }
                  }
                  attributes {
                    key
                    value
                  }
                }
              }
            }
            attributes {
              key
              value
            }
            buyerIdentity {
              email
              phone
              customer {
                id
              }
              countryCode
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    // Prepare cart input according to Shopify specification
    const cartInput: Record<string, unknown> = {};

    if (body.lineItems && body.lineItems.length > 0) {
      cartInput.lines = body.lineItems.map(item => ({
        merchandiseId: item.merchandiseId,
        quantity: item.quantity,
        ...(item.attributes && { attributes: item.attributes }),
        ...(item.sellingPlanId && { sellingPlanId: item.sellingPlanId })
      }));
    }

    if (body.customAttributes) {
      cartInput.attributes = body.customAttributes;
    }

    if (body.note) {
      cartInput.note = body.note;
    }

    if (body.buyerIdentity) {
      cartInput.buyerIdentity = body.buyerIdentity;
    }

    if (body.metafields) {
      cartInput.metafields = body.metafields;
    }

    // Execute Shopify cartCreate mutation
    const result = await shopifyFetch<{
      cartCreate: {
        cart: {
          id: string;
          checkoutUrl: string;
          totalQuantity: number;
          cost: {
            totalAmount: { amount: string; currencyCode: string };
            subtotalAmount: { amount: string; currencyCode: string };
          };
          lines: {
            edges: Array<{ node: { id: string } }>;
          };
        };
        userErrors: Array<{ field?: string[]; message: string }>;
      };
    }>(CART_CREATE_MUTATION, { input: cartInput });

    if (result.cartCreate.userErrors.length > 0) {
      const errorMessage = result.cartCreate.userErrors
        .map(error => error.message)
        .join(', ');

      return NextResponse.json(
        {
          success: false,
          error: `Cart creation failed: ${errorMessage}`
        },
        { status: 400 }
      );
    }

    const cart = result.cartCreate.cart;

    // CRITICAL SECURITY: Store secret cart ID server-side ONLY
    const safeSessionId = generateSafeSessionId();
    const now = Date.now();

    cartSecretStorage.set(safeSessionId, {
      secretCartId: cart.id, // Secret cart ID NEVER sent to client
      createdAt: now,
      lastAccessed: now
    });

    // Return SAFE cart data to client (NO secret cart ID)
    const response: SecureCartResponse = {
      success: true,
      cart: {
        sessionId: safeSessionId, // Safe identifier for client
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
    console.error('Secure cart creation error:', error);

    let errorMessage = 'Failed to create cart';
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

// Helper function to retrieve secret cart ID (server-side only)
export function getSecretCartId(sessionId: string): string | null {
  const cartData = cartSecretStorage.get(sessionId);

  if (!cartData) {
    return null;
  }

  // Update last accessed time
  cartData.lastAccessed = Date.now();
  return cartData.secretCartId;
}

// Helper function to remove cart session
export function removeCartSession(sessionId: string): void {
  cartSecretStorage.delete(sessionId);
}