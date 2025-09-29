import { createHash, createHmac, randomBytes } from 'crypto';

// ENTERPRISE LICENSE VALIDATION SYSTEM
// Server-side cryptographic license verification to prevent piracy

export interface LicenseValidationRequest {
  licenseKey: string;
  productId: string;
  userEmail?: string;
  hardwareFingerprint?: string;
  activationType: 'activation' | 'verification' | 'deactivation';
}

export interface LicenseValidationResponse {
  valid: boolean;
  license?: {
    licenseKey: string;
    productId: string;
    licenseType: string;
    maxSeats: number;
    usedSeats: number;
    expiresAt?: string;
    issuedTo: string;
    activatedDevices: number;
    maxDevices: number;
    features: {
      commercialUse: boolean;
      teamUse: boolean;
      extendedSupport: boolean;
      sourceCodeIncluded: boolean;
      redistributionAllowed: boolean;
      customizationAllowed: boolean;
    };
  };
  error?: string;
  activationId?: string; // For new activations
}

// Enterprise license structure
export interface EnterpriseLicense {
  licenseKey: string;
  productId: string;
  licenseType: 'Personal' | 'Commercial' | 'Extended' | 'Enterprise' | 'Developer';
  maxSeats: number;
  usedSeats: number;
  issuedTo: string;
  issuedAt: Date;
  expiresAt?: Date;
  activatedDevices: string[]; // Hardware fingerprints
  maxDevices: number;
  revoked: boolean;
  signature: string; // Cryptographic signature
}

// In production, this would be a secure database
// Using Map for demonstration - implement with PostgreSQL/MongoDB
export const licenseDatabase = new Map<string, EnterpriseLicense>();

// Enterprise license signing key (in production, use HSM or secure key management)
export const LICENSE_SIGNING_SECRET = process.env.LICENSE_SIGNING_SECRET || 'enterprise-license-signing-key-v1';

// Generate cryptographic signature for license
export function signLicense(license: Omit<EnterpriseLicense, 'signature'>): string {
  const licenseData = JSON.stringify({
    licenseKey: license.licenseKey,
    productId: license.productId,
    licenseType: license.licenseType,
    maxSeats: license.maxSeats,
    issuedTo: license.issuedTo,
    issuedAt: license.issuedAt.toISOString(),
    expiresAt: license.expiresAt?.toISOString(),
    maxDevices: license.maxDevices
  });

  return createHmac('sha256', LICENSE_SIGNING_SECRET)
    .update(licenseData)
    .digest('hex');
}

// Verify license signature
export function verifyLicenseSignature(license: EnterpriseLicense): boolean {
  const expectedSignature = signLicense(license);
  return license.signature === expectedSignature;
}

// Generate secure license key
export function generateLicenseKey(productId: string, licenseType: string): string {
  const timestamp = Date.now().toString(36);
  const random = randomBytes(8).toString('hex');
  const typePrefix = licenseType.substring(0, 3).toUpperCase();
  const productHash = createHash('md5').update(productId).digest('hex').substring(0, 8);

  return `${typePrefix}-${productHash}-${timestamp}-${random}`.toUpperCase();
}

// Generate hardware fingerprint (for device binding)
export function generateHardwareFingerprint(userAgent: string, ip: string): string {
  const fingerprintData = `${userAgent}|${ip}|${Date.now()}`;
  return createHash('sha256').update(fingerprintData).digest('hex').substring(0, 16);
}

// Create new enterprise license (called during purchase fulfillment)
export async function createEnterpriseLicense(
  productId: string,
  licenseType: string,
  maxSeats: number,
  issuedTo: string,
  maxDevices: number = 3,
  expirationMonths?: number
): Promise<EnterpriseLicense> {
  const licenseKey = generateLicenseKey(productId, licenseType);
  const now = new Date();
  const expiresAt = expirationMonths ? new Date(now.getTime() + expirationMonths * 30 * 24 * 60 * 60 * 1000) : undefined;

  const license: Omit<EnterpriseLicense, 'signature'> = {
    licenseKey,
    productId,
    licenseType: licenseType as EnterpriseLicense['licenseType'],
    maxSeats,
    usedSeats: 0,
    issuedTo,
    issuedAt: now,
    expiresAt,
    activatedDevices: [],
    maxDevices,
    revoked: false
  };

  const signature = signLicense(license);
  const signedLicense: EnterpriseLicense = { ...license, signature };

  // Store in database
  licenseDatabase.set(licenseKey, signedLicense);

  console.log(`🔐 Enterprise license created: ${licenseKey} for ${issuedTo}`);
  return signedLicense;
}