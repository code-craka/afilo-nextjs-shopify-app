/**
 * Stripe Accounts v2 API Type Definitions
 *
 * Complete TypeScript interfaces for Stripe Accounts v2 API, supporting:
 * - Customer accounts (current use: digital product buyers)
 * - Merchant accounts (future use: marketplace vendors)
 * - Combined accounts (both buyer and seller capabilities)
 *
 * @see https://stripe.com/docs/api/accounts
 */

import Stripe from 'stripe';

/**
 * Account Type: Determines capabilities
 * - "customer": Can purchase products (current)
 * - "merchant": Can sell products (future marketplace)
 * - "both": Can buy AND sell (future advanced)
 */
export type StripeAccountType = 'customer' | 'merchant' | 'both';

/**
 * Customer Configuration within Accounts v2
 * Manages billing settings, payment methods, invoices
 */
export interface CustomerConfiguration {
  // Billing settings
  billing: {
    // Invoice customization
    invoice: {
      // Custom fields to include on invoices
      custom_fields?: Array<{
        name: string;
        value: string;
      }>;
      // Footer text for invoices
      footer?: string;
      // Rendering options
      rendering_options?: {
        // For future use: custom invoice rendering
        amount_tax_display?: 'exclude' | 'include';
      };
    };
    // Default payment method for subscriptions
    default_payment_method?: string; // Payment method ID
    // Email options
    email_invoice?: boolean;
  };
  // Shipping information (for digital products, optional)
  shipping?: ShippingDetails;
  // Tax ID for invoice validation
  tax_ids?: string[]; // Tax ID objects
}

/**
 * Merchant Configuration within Accounts v2
 * Manages selling capabilities, payouts, verification
 * DORMANT until marketplace launch
 */
export interface MerchantConfiguration {
  // Merchant details
  business_profile?: {
    name?: string;
    url?: string; // Merchant's website
    support_email?: string;
    support_phone?: string;
    support_url?: string;
  };
  // Payout settings (when merchant starts earning)
  payout?: {
    // Default bank account for payouts
    debit_negative_balances?: boolean;
    schedule?: {
      delay_days?: number | 'minimum'; // 1-7 days or minimum
      interval?: 'daily' | 'weekly' | 'monthly';
      monthly_anchor?: number; // 1-31
      weekly_anchor?: 'friday' | 'monday' | 'thursday' | 'tuesday' | 'wednesday' | 'saturday' | 'sunday';
    };
  };
  // Verification for legal compliance
  verification?: {
    status?: 'unverified' | 'pending' | 'verified';
    disabled_reason?: string;
  };
}

/**
 * Shipping Details for invoices (optional for digital products)
 */
export interface ShippingDetails {
  name: string;
  address: {
    city?: string;
    country?: string; // ISO 3166-1 alpha-2
    line1: string;
    line2?: string;
    postal_code?: string;
    state?: string;
  };
  phone?: string;
}

/**
 * Account Identity
 * Combines customer and merchant configurations
 */
export interface AccountIdentity {
  individual?: {
    // For sole proprietors
    first_name?: string;
    last_name?: string;
    dob?: {
      day: number;
      month: number;
      year: number;
    };
    email?: string;
    phone?: string;
    address?: ShippingDetails['address'];
  };
  company?: {
    // For business accounts
    name?: string;
    tax_id?: string;
    address?: ShippingDetails['address'];
  };
}

/**
 * Complete Accounts v2 Configuration
 * This is the main structure returned by Stripe Accounts API
 */
export interface StripeAccountV2 {
  id: string; // Account ID (acct_xxxxxxxxx)
  object: 'account'; // Stripe object type
  type: 'standard' | 'express' | 'custom';

  // Configuration object (main v2 feature)
  configuration: {
    // Customer capabilities
    customer?: CustomerConfiguration;
    // Merchant capabilities (future)
    merchant?: MerchantConfiguration;
  };

  // Account identity details
  identity: AccountIdentity;

  // Account settings
  email?: string;
  country?: string; // ISO 3166-1 alpha-2
  currency?: string; // Default currency (USD, EUR, etc.)

  // Account capabilities
  capabilities?: {
    // Payment receiving
    payments?: 'active' | 'inactive' | 'pending';
    transfers?: 'active' | 'inactive' | 'pending';
    // Card issuing (not used initially)
    card_issuing?: 'active' | 'inactive' | 'pending';
  };

  // Account status
  charges_enabled: boolean; // Can accept payments
  payouts_enabled: boolean; // Can receive payouts (merchant)

  // Compliance
  requirements?: {
    current_deadline?: number; // Unix timestamp
    currently_due?: string[]; // Required fields
    eventually_due?: string[]; // Fields due but not urgent
    past_due?: string[]; // Overdue fields
    pending_verification?: string[];
  };

  // Metadata
  metadata?: Record<string, string>;
  created?: number; // Unix timestamp
}

/**
 * Account Creation Parameters
 */
export interface CreateAccountV2Params {
  type: StripeAccountType;
  email: string;
  country: string; // ISO 3166-1 alpha-2
  currency?: string; // Default: USD

  // For customer accounts
  customer_config?: {
    // Send invoices to this email
    invoice_email?: string;
    // Default payment method
    default_payment_method?: string;
  };

