/**
 * Server-Side Encryption Utilities for Sensitive Data
 *
 * AES-256-GCM encryption for PCI DSS compliance
 * Used for storing sensitive bank account information (ACH authorizations)
 *
 * IMPORTANT SECURITY NOTES:
 * - ENCRYPTION_KEY must be 32 bytes (64 hex characters)
 * - Store ENCRYPTION_KEY in environment variables, NEVER in code
 * - Rotate keys periodically and re-encrypt data
 * - Use Hardware Security Module (HSM) for production
 *
 * @see https://www.pcisecuritystandards.org/
 */

import crypto from 'crypto';

/**
 * Encryption algorithm configuration
 */
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // GCM standard IV length
const AUTH_TAG_LENGTH = 16; // GCM authentication tag length
const SALT_LENGTH = 32;

/**
 * Get encryption key from environment
 * CRITICAL: This must be a 32-byte (256-bit) key stored securely
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable not set - cannot encrypt sensitive data');
  }

  // Validate key format (should be 64 hex characters = 32 bytes)
  if (!/^[0-9a-f]{64}$/i.test(key)) {
    throw new Error('ENCRYPTION_KEY must be a 64-character hexadecimal string (32 bytes)');
  }

  return Buffer.from(key, 'hex');
}

/**
 * Encrypt sensitive data using AES-256-GCM
 *
 * @param plaintext - The data to encrypt
 * @returns Encrypted data in format: iv:authTag:encryptedData (hex encoded)
 *
 * @example
 * ```typescript
 * const encrypted = encryptSensitiveData('123456789');
 * // Returns: "a1b2c3....:d4e5f6....:g7h8i9...."
 * ```
 */
export function encryptSensitiveData(plaintext: string): string {
  try {
    const key = getEncryptionKey();

    // Generate random IV (Initialization Vector)
    const iv = crypto.randomBytes(IV_LENGTH);

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Encrypt the data
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Get authentication tag (for GCM mode integrity check)
    const authTag = cipher.getAuthTag();

    // Return format: iv:authTag:encrypted (all hex encoded)
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt sensitive data');
  }
}

/**
 * Decrypt sensitive data encrypted with encryptSensitiveData
 *
 * @param ciphertext - Encrypted data in format: iv:authTag:encryptedData
 * @returns Decrypted plaintext
 *
 * @example
 * ```typescript
 * const decrypted = decryptSensitiveData(encrypted);
 * // Returns: "123456789"
 * ```
 */
export function decryptSensitiveData(ciphertext: string): string {
  try {
    const key = getEncryptionKey();

    // Split the ciphertext into components
    const parts = ciphertext.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid ciphertext format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    // Validate component lengths
    if (iv.length !== IV_LENGTH) {
      throw new Error('Invalid IV length');
    }
    if (authTag.length !== AUTH_TAG_LENGTH) {
      throw new Error('Invalid authentication tag length');
    }

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    // Decrypt the data
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt sensitive data - data may be corrupted or key may be incorrect');
  }
}

/**
 * Hash sensitive data for comparison without decryption
 * Useful for verifying data without exposing plaintext
 *
 * @param data - Data to hash
 * @param salt - Optional salt (will generate if not provided)
 * @returns Hash in format: salt:hash (hex encoded)
 */
export function hashSensitiveData(data: string, salt?: string): string {
  try {
    // Generate or use provided salt
    const saltBuffer = salt
      ? Buffer.from(salt, 'hex')
      : crypto.randomBytes(SALT_LENGTH);

    // Use PBKDF2 with high iteration count for security
    const hash = crypto.pbkdf2Sync(
      data,
      saltBuffer,
      100000, // iterations
      64, // key length
      'sha512'
    );

    return `${saltBuffer.toString('hex')}:${hash.toString('hex')}`;
  } catch (error) {
    console.error('Hashing error:', error);
    throw new Error('Failed to hash sensitive data');
  }
}

/**
 * Verify hashed data
 *
 * @param data - Plaintext data to verify
 * @param hashedData - Previously hashed data in format: salt:hash
 * @returns True if data matches hash
 */
export function verifySensitiveData(data: string, hashedData: string): boolean {
  try {
    const parts = hashedData.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid hashed data format');
    }

    const salt = parts[0];
    const existingHash = parts[1];

    // Hash the input data with the same salt
    const newHash = hashSensitiveData(data, salt);
    const newHashValue = newHash.split(':')[1];

    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(existingHash, 'hex'),
      Buffer.from(newHashValue, 'hex')
    );
  } catch (error) {
    console.error('Verification error:', error);
    return false;
  }
}

/**
 * Generate a secure encryption key for ENCRYPTION_KEY environment variable
 * ONLY use this during initial setup, NEVER in production code
 *
 * @returns 64-character hex string (32 bytes)
 *
 * @example
 * ```bash
 * # Generate key once and add to .env.local:
 * ENCRYPTION_KEY=a1b2c3d4e5f6...
 * ```
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Mask sensitive data for display (e.g., routing numbers, account numbers)
 *
 * @param data - Data to mask
 * @param visibleChars - Number of characters to show at end (default: 4)
 * @returns Masked string
 *
 * @example
 * ```typescript
 * maskSensitiveData('123456789', 4) // Returns: "*****6789"
 * ```
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (data.length <= visibleChars) {
    return '*'.repeat(data.length);
  }

  const maskedLength = data.length - visibleChars;
  const masked = '*'.repeat(maskedLength);
  const visible = data.slice(-visibleChars);

  return masked + visible;
}

/**
 * Securely wipe sensitive data from memory
 * Use when done processing sensitive data to prevent memory dumps
 *
 * @param data - Data to wipe
 */
export function wipeSensitiveData(data: string): void {
  // Note: JavaScript strings are immutable, so this function is effectively a no-op
  // In production, consider using Buffer or typed arrays for truly sensitive data
  // that needs to be wiped from memory
  if (typeof data === 'string' && data.length > 0) {
    // Strings in JavaScript are immutable - this is a placeholder for documentation
    // Real implementation would require Buffer.from(data) and buffer.fill(0)
    void data; // Acknowledge the parameter
  }
}

/**
 * Validate encryption configuration
 * Call this on application startup to ensure encryption is properly configured
 */
export function validateEncryptionConfig(): { valid: boolean; error?: string } {
  try {
    if (!process.env.ENCRYPTION_KEY) {
      return {
        valid: false,
        error: 'ENCRYPTION_KEY environment variable not set'
      };
    }

    if (!/^[0-9a-f]{64}$/i.test(process.env.ENCRYPTION_KEY)) {
      return {
        valid: false,
        error: 'ENCRYPTION_KEY must be a 64-character hexadecimal string'
      };
    }

    // Test encryption/decryption
    const testData = 'test_encryption_validation';
    const encrypted = encryptSensitiveData(testData);
    const decrypted = decryptSensitiveData(encrypted);

    if (decrypted !== testData) {
      return {
        valid: false,
        error: 'Encryption test failed - encryption/decryption mismatch'
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown encryption validation error'
    };
  }
}
