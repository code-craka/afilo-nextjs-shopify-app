'use client';

import { useState } from 'react';
import ProtectedTestPage from '@/components/ProtectedTestPage';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SubscriptionCheckout } from '@/components/stripe/SubscriptionCheckout';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Info,
  Mail,
  CreditCard,
  Users,
  DollarSign,
} from 'lucide-react';

/**
 * Subscription Testing Page
 *
 * IMPORTANT: Before testing, you MUST:
 * 1. Run: pnpm tsx scripts/create-enterprise-subscriptions-no-trial.ts
 * 2. Copy the Price IDs from the output
 * 3. Update TEST_PLANS below with the actual Price IDs
 * 4. Configure webhook in Stripe Dashboard (see webhook route.ts for instructions)
 * 5. Add RESEND_API_KEY to .env.local for email testing
 *
 * This page tests:
 * - Subscription checkout flow
 * - Price ID validation
 * - Customer email handling
 * - Webhook event handling (via Stripe Dashboard)
 * - Email credential delivery (check email after payment)
 */

interface TestPlan {
  id: string;
  name: string;
  monthlyPriceId: string; // TODO: Update with actual Stripe Price ID
  annualPriceId: string;  // TODO: Update with actual Stripe Price ID
  monthlyPrice: number;
  annualPrice: number;
  users: string;
}

const TEST_PLANS: TestPlan[] = [
  {
    id: 'professional',
    name: 'Professional Plan',
    monthlyPriceId: 'price_1SE5j3FcrRhjqzak0S0YtNNF',
    annualPriceId: 'price_1SE5j4FcrRhjqzakFVaLCQOo',
    monthlyPrice: 499,
    annualPrice: 4983,
    users: 'Up to 25 users',
  },
  {
    id: 'business',
    name: 'Business Plan',
    monthlyPriceId: 'price_1SE5j5FcrRhjqzakCZvxb66W',
    annualPriceId: 'price_1SE5j6FcrRhjqzakcykXemDQ',
    monthlyPrice: 1499,
    annualPrice: 14943,
    users: 'Up to 100 users',
  },
];

interface TestResult {
  status: 'success' | 'error' | 'pending';
  message: string;
  details?: any;
}

