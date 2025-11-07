/**
 * Connect Accounts Service
 *
 * Business logic layer for Stripe Connect account operations
 * Following patterns from existing services (customer-portal-v2.service.ts)
 *
 * Responsibilities:
 * - Account creation and management
 * - Onboarding workflow
 * - Account status validation
 * - Database synchronization
 */

import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import {
  createConnectAccount,
  getConnectAccount,
  updateConnectAccount,
  createAccountLink,
  isOnboardingComplete,
  getAccountRequirements,
  createAccountSession,
  createDashboardLink,
  getAccountStatusSummary,
} from '@/lib/stripe/connect-server';
import type {
  CreateConnectAccountRequest,
  CreateOnboardingLinkRequest,
  CreateAccountSessionRequest,
  ConnectAccount,
  AccountRequirements,
  OnboardingStatus,
} from '@/types/stripe-connect';
import { createError } from '@/lib/utils/error-handling';

/**
 * Create a new Connect account and store in database
 *
 * @param clerkUserId - User's Clerk ID
 * @param request - Account creation request
 * @returns Promise<ConnectAccount>
 */
export async function createAndStoreConnectAccount(
  clerkUserId: string,
  request: CreateConnectAccountRequest
): Promise<ConnectAccount> {
  // 1. Create Stripe Connect account
  const stripeAccount = await createConnectAccount(request);

  // 2. Store in database
  const dbAccount = await prisma.stripe_connect_accounts.create({
    data: {
      clerk_user_id: clerkUserId,
      stripe_account_id: stripeAccount.id,
      account_type: request.account_type,
      business_type: request.business_type || null,
      country: stripeAccount.country || null,
      default_currency: stripeAccount.default_currency || 'USD',
      email: stripeAccount.email || null,
      business_name: stripeAccount.business_profile?.name || null,
      capabilities: stripeAccount.capabilities ? JSON.parse(JSON.stringify(stripeAccount.capabilities)) : null,
      requirements: stripeAccount.requirements ? JSON.parse(JSON.stringify(stripeAccount.requirements)) : null,
      charges_enabled: stripeAccount.charges_enabled || false,
      payouts_enabled: stripeAccount.payouts_enabled || false,
      details_submitted: stripeAccount.details_submitted || false,
      onboarding_status: 'pending',
      metadata: request.metadata || {},
    },
  });

  return dbAccount as ConnectAccount;
}

/**
 * Get Connect account from database
 *
 * @param accountId - Database account ID (UUID)
 * @returns Promise<ConnectAccount | null>
 */
export async function getConnectAccountFromDb(
  accountId: string
): Promise<ConnectAccount | null> {
  const account = await prisma.stripe_connect_accounts.findUnique({
    where: { id: accountId },
  });

  return account as ConnectAccount | null;
}

/**
 * Get Connect account by Stripe account ID
 *
 * @param stripeAccountId - Stripe account ID
 * @returns Promise<ConnectAccount | null>
 */
export async function getConnectAccountByStripeId(
  stripeAccountId: string
): Promise<ConnectAccount | null> {
  const account = await prisma.stripe_connect_accounts.findUnique({
    where: { stripe_account_id: stripeAccountId },
  });

  return account as ConnectAccount | null;
}

/**
 * Get Connect account by Clerk user ID
 *
 * @param clerkUserId - User's Clerk ID
 * @returns Promise<ConnectAccount | null>
 */
export async function getConnectAccountByClerkId(
  clerkUserId: string
): Promise<ConnectAccount | null> {
  const account = await prisma.stripe_connect_accounts.findFirst({
    where: { clerk_user_id: clerkUserId },
    orderBy: { created_at: 'desc' },
  });

  return account as ConnectAccount | null;
}

/**
 * Create onboarding link and update database
 *
 * @param accountId - Database account ID
 * @param request - Onboarding link request
 * @returns Promise<string> - Onboarding URL
 */
