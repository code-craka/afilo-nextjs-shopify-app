import { NextRequest, NextResponse } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// ENTERPRISE GLOBAL SECURITY MIDDLEWARE
// Comprehensive protection against DoS attacks, API abuse, and security threats

interface RateLimitRule {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface SecurityHeaders {
  [key: string]: string;
}

// Rate limiting storage (in production, use Redis with clustering)
const globalRateLimitMap = new Map<string, { count: number; resetTime: number; blocked: boolean }>();

// Different rate limits for different API endpoints
const RATE_LIMIT_RULES: Record<string, RateLimitRule> = {
  // Cart operations - moderate limits
  '/api/cart/': {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    skipSuccessfulRequests: false
  },

  // License validation - higher limits for legitimate use
  '/api/licenses/': {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 200,
    skipSuccessfulRequests: true
  },

  // Checkout operations - very strict
  '/api/cart/checkout': {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10,
    skipSuccessfulRequests: false
  },

  // General API endpoints
  '/api/': {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000,
    skipSuccessfulRequests: true
  }
};

// Security headers for enterprise protection
const SECURITY_HEADERS: SecurityHeaders = {
  // Prevent XSS attacks
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',

  // HTTPS enforcement
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

  // Content Security Policy
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.shopify.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https://api.shopify.com https://*.myshopify.com; frame-src 'none';",

  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions policy
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(self)',

  // Enterprise security headers
  'X-Enterprise-Security': 'enabled',
  'X-Rate-Limit-Policy': 'enterprise'
};

// Blocked IP addresses (in production, use external threat intelligence)
const BLOCKED_IPS = new Set<string>([
  // Add known malicious IPs here
]);

// Suspicious patterns that trigger additional scrutiny
const SUSPICIOUS_PATTERNS = [
  /bot|crawler|spider|scraper/i,
  /scan|hack|exploit|inject/i,
  /\.\./,  // Directory traversal
  /<script/i, // XSS attempts
  /union.*select/i, // SQL injection
];

// Get client IP address
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfIP = request.headers.get('cf-connecting-ip');

  return (
    cfIP ||
    realIP ||
    (forwarded ? forwarded.split(',')[0].trim() : 'unknown')
  );
}

// Generate rate limit key
function getRateLimitKey(ip: string, endpoint: string): string {
  return `${ip}:${endpoint}`;
}

// Check if request matches suspicious patterns
function isSuspiciousRequest(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent') || '';
  const url = request.url;
  const referer = request.headers.get('referer') || '';

  return SUSPICIOUS_PATTERNS.some(pattern =>
    pattern.test(userAgent) ||
    pattern.test(url) ||
    pattern.test(referer)
  );
}

// Get appropriate rate limit rule for endpoint
function getRateLimitRule(pathname: string): RateLimitRule {
  // Find the most specific matching rule
  const matchingRules = Object.entries(RATE_LIMIT_RULES)
    .filter(([path]) => pathname.startsWith(path))
    .sort((a, b) => b[0].length - a[0].length); // Sort by specificity

  return matchingRules[0]?.[1] || RATE_LIMIT_RULES['/api/'];
}

// Check rate limit for request
function checkRateLimit(request: NextRequest): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  rule: RateLimitRule;
} {
  const ip = getClientIP(request);
  const pathname = new URL(request.url).pathname;
  const rule = getRateLimitRule(pathname);
  const key = getRateLimitKey(ip, pathname);

  const now = Date.now();
  const record = globalRateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    // Reset or create new record
    const newRecord = {
      count: 1,
      resetTime: now + rule.windowMs,
      blocked: false
    };
    globalRateLimitMap.set(key, newRecord);

    return {
      allowed: true,
      remaining: rule.maxRequests - 1,
      resetTime: newRecord.resetTime,
      rule
    };
  }

  // Check if currently blocked
  if (record.blocked) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
      rule
    };
  }

  // Check if limit exceeded
  if (record.count >= rule.maxRequests) {
    record.blocked = true;
    globalRateLimitMap.set(key, record);

    console.warn(`🚨 Rate limit exceeded for ${ip} on ${pathname}`);

    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
      rule
    };
  }

  // Increment counter
  record.count++;
  globalRateLimitMap.set(key, record);

  return {
    allowed: true,
    remaining: rule.maxRequests - record.count,
    resetTime: record.resetTime,
    rule
  };
}

