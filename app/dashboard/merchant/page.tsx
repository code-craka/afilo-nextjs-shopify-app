/**
 * Merchant Dashboard Page
 *
 * Main dashboard for merchant accounts
 * Shows account status, embedded Stripe components, and transfer history
 */

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { AccountDashboard } from '@/components/merchant/AccountDashboard';
import { TransferList } from '@/components/merchant/TransferList';
import StripeConnectProvider from '@/components/providers/StripeConnectProvider';
import { prisma } from '@/lib/prisma';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Merchant Dashboard | Afilo Marketplace',
  description: 'Manage your marketplace account, payments, and payouts',
};

async function getConnectAccount(userId: string) {
  const account = await prisma.stripe_connect_accounts.findFirst({
    where: { clerk_user_id: userId },
    orderBy: { created_at: 'desc' },
  });

  return account;
}

export default async function MerchantDashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in?redirect_url=/dashboard/merchant');
  }

  const account = await getConnectAccount(userId);

  // If no account, redirect to onboarding
  if (!account) {
    redirect('/dashboard/merchant/onboarding');
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Merchant Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your marketplace account and view your earnings
        </p>
      </div>

      <Suspense fallback={<DashboardLoadingState />}>
        <StripeConnectProvider
          publishableKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
          accountId={account.id}
        >
          {/* Account Dashboard with Embedded Components */}
          <AccountDashboard accountId={account.id} />
        </StripeConnectProvider>

        {/* Transfer History */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold tracking-tight mb-6">Payment History</h2>
          <TransferList accountId={account.id} limit={10} />
        </div>
      </Suspense>
    </div>
  );
}

/**
 * Loading State
 */
function DashboardLoadingState() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
