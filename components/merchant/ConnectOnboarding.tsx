/**
 * Connect Onboarding Component
 *
 * Handles Stripe Connect account creation and onboarding flow
 * Uses Radix UI primitives + CVA variants matching design system
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useConnectAccount } from '@/hooks/useConnectAccount';
import { useStripeConnect } from '@/components/providers/StripeConnectProvider';
import { CheckCircle2, XCircle, Clock, ArrowRight, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConnectOnboardingProps {
  /**
   * Optional account ID if user already has an account
   */
  accountId?: string;

  /**
   * Callback when onboarding completes
   */
  onComplete?: () => void;

  /**
   * Callback when onboarding exits
   */
  onExit?: () => void;
}

export function ConnectOnboarding({
  accountId: initialAccountId,
  onComplete,
  onExit,
}: ConnectOnboardingProps) {
  const router = useRouter();
  const stripeConnectInstance = useStripeConnect();
  const onboardingRef = useRef<HTMLDivElement>(null);
  const [selectedType, setSelectedType] = useState<'express' | 'standard' | null>(null);
  const [showEmbeddedOnboarding, setShowEmbeddedOnboarding] = useState(false);

  const {
    account,
    loading,
    error,
    isReady,
    createAccount,
    fetchAccount,
  } = useConnectAccount({
    accountId: initialAccountId,
    autoFetch: !!initialAccountId,
  });

  // Mount Stripe Connect onboarding component
  useEffect(() => {
    if (showEmbeddedOnboarding && onboardingRef.current && stripeConnectInstance) {
      const accountOnboarding = stripeConnectInstance.create('account-onboarding');

      accountOnboarding.setOnExit(() => {
        handleOnboardingExit();
      });

      accountOnboarding.setOnLoadError(({ error, elementTagName }) => {
        console.error('Account onboarding load error:', error, 'Element:', elementTagName);
      });

      onboardingRef.current.appendChild(accountOnboarding);

      return () => {
        onboardingRef.current?.removeChild(accountOnboarding);
      };
    }
  }, [showEmbeddedOnboarding, stripeConnectInstance]);

  /**
   * Handle account type selection
   */
  const handleSelectAccountType = async (type: 'express' | 'standard') => {
    setSelectedType(type);

    // If Express, show embedded onboarding
    if (type === 'express') {
      const newAccount = await createAccount(type);
      if (newAccount) {
        setShowEmbeddedOnboarding(true);
      }
    } else {
      // For Standard accounts, redirect to Stripe hosted onboarding
      const newAccount = await createAccount(type);
      // Redirect happens automatically in createAccount hook
    }
  };

  /**
   * Handle embedded onboarding complete
   */
  const handleOnboardingComplete = () => {
    setShowEmbeddedOnboarding(false);
    fetchAccount(); // Refresh account data
    onComplete?.();
  };

  /**
   * Handle embedded onboarding exit
   */
  const handleOnboardingExit = () => {
    setShowEmbeddedOnboarding(false);
    onExit?.();
  };

  // Show embedded onboarding component
  if (showEmbeddedOnboarding && account) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Complete Your Account Setup</CardTitle>
              <CardDescription>
                Follow the steps to activate your marketplace account
              </CardDescription>
            </div>
            <Badge variant="secondary">
              <Clock className="w-3 h-3 mr-1" />
              ~5 minutes
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div ref={onboardingRef} className="min-h-[400px]" />
        </CardContent>
      </Card>
    );
  }

  // Show account status if already exists
  if (account && !showEmbeddedOnboarding) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Account Status</CardTitle>
          <CardDescription>
            Your Stripe Connect marketplace account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Account Type */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Account Type</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {account.account_type}
                </p>
              </div>
            </div>
            <Badge variant={isReady ? 'success' : 'secondary'}>
              {isReady ? 'Active' : 'Setup Required'}
            </Badge>
          </div>

          {/* Capabilities */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Capabilities</p>
            <div className="grid gap-3">
              <CapabilityStatus
                label="Accept Payments"
                enabled={account.charges_enabled}
              />
              <CapabilityStatus
                label="Receive Payouts"
                enabled={account.payouts_enabled}
              />
              <CapabilityStatus
                label="Details Submitted"
                enabled={account.details_submitted}
              />
            </div>
          </div>

          {/* Requirements */}
          {account.requirements &&
            account.requirements.currently_due &&
            account.requirements.currently_due.length > 0 && (
              <div className="rounded-lg border border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-950 p-4">
                <p className="font-medium text-sm text-yellow-900 dark:text-yellow-100 mb-2">
                  Action Required
                </p>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Please complete the following requirements:
                </p>
                <ul className="mt-2 ml-4 list-disc text-sm text-yellow-800 dark:text-yellow-200">
                  {account.requirements.currently_due.map((req) => (
                    <li key={req}>{formatRequirement(req)}</li>
                  ))}
                </ul>
              </div>
            )}

          {/* Actions */}
          <div className="flex gap-3">
            {!isReady && (
              <Button
                onClick={() => router.push(`/dashboard/merchant/onboarding?account=${account.id}`)}
                className="w-full"
              >
                Continue Setup
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
            {isReady && (
              <Button
                onClick={() => router.push('/dashboard/merchant')}
                className="w-full"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show account type selection
  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Choose Your Account Type
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Select the account type that best fits your business needs.
          You can upgrade later if needed.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Express Account */}
        <Card
          className={cn(
            'relative cursor-pointer transition-all hover:shadow-lg',
            selectedType === 'express' && 'ring-2 ring-primary'
          )}
          onClick={() => !loading && handleSelectAccountType('express')}
        >
          <div className="absolute top-4 right-4">
            <Badge variant="popular">Recommended</Badge>
          </div>
          <CardHeader>
            <CardTitle>Express Account</CardTitle>
            <CardDescription>Quick setup, embedded dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <FeatureItem text="5-minute setup" />
              <FeatureItem text="Embedded onboarding" />
              <FeatureItem text="Stripe-hosted dashboard" />
              <FeatureItem text="Automated compliance" />
              <FeatureItem text="Built-in fraud protection" />
            </div>
            <Button
              className="w-full"
              disabled={loading}
              onClick={(e) => {
                e.stopPropagation();
                handleSelectAccountType('express');
              }}
            >
              {loading && selectedType === 'express' ? 'Creating...' : 'Get Started'}
            </Button>
          </CardContent>
        </Card>

        {/* Standard Account */}
        <Card
          className={cn(
            'relative cursor-pointer transition-all hover:shadow-lg',
            selectedType === 'standard' && 'ring-2 ring-primary'
          )}
          onClick={() => !loading && handleSelectAccountType('standard')}
        >
          <CardHeader>
            <CardTitle>Standard Account</CardTitle>
            <CardDescription>Full control, direct Stripe access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <FeatureItem text="Full Stripe Dashboard access" />
              <FeatureItem text="Advanced customization" />
              <FeatureItem text="Direct API access" />
              <FeatureItem text="Custom branding" />
              <FeatureItem text="Multi-user access" />
            </div>
            <Button
              variant="outline"
              className="w-full"
              disabled={loading}
              onClick={(e) => {
                e.stopPropagation();
                handleSelectAccountType('standard');
              }}
            >
              {loading && selectedType === 'standard' ? 'Creating...' : 'Get Started'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Capability Status Display
 */
function CapabilityStatus({
  label,
  enabled,
}: {
  label: string;
  enabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
      <span className="text-sm font-medium">{label}</span>
      {enabled ? (
        <CheckCircle2 className="w-5 h-5 text-green-500" />
      ) : (
        <XCircle className="w-5 h-5 text-muted-foreground" />
      )}
    </div>
  );
}

/**
 * Feature List Item
 */
function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  );
}

/**
 * Format requirement field name
 */
function formatRequirement(field: string): string {
  return field
    .split('.')
    .join(' ')
    .replace(/_/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
