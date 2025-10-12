/**
 * Billing Portal Button Component
 *
 * Provides a seamless way for authenticated users to manage their
 * subscriptions, payment methods, and billing details.
 *
 * Features:
 * - Clerk authentication integration
 * - Redirect to custom Afilo billing portal
 * - No external Stripe portal redirect
 * - Clean navigation experience
 */

'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { CreditCard, ArrowRight } from 'lucide-react';

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
  const { isSignedIn } = useUser();
  const router = useRouter();

  const handleManageBilling = () => {
    router.push('/dashboard/billing');
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
    <button
      onClick={handleManageBilling}
      className={`
        inline-flex items-center justify-center gap-2
        font-semibold rounded-lg
        transition-all duration-200
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      <CreditCard className="w-4 h-4" />
      <span>Manage Billing</span>
      <ArrowRight className="w-3 h-3 opacity-70" />
    </button>
  );
}
