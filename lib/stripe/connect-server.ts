/**
 * Stripe Connect Server Utilities
 *
 * Server-side utilities for Stripe Connect operations
 * following patterns from lib/stripe-server.ts
 *
 * Features:
 * - Account creation and management
 * - Onboarding link generation
 * - Transfer creation and management
 * - Dashboard link generation
 * - Account session creation for embedded components
 *
 * @see https://stripe.com/docs/connect
 */

import Stripe from 'stripe';
import { stripe } from '@/lib/stripe-server';
import type {
  ConnectAccountType,
  BusinessType,
  CreateConnectAccountRequest,
  CreateOnboardingLinkRequest,
  CreateAccountSessionRequest,
  CreateTransferRequest,
} from '@/types/stripe-connect';

// ========================================
// CONSTANTS
// ========================================

/**
 * Default return URL for onboarding
 */
export const DEFAULT_RETURN_URL = `${process.env.NEXT_PUBLIC_APP_URL}/merchant/dashboard`;

/**
 * Default refresh URL for onboarding
 */
export const DEFAULT_REFRESH_URL = `${process.env.NEXT_PUBLIC_APP_URL}/merchant/onboard`;

/**
 * Account session expiration time (in seconds)
 * Default: 1 hour
 */
export const ACCOUNT_SESSION_EXPIRATION = 3600;

/**
 * Onboarding link expiration time (in seconds)
 * Default: 30 minutes
 */
export const ONBOARDING_LINK_EXPIRATION = 1800;

/**
 * Supported embedded component types
 */
export const EMBEDDED_COMPONENT_TYPES = [
  'payments',
  'payouts',
  'documents',
  'account_management',
  'notification_banner',
  'account_onboarding',
] as const;

// ========================================
// ACCOUNT CREATION & MANAGEMENT
// ========================================

/**
 * Create a new Stripe Connect account
 *
 * @param request - Account creation request
 * @returns Promise<Stripe.Account>
 */
export async function createConnectAccount(
  request: CreateConnectAccountRequest
): Promise<Stripe.Account> {
  const { account_type, business_type, country, email, business_name, metadata } = request;

  const accountParams: Stripe.AccountCreateParams = {
    type: account_type,
    country: country || 'US',
    email,
    metadata: {
      ...metadata,
      created_via: 'afilo_platform',
      created_at: new Date().toISOString(),
    },
  };

  // Add business profile if provided
  if (business_name) {
    accountParams.business_profile = {
      name: business_name,
    };
  }

  // Add business type for Express accounts
  if (account_type === 'express' && business_type) {
    accountParams.business_type = business_type;
  }

  // Set capabilities based on account type
  if (account_type === 'express' || account_type === 'custom') {
    accountParams.capabilities = {
      card_payments: { requested: true },
      transfers: { requested: true },
    };
  }

  const account = await stripe.accounts.create(accountParams);
  return account;
}

/**
 * Retrieve a Connect account by ID
 *
 * @param accountId - Stripe account ID
 * @returns Promise<Stripe.Account>
 */
export async function getConnectAccount(accountId: string): Promise<Stripe.Account> {
  return await stripe.accounts.retrieve(accountId);
}

/**
 * Update a Connect account
 *
 * @param accountId - Stripe account ID
 * @param updates - Fields to update
 * @returns Promise<Stripe.Account>
 */
export async function updateConnectAccount(
  accountId: string,
  updates: Stripe.AccountUpdateParams
): Promise<Stripe.Account> {
  return await stripe.accounts.update(accountId, updates);
}

/**
 * Delete a Connect account
 *
 * @param accountId - Stripe account ID
 * @returns Promise<Stripe.DeletedAccount>
 */
export async function deleteConnectAccount(accountId: string): Promise<Stripe.DeletedAccount> {
  return await stripe.accounts.del(accountId);
}

// ========================================
// ONBOARDING
// ========================================

/**
 * Create an Account Link for onboarding
 *
 * @param request - Onboarding link request
 * @returns Promise<Stripe.AccountLink>
 */
