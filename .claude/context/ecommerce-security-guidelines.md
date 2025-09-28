<<<<<<< HEAD
# Afilo E-commerce Security Guidelines# Security Guidelines (.claude/context/ecommerce-security-guidelines.md)



**Project**: Afilo Digital Marketplace  ```markdown

**Author**: Rihan (@code-craka)  # Afilo E-commerce Security Guidelines

**Repository**: [afilo-nextjs-shopify-app](https://github.com/code-craka/afilo-nextjs-shopify-app)  

## Project Context

## 🔒 Overview- **Store**: fzjdsw-ma.myshopify.com

- **Frontend**: app.afilo.io

This document provides comprehensive security guidelines for the Afilo Digital Marketplace, focusing on e-commerce best practices, Shopify integration security, and Next.js application security.- **Customer Accounts**: account.afilo.io

- **Tech Stack**: Next.js 15.5.4, TypeScript, Shopify APIs

## 🛡️ Core Security Principles

## Shopify API Security

### 1. **Defense in Depth**

- Multiple layers of security controls### Token Management

- No single point of failure- **Storefront API Token**: Store in NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN (client-safe)

- Redundant security measures- **Private Access Token**: Store in SHOPIFY_STOREFRONT_PRIVATE_TOKEN (server-only)

- **Customer Account Client ID**: Store in NEXT_PUBLIC_CUSTOMER_ACCOUNT_CLIENT_ID

### 2. **Least Privilege**- **Never expose** Admin API tokens to client-side code

- Minimal access permissions- **Implement rotation** for long-lived applications

- Role-based access control

- Regular permission audits### GraphQL Security Best Practices

- **Query Depth Limiting**: Maximum 10 levels deep

### 3. **Zero Trust Architecture**- **Rate Limiting**: Respect Shopify's rate limits (40 requests/second)

- Verify every request- **Query Validation**: Validate all input parameters

- Assume breach mentality- **Error Handling**: Don't expose internal details in error messages

- Continuous monitoring

### Customer Account API Security

## 🔐 Authentication & Authorization- **Authentication Flow**: Implement proper OAuth 2.0 flow

- **Token Storage**: Secure handling of customer access tokens

### Shopify Integration Security- **Session Management**: Proper session lifecycle management

- **Logout Handling**: Complete session cleanup

```typescript

// Secure token handling## Customer Data Protection

const SHOPIFY_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

### PII Handling for GDPR/CCPA Compliance

if (!SHOPIFY_TOKEN) {- **Data Minimization**: Collect only necessary customer data

  throw new Error('Missing Shopify credentials');- **Explicit Consent**: Clear consent for data collection and processing

}- **Right to Access**: Provide customer data export functionality

- **Right to Deletion**: Implement customer data deletion

// Token validation- **Data Retention**: Define and enforce retention policies

function validateShopifyToken(token: string): boolean {

  return token.startsWith('shpat_') && token.length > 20;### Customer Account Integration (account.afilo.io)

}- **Secure Redirects**: Validate all redirect URLs

```- **Token Validation**: Verify all customer tokens server-side

- **Data Encryption**: Encrypt sensitive data in transit and at rest

### Environment Variable Security- **Audit Logging**: Log all customer data access and modifications



```bash### Privacy Implementation

# Public variables (safe to expose to client)```typescript

NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com// Example: Secure customer data handling

NEXT_PUBLIC_CUSTOMER_ACCOUNT_CLIENT_ID=your_client_idinterface CustomerData {

  id: string;

# Server-only (no NEXT_PUBLIC_ prefix)  email: string; // PII - handle with care

SHOPIFY_STOREFRONT_PRIVATE_TOKEN=your_private_token_here  firstName?: string; // PII - optional

CUSTOMER_ACCOUNT_CLIENT_SECRET=your_client_secret  // Never store: credit card data, full addresses client-side

WEBHOOK_SECRET=your_webhook_secret}

```

// Server-side only customer processing

### Session Managementfunction processCustomerData(customer: CustomerData) {

  // Validate input

```typescript  // Log access

// Secure session configuration  // Apply data minimization

const sessionConfig = {  // Ensure encryption

  httpOnly: true,}

  secure: process.env.NODE_ENV === 'production',```

  sameSite: 'strict' as const,

  maxAge: 60 * 60 * 24 * 7, // 7 days## Cart and Checkout Security

  path: '/'

};### Cart Validation

```- **Server-side Validation**: Always validate cart contents server-side before checkout

