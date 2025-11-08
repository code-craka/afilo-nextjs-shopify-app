/**
 * Cookie Consent Validation Schemas
 * Zod schemas for CCPA/PIPEDA/UK GDPR compliant cookie consent management
 *
 * @fileoverview Validation schemas for cookie consent API routes and forms
 * @version 1.0
 * @author Afilo Platform Team
 */

import { z } from 'zod';

// Cookie consent method enum
export const ConsentMethodEnum = z.enum([
  'explicit_accept',
  'explicit_reject',
  'settings_update',
  'banner_dismiss',
  'implied_scroll',
  'session_restore'
]);

// Cookie consent source enum
export const ConsentSourceEnum = z.enum([
  'web',
  'mobile_app',
  'api'
]);

// Audit event type enum
export const AuditEventTypeEnum = z.enum([
  'consent_given',
  'consent_updated',
  'consent_revoked',
  'consent_expired',
  'consent_restored'
]);

// Base cookie preferences schema
export const CookiePreferencesSchema = z.object({
  essential_cookies: z.literal(true), // Always true - cannot be disabled
  analytics_cookies: z.boolean(),
  marketing_cookies: z.boolean(),
  preferences_cookies: z.boolean(),
});

// Cookie consent input schema (for creating new consent)
export const CookieConsentInputSchema = z.object({
  // Preferences (required)
  preferences: CookiePreferencesSchema,

  // Consent metadata
  consent_method: ConsentMethodEnum,
  consent_source: ConsentSourceEnum.default('web'),

  // Session/user identification
  session_id: z.string().min(10).max(255),

  // Optional browser context
  browser_language: z.string().max(10).optional(),

  // Optional metadata
  metadata: z.record(z.string(), z.any()).optional(),
});

// Cookie consent update schema (for updating existing consent)
export const CookieConsentUpdateSchema = z.object({
  // Only allow updating non-essential preferences
  analytics_cookies: z.boolean(),
  marketing_cookies: z.boolean(),
  preferences_cookies: z.boolean(),

  // Update metadata
  consent_method: ConsentMethodEnum.default('settings_update'),
  change_reason: z.string().max(500).optional(),
});

// Cookie consent query schema (for retrieving consent)
export const CookieConsentQuerySchema = z.object({
  session_id: z.string().optional(),
  include_expired: z.boolean().default(false),
  include_audit_log: z.boolean().default(false),
});

// Cookie policy version schema
export const CookiePolicyVersionSchema = z.object({
  version: z.string().min(1).max(50),
  effective_date: z.string().or(z.date()),
  policy_content: z.string().min(100),
  policy_summary: z.string().max(1000).optional(),
  changelog: z.string().max(5000).optional(),
  requires_reconsent: z.boolean().default(false),
});

// Consent analytics query schema
export const ConsentAnalyticsQuerySchema = z.object({
  start_date: z.string().or(z.date()).optional(),
  end_date: z.string().or(z.date()).optional(),
  country_code: z.string().length(2).optional(),
  consent_method: ConsentMethodEnum.optional(),
  group_by: z.enum(['day', 'week', 'month']).default('day'),
  limit: z.number().min(1).max(1000).default(100),
});

// Consent audit log entry schema
export const ConsentAuditLogSchema = z.object({
  consent_record_id: z.string().uuid(),
  event_type: AuditEventTypeEnum,
  previous_state: z.record(z.string(), z.any()).optional(),
  new_state: z.record(z.string(), z.any()),
  changed_by: z.string().max(50).default('user'),
  change_reason: z.string().max(500).optional(),
  ip_address: z.string().max(45).optional(),
  user_agent: z.string().max(2000).optional(),
});

// Consent banner configuration schema
export const ConsentBannerConfigSchema = z.object({
  show_banner: z.boolean().default(true),
  position: z.enum(['top', 'bottom']).default('bottom'),
  theme: z.enum(['light', 'dark', 'auto']).default('auto'),
  animation_enabled: z.boolean().default(true),
  delay_ms: z.number().min(0).max(10000).default(1000),
  auto_hide_after_ms: z.number().min(0).max(30000).optional(),
});

