import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userProfile = await prisma.user_profiles.findFirst({
      where: { clerk_user_id: userId },
      select: {
        role: true,
        purchase_type: true,
        created_at: true,
      },
    });

    if (!userProfile) {
      return NextResponse.json({
        role: 'standard',
        purchase_type: null,
        message: 'User profile not found, defaulting to standard',
      });
    }

    return NextResponse.json({
      role: userProfile.role || 'standard',
      purchase_type: userProfile.purchase_type,
      created_at: userProfile.created_at,
    });
  } catch (error) {
    console.error('Error fetching user role:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user role' },
      { status: 500 }
    );
  }
}
