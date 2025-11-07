/**
 * Stripe Connect Type Definitions
 *
 * Comprehensive TypeScript types for Stripe Connect integration
 * following the established patterns in types/api.ts and types/chat.ts
 *
 * @see https://stripe.com/docs/connect
 */

import type Stripe from 'stripe';

// ========================================
// ACCOUNT TYPES
// ========================================

/**
 * Stripe Connect account types
 */
export type ConnectAccountType = 'standard' | 'express' | 'custom';

/**
 * Business entity types for Connect accounts
 */
export type BusinessType = 'individual' | 'company';

/**
 * Onboarding status states
 */
export type OnboardingStatus = 'pending' | 'in_progress' | 'completed' | 'restricted';

/**
 * Transfer status states
 */
export type TransferStatus = 'pending' | 'paid' | 'failed' | 'canceled';

/**
 * Embedded component types available
 */
export type EmbeddedComponentType =
  | 'payments'
  | 'payouts'
  | 'documents'
  | 'account_management'
  | 'notification_banner'
  | 'account_onboarding';

// ========================================
// DATABASE MODELS (matching Prisma schema)
// ========================================

/**
 * Connect Account database model
 */
export interface ConnectAccount {
  id: string;
  clerk_user_id: string;
  stripe_account_id: string;
  account_type: ConnectAccountType;
  business_type: BusinessType | null;
  country: string | null;
  default_currency: string;
  email: string | null;
  business_name: string | null;
  capabilities: AccountCapabilities | null;
  requirements: AccountRequirements | null;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  onboarding_status: OnboardingStatus;
  onboarding_link: string | null;
  onboarding_expires_at: Date | null;
  metadata: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Marketplace Transfer database model
 */
export interface MarketplaceTransfer {
  id: string;
  stripe_transfer_id: string;
  destination_account_id: string;
  stripe_destination_id: string;
  source_transaction: string | null;
  amount: number;
  currency: string;
  application_fee_amount: number | null;
  transfer_group: string | null;
  description: string | null;
  status: TransferStatus;
  failure_code: string | null;
  failure_message: string | null;
  metadata: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Connect Account Session database model
 */
export interface ConnectAccountSession {
  id: string;
  account_id: string;
  stripe_account_id: string;
  client_secret: string;
  components: EmbeddedComponentType[];
  expires_at: Date;
  created_at: Date;
}

// ========================================
// API REQUEST/RESPONSE TYPES
// ========================================

/**
 * Request to create a Connect account
 */
export interface CreateConnectAccountRequest {
  account_type: ConnectAccountType;
  business_type?: BusinessType;
  country?: string;
  email?: string;
  business_name?: string;
  metadata?: Record<string, string>;
}

/**
 * Response from creating a Connect account
 */
export interface CreateConnectAccountResponse {
  success: boolean;
  account: {
    id: string;
    stripe_account_id: string;
    account_type: ConnectAccountType;
    onboarding_status: OnboardingStatus;
    created_at: string;
  };
  onboarding?: {
    url: string;
    expires_at: string;
  };
  message?: string;
}

/**
 * Request to create an onboarding link
 */
export interface CreateOnboardingLinkRequest {
  account_id: string;
  refresh_url?: string;
  return_url?: string;
}

/**
 * Response from creating an onboarding link
 */
export interface CreateOnboardingLinkResponse {
  success: boolean;
  url: string;
  expires_at: number;
  created: number;
}

/**
 * Request to create an account session (for embedded components)
 */
export interface CreateAccountSessionRequest {
  account_id: string;
  components: EmbeddedComponentType[];
}

/**
 * Response from creating an account session
 */
export interface CreateAccountSessionResponse {
  success: boolean;
  session: {
    client_secret: string;
    expires_at: string;
    components: EmbeddedComponentType[];
  };
}

/**
 * Request to update Connect account
 */
export interface UpdateConnectAccountRequest {
  business_name?: string;
  email?: string;
  metadata?: Record<string, string>;
}

/**
 * Response from updating Connect account
 */
export interface UpdateConnectAccountResponse {
  success: boolean;
  account: Partial<ConnectAccount>;
  message?: string;
}

/**
 * Request to create a transfer
 */
export interface CreateTransferRequest {
  destination_account_id: string;
  amount: number;
  currency?: string;
  source_transaction?: string;
  application_fee_amount?: number;
  transfer_group?: string;
  description?: string;
  metadata?: Record<string, string>;
}

/**
 * Response from creating a transfer
 */
export interface CreateTransferResponse {
  success: boolean;
  transfer: {
    id: string;
    stripe_transfer_id: string;
    amount: number;
    currency: string;
    status: TransferStatus;
    created_at: string;
  };
  message?: string;
}

/**
 * Request to list transfers
 */
export interface ListTransfersRequest {
  account_id?: string;
  status?: TransferStatus;
  limit?: number;
  cursor?: string; // For cursor-based pagination
}

/**
 * Response from listing transfers
 */
export interface ListTransfersResponse {
  success: boolean;
  transfers: Array<{
    id: string;
    stripe_transfer_id: string;
    destination_account_id: string;
    amount: number;
    currency: string;
    status: TransferStatus;
    created_at: string;
  }>;
  pagination: {
    has_more: boolean;
    next_cursor: string | null;
    total_count?: number;
  };
}

/**
 * Request to create Express Dashboard link
 */
export interface CreateDashboardLinkRequest {
  account_id: string;
}

/**
 * Response from creating Express Dashboard link
 */
export interface CreateDashboardLinkResponse {
  success: boolean;
  url: string;
  created: number;
  expires_at: number;
}

// ========================================
// ACCOUNT STATUS & CAPABILITIES
// ========================================

/**
 * Account capabilities status
 */
export interface AccountCapabilities {
  card_payments?: 'active' | 'inactive' | 'pending';
  transfers?: 'active' | 'inactive' | 'pending';
  us_bank_account_ach_payments?: 'active' | 'inactive' | 'pending';
  [key: string]: string | undefined;
}

/**
 * Account requirements
 */
export interface AccountRequirements {
  currently_due: string[];
  eventually_due: string[];
  past_due: string[];
  pending_verification: string[];
  disabled_reason?: string;
  current_deadline?: number | null;
}

/**
 * Complete account status
 */
export interface ConnectAccountStatus {
  id: string;
  stripe_account_id: string;
  account_type: ConnectAccountType;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  onboarding_status: OnboardingStatus;
  capabilities: AccountCapabilities;
  requirements: AccountRequirements;
  balance?: {
    available: Array<{ amount: number; currency: string }>;
    pending: Array<{ amount: number; currency: string }>;
  };
}

// ========================================
// WEBHOOK EVENT TYPES
// ========================================

/**
 * Connect webhook event types
 */
export type ConnectWebhookEventType =
  | 'account.updated'
  | 'account.application.authorized'
  | 'account.application.deauthorized'
  | 'account.external_account.created'
  | 'account.external_account.updated'
  | 'account.external_account.deleted'
  | 'capability.updated'
  | 'person.created'
  | 'person.updated'
  | 'person.deleted'
  | 'transfer.created'
  | 'transfer.updated'
  | 'transfer.failed'
  | 'transfer.reversed'
  | 'payout.created'
  | 'payout.updated'
  | 'payout.paid'
  | 'payout.failed';

/**
 * Webhook payload for account.updated event
 */
export interface AccountUpdatedWebhook {
  id: string;
  object: 'event';
  type: 'account.updated';
  data: {
    object: Stripe.Account;
    previous_attributes?: Partial<Stripe.Account>;
  };
}

/**
 * Webhook payload for transfer events
 */
export interface TransferWebhook {
  id: string;
  object: 'event';
  type: 'transfer.created' | 'transfer.updated' | 'transfer.failed';
  data: {
    object: Stripe.Transfer;
  };
}

// ========================================
// EMBEDDED COMPONENTS CONFIG
// ========================================

/**
 * Appearance configuration for embedded components
 * Must match your TailwindCSS v4 theme
 */
export interface EmbeddedComponentsAppearance {
  theme: 'stripe' | 'night' | 'flat';
  variables?: {
    colorPrimary?: string;
    colorBackground?: string;
    colorText?: string;
    colorDanger?: string;
    fontFamily?: string;
    spacingUnit?: string;
    borderRadius?: string;
  };
}

/**
 * Configuration for StripeConnectInstance
 */
export interface StripeConnectConfig {
  publishableKey: string;
  appearance?: EmbeddedComponentsAppearance;
  fonts?: Array<{
    cssSrc: string;
    family?: string;
  }>;
}

// ========================================
// UTILITY TYPES
// ========================================

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  has_more: boolean;
  next_cursor: string | null;
  total_count?: number;
  limit: number;
}

/**
 * API error response
 */
export interface ConnectApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

/**
 * Generic success response
 */
export interface ConnectApiSuccess<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

/**
 * API response wrapper
 */
export type ConnectApiResponse<T = unknown> = ConnectApiSuccess<T> | ConnectApiError;

// ========================================
// FORM DATA TYPES
// ========================================

/**
 * Onboarding form data
 */
export interface OnboardingFormData {
  account_type: ConnectAccountType;
  business_type: BusinessType;
  country: string;
  business_name?: string;
  email?: string;
  agree_to_terms: boolean;
}

/**
 * Transfer form data
 */
export interface TransferFormData {
  destination_account_id: string;
  amount: number;
  currency: string;
  description?: string;
  application_fee_percentage?: number;
}

// ========================================
// COMPONENT PROP TYPES
// ========================================

/**
 * Props for ConnectOnboarding component
 */
export interface ConnectOnboardingProps {
  onSuccess?: (account: ConnectAccount) => void;
  onError?: (error: Error) => void;
  returnUrl?: string;
  refreshUrl?: string;
}

/**
 * Props for ConnectDashboard component
 */
export interface ConnectDashboardProps {
  accountId: string;
  components?: EmbeddedComponentType[];
  onSessionExpired?: () => void;
}

/**
 * Props for TransferManager component
 */
export interface TransferManagerProps {
  accountId?: string;
  onTransferCreated?: (transfer: MarketplaceTransfer) => void;
}
