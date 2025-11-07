/**
 * Account Dashboard Component
 *
 * Displays Connect account status and embedded management components
 * Uses Stripe embedded components for account management, payouts, payments
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useConnectAccount } from '@/hooks/useConnectAccount';
import { useStripeConnect } from '@/components/providers/StripeConnectProvider';
import {
  Building2,
  CreditCard,
  DollarSign,
  FileText,
  Settings,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency, generateDashboardLink } from '@/lib/stripe/connect-client';

interface AccountDashboardProps {
  accountId: string;
}

export function AccountDashboard({ accountId }: AccountDashboardProps) {
  const stripeConnectInstance = useStripeConnect();
  const accountManagementRef = useRef<HTMLDivElement>(null);
  const paymentsRef = useRef<HTMLDivElement>(null);
  const payoutsRef = useRef<HTMLDivElement>(null);
  const documentsRef = useRef<HTMLDivElement>(null);

  const { account, loading, error, isReady, refreshAccount } = useConnectAccount({
    accountId,
    autoFetch: true,
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // Mount Stripe embedded components based on active tab
  useEffect(() => {
    if (!stripeConnectInstance) return;

    let component: any;
    let ref: HTMLDivElement | null = null;

    switch (activeTab) {
      case 'management':
        if (accountManagementRef.current) {
          component = stripeConnectInstance.create('account-management');
          ref = accountManagementRef.current;
        }
        break;
      case 'payments':
        if (paymentsRef.current) {
          component = stripeConnectInstance.create('payments');
          ref = paymentsRef.current;
        }
        break;
      case 'payouts':
        if (payoutsRef.current) {
          component = stripeConnectInstance.create('payouts');
          ref = payoutsRef.current;
        }
        break;
      case 'documents':
        if (documentsRef.current) {
          component = stripeConnectInstance.create('documents');
          ref = documentsRef.current;
        }
        break;
    }

    if (component && ref) {
      ref.appendChild(component);

      return () => {
        if (ref && component) {
          ref.removeChild(component);
        }
      };
    }
  }, [activeTab, stripeConnectInstance]);

  /**
   * Open Stripe Express Dashboard (Express accounts only)
   */
  const handleOpenDashboard = async () => {
    if (!account || account.account_type !== 'express') return;

    setDashboardLoading(true);
    try {
      const response = await generateDashboardLink(accountId);
      if (response.success && response.data) {
        window.open(response.data.url, '_blank');
      }
    } catch (err) {
      console.error('Failed to open dashboard:', err);
    } finally {
      setDashboardLoading(false);
    }
  };

  if (loading && !account) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="w-5 h-5" />
            <p>{String(error)}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!account) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">No account found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Account Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <CardTitle className="text-2xl">
                  {account.business_name || 'Your Account'}
                </CardTitle>
                <Badge variant={isReady ? 'success' : 'secondary'}>
                  {isReady ? 'Active' : 'Setup Required'}
                </Badge>
              </div>
              <CardDescription>
                {account.email || 'No email on file'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {account.account_type === 'express' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenDashboard}
                  disabled={dashboardLoading}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Stripe Dashboard
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={refreshAccount}>
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatusCard
              icon={<Building2 className="w-5 h-5" />}
              label="Account Type"
              value={account.account_type}
              status={true}
            />
            <StatusCard
              icon={<CreditCard className="w-5 h-5" />}
              label="Payments"
              value={account.charges_enabled ? 'Enabled' : 'Disabled'}
              status={account.charges_enabled}
            />
            <StatusCard
              icon={<DollarSign className="w-5 h-5" />}
              label="Payouts"
              value={account.payouts_enabled ? 'Enabled' : 'Disabled'}
              status={account.payouts_enabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Requirements Warning */}
      {account.requirements &&
        account.requirements.currently_due &&
        account.requirements.currently_due.length > 0 && (
          <Card className="border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-950">
            <CardHeader>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div className="space-y-1">
                  <CardTitle className="text-yellow-900 dark:text-yellow-100">
                    Action Required
                  </CardTitle>
                  <CardDescription className="text-yellow-800 dark:text-yellow-200">
                    Please complete the following requirements to maintain full account access
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {account.requirements.currently_due.map((req) => (
                  <li
                    key={req}
                    className="text-sm text-yellow-800 dark:text-yellow-200"
                  >
                    • {formatRequirement(req)}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

      {/* Embedded Components Tabs */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">
                <Settings className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="payments">
                <CreditCard className="w-4 h-4 mr-2" />
                Payments
              </TabsTrigger>
              <TabsTrigger value="payouts">
                <DollarSign className="w-4 h-4 mr-2" />
                Payouts
              </TabsTrigger>
              <TabsTrigger value="documents">
                <FileText className="w-4 h-4 mr-2" />
                Documents
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent>
            <TabsContent value="overview" className="mt-0">
              <div ref={accountManagementRef} className="min-h-[400px]" />
            </TabsContent>
            <TabsContent value="payments" className="mt-0">
              {isReady ? (
                <div ref={paymentsRef} className="min-h-[400px]" />
              ) : (
                <EmptyState message="Complete onboarding to view payments" />
              )}
            </TabsContent>
            <TabsContent value="payouts" className="mt-0">
              {isReady ? (
                <div ref={payoutsRef} className="min-h-[400px]" />
              ) : (
                <EmptyState message="Complete onboarding to view payouts" />
              )}
            </TabsContent>
            <TabsContent value="documents" className="mt-0">
              <div ref={documentsRef} className="min-h-[400px]" />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}

/**
 * Status Card
 */
function StatusCard({
  icon,
  label,
  value,
  status,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  status: boolean;
}) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
      <div className={cn(
        'p-2 rounded-lg',
        status ? 'bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400' : 'bg-muted text-muted-foreground'
      )}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground truncate">{label}</p>
        <p className="font-medium truncate capitalize">{value}</p>
      </div>
    </div>
  );
}

/**
 * Empty State
 */
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center min-h-[300px] text-center">
      <div className="space-y-2">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto" />
        <p className="text-muted-foreground">{message}</p>
      </div>
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
