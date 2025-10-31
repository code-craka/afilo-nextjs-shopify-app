/**
 * JSON Parser Utility Module
 * Safely parses JSONB fields from PostgreSQL/Neon database
 *
 * Features:
 * - Handles both pre-parsed objects and JSON strings
 * - Security: 1MB size limit to prevent memory exhaustion attacks
 * - Environment-aware logging (detailed in dev, minimal in production)
 * - Structured error logging with context (field names, record IDs, timestamps)
 * - Graceful degradation with fallback values
 * - Real-time analytics tracking (Phase 2)
 *
 * @module lib/utils/json-parser
 */

// Dynamic import for server-only tracking (prevents client-side issues)
// Type matching the actual trackParseEvent signature from json-parse-tracker
type TrackParseEventFn = (event: {
  fieldName: string;
  recordId: string;
  success: boolean;
  duration?: number;
  size?: number;
  error?: string;
  fallbackUsed: boolean;
}) => void;

let trackParseEvent: TrackParseEventFn | null = null;
if (typeof window === 'undefined') {
  // Server-side only
  import('../analytics/json-parse-tracker')
    .then((module) => {
      trackParseEvent = module.trackParseEvent as TrackParseEventFn;
    })
    .catch(() => {
      // Silently fail if tracker not available
      trackParseEvent = null;
    });
}

/**
 * Context information for parseJsonField
 */
export interface ParseJsonContext {
  /** Name of the database field being parsed (e.g., 'images', 'availableLicenses') */
  fieldName?: string;
  /** Unique identifier of the database record (e.g., product ID, user ID) */
  recordId?: string;
  /** Maximum allowed JSON string size in bytes (default: 1MB = 1048576) */
  maxSize?: number;
}

/**
 * Safely parse JSONB fields from PostgreSQL database
 *
 * The Neon serverless driver returns JSONB in unpredictable formats:
 * - Sometimes pre-parsed objects (PostgreSQL binary JSONB)
 * - Sometimes JSON strings (HTTP transport serialization)
 * - Depends on connection pooling, proxy layer, PostgreSQL version
 *
 * This function handles all possible states the driver might return, making it
 * bulletproof against driver inconsistencies.
 *
 * @template T - The expected type of the parsed value
 * @param field - The raw database field value (can be null, object, string, etc.)
 * @param fallback - Default value to return if parsing fails
 * @param context - Optional context for logging and security validation
 * @returns The parsed value or fallback if parsing fails
 *
 * @example Basic usage
 * ```typescript
 * const images = parseJsonField<ProductImage[]>(row.images, []);
 * const metadata = parseJsonField<Metadata>(row.metadata, {});
 * ```
 *
 * @example With context for debugging
 * ```typescript
 * const licenses = parseJsonField<LicenseType[]>(
 *   row.available_licenses,
 *   [],
 *   { fieldName: 'availableLicenses', recordId: row.id }
 * );
 * ```
 *
 * @example With custom size limit
 * ```typescript
 * const smallData = parseJsonField<SmallObject>(
 *   row.data,
 *   {},
 *   { maxSize: 10240 } // 10KB limit
 * );
 * ```
 */