- **Inventory Checks**: Verify product availability before adding to cart

## 🌐 API Security- **Price Verification**: Validate all prices against Shopify data

- **Quantity Limits**: Enforce reasonable quantity limits

### GraphQL Security

### Checkout Flow Security

```typescript- **Secure Handoff**: Proper redirect to Shopify checkout with validation

// Query complexity limiting- **Session Security**: Maintain cart security during checkout process

const MAX_QUERY_COMPLEXITY = 1000;- **Error Handling**: Graceful handling of checkout failures

const MAX_QUERY_DEPTH = 10;- **Webhook Validation**: Verify all webhook signatures



// Rate limiting### Cart State Management (Zustand)

const rateLimiter = {```typescript

  windowMs: 15 * 60 * 1000, // 15 minutes// Secure cart store implementation

  max: 100, // Limit each IP to 100 requests per windowMsinterface CartStore {

  message: 'Too many requests from this IP'  cartId: string | null;

};  isLoading: boolean;

```  error: string | null;



### Input Validation  // Actions with validation

  addToCart: (variantId: string, quantity: number) => Promise<void>;

```typescript  validateCart: () => Promise<boolean>;

// Sanitize user inputs  clearSensitiveData: () => void;

function sanitizeInput(input: string): string {}

  return input```

    .trim()

    .replace(/[<>\"']/g, '') // Remove dangerous characters## Next.js 15.5.4 Security

    .substring(0, 1000); // Limit length

}### Server/Client Component Security

- **Server Components**: Keep sensitive operations server-side

// Validate product queries- **Client Components**: Only necessary interactivity

function validateProductQuery(query: string): boolean {- **Data Flow**: Never pass secrets to client components

  const allowedFields = ['title', 'description', 'tags', 'vendor'];- **Hydration**: Ensure no sensitive data in hydration

  const queryFields = query.split(' ');

  ### Environment Variable Security

  return queryFields.every(field => ```bash

    allowedFields.some(allowed => field.includes(allowed))# Client-safe (prefixed with NEXT_PUBLIC_)

  );NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=fzjdsw-ma.myshopify.com

}NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=a66ca3dfc351a36d82c9c3517c3e06e4

```NEXT_PUBLIC_CUSTOMER_ACCOUNT_CLIENT_ID=ac631b65-3c7a-4a90-b25f-8cfa4b6ebc1f



### CORS Configuration# Server-only (no NEXT_PUBLIC_ prefix)

SHOPIFY_STOREFRONT_PRIVATE_TOKEN=shpat_your_private_token_here

```typescriptCUSTOMER_ACCOUNT_CLIENT_SECRET=your_client_secret

// Strict CORS policyWEBHOOK_SECRET=your_webhook_secret