  // For merchant accounts (future)
  merchant_config?: {
    business_name?: string;
    website?: string;
  };

  // Custom metadata to track in Afilo
  metadata?: {
    clerk_user_id: string;
    signup_method?: 'email' | 'google_oauth' | 'github'; // Optional for migrations
    signup_date?: string; // ISO timestamp - Optional for migrations
    afilo_user_id?: string; // Local database ID
    migrated_from_customer_id?: string; // For v1 to v2 migrations
    migrated_at?: string; // Migration timestamp
  };
}

/**
 * Account Update Parameters
 */
export interface UpdateAccountV2Params {
  accountId: string;

  // Update customer settings
  customer_config?: Partial<CustomerConfiguration>;

  // Update merchant settings (if applicable)
  merchant_config?: Partial<MerchantConfiguration>;

  // Update identity
  identity?: Partial<AccountIdentity>;

  // Update metadata
  metadata?: Record<string, string>;
}

/**
 * Account Migration Parameters (v1 -> v2)
 */
export interface MigrateAccountV1ToV2Params {
  // Existing Stripe Customer ID (v1)
  old_customer_id: string;
  // Clerk user ID for linking
  clerk_user_id: string;
  // Target account type
  account_type: StripeAccountType;
  // Optional: new email for v2 account
  new_email?: string;
}

/**
 * Account Verification Status
 */
export interface AccountVerificationStatus {
  account_id: string;
  status: 'unverified' | 'pending' | 'verified' | 'restricted';
  missing_fields: string[];
  deadline?: Date;
  restrictions?: string[]; // Restrictions on account use
}

/**
 * Portal Session Configuration for v2 Accounts
 */
export interface PortalSessionConfigV2 {
  account_id: string;
  // Portal features to enable
  features?: {
    // Subscription management
    subscriptions?: {
      enabled: boolean;
      allow_cancellation?: boolean;
      allow_pause?: boolean;
    };
    // Payment method management
    payment_methods?: {
      enabled: boolean;
      allow_redirect_on_incomplete?: boolean;
    };
    // Invoice management
    invoices?: {
      enabled: boolean;
    };
    // Billing address update
    billing_address?: {
      enabled: boolean;
    };
    // Tax ID management
    tax_id?: {
      enabled: boolean;
    };
  };

  // Portal customization
  branding?: {
    // Primary accent color (hex)
    accent_color?: string;
    // Logo URL
    logo?: string;
    // Icon URL for favicon
    icon?: string;
  };

  // Portal behavior
  return_url: string; // Where to redirect after exiting portal
  locale?: string; // Portal language (en, es, fr, etc.)
}

/**
 * Webhook Event Types for Accounts v2
 */
export interface AccountV2WebhookEvent {
  id: string;
  object: string;
  type: 'v2.core.account.created' | 'v2.core.account.updated' | 'v2.billing.subscription.created' | 'v2.billing.subscription.updated' | 'v2.billing.subscription.deleted';
  data: {
    object: StripeAccountV2 | Stripe.Subscription;
  };
  created?: number;
  livemode?: boolean;
  pending_webhooks?: number;
  request?: {
    id?: string;
    idempotency_key?: string;
  };
}

/**
 * Stored Account Record (for Afilo database)
 * Links Stripe Accounts v2 with Clerk users
 */
export interface StoredAccountV2 {
  id: string; // UUID from Afilo DB
  stripe_account_id: string; // Stripe Account ID (v2)
  clerk_user_id: string; // Linked Clerk user
  account_type: StripeAccountType;

  // Configuration snapshot
  customer_config?: CustomerConfiguration;
  merchant_config?: MerchantConfiguration;

  // Status tracking
  created_at: Date;
  updated_at: Date;
  verified_at?: Date;

  // For migration tracking
  migrated_from?: {
    stripe_customer_id: string; // Old v1 customer ID
    migrated_at: Date;
  };

  // Metadata
  metadata?: Record<string, string>;
}

/**
 * Account onboarding data structure
 * Used during account creation flow
 */
export interface AccountOnboardingData {
  // Personal/Business info
  name: string;
  email: string;
  phone?: string;
  country: string;
  timezone?: string;

  // For merchant accounts (future)
  business_type?: 'individual' | 'sole_proprietor' | 'llc' | 'corporation' | 'partnership' | 'non_profit';
  business_name?: string;
  website?: string;
  industry?: string;

  // Capabilities to enable
  accept_payments?: boolean;
  process_payouts?: boolean; // For merchants
}

/**
 * API Response Types
 */
export interface CreateAccountV2Response {
  success: boolean;
  account: StripeAccountV2;
  account_id: string;
  customer_id?: string; // Old v1 customer ID if migrated
  portal_url?: string; // Portal access URL
  message?: string;
  error?: string;
}

export interface GetAccountStatusResponse {
  account_id: string;
  account_type: StripeAccountType;
  status: 'unverified' | 'pending' | 'verified' | 'restricted';
  capabilities: {
    payments_enabled: boolean;
    payouts_enabled: boolean; // For merchants
  };
  verification: AccountVerificationStatus;
  configuration: {
    customer?: CustomerConfiguration;
    merchant?: MerchantConfiguration;
  };
  created_at: Date;
  updated_at: Date;
}