export function parseJsonField<T>(
  field: unknown,
  fallback: T,
  context?: ParseJsonContext
): T {
  const MAX_SIZE = context?.maxSize || 1048576; // 1MB default
  const isDev = process.env.NODE_ENV === 'development';
  const startTime = performance.now();

  // Handle null/undefined - return fallback immediately
  if (field === null || field === undefined) {
    // Track event (fallback used)
    if (trackParseEvent) {
      trackParseEvent({
        fieldName: context?.fieldName || 'unknown',
        recordId: context?.recordId || 'unknown',
        success: true,
        duration: performance.now() - startTime,
        size: 0,
        fallbackUsed: true,
      });
    }
    return fallback;
  }

  // If it's already a parsed object, return it as-is
  // This is the common case for most database drivers
  if (typeof field === 'object' && field !== null) {
    // Track event (success)
    if (trackParseEvent) {
      trackParseEvent({
        fieldName: context?.fieldName || 'unknown',
        recordId: context?.recordId || 'unknown',
        success: true,
        duration: performance.now() - startTime,
        size: JSON.stringify(field).length,
        fallbackUsed: false,
      });
    }
    return field as T;
  }

  // If it's a string, attempt to parse it as JSON
  if (typeof field === 'string') {
    // Security: Size validation to prevent memory exhaustion attacks
    // Prevents DoS from malicious database entries with gigabyte-sized JSON
    if (field.length > MAX_SIZE) {
      console.error('JSON field exceeds maximum size', {
        fieldName: context?.fieldName || 'unknown',
        recordId: context?.recordId || 'unknown',
        size: field.length,
        maxSize: MAX_SIZE,
        timestamp: new Date().toISOString(),
      });

      // Track event (size exceeded)
      if (trackParseEvent) {
        trackParseEvent({
          fieldName: context?.fieldName || 'unknown',
          recordId: context?.recordId || 'unknown',
          success: false,
          duration: performance.now() - startTime,
          size: field.length,
          error: 'Size limit exceeded',
          fallbackUsed: true,
        });
      }

      return fallback;
    }

    // Attempt to parse the JSON string
    try {
      const parsed = JSON.parse(field) as T;

      // Track event (success)
      if (trackParseEvent) {
        trackParseEvent({
          fieldName: context?.fieldName || 'unknown',
          recordId: context?.recordId || 'unknown',
          success: true,
          duration: performance.now() - startTime,
          size: field.length,
          fallbackUsed: false,
        });
      }

      return parsed;
    } catch (error) {
      // Structured error logging with context for debugging
      // Environment-aware: detailed in dev, minimal in production
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (isDev) {
        // Development: Include full error details and preview for debugging
        console.error('JSON parse failed', {
          fieldName: context?.fieldName || 'unknown',
          recordId: context?.recordId || 'unknown',
          error: errorMessage,
          timestamp: new Date().toISOString(),
          preview: field.substring(0, 100), // First 100 chars for debugging
        });
      } else {
        // Production: Minimal logging to avoid console.warn() blocking event loop
        // Reduces overhead from 100-500ms/sec to negligible
        console.error('JSON parse failed', {
          fieldName: context?.fieldName || 'unknown',
          recordId: context?.recordId || 'unknown',
          timestamp: new Date().toISOString(),
        });
      }

      // Track event (parse failure)
      if (trackParseEvent) {
        trackParseEvent({
          fieldName: context?.fieldName || 'unknown',
          recordId: context?.recordId || 'unknown',
          success: false,
          duration: performance.now() - startTime,
          size: field.length,
          error: errorMessage,
          fallbackUsed: true,
        });
      }

      return fallback;
    }
  }

  // Unexpected type (number, boolean, etc.) - return fallback
  // Track event (unexpected type)
  if (trackParseEvent) {
    trackParseEvent({
      fieldName: context?.fieldName || 'unknown',
      recordId: context?.recordId || 'unknown',
      success: false,
      duration: performance.now() - startTime,
      size: 0,
      error: `Unexpected type: ${typeof field}`,
      fallbackUsed: true,
    });
  }

  return fallback;
}

/**
 * Security constants for JSON parsing
 */
export const JSON_PARSER_CONSTANTS = {
  /** Default maximum JSON string size: 1MB */
  DEFAULT_MAX_SIZE: 1048576,
  /** Recommended maximum for user-generated content: 100KB */
  USER_CONTENT_MAX_SIZE: 102400,
  /** Recommended maximum for system metadata: 10KB */
  SYSTEM_METADATA_MAX_SIZE: 10240,
} as const;

/**
 * Pre-configured parser for cart items (strict 100KB limit)
 */
export function parseCartJsonField<T>(
  field: unknown,
  fallback: T,
  context?: Omit<ParseJsonContext, 'maxSize'>
): T {
  return parseJsonField(field, fallback, {
    ...context,
    maxSize: JSON_PARSER_CONSTANTS.USER_CONTENT_MAX_SIZE,
  });
}

/**
 * Pre-configured parser for system metadata (strict 10KB limit)
 */
export function parseSystemJsonField<T>(
  field: unknown,
  fallback: T,
  context?: Omit<ParseJsonContext, 'maxSize'>
): T {
  return parseJsonField(field, fallback, {
    ...context,
    maxSize: JSON_PARSER_CONSTANTS.SYSTEM_METADATA_MAX_SIZE,
  });
}