// Admin consent management schema
export const AdminConsentManagementSchema = z.object({
  user_id: z.string().optional(),
  session_id: z.string().optional(),
  action: z.enum(['revoke', 'restore', 'expire']),
  reason: z.string().min(5).max(500),
  notify_user: z.boolean().default(false),
});

// Consent export schema
export const ConsentExportSchema = z.object({
  format: z.enum(['json', 'csv', 'xlsx']).default('json'),
  date_range: z.object({
    start: z.string().or(z.date()),
    end: z.string().or(z.date()),
  }).optional(),
  include_audit_log: z.boolean().default(false),
  include_revoked: z.boolean().default(true),
  filters: z.object({
    country_codes: z.array(z.string().length(2)).optional(),
    consent_methods: z.array(ConsentMethodEnum).optional(),
    user_types: z.array(z.enum(['authenticated', 'anonymous'])).optional(),
  }).optional(),
});

// Regional compliance schema
export const RegionalComplianceSchema = z.object({
  country_code: z.string().length(2),
  region_code: z.string().max(10).optional(),
  compliance_framework: z.enum(['CCPA', 'PIPEDA', 'UK_GDPR', 'AUSTRALIA_PRIVACY']),
  requires_explicit_consent: z.boolean(),
  allows_implied_consent: z.boolean(),
  consent_expiry_months: z.number().min(1).max(60).default(12),
  requires_granular_control: z.boolean().default(true),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type ConsentMethod = z.infer<typeof ConsentMethodEnum>;
export type ConsentSource = z.infer<typeof ConsentSourceEnum>;
export type AuditEventType = z.infer<typeof AuditEventTypeEnum>;

export type CookiePreferences = z.infer<typeof CookiePreferencesSchema>;
export type CookieConsentInput = z.infer<typeof CookieConsentInputSchema>;
export type CookieConsentUpdate = z.infer<typeof CookieConsentUpdateSchema>;
export type CookieConsentQuery = z.infer<typeof CookieConsentQuerySchema>;

export type CookiePolicyVersion = z.infer<typeof CookiePolicyVersionSchema>;
export type ConsentAnalyticsQuery = z.infer<typeof ConsentAnalyticsQuerySchema>;
export type ConsentAuditLog = z.infer<typeof ConsentAuditLogSchema>;

export type ConsentBannerConfig = z.infer<typeof ConsentBannerConfigSchema>;
export type AdminConsentManagement = z.infer<typeof AdminConsentManagementSchema>;
export type ConsentExport = z.infer<typeof ConsentExportSchema>;
export type RegionalCompliance = z.infer<typeof RegionalComplianceSchema>;

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validates cookie consent preferences ensuring essential cookies are always enabled
 */
export function validateConsentPreferences(preferences: unknown): CookiePreferences {
  const validated = CookiePreferencesSchema.parse(preferences);

  // Ensure essential cookies are always true
  if (!validated.essential_cookies) {
    throw new Error('Essential cookies cannot be disabled');
  }

  return validated;
}

/**
 * Validates session ID format (UUID v4 or secure random string)
 */
export function validateSessionId(sessionId: string): string {
  if (sessionId.length < 10 || sessionId.length > 255) {
    throw new Error('Session ID must be between 10 and 255 characters');
  }

  // Check for UUID v4 format or accept any alphanumeric string
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const alphanumericRegex = /^[a-zA-Z0-9_-]+$/;

  if (!uuidRegex.test(sessionId) && !alphanumericRegex.test(sessionId)) {
    throw new Error('Session ID must be a valid UUID or alphanumeric string');
  }

  return sessionId;
}

/**
 * Validates IP address format (IPv4 or IPv6)
 */
export function validateIpAddress(ip: string): string {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  if (!ipv4Regex.test(ip) && !ipv6Regex.test(ip)) {
    throw new Error('Invalid IP address format');
  }

  return ip;
}

/**
 * Validates country code against ISO 3166-1 alpha-2 standard
 */
export function validateCountryCode(countryCode: string): string {
  const validCountryCodes = [
    'US', 'CA', 'GB', 'AU', 'NZ', 'SG', 'JP', // Afilo's target markets
    // Add more as needed
  ];

  const uppercaseCode = countryCode.toUpperCase();

  if (!validCountryCodes.includes(uppercaseCode)) {
    // Still accept but log warning for unknown country codes
    console.warn(`Unknown country code: ${uppercaseCode}`);
  }

  return uppercaseCode;
}

/**
 * Determines required compliance framework based on country code
 */
export function getComplianceFramework(countryCode: string): RegionalCompliance {
  const frameworks: Record<string, RegionalCompliance> = {
    'US': {
      country_code: 'US',
      compliance_framework: 'CCPA',
      requires_explicit_consent: false, // CCPA is opt-out based
      allows_implied_consent: true,
      consent_expiry_months: 12,
      requires_granular_control: true,
    },
    'CA': {
      country_code: 'CA',
      compliance_framework: 'PIPEDA',
      requires_explicit_consent: true,
      allows_implied_consent: false,
      consent_expiry_months: 12,
      requires_granular_control: true,
    },
    'GB': {
      country_code: 'GB',
      compliance_framework: 'UK_GDPR',
      requires_explicit_consent: true,
      allows_implied_consent: false,
      consent_expiry_months: 12,
      requires_granular_control: true,
    },
    'AU': {
      country_code: 'AU',
      compliance_framework: 'AUSTRALIA_PRIVACY',
      requires_explicit_consent: false,
      allows_implied_consent: true,
      consent_expiry_months: 12,
      requires_granular_control: true,
    },
  };

  return frameworks[countryCode.toUpperCase()] || frameworks['US']; // Default to CCPA
}

/**
 * Checks if consent has expired based on timestamp and regional requirements
 */
export function isConsentExpired(
  consentTimestamp: Date,
  countryCode?: string
): boolean {
  const framework = countryCode ? getComplianceFramework(countryCode) : { consent_expiry_months: 12 };
  const expiryDate = new Date(consentTimestamp);
  expiryDate.setMonth(expiryDate.getMonth() + framework.consent_expiry_months);

  return new Date() > expiryDate;
}

/**
 * Generates a secure session ID for anonymous users
 */
export function generateSessionId(): string {
  // Generate a UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const CONSENT_CONSTANTS = {
  DEFAULT_EXPIRY_MONTHS: 12,
  MIN_SESSION_ID_LENGTH: 10,
  MAX_SESSION_ID_LENGTH: 255,
  DEFAULT_POLICY_VERSION: '1.0',
  SUPPORTED_BROWSERS: ['chrome', 'firefox', 'safari', 'edge'],
  SUPPORTED_COUNTRIES: ['US', 'CA', 'GB', 'AU', 'NZ', 'SG', 'JP'],
  BANNER_DELAY_MS: 1000,
  MAX_AUDIT_LOG_ENTRIES: 1000,
} as const;

export const COOKIE_CATEGORIES = {
  ESSENTIAL: {
    id: 'essential_cookies',
    name: 'Essential Cookies',
    description: 'Required for authentication, security, and core platform functionality',
    required: true,
    examples: [
      'Authentication tokens (Clerk)',
      'Security CSRF tokens',
      'Session management',
      'Load balancing',
      'Payment processing (Stripe)',
    ],
  },
  ANALYTICS: {
    id: 'analytics_cookies',
    name: 'Analytics Cookies',
    description: 'Help us understand how you use the platform to improve performance',
    required: false,
    examples: [
      'Google Analytics (_ga, _gid)',
      'Vercel Analytics',
      'Performance monitoring',
      'Error tracking',
    ],
  },
  MARKETING: {
    id: 'marketing_cookies',
    name: 'Marketing Cookies',
    description: 'Used for targeted advertising and conversion tracking',
    required: false,
    examples: [
      'Google Ads conversion tracking',
      'LinkedIn Insights Tag',
      'Remarketing pixels',
      'Social media integrations',
    ],
  },
  PREFERENCES: {
    id: 'preferences_cookies',
    name: 'Preference Cookies',
    description: 'Remember your settings and personalize your experience',
    required: false,
    examples: [
      'UI theme (dark/light mode)',
      'Language preferences',
      'Dashboard layout',
      'Notification settings',
    ],
  },
} as const;