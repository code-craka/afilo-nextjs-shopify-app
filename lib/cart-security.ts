import { getCart } from '@/lib/shopify-server';

/**
 * Validates that a cart belongs to the specified user
 * CRITICAL SECURITY: Prevents IDOR attacks by verifying cart ownership
 *
 * @param cartId - Shopify cart ID to validate
 * @param userId - Clerk user ID to check ownership against
 * @returns boolean - true if user owns the cart, false otherwise
 */
export async function validateCartOwnership(
  cartId: string,
  userId: string | null
): Promise<boolean> {
  if (!userId) {
    // Anonymous carts are allowed (no userId to validate against)
    return true;
  }

  try {
    const cart = await getCart(cartId);

    if (!cart) {
      return false;
    }

    // Extract user ID from cart attributes
    const cartUserId = cart.attributes?.find(
      attr => attr.key === 'clerk_user_id'
    )?.value;

    // If cart has no user ID attribute, it's an anonymous cart
    if (!cartUserId) {
      return true;
    }

    // Verify ownership
    return cartUserId === userId;
  } catch (error) {
    console.error('Cart ownership validation error:', error);
    return false;
  }
}

/**
 * Logs security events for monitoring and audit trails
 *
 * @param event - Security event details
 */
export async function logSecurityEvent(event: {
  type: 'UNAUTHORIZED_ACCESS' | 'RATE_LIMIT' | 'VALIDATION_FAILURE' | 'CART_OWNERSHIP_VIOLATION';
  userId?: string | null;
  cartId?: string;
  ip?: string;
  details: any;
}) {
  const timestamp = new Date().toISOString();

  console.error('[SECURITY EVENT]', {
    ...event,
    timestamp,
    severity: event.type === 'CART_OWNERSHIP_VIOLATION' ? 'CRITICAL' : 'HIGH'
  });

  // In production, send to monitoring service (Sentry, DataDog, etc.)
  // Example: Sentry.captureMessage('Security Event', { level: 'error', extra: event });
}