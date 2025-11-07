/**
 * Merchant Onboarding Page
 *
 * Public page for creating and completing Stripe Connect account setup
 * Accessible to all authenticated users (converts them to merchant role)
 */

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { ConnectOnboarding } from '@/components/merchant/ConnectOnboarding';
import StripeConnectProvider from '@/components/providers/StripeConnectProvider';
import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Merchant Onboarding | Afilo Marketplace',
  description: 'Set up your Stripe Connect account to start selling on Afilo',
};

interface PageProps {
  searchParams: Promise<{ account?: string }>;
}

async function getConnectAccount(userId: string, accountId?: string) {
  if (!accountId) {
    // Check if user already has an account
    const existingAccount = await prisma.stripe_connect_accounts.findFirst({
      where: { clerk_user_id: userId },
      orderBy: { created_at: 'desc' },
    });
    return existingAccount;
  }

  // Verify account ownership
  const account = await prisma.stripe_connect_accounts.findFirst({
    where: {
      id: accountId,
      clerk_user_id: userId,
    },
  });

  return account;
}

export default async function MerchantOnboardingPage({ searchParams }: PageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in?redirect_url=/dashboard/merchant/onboarding');
  }

  const params = await searchParams;
  const account = await getConnectAccount(userId, params.account);

  // If account is ready, redirect to merchant dashboard
  if (account?.charges_enabled && account?.payouts_enabled && account.onboarding_status === 'completed') {
    redirect('/dashboard/merchant');
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <Suspense fallback={<OnboardingLoadingState />}>
        {account ? (
          <StripeConnectProvider
            publishableKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
            accountId={account.id}
          >
            <ConnectOnboarding
              accountId={account.id}
              onComplete={() => {
                window.location.href = '/dashboard/merchant';
              }}
              onExit={() => {
                window.location.href = '/dashboard';
              }}
            />
          </StripeConnectProvider>
        ) : (
          <ConnectOnboarding
            onComplete={() => {
              window.location.href = '/dashboard/merchant';
            }}
            onExit={() => {
              window.location.href = '/dashboard';
            }}
          />
        )}
      </Suspense>
    </div>
  );
}

/**
 * Loading State
 */
function OnboardingLoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[600px]">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
        <p className="text-muted-foreground">Loading onboarding...</p>
      </div>
    </div>
  );
}
