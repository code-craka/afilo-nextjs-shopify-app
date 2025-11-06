/**
 * Feature Flags
 *
 * Environment-based configuration for gradual feature rollout
 * This allows us to enable/disable features without redeploying
 */

/**
 * Feature flag configuration
 */
export const FEATURE_FLAGS = {
  // Stripe Accounts v2 API
  STRIPE_V2_ENABLED: process.env.ENABLE_STRIPE_V2 === 'true',

  // Adaptive Checkout (currency detection, payment method optimization)
  ADAPTIVE_CHECKOUT_ENABLED: process.env.ENABLE_ADAPTIVE_CHECKOUT === 'true',

  // Merchant/Marketplace features (future)
  MERCHANT_FEATURES_ENABLED: process.env.ENABLE_MERCHANT_FEATURES === 'true',

  // Enhanced customer portal (v2)
  ENHANCED_PORTAL_ENABLED: process.env.ENABLE_ENHANCED_PORTAL === 'true',

  // Multi-currency support
  MULTI_CURRENCY_ENABLED: process.env.ENABLE_MULTI_CURRENCY === 'true',

  // A/B Testing
  AB_TESTING_ENABLED: process.env.ENABLE_AB_TESTING === 'true',
} as const;

/**
 * Check if feature is enabled
 *
 * @param feature - Feature name
 * @returns Whether feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[feature];
}

/**
 * Get feature flag status report
 */
export function getFeatureFlagStatus() {
  return {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    flags: FEATURE_FLAGS,
  };
}

/**
 * Middleware/wrapper to conditionally execute code
 *
 * @example
 * if (withFeature('STRIPE_V2_ENABLED')) {
 *   // v2 code
 * } else {
 *   // v1 code (fallback)
 * }
 */
export function withFeature(
  feature: keyof typeof FEATURE_FLAGS,
  fn: () => Promise<any> | any
): Promise<any> | any {
  if (isFeatureEnabled(feature)) {
    return fn();
  }

  return null;
}

/**
 * Async feature wrapper
 *
 * @example
 * const result = await withFeatureAsync('STRIPE_V2_ENABLED', async () => {
 *   return await createV2Account();
 * });
 */
export async function withFeatureAsync(
  feature: keyof typeof FEATURE_FLAGS,
  fn: () => Promise<any>
): Promise<any> {
  if (isFeatureEnabled(feature)) {
    return await fn();
  }

  return null;
}

/**
 * Feature flag route middleware
 *
 * Usage in API routes:
 * ```typescript
 * import { requireFeature } from '@/lib/feature-flags';
 *
 * export async function POST(request: Request) {
 *   const response = requireFeature('STRIPE_V2_ENABLED');
 *   if (response) return response;
 *   // Your code here
 * }
 * ```
 */
export function requireFeature(feature: keyof typeof FEATURE_FLAGS) {
  if (!isFeatureEnabled(feature)) {
    return new Response(
      JSON.stringify({
        error: 'Feature not available',
        feature,
        message: `The ${feature} feature is not enabled`,
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  return null;
}

/**
 * Log feature flag usage
 */
export function logFeatureUsage(feature: keyof typeof FEATURE_FLAGS, action: string) {
  if (process.env.LOG_FEATURE_FLAGS === 'true') {
    console.log(`[FEATURE_FLAG] ${feature}: ${action}`, {
      enabled: isFeatureEnabled(feature),
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Environment variable defaults (for documentation)
 */
export const FEATURE_FLAG_DEFAULTS = {
  ENABLE_STRIPE_V2: 'false',
  ENABLE_ADAPTIVE_CHECKOUT: 'false',
  ENABLE_MERCHANT_FEATURES: 'false',
  ENABLE_ENHANCED_PORTAL: 'false',
  ENABLE_MULTI_CURRENCY: 'false',
  ENABLE_AB_TESTING: 'false',
  LOG_FEATURE_FLAGS: 'false',
} as const;

/**
 * Validation: Ensure required feature flags are set correctly
 */
export function validateFeatureFlags() {
  const errors: string[] = [];

  // Adaptive checkout requires multi-currency support
  if (
    isFeatureEnabled('ADAPTIVE_CHECKOUT_ENABLED') &&
    !isFeatureEnabled('MULTI_CURRENCY_ENABLED')
  ) {
    errors.push('ADAPTIVE_CHECKOUT_ENABLED requires ENABLE_MULTI_CURRENCY=true');
  }

  // Merchant features require v2
  if (
    isFeatureEnabled('MERCHANT_FEATURES_ENABLED') &&
    !isFeatureEnabled('STRIPE_V2_ENABLED')
  ) {
    errors.push('MERCHANT_FEATURES_ENABLED requires ENABLE_STRIPE_V2=true');
  }

  if (errors.length > 0) {
    console.warn('[FEATURE_FLAGS] Validation errors:', errors);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
