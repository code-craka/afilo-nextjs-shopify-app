/**
 * Cookie Consent API Routes
 * Handles consent creation, retrieval, and management
 *
 * @fileoverview Main API endpoints for cookie consent CRUD operations
 * @version 1.0
 * @compliance CCPA, PIPEDA, UK GDPR, Australia Privacy Act
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import {
  CookieConsentInputSchema,
  CookieConsentQuerySchema,
  validateConsentPreferences,
  validateSessionId,
  validateIpAddress,
  getComplianceFramework,
  type CookieConsentInput,
  type CookieConsentQuery,
} from '@/lib/validations/cookie-consent';

/**
 * GET /api/cookies/consent
 * Retrieve current cookie consent for user or session
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get user authentication (optional - works for anonymous users too)
    const { userId } = await auth();

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryParams: CookieConsentQuery = {
      session_id: searchParams.get('session_id') || undefined,
      include_expired: searchParams.get('include_expired') === 'true',
      include_audit_log: searchParams.get('include_audit_log') === 'true',
    };

    const validatedQuery = CookieConsentQuerySchema.parse(queryParams);

    // Build where clause for consent lookup
    const whereClause: any = {
      OR: [
        // Authenticated user lookup
        ...(userId ? [{ clerk_user_id: userId }] : []),
        // Session-based lookup
        ...(validatedQuery.session_id ? [{ session_id: validatedQuery.session_id }] : []),
      ].filter(Boolean),
    };

    // Add expiration filter unless explicitly including expired
    if (!validatedQuery.include_expired) {
      whereClause.is_active = true;
      whereClause.expires_at = { gte: new Date() };
    }

    // If no lookup criteria, return null
    if (whereClause.OR.length === 0) {
      return NextResponse.json({
        consent: null,
        message: 'No user ID or session ID provided'
      });
    }

    // Find the most recent consent record
    const consent = await prisma.cookie_consent_records.findFirst({
      where: whereClause,
      orderBy: { created_at: 'desc' },
      include: {
        audit_logs: validatedQuery.include_audit_log ? {
          orderBy: { created_at: 'desc' },
          take: 10, // Last 10 audit entries
        } : false,
      },
    });

    if (!consent) {
      return NextResponse.json({
        consent: null,
        message: 'No consent record found'
      });
    }

    // Check if consent has expired
    const isExpired = new Date() > consent.expires_at;
    const complianceFramework = consent.country_code
      ? getComplianceFramework(consent.country_code)
      : null;

    // Return consent data
    return NextResponse.json({
      consent: {
        id: consent.id,
        preferences: {
          essential_cookies: consent.essential_cookies,
          analytics_cookies: consent.analytics_cookies,
          marketing_cookies: consent.marketing_cookies,
          preferences_cookies: consent.preferences_cookies,
        },
        metadata: {
          consent_method: consent.consent_method,
          consent_timestamp: consent.consent_timestamp,
          consent_version: consent.consent_version,
          expires_at: consent.expires_at,
          is_active: consent.is_active,
          is_expired: isExpired,
          country_code: consent.country_code,
          compliance_framework: complianceFramework?.compliance_framework,
        },
        audit_logs: validatedQuery.include_audit_log ? consent.audit_logs : undefined,
      },
    });

  } catch (error: unknown) {
    console.error('GET /api/cookies/consent error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: 'Failed to retrieve consent',
          message: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cookies/consent
 * Create or update cookie consent preferences
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get user authentication (optional)
    const { userId } = await auth();

    // Parse request body
    const body = await request.json();
    const validatedInput: CookieConsentInput = CookieConsentInputSchema.parse(body);

    // Validate preferences
    const preferences = validateConsentPreferences(validatedInput.preferences);

    // Validate session ID
    const sessionId = validateSessionId(validatedInput.session_id);

    // Extract request metadata
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     request.headers.get('x-real-ip') ||
                     'unknown';

    const userAgent = request.headers.get('user-agent') || 'unknown';
    const acceptLanguage = request.headers.get('accept-language')?.split(',')[0]?.trim();

    // Get geographic data from Vercel Edge runtime
    const countryCode = (request as any).geo?.country || 'US';
    const regionCode = (request as any).geo?.region;

    // Determine compliance framework
    const complianceFramework = getComplianceFramework(countryCode);

    // Calculate expiration date (12 months from now)
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + complianceFramework.consent_expiry_months);

    // Check for existing consent to update vs create
    const existingConsent = await prisma.cookie_consent_records.findFirst({
      where: {
        OR: [
          ...(userId ? [{ clerk_user_id: userId }] : []),
          { session_id: sessionId },
        ],
        is_active: true,
      },
      orderBy: { created_at: 'desc' },
    });

    let consentRecord;
    let auditEventType: 'consent_given' | 'consent_updated';

    if (existingConsent) {
      // Update existing consent
      const previousState = {
        essential_cookies: existingConsent.essential_cookies,
        analytics_cookies: existingConsent.analytics_cookies,
        marketing_cookies: existingConsent.marketing_cookies,
        preferences_cookies: existingConsent.preferences_cookies,
      };

      consentRecord = await prisma.cookie_consent_records.update({
        where: { id: existingConsent.id },
        data: {
          // Update user ID if now authenticated
          clerk_user_id: userId || existingConsent.clerk_user_id,

          // Update preferences
          essential_cookies: preferences.essential_cookies,
          analytics_cookies: preferences.analytics_cookies,
          marketing_cookies: preferences.marketing_cookies,
          preferences_cookies: preferences.preferences_cookies,

          // Update metadata
          consent_method: validatedInput.consent_method,
          consent_timestamp: new Date(),
          consent_source: validatedInput.consent_source,

          // Update browser context
          ip_address: ipAddress,
          user_agent: userAgent,
          browser_language: validatedInput.browser_language || acceptLanguage,
          country_code: countryCode,
          region_code: regionCode,

          // Update expiration
          expires_at: expiresAt,

          // Reset revocation if previously revoked
          is_active: true,
          revoked_at: null,

          // Update timestamps
          updated_at: new Date(),

          // Store metadata
          metadata: (validatedInput.metadata || {}) as any,
        },
      });

      auditEventType = 'consent_updated';

      // Create audit log entry for update
      await prisma.cookie_consent_audit_log.create({
        data: {
          consent_record_id: consentRecord.id,
          event_type: auditEventType,
          previous_state: previousState,
          new_state: preferences,
          changed_by: 'user',
          change_reason: 'User updated preferences',
          ip_address: ipAddress,
          user_agent: userAgent,
        },
      });

    } else {
      // Create new consent record
      consentRecord = await prisma.cookie_consent_records.create({
        data: {
          // User identification
          clerk_user_id: userId || null,
          session_id: sessionId,

          // Consent preferences
          essential_cookies: preferences.essential_cookies,
          analytics_cookies: preferences.analytics_cookies,
          marketing_cookies: preferences.marketing_cookies,
          preferences_cookies: preferences.preferences_cookies,

          // Consent metadata
          consent_method: validatedInput.consent_method,
          consent_timestamp: new Date(),
          consent_version: '1.0', // Current policy version
          consent_source: validatedInput.consent_source,

          // Browser/device context
          ip_address: ipAddress,
          user_agent: userAgent,
          browser_language: validatedInput.browser_language || acceptLanguage,
          country_code: countryCode,
          region_code: regionCode,

          // Expiration management
          expires_at: expiresAt,
          is_active: true,

          // Metadata
          metadata: (validatedInput.metadata || {}) as any,
        },
      });

      auditEventType = 'consent_given';

      // Create audit log entry for creation
      await prisma.cookie_consent_audit_log.create({
        data: {
          consent_record_id: consentRecord.id,
          event_type: auditEventType,
          new_state: preferences,
          changed_by: 'user',
          change_reason: 'Initial consent provided',
          ip_address: ipAddress,
          user_agent: userAgent,
        },
      });
    }

    // Return success response
    return NextResponse.json({
      success: true,
      consent: {
        id: consentRecord.id,
        preferences: {
          essential_cookies: consentRecord.essential_cookies,
          analytics_cookies: consentRecord.analytics_cookies,
          marketing_cookies: consentRecord.marketing_cookies,
          preferences_cookies: consentRecord.preferences_cookies,
        },
        metadata: {
          consent_method: consentRecord.consent_method,
          consent_timestamp: consentRecord.consent_timestamp,
          expires_at: consentRecord.expires_at,
          country_code: consentRecord.country_code,
          compliance_framework: complianceFramework.compliance_framework,
        },
        audit: {
          event_type: auditEventType,
          is_update: !!existingConsent,
        },
      },
    }, { status: existingConsent ? 200 : 201 });

  } catch (error: unknown) {
    console.error('POST /api/cookies/consent error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: 'Failed to save consent',
          message: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/cookies/consent
 * Update existing consent preferences (requires existing consent)
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required for consent updates' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { preferences, change_reason } = body;

    // Validate preferences
    const validatedPreferences = validateConsentPreferences(preferences);

    // Find existing consent
    const existingConsent = await prisma.cookie_consent_records.findFirst({
      where: {
        clerk_user_id: userId,
        is_active: true,
        expires_at: { gte: new Date() },
      },
      orderBy: { created_at: 'desc' },
    });

    if (!existingConsent) {
      return NextResponse.json(
        { error: 'No active consent record found. Please create consent first.' },
        { status: 404 }
      );
    }

    // Extract request metadata
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     request.headers.get('x-real-ip') ||
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Store previous state for audit
    const previousState = {
      essential_cookies: existingConsent.essential_cookies,
      analytics_cookies: existingConsent.analytics_cookies,
      marketing_cookies: existingConsent.marketing_cookies,
      preferences_cookies: existingConsent.preferences_cookies,
    };

    // Update consent record
    const updatedConsent = await prisma.cookie_consent_records.update({
      where: { id: existingConsent.id },
      data: {
        essential_cookies: validatedPreferences.essential_cookies,
        analytics_cookies: validatedPreferences.analytics_cookies,
        marketing_cookies: validatedPreferences.marketing_cookies,
        preferences_cookies: validatedPreferences.preferences_cookies,
        consent_method: 'settings_update',
        updated_at: new Date(),
      },
    });

    // Create audit log entry
    await prisma.cookie_consent_audit_log.create({
      data: {
        consent_record_id: updatedConsent.id,
        event_type: 'consent_updated',
        previous_state: previousState,
        new_state: validatedPreferences,
        changed_by: 'user',
        change_reason: change_reason || 'User updated preferences via settings',
        ip_address: ipAddress,
        user_agent: userAgent,
      },
    });

    return NextResponse.json({
      success: true,
      consent: {
        id: updatedConsent.id,
        preferences: validatedPreferences,
        updated_at: updatedConsent.updated_at,
      },
    });

  } catch (error: unknown) {
    console.error('PUT /api/cookies/consent error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Failed to update consent', message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cookies/consent
 * Revoke all non-essential cookie consent
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = await auth();

    // Get session ID from query params for anonymous users
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');

    if (!userId && !sessionId) {
      return NextResponse.json(
        { error: 'User ID or session ID required for consent revocation' },
        { status: 400 }
      );
    }

    // Build where clause
    const whereClause: any = {
      OR: [
        ...(userId ? [{ clerk_user_id: userId }] : []),
        ...(sessionId ? [{ session_id: sessionId }] : []),
      ],
      is_active: true,
    };

    // Find active consent records
    const activeConsents = await prisma.cookie_consent_records.findMany({
      where: whereClause,
    });

    if (activeConsents.length === 0) {
      return NextResponse.json(
        { message: 'No active consent records found' },
        { status: 404 }
      );
    }

    // Extract request metadata
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     request.headers.get('x-real-ip') ||
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Revoke all active consents
    const revokedConsents = await Promise.all(
      activeConsents.map(async (consent) => {
        // Store previous state
        const previousState = {
          essential_cookies: consent.essential_cookies,
          analytics_cookies: consent.analytics_cookies,
          marketing_cookies: consent.marketing_cookies,
          preferences_cookies: consent.preferences_cookies,
        };

        // Update to revoked state (only non-essential cookies)
        const updated = await prisma.cookie_consent_records.update({
          where: { id: consent.id },
          data: {
            essential_cookies: true, // Keep essential cookies
            analytics_cookies: false, // Revoke analytics
            marketing_cookies: false, // Revoke marketing
            preferences_cookies: false, // Revoke preferences
            is_active: false, // Mark as inactive
            revoked_at: new Date(),
            consent_method: 'explicit_revoke',
            updated_at: new Date(),
          },
        });

        // Create audit log entry
        await prisma.cookie_consent_audit_log.create({
          data: {
            consent_record_id: updated.id,
            event_type: 'consent_revoked',
            previous_state: previousState,
            new_state: {
              essential_cookies: true,
              analytics_cookies: false,
              marketing_cookies: false,
              preferences_cookies: false,
            },
            changed_by: 'user',
            change_reason: 'User explicitly revoked non-essential cookies',
            ip_address: ipAddress,
            user_agent: userAgent,
          },
        });

        return updated;
      })
    );

    return NextResponse.json({
      success: true,
      message: 'Non-essential cookie consent revoked',
      revoked_records: revokedConsents.length,
      current_preferences: {
        essential_cookies: true,
        analytics_cookies: false,
        marketing_cookies: false,
        preferences_cookies: false,
      },
    });

  } catch (error: unknown) {
    console.error('DELETE /api/cookies/consent error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Failed to revoke consent', message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}