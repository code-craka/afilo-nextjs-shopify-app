/**
 * Connect Accounts Manager (Admin)
 *
 * Admin component for managing all Connect accounts in the marketplace
 * Includes filtering, search, and bulk operations
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Building2,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ConnectAccount } from '@/types/stripe-connect';

interface ConnectAccountsManagerProps {
  /**
   * Optional filter by status
   */
  statusFilter?: 'completed' | 'pending' | 'restricted';
}

export function ConnectAccountsManager({ statusFilter }: ConnectAccountsManagerProps) {
  const [accounts, setAccounts] = useState<ConnectAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>(statusFilter || 'all');

  /**
   * Fetch accounts (mock for now - replace with actual API call)
   */
  useEffect(() => {
    const fetchAccounts = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call to admin endpoint
        // const response = await fetch('/api/admin/connect/accounts');
        // const data = await response.json();
        // setAccounts(data.accounts);

        // Mock data for demonstration
        setTimeout(() => {
          setAccounts([]);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Failed to fetch accounts:', error);
        setLoading(false);
      }
    };

    fetchAccounts();
  }, [selectedStatus]);

  /**
   * Filter accounts by search query
   */
  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch =
      !searchQuery ||
      account.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.stripe_account_id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === 'all' || account.onboarding_status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Connect Accounts</h2>
          <p className="text-muted-foreground">
            Manage all marketplace seller accounts
          </p>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by business name, email, or account ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <Button
              variant={selectedStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus('all')}
            >
              All
            </Button>
            <Button
              variant={selectedStatus === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus('completed')}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Active
            </Button>
            <Button
              variant={selectedStatus === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus('pending')}
            >
              <Clock className="w-4 h-4 mr-2" />
              Pending
            </Button>
            <Button
              variant={selectedStatus === 'restricted' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus('restricted')}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Restricted
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Accounts List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {filteredAccounts.length} Account
              {filteredAccounts.length === 1 ? '' : 's'}
            </CardTitle>
            {accounts.length !== filteredAccounts.length && (
              <Badge variant="secondary">
                Filtered from {accounts.length} total
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
              <Building2 className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                {searchQuery || selectedStatus !== 'all'
                  ? 'No accounts match your filters'
                  : 'No Connect accounts yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAccounts.map((account) => (
                <AccountCard key={account.id} account={account} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Account Card
 */
function AccountCard({ account }: { account: ConnectAccount }) {
  const isReady = account.charges_enabled && account.payouts_enabled;
  const statusColor = isReady
    ? 'text-green-600 dark:text-green-400'
    : account.onboarding_status === 'restricted'
    ? 'text-red-600 dark:text-red-400'
    : 'text-yellow-600 dark:text-yellow-400';

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-start gap-4 flex-1 min-w-0">
        {/* Icon */}
        <div className={cn('p-2 rounded-lg bg-muted shrink-0')}>
          <Building2 className="w-5 h-5 text-muted-foreground" />
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">
              {account.business_name || 'Unnamed Business'}
            </p>
            <Badge
              variant={isReady ? 'success' : 'secondary'}
              className="shrink-0"
            >
              {isReady ? 'Active' : account.onboarding_status}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="truncate">{account.email || 'No email'}</span>
            <span className="truncate font-mono text-xs">
              {account.stripe_account_id}
            </span>
          </div>

          {/* Capabilities */}
          <div className="flex items-center gap-3 text-xs">
            <CapabilityBadge
              icon={<CheckCircle2 className="w-3 h-3" />}
              label="Payments"
              enabled={account.charges_enabled}
            />
            <CapabilityBadge
              icon={<CheckCircle2 className="w-3 h-3" />}
              label="Payouts"
              enabled={account.payouts_enabled}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 shrink-0 ml-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            window.open(
              `/dashboard/admin/connect/accounts/${account.id}`,
              '_blank'
            )
          }
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          View
        </Button>
      </div>
    </div>
  );
}

/**
 * Capability Badge
 */
function CapabilityBadge({
  icon,
  label,
  enabled,
}: {
  icon: React.ReactNode;
  label: string;
  enabled: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-1',
        enabled ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
      )}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}
