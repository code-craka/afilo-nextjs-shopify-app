import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/shopify';

export async function GET() {
  try {
    const result = await testConnection();
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('API /test-connection Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to connect to Shopify.',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}