/**
 * Transfer Manager (Admin)
 *
 * Admin component for creating and managing marketplace transfers
 * Includes transfer creation form and transfer history
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useTransfers } from '@/hooks/useTransfers';
import { formatCurrency, getTransferStatusDisplay } from '@/lib/stripe/connect-client';
import {
  DollarSign,
  Send,
  Plus,
  ArrowRight,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface TransferManagerProps {
  /**
   * Optional account ID to filter transfers
   */
  accountId?: string;
}

export function TransferManager({ accountId }: TransferManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const [formData, setFormData] = useState({
    destination_account_id: accountId || '',
    amount: '',
    currency: 'USD',
    description: '',
    application_fee_amount: '',
  });

  const {
    transfers,
    loading,
    pagination,
    loadMore,
    createNewTransfer,
    refreshTransfers,
  } = useTransfers({
    accountId,
    autoFetch: true,
  });

  /**
   * Handle create transfer
   */
  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.destination_account_id || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    setCreateLoading(true);

    try {
      const transfer = await createNewTransfer({
        destination_account_id: formData.destination_account_id,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        description: formData.description || undefined,
        application_fee_amount: formData.application_fee_amount
          ? parseFloat(formData.application_fee_amount)
          : undefined,
      });

      if (transfer) {
        // Reset form
        setFormData({
          destination_account_id: accountId || '',
          amount: '',
          currency: 'USD',
          description: '',
          application_fee_amount: '',
        });
        setShowCreateForm(false);
        toast.success('Transfer created successfully!');
      }
    } catch (error) {
      console.error('Failed to create transfer:', error);
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Transfer Management</h2>
          <p className="text-muted-foreground">
            Create and manage marketplace transfers
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="w-4 h-4 mr-2" />
          New Transfer
        </Button>
      </div>

      {/* Create Transfer Form */}
      {showCreateForm && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Create Transfer</CardTitle>
            <CardDescription>
              Send funds to a connected account (Admin only)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTransfer} className="space-y-4">
              {/* Destination Account */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Destination Account ID *
                </label>
                <Input
                  type="text"
                  placeholder="Account UUID"
                  value={formData.destination_account_id}
                  onChange={(e) =>
                    setFormData({ ...formData, destination_account_id: e.target.value })
                  }
                  required
                  disabled={!!accountId} // Disabled if filtering by account
                />
              </div>

              {/* Amount */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount *</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="999999.99"
                    placeholder="100.00"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Currency</label>
                  <Input
                    type="text"
                    placeholder="USD"
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currency: e.target.value.toUpperCase(),
                      })
                    }
                    maxLength={3}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                  type="text"
                  placeholder="Platform payment for..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              {/* Platform Fee */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Platform Fee (Optional)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="5.00"
                  value={formData.application_fee_amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      application_fee_amount: e.target.value,
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Amount kept by the platform (must be less than transfer amount)
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={createLoading} className="flex-1">
                  <Send className="w-4 h-4 mr-2" />
                  {createLoading ? 'Creating...' : 'Create Transfer'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  disabled={createLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Transfer History */}
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
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading && transfers.length === 0 ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : transfers.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
              <DollarSign className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No transfers found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create a transfer to get started
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
    </div>
  );
}

/**
 * Transfer Card
 */
function TransferCard({ transfer }: { transfer: any }) {
  const statusDisplay = getTransferStatusDisplay(transfer.status);
  const transferDate = new Date(transfer.created_at);

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
      <div className="flex items-start gap-4 flex-1 min-w-0">
        {/* Icon */}
        <div
          className={cn(
            'p-2 rounded-lg shrink-0',
            transfer.status === 'paid'
              ? 'bg-green-100 dark:bg-green-950'
              : transfer.status === 'failed'
              ? 'bg-red-100 dark:bg-red-950'
              : 'bg-muted'
          )}
        >
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

          {/* Destination Account */}
          {transfer.destination_account && (
            <p className="text-xs text-muted-foreground">
              To: {transfer.destination_account.business_name || transfer.destination_account.email || 'Unknown'}
            </p>
          )}

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