// Clean up expired rate limit records
function cleanupExpiredRecords() {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, record] of globalRateLimitMap.entries()) {
    if (now > record.resetTime) {
      globalRateLimitMap.delete(key);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`🧹 Cleaned up ${cleaned} expired rate limit records`);
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredRecords, 5 * 60 * 1000);

// Log security events
function logSecurityEvent(type: string, ip: string, details: Record<string, unknown>) {
  console.warn(`🛡️ Security Event [${type}]:`, {
    ip,
    timestamp: new Date().toISOString(),
    ...details
  });
}

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/profile(.*)',
  '/subscriptions(.*)',
  '/downloads(.*)',
  '/enterprise(.*)',
  '/api/protected(.*)',
  '/api/subscriptions(.*)',
  '/api/downloads(.*)',
  '/api/users(.*)',
]);

// Define admin routes
const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
  '/api/admin(.*)',
]);

// Define public authentication routes (don't require auth)
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback',
  '/products(.*)',
  '/api/webhooks(.*)',
  '/api/shopify(.*)',
  '/api/collections(.*)',
  '/api/products(.*)',
  '/api/cart(.*)',
  '/api/test-connection',
  '/api/debug-query',
]);

// Security middleware function
function securityMiddleware(request: NextRequest) {
  const startTime = Date.now();
  const ip = getClientIP(request);
  const pathname = new URL(request.url).pathname;
  const userAgent = request.headers.get('user-agent') || 'unknown';

  // Skip middleware for static assets and internal Next.js routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/api/_') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check for blocked IPs
  if (BLOCKED_IPS.has(ip)) {
    logSecurityEvent('BLOCKED_IP', ip, { pathname, userAgent });
    return new NextResponse('Access Denied', { status: 403 });
  }

  // Check for suspicious requests
  if (isSuspiciousRequest(request)) {
    logSecurityEvent('SUSPICIOUS_REQUEST', ip, {
      pathname,
      userAgent,
      referer: request.headers.get('referer')
    });

    // For API endpoints, block suspicious requests
    if (pathname.startsWith('/api/')) {
      return new NextResponse('Access Denied', { status: 403 });
    }
  }

  // Apply rate limiting to API endpoints
  if (pathname.startsWith('/api/')) {
    const rateLimitResult = checkRateLimit(request);

    // Create response with rate limit headers
    let response: NextResponse;

    if (!rateLimitResult.allowed) {
      logSecurityEvent('RATE_LIMIT_EXCEEDED', ip, {
        pathname,
        rule: rateLimitResult.rule,
        resetTime: new Date(rateLimitResult.resetTime).toISOString()
      });

      response = new NextResponse(
        JSON.stringify({
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } else {
      response = NextResponse.next();
    }

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', rateLimitResult.rule.maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());

    // Add security headers
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Add performance timing
    const processingTime = Date.now() - startTime;
    response.headers.set('X-Response-Time', `${processingTime}ms`);

    return response;
  }

  // For non-API requests, just add security headers
  const response = NextResponse.next();

  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

// Main middleware combining Clerk authentication and security
export default clerkMiddleware(async (auth, req) => {
  // Apply security middleware first
  const securityResponse = securityMiddleware(req);

  // If security middleware blocks the request, return early
  if (securityResponse.status !== 200) {
    return securityResponse;
  }

  // Check if route requires authentication
  if (isProtectedRoute(req) && !isPublicRoute(req)) {
    // Protect the route with Clerk authentication
    auth.protect();
  }

  // Redirect authenticated users away from auth pages
  if (isPublicRoute(req) && (req.nextUrl.pathname === '/sign-in' || req.nextUrl.pathname === '/sign-up')) {
    const { userId } = auth();
    if (userId) {
      const dashboardUrl = new URL('/dashboard', req.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // Admin route protection is handled in individual route components

  // Continue with the security response (which includes security headers)
  return securityResponse;
});

// Configure middleware to run on all routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};