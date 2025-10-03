'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Mail, Calendar, CreditCard, Users, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface SessionData {
  sessionId: string;
  status: string;
  paymentStatus: string;
  customerEmail: string;
  customerName: string | null;
  subscriptionId: string | null;
  subscriptionStatus: string | null;
  planName: string;
  planTier: string;
  userLimit: string;
  amount: number;
  currency: string;
  formattedAmount: string;
  billingInterval: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  features: string[];
  paymentMethodTypes: string[];
  createdAt: string;
}

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided');
      setIsLoading(false);
      return;
    }

    // Fetch session data
    const fetchSessionData = async () => {
      try {
        console.log('📝 Fetching session:', sessionId);

        const response = await fetch(`/api/stripe/session/${sessionId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch session data');
        }

        console.log('✅ Session data retrieved:', data);
        setSessionData(data);
        setIsLoading(false);
      } catch (err) {
        console.error('❌ Error fetching session:', err);
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error.message);
        setIsLoading(false);
      }
    };

    fetchSessionData();
  }, [sessionId]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your subscription details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !sessionData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertDescription>
              <strong>Error:</strong> {error || 'Failed to load subscription details'}
            </AlertDescription>
          </Alert>
          <div className="text-center mt-6">
            <Link
              href="/pricing"
              className="text-blue-600 hover:text-blue-700 font-medium underline"
            >
              ← Back to Pricing
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Success header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎉 Subscription Successful!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Welcome to <strong>{sessionData.planName}</strong>! Your credentials have been sent to your email.
          </p>
        </div>

        {/* Main card */}
        <Card className="p-8 mb-8">
          {/* Email credentials notice */}
          <Alert className="mb-8 bg-blue-50 border-blue-200">
            <Mail className="h-5 w-5 text-blue-600" />
            <AlertDescription className="ml-2">
              <strong className="text-blue-900">📧 Check Your Email!</strong>
              <p className="text-blue-800 mt-1">
                Your login credentials have been sent to <strong>{sessionData.customerEmail}</strong>.
                Check your inbox for the welcome email with your username, temporary password, and login link.
              </p>
            </AlertDescription>
          </Alert>

          {/* Subscription details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Plan details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Plan Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Plan:</span>
                  <span className="font-medium text-gray-900">{sessionData.planName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Billing:</span>
                  <Badge variant="secondary">
                    {sessionData.billingInterval === 'monthly' ? 'Monthly' : 'Annual'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">User Limit:</span>
                  <span className="font-medium text-gray-900 flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {sessionData.userLimit}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant="success">{sessionData.subscriptionStatus}</Badge>
                </div>
              </div>
            </div>

            {/* Payment details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Payment Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-bold text-gray-900 text-xl">
                    {sessionData.formattedAmount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium text-gray-900 flex items-center gap-1">
                    <CreditCard className="h-4 w-4" />
                    {sessionData.paymentMethodTypes[0] === 'us_bank_account' ? 'ACH' : 'Card'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Next Billing:</span>
                  <span className="font-medium text-gray-900 flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {sessionData.currentPeriodEnd}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Subscription ID:</span>
                  <span className="font-mono text-xs text-gray-600">
                    {sessionData.subscriptionId?.substring(0, 20)}...
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Features included */}
          {sessionData.features.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                ✨ What's Included
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sessionData.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Next steps */}
        <Card className="p-8 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">📋 Next Steps</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full flex-shrink-0">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Check your email</p>
                <p className="text-sm text-gray-600">
                  We've sent your login credentials to <strong>{sessionData.customerEmail}</strong>
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full flex-shrink-0">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Log in to your account</p>
                <p className="text-sm text-gray-600">
                  Use the login link and credentials from the email to access your account
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full flex-shrink-0">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Change your password</p>
                <p className="text-sm text-gray-600">
                  For security, please change your temporary password after first login
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full flex-shrink-0">
                <span className="text-blue-600 font-bold">4</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Start using your subscription</p>
                <p className="text-sm text-gray-600">
                  Explore all the features included in your {sessionData.planName}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`${process.env.NEXT_PUBLIC_APP_URL || 'https://app.afilo.io'}/login`}
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Go to Login →
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            View Dashboard
          </Link>
        </div>

        {/* Help section */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Need help?{' '}
            <a
              href="/contact"
              className="text-blue-600 hover:text-blue-700 font-medium underline"
            >
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      }
    >
      <SuccessPageContent />
    </Suspense>
  );
}
