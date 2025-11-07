/**
 * Admin Connect Overview Page
 *
 * Overview dashboard for Stripe Connect marketplace operations
 * Shows key metrics, recent accounts, and recent transfers (Admin only)
 */

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/prisma';
import {
  Building2,
  DollarSign,
  TrendingUp,
  Users,
  ArrowRight,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Connect Overview | Admin Dashboard',
  description: 'Manage Stripe Connect marketplace operations',
};

async function getConnectStats(userId: string) {
  // Verify admin role
  const userProfile = await prisma.user_profiles.findFirst({
    where: { clerk_user_id: userId },
    select: { role: true },
  });

  if (userProfile?.role !== 'admin') {
    return null;
  }

  // Get account counts by status
  const [totalAccounts, activeAccounts, pendingAccounts, restrictedAccounts] =
    await Promise.all([
      prisma.stripe_connect_accounts.count(),
      prisma.stripe_connect_accounts.count({
        where: {
          charges_enabled: true,
          payouts_enabled: true,
          onboarding_status: 'completed',
        },
      }),
      prisma.stripe_connect_accounts.count({
        where: { onboarding_status: 'pending' },
      }),
      prisma.stripe_connect_accounts.count({
        where: { onboarding_status: 'restricted' },
      }),
    ]);

  // Get transfer stats
  const [totalTransfers, totalVolume, recentTransfers] = await Promise.all([
    prisma.marketplace_transfers.count(),
    prisma.marketplace_transfers.aggregate({
      _sum: { amount: true },
      where: { status: 'paid' },
    }),
    prisma.marketplace_transfers.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      include: {
        destination_account: {
          select: {
            business_name: true,
            email: true,
          },
        },
      },
    }),
  ]);

  // Get recent accounts
  const recentAccounts = await prisma.stripe_connect_accounts.findMany({
    take: 5,
    orderBy: { created_at: 'desc' },
  });

  return {
    accounts: {
      total: totalAccounts,
      active: activeAccounts,
      pending: pendingAccounts,
      restricted: restrictedAccounts,
    },
    transfers: {
      total: totalTransfers,
      volume: Number(totalVolume._sum.amount || 0),
    },
    recentAccounts,
    recentTransfers,
  };
}

export default async function AdminConnectOverviewPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in?redirect_url=/dashboard/admin/connect');
  }

  const stats = await getConnectStats(userId);

  // Not admin, redirect to main dashboard
  if (!stats) {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Connect Marketplace</h1>
        <p className="text-muted-foreground">
          Manage Stripe Connect accounts and marketplace operations
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Building2 className="w-5 h-5" />}
          label="Total Accounts"
          value={stats.accounts.total}
          bgColor="bg-blue-100 dark:bg-blue-950"
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5" />}
          label="Active Accounts"
          value={stats.accounts.active}
          bgColor="bg-green-100 dark:bg-green-950"
          iconColor="text-green-600 dark:text-green-400"
        />
        <StatCard
          icon={<DollarSign className="w-5 h-5" />}
          label="Total Transfers"
          value={stats.transfers.total}
          bgColor="bg-purple-100 dark:bg-purple-950"
          iconColor="text-purple-600 dark:text-purple-400"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Transfer Volume"
          value={`$${stats.transfers.volume.toFixed(2)}`}
          bgColor="bg-orange-100 dark:bg-orange-950"
          iconColor="text-orange-600 dark:text-orange-400"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Account Management
            </CardTitle>
            <CardDescription>Manage all Connect accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Pending Setup</span>
                <Badge variant="secondary">{stats.accounts.pending}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Restricted</span>
                <Badge variant="destructive">{stats.accounts.restricted}</Badge>
              </div>
              <Link href="/dashboard/admin/connect/accounts">
                <Button className="w-full mt-2">
                  View All Accounts
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Transfer Management
            </CardTitle>
            <CardDescription>Create and manage transfers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Volume</span>
                <span className="font-semibold">
                  ${stats.transfers.volume.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Count</span>
                <span className="font-semibold">{stats.transfers.total}</span>
              </div>
              <Link href="/dashboard/admin/connect/transfers">
                <Button className="w-full mt-2">
                  Manage Transfers
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Accounts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Accounts</CardTitle>
              <Link href="/dashboard/admin/connect/accounts">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentAccounts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No accounts yet
                </p>
              ) : (
                stats.recentAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {account.business_name || 'Unnamed Business'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {account.email || 'No email'}
                      </p>
                    </div>
                    <AccountStatusBadge
                      isReady={account.charges_enabled && account.payouts_enabled}
                      status={account.onboarding_status}
                    />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transfers */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Transfers</CardTitle>
              <Link href="/dashboard/admin/connect/transfers">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentTransfers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No transfers yet
                </p>
              ) : (
                stats.recentTransfers.map((transfer) => (
                  <div
                    key={transfer.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {transfer.description || 'Platform Payment'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {(transfer as any).destination_account?.business_name ||
                          (transfer as any).destination_account?.email ||
                          'Unknown'}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold">
                        ${Number(transfer.amount).toFixed(2)}
                      </p>
                      <TransferStatusBadge status={transfer.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * Stat Card
 */
function StatCard({
  icon,
  label,
  value,
  bgColor,
  iconColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  bgColor: string;
  iconColor: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg ${bgColor} ${iconColor}`}>{icon}</div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Account Status Badge
 */
function AccountStatusBadge({
  isReady,
  status,
}: {
  isReady: boolean;
  status: string;
}) {
  if (isReady) {
    return <Badge variant="success">Active</Badge>;
  }
  if (status === 'restricted') {
    return <Badge variant="destructive">Restricted</Badge>;
  }
  return <Badge variant="secondary">Pending</Badge>;
}

/**
 * Transfer Status Badge
 */
function TransferStatusBadge({ status }: { status: string }) {
  const variant =
    status === 'paid'
      ? 'success'
      : status === 'failed'
      ? 'destructive'
      : 'secondary';
  return (
    <Badge variant={variant as any} className="text-xs">
      {status}
    </Badge>
  );
}