function TestSubscriptionContent() {
  const [selectedPlan, setSelectedPlan] = useState<TestPlan | null>(null);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [isTestingAPI, setIsTestingAPI] = useState(false);

  // Test API health check
  const testAPIHealth = async () => {
    setIsTestingAPI(true);
    const results: Record<string, TestResult> = {};

    try {
      // Test checkout API
      console.log('🧪 Testing checkout API...');
      const checkoutResponse = await fetch('/api/stripe/create-subscription-checkout');
      const checkoutData = await checkoutResponse.json();
      results.checkout = {
        status: checkoutResponse.ok ? 'success' : 'error',
        message: checkoutResponse.ok
          ? `Checkout API available (v${checkoutData.version})`
          : `Checkout API error: ${checkoutData.error}`,
        details: checkoutData,
      };

      // Test webhook API
      console.log('🧪 Testing webhook API...');
      const webhookResponse = await fetch('/api/stripe/webhook');
      const webhookData = await webhookResponse.json();
      results.webhook = {
        status: webhookResponse.ok ? 'success' : 'error',
        message: webhookResponse.ok
          ? `Webhook configured (v${webhookData.version}) - ${webhookData.events_handled.length} events`
          : `Webhook error: ${webhookData.error}`,
        details: webhookData,
      };

      // Test session API (this will fail without session ID, but checks if endpoint exists)
      console.log('🧪 Testing session API...');
      const sessionResponse = await fetch('/api/stripe/session/cs_test_invalid');
      results.session = {
        status: sessionResponse.status === 404 || sessionResponse.status === 400 ? 'success' : 'error',
        message:
          sessionResponse.status === 404 || sessionResponse.status === 400
            ? 'Session API available (expected 404 for invalid session)'
            : 'Session API not responding correctly',
      };

      setTestResults(results);
    } catch (error) {
      console.error('❌ API test failed:', error);
      results.error = {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
      setTestResults(results);
    } finally {
      setIsTestingAPI(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Page header */}
        <div className="mb-8">
          <Badge variant="warning" className="mb-4">
            🧪 Testing Environment
          </Badge>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Subscription System Testing
          </h1>
          <p className="text-gray-600">
            Test the complete subscription flow: checkout, webhooks, email delivery, and session retrieval.
          </p>
        </div>

        {/* Setup instructions */}
        <Alert className="mb-8 bg-blue-50 border-blue-200">
          <Info className="h-5 w-5 text-blue-600" />
          <AlertDescription className="ml-2">
            <strong className="text-blue-900">⚠️ Before Testing:</strong>
            <ol className="text-blue-800 mt-2 space-y-1 list-decimal list-inside">
              <li>Run subscription products script: <code className="bg-blue-100 px-2 py-0.5 rounded">pnpm tsx scripts/create-enterprise-subscriptions-no-trial.ts</code></li>
              <li>Update Price IDs in this file (TEST_PLANS array)</li>
              <li>Configure webhook in Stripe Dashboard (see /api/stripe/webhook for instructions)</li>
              <li>Add RESEND_API_KEY to .env.local</li>
              <li>Use Stripe test mode cards (4242 4242 4242 4242)</li>
            </ol>
          </AlertDescription>
        </Alert>

        {/* API Health Check */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">API Health Check</h2>
            <Button onClick={testAPIHealth} disabled={isTestingAPI} variant="outline">
              {isTestingAPI ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Run Tests'
              )}
            </Button>
          </div>

          {Object.keys(testResults).length > 0 && (
            <div className="space-y-3">
              {Object.entries(testResults).map(([key, result]) => (
                <div
                  key={key}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  {result.status === 'success' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : result.status === 'error' ? (
                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Loader2 className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5 animate-spin" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 capitalize">{key} API</p>
                    <p className="text-sm text-gray-600">{result.message}</p>
                    {result.details && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                          View details
                        </summary>
                        <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto max-h-40">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Plan Selection */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Select Test Plan</h2>

          {/* Billing interval toggle */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                billingInterval === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('annual')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                billingInterval === 'annual'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Annual (17% savings)
            </button>
          </div>

          {/* Plan cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TEST_PLANS.map((plan) => {
              const price = billingInterval === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
              const priceId = billingInterval === 'monthly' ? plan.monthlyPriceId : plan.annualPriceId;
              const isSelected = selectedPlan?.id === plan.id;

              return (
                <div
                  key={plan.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <Users className="h-4 w-4" />
                        {plan.users}
                      </p>
                    </div>
                    {isSelected && (
                      <Badge variant="success">Selected</Badge>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <DollarSign className="h-5 w-5 text-gray-600" />
                    <span className="text-2xl font-bold text-gray-900">
                      {price.toLocaleString()}
                    </span>
                    <span className="text-gray-600">
                      /{billingInterval === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Price ID: <code className="bg-gray-100 px-1 py-0.5 rounded">{priceId}</code>
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Customer Email Input */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            2. Enter Test Email
          </h2>
          <div className="space-y-2">
            <label htmlFor="test-email" className="text-sm font-medium text-gray-700">
              Email Address (credentials will be sent here)
            </label>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-gray-400" />
              <input
                id="test-email"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <p className="text-xs text-gray-500">
              💡 Tip: Use a real email you can access to test credential delivery
            </p>
          </div>
        </Card>

        {/* Checkout Test */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            3. Start Checkout
          </h2>

          {selectedPlan ? (
            <div className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <AlertDescription className="ml-2">
                  <strong className="text-green-900">Ready to test!</strong>
                  <p className="text-green-800 mt-1">
                    Plan: <strong>{selectedPlan.name}</strong> (
                    {billingInterval === 'monthly' ? 'Monthly' : 'Annual'})
                  </p>
                  <p className="text-green-800">
                    Email: <strong>{testEmail}</strong>
                  </p>
                </AlertDescription>
              </Alert>

              <SubscriptionCheckout
                priceId={billingInterval === 'monthly' ? selectedPlan.monthlyPriceId : selectedPlan.annualPriceId}
                planName={selectedPlan.name}
                customerEmail={testEmail}
                buttonText="🧪 Test Checkout Flow"
                fullWidth
                onCheckoutStart={() => console.log('🚀 Checkout started')}
                onCheckoutError={(error) => console.error('❌ Checkout failed:', error)}
              />

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">What happens next:</h4>
                <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                  <li>You'll be redirected to Stripe Checkout</li>
                  <li>Use test card: <code className="bg-gray-100 px-1 py-0.5 rounded">4242 4242 4242 4242</code></li>
                  <li>Complete payment with any future expiry date and CVC</li>
                  <li>You'll be redirected to success page</li>
                  <li>Webhook fires: <code className="bg-gray-100 px-1 py-0.5 rounded">checkout.session.completed</code></li>
                  <li>Credentials generated and emailed to {testEmail}</li>
                </ol>
              </div>
            </div>
          ) : (
            <Alert variant="destructive">
              <XCircle className="h-5 w-5" />
              <AlertDescription className="ml-2">
                Please select a plan first
              </AlertDescription>
            </Alert>
          )}
        </Card>

        {/* Test Cards */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Test Cards & Scenarios
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-green-500" />
                Success Card
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                <code className="bg-white px-2 py-1 rounded border">4242 4242 4242 4242</code>
              </p>
              <p className="text-xs text-gray-500">
                Use any future expiry date and any 3-digit CVC
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-red-500" />
                Decline Card
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                <code className="bg-white px-2 py-1 rounded border">4000 0000 0000 0002</code>
              </p>
              <p className="text-xs text-gray-500">
                Tests payment failure handling
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-yellow-500" />
                3DS Required Card
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                <code className="bg-white px-2 py-1 rounded border">4000 0025 0000 3155</code>
              </p>
              <p className="text-xs text-gray-500">
                Tests 3D Secure authentication flow
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-500" />
                ACH Test Account
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                Routing: <code className="bg-white px-2 py-1 rounded border">110000000</code>
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Account: <code className="bg-white px-2 py-1 rounded border">000123456789</code>
              </p>
              <p className="text-xs text-gray-500">
                Tests ACH Direct Debit (instant in test mode)
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function TestSubscriptionPage() {
  return (
    <ProtectedTestPage>
      <TestSubscriptionContent />
    </ProtectedTestPage>
  );
}
