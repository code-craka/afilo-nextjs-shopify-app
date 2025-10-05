import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// Define protected routes (require authentication)
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/enterprise(.*)',
  '/account(.*)',
  '/api/users(.*)',
  '/api/downloads(.*)',
]);

// Define subscription-required routes (require active paid subscription)
const isSubscriptionRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/downloads(.*)',
  '/api/keys(.*)',
]);

// Define public routes (no authentication required)
const isPublicRoute = createRouteMatcher([
  '/',
  '/products(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback',
  '/api/webhooks(.*)',
  '/api/cart(.*)',
  '/api/shopify(.*)',
  '/api/collections(.*)',
]);

// Security headers
const SECURITY_HEADERS = {
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

// Rate limiting storage
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Rate limit rules
const RATE_LIMIT_RULES: Record<string, { maxRequests: number; windowMs: number }> = {
  '/api/cart': { maxRequests: 60, windowMs: 60000 },
  '/api/users': { maxRequests: 20, windowMs: 60000 },
  '/api/webhooks': { maxRequests: 100, windowMs: 60000 },
  'default': { maxRequests: 100, windowMs: 60000 }
};

function checkRateLimit(req: NextRequest): boolean {
  const pathname = new URL(req.url).pathname;
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

  // Find matching rate limit rule
  let rule = RATE_LIMIT_RULES['default'];
  for (const [path, pathRule] of Object.entries(RATE_LIMIT_RULES)) {
    if (pathname.startsWith(path)) {
      rule = pathRule;
      break;
    }
  }

  const key = `${ip}:${pathname}`;
  const now = Date.now();

  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + rule.windowMs });
    return true;
  }

  if (record.count >= rule.maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

export default clerkMiddleware(async (auth, req) => {
  try {
    // Apply rate limiting to API routes
    if (req.nextUrl.pathname.startsWith('/api/')) {
      if (!checkRateLimit(req)) {
        return NextResponse.json(
          { error: 'Rate limit exceeded' },
          { status: 429 }
        );
      }
    }

    // Protect routes that require authentication
    if (isProtectedRoute(req)) {
      try {
        await auth.protect();
      } catch (error) {
        // Handle Clerk authentication errors (e.g., JWKS kid mismatch)
        if (error instanceof Error && error.message.includes('jwk-kid-mismatch')) {
          console.error('⚠️ Clerk JWKS mismatch detected. Clearing session and redirecting to sign-in.');

          // Create response that clears Clerk cookies
          const response = NextResponse.redirect(new URL('/sign-in?error=session_expired', req.url));

          // Clear all Clerk-related cookies
          response.cookies.delete('__session');
          response.cookies.delete('__clerk_db_jwt');

          return response;
        }
        throw error;
      }
    }

    // Check subscription for premium routes (dashboard, downloads, etc.)
    // Note: Subscription check happens client-side in dashboard/page.tsx
    // to avoid middleware performance impact. Server-side validation
    // happens in API routes that serve sensitive data.

    // Redirect authenticated users away from auth pages
    if (isPublicRoute(req) && (req.nextUrl.pathname === '/sign-in' || req.nextUrl.pathname === '/sign-up')) {
      try {
        const { userId } = await auth();
        if (userId) {
          return NextResponse.redirect(new URL('/dashboard', req.url));
        }
      } catch (error) {
        // Silently handle auth check errors on public routes
        console.error('Auth check error on public route:', error);
      }
    }

    // Create response
    const response = NextResponse.next();

    // Add security headers to all responses
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    console.error('Middleware error:', error);

    // On critical errors, allow request to continue but clear auth cookies
    const response = NextResponse.next();
    response.cookies.delete('__session');
    response.cookies.delete('__clerk_db_jwt');

    return response;
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};