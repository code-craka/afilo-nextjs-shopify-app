/**
 * Chat Authentication Utilities
 *
 * Handles Clerk authentication for chat bot API routes.
 * Ensures secure access and proper conversation ownership validation.
 */

import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

const sql = neon(process.env.DATABASE_URL!);

// ====================================
// Authentication
// ====================================

/**
 * Get authenticated user from Clerk
 *
 * @returns User ID and full auth object
 * @throws Error if user is not authenticated
 */
export async function getAuthenticatedUser() {
  const authResult = await auth();

  if (!authResult.userId) {
    throw new Error('Unauthorized');
  }

  return {
    userId: authResult.userId,
    auth: authResult,
  };
}

/**
 * Middleware to require authentication for API routes
 *
 * Usage in API routes:
 * ```typescript
 * const { userId } = await requireAuth();
 * ```
 */
export async function requireAuth() {
  try {
    return await getAuthenticatedUser();
  } catch (error) {
    throw new Response(
      JSON.stringify({
        success: false,
        error: 'Authentication required',
        code: 'UNAUTHORIZED',
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// ====================================
// Conversation Ownership
// ====================================

/**
 * Verify that the authenticated user owns the conversation
 *
 * Prevents IDOR (Insecure Direct Object Reference) attacks.
 *
 * @param conversationId - Conversation UUID
 * @param userId - Clerk user ID
 * @returns true if user owns conversation
 */
export async function verifyConversationOwnership(
  conversationId: string,
  userId: string
): Promise<boolean> {
  try {
    const result = await sql`
      SELECT clerk_user_id
      FROM chat_conversations
      WHERE id = ${conversationId}
      LIMIT 1
    `;

    if (result.length === 0) {
      return false;
    }

    return result[0].clerk_user_id === userId;
  } catch (error) {
    console.error('[CHAT_AUTH] Error verifying conversation ownership:', error);
    return false;
  }
}

/**
 * Require conversation ownership (throws if not owned)
 *
 * Usage in API routes:
 * ```typescript
 * await requireConversationOwnership(conversationId, userId);
 * ```
 */
export async function requireConversationOwnership(
  conversationId: string,
  userId: string
): Promise<void> {
  const isOwner = await verifyConversationOwnership(conversationId, userId);

  if (!isOwner) {
    throw new Response(
      JSON.stringify({
        success: false,
        error: 'Conversation not found or access denied',
        code: 'FORBIDDEN',
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// ====================================
// User Profile
// ====================================

/**
 * Get user profile from database
 *
 * @param userId - Clerk user ID
 * @returns User profile data or null
 */
export async function getUserProfile(userId: string) {
  try {
    const result = await sql`
      SELECT
        id,
        clerk_user_id,
        email,
        first_name,
        last_name,
        subscription_tier,
        company,
        job_title,
        role,
        created_at,
        last_login
      FROM user_profiles
      WHERE clerk_user_id = ${userId}
      LIMIT 1
    `;

    if (result.length === 0) {
      return null;
    }

    return {
      id: result[0].id,
      clerkUserId: result[0].clerk_user_id,
      email: result[0].email,
      firstName: result[0].first_name,
      lastName: result[0].last_name,
      subscriptionTier: result[0].subscription_tier,
      company: result[0].company,
      jobTitle: result[0].job_title,
      role: result[0].role,
      createdAt: result[0].created_at,
      lastLogin: result[0].last_login,
    };
  } catch (error) {
    console.error('[CHAT_AUTH] Error fetching user profile:', error);
    return null;
  }
}

/**
 * Get user display name for chat UI
 *
 * @param userId - Clerk user ID
 * @returns Display name (First Last or email or "User")
 */
export async function getUserDisplayName(userId: string): Promise<string> {
  const profile = await getUserProfile(userId);

  if (!profile) {
    return 'User';
  }

  if (profile.firstName && profile.lastName) {
    return `${profile.firstName} ${profile.lastName}`;
  }

  if (profile.firstName) {
    return profile.firstName;
  }

  if (profile.email) {
    return profile.email;
  }

  return 'User';
}

// ====================================
// API Response Helpers
// ====================================

/**
 * Return unauthorized response
 */
export function unauthorizedResponse() {
  return NextResponse.json(
    {
      success: false,
      error: 'Authentication required',
      code: 'UNAUTHORIZED',
    },
    { status: 401 }
  );
}

/**
 * Return forbidden response
 */
export function forbiddenResponse(message = 'Access denied') {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code: 'FORBIDDEN',
    },
    { status: 403 }
  );
}

/**
 * Return not found response
 */
export function notFoundResponse(message = 'Resource not found') {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code: 'NOT_FOUND',
    },
    { status: 404 }
  );
}

/**
 * Return bad request response
 */
export function badRequestResponse(message: string, details?: string) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      details,
      code: 'BAD_REQUEST',
    },
    { status: 400 }
  );
}

/**
 * Return internal server error response
 */
export function serverErrorResponse(error: unknown) {
  console.error('[CHAT_AUTH] Server error:', error);

  return NextResponse.json(
    {
      success: false,
      error: 'Internal server error',
      code: 'SERVER_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error',
    },
    { status: 500 }
  );
}

// ====================================
// Request Validation
// ====================================

/**
 * Validate UUID format
 *
 * @param uuid - String to validate
 * @returns true if valid UUID
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate and sanitize string input
 *
 * @param input - Raw input string
 * @param maxLength - Maximum allowed length
 * @returns Sanitized string
 * @throws Error if validation fails
 */
export function validateString(input: unknown, maxLength = 5000): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }

  const trimmed = input.trim();

  if (trimmed.length === 0) {
    throw new Error('Input cannot be empty');
  }

  if (trimmed.length > maxLength) {
    throw new Error(`Input exceeds maximum length of ${maxLength} characters`);
  }

  return trimmed;
}

/**
 * Sanitize HTML to prevent XSS attacks
 *
 * Basic sanitization - strips potentially dangerous characters.
 * For production, consider using DOMPurify or similar library.
 *
 * @param html - HTML string to sanitize
 * @returns Sanitized HTML
 */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '');
}
