# Authentication Patterns

Clerk-based authentication patterns for Next.js App Router API routes.

## Basic Authentication

```typescript
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Authenticated logic here
}
```

## User Context Retrieval

```typescript
import { currentUser } from '@clerk/nextjs/server';

export async function GET() {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Access user.emailAddresses, user.firstName, etc.
}
```

## Role-Based Access Control

```typescript
export async function POST(request: NextRequest) {
  const { userId, sessionClaims } = await auth();

  const userRole = sessionClaims?.metadata?.role || 'standard';

  if (userRole !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  // Admin-only logic
}
```

## Database User Linking

```typescript
import { prisma } from '@/lib/prisma';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return unauthorized();

  // Link Clerk user to database profile
  const userProfile = await prisma.user_profiles.findUnique({
    where: { clerk_user_id: userId }
  });

  if (!userProfile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  // Use userProfile data
}
```

## Session Management

```typescript
// Get session information
const { userId, sessionId, sessionClaims } = await auth();

// Check session validity
if (!sessionId) {
  return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
}

// Access custom claims
const subscriptionTier = sessionClaims?.metadata?.subscription_tier;
```

## Webhook Authentication

```typescript
import { Webhook } from 'svix';

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('Missing webhook secret');
  }

  const payload = await request.text();
  const headers = {
    'svix-id': request.headers.get('svix-id')!,
    'svix-timestamp': request.headers.get('svix-timestamp')!,
    'svix-signature': request.headers.get('svix-signature')!,
  };

  const wh = new Webhook(webhookSecret);
  const evt = wh.verify(payload, headers);

  // Process webhook event
}
```

## Error Responses

```typescript
function unauthorized() {
  return NextResponse.json({
    error: 'Authentication required',
    code: 'UNAUTHORIZED'
  }, { status: 401 });
}

function forbidden() {
  return NextResponse.json({
    error: 'Insufficient permissions',
    code: 'FORBIDDEN'
  }, { status: 403 });
}
```

## Common Patterns

### Admin Route Protection
```typescript
export async function DELETE(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return unauthorized();

  const isAdmin = await checkAdminRole(userId);
  if (!isAdmin) return forbidden();

  // Admin deletion logic
}
```

### User Data Isolation
```typescript
export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return unauthorized();

  // Only return data owned by authenticated user
  const userProducts = await prisma.products.findMany({
    where: { owner_id: userId }
  });

  return NextResponse.json({ products: userProducts });
}
```

## Integration with Stripe

```typescript
// Link authenticated user to Stripe customer
const stripeCustomer = await stripe.customers.list({
  email: user.emailAddresses[0].emailAddress,
  limit: 1
});

if (stripeCustomer.data.length === 0) {
  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email: user.emailAddresses[0].emailAddress,
    name: `${user.firstName} ${user.lastName}`,
    metadata: {
      clerk_user_id: userId
    }
  });
}
```