export async function createAccountLink(
  request: CreateOnboardingLinkRequest
): Promise<Stripe.AccountLink> {
  const { account_id, refresh_url, return_url } = request;

  // Get account to determine type
  const account = await getConnectAccount(account_id);

  const linkParams: Stripe.AccountLinkCreateParams = {
    account: account_id,
    refresh_url: refresh_url || DEFAULT_REFRESH_URL,
    return_url: return_url || DEFAULT_RETURN_URL,
    type: account.type === 'standard' ? 'account_onboarding' : 'account_onboarding',
  };

  return await stripe.accountLinks.create(linkParams);
}

/**
 * Check if account onboarding is complete
 *
 * @param accountId - Stripe account ID
 * @returns Promise<boolean>
 */
export async function isOnboardingComplete(accountId: string): Promise<boolean> {
  const account = await getConnectAccount(accountId);

  return (
    account.charges_enabled === true &&
    account.payouts_enabled === true &&
    account.details_submitted === true
  );
}

/**
 * Get account onboarding requirements
 *
 * @param accountId - Stripe account ID
 * @returns Promise<Stripe.Account.Requirements>
 */
export async function getAccountRequirements(
  accountId: string
): Promise<Stripe.Account.Requirements> {
  const account = await getConnectAccount(accountId);
  return (account.requirements as Stripe.Account.Requirements) || {
    currently_due: [],
    eventually_due: [],
    past_due: [],
    pending_verification: [],
    alternatives: null,
    current_deadline: null,
    disabled_reason: null,
    errors: [],
  } as Stripe.Account.Requirements;
}

// ========================================
// ACCOUNT SESSIONS (for embedded components)
// ========================================

/**
 * Create an Account Session for embedded components
 *
 * @param request - Account session request
 * @returns Promise<Stripe.AccountSession>
 */
export async function createAccountSession(
  request: CreateAccountSessionRequest
): Promise<Stripe.AccountSession> {
  const { account_id, components } = request;

  // Build components object for Stripe
  const componentsObject: Record<string, { enabled: boolean }> = {};
  components.forEach((component) => {
    componentsObject[component] = { enabled: true };
  });

  const session = await stripe.accountSessions.create({
    account: account_id,
    components: componentsObject as Stripe.AccountSessionCreateParams.Components,
  });

  return session;
}

// ========================================
// EXPRESS DASHBOARD
// ========================================

/**
 * Create a login link for Express Dashboard
 *
 * @param accountId - Stripe account ID
 * @returns Promise<Stripe.LoginLink>
 */
export async function createDashboardLink(accountId: string): Promise<Stripe.LoginLink> {
  return await stripe.accounts.createLoginLink(accountId);
}

// ========================================
// TRANSFERS
// ========================================

/**
 * Create a transfer to a Connected account
 *
 * @param request - Transfer creation request
 * @returns Promise<Stripe.Transfer>
 */
export async function createTransfer(request: CreateTransferRequest): Promise<Stripe.Transfer> {
  const {
    destination_account_id,
    amount,
    currency = 'USD',
    source_transaction,
    application_fee_amount,
    transfer_group,
    description,
    metadata,
  } = request;

  // Convert amount to cents (Stripe uses smallest currency unit)
  const amountInCents = Math.round(amount * 100);
  const feeInCents = application_fee_amount
    ? Math.round(application_fee_amount * 100)
    : undefined;

  const transferParams: Stripe.TransferCreateParams = {
    amount: amountInCents,
    currency: currency.toLowerCase(),
    destination: destination_account_id,
    description,
    metadata: {
      ...metadata,
      created_via: 'afilo_platform',
      created_at: new Date().toISOString(),
    },
  };

  if (source_transaction) {
    transferParams.source_transaction = source_transaction;
  }

  // Note: application_fee_amount is not supported for direct transfers
  // Fees for Connect transfers should be handled via destination_payment
  if (feeInCents) {
    console.warn('Application fees for direct transfers should be handled via destination_payment');
  }

  if (transfer_group) {
    transferParams.transfer_group = transfer_group;
  }

  return await stripe.transfers.create(transferParams);
}

