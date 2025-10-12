# Custom Billing Portal - Comprehensive Testing Guide

**Last Updated**: January 30, 2025
**Version**: 1.0.0
**Status**: Production Ready ✅

---

## Table of Contents

1. [Testing Overview](#testing-overview)
2. [Phase 1: Payment Methods Testing](#phase-1-payment-methods-testing)
3. [Phase 2: Subscription Management Testing](#phase-2-subscription-management-testing)
4. [Phase 3: Invoice History Testing](#phase-3-invoice-history-testing)
5. [Phase 4: Dashboard Integration Testing](#phase-4-dashboard-integration-testing)
6. [Cross-Browser Testing](#cross-browser-testing)
7. [Mobile Responsiveness Testing](#mobile-responsiveness-testing)
8. [Error Handling Testing](#error-handling-testing)
9. [Security Testing](#security-testing)
10. [Performance Testing](#performance-testing)

---

## Testing Overview

### Test Environment Requirements

**Prerequisites:**
- Stripe test mode enabled
- Clerk authentication configured
- Test user accounts created
- Test payment methods available

**Test Cards (Stripe):**
- **Success**: `4242 4242 4242 4242`
- **3DS Required**: `4000 0027 6000 3184`
- **Declined**: `4000 0000 0000 0002`
- **Insufficient Funds**: `4000 0000 0000 9995`

**Test Bank Account (ACH):**
- **Routing Number**: `110000000`
- **Account Number**: `000123456789`

---

## Phase 1: Payment Methods Testing

### Test Case 1.1: View Payment Methods

**Objective**: Verify payment methods list displays correctly

**Steps:**
1. Navigate to `/dashboard/billing`
2. Scroll to "Payment Methods" section
3. Verify empty state if no methods exist
4. Verify list displays if methods exist

**Expected Results:**
- ✅ Empty state shows "No payment methods added yet" message
- ✅ Empty state shows "Add Your First Payment Method" button
- ✅ Payment methods display in grid (2 columns on desktop)
- ✅ Each card shows: brand icon, last 4 digits, expiry date
- ✅ Default badge appears on default payment method
- ✅ Action menu (⋮) appears on each card

---

### Test Case 1.2: Add Payment Method (Card)

**Objective**: Add a new credit/debit card successfully

**Steps:**
1. Click "Add Payment Method" button
2. Wait for modal to open
3. Wait for Stripe Elements to load
4. Select "Card" tab
5. Enter test card: `4242 4242 4242 4242`
6. Enter expiry: `12/25`
7. Enter CVC: `123`
8. Enter ZIP: `12345`
9. Click "Add Payment Method"
10. Wait for success animation

**Expected Results:**
- ✅ Modal opens with "Add Payment Method" title
- ✅ Stripe Elements loads (shows payment form)
- ✅ Card and Bank Account tabs visible
- ✅ Button shows "Adding..." with loading spinner
- ✅ Success state shows green checkmark
- ✅ Modal closes after 1.5 seconds
- ✅ New card appears in payment methods list
- ✅ Card shows "Visa •••• 4242"

---

### Test Case 1.3: Add Payment Method (ACH Bank Account)

**Objective**: Add a new bank account successfully

**Steps:**
1. Click "Add Payment Method" button
2. Select "Bank account" tab in Stripe Elements
3. Select "US bank account"
4. Enter routing number: `110000000`
5. Enter account number: `000123456789`
6. Select "Checking" account type
7. Click "Add Payment Method"
8. Complete micro-deposit verification (if required)

**Expected Results:**
- ✅ Bank account tab loads successfully
- ✅ Form accepts routing and account numbers
- ✅ Success message appears
- ✅ Bank account appears in list
- ✅ Shows "Bank Account •••• 6789"
- ✅ Shows bank name (if available)

---

### Test Case 1.4: Set Default Payment Method

**Objective**: Change the default payment method

**Steps:**
1. Click action menu (⋮) on a non-default payment method
2. Click "Set as Default"
3. Wait for update

**Expected Results:**
- ✅ Loading spinner appears on the card
- ✅ Default badge moves to selected card
- ✅ Previous default card loses badge
- ✅ "Default" badge is blue with checkmark icon
- ✅ No page reload required

---

### Test Case 1.5: Remove Payment Method

**Objective**: Delete a payment method

**Steps:**
1. Click action menu (⋮) on a payment method
2. Click "Remove"
3. Confirm deletion in browser dialog
4. Wait for removal

**Expected Results:**
- ✅ Confirmation dialog appears
- ✅ Dialog shows card type (card/bank account)
- ✅ Card fades out and disappears
- ✅ Grid reflows smoothly
- ✅ Count updates in header
- ✅ Empty state appears if last method removed

---

### Test Case 1.6: Error Handling - Failed Card

**Objective**: Handle declined card gracefully

**Steps:**
1. Click "Add Payment Method"
2. Enter declined test card: `4000 0000 0000 0002`
3. Complete form and submit

**Expected Results:**
- ✅ Error message appears: "Your card was declined"
- ✅ Error is styled in red
- ✅ Form remains open for retry
- ✅ Button returns to "Add Payment Method" state
- ✅ User can retry with different card

---

## Phase 2: Subscription Management Testing

### Test Case 2.1: View Active Subscription

**Objective**: Verify subscription details display correctly

**Steps:**
1. Navigate to `/dashboard/billing`
2. Scroll to "Active Subscription" section
3. Review all displayed information

**Expected Results:**
- ✅ Plan name displays (Professional, Business, Enterprise, Enterprise Plus)
- ✅ Billing cycle shows (Monthly or Annual)
- ✅ Status badge shows "Active" (green)
- ✅ Current billing amount displays
- ✅ Next billing date displays
- ✅ Billing period shows (start - end dates)
- ✅ "Change Plan" and "Cancel" buttons visible
- ✅ Subscription start date shows at bottom

---

### Test Case 2.2: Change Plan (Upgrade)

**Objective**: Upgrade to a higher tier plan

**Steps:**
1. Click "Change Plan" button
2. Wait for modal to open
3. Select a higher tier plan (e.g., Professional → Business)
4. Review prorated billing notice
5. Click "Change Plan"
6. Wait for success animation

**Expected Results:**
- ✅ Modal shows all 4 plans
- ✅ Current plan is disabled and grayed out
- ✅ Radio buttons work for plan selection
- ✅ Prorated billing notice appears in blue
- ✅ Button shows "Changing Plan..." with spinner
- ✅ Success animation shows green checkmark
- ✅ Modal closes automatically
- ✅ Subscription card updates with new plan
- ✅ New amount reflects immediately

---

### Test Case 2.3: Change Plan (Downgrade)

**Objective**: Downgrade to a lower tier plan

**Steps:**
1. Click "Change Plan" button
2. Select a lower tier plan (e.g., Business → Professional)
3. Review prorated billing notice
4. Click "Change Plan"

**Expected Results:**
- ✅ Prorated credit notice appears
- ✅ Downgrade processes successfully
- ✅ New plan reflects immediately
- ✅ Credits show on next invoice
- ✅ No service interruption

---

### Test Case 2.4: Cancel Subscription (At Period End)

**Objective**: Schedule subscription for cancellation

**Steps:**
1. Click "Cancel" button
2. Wait for modal to open
3. Review cancellation warning
4. Keep "Cancel at end of billing period" selected (default)
5. Read retention offer
6. Click "Cancel Subscription"
7. Wait for confirmation

**Expected Results:**
- ✅ Modal shows orange warning banner
- ✅ Warning explains access retention until period end
- ✅ Blue retention box suggests downgrading instead
- ✅ Two radio options visible
- ✅ "Cancel at period end" is pre-selected
- ✅ Button is red with "Cancel Subscription" text
- ✅ Success message confirms cancellation
- ✅ Orange banner appears on subscription card
- ✅ "Reactivate Subscription" button appears
- ✅ Subscription remains active until end date

---

### Test Case 2.5: Cancel Subscription (Immediately)

**Objective**: Cancel subscription with immediate effect

**Steps:**
1. Click "Cancel" button
2. Select "Cancel immediately" option
3. Read warning about no refund
4. Click "Cancel Subscription"

**Expected Results:**
- ✅ Warning explains immediate access loss
- ✅ Warning states no refund for remaining time
- ✅ Success message shows "Subscription Canceled"
- ✅ Status changes to "Canceled"
- ✅ User immediately loses access

---

### Test Case 2.6: Reactivate Subscription

**Objective**: Undo scheduled cancellation

**Steps:**
1. After scheduling cancellation (Test 2.4)
2. Click "Reactivate Subscription" button in orange banner
3. Wait for update

**Expected Results:**
- ✅ Button shows loading spinner
- ✅ Orange banner disappears
- ✅ "Reactivate" button disappears
- ✅ "Change Plan" and "Cancel" buttons reappear
- ✅ Status remains "Active"
- ✅ Subscription continues normally

---

### Test Case 2.7: No Subscription State

**Objective**: Handle users without active subscriptions

**Steps:**
1. Use account without subscription
2. Navigate to `/dashboard/billing`
3. View subscription section

**Expected Results:**
- ✅ Shows "No Active Subscription" message
- ✅ Card icon visible
- ✅ "Subscribe to an Afilo Enterprise plan" text
- ✅ "View Plans" button with gradient
- ✅ Button redirects to `/pricing`

---

## Phase 3: Invoice History Testing

### Test Case 3.1: View Invoice List

**Objective**: Display invoice history correctly

**Steps:**
1. Navigate to `/dashboard/billing`
2. Scroll to "Invoice History" section
3. Review all invoices

**Expected Results:**
- ✅ Invoices display in single column
- ✅ Most recent invoice first
- ✅ Each invoice shows:
  - Invoice number or ID
  - Status badge (Paid, Pending, Failed)
  - Amount
  - Creation date
  - Billing period (if available)
- ✅ "Refresh" button appears in header
- ✅ Invoice count displays (e.g., "3 invoices")

---

### Test Case 3.2: Download Invoice PDF

**Objective**: Download invoice PDF successfully

**Steps:**
1. Click "Download PDF" button on a paid invoice
2. Wait for new tab to open

**Expected Results:**
- ✅ Button shows loading spinner briefly
- ✅ New browser tab opens with PDF
- ✅ PDF displays Stripe invoice
- ✅ PDF shows correct invoice details
- ✅ Browser offers download option

---

### Test Case 3.3: Retry Failed Payment

**Objective**: Retry payment for failed invoice

**Steps:**
1. Locate an invoice with "Failed" status (red badge)
2. Read failed payment warning banner
3. Click "Retry Payment" button
4. Wait for processing

**Expected Results:**
- ✅ Red warning banner visible
- ✅ Shows attempt count (e.g., "3 attempts made")
- ✅ "Retry Payment" button is blue
- ✅ Button shows "Retrying..." with spinner
- ✅ On success: status changes to "Paid"
- ✅ On failure: error message appears
- ✅ PDF download button appears after success

---

### Test Case 3.4: Empty Invoice State

**Objective**: Handle accounts with no invoices

**Steps:**
1. Use new account with no billing history
2. Navigate to `/dashboard/billing`
3. View invoice section

**Expected Results:**
- ✅ Shows "No invoices yet" message
- ✅ File icon visible (gray)
- ✅ Help text: "Your invoice history will appear here after your first payment"
- ✅ No error states

---

### Test Case 3.5: Invoice Status Badges

**Objective**: Verify all status badges display correctly

**Test Statuses:**
- ✅ **Paid**: Green badge with "Paid" text
- ✅ **Open/Pending**: Blue badge with "Pending" text
- ✅ **Uncollectible/Failed**: Red badge with "Failed" text
- ✅ **Draft**: Gray badge with "Draft" text
- ✅ **Void**: Gray badge with "Void" text

**Expected**: Each badge has correct color, text, and dot indicator

---

## Phase 4: Dashboard Integration Testing

### Test Case 4.1: Dashboard Billing Summary Widget

**Objective**: Verify billing widget on main dashboard

**Steps:**
1. Navigate to `/dashboard`
2. Locate "Billing & Subscription" section
3. Review widget content

**Expected Results:**
- ✅ Widget appears below quick stats
- ✅ Section header: "Billing & Subscription"
- ✅ Widget shows active plan name
- ✅ "Active" badge is green
- ✅ Billing cycle displays (Monthly/Annually)
- ✅ Next billing date shows with calendar icon
- ✅ Amount shows with trending icon
- ✅ "Manage Billing" button present
- ✅ Button redirects to `/dashboard/billing`

---

### Test Case 4.2: Dashboard - No Subscription State

**Objective**: Widget displays correctly without subscription

**Steps:**
1. Use account without subscription
2. Navigate to `/dashboard`
3. View billing widget

**Expected Results:**
- ✅ Widget shows blue/purple gradient background
- ✅ Title: "No Active Subscription"
- ✅ Help text: "Subscribe to unlock premium features"
- ✅ "View Plans" button with gradient
- ✅ Button redirects to `/pricing`
- ✅ TrendingUp icon visible

---

### Test Case 4.3: "Manage Billing" Button (Header)

**Objective**: Test billing button in dashboard header

**Steps:**
1. Navigate to `/dashboard`
2. Locate "Manage Billing" button in header (top-right)
3. Click button

**Expected Results:**
- ✅ Button shows CreditCard icon
- ✅ Button shows ArrowRight icon (not ExternalLink)
- ✅ Button styled as outline variant
- ✅ Clicking navigates to `/dashboard/billing`
- ✅ No external redirect
- ✅ Instant navigation (no loading state)

---

## Cross-Browser Testing

### Test Case 5.1: Chrome/Edge Testing

**Browsers**: Chrome 120+, Edge 120+

**Test Areas:**
- ✅ Stripe Elements renders correctly
- ✅ Modal animations smooth
- ✅ All buttons functional
- ✅ Hover states work

---

### Test Case 5.2: Firefox Testing

**Browser**: Firefox 120+

**Test Areas:**
- ✅ Payment form displays correctly
- ✅ Grid layouts render properly
- ✅ Dropdown menus work
- ✅ Card shadows visible

---

### Test Case 5.3: Safari Testing

**Browser**: Safari 17+

**Test Areas:**
- ✅ ACH bank account entry works
- ✅ Date formatting correct
- ✅ Currency formatting proper
- ✅ Modal backdrop functional

---

## Mobile Responsiveness Testing

### Test Case 6.1: Mobile Layout (375px - 767px)

**Devices**: iPhone SE, iPhone 12/13/14, Samsung Galaxy

**Areas to Test:**
- ✅ Payment methods stack vertically (1 column)
- ✅ Subscription card readable
- ✅ Invoices display properly
- ✅ Modals fit screen
- ✅ Buttons touch-friendly (44px+ height)
- ✅ No horizontal scroll
- ✅ Text readable without zoom

---

### Test Case 6.2: Tablet Layout (768px - 1023px)

**Devices**: iPad, iPad Pro, Android tablets

**Areas to Test:**
- ✅ Payment methods show 2 columns
- ✅ Dashboard widgets fit properly
- ✅ Modals centered and sized well
- ✅ Navigation accessible

---

### Test Case 6.3: Desktop Layout (1024px+)

**Resolutions**: 1280x720, 1920x1080, 2560x1440

**Areas to Test:**
- ✅ Max-width container (max-w-7xl)
- ✅ 2-column payment methods grid
- ✅ Dashboard widget in single column
- ✅ All content properly centered

---

## Error Handling Testing

### Test Case 7.1: Network Error Handling

**Objective**: Handle API failures gracefully

**Steps:**
1. Disconnect network/enable offline mode
2. Try to load `/dashboard/billing`
3. Try to add payment method
4. Try to change plan

**Expected Results:**
- ✅ Red error banner appears
- ✅ Error message: "Failed to load billing information"
- ✅ "Try Again" button visible
- ✅ Clicking retry attempts reload
- ✅ No blank screens or crashes

---

### Test Case 7.2: Stripe API Error Handling

**Objective**: Handle Stripe-specific errors

**Test Scenarios:**
- Invalid API key
- Rate limit exceeded
- Card declined
- 3DS authentication failed

**Expected Results:**
- ✅ User-friendly error messages
- ✅ Technical details hidden from user
- ✅ Retry options available
- ✅ Support contact info (if needed)

---

### Test Case 7.3: Clerk Authentication Errors

**Objective**: Handle auth failures properly

**Steps:**
1. Log out of Clerk
2. Try to access `/dashboard/billing`

**Expected Results:**
- ✅ Redirect to `/sign-in?redirect=/dashboard/billing`
- ✅ After sign-in, return to billing page
- ✅ 401 Unauthorized handled gracefully

---

## Security Testing

### Test Case 8.1: Authorization Checks

**Objective**: Ensure users can only access their own data

**Steps:**
1. Log in as User A
2. Note payment method ID from User A
3. Log out and log in as User B
4. Try to delete User A's payment method via API
5. Try to view User B's subscription

**Expected Results:**
- ✅ API returns 403 Forbidden
- ✅ User B cannot access User A's data
- ✅ Ownership verification enforced
- ✅ Error message: "This does not belong to you"

---

### Test Case 8.2: CSRF Protection

**Objective**: Verify CSRF tokens enforced

**Steps:**
1. Inspect POST request headers
2. Verify `Content-Type: application/json`
3. Check for Clerk session token

**Expected Results:**
- ✅ All POST requests require authentication
- ✅ Clerk handles session management
- ✅ No state-changing GET requests

---

### Test Case 8.3: XSS Prevention

**Objective**: Ensure no script injection possible

**Steps:**
1. Try to inject `<script>alert('XSS')</script>` in:
   - Payment method fields
   - Subscription plan names
   - Invoice descriptions

**Expected Results:**
- ✅ Scripts do not execute
- ✅ Input properly escaped/sanitized
- ✅ React's built-in XSS protection working

---

## Performance Testing

### Test Case 9.1: Page Load Time

**Objective**: Measure initial load performance

**Target**: < 2 seconds on 3G network

**Metrics:**
- ✅ First Contentful Paint (FCP) < 1.5s
- ✅ Largest Contentful Paint (LCP) < 2.5s
- ✅ Time to Interactive (TTI) < 3.5s
- ✅ Cumulative Layout Shift (CLS) < 0.1

**Tools**: Lighthouse, WebPageTest

---

### Test Case 9.2: API Response Times

**Objective**: Ensure fast API responses

**Target**: < 200ms median response

**Endpoints to Test:**
- GET `/api/billing/payment-methods/list`
- GET `/api/billing/subscriptions/active`
- GET `/api/billing/invoices/list`
- POST `/api/billing/subscriptions/change-plan`

**Expected Results:**
- ✅ p50 < 200ms
- ✅ p95 < 500ms
- ✅ p99 < 1000ms

---

### Test Case 9.3: Stripe Elements Load Time

**Objective**: Measure Stripe Elements initialization

**Target**: < 1 second

**Steps:**
1. Click "Add Payment Method"
2. Measure time until form visible

**Expected Results:**
- ✅ Modal opens < 100ms
- ✅ Loading spinner appears immediately
- ✅ Stripe Elements renders < 1s
- ✅ Form ready for input < 1.5s

---

## Test Checklist

### Pre-Production Checklist

- [ ] All test cases pass
- [ ] No console errors
- [ ] Mobile responsive verified
- [ ] Cross-browser tested
- [ ] Security audit complete
- [ ] Performance benchmarks met
- [ ] Error handling validated
- [ ] Loading states smooth
- [ ] Empty states functional
- [ ] User documentation updated

---

## Test Results Template

```markdown
## Test Execution Report

**Date**: [Date]
**Tester**: [Name]
**Environment**: [Test/Staging/Production]

### Summary
- Total Tests: X
- Passed: X
- Failed: X
- Blocked: X
- Pass Rate: X%

### Failed Tests
1. [Test Case ID] - [Issue Description]
   - **Severity**: Critical/High/Medium/Low
   - **Steps to Reproduce**: ...
   - **Expected**: ...
   - **Actual**: ...
   - **Screenshot**: [Link]

### Browser Coverage
- ✅ Chrome: Passed
- ✅ Firefox: Passed
- ✅ Safari: Passed
- ✅ Edge: Passed

### Mobile Coverage
- ✅ iOS: Passed
- ✅ Android: Passed
- ✅ Tablet: Passed

### Notes
[Additional observations]
```

---

## Bug Report Template

```markdown
## Bug Report: [Short Description]

**Severity**: Critical / High / Medium / Low
**Priority**: P0 / P1 / P2 / P3
**Affected Component**: Payment Methods / Subscriptions / Invoices / Dashboard

### Description
[Detailed description of the bug]

### Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Environment
- **Browser**: [Browser name and version]
- **Device**: [Device type]
- **Screen Size**: [Resolution]
- **User Role**: [Standard/Premium]
- **Subscription Status**: [Active/Canceled/None]

### Screenshots/Videos
[Attach visual evidence]

### Console Errors
```
[Paste console errors if any]
```

### Additional Context
[Any other relevant information]
```

---

## Support Contacts

**Issues**: https://github.com/code-craka/afilo-nextjs-shopify-app/issues
**Documentation**: `/docs` folder
**Stripe Dashboard**: https://dashboard.stripe.com
**Clerk Dashboard**: https://dashboard.clerk.com

---

**Testing Status**: ✅ Ready for Production
**Last Review**: January 30, 2025
**Next Review**: As needed for updates
