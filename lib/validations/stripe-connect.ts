/**
 * Stripe Connect Validation Schemas
 *
 * Zod schemas for validating Stripe Connect API requests
 * following patterns from existing validation files
 *
 * @see lib/validations/product.ts for reference patterns
 */

import { z } from 'zod';

// ========================================
// ACCOUNT SCHEMAS
// ========================================

/**
 * Schema for creating a Connect account
 */
export const CreateConnectAccountSchema = z.object({
  account_type: z.enum(['standard', 'express', 'custom'], 'Account type must be standard, express, or custom'),
  business_type: z.enum(['individual', 'company']).optional(),
  country: z
    .string()
    .length(2, { message: 'Country code must be 2 characters (ISO 3166-1 alpha-2)' })
    .toUpperCase()
    .optional(),
  email: z.string().email({ message: 'Invalid email address' }).optional(),
  business_name: z
    .string()
    .min(1, { message: 'Business name cannot be empty' })
    .max(255, { message: 'Business name must be 255 characters or less' })
    .optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

export type CreateConnectAccountInput = z.infer<typeof CreateConnectAccountSchema>;

/**
 * Schema for updating a Connect account
 */
export const UpdateConnectAccountSchema = z.object({
  business_name: z
    .string()
    .min(1, { message: 'Business name cannot be empty' })
    .max(255, { message: 'Business name must be 255 characters or less' })
    .optional(),
  email: z.string().email({ message: 'Invalid email address' }).optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

export type UpdateConnectAccountInput = z.infer<typeof UpdateConnectAccountSchema>;

/**
 * Schema for creating an onboarding link
 */
export const CreateOnboardingLinkSchema = z.object({
  account_id: z.string().uuid({ message: 'Invalid account ID format' }),
  refresh_url: z.string().url({ message: 'Invalid refresh URL' }).optional(),
  return_url: z.string().url({ message: 'Invalid return URL' }).optional(),
});

export type CreateOnboardingLinkInput = z.infer<typeof CreateOnboardingLinkSchema>;

// ========================================
// ACCOUNT SESSION SCHEMAS
// ========================================

/**
 * Available embedded component types
 */
const EmbeddedComponentTypeEnum = z.enum([
  'payments',
  'payouts',
  'documents',
  'account_management',
  'notification_banner',
  'account_onboarding',
]);

/**
 * Schema for creating an account session
 */
export const CreateAccountSessionSchema = z.object({
  account_id: z.string().uuid({ message: 'Invalid account ID format' }),
  components: z
    .array(EmbeddedComponentTypeEnum)
    .min(1, { message: 'At least one component is required' })
    .max(6, { message: 'Maximum 6 components allowed' }),
});

export type CreateAccountSessionInput = z.infer<typeof CreateAccountSessionSchema>;

// ========================================
// TRANSFER SCHEMAS
// ========================================

/**
 * Schema for creating a transfer
 */
export const CreateTransferSchema = z
  .object({
    destination_account_id: z.string().uuid({ message: 'Invalid destination account ID' }),
    amount: z
      .number()
      .positive({ message: 'Amount must be greater than 0' })
      .multipleOf(0.01, { message: 'Amount must have at most 2 decimal places' })
      .max(999999.99, { message: 'Amount cannot exceed $999,999.99' }),
    currency: z
      .string()
      .length(3, { message: 'Currency must be 3-letter ISO code' })
      .toUpperCase()
      .default('USD'),
    source_transaction: z
      .string()
      .regex(/^(pi_|ch_)/, { message: 'Source transaction must be a payment intent or charge ID' })
      .optional(),
    application_fee_amount: z
      .number()
      .nonnegative({ message: 'Application fee cannot be negative' })
      .multipleOf(0.01, { message: 'Application fee must have at most 2 decimal places' })
      .optional(),
    transfer_group: z
      .string()
      .max(255, { message: 'Transfer group must be 255 characters or less' })
      .optional(),
    description: z
      .string()
      .max(1000, { message: 'Description must be 1000 characters or less' })
      .optional(),
    metadata: z.record(z.string(), z.string()).optional(),
  })
  .refine(
    (data) => {
      // If application_fee_amount is provided, it must be less than amount
      if (data.application_fee_amount !== undefined) {
        return data.application_fee_amount < data.amount;
      }
      return true;
    },
    {
      message: 'Application fee must be less than transfer amount',
      path: ['application_fee_amount'],
    }
  );

export type CreateTransferInput = z.infer<typeof CreateTransferSchema>;

/**
 * Schema for listing transfers
 */
export const ListTransfersSchema = z.object({
  account_id: z.string().uuid({ message: 'Invalid account ID' }).optional(),
  status: z.enum(['pending', 'paid', 'failed', 'canceled']).optional(),
  limit: z
    .number()
    .int({ message: 'Limit must be an integer' })
    .positive({ message: 'Limit must be greater than 0' })
    .max(100, { message: 'Limit cannot exceed 100' })
    .default(20),
  cursor: z.string().optional(),
});

export type ListTransfersInput = z.infer<typeof ListTransfersSchema>;

// ========================================
// DASHBOARD LINK SCHEMA
// ========================================

/**
 * Schema for creating Express Dashboard link
 */
export const CreateDashboardLinkSchema = z.object({
  account_id: z.string().uuid({ message: 'Invalid account ID format' }),
});

export type CreateDashboardLinkInput = z.infer<typeof CreateDashboardLinkSchema>;

// ========================================
// WEBHOOK SCHEMAS
// ========================================

/**
 * Schema for validating account.updated webhook payload
 */
export const AccountUpdatedWebhookSchema = z.object({
  id: z.string(),
  object: z.literal('event'),
  type: z.literal('account.updated'),
  data: z.object({
    object: z.object({
      id: z.string(),
      object: z.literal('account'),
      business_type: z.enum(['individual', 'company']).nullable(),
      capabilities: z.record(z.string(), z.string()).optional(),
      charges_enabled: z.boolean(),
      payouts_enabled: z.boolean(),
      details_submitted: z.boolean(),
      requirements: z.record(z.string(), z.unknown()).optional(),
    }),
    previous_attributes: z.record(z.string(), z.unknown()).optional(),
  }),
});

/**
 * Schema for validating transfer webhook payload
 */
export const TransferWebhookSchema = z.object({
  id: z.string(),
  object: z.literal('event'),
  type: z.enum(['transfer.created', 'transfer.updated', 'transfer.failed']),
  data: z.object({
    object: z.object({
      id: z.string(),
      object: z.literal('transfer'),
      amount: z.number(),
      currency: z.string(),
      destination: z.string(),
      source_transaction: z.string().nullable(),
      transfer_group: z.string().nullable(),
    }),
  }),
});

// ========================================
// FORM VALIDATION SCHEMAS (for frontend)
// ========================================

/**
 * Schema for onboarding form
 */
export const OnboardingFormSchema = z.object({
  account_type: z.enum(['standard', 'express', 'custom']),
  business_type: z.enum(['individual', 'company']),
  country: z
    .string()
    .length(2, { message: 'Country code must be 2 characters' })
    .toUpperCase(),
  business_name: z
    .string()
    .min(1, { message: 'Business name is required' })
    .max(255, { message: 'Business name must be 255 characters or less' })
    .optional(),
  email: z
    .string()
    .email({ message: 'Invalid email address' })
    .optional(),
  agree_to_terms: z
    .boolean()
    .refine((val) => val === true, {
      message: 'You must agree to the terms and conditions',
    }),
});

export type OnboardingFormInput = z.infer<typeof OnboardingFormSchema>;

/**
 * Schema for transfer form
 */
export const TransferFormSchema = z
  .object({
    destination_account_id: z.string().uuid({ message: 'Invalid account ID' }),
    amount: z
      .number()
      .positive({ message: 'Amount must be greater than 0' })
      .multipleOf(0.01, { message: 'Amount must have at most 2 decimal places' }),
    currency: z
      .string()
      .length(3, { message: 'Currency must be 3-letter code' })
      .toUpperCase()
      .default('USD'),
    description: z
      .string()
      .max(1000, { message: 'Description must be 1000 characters or less' })
      .optional(),
    application_fee_percentage: z
      .number()
      .min(0, { message: 'Fee percentage cannot be negative' })
      .max(100, { message: 'Fee percentage cannot exceed 100' })
      .optional(),
  })
  .transform((data) => {
    // Calculate application fee amount if percentage is provided
    if (data.application_fee_percentage !== undefined) {
      const feeAmount = (data.amount * data.application_fee_percentage) / 100;
      return {
        ...data,
        application_fee_amount: Math.round(feeAmount * 100) / 100, // Round to 2 decimals
      };
    }
    return data;
  });

export type TransferFormInput = z.infer<typeof TransferFormSchema>;

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Validate Stripe account ID format
 */
export const validateStripeAccountId = (id: string): boolean => {
  return /^acct_[a-zA-Z0-9]{16,}$/.test(id);
};

/**
 * Validate Stripe transfer ID format
 */
export const validateStripeTransferId = (id: string): boolean => {
  return /^tr_[a-zA-Z0-9]{16,}$/.test(id);
};

/**
 * Validate currency code (ISO 4217)
 */
export const validateCurrencyCode = (code: string): boolean => {
  const validCurrencies = [
    'USD',
    'EUR',
    'GBP',
    'CAD',
    'AUD',
    'JPY',
    'CNY',
    'INR',
    'BRL',
    'MXN',
  ];
  return validCurrencies.includes(code.toUpperCase());
};

/**
 * Validate country code (ISO 3166-1 alpha-2)
 */
export const validateCountryCode = (code: string): boolean => {
  return /^[A-Z]{2}$/.test(code);
};
