import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { clerkClient } from '@clerk/nextjs/server';
import { auth } from '@clerk/nextjs/server';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: Request) {
  try {
    // Verify the request is authenticated
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clerkUserId, email, firstName, lastName } = await request.json();

    // Verify the authenticated user matches the requested user creation
    if (userId !== clerkUserId) {
      return NextResponse.json({ error: 'User ID mismatch' }, { status: 403 });
    }

    // Check if profile already exists
    const existingProfile = await sql`
      SELECT * FROM user_profiles WHERE clerk_user_id = ${clerkUserId}
    `;

    if (existingProfile.length > 0) {
      return NextResponse.json({
        message: 'User profile already exists',
        profileId: existingProfile[0].id
      });
    }

    // Create new profile
    const result = await sql`
      INSERT INTO user_profiles (
        clerk_user_id,
        email,
        first_name,
        last_name,
        created_at
      )
      VALUES (
        ${clerkUserId},
        ${email},
        ${firstName || ''},
        ${lastName || ''},
        NOW()
      )
      RETURNING id
    `;

    // Get Clerk user public metadata to store subscription status
    try {
      const user = await clerkClient.users.getUser(clerkUserId);

      // Check if user was created via OAuth
      const isOAuthUser = user.emailAddresses.some(
        email => email.verification?.strategy.includes('oauth')
      );

      // Update user metadata
      await clerkClient.users.updateUser(clerkUserId, {
        publicMetadata: {
          ...user.publicMetadata,
          profileId: result[0].id,
          isOAuthUser,
        }
      });
    } catch (err) {
      console.error('Error updating Clerk user metadata:', err);
      // Continue anyway as the profile was created
    }

    return NextResponse.json({
      message: 'User profile created successfully',
      profileId: result[0].id
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to create user profile' },
      { status: 500 }
    );
  }
}