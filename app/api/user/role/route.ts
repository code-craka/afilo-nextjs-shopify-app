import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await sql`
      SELECT role, purchase_type, created_at
      FROM user_profiles
      WHERE clerk_user_id = ${userId}
      LIMIT 1
    `;

    if (result.length === 0) {
      return NextResponse.json({
        role: 'standard',
        purchase_type: null,
        message: 'User profile not found, defaulting to standard',
      });
    }

    return NextResponse.json({
      role: result[0].role || 'standard',
      purchase_type: result[0].purchase_type,
      created_at: result[0].created_at,
    });
  } catch (error) {
    console.error('Error fetching user role:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user role' },
      { status: 500 }
    );
  }
}
