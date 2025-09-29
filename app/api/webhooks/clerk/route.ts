import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(req: Request) {
  // Verify webhook signature
  const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!CLERK_WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET');
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    );
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret
  const wh = new Webhook(CLERK_WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return NextResponse.json(
      { error: 'Error verifying webhook' },
      { status: 400 }
    );
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data;

    // Check if user was created via OAuth
    const isOAuthUser = email_addresses.some(
      email => email.verification?.strategy.includes('oauth')
    );

    // Only auto-create profiles for OAuth users
    // (Email users create profiles via the sign-up flow)
    if (isOAuthUser) {
      try {
        // Check if profile already exists
        const existingProfile = await sql`
          SELECT * FROM user_profiles WHERE clerk_user_id = ${id}
        `;

        if (existingProfile.length === 0) {
          // Create new profile
          const primaryEmail = email_addresses[0]?.email_address;

          await sql`
            INSERT INTO user_profiles (
              clerk_user_id,
              email,
              first_name,
              last_name,
              created_at,
              oauth_signup
            )
            VALUES (
              ${id},
              ${primaryEmail || ''},
              ${first_name || ''},
              ${last_name || ''},
              NOW(),
              ${true}
            )
          `;
        }
      } catch (error) {
        console.error('Error creating user profile from webhook:', error);
      }
    }
  }

  return NextResponse.json({ success: true });
}