/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Centralized Error Handling Utilities
 *
 * Provides type-safe error handling for API routes and components.
 * Fixes 43+ "error is of type 'unknown'" TypeScript errors across the codebase.
 */

/**
 * Custom API Error class for structured error responses
 */
export class ApiError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    code: string = 'INTERNAL_ERROR',
    statusCode: number = 500,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Common error codes used across the application
 */
export const ERROR_CODES = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_TOKEN: 'INVALID_TOKEN',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // Stripe/Billing
  STRIPE_ERROR: 'STRIPE_ERROR',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  SUBSCRIPTION_ERROR: 'SUBSCRIPTION_ERROR',
  INVOICE_ERROR: 'INVOICE_ERROR',

  // Database
  DATABASE_ERROR: 'DATABASE_ERROR',
  RECORD_NOT_FOUND: 'RECORD_NOT_FOUND',

  // External Services
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',

  // Generic
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

/**
 * Type guard to check if error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Type guard to check if error is a standard Error
 */
export function isStandardError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Type guard to check if error is a Stripe error
 */
export function isStripeError(error: unknown): error is { type: string; message: string; code?: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    'message' in error &&
    typeof (error as any).type === 'string' &&
    typeof (error as any).message === 'string'
  );
}

/**
 * Formats any unknown error into a structured format
 */
export function formatError(error: unknown): {
  message: string;
  code: string;
  statusCode: number;
  details?: Record<string, unknown>;
} {
  // Handle ApiError
  if (isApiError(error)) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
    };
  }

  // Handle Stripe errors
  if (isStripeError(error)) {
    return {
      message: error.message,
      code: ERROR_CODES.STRIPE_ERROR,
      statusCode: 400,
      details: { stripeType: error.type, stripeCode: error.code },
    };
  }

  // Handle standard Error
  if (isStandardError(error)) {
    return {
      message: error.message,
      code: ERROR_CODES.INTERNAL_ERROR,
      statusCode: 500,
    };
  }

  // Handle unknown errors
  return {
    message: 'An unknown error occurred',
    code: ERROR_CODES.UNKNOWN_ERROR,
    statusCode: 500,
    details: { originalError: String(error) },
  };
}

/**
 * Creates a standardized error response for API routes
 */
export function createErrorResponse(error: unknown) {
  const formatted = formatError(error);

  return Response.json(
    {
      success: false,
      error: {
        message: formatted.message,
        code: formatted.code,
        ...(formatted.details && { details: formatted.details }),
      },
    },
    { status: formatted.statusCode }
  );
}

/**
 * Logs error with context information
 */
export function logError(
  context: string,
  error: unknown,
  additionalData?: Record<string, unknown>
) {
  const formatted = formatError(error);

  console.error(`[${context}] Error:`, {
    message: formatted.message,
    code: formatted.code,
    statusCode: formatted.statusCode,
    details: formatted.details,
    additionalData,
    stack: isStandardError(error) ? error.stack : undefined,
  });
}

/**
 * Helper to safely access error message
 */
export function getErrorMessage(error: unknown): string {
  const formatted = formatError(error);
  return formatted.message;
}

/**
 * Helper to safely access error code
 */
export function getErrorCode(error: unknown): string {
  const formatted = formatError(error);
  return formatted.code;
}

/**
 * Creates specific error types for common scenarios
 */
export const createError = {
  validation: (message: string, details?: Record<string, unknown>) =>
    new ApiError(message, ERROR_CODES.VALIDATION_ERROR, 400, details),

  unauthorized: (message: string = 'Unauthorized') =>
    new ApiError(message, ERROR_CODES.UNAUTHORIZED, 401),

  forbidden: (message: string = 'Forbidden') =>
    new ApiError(message, ERROR_CODES.FORBIDDEN, 403),

  notFound: (message: string = 'Not found') =>
    new ApiError(message, ERROR_CODES.RECORD_NOT_FOUND, 404),

  stripe: (message: string, details?: Record<string, unknown>) =>
    new ApiError(message, ERROR_CODES.STRIPE_ERROR, 400, details),

  database: (message: string, details?: Record<string, unknown>) =>
    new ApiError(message, ERROR_CODES.DATABASE_ERROR, 500, details),

  internal: (message: string = 'Internal server error') =>
    new ApiError(message, ERROR_CODES.INTERNAL_ERROR, 500),
};