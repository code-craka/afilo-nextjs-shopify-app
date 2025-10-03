'use client';

import { useState } from 'react';
import ProtectedTestPage from '@/components/ProtectedTestPage';
import StripePaymentForm from '@/components/stripe/StripePaymentForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Stripe Payment Test Page
 *
 * Comprehensive testing interface for Stripe ACH + Card payments.
 *
 * Features:
 * - Multiple test scenarios
 * - Test card numbers for different outcomes
 * - ACH payment testing
 * - 3D Secure testing
 * - Error handling validation
 * - Success/failure callbacks
 *
 * Test Cards (Stripe):
 * - 4242 4242 4242 4242: Success (no 3DS)
 * - 4000 0027 6000 3184: Requires 3DS
 * - 4000 0000 0000 0002: Card declined
 * - 4100 0000 0000 0019: High risk (fraud review)
 * - 4000 0000 0000 9995: Insufficient funds
 *
 * @see https://stripe.com/docs/testing
 */

interface TestProduct {
  id: string;
  name: string;
  amount: number;
  description: string;
  tier: 'low' | 'medium' | 'high' | 'enterprise';
}

const TEST_PRODUCTS: TestProduct[] = [
  {
    id: 'test-professional',
    name: 'Professional Plan',
    amount: 49900, // $499.00
    description: 'Monthly subscription for up to 25 users',
    tier: 'low',
  },
  {
    id: 'test-enterprise',
    name: 'Enterprise Plan',
    amount: 249900, // $2,499.00
    description: 'Monthly subscription for up to 100 users',
    tier: 'medium',
  },
  {
    id: 'test-enterprise-plus',
    name: 'Enterprise Plus Plan',
    amount: 999900, // $9,999.00
    description: 'Monthly subscription for unlimited users',
    tier: 'high',
  },
  {
    id: 'test-custom',
    name: 'Custom Enterprise Solution',
    amount: 2999900, // $29,999.00
    description: 'Annual contract with custom implementation',
    tier: 'enterprise',
  },
];

function TestStripePaymentContent() {
  const [selectedProduct, setSelectedProduct] = useState<TestProduct>(TEST_PRODUCTS[0]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentResult, setPaymentResult] = useState<{
    status: 'success' | 'error';
    message: string;
    paymentIntentId?: string;
  } | null>(null);

  const handlePaymentSuccess = (paymentIntentId: string) => {
    console.log('✅ Payment successful:', paymentIntentId);
    setPaymentResult({
      status: 'success',
      message: 'Payment submitted successfully!',
      paymentIntentId,
    });
  };

  const handlePaymentError = (error: string) => {
    console.error('❌ Payment failed:', error);
    setPaymentResult({
      status: 'error',
      message: error,
    });
  };

  const resetTest = () => {
    setShowPaymentForm(false);
    setPaymentResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Stripe Payment Testing
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test ACH Direct Debit + Card payments with adaptive 3D Secure
          </p>
        </div>

        {/* Test Cards Reference */}
        <Card className="mb-8 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
          <CardHeader>
            <CardTitle className="text-yellow-800 dark:text-yellow-200">
              Test Card Numbers
            </CardTitle>
            <CardDescription className="text-yellow-700 dark:text-yellow-300">
              Use these cards to test different scenarios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-mono text-green-700 dark:text-green-300">
                  4242 4242 4242 4242
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  ✅ Success (no 3DS required)
                </p>
              </div>
              <div>
                <p className="font-mono text-blue-700 dark:text-blue-300">
                  4000 0027 6000 3184
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  🔐 Requires 3D Secure
                </p>
              </div>
              <div>
                <p className="font-mono text-red-700 dark:text-red-300">
                  4000 0000 0000 0002
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  ❌ Card Declined
                </p>
              </div>
              <div>
                <p className="font-mono text-orange-700 dark:text-orange-300">
                  4100 0000 0000 0019
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  🔍 High Risk (Fraud Review)
                </p>
              </div>
            </div>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 pt-2 border-t border-yellow-200 dark:border-yellow-800">
              <strong>Expiry Date:</strong> Any future date (e.g., 12/30) |{' '}
              <strong>CVC:</strong> Any 3 digits (e.g., 123) |{' '}
              <strong>ZIP:</strong> Any 5 digits (e.g., 12345)
            </p>
          </CardContent>
        </Card>

        {/* Product Selection */}
        {!showPaymentForm && !paymentResult && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Select Test Product</CardTitle>
              <CardDescription>
                Choose a product tier to test different risk thresholds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TEST_PRODUCTS.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedProduct.id === product.id
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {product.name}
                      </h3>
                      <span className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700">
                        {product.tier}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {product.description}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      ${(product.amount / 100).toFixed(2)}
                    </p>
                  </button>
                ))}
              </div>

              <Button
                onClick={() => setShowPaymentForm(true)}
                className="w-full mt-6"
                size="lg"
              >
                Continue to Payment
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Payment Form */}
        {showPaymentForm && !paymentResult && (
          <Card>
            <CardHeader>
              <CardTitle>Test Payment</CardTitle>
              <CardDescription>
                Use test card numbers above or test ACH with routing: 110000000,
                account: 000123456789
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StripePaymentForm
                amount={selectedProduct.amount}
                productName={selectedProduct.name}
                productId={selectedProduct.id}
                customerEmail="test@afilo.io"
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />

              <Button
                onClick={resetTest}
                variant="outline"
                className="w-full mt-4"
              >
                Cancel & Go Back
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Payment Result */}
        {paymentResult && (
          <Card
            className={
              paymentResult.status === 'success'
                ? 'border-green-500 bg-green-50 dark:bg-green-950'
                : 'border-red-500 bg-red-50 dark:bg-red-950'
            }
          >
            <CardHeader>
              <CardTitle
                className={
                  paymentResult.status === 'success'
                    ? 'text-green-800 dark:text-green-200'
                    : 'text-red-800 dark:text-red-200'
                }
              >
                {paymentResult.status === 'success' ? '✅ Success!' : '❌ Error'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={
                  paymentResult.status === 'success'
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-red-700 dark:text-red-300'
                }
              >
                {paymentResult.message}
              </p>

              {paymentResult.paymentIntentId && (
                <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Payment Intent ID:
                  </p>
                  <p className="font-mono text-sm text-gray-900 dark:text-gray-100">
                    {paymentResult.paymentIntentId}
                  </p>
                </div>
              )}

              <div className="mt-6 space-y-2">
                <Button onClick={resetTest} className="w-full">
                  Test Another Payment
                </Button>
                <Button
                  onClick={() => window.open('https://dashboard.stripe.com/test/payments', '_blank')}
                  variant="outline"
                  className="w-full"
                >
                  View in Stripe Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Debug Info */}
        <Card className="mt-8 bg-gray-100 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-sm">Debug Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs font-mono">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Selected Product:</span>{' '}
              {selectedProduct.name}
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Amount:</span> $
              {(selectedProduct.amount / 100).toFixed(2)} ({selectedProduct.amount} cents)
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Product Tier:</span>{' '}
              {selectedProduct.tier}
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">API Endpoint:</span>{' '}
              /api/stripe/create-payment-intent
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Webhook Endpoint:</span>{' '}
              /api/stripe/webhook
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function TestStripePaymentPage() {
  return (
    <ProtectedTestPage>
      <TestStripePaymentContent />
    </ProtectedTestPage>
  );
}