const corsConfig = {```

  origin: process.env.NODE_ENV === 'production' 

    ? ['https://app.afilo.io', 'https://account.afilo.io']### API Route Security

    : ['http://localhost:3000'],- **Input Validation**: Validate all incoming data

  methods: ['GET', 'POST'],- **Rate Limiting**: Implement per-IP rate limiting

  allowedHeaders: ['Content-Type', 'Authorization'],- **CORS**: Proper CORS configuration for API routes

  credentials: true- **Error Handling**: Don't expose internal errors

};

```### Middleware Security Implementation

```typescript

## 🔒 Data Protection// Example secure middleware

import { NextRequest, NextResponse } from 'next/server';

### Sensitive Data Handling

export function middleware(request: NextRequest) {

```typescript  // Security headers

// Never log sensitive data  const response = NextResponse.next();

function logRequest(data: any) {

  const sanitized = {  response.headers.set('X-Frame-Options', 'DENY');

    ...data,  response.headers.set('X-Content-Type-Options', 'nosniff');

    password: '[REDACTED]',  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    token: '[REDACTED]',

    creditCard: '[REDACTED]'  // CSP for Shopify integration

  };  response.headers.set(

  console.log('Request:', sanitized);    'Content-Security-Policy',

}    "default-src 'self'; " +

    "script-src 'self' 'unsafe-inline' cdn.shopify.com; " +

// Encrypt sensitive data    "img-src 'self' data: cdn.shopify.com; " +

import crypto from 'crypto';    "connect-src 'self' fzjdsw-ma.myshopify.com account.afilo.io"

  );

function encryptSensitiveData(data: string): string {

  const key = process.env.ENCRYPTION_KEY;  return response;

  const iv = crypto.randomBytes(16);}

  const cipher = crypto.createCipher('aes-256-cbc', key);```

  

  let encrypted = cipher.update(data, 'utf8', 'hex');## Frontend Security

  encrypted += cipher.final('hex');

  ### XSS Prevention

  return `${iv.toString('hex')}:${encrypted}`;- **Output Encoding**: Properly encode all user-generated content

}- **Sanitization**: Sanitize any rich text or HTML content

```- **Template Security**: Use React's built-in XSS protection

- **Dynamic Content**: Validate all dynamic content rendering

### PCI DSS Compliance

### CSRF Protection

- **Never store credit card data** - Use Shopify's secure payment processing- **SameSite Cookies**: Use SameSite=Strict for session cookies

- **Use HTTPS everywhere** - All data transmission encrypted- **CSRF Tokens**: Implement for state-changing operations

- **Regular security scans** - Automated vulnerability testing- **Origin Validation**: Verify request origins

- **Access control** - Restrict payment data access- **Double Submit**: Use double submit cookie pattern where applicable



## 🚨 Security Headers### Content Security Policy (CSP)

```typescript

### Next.js Security Headers// CSP configuration for Shopify integration

const cspPolicy = [

```typescript  "default-src 'self'",

// next.config.ts  "script-src 'self' 'unsafe-inline' cdn.shopify.com",

const securityHeaders = [  "style-src 'self' 'unsafe-inline'",

  {  "img-src 'self' data: cdn.shopify.com",

    key: 'X-DNS-Prefetch-Control',  "connect-src 'self' fzjdsw-ma.myshopify.com account.afilo.io",

    value: 'on'  "frame-src 'none'",

  },  "object-src 'none'"

  {].join('; ');

    key: 'Strict-Transport-Security',```

    value: 'max-age=63072000; includeSubDomains; preload'

  },## Webhook Security

  {

    key: 'X-XSS-Protection',### Shopify Webhook Verification

    value: '1; mode=block'```typescript

  },import crypto from 'crypto';

  {

    key: 'X-Frame-Options',function verifyShopifyWebhook(

    value: 'SAMEORIGIN'  body: string,

  },  signature: string,

  {  secret: string

    key: 'X-Content-Type-Options',): boolean {

    value: 'nosniff'  const hmac = crypto.createHmac('sha256', secret);

  },  hmac.update(body, 'utf8');

  {  const hash = hmac.digest('base64');

    key: 'Referrer-Policy',

    value: 'origin-when-cross-origin'  return hash === signature;

  }}

];```

```

### Webhook Processing Security

### Content Security Policy- **Signature Verification**: Always verify webhook signatures

- **Idempotency**: Handle duplicate webhook deliveries

```typescript- **Rate Limiting**: Limit webhook processing rate

const csp = `- **Error Handling**: Proper error responses for failed processing

  default-src 'self';

  script-src 'self' 'unsafe-eval' 'unsafe-inline' *.shopify.com;## Monitoring and Incident Response

  style-src 'self' 'unsafe-inline' *.googleapis.com;

  img-src 'self' data: blob: *.shopify.com *.shopifycdn.com;### Security Monitoring

  font-src 'self' *.googleapis.com *.gstatic.com;- **API Rate Limiting**: Monitor for unusual API usage patterns

  connect-src 'self' *.shopify.com *.myshopify.com;- **Failed Authentication**: Track failed customer login attempts

  frame-ancestors 'none';- **Error Patterns**: Monitor for security-related errors

`;- **Performance**: Track security overhead impact

```

### Incident Response for Customer Data

## 🛒 E-commerce Specific Security1. **Immediate Containment**: Isolate affected systems

2. **Impact Assessment**: Determine scope of customer data affected

### Cart Security3. **Legal Notification**: Follow GDPR/CCPA notification requirements (72 hours)

4. **Customer Communication**: Transparent communication about impact

