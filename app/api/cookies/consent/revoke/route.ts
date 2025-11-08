/**
 * Cookie Consent Revocation API
 * Handles explicit consent revocation
 *
 * @fileoverview API endpoint for users to revoke non-essential cookie consent
 * @version 1.0
 * @compliance CCPA, PIPEDA, UK GDPR, Australia Privacy Act
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/cookies/consent/revoke
 * Revoke all non-essential cookie consent (keeps essential cookies)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = await auth();

    // Get session ID for anonymous users
    const body = await request.json();
    const { session_id, reason } = body;

    if (!userId && !session_id) {
      return NextResponse.json(
        { error: 'User ID or session ID required for consent revocation' },
        { status: 400 }
      );
    }

    // Build where clause
    const whereClause: any = {
      OR: [
        ...(userId ? [{ clerk_user_id: userId }] : []),
        ...(session_id ? [{ session_id }] : []),
      ],
      is_active: true,
    };

    // Find active consent records
    const activeConsents = await prisma.cookie_consent_records.findMany({
      where: whereClause,
    });

    if (activeConsents.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active consent records to revoke',
        revoked_count: 0,
      });
    }

    // Extract request metadata
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     request.headers.get('x-real-ip') ||
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Revoke all active consents
    const revokedConsents = await Promise.all(
      activeConsents.map(async (consent) => {
        // Store previous state for audit
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
            change_reason: reason || 'User explicitly revoked non-essential cookies',
            ip_address: ipAddress,
            user_agent: userAgent,
          },
        });

        return updated;
      })
    );

    return NextResponse.json({
      success: true,
      message: 'Non-essential cookie consent successfully revoked',
      revoked_count: revokedConsents.length,
      current_preferences: {
        essential_cookies: true,
        analytics_cookies: false,
        marketing_cookies: false,
        preferences_cookies: false,
      },
      revoked_at: new Date(),
    });

  } catch (error: unknown) {
    console.error('POST /api/cookies/consent/revoke error:', error);

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