export async function createOnboardingLink(
  accountId: string,
  request: CreateOnboardingLinkRequest
): Promise<string> {
  // Get account from database
  const dbAccount = await getConnectAccountFromDb(accountId);
  if (!dbAccount) {
    throw createError.notFound('Connect account not found');
  }

  // Create onboarding link
  const accountLink = await createAccountLink({
    account_id: dbAccount.stripe_account_id,
    refresh_url: request.refresh_url,
    return_url: request.return_url,
  });

  // Update database with onboarding link and expiration
  await prisma.stripe_connect_accounts.update({
    where: { id: accountId },
    data: {
      onboarding_link: accountLink.url,
      onboarding_expires_at: new Date(accountLink.expires_at * 1000),
      onboarding_status: 'in_progress',
    },
  });

  return accountLink.url;
}

/**
 * Sync account status from Stripe to database
 *
 * @param accountId - Database account ID
 * @returns Promise<ConnectAccount>
 */
export async function syncAccountStatus(accountId: string): Promise<ConnectAccount> {
  // Get account from database
  const dbAccount = await getConnectAccountFromDb(accountId);
  if (!dbAccount) {
    throw createError.notFound('Connect account not found');
  }

  // Get latest data from Stripe
  const stripeAccount = await getConnectAccount(dbAccount.stripe_account_id);

  // Determine onboarding status
  let onboardingStatus: OnboardingStatus = 'pending';
  if (stripeAccount.charges_enabled && stripeAccount.payouts_enabled) {
    onboardingStatus = 'completed';
  } else if (stripeAccount.details_submitted) {
    onboardingStatus = 'in_progress';
  } else if (stripeAccount.requirements?.disabled_reason) {
    onboardingStatus = 'restricted';
  }

  // Update database
  const updatedAccount = await prisma.stripe_connect_accounts.update({
    where: { id: accountId },
    data: {
      capabilities: stripeAccount.capabilities ? JSON.parse(JSON.stringify(stripeAccount.capabilities)) : null,
      requirements: stripeAccount.requirements ? JSON.parse(JSON.stringify(stripeAccount.requirements)) : null,
      charges_enabled: stripeAccount.charges_enabled || false,
      payouts_enabled: stripeAccount.payouts_enabled || false,
      details_submitted: stripeAccount.details_submitted || false,
      onboarding_status: onboardingStatus,
      email: stripeAccount.email || dbAccount.email,
      business_name: stripeAccount.business_profile?.name || dbAccount.business_name,
      country: stripeAccount.country || dbAccount.country,
    },
  });

  return updatedAccount as ConnectAccount;
}

/**
 * Check if account is ready for operations
 *
 * @param accountId - Database account ID
 * @returns Promise<boolean>
 */
export async function isAccountReady(accountId: string): Promise<boolean> {
  const account = await getConnectAccountFromDb(accountId);
  if (!account) {
    return false;
  }

  return account.charges_enabled && account.payouts_enabled;
}

/**
 * Get account requirements
 *
 * @param accountId - Database account ID
 * @returns Promise<AccountRequirements>
 */
export async function getAccountRequirementsForAccount(
  accountId: string
): Promise<AccountRequirements> {
  const account = await getConnectAccountFromDb(accountId);
  if (!account) {
    throw createError.notFound('Connect account not found');
  }

  const stripeRequirements = await getAccountRequirements(account.stripe_account_id);

  // Map Stripe.Account.Requirements to AccountRequirements interface
  return {
    currently_due: stripeRequirements.currently_due || [],
    eventually_due: stripeRequirements.eventually_due || [],
    past_due: stripeRequirements.past_due || [],
    pending_verification: stripeRequirements.pending_verification || [],
    disabled_reason: stripeRequirements.disabled_reason || undefined,
    current_deadline: stripeRequirements.current_deadline || null,
  };
}

/**
 * Create account session for embedded components
 *
 * @param accountId - Database account ID
 * @param components - Components to enable
 * @returns Promise<{ client_secret: string; expires_at: Date }>
 */