```typescript5. **Prevention**: Implement measures to prevent recurrence

// Secure cart operations

class SecureCart {### Compliance Checklist

  validateCartItem(item: CartItem): boolean {

    // Verify product exists and is available#### GDPR Compliance

    // Check price integrity- [ ] Data Processing Agreement with Shopify

    // Validate quantity limits- [ ] Customer consent mechanisms

    return this.verifyProduct(item.productId) &&- [ ] Data subject rights implementation

           this.checkPriceIntegrity(item) &&- [ ] Privacy policy covering all data processing

           this.validateQuantity(item.quantity);- [ ] Data Protection Impact Assessment (DPIA)

  }

#### Security Best Practices

  private verifyProduct(productId: string): Promise<boolean> {- [ ] Regular security reviews of Shopify integration

    // Verify with Shopify that product exists and is available- [ ] Customer data encryption in transit and at rest

    return shopifyClient.product.fetch(productId)- [ ] Secure API key management and rotation

      .then(product => product && product.availableForSale);- [ ] Regular dependency updates and security patches

  }- [ ] Penetration testing of customer-facing features



  private checkPriceIntegrity(item: CartItem): boolean {This security framework ensures the Afilo e-commerce platform maintains customer trust while complying with privacy regulations and protecting against common e-commerce vulnerabilities.

    // Verify prices haven't been tampered with```
    const serverPrice = this.getServerPrice(item.productId);
    return Math.abs(item.price - serverPrice) < 0.01; // Allow for rounding
  }
}
```

### Order Security

```typescript
// Secure order processing
interface SecureOrderData {
  items: CartItem[];
  total: number;
  currency: string;
  customerId?: string;
  timestamp: number;
  checksum: string;
}

function generateOrderChecksum(orderData: Omit<SecureOrderData, 'checksum'>): string {
  const orderString = JSON.stringify(orderData);
  return crypto.createHmac('sha256', process.env.ORDER_SECRET!)
    .update(orderString)
    .digest('hex');
}

function validateOrder(orderData: SecureOrderData): boolean {
  const expectedChecksum = generateOrderChecksum({
    items: orderData.items,
    total: orderData.total,
    currency: orderData.currency,
    customerId: orderData.customerId,
    timestamp: orderData.timestamp
  });
  
  return orderData.checksum === expectedChecksum;
}
```

## 🔍 Security Monitoring

### Logging & Monitoring

```typescript
// Security event logging
interface SecurityEvent {
  type: 'AUTH_FAILURE' | 'SUSPICIOUS_ACTIVITY' | 'DATA_BREACH' | 'ACCESS_VIOLATION';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  source: string;
  details: any;
  timestamp: Date;
  userAgent?: string;
  ipAddress?: string;
}

function logSecurityEvent(event: SecurityEvent) {
  // Log to secure logging service
  console.error(`[SECURITY] ${event.type}: ${event.severity}`, {
    source: event.source,
    timestamp: event.timestamp,
    details: event.details
  });
  
  // Alert for high/critical events
  if (event.severity === 'HIGH' || event.severity === 'CRITICAL') {
    alertSecurityTeam(event);
  }
}
```

### Error Handling

```typescript
// Secure error responses
function handleAPIError(error: any, req: NextRequest): Response {
  // Log the full error internally
  console.error('API Error:', error);
  
  // Return sanitized error to client
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return Response.json({
    error: 'An error occurred processing your request',
    message: isDevelopment ? error.message : 'Please try again later',
    timestamp: new Date().toISOString(),
    requestId: req.headers.get('x-request-id')
  }, { 
    status: error.status || 500 
  });
}
```

## ⚠️ Common Vulnerabilities

### XSS Prevention

```typescript
// Sanitize user content
import DOMPurify from 'isomorphic-dompurify';

function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'title']
  });
}

