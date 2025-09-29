import { NextRequest, NextResponse } from 'next/server';
import {
  LicenseValidationRequest,
  LicenseValidationResponse,
  licenseDatabase,
  verifyLicenseSignature,
  generateHardwareFingerprint
} from '@/lib/license';

// Rate limiting for license validation
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(request: NextRequest): boolean {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  const key = `license-validate:${ip}`;

  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100; // Reasonable for license validation

  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(request: NextRequest): Promise<NextResponse<LicenseValidationResponse>> {
  try {
    // Rate limiting
    if (!checkRateLimit(request)) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Rate limit exceeded. Please try again later.'
        },
        { status: 429 }
      );
    }

    const body: LicenseValidationRequest = await request.json();

    // Validate request
    if (!body.licenseKey || !body.productId) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Invalid request: licenseKey and productId are required'
        },
        { status: 400 }
      );
    }

    // Retrieve license from database
    const license = licenseDatabase.get(body.licenseKey);

    if (!license) {
      return NextResponse.json(
        {
          valid: false,
          error: 'License key not found'
        },
        { status: 404 }
      );
    }

    // Verify cryptographic signature
    if (!verifyLicenseSignature(license)) {
      console.error(`🚨 License signature verification failed: ${body.licenseKey}`);
      return NextResponse.json(
        {
          valid: false,
          error: 'License signature invalid'
        },
        { status: 403 }
      );
    }

    // Check if license is revoked
    if (license.revoked) {
      return NextResponse.json(
        {
          valid: false,
          error: 'License has been revoked'
        },
        { status: 403 }
      );
    }

    // Check product ID match
    if (license.productId !== body.productId) {
      return NextResponse.json(
        {
          valid: false,
          error: 'License not valid for this product'
        },
        { status: 403 }
      );
    }

    // Check expiration
    if (license.expiresAt && new Date() > license.expiresAt) {
      return NextResponse.json(
        {
          valid: false,
          error: 'License has expired'
        },
        { status: 403 }
      );
    }

    // Handle different activation types
    let activationId: string | undefined;

    if (body.activationType === 'activation') {
      // Device activation
      if (body.hardwareFingerprint) {
        if (!license.activatedDevices.includes(body.hardwareFingerprint)) {
          if (license.activatedDevices.length >= license.maxDevices) {
            return NextResponse.json(
              {
                valid: false,
                error: `Maximum device limit reached (${license.maxDevices} devices)`
              },
              { status: 403 }
            );
          }

          // Add device to activated list
          license.activatedDevices.push(body.hardwareFingerprint);
          licenseDatabase.set(body.licenseKey, license);

          activationId = generateHardwareFingerprint(
            request.headers.get('user-agent') || 'unknown',
            request.headers.get('x-forwarded-for') || 'unknown'
          );

          console.log(`📱 Device activated for license: ${body.licenseKey}`);
        }
      }
    } else if (body.activationType === 'deactivation') {
      // Device deactivation
      if (body.hardwareFingerprint) {
        const deviceIndex = license.activatedDevices.indexOf(body.hardwareFingerprint);
        if (deviceIndex > -1) {
          license.activatedDevices.splice(deviceIndex, 1);
          licenseDatabase.set(body.licenseKey, license);
          console.log(`📱 Device deactivated for license: ${body.licenseKey}`);
        }
      }
    }

    // Get license features based on type
    const getLicenseFeatures = (licenseType: string) => {
      const featureMap = {
        'Personal': {
          commercialUse: false,
          teamUse: false,
          extendedSupport: false,
          sourceCodeIncluded: false,
          redistributionAllowed: false,
          customizationAllowed: true,
        },
        'Commercial': {
          commercialUse: true,
          teamUse: true,
          extendedSupport: true,
          sourceCodeIncluded: false,
          redistributionAllowed: false,
          customizationAllowed: true,
        },
        'Extended': {
          commercialUse: true,
          teamUse: true,
          extendedSupport: true,
          sourceCodeIncluded: true,
          redistributionAllowed: true,
          customizationAllowed: true,
        },
        'Enterprise': {
          commercialUse: true,
          teamUse: true,
          extendedSupport: true,
          sourceCodeIncluded: true,
          redistributionAllowed: true,
          customizationAllowed: true,
        },
        'Developer': {
          commercialUse: true,
          teamUse: true,
          extendedSupport: true,
          sourceCodeIncluded: true,
          redistributionAllowed: false,
          customizationAllowed: true,
        }
      };

      return featureMap[licenseType as keyof typeof featureMap] || featureMap['Personal'];
    };

    // Return validated license information
    const response: LicenseValidationResponse = {
      valid: true,
      license: {
        licenseKey: license.licenseKey,
        productId: license.productId,
        licenseType: license.licenseType,
        maxSeats: license.maxSeats,
        usedSeats: license.usedSeats,
        expiresAt: license.expiresAt?.toISOString(),
        issuedTo: license.issuedTo,
        activatedDevices: license.activatedDevices.length,
        maxDevices: license.maxDevices,
        features: getLicenseFeatures(license.licenseType)
      },
      ...(activationId && { activationId })
    };

    // Log successful validation for monitoring
    console.log(`✅ License validated: ${body.licenseKey} for ${body.productId}`);

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('License validation error:', error);

    let errorMessage = 'License validation failed';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;

      if (errorMessage.includes('authentication') || errorMessage.includes('unauthorized')) {
        statusCode = 401;
      } else if (errorMessage.includes('rate limit')) {
        statusCode = 429;
      }
    }

    return NextResponse.json(
      {
        valid: false,
        error: errorMessage
      },
      { status: statusCode }
    );
  }
}

// GET endpoint for license information (read-only)
export async function GET(request: NextRequest): Promise<NextResponse<LicenseValidationResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const licenseKey = searchParams.get('licenseKey');
    const productId = searchParams.get('productId');

    if (!licenseKey || !productId) {
      return NextResponse.json(
        {
          valid: false,
          error: 'licenseKey and productId parameters are required'
        },
        { status: 400 }
      );
    }

    // Delegate to POST handler with verification type
    const validationRequest: LicenseValidationRequest = {
      licenseKey,
      productId,
      activationType: 'verification'
    };

    return POST(new Request(request.url, {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify(validationRequest)
    }) as NextRequest);

  } catch (error) {
    console.error('License info retrieval error:', error);

    return NextResponse.json(
      {
        valid: false,
        error: 'Failed to retrieve license information'
      },
      { status: 500 }
    );
  }
}