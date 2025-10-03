import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

/**
 * Check user authentication status
 *
 * Used by cart checkout flow to verify user is logged in
 * before proceeding to payment
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({
        authenticated: false,
        userId: null
      });
    }

    return NextResponse.json({
      authenticated: true,
      userId
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      {
        authenticated: false,
        userId: null,
        error: 'Authentication check failed'
      },
      { status: 500 }
    );
  }
}
