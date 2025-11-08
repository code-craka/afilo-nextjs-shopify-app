# Cookie Consent Management System - Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the comprehensive cookie consent management system for the Afilo platform. The system is designed to comply with CCPA, PIPEDA, UK GDPR, and Australia Privacy Act requirements.

## ✅ Implementation Status

### Phase 1: Database Foundation ✅ COMPLETE
- [x] Database migration SQL file
- [x] Prisma schema updates (3 new models)
- [x] Database indexes for performance (14 total)
- [x] Audit trail and compliance tables

### Phase 2: Backend API Infrastructure ✅ COMPLETE
- [x] 5 API routes for consent management
- [x] Zod validation schemas
- [x] Error handling and audit logging
- [x] Regional compliance framework detection

### Phase 3: Frontend Components ✅ COMPLETE
- [x] CookieConsentBanner with animations
- [x] useCookieConsent custom hook
- [x] Privacy settings page
- [x] Cookie policy page
- [x] Consent-aware analytics wrapper

### Phase 4: Integration ✅ COMPLETE
- [x] Root layout integration
- [x] Analytics integration
- [x] Cross-device consent sync
- [x] 12-month expiration handling

## 🚀 Pre-Deployment Checklist

### 1. Database Setup

```bash
# 1. Run the database migration
psql "$DATABASE_URL" -f prisma/migrations/add_cookie_consent_system.sql

# 2. Regenerate Prisma client
pnpm prisma generate

# 3. Verify migration success
psql "$DATABASE_URL" -c "SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'cookie_%';"
```

**Expected Output:**
```
 table_name
---------------------------
 cookie_consent_records
 cookie_consent_audit_log
 cookie_policy_versions
(3 rows)
```

### 2. Environment Variables

Add these environment variables to your production environment:

```bash
# .env.production or Vercel environment variables

# Required for analytics consent management
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"

# Optional: Enable debug mode in development
NEXT_PUBLIC_COOKIE_DEBUG="false"

# Optional: Customize consent expiration (default: 12 months)
NEXT_PUBLIC_CONSENT_EXPIRY_MONTHS="12"

# Optional: Customize banner delay (default: 1000ms)
NEXT_PUBLIC_BANNER_DELAY_MS="1000"
```

### 3. Legal Policy Updates

Update your legal policies to reference the new cookie consent system:

```bash
# Privacy Policy - Add reference to cookie management
# Terms of Service - Update consent sections
# Cookie Policy - Ensure it's current and comprehensive
```

### 4. Build and Deploy

```bash
# 1. Ensure TypeScript compilation passes
pnpm build

# 2. Test locally first
pnpm dev

# 3. Deploy to staging
vercel deploy

# 4. Run production deployment
vercel --prod
```

## 📊 Post-Deployment Verification

### 1. Database Verification

```sql
-- Check that tables were created
SELECT COUNT(*) FROM cookie_consent_records;
SELECT COUNT(*) FROM cookie_consent_audit_log;
SELECT COUNT(*) FROM cookie_policy_versions;

-- Verify initial policy version exists
SELECT version, is_current FROM cookie_policy_versions WHERE is_current = true;
```

**Expected Results:**
- All tables should exist and be accessible
- Initial policy version "1.0" should be marked as current

### 2. API Endpoint Testing

Test all cookie consent API endpoints:

```bash
# Test consent status endpoint
curl https://app.afilo.io/api/cookies/status

# Test policy endpoint
curl https://app.afilo.io/api/cookies/policy

# Test consent retrieval (requires session_id)
curl "https://app.afilo.io/api/cookies/consent?session_id=test-session-123"
```

**Expected Responses:**
- Status endpoint should return compliance framework info
- Policy endpoint should return current policy version
- Consent endpoint should handle missing consent gracefully

### 3. Frontend Component Testing

1. **Cookie Banner Display:**
   - Visit your site in an incognito/private window
   - Banner should appear after 1 second delay
   - All cookie categories should be displayed
   - Accept/Reject/Customize buttons should work

2. **Privacy Settings Page:**
   - Navigate to `/dashboard/settings/privacy`
   - Toggle switches should update preferences
   - Save button should persist changes
   - Status information should be accurate

3. **Cookie Policy Page:**
   - Visit `/legal/cookie-policy`
   - All sections should render correctly
   - Links to privacy settings should work
   - Contact information should be current

### 4. Analytics Integration Testing

1. **Without Consent:**
   ```javascript
   // In browser console - should show denial
   console.log(window.gtag); // Should be undefined or disabled
   ```

2. **With Analytics Consent:**
   ```javascript
   // In browser console - should show GA loaded
   console.log(window.gtag); // Should be function
   console.log(window.dataLayer); // Should contain events
   ```

3. **Consent Changes:**
   - Grant analytics consent → GA should initialize
   - Revoke analytics consent → GA should be disabled
   - Check browser dev tools for appropriate messages

## 🔧 Configuration Options

### Banner Customization

```typescript
// In app/layout.tsx - customize the banner
<CookieConsentBanner
  position="bottom"        // "top" | "bottom"
  theme="auto"            // "light" | "dark" | "auto"
  delayMs={1000}          // Delay before showing banner
/>
```

### Analytics Configuration

```typescript
// In components/analytics/ConsentAwareAnalytics.tsx
<ConsentAwareAnalytics
  gaMeasurementId="G-XXXXXXXXXX"
  enableVercelAnalytics={true}
  enableCloudflareAnalytics={true}
  cloudflareToken="your-token"
/>
```

### Regional Compliance Settings

The system automatically detects user location and applies appropriate compliance rules:

- **US (CCPA):** Opt-out model, notice required
- **Canada (PIPEDA):** Express consent for non-essential cookies
- **UK (UK GDPR):** Explicit consent with granular controls
- **Australia:** Notice and reasonable controls

## 🛡️ Security Considerations

### 1. Rate Limiting

The API routes include built-in rate limiting:
- Consent operations: 10 requests/minute per IP
- Status checks: 30 requests/minute per IP
- Policy retrieval: 60 requests/minute per IP

### 2. Data Validation

All inputs are validated using Zod schemas:
- Session IDs must be 10-255 characters
- IP addresses are validated for format
- Country codes must be valid ISO 3166-1 alpha-2

### 3. Audit Trail

Every consent change is logged with:
- IP address and user agent
- Previous and new consent states
- Timestamp and reason for change
- User or system identification

## 📈 Monitoring and Analytics

### 1. Admin Dashboard

Access consent analytics at `/dashboard/admin/cookies/analytics` (admin users only):

- Total consents and active consents
- Opt-in rates by category
- Geographic breakdown
- Recent activity logs
- Compliance summary

### 2. Database Monitoring

Key metrics to monitor:

```sql
-- Daily consent volumes
SELECT DATE(consent_timestamp), COUNT(*)
FROM cookie_consent_records
WHERE consent_timestamp >= NOW() - INTERVAL '7 days'
GROUP BY DATE(consent_timestamp);

-- Opt-in rates
SELECT
  COUNT(*) FILTER (WHERE analytics_cookies = true) * 100.0 / COUNT(*) as analytics_rate,
  COUNT(*) FILTER (WHERE marketing_cookies = true) * 100.0 / COUNT(*) as marketing_rate
FROM cookie_consent_records
WHERE is_active = true;

-- Consent expiration tracking
SELECT COUNT(*)
FROM cookie_consent_records
WHERE expires_at < NOW() + INTERVAL '30 days'
AND is_active = true;
```

### 3. Performance Monitoring

- Monitor API response times for consent endpoints
- Track banner display and interaction rates
- Monitor analytics initialization success rates

## 🚨 Troubleshooting

### Common Issues

1. **Banner Not Appearing:**
   - Check browser console for JavaScript errors
   - Verify CookieConsentBanner is imported in layout.tsx
   - Check if user already has valid consent

2. **Analytics Not Loading:**
   - Verify user has granted analytics consent
   - Check GA_MEASUREMENT_ID environment variable
   - Look for consent-related console messages

3. **API Errors:**
   - Check database connection
   - Verify Prisma schema is up to date
   - Check request validation errors

4. **Database Issues:**
   - Ensure migration was run successfully
   - Check table permissions
   - Verify indexes were created

### Debug Mode

Enable debug logging:

```bash
# Add to environment variables
NEXT_PUBLIC_COOKIE_DEBUG="true"
```

This will show detailed console logs for:
- Consent state changes
- Analytics initialization/disable events
- API request/response cycles
- Banner display logic

## 📋 Compliance Checklist

Before going live, verify:

- [ ] ✅ Cookie banner displays for new users
- [ ] ✅ All cookie categories are explained
- [ ] ✅ Users can accept, reject, or customize
- [ ] ✅ Consent expires after 12 months
- [ ] ✅ Analytics only load with consent
- [ ] ✅ Privacy settings page is accessible
- [ ] ✅ Cookie policy is comprehensive
- [ ] ✅ Audit trail is functioning
- [ ] ✅ Cross-device sync works for logged-in users
- [ ] ✅ Regional compliance rules are applied
- [ ] ✅ Admin analytics dashboard is functional

## 🔄 Maintenance

### Regular Tasks

1. **Monthly:**
   - Review consent analytics and opt-in rates
   - Check for expired consents requiring renewal
   - Monitor system performance metrics

2. **Quarterly:**
   - Review and update cookie policy if needed
   - Audit compliance with regional regulations
   - Update cookie categories if new services added

3. **Annually:**
   - Full compliance audit
   - Review and update privacy policies
   - Assess need for cookie policy version updates

### Updating Cookie Policy

When updating the cookie policy:

1. Create new policy version:
```sql
INSERT INTO cookie_policy_versions (
  version, effective_date, policy_content,
  policy_summary, requires_reconsent, is_current
) VALUES (
  '1.1', CURRENT_DATE, 'Updated policy content...',
  'Summary of changes', true, false
);
```

2. Set as current and require reconsent:
```sql
UPDATE cookie_policy_versions SET is_current = false WHERE is_current = true;
UPDATE cookie_policy_versions SET is_current = true WHERE version = '1.1';
```

3. Users will be re-prompted for consent on next visit.

## 📞 Support

For implementation support or questions:

- **Email:** privacy@techsci.io
- **Documentation:** `/legal/cookie-policy`
- **Admin Dashboard:** `/dashboard/admin/cookies/analytics`

---

## 🎉 Deployment Complete!

Your cookie consent management system is now fully deployed and compliant with major privacy regulations. The system will:

- ✅ **Respect user privacy** with granular controls
- ✅ **Comply with regional laws** (CCPA, PIPEDA, UK GDPR, Australia Privacy Act)
- ✅ **Maintain audit trails** for compliance reporting
- ✅ **Optimize user experience** with non-blocking banner
- ✅ **Protect your business** with proper legal safeguards

**Next Steps:**
1. Monitor consent opt-in rates and user feedback
2. Track analytics performance with consent-aware loading
3. Review compliance quarterly and update as needed
4. Consider implementing additional privacy features as regulations evolve

---

**Version:** 1.0
**Last Updated:** January 30, 2025
**Compliance:** CCPA, PIPEDA, UK GDPR, Australia Privacy Act