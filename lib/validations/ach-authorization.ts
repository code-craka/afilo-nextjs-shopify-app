/**
 * ACH Authorization Validation Schemas
 *
 * NACHA-compliant validation for ACH Direct Debit authorizations
 * Ensures all required fields are captured for legal compliance
 *
 * @see https://www.nacha.org/rules/authorization-requirements
 */

import { z } from 'zod';

/**
 * Main ACH Authorization Schema
 * Validates all customer input for ACH payment authorization
 */
export const ACHAuthorizationSchema = z.object({
  // Bank Account Details
  accountHolderName: z
    .string()
    .min(2, { message: 'Account holder name must be at least 2 characters' })
    .max(100, { message: 'Account holder name must be less than 100 characters' })
    .regex(/^[a-zA-Z\s'-]+$/, { message: 'Account holder name contains invalid characters' }),

  routingNumber: z
    .string()
    .length(9, { message: 'Routing number must be exactly 9 digits' })
    .regex(/^\d{9}$/, { message: 'Routing number must contain only digits' }),

  accountNumber: z
    .string()
    .min(4, { message: 'Account number must be at least 4 digits' })
    .max(17, { message: 'Account number must be less than 17 digits' })
    .regex(/^\d+$/, { message: 'Account number must contain only digits' }),

  accountType: z.enum(['checking', 'savings'], {
    message: 'Account type must be either checking or savings'
  }),

  // Authorization Type
  authorizationType: z.enum(['one_time', 'recurring', 'both'], {
    message: 'Invalid authorization type'
  }),

  // For one-time payments
  paymentAmount: z
    .number()
    .positive({ message: 'Payment amount must be greater than 0' })
    .max(999999.99, { message: 'Payment amount exceeds maximum allowed' })
    .optional(),

  invoiceId: z
    .string()
    .max(255, { message: 'Invoice ID too long' })
    .optional(),

  // For recurring payments
  recurringFrequency: z
    .enum(['daily', 'weekly', 'monthly', 'yearly'])
    .optional(),

  recurringMaxAmount: z
    .number()
    .positive({ message: 'Maximum recurring amount must be greater than 0' })
    .max(999999.99, { message: 'Maximum recurring amount exceeds allowed limit' })
    .optional(),

  subscriptionId: z
    .string()
    .max(255, { message: 'Subscription ID too long' })
    .optional(),

  // Consent Requirements (NACHA mandated)
  acceptedTerms: z.literal(true, {
    message: 'You must accept the ACH authorization terms'
  }),

  acceptedPrivacy: z.literal(true, {
    message: 'You must accept the privacy policy'
  }),

  electronicSignature: z
    .string()
    .min(2, { message: 'Electronic signature required (type your full name)' })
    .max(100, { message: 'Electronic signature too long' }),

  // Transaction Context
  transactionDescription: z
    .string()
    .min(10, { message: 'Transaction description must be at least 10 characters' })
    .max(500, { message: 'Transaction description too long' }),
}).refine(
  (data) => {
    // If one_time, require payment amount
    if (data.authorizationType === 'one_time' && !data.paymentAmount) {
      return false;
    }
    // If recurring, require frequency and max amount
    if (data.authorizationType === 'recurring') {
      return !!(data.recurringFrequency && data.recurringMaxAmount);
    }
    // If both, require all fields
    if (data.authorizationType === 'both') {
      return !!(data.paymentAmount && data.recurringFrequency && data.recurringMaxAmount);
    }
    return true;
  },
  {
    message: 'Missing required fields for authorization type',
    path: ['authorizationType']
  }
);

/**
 * TypeScript type derived from schema
 */
export type ACHAuthorizationInput = z.infer<typeof ACHAuthorizationSchema>;

/**
 * Authorization Revocation Schema
 * Validates customer revocation requests
 */
export const ACHRevocationSchema = z.object({
  authorizationId: z.string().uuid({ message: 'Invalid authorization ID' }),
  revocationReason: z
    .string()
    .min(10, { message: 'Please provide a reason for revocation (minimum 10 characters)' })
    .max(500, { message: 'Revocation reason too long' })
    .optional(),
  confirmRevocation: z.literal(true, {
    message: 'You must confirm revocation'
  })
});

export type ACHRevocationInput = z.infer<typeof ACHRevocationSchema>;

/**
 * Server-side Authorization Processing Schema
 * Additional fields captured server-side that aren't from user input
 */
export const ACHAuthorizationServerSchema = ACHAuthorizationSchema.extend({
  // Server-captured metadata
  ipAddress: z.string().regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^(?:[a-fA-F0-9:]+:+)+[a-fA-F0-9]+$/, {
    message: 'Invalid IP address format'
  }).optional(),
  userAgent: z.string().optional(),
  clerkUserId: z.string(),
  customerEmail: z.string().email(),

  // Stripe integration
  stripePaymentMethodId: z.string().optional(),
  stripeMandateId: z.string().optional(),

  // Mandate text (generated server-side)
  mandateText: z.string(),

  // Version tracking
  termsVersion: z.string(),
  refundPolicyVersion: z.string(),
});

export type ACHAuthorizationServerInput = z.infer<typeof ACHAuthorizationServerSchema>;

/**
 * Helper function to validate routing number checksum
 * Uses the ABA routing number algorithm
 */
export function validateRoutingNumber(routingNumber: string): boolean {
  if (!/^\d{9}$/.test(routingNumber)) return false;

  const digits = routingNumber.split('').map(Number);
  const checksum = (
    3 * (digits[0] + digits[3] + digits[6]) +
    7 * (digits[1] + digits[4] + digits[7]) +
    (digits[2] + digits[5] + digits[8])
  ) % 10;

  return checksum === 0;
}

/**
 * Generate NACHA-compliant mandate text
 */
export function generateMandateText(input: {
  authorizationType: string;
  paymentAmount?: number;
  recurringFrequency?: string;
  recurringMaxAmount?: number;
  isRecurring: boolean;
}): string {
  const today = new Date().toLocaleDateString('en-US');
  const time = new Date().toLocaleTimeString('en-US');

  return `
ACH AUTHORIZATION AGREEMENT

I authorize TechSci, Inc. (operating the Afilo platform) to electronically debit my bank account
${input.isRecurring ? 'for recurring subscription payments' : 'for the one-time payment'} described below.

${!input.isRecurring && input.paymentAmount ? `Payment Amount: $${input.paymentAmount.toFixed(2)}` : ''}
${input.isRecurring ? `Recurring Frequency: ${input.recurringFrequency || 'Monthly'} subscription billing` : ''}
${input.isRecurring && input.recurringMaxAmount ? `Maximum Amount Per Transaction: $${input.recurringMaxAmount.toFixed(2)}` : ''}

BANK ACCOUNT INFORMATION:
The bank account information I provide will be used to process ${input.isRecurring ? 'recurring' : 'one-time'} ACH debits.

AUTHORIZATION:
By providing my electronic signature below, I authorize TechSci, Inc. and its payment processor
(Stripe, Inc.) to initiate ${input.isRecurring ? 'recurring debit entries' : 'a debit entry'} to my bank account
for the purpose described above.

${input.isRecurring ? `
RECURRING PAYMENT TERMS:
- Billing Frequency: ${input.recurringFrequency || 'Monthly'} on subscription anniversary date
- First Payment: Within 1-3 business days
- Subsequent Payments: ${input.recurringFrequency || 'Monthly'} until subscription is cancelled
- Cancellation: I may cancel this authorization by contacting billing@techsci.io at least 3 business days before the next scheduled payment
` : ''}

REFUND POLICY:
This payment is subject to our 14-day money-back guarantee for new customers. See full refund policy at: https://app.afilo.io/legal/refund-policy

REVOCATION:
I may revoke this authorization by contacting TechSci, Inc. at:
- Email: billing@techsci.io
- Phone: +1 302 415 3171
- Mail: 1111B S Governors Ave STE 34002, Dover, DE 19904

Revocation must be received at least 3 business days before the scheduled payment date.

DISPUTES:
If I believe an error has occurred, I will contact my financial institution within 60 days of the
transaction appearing on my statement.

By signing electronically below, I acknowledge that I have read and agree to these terms and
authorize TechSci, Inc. to process ACH transactions as described.

Date: ${today}
Time: ${time}
IP Address: [Captured automatically]
`.trim();
}
