/**
 * Transfer List Component
 *
 * Displays marketplace transfers with pagination
 * Shows payment history for merchant accounts
 */

'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTransfers } from '@/hooks/useTransfers';
import { formatCurrency, getTransferStatusDisplay } from '@/lib/stripe/connect-client';
import { ArrowRight, DollarSign, Calendar, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TransferStatus } from '@/types/stripe-connect';

interface TransferListProps {
  accountId: string;
  status?: TransferStatus;
  limit?: number;
}

export function TransferList({ accountId, status, limit = 20 }: TransferListProps) {
  const {
    transfers,
    loading,
    error,
    pagination,
    fetchTransfers,
    loadMore,
    refreshTransfers,
  } = useTransfers({
    accountId,
    status,
    limit,
    autoFetch: true,
  });

  if (loading && transfers.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && transfers.length === 0) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transfer History</CardTitle>
            <CardDescription>
              {transfers.length === 0
                ? 'No transfers yet'
                : `${transfers.length} transfer${transfers.length === 1 ? '' : 's'}`}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshTransfers}
            disabled={loading}
          >
            <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {transfers.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
            <DollarSign className="w-12 h-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No transfers found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Transfers will appear here once you start receiving payments
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {transfers.map((transfer) => (
              <TransferCard key={transfer.id} transfer={transfer} />
            ))}

            {/* Load More Button */}
            {pagination?.has_more && (
              <Button
                variant="outline"
                className="w-full"
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Transfer Card
 */
function TransferCard({
  transfer,
}: {
  transfer: any; // Using any to handle API response structure
}) {
  const statusDisplay = getTransferStatusDisplay(transfer.status);
  const transferDate = new Date(transfer.created_at);

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-start gap-4 flex-1 min-w-0">
        {/* Icon */}
        <div className={cn(
          'p-2 rounded-lg shrink-0',
          transfer.status === 'paid'
            ? 'bg-green-100 dark:bg-green-950'
            : transfer.status === 'failed'
            ? 'bg-red-100 dark:bg-red-950'
            : 'bg-muted'
        )}>
          <DollarSign
            className={cn(
              'w-5 h-5',
              transfer.status === 'paid'
                ? 'text-green-600 dark:text-green-400'
                : transfer.status === 'failed'
                ? 'text-red-600 dark:text-red-400'
                : 'text-muted-foreground'
            )}
          />
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">
              {transfer.description || 'Platform Payment'}
            </p>
            <Badge variant={statusDisplay.variant} className="shrink-0">
              {statusDisplay.label}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{transferDate.toLocaleDateString()}</span>
            </div>
            {transfer.stripe_transfer_id && (
              <span className="truncate font-mono text-xs">
                {transfer.stripe_transfer_id}
              </span>
            )}
          </div>

          {/* Application Fee */}
          {transfer.application_fee_amount && (
            <p className="text-xs text-muted-foreground">
              Platform fee: {formatCurrency(transfer.application_fee_amount, transfer.currency)}
            </p>
          )}
        </div>
      </div>

      {/* Amount */}
      <div className="text-right shrink-0 ml-4">
        <p className="text-lg font-semibold">
          {formatCurrency(transfer.amount, transfer.currency)}
        </p>
        <p className="text-xs text-muted-foreground uppercase">
          {transfer.currency}
        </p>
      </div>
    </div>
  );
}
