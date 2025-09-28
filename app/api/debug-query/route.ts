import { NextResponse } from 'next/server';
import { debugProductQuery } from '@/lib/shopify';

export async function GET() {
  try {
    const result = await debugProductQuery();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API /debug-query Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to execute debug product query.',
        error: error.message
      },
      { status: 500 }
    );
  }
}