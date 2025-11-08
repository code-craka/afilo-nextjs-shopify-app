/**
 * Cookie Consent Status API
 * Quick status checks for consent state
 *
 * @fileoverview Lightweight API for checking consent status and requirements
 * @version 1.0
 * @compliance CCPA, PIPEDA, UK GDPR, Australia Privacy Act
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import {
  getComplianceFramework,
  isConsentExpired,
} from '@/lib/validations/cookie-consent';

/**
 * GET /api/cookies/status
 * Get current consent status and requirements
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = await auth();
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');

    // Get geographic data for compliance requirements
    const countryCode = (request as any).geo?.country || 'US';
    const complianceFramework = getComplianceFramework(countryCode);

    // Get current policy version
    const currentPolicy = await prisma.cookie_policy_versions.findFirst({
      where: { is_current: true },
      select: { version: true, requires_reconsent: true },
    });

    const responseData: any = {
      compliance: {
        country_code: countryCode,
        framework: complianceFramework.compliance_framework,
        requires_explicit_consent: complianceFramework.requires_explicit_consent,
        allows_implied_consent: complianceFramework.allows_implied_consent,
        consent_expiry_months: complianceFramework.consent_expiry_months,
      },
      policy: {
        current_version: currentPolicy?.version || '1.0',
        requires_reconsent: currentPolicy?.requires_reconsent || false,
      },
      user: {
        is_authenticated: !!userId,
        user_id: userId || null,
        session_id: sessionId,
      },
      consent_required: true, // Default to requiring consent
      show_banner: true, // Default to showing banner
    };

    // If we have user/session identification, check existing consent
    if (userId || sessionId) {
      const whereClause: any = {
        OR: [
          ...(userId ? [{ clerk_user_id: userId }] : []),
          ...(sessionId ? [{ session_id: sessionId }] : []),
        ].filter(Boolean),
        is_active: true,
      };

      const existingConsent = await prisma.cookie_consent_records.findFirst({
        where: whereClause,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          essential_cookies: true,
          analytics_cookies: true,
          marketing_cookies: true,
          preferences_cookies: true,
          consent_timestamp: true,
          consent_version: true,
          expires_at: true,
          is_active: true,
        },
      });

      if (existingConsent) {
        const expired = isConsentExpired(existingConsent.consent_timestamp, countryCode);
        const needsReconsent = currentPolicy?.requires_reconsent &&
                              existingConsent.consent_version !== currentPolicy.version;

        responseData.consent = {
          exists: true,
          id: existingConsent.id,
          preferences: {
            essential_cookies: existingConsent.essential_cookies,
            analytics_cookies: existingConsent.analytics_cookies,
            marketing_cookies: existingConsent.marketing_cookies,
            preferences_cookies: existingConsent.preferences_cookies,
          },
          consent_timestamp: existingConsent.consent_timestamp,
          consent_version: existingConsent.consent_version,
          expires_at: existingConsent.expires_at,
          is_expired: expired,
          needs_reconsent: needsReconsent,
        };

        // Update flags based on consent state
        responseData.consent_required = expired || needsReconsent;
        responseData.show_banner = expired || needsReconsent;
      } else {
        responseData.consent = {
          exists: false,
          preferences: null,
        };
      }
    } else {
      responseData.consent = {
        exists: false,
        preferences: null,
      };
    }

    // Add recommendations based on compliance framework
    responseData.recommendations = {
      show_granular_controls: complianceFramework.requires_granular_control,
      default_to_opt_out: !complianceFramework.allows_implied_consent,
      require_explicit_action: complianceFramework.requires_explicit_consent,
    };

    return NextResponse.json(responseData);

  } catch (error: unknown) {
    console.error('GET /api/cookies/status error:', error);

    // Return a safe default response on error
    return NextResponse.json({
      compliance: {
        country_code: 'US',
        framework: 'CCPA',
        requires_explicit_consent: false,
        allows_implied_consent: true,
        consent_expiry_months: 12,
      },
      policy: {
        current_version: '1.0',
        requires_reconsent: false,
      },
      user: {
        is_authenticated: false,
        user_id: null,
        session_id: null,
      },
      consent_required: true,
      show_banner: true,
      consent: {
        exists: false,
        preferences: null,
      },
      error: 'Failed to retrieve detailed status',
    });
  }
}

/**
 * POST /api/cookies/status/check
 * Bulk status check for multiple sessions/users
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = await auth();

    // Admin-only endpoint for bulk checks
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userProfile = await prisma.user_profiles.findUnique({
      where: { clerk_user_id: userId },
      select: { role: true },
    });

    if (userProfile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { user_ids = [], session_ids = [] } = body;

    // Get consent status for multiple users/sessions
    const consents = await prisma.cookie_consent_records.findMany({
      where: {
        OR: [
          ...(user_ids.length > 0 ? [{ clerk_user_id: { in: user_ids } }] : []),
          ...(session_ids.length > 0 ? [{ session_id: { in: session_ids } }] : []),
        ],
        is_active: true,
      },
      select: {
        id: true,
        clerk_user_id: true,
        session_id: true,
        essential_cookies: true,
        analytics_cookies: true,
        marketing_cookies: true,
        preferences_cookies: true,
        consent_timestamp: true,
        expires_at: true,
      },
      orderBy: { created_at: 'desc' },
    });

    // Group by user/session and check expiration
    const statusMap = new Map();

    consents.forEach(consent => {
      const key = consent.clerk_user_id || consent.session_id;
      if (!statusMap.has(key)) {
        const expired = new Date() > consent.expires_at;
        statusMap.set(key, {
          identifier: key,
          type: consent.clerk_user_id ? 'user' : 'session',
          consent_id: consent.id,
          preferences: {
            essential_cookies: consent.essential_cookies,
            analytics_cookies: consent.analytics_cookies,
            marketing_cookies: consent.marketing_cookies,
            preferences_cookies: consent.preferences_cookies,
          },
          consent_timestamp: consent.consent_timestamp,
          expires_at: consent.expires_at,
          is_expired: expired,
          needs_renewal: expired,
        });
      }
    });

    // Add entries for identifiers with no consent
    const allIdentifiers = [...user_ids, ...session_ids];
    allIdentifiers.forEach(identifier => {
      if (!statusMap.has(identifier)) {
        statusMap.set(identifier, {
          identifier,
          type: user_ids.includes(identifier) ? 'user' : 'session',
          consent_id: null,
          preferences: null,
          consent_timestamp: null,
          expires_at: null,
          is_expired: false,
          needs_renewal: true,
        });
      }
    });

    return NextResponse.json({
      bulk_status: Array.from(statusMap.values()),
      total_checked: allIdentifiers.length,
      consents_found: consents.length,
      checked_at: new Date(),
    });

  } catch (error: unknown) {
    console.error('POST /api/cookies/status/check error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Failed to check bulk status', message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}