// Safe dynamic content rendering
function SafeHTML({ content }: { content: string }) {
  return (
    <div 
      dangerouslySetInnerHTML={{ 
        __html: sanitizeHTML(content) 
      }} 
    />
  );
}
```

### SQL Injection Prevention

```typescript
// Use parameterized queries (though we use GraphQL)
// For any direct database access:
const query = 'SELECT * FROM products WHERE id = $1 AND store_id = $2';
const values = [productId, storeId];
```

### CSRF Protection

```typescript
// CSRF token generation and validation
function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function validateCSRFToken(token: string, sessionToken: string): boolean {
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(sessionToken)
  );
}
```

## 🔄 Security Maintenance

### Regular Security Tasks

1. **Dependency Updates**
   ```bash
   pnpm audit
   pnpm update
   ```

2. **Security Scanning**
   ```bash
   npm audit --audit-level high
   snyk test
   ```

3. **Code Reviews**
   - Security-focused code review process
   - Automated SAST scanning
   - Dependency vulnerability scanning

### Incident Response

1. **Detection** - Automated alerts and monitoring
2. **Analysis** - Assess scope and impact
3. **Containment** - Limit damage and exposure
4. **Eradication** - Remove threat and vulnerabilities
5. **Recovery** - Restore normal operations
6. **Lessons Learned** - Document and improve

## 📞 Security Contacts

- **Security Issues**: Create private security advisory on GitHub
- **Author**: [@code-craka](https://github.com/code-craka)
- **Repository**: [Security Policy](./SECURITY.md)

---

**Security is everyone's responsibility. Stay vigilant, stay secure!**

Built with 🔒 and ❤️ by Rihan | Secured by design | Protected by best practices
=======
# Security Guidelines (.claude/context/ecommerce-security-guidelines.md)

```markdown
# Afilo E-commerce Security Guidelines

## Project Context
- **Store**: fzjdsw-ma.myshopify.com
- **Frontend**: app.afilo.io
- **Customer Accounts**: account.afilo.io
- **Tech Stack**: Next.js 15.5.4, TypeScript, Shopify APIs

## Shopify API Security

### Token Management
- **Storefront API Token**: Store in NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN (client-safe)
- **Private Access Token**: Store in SHOPIFY_STOREFRONT_PRIVATE_TOKEN (server-only)
- **Customer Account Client ID**: Store in NEXT_PUBLIC_CUSTOMER_ACCOUNT_CLIENT_ID
- **Never expose** Admin API tokens to client-side code
- **Implement rotation** for long-lived applications

### GraphQL Security Best Practices
- **Query Depth Limiting**: Maximum 10 levels deep
- **Rate Limiting**: Respect Shopify's rate limits (40 requests/second)
- **Query Validation**: Validate all input parameters
- **Error Handling**: Don't expose internal details in error messages

### Customer Account API Security
- **Authentication Flow**: Implement proper OAuth 2.0 flow
- **Token Storage**: Secure handling of customer access tokens
- **Session Management**: Proper session lifecycle management
- **Logout Handling**: Complete session cleanup

## Customer Data Protection

### PII Handling for GDPR/CCPA Compliance
- **Data Minimization**: Collect only necessary customer data
- **Explicit Consent**: Clear consent for data collection and processing
- **Right to Access**: Provide customer data export functionality
- **Right to Deletion**: Implement customer data deletion
- **Data Retention**: Define and enforce retention policies

### Customer Account Integration (account.afilo.io)
- **Secure Redirects**: Validate all redirect URLs
- **Token Validation**: Verify all customer tokens server-side
- **Data Encryption**: Encrypt sensitive data in transit and at rest
- **Audit Logging**: Log all customer data access and modifications

### Privacy Implementation
```typescript
// Example: Secure customer data handling
interface CustomerData {
  id: string;
  email: string; // PII - handle with care
  firstName?: string; // PII - optional
  // Never store: credit card data, full addresses client-side
}

// Server-side only customer processing
function processCustomerData(customer: CustomerData) {
  // Validate input
  // Log access
  // Apply data minimization
  // Ensure encryption
}
```

## Cart and Checkout Security

### Cart Validation
- **Server-side Validation**: Always validate cart contents server-side before checkout
- **Inventory Checks**: Verify product availability before adding to cart
- **Price Verification**: Validate all prices against Shopify data
- **Quantity Limits**: Enforce reasonable quantity limits

### Checkout Flow Security
- **Secure Handoff**: Proper redirect to Shopify checkout with validation
- **Session Security**: Maintain cart security during checkout process
- **Error Handling**: Graceful handling of checkout failures
- **Webhook Validation**: Verify all webhook signatures

### Cart State Management (Zustand)
```typescript
// Secure cart store implementation
interface CartStore {
  cartId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions with validation
  addToCart: (variantId: string, quantity: number) => Promise<void>;
  validateCart: () => Promise<boolean>;
  clearSensitiveData: () => void;
}
```

## Next.js 15.5.4 Security

### Server/Client Component Security
- **Server Components**: Keep sensitive operations server-side
- **Client Components**: Only necessary interactivity
- **Data Flow**: Never pass secrets to client components
- **Hydration**: Ensure no sensitive data in hydration

### Environment Variable Security
```bash
# Client-safe (prefixed with NEXT_PUBLIC_)
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_storefront_access_token_here
NEXT_PUBLIC_CUSTOMER_ACCOUNT_CLIENT_ID=your_customer_account_client_id

# Server-only (no NEXT_PUBLIC_ prefix)
SHOPIFY_STOREFRONT_PRIVATE_TOKEN=shpat_your_private_token_here
CUSTOMER_ACCOUNT_CLIENT_SECRET=your_client_secret
WEBHOOK_SECRET=your_webhook_secret
```

### API Route Security
- **Input Validation**: Validate all incoming data
- **Rate Limiting**: Implement per-IP rate limiting
- **CORS**: Proper CORS configuration for API routes
- **Error Handling**: Don't expose internal errors

### Middleware Security Implementation
```typescript
// Example secure middleware
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Security headers
  const response = NextResponse.next();

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // CSP for Shopify integration
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' cdn.shopify.com; " +
    "img-src 'self' data: cdn.shopify.com; " +
    "connect-src 'self' fzjdsw-ma.myshopify.com account.afilo.io"
  );

  return response;
}
```

## Frontend Security

### XSS Prevention
- **Output Encoding**: Properly encode all user-generated content
- **Sanitization**: Sanitize any rich text or HTML content
- **Template Security**: Use React's built-in XSS protection
- **Dynamic Content**: Validate all dynamic content rendering

### CSRF Protection
- **SameSite Cookies**: Use SameSite=Strict for session cookies
- **CSRF Tokens**: Implement for state-changing operations
- **Origin Validation**: Verify request origins
- **Double Submit**: Use double submit cookie pattern where applicable

### Content Security Policy (CSP)
```typescript
// CSP configuration for Shopify integration
const cspPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' cdn.shopify.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: cdn.shopify.com",
  "connect-src 'self' fzjdsw-ma.myshopify.com account.afilo.io",
  "frame-src 'none'",
  "object-src 'none'"
].join('; ');
```

## Webhook Security

### Shopify Webhook Verification
```typescript
import crypto from 'crypto';

function verifyShopifyWebhook(
  body: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(body, 'utf8');
  const hash = hmac.digest('base64');

  return hash === signature;
}
```

### Webhook Processing Security
- **Signature Verification**: Always verify webhook signatures
- **Idempotency**: Handle duplicate webhook deliveries
- **Rate Limiting**: Limit webhook processing rate
- **Error Handling**: Proper error responses for failed processing

## Monitoring and Incident Response

### Security Monitoring
- **API Rate Limiting**: Monitor for unusual API usage patterns
- **Failed Authentication**: Track failed customer login attempts
- **Error Patterns**: Monitor for security-related errors
- **Performance**: Track security overhead impact

### Incident Response for Customer Data
1. **Immediate Containment**: Isolate affected systems
2. **Impact Assessment**: Determine scope of customer data affected
3. **Legal Notification**: Follow GDPR/CCPA notification requirements (72 hours)
4. **Customer Communication**: Transparent communication about impact
5. **Prevention**: Implement measures to prevent recurrence

### Compliance Checklist

#### GDPR Compliance
- [ ] Data Processing Agreement with Shopify
- [ ] Customer consent mechanisms
- [ ] Data subject rights implementation
- [ ] Privacy policy covering all data processing
- [ ] Data Protection Impact Assessment (DPIA)

#### Security Best Practices
- [ ] Regular security reviews of Shopify integration
- [ ] Customer data encryption in transit and at rest
- [ ] Secure API key management and rotation
- [ ] Regular dependency updates and security patches
- [ ] Penetration testing of customer-facing features

This security framework ensures the Afilo e-commerce platform maintains customer trust while complying with privacy regulations and protecting against common e-commerce vulnerabilities.
```
>>>>>>> 180bf02 (feat: comprehensive documentation and CI/CD pipeline)