/**
 * Retrieve a transfer by ID
 *
 * @param transferId - Stripe transfer ID
 * @returns Promise<Stripe.Transfer>
 */
export async function getTransfer(transferId: string): Promise<Stripe.Transfer> {
  return await stripe.transfers.retrieve(transferId);
}

/**
 * List transfers with filters
 *
 * @param params - Filter parameters
 * @returns Promise<Stripe.ApiList<Stripe.Transfer>>
 */
export async function listTransfers(
  params?: Stripe.TransferListParams
): Promise<Stripe.ApiList<Stripe.Transfer>> {
  return await stripe.transfers.list(params);
}

/**
 * Reverse a transfer
 *
 * @param transferId - Stripe transfer ID
 * @param amount - Amount to reverse (optional, defaults to full amount)
 * @returns Promise<Stripe.TransferReversal>
 */
export async function reverseTransfer(
  transferId: string,
  amount?: number
): Promise<Stripe.TransferReversal> {
  const params: { amount?: number; metadata?: Stripe.MetadataParam } = {};

  if (amount) {
    params.amount = Math.round(amount * 100);
  }

  return await stripe.transfers.createReversal(transferId, params);
}

// ========================================
// BALANCE & PAYOUTS
// ========================================

/**
 * Get account balance
 *
 * @param accountId - Stripe account ID
 * @returns Promise<Stripe.Balance>
 */
export async function getAccountBalance(accountId: string): Promise<Stripe.Balance> {
  return await stripe.balance.retrieve({
    stripeAccount: accountId,
  });
}

/**
 * List payouts for an account
 *
 * @param accountId - Stripe account ID
 * @param params - Filter parameters
 * @returns Promise<Stripe.ApiList<Stripe.Payout>>
 */
export async function listPayouts(
  accountId: string,
  params?: Stripe.PayoutListParams
): Promise<Stripe.ApiList<Stripe.Payout>> {
  return await stripe.payouts.list({
    ...params,
    stripeAccount: accountId,
  });
}

// ========================================
// CAPABILITIES
// ========================================

/**
 * Get account capabilities
 *
 * @param accountId - Stripe account ID
 * @returns Promise<Record<string, string>>
 */
export async function getAccountCapabilities(
  accountId: string
): Promise<Record<string, string>> {
  const account = await getConnectAccount(accountId);
  return (account.capabilities as Record<string, string>) || {};
}

/**
 * Request a capability for an account
 *
 * @param accountId - Stripe account ID
 * @param capability - Capability name
 * @returns Promise<Stripe.Capability>
 */
export async function requestCapability(
  accountId: string,
  capability: string
): Promise<Stripe.Capability> {
  return await stripe.accounts.updateCapability(accountId, capability, {
    requested: true,
  });
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Format amount for display (cents to dollars)
 *
 * @param cents - Amount in cents
 * @param currency - Currency code
 * @returns string
 */
export function formatAmount(cents: number, currency: string = 'USD'): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(dollars);
}

/**
 * Parse amount to cents
 *
 * @param dollars - Amount in dollars
 * @returns number
 */
export function parseAmountToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Validate Connect account type
 *
 * @param type - Account type
 * @returns boolean
 */
export function isValidAccountType(type: string): type is ConnectAccountType {
  return ['standard', 'express', 'custom'].includes(type);
}

/**
 * Validate business type
 *
 * @param type - Business type
 * @returns boolean
 */
export function isValidBusinessType(type: string): type is BusinessType {
  return ['individual', 'company'].includes(type);
}

/**
 * Get account status summary
 *
 * @param account - Stripe Account object
 * @returns object
 */
export function getAccountStatusSummary(account: Stripe.Account) {
  return {
    id: account.id,
    type: account.type,
    charges_enabled: account.charges_enabled,
    payouts_enabled: account.payouts_enabled,
    details_submitted: account.details_submitted,
    is_ready: account.charges_enabled && account.payouts_enabled && account.details_submitted,
    requirements_due: account.requirements?.currently_due?.length || 0,
    past_due: account.requirements?.past_due?.length || 0,
  };
}
