/**
 * Billing Portal Button Component
 *
 * Provides a seamless way for authenticated users to manage their
 * Stripe subscriptions, payment methods, and billing details.
 *
 * Features:
 * - Clerk authentication integration
 * - Automatic Stripe Customer creation
 * - Loading states and error handling
 * - Redirect to Stripe-hosted portal
 */

'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { CreditCard, Loader2, ExternalLink } from 'lucide-react';

interface BillingPortalButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}

export default function BillingPortalButton({
  variant = 'default',
  size = 'md',
  fullWidth = false,
  className = '',
}: BillingPortalButtonProps) {
  const { isSignedIn, user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleManageBilling = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Create billing portal session
      const response = await fetch('/api/billing/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create billing portal session');
      }

      // Redirect to Stripe Billing Portal
      window.location.href = data.url;

    } catch (err: any) {
      console.error('Error opening billing portal:', err);
      setError(err.message || 'Something went wrong');
      setIsLoading(false);
    }
  };

  if (!isSignedIn) {
    return null;
  }

  // Variant styles
  const variantStyles = {
    default: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
    ghost: 'text-blue-600 hover:bg-blue-50',
  };

  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      <button
        onClick={handleManageBilling}
        disabled={isLoading}
        className={`
          inline-flex items-center justify-center gap-2
          font-semibold rounded-lg
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Opening Portal...</span>
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" />
            <span>Manage Billing</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </>
        )}
      </button>

      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
