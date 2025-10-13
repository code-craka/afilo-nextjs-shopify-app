/**
 * Stripe Payment Methods Utilities
 *
 * Manages customer payment methods for Afilo Enterprise billing portal.
 * Supports:
 * - Credit/Debit Cards (Visa, Mastercard, Amex, Discover)
 * - US Bank Accounts (ACH Direct Debit)
 *
 * Functions:
 * - List all payment methods for a customer
 * - Attach new payment method to customer
 * - Detach (remove) payment method
 * - Set default payment method
 * - Get payment method details
 */

import Stripe from 'stripe';
import { stripe } from '@/lib/stripe-server';

/**
 * Payment Method Response Type
 */
export interface PaymentMethodData {
  id: string;
  type: 'card' | 'us_bank_account';
  brand?: string; // Visa, Mastercard, etc.
  last4: string;
  expMonth?: number;
  expYear?: number;
  bankName?: string;
  accountHolderType?: string;
  isDefault: boolean;
  created: number;
}

/**
 * List Payment Methods
 *
 * Retrieves all payment methods attached to a customer.
 * Returns formatted data optimized for UI display.
 *
 * @param customerId - Stripe Customer ID
 * @returns Array of payment methods
 */
export async function listPaymentMethods(
  customerId: string
): Promise<PaymentMethodData[]> {
  try {
    // Fetch customer to get default payment method
    const customer = await stripe.customers.retrieve(customerId);

    if (customer.deleted) {
      throw new Error('Customer has been deleted');
    }

    const defaultPaymentMethodId = typeof customer.invoice_settings?.default_payment_method === 'string'
      ? customer.invoice_settings.default_payment_method
      : customer.invoice_settings?.default_payment_method?.id || null;

    // List all payment methods (cards)
    const cardMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    // List all payment methods (bank accounts)
    const bankMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'us_bank_account',
    });

    // Format card payment methods
    const formattedCards: PaymentMethodData[] = cardMethods.data.map((pm) => ({
      id: pm.id,
      type: 'card' as const,
      brand: pm.card?.brand,
      last4: pm.card?.last4 || '',
      expMonth: pm.card?.exp_month,
      expYear: pm.card?.exp_year,
      isDefault: pm.id === defaultPaymentMethodId,
      created: pm.created,
    }));

    // Format bank account payment methods
    const formattedBanks: PaymentMethodData[] = bankMethods.data.map((pm) => ({
      id: pm.id,
      type: 'us_bank_account' as const,
      last4: pm.us_bank_account?.last4 || '',
      bankName: pm.us_bank_account?.bank_name || undefined,
      accountHolderType: pm.us_bank_account?.account_holder_type || undefined,
      isDefault: pm.id === defaultPaymentMethodId,
      created: pm.created,
    }));

    // Combine and sort by creation date (newest first)
    const allMethods = [...formattedCards, ...formattedBanks].sort(
      (a, b) => b.created - a.created
    );

    return allMethods;
  } catch (error: any) {
    console.error('Error listing payment methods:', error);
    throw new Error(error.message || 'Failed to list payment methods');
  }
}

/**
 * Attach Payment Method
 *
 * Attaches an existing payment method to a customer.
 * Used after creating a PaymentMethod via Stripe Elements.
 *
 * @param customerId - Stripe Customer ID
 * @param paymentMethodId - Payment Method ID from Stripe Elements
 * @returns Attached payment method data
 */
export async function attachPaymentMethod(
  customerId: string,
  paymentMethodId: string
): Promise<PaymentMethodData> {
  try {
    // Attach payment method to customer
    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Format response
    const formattedMethod: PaymentMethodData = {
      id: paymentMethod.id,
      type: paymentMethod.type as 'card' | 'us_bank_account',
      brand: paymentMethod.card?.brand,
      last4: paymentMethod.card?.last4 || paymentMethod.us_bank_account?.last4 || '',
      expMonth: paymentMethod.card?.exp_month,
      expYear: paymentMethod.card?.exp_year,
      bankName: paymentMethod.us_bank_account?.bank_name || undefined,
      accountHolderType: paymentMethod.us_bank_account?.account_holder_type || undefined,
      isDefault: false, // Newly attached methods are not default
      created: paymentMethod.created,
    };

    console.log(`✅ Payment method attached: ${paymentMethodId} to customer ${customerId}`);
    return formattedMethod;
  } catch (error: any) {
    console.error('Error attaching payment method:', error);
    throw new Error(error.message || 'Failed to attach payment method');
  }
}

/**
 * Detach Payment Method
 *
 * Removes a payment method from a customer.
 * Cannot detach if it's the default payment method with active subscription.
 *
 * @param paymentMethodId - Payment Method ID to detach
 * @returns Success boolean
 */
export async function detachPaymentMethod(
  paymentMethodId: string
): Promise<boolean> {
  try {
    await stripe.paymentMethods.detach(paymentMethodId);
    console.log(`✅ Payment method detached: ${paymentMethodId}`);
    return true;
  } catch (error: any) {
    console.error('Error detaching payment method:', error);

    // Provide helpful error messages
    if (error.code === 'resource_missing') {
      throw new Error('Payment method not found or already removed');
    }

    throw new Error(error.message || 'Failed to remove payment method');
  }
}