export async function createAndStoreAccountSession(
  accountId: string,
  components: string[]
): Promise<{ client_secret: string; expires_at: Date }> {
  // Get account from database
  const account = await getConnectAccountFromDb(accountId);
  if (!account) {
    throw createError.notFound('Connect account not found');
  }

  // Create account session with Stripe
  const session = await createAccountSession({
    account_id: account.stripe_account_id,
    components: components as any,
  });

  // Calculate expiration (Stripe sessions expire in 1 hour)
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  // Store session in database
  await prisma.connect_account_sessions.create({
    data: {
      account_id: accountId,
      stripe_account_id: account.stripe_account_id,
      client_secret: session.client_secret,
      components: components,
      expires_at: expiresAt,
    },
  });

  return {
    client_secret: session.client_secret,
    expires_at: expiresAt,
  };
}

/**
 * Create Express Dashboard link
 *
 * @param accountId - Database account ID
 * @returns Promise<string> - Dashboard URL
 */
export async function createDashboardLinkForAccount(accountId: string): Promise<string> {
  const account = await getConnectAccountFromDb(accountId);
  if (!account) {
    throw createError.notFound('Connect account not found');
  }

  // Only Express accounts can use dashboard links
  if (account.account_type !== 'express') {
    throw createError.validation(
      'Dashboard links are only available for Express accounts'
    );
  }

  const loginLink = await createDashboardLink(account.stripe_account_id);
  return loginLink.url;
}

/**
 * Validate account ownership
 *
 * @param accountId - Database account ID
 * @param clerkUserId - User's Clerk ID
 * @returns Promise<boolean>
 */
export async function validateAccountOwnership(
  accountId: string,
  clerkUserId: string
): Promise<boolean> {
  const account = await getConnectAccountFromDb(accountId);
  if (!account) {
    return false;
  }

  return account.clerk_user_id === clerkUserId;
}

/**
 * List accounts for a user
 *
 * @param clerkUserId - User's Clerk ID
 * @returns Promise<ConnectAccount[]>
 */
export async function listAccountsForUser(clerkUserId: string): Promise<ConnectAccount[]> {
  const accounts = await prisma.stripe_connect_accounts.findMany({
    where: { clerk_user_id: clerkUserId },
    orderBy: { created_at: 'desc' },
  });

  return accounts as ConnectAccount[];
}

/**
 * Update account in database
 *
 * @param accountId - Database account ID
 * @param updates - Fields to update
 * @returns Promise<ConnectAccount>
 */
export async function updateConnectAccountInDb(
  accountId: string,
  updates: Partial<ConnectAccount>
): Promise<ConnectAccount> {
  const updatedAccount = await prisma.stripe_connect_accounts.update({
    where: { id: accountId },
    data: updates as any,
  });

  return updatedAccount as ConnectAccount;
}

/**
 * Delete account (soft delete by updating status)
 *
 * @param accountId - Database account ID
 * @returns Promise<void>
 */
export async function deleteConnectAccountFromDb(accountId: string): Promise<void> {
  // Soft delete by setting status to restricted
  await prisma.stripe_connect_accounts.update({
    where: { id: accountId },
    data: {
      onboarding_status: 'restricted',
    },
  });
}

/**
 * Store account session in database
 *
 * @param session - Session data to store
 * @returns Promise<void>
 */
export async function storeAccountSession(session: {
  account_id: string;
  stripe_account_id: string;
  client_secret: string;
  components: string[];
  expires_at: Date;
}): Promise<void> {
  await prisma.connect_account_sessions.create({
    data: {
      account_id: session.account_id,
      stripe_account_id: session.stripe_account_id,
      client_secret: session.client_secret,
      components: session.components,
      expires_at: session.expires_at,
    },
  });
}

/**
 * Clean up expired account sessions
 *
 * @returns Promise<number> - Number of sessions deleted
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await prisma.connect_account_sessions.deleteMany({
    where: {
      expires_at: {
        lt: new Date(),
      },
    },
  });

  return result.count;
}
