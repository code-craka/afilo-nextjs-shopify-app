import { loadStripe, Stripe } from '@stripe/stripe-js';

/**
 * Stripe Browser Client for Afilo Enterprise Marketplace
 *
 * This singleton pattern ensures Stripe.js is only loaded once,
 * improving performance and preventing duplicate API calls.
 *
 * Features:
 * - Lazy loading of Stripe.js
 * - Automatic publishable key validation
 * - TypeScript type safety
 * - Support for Payment Element (Card + ACH)
 * - Adaptive 3D Secure handling
 *
 * @see https://stripe.com/docs/js
 */

let stripePromise: Promise<Stripe | null>;

/**
 * Get Stripe.js instance
 *
 * Creates a singleton instance of Stripe.js on first call.
 * Subsequent calls return the same promise for better performance.
 *
 * @throws {Error} If NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set
 * @returns Promise<Stripe | null>
 *
 * @example
 * const stripe = await getStripe();
 * if (stripe) {
 *   // Use stripe instance
 * }
 */
export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!key) {
      throw new Error(
        'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set in environment variables. ' +
        'Please add it to your .env.local file.'
      );
    }

    // Validate publishable key format
    if (!key.startsWith('pk_')) {
      throw new Error(
        'Invalid Stripe publishable key format. ' +
        'Publishable keys must start with "pk_".'
      );
    }

    // Load Stripe.js with enterprise configuration
    stripePromise = loadStripe(key, {
      // Optional: Locale for payment form UI
      locale: 'en',

      // Optional: Stripe API version (matches server-side and stripe package v19.0.0)
      // NOTE: Must match stripe-server.ts apiVersion
      apiVersion: '2025-09-30.clover',
    });
  }

  return stripePromise;
};

/**
 * Payment Element Appearance Configuration
 *
 * Customizes the Stripe Payment Element to match Afilo's
 * enterprise design system with dark gradients and premium feel.
 */
export const stripeAppearance = {
  theme: 'stripe' as const,

  variables: {
    // Brand colors
    colorPrimary: '#0F172A',          // Dark slate (matches Afilo theme)
    colorBackground: '#ffffff',
    colorText: '#1E293B',
    colorDanger: '#EF4444',
    colorSuccess: '#10B981',

    // Typography
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSizeBase: '16px',
    fontWeightNormal: '400',
    fontWeightMedium: '500',
    fontWeightBold: '600',

    // Spacing
    spacingUnit: '4px',
    borderRadius: '8px',

    // Borders
    borderColor: '#E2E8F0',
    borderWidth: '1px',

    // Focus states
    focusBoxShadow: '0 0 0 3px rgba(15, 23, 42, 0.1)',
    focusOutline: '2px solid #0F172A',
  },

  rules: {
    '.Tab': {
      border: '1px solid #E2E8F0',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      transition: 'all 0.2s ease',
    },

    '.Tab:hover': {
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      borderColor: '#0F172A',
    },

    '.Tab--selected': {
      borderColor: '#0F172A',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      backgroundColor: '#F8FAFC',
    },

    '.Input': {
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      transition: 'all 0.2s ease',
    },

    '.Input:focus': {
      boxShadow: '0 0 0 3px rgba(15, 23, 42, 0.1)',
      borderColor: '#0F172A',
    },

    '.Label': {
      fontWeight: '500',
      color: '#475569',
      marginBottom: '8px',
    },
  },
};

/**
 * Payment Element Options
 *
 * Configures the Payment Element behavior for ACH + Card payments.
 */
export const paymentElementOptions = {
  layout: 'tabs' as const,  // Shows Card and Bank Account as tabs

  // Optional: Default values (can be overridden per component)
  defaultValues: {
    billingDetails: {
      email: '', // Will be set dynamically
    },
  },

  // Optional: Business configuration
  business: {
    name: 'Afilo Enterprise Marketplace',
  },

  // Optional: Terms configuration
  terms: {
    card: 'auto' as const,      // Auto-show terms when required
    usBankAccount: 'auto' as const,
  },
};

/**
 * Helper: Check if Stripe is loaded
 *
 * Useful for conditional rendering in components.
 *
 * @example
 * if (!stripe || !elements) {
 *   return <div>Loading...</div>;
 * }
 */
export const isStripeLoaded = (stripe: Stripe | null): stripe is Stripe => {
  return stripe !== null;
};

/**
 * Error Messages for User Display
 *
 * Maps common Stripe error codes to user-friendly messages.
 */
export const STRIPE_ERROR_MESSAGES: Record<string, string> = {
  // Card errors
  card_declined: 'Your card was declined. Please try a different payment method.',
  insufficient_funds: 'Insufficient funds. Please use a different payment method.',
  lost_card: 'This card has been reported lost. Please use a different card.',
  stolen_card: 'This card has been reported stolen. Please use a different card.',
  expired_card: 'Your card has expired. Please use a different card.',
  incorrect_cvc: 'The card security code is incorrect. Please check and try again.',
  incorrect_number: 'The card number is incorrect. Please check and try again.',
  processing_error: 'An error occurred while processing your card. Please try again.',

  // Bank account errors
  account_closed: 'This bank account has been closed. Please use a different account.',
  account_frozen: 'This bank account is frozen. Please use a different account.',
  bank_account_unusable: 'This bank account cannot be used. Please use a different account.',
  insufficient_funds_bank: 'Insufficient funds in your bank account.',

  // 3D Secure errors
  authentication_required: 'Additional authentication is required. Please complete verification.',
  authentication_failed: 'Authentication failed. Please try again or use a different payment method.',

  // General errors
  payment_intent_authentication_failure: 'Payment authentication failed. Please try again.',
  payment_method_not_available: 'This payment method is not available. Please use a different method.',
  rate_limit: 'Too many payment attempts. Please try again in a few minutes.',

  // Default
  default: 'An unexpected error occurred. Please try again or contact support.',
};

/**
 * Helper: Get user-friendly error message
 *
 * @param errorCode Stripe error code
 * @returns User-friendly error message
 */
export function getStripeErrorMessage(errorCode?: string): string {
  if (!errorCode) {
    return STRIPE_ERROR_MESSAGES.default;
  }

  return STRIPE_ERROR_MESSAGES[errorCode] || STRIPE_ERROR_MESSAGES.default;
}

/**
 * Helper: Format card brand for display
 */
export function formatCardBrand(brand: string): string {
  const brands: Record<string, string> = {
    visa: 'Visa',
    mastercard: 'Mastercard',
    amex: 'American Express',
    discover: 'Discover',
    diners: 'Diners Club',
    jcb: 'JCB',
    unionpay: 'UnionPay',
  };

  return brands[brand.toLowerCase()] || brand;
}

/**
 * Helper: Format last 4 digits
 *
 * @example
 * formatLast4('1234') // "•••• 1234"
 */
export function formatLast4(last4: string): string {
  return `•••• ${last4}`;
}