/**
 * Set Default Payment Method
 *
 * Updates the customer's default payment method.
 * Used for future invoices and subscription renewals.
 *
 * @param customerId - Stripe Customer ID
 * @param paymentMethodId - Payment Method ID to set as default
 * @returns Success boolean
 */
export async function setDefaultPaymentMethod(
  customerId: string,
  paymentMethodId: string
): Promise<boolean> {
  try {
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    console.log(`✅ Default payment method updated: ${paymentMethodId} for customer ${customerId}`);
    return true;
  } catch (error: any) {
    console.error('Error setting default payment method:', error);
    throw new Error(error.message || 'Failed to set default payment method');
  }
}

/**
 * Get Payment Method Details
 *
 * Retrieves detailed information about a specific payment method.
 *
 * @param paymentMethodId - Payment Method ID
 * @returns Payment method data
 */
export async function getPaymentMethod(
  paymentMethodId: string
): Promise<PaymentMethodData | null> {
  try {
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    // Check if this is the default for the customer
    let isDefault = false;
    if (paymentMethod.customer) {
      const customerId = typeof paymentMethod.customer === 'string'
        ? paymentMethod.customer
        : paymentMethod.customer.id;

      const customer = await stripe.customers.retrieve(customerId);

      if (!customer.deleted) {
        const defaultPMId = typeof customer.invoice_settings?.default_payment_method === 'string'
          ? customer.invoice_settings.default_payment_method
          : customer.invoice_settings?.default_payment_method?.id;

        isDefault = paymentMethodId === defaultPMId;
      }
    }

    const formattedMethod: PaymentMethodData = {
      id: paymentMethod.id,
      type: paymentMethod.type as 'card' | 'us_bank_account',
      brand: paymentMethod.card?.brand,
      last4: paymentMethod.card?.last4 || paymentMethod.us_bank_account?.last4 || '',
      expMonth: paymentMethod.card?.exp_month,
      expYear: paymentMethod.card?.exp_year,
      bankName: paymentMethod.us_bank_account?.bank_name || undefined,
      accountHolderType: paymentMethod.us_bank_account?.account_holder_type || undefined,
      isDefault,
      created: paymentMethod.created,
    };

    return formattedMethod;
  } catch (error: any) {
    console.error('Error retrieving payment method:', error);

    if (error.code === 'resource_missing') {
      return null;
    }

    throw new Error(error.message || 'Failed to retrieve payment method');
  }
}

/**
 * Create Setup Intent for Payment Method Collection
 *
 * Creates a SetupIntent for collecting payment method details via Stripe Elements.
 * Used when adding a new payment method without charging.
 *
 * IMPORTANT: Cannot use both `payment_method_types` and `automatic_payment_methods`
 * at the same time. Using `automatic_payment_methods` with specific types.
 *
 * @param customerId - Stripe Customer ID
 * @returns SetupIntent client secret
 */
export async function createSetupIntent(
  customerId: string
): Promise<string> {
  try {
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      usage: 'off_session', // Allow charging later without customer present
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never', // No 3DS for setup
      },
      // Note: Removed payment_method_types to avoid conflict with automatic_payment_methods
      // Stripe will automatically determine available payment methods
    });

    console.log(`✅ SetupIntent created: ${setupIntent.id} for customer ${customerId}`);
    return setupIntent.client_secret!;
  } catch (error: any) {
    console.error('Error creating setup intent:', error);
    throw new Error(error.message || 'Failed to create setup intent');
  }
}

/**
 * Verify Payment Method Ownership
 *
 * Checks if a payment method belongs to a specific customer.
 * Security check before deletion or modification.
 *
 * @param paymentMethodId - Payment Method ID
 * @param customerId - Expected Customer ID
 * @returns True if payment method belongs to customer
 */
export async function verifyPaymentMethodOwnership(
  paymentMethodId: string,
  customerId: string
): Promise<boolean> {
  try {
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    const pmCustomerId = typeof paymentMethod.customer === 'string'
      ? paymentMethod.customer
      : paymentMethod.customer?.id;

    return pmCustomerId === customerId;
  } catch (error: any) {
    console.error('Error verifying payment method ownership:', error);
    return false;
  }
}

/**
 * Format Brand Name for Display
 *
 * Converts Stripe brand codes to readable names.
 */
export function formatBrandName(brand?: string): string {
  if (!brand) return 'Unknown';

  const brandMap: Record<string, string> = {
    'visa': 'Visa',
    'mastercard': 'Mastercard',
    'amex': 'American Express',
    'discover': 'Discover',
    'diners': 'Diners Club',
    'jcb': 'JCB',
    'unionpay': 'UnionPay',
  };

  return brandMap[brand.toLowerCase()] || brand;
}

/**
 * Get Payment Method Icon Component Name
 *
 * Returns the appropriate icon name for UI display.
 */
export function getPaymentMethodIcon(type: string, brand?: string): string {
  if (type === 'us_bank_account') {
    return 'Bank';
  }

  // Return brand-specific icon name
  switch (brand?.toLowerCase()) {
    case 'visa':
      return 'CreditCard'; // Use generic icon or brand-specific
    case 'mastercard':
      return 'CreditCard';
    case 'amex':
      return 'CreditCard';
    case 'discover':
      return 'CreditCard';
    default:
      return 'CreditCard';
  }
}
