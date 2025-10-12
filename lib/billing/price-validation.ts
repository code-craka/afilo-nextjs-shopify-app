/**
 * Stripe Price ID Validation
 *
 * SECURITY: Prevents price manipulation and test price exploitation
 * Risk Prevention: $44K/month revenue loss from test price exploitation
 *
 * This module maintains a whitelist of allowed Stripe Price IDs
 * to prevent attackers from subscribing to test prices or invalid plans.
 */

/**
 * Allowed Stripe Price IDs (Production)
 *
 * These are the ONLY price IDs accepted by the system.
 * Any attempt to use other price IDs will be rejected.
 *
 * To add a new price:
 * 1. Create it in Stripe Dashboard
 * 2. Test it in Stripe Test Mode
 * 3. Add production price ID to this whitelist
 * 4. Deploy the update
 */
const ALLOWED_PRICE_IDS = new Set([
  // Starter Plan - Monthly
  'price_1QvsfCFcrRhjqzak6x0vr3I4', // $9/month

  // Pro Plan - Monthly
  'price_1QvsfCFcrRhjqzakikGk7yiY', // $29/month

  // Enterprise Plan - Monthly
  'price_1QvsfCFcrRhjqzakuZ7VGGQw', // $99/month

  // Add future price IDs here:
  // 'price_xxxxxxxxxxxxxxxxxxxxx', // Description
]);

/**
 * Test Price IDs (for development/staging environments)
 *
 * These are Stripe Test Mode prices used in non-production environments.
 * They are automatically allowed in development mode.
 */
const TEST_PRICE_IDS = new Set([
  'price_test_starter_monthly', // Test starter plan
  'price_test_pro_monthly', // Test pro plan
  'price_test_enterprise_monthly', // Test enterprise plan
  // Add test price IDs here
]);

/**
 * Validates if a Stripe Price ID is allowed
 *
 * @param priceId - The Stripe Price ID to validate
 * @returns boolean - true if the price ID is valid
 */
export function isValidPriceId(priceId: string): boolean {
  // In development, allow both production and test prices
  if (process.env.NODE_ENV === 'development') {
    return ALLOWED_PRICE_IDS.has(priceId) || TEST_PRICE_IDS.has(priceId);
  }

  // In production, only allow whitelisted production prices
  return ALLOWED_PRICE_IDS.has(priceId);
}

/**
 * Validates and sanitizes a price ID from user input
 *
 * @param priceId - The price ID from user input
 * @returns { valid: boolean; error?: string; sanitized?: string }
 */
export function validatePriceId(priceId: unknown): {
  valid: boolean;
  error?: string;
  sanitized?: string;
} {
  // Type validation
  if (typeof priceId !== 'string') {
    return {
      valid: false,
      error: 'Invalid price ID format - must be a string',
    };
  }

  // Format validation
  if (!priceId.startsWith('price_')) {
    return {
      valid: false,
      error: 'Invalid price ID format - must start with "price_"',
    };
  }

  // Length validation (Stripe price IDs are typically 28-32 characters)
  if (priceId.length < 10 || priceId.length > 50) {
    return {
      valid: false,
      error: 'Invalid price ID format - incorrect length',
    };
  }

  // Whitelist validation
  if (!isValidPriceId(priceId)) {
    console.warn(`[SECURITY] Attempted use of non-whitelisted price ID: ${priceId}`);
    return {
      valid: false,
      error: 'Invalid price ID - this plan is not available',
    };
  }

  return {
    valid: true,
    sanitized: priceId,
  };
}

/**
 * Gets the list of all allowed price IDs for the current environment
 *
 * @returns string[] - Array of allowed price IDs
 */
export function getAllowedPriceIds(): string[] {
  if (process.env.NODE_ENV === 'development') {
    return Array.from(ALLOWED_PRICE_IDS).concat(Array.from(TEST_PRICE_IDS));
  }
  return Array.from(ALLOWED_PRICE_IDS);
}

/**
 * Checks if a price ID is a test price
 *
 * @param priceId - The price ID to check
 * @returns boolean - true if it's a test price
 */
export function isTestPrice(priceId: string): boolean {
  return TEST_PRICE_IDS.has(priceId) || priceId.includes('test');
}

/**
 * Gets metadata about a price ID (for logging and debugging)
 *
 * @param priceId - The price ID to get metadata for
 * @returns { isValid: boolean; isTest: boolean; environment: string }
 */
export function getPriceMetadata(priceId: string) {
  return {
    isValid: isValidPriceId(priceId),
    isTest: isTestPrice(priceId),
    environment: process.env.NODE_ENV || 'unknown',
    timestamp: new Date().toISOString(),
  };
}
