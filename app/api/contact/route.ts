import { NextRequest, NextResponse } from 'next/server';

type ContactPayload = {
  name: string;
  email: string;
  company: string;
  role?: string;
  inquiryType?: string;
  subject: string;
  message: string;
  budget?: string;
  token?: string;
};

type TurnstileVerification = {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
};

function getClientIp(request: NextRequest): string | undefined {
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim();
  }

  return undefined;
}

async function verifyTurnstileToken(token: string, request: NextRequest) {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('Turnstile secret key is not configured.');
  }

  const formData = new URLSearchParams();
  formData.append('secret', secretKey);
  formData.append('response', token);

  const clientIp = getClientIp(request);
  if (clientIp) {
    formData.append('remoteip', clientIp);
  }

  const verificationResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: formData,
  });

  if (!verificationResponse.ok) {
    throw new Error('Failed to verify Turnstile token.');
  }

  const verificationData = (await verificationResponse.json()) as TurnstileVerification;

  if (!verificationData.success) {
    const errorCodes = verificationData['error-codes']?.join(', ') ?? 'unknown_error';
    throw new Error(`Turnstile verification failed: ${errorCodes}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ContactPayload;

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid request payload.' },
        { status: 400 }
      );
    }

    const { token, ...formFields } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Missing Turnstile token.' },
        { status: 400 }
      );
    }

    await verifyTurnstileToken(token, request);

    // TODO: Integrate with CRM, email, or ticketing system here.
    console.info('✅ Contact inquiry received:', {
      receivedAt: new Date().toISOString(),
      ...formFields,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to process your request right now.';
    console.error('❌ Contact submission failed:', message);

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 400 }
    );
  }
}
