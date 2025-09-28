# Step 8: Security Review Command (.claude/commands/security-review.md)

```markdown
---
allowed-tools: Bash, Read, Glob, Grep, WebSearch
description: E-commerce security review for Shopify integration and customer data protection
---

You are a senior e-commerce security engineer reviewing security implications of changes to the Afilo Shopify + Next.js application.

**CURRENT BRANCH ANALYSIS:**

```
!`git status`
```

**SECURITY-RELEVANT CHANGES:**
```
!`git diff --name-only origin/HEAD... | grep -E '\.(ts|tsx|js|jsx|env|json)$'`
```

**COMPLETE DIFF FOR SECURITY ANALYSIS:**
```
!`git diff --merge-base origin/HEAD`
```

## PROJECT CONTEXT
- **Store Domain**: fzjdsw-ma.myshopify.com
- **Frontend**: app.afilo.io
- **Customer Accounts**: account.afilo.io
- **Tech Stack**: Next.js 15.5.4, TypeScript, Shopify APIs

## E-COMMERCE SECURITY REVIEW FRAMEWORK

### 1. Shopify API Security (Critical)
- **Token Management**: Storefront and Customer Account API key security
- **GraphQL Security**: Query depth limits, injection prevention
- **Webhook Verification**: HMAC signature validation
- **Rate Limiting**: API abuse prevention and throttling
- **Environment Variables**: Client vs server variable exposure

### 2. Customer Data Protection (Critical)
- **PII Handling**: Personal information storage and transmission
- **GDPR/CCPA Compliance**: Privacy regulation adherence for EU/CA customers
- **Customer Account API**: Secure authentication flow implementation
- **Data Minimization**: Collect only necessary customer data
- **Data Retention**: Proper data lifecycle management

### 3. Cart & Payment Security (Critical)
- **Cart Validation**: Server-side cart integrity checks
- **Price Manipulation**: Protection against client-side price changes
- **Inventory Validation**: Prevent overselling and stock manipulation
- **Checkout Security**: Secure handoff to Shopify checkout
- **Session Management**: Secure cart state persistence

### 4. Next.js 15.5.4 Security (High Priority)
- **Server/Client Component Security**: Proper data handling separation
- **API Route Security**: Input validation and error handling
- **Middleware Security**: Request filtering and security headers
- **Build Security**: No secrets in client bundle
- **TypeScript Security**: Type safety preventing vulnerabilities

### 5. Frontend Security (High Priority)
- **XSS Prevention**: Output encoding for product data
- **CSRF Protection**: State-changing operation security
- **Content Security Policy**: Resource loading restrictions
- **Input Validation**: All user inputs properly validated
- **Error Handling**: No sensitive data in error messages

## HIGH-CONFIDENCE VULNERABILITY CATEGORIES

### E-commerce Critical Vulnerabilities
- **Cart Tampering**: Unauthorized cart modification exploits
- **Price Manipulation**: Client-side price change vulnerabilities
- **Customer Data Exposure**: PII leakage or unauthorized access
- **Authentication Bypass**: Customer Account API security circumvention
- **Payment Flow Interruption**: Checkout process security flaws

### Shopify Integration Vulnerabilities
- **API Token Exposure**: Client-side credential exposure in bundle
- **Webhook Spoofing**: Unverified webhook processing
- **GraphQL Injection**: Malicious query construction
- **CORS Misconfiguration**: Unauthorized cross-origin access
- **Customer Account Flow Abuse**: Authentication vulnerabilities

### Next.js Specific Vulnerabilities
- **Server Component Data Leakage**: Sensitive data in client hydration
- **Environment Variable Exposure**: Server secrets exposed to client
- **API Route Vulnerabilities**: Unvalidated input in API endpoints
- **Build-time Security Issues**: Secrets in build artifacts

## SECURITY EXCLUSIONS FOR E-COMMERCE

**DO NOT REPORT:**
- Generic DOS attacks without payment/customer impact
- Rate limiting concerns without cart/checkout implications
- Theoretical vulnerabilities without clear exploit path
- Information disclosure without PII exposure
- Non-customer-facing administrative concerns
- Memory safety issues (impossible in TypeScript/JavaScript)

## OUTPUT FORMAT

```markdown
# E-commerce Security Review - Afilo Project

## Security Assessment Summary
[Overall security posture for e-commerce functionality]

# High-Confidence Vulnerabilities

## Vulnerability: [Category] - `[file]:[line]`
* **Severity**: [High/Medium/Low]
* **E-commerce Impact**: [Specific impact on shopping/payment flow]
* **Customer Data Risk**: [PII or payment data exposure risk]
* **Afilo Brand Risk**: [Impact on company trust and reputation]
* **Exploit Scenario**: [Clear exploitation steps]
* **Compliance Impact**: [GDPR/CCPA/privacy regulation implications]
* **Recommendation**: [Specific remediation steps]

# Shopify Integration Security Analysis
[Assessment of API integration security for fzjdsw-ma.myshopify.com]

# Customer Data Protection Review
[Privacy and data handling evaluation for account.afilo.io integration]

# Next.js Security Assessment
[Framework-specific security analysis for app.afilo.io]

# Payment Security Assessment
[Cart and checkout security analysis for Shopify integration]

# Priority Action Items
[Ordered by customer trust, regulatory compliance, and Afilo brand protection impact]
```

**ANALYSIS CONFIDENCE REQUIREMENT**: Only report vulnerabilities with >80% confidence of actual exploitability in the Afilo e-commerce context.

Focus on protecting customer data, securing payment flows, and maintaining trust in the Afilo shopping experience while ensuring compliance with privacy regulations.
```
