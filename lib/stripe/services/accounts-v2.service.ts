/**
 * Stripe Accounts v2 Management Service
 *
 * Handles all operations related to Stripe Accounts v2 API:
 * - Account creation (customer, merchant, or both)
 * - Account configuration and updates
 * - Account verification status
 * - Migration from v1 customers to v2 accounts
 * - Account linking with Clerk users
 *
 * @see https://stripe.com/docs/api/accounts
 */

import 'server-only';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe/config/stripe-server-v2';
import { updateUserStripeCustomerId } from '@/lib/clerk-utils';
import type {
  StripeAccountV2,
  CreateAccountV2Params,
  UpdateAccountV2Params,
  MigrateAccountV1ToV2Params,
  AccountVerificationStatus,
  CreateAccountV2Response,
  GetAccountStatusResponse,
  StripeAccountType,
  CustomerConfiguration,
  PortalSessionConfigV2,
} from '@/lib/stripe/types/stripe-accounts-v2.types';

/**
 * Stripe Accounts v2 Service
 */
export class StripeAccountsV2Service {
  /**
   * Create a new Accounts v2 account
   *
   * Supports three account types:
   * - "customer": Can purchase products
   * - "merchant": Can sell products (dormant until marketplace launch)
   * - "both": Can buy AND sell (future)
   *
   * @param params - Account creation parameters
   * @returns Created account details
   */
  static async createAccount(params: CreateAccountV2Params): Promise<CreateAccountV2Response> {
    try {
      console.log('[Accounts v2] Creating new account:', {
        type: params.type,
        email: params.email,
        country: params.country,
      });

      // TODO: Account configuration support requires Stripe SDK updates
      // The 'configuration' parameter is not yet available in the current Stripe SDK
      // For now, we'll store configuration preferences in metadata

      // Create account using Stripe API
      const account = await stripe.accounts.create({
        type: 'standard',
        email: params.email,
        country: params.country,
        default_currency: params.currency || 'usd',
        // TODO: configuration parameter - pending SDK update
        // configuration: { ... },
        metadata: {
          ...params.metadata,
          account_type: params.type,
          created_at: new Date().toISOString(),
          // Store configuration preferences in metadata for now
          customer_config: JSON.stringify(params.customer_config || {}),
          merchant_config: JSON.stringify(params.merchant_config || {}),
        },
      });

      console.log('[Accounts v2] Account created successfully:', account.id);

      return {
        success: true,
        account: account as unknown as StripeAccountV2,
        account_id: account.id,
        message: `${params.type.charAt(0).toUpperCase() + params.type.slice(1)} account created successfully`,
      };
    } catch (error) {
      console.error('[Accounts v2] Failed to create account:', error);

      throw new Error(
        `Failed to create Accounts v2: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Get account details
   *
   * @param accountId - Stripe account ID
   * @returns Account details
   */
  static async getAccount(accountId: string): Promise<StripeAccountV2> {
    try {
      const account = await stripe.accounts.retrieve(accountId) as any;

      return account as unknown as StripeAccountV2;
    } catch (error) {
      console.error('[Accounts v2] Failed to retrieve account:', error);

      throw new Error(
        `Failed to retrieve account ${accountId}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Update account configuration
   *
   * @param params - Update parameters
   * @returns Updated account
   */
  static async updateAccount(params: UpdateAccountV2Params): Promise<StripeAccountV2> {
    try {
      console.log('[Accounts v2] Updating account:', params.accountId);

      const updateData: any = {
        metadata: params.metadata,
      };

      // Update configuration if provided
      if (params.customer_config || params.merchant_config) {
        updateData.configuration = {};

        if (params.customer_config) {
          updateData.configuration.customer = params.customer_config;
        }

        if (params.merchant_config) {
          updateData.configuration.merchant = params.merchant_config;
        }
      }

      const account = await stripe.accounts.update(params.accountId, updateData) as any;

      console.log('[Accounts v2] Account updated successfully');

      return account as unknown as StripeAccountV2;
    } catch (error) {
      console.error('[Accounts v2] Failed to update account:', error);

      throw new Error(
        `Failed to update account: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Migrate existing Stripe v1 customer to Accounts v2
   *
   * Converts a legacy v1 customer to a v2 account, preserving payment methods
   * and subscription history.
   *
   * @param params - Migration parameters
   * @returns New v2 account
   */
  static async migrateCustomerToV2(params: MigrateAccountV1ToV2Params): Promise<StripeAccountV2> {
    try {
      console.log('[Accounts v2] Migrating customer to v2:', {
        old_customer_id: params.old_customer_id,
        account_type: params.account_type,
      });

      // Get existing customer details
      const oldCustomer = await stripe.customers.retrieve(params.old_customer_id);

      // Create new v2 account with customer's data
      const email = params.new_email || (oldCustomer as any).email;

      if (!email) {
        throw new Error('Customer email not found for migration');
      }

      // Get customer's default payment method if exists
      const defaultPaymentMethod = (oldCustomer as any).invoice_settings?.default_payment_method;

      // Create new account
      const newAccount = await this.createAccount({
        type: params.account_type,
        email,
        country: 'US', // TODO: Get from customer metadata or ask user
        currency: (oldCustomer as any).currency || 'usd',
        customer_config: {
          default_payment_method: defaultPaymentMethod,
        },
        metadata: {
          clerk_user_id: params.clerk_user_id,
          migrated_from_customer_id: params.old_customer_id,
          migrated_at: new Date().toISOString(),
        },
      });

      console.log('[Accounts v2] Migration successful:', newAccount.account_id);

      return newAccount.account as unknown as StripeAccountV2;
    } catch (error) {
      console.error('[Accounts v2] Migration failed:', error);

      throw new Error(
        `Failed to migrate customer to v2: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Get account verification status
   *
   * Returns what information is required for account verification
   *
   * @param accountId - Stripe account ID
   * @returns Verification status
   */
  static async getVerificationStatus(accountId: string): Promise<AccountVerificationStatus> {
    try {
      const account = await this.getAccount(accountId);

      return {
        account_id: accountId,
        status: (account.charges_enabled && account.payouts_enabled)
          ? 'verified'
          : account.charges_enabled
            ? 'pending'
            : 'unverified',
        missing_fields: account.requirements?.currently_due || [],
        deadline: account.requirements?.current_deadline
          ? new Date(account.requirements.current_deadline * 1000)
          : undefined,
        restrictions: account.requirements?.past_due,
      };
    } catch (error) {
      console.error('[Accounts v2] Failed to get verification status:', error);

      throw new Error(
        `Failed to get verification status: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Enable merchant capabilities on an account
   *
   * Called when user wants to start selling (marketplace launch)
   * This is dormant until marketplace feature is activated
   *
   * @param accountId - Stripe account ID
   * @returns Updated account
   */
  static async enableMerchantCapabilities(accountId: string): Promise<StripeAccountV2> {
    try {
      console.log('[Accounts v2] Enabling merchant capabilities:', accountId);

      // Get current account
      const account = await this.getAccount(accountId);

      // Add merchant configuration
      return await this.updateAccount({
        accountId,
        merchant_config: {
          business_profile: {
            name: (account as any).email, // Use email as default business name
            support_email: (account as any).email,
          },
          payout: {
            schedule: {
              interval: 'daily',
              delay_days: 1,
            },
          },
        },
      });
    } catch (error) {
      console.error('[Accounts v2] Failed to enable merchant capabilities:', error);

      throw new Error(
        `Failed to enable merchant capabilities: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Link v2 account with Clerk user
   *
   * Stores the Accounts v2 ID in Clerk user metadata for future reference
   *
   * @param clerkUserId - Clerk user ID
   * @param accountId - Stripe Accounts v2 ID
   * @returns Success status
   */
  static async linkAccountWithClerk(clerkUserId: string, accountId: string): Promise<boolean> {
    try {
      console.log('[Accounts v2] Linking account with Clerk:', {
        clerk_user_id: clerkUserId,
        account_id: accountId,
      });

      // Store account ID in Clerk metadata
      const success = await updateUserStripeCustomerId(clerkUserId, accountId);

      if (!success) {
        console.warn('[Accounts v2] Failed to update Clerk metadata');
      }

      return success;
    } catch (error) {
      console.error('[Accounts v2] Failed to link account with Clerk:', error);

      return false;
    }
  }

  /**
   * Get account status summary
   *
   * Returns overall account status with capabilities and configuration
   *
   * @param accountId - Stripe account ID
   * @returns Account status summary
   */
  static async getAccountStatus(accountId: string): Promise<GetAccountStatusResponse> {
    try {
      const account = await this.getAccount(accountId);
      const verification = await this.getVerificationStatus(accountId);

      return {
        account_id: accountId,
        account_type: (account.metadata?.account_type as StripeAccountType) || 'customer',
        status: verification.status,
        capabilities: {
          payments_enabled: account.charges_enabled,
          payouts_enabled: account.payouts_enabled,
        },
        verification,
        configuration: (account as any).configuration,
        created_at: new Date(account.created! * 1000),
        updated_at: new Date(), // Would need to track separately for actual updated time
      };
    } catch (error) {
      console.error('[Accounts v2] Failed to get account status:', error);

      throw new Error(
        `Failed to get account status: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Configure customer settings for account
   *
   * @param accountId - Stripe account ID
   * @param config - Customer configuration
   * @returns Updated account
   */
  static async configureCustomerSettings(
    accountId: string,
    config: CustomerConfiguration
  ): Promise<StripeAccountV2> {
    try {
      return await this.updateAccount({
        accountId,
        customer_config: config,
      });
    } catch (error) {
      console.error('[Accounts v2] Failed to configure customer settings:', error);

      throw new Error(
        `Failed to configure customer settings: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Update customer's default payment method
   *
   * @param accountId - Stripe account ID
   * @param paymentMethodId - Payment method ID
   * @returns Updated account
   */
  static async setDefaultPaymentMethod(
    accountId: string,
    paymentMethodId: string
  ): Promise<StripeAccountV2> {
    try {
      return await this.updateAccount({
        accountId,
        customer_config: {
          billing: {
            invoice: {},
            default_payment_method: paymentMethodId,
          },
        },
      });
    } catch (error) {
      console.error('[Accounts v2] Failed to set default payment method:', error);

      throw new Error(
        `Failed to set default payment method: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * List all accounts (for admin purposes)
   *
   * @param limit - Maximum number of accounts to return
   * @returns List of accounts
   */
  static async listAccounts(limit: number = 100): Promise<StripeAccountV2[]> {
    try {
      // Note: Cannot directly list accounts via Stripe API
      // Would need to implement tracking in local database
      console.log('[Accounts v2] Listing accounts requires database implementation');

      return [];
    } catch (error) {
      console.error('[Accounts v2] Failed to list accounts:', error);

      throw new Error(
        `Failed to list accounts: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Check account readiness for payments
   *
   * @param accountId - Stripe account ID
   * @returns Whether account can accept payments
   */
  static async isAccountReady(accountId: string): Promise<boolean> {
    try {
      const status = await this.getAccountStatus(accountId);

      return status.capabilities.payments_enabled;
    } catch (error) {
      console.error('[Accounts v2] Failed to check account readiness:', error);

      return false;
    }
  }

  /**
   * Check account readiness for payouts (merchant)
   *
   * @param accountId - Stripe account ID
   * @returns Whether account can receive payouts
   */
  static async isAccountPayoutReady(accountId: string): Promise<boolean> {
    try {
      const status = await this.getAccountStatus(accountId);

      return status.capabilities.payouts_enabled;
    } catch (error) {
      console.error('[Accounts v2] Failed to check payout readiness:', error);

      return false;
    }
  }
}

/**
 * Export singleton instance for convenience
 */
export const accountsV2Service = StripeAccountsV2Service;
