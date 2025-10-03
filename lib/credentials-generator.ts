import crypto from 'crypto';
import bcrypt from 'bcrypt';

export interface UserCredentials {
  email: string;
  username: string;
  temporaryPassword: string;
  hashedPassword: string;
  accountId: string;
  planTier: string;
  userLimit: string;
}

/**
 * Generate secure credentials for new subscription customer
 *
 * @param customerEmail - Customer's email address
 * @param planTier - Plan tier (professional, business, enterprise, enterprise_plus)
 * @param userLimit - Maximum number of users allowed
 * @returns UserCredentials object with username, temporary password, and account details
 */
export async function generateUserCredentials(
  customerEmail: string,
  planTier: string,
  userLimit: string
): Promise<UserCredentials> {
  // Generate unique username from email
  const username = customerEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  const timestamp = Date.now().toString(36);
  const uniqueUsername = `${username}_${timestamp}`;

  // Generate secure random password (16 characters)
  // Uses crypto.randomBytes for cryptographically strong randomness
  const temporaryPassword = crypto.randomBytes(12).toString('base64').slice(0, 16);

  // Hash password for storage (bcrypt with 12 rounds)
  const hashedPassword = await bcrypt.hash(temporaryPassword, 12);

  // Generate unique account ID
  const accountId = `acc_${crypto.randomBytes(16).toString('hex')}`;

  return {
    email: customerEmail,
    username: uniqueUsername,
    temporaryPassword, // Send this in email
    hashedPassword, // Store this in database
    accountId,
    planTier,
    userLimit,
  };
}

/**
 * Generate login link for customer
 *
 * @param accountId - Unique account identifier
 * @returns Full URL to login page with account parameter
 */
export function generateLoginLink(accountId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.afilo.io';
  return `${baseUrl}/login?account=${accountId}`;
}

/**
 * Verify temporary password against stored hash
 *
 * @param password - Plain text password to verify
 * @param hashedPassword - Stored bcrypt hash
 * @returns True if password matches, false otherwise
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

/**
 * Generate new secure password for password reset
 *
 * @returns Object with new temporary password and its hash
 */
export async function generateNewPassword(): Promise<{
  temporaryPassword: string;
  hashedPassword: string;
}> {
  const temporaryPassword = crypto.randomBytes(12).toString('base64').slice(0, 16);
  const hashedPassword = await bcrypt.hash(temporaryPassword, 12);

  return {
    temporaryPassword,
    hashedPassword,
  };
}
