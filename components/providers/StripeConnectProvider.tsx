'use client';

import { loadConnectAndInitialize, type StripeConnectInstance } from '@stripe/connect-js/pure';
import { useTheme } from 'next-themes';
import { useEffect, useState, createContext, useContext } from 'react';
import type { PropsWithChildren } from 'react';

// Create context for Stripe Connect instance
const StripeConnectContext = createContext<StripeConnectInstance | null>(null);

export const useStripeConnect = () => {
  const context = useContext(StripeConnectContext);
  if (!context) {
    throw new Error('useStripeConnect must be used within StripeConnectProvider');
  }
  return context;
};

/**
 * Stripe Connect Provider
 *
 * Provides Stripe Connect embedded components with:
 * - Automatic theme switching (light/dark)
 * - TailwindCSS v4 oklch color matching
 * - Client-side session management
 *
 * @see https://docs.stripe.com/connect/embedded-components
 */

interface StripeConnectProviderProps extends PropsWithChildren {
  publishableKey: string;
  accountId: string;
  onLoaderStart?: () => void;
}

export function StripeConnectProvider({
  children,
  publishableKey,
  accountId,
  onLoaderStart
}: StripeConnectProviderProps) {
  const [stripeConnectInstance, setStripeConnectInstance] =
    useState<StripeConnectInstance | null>(null);
  const { theme, systemTheme } = useTheme();

  // Determine actual theme (handles 'system' preference)
  const actualTheme = theme === 'system' ? systemTheme : theme;
  const isDark = actualTheme === 'dark';

  useEffect(() => {
    if (!publishableKey || !accountId) {
      console.warn('[StripeConnect] Missing publishableKey or accountId');
      return;
    }

    const initializeStripeConnect = async () => {
      try {
        onLoaderStart?.();

        // Fetch account session from API
        const response = await fetch('/api/stripe/connect/account-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            account_id: accountId,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error?.message || 'Failed to create account session');
        }

        const { client_secret } = await response.json();

        // Initialize Stripe Connect with theme configuration
        const instance = await loadConnectAndInitialize({
          publishableKey,
          fetchClientSecret: async () => client_secret,
          appearance: {
            // Light mode colors (TailwindCSS v4 oklch values)
            ...(isDark ? {
              // Dark mode colors
              colors: {
                primary: 'oklch(0.929 0.013 255.508)',          // --primary
                background: 'oklch(0.129 0.042 264.695)',       // --background
                text: 'oklch(0.984 0.003 247.858)',            // --foreground
                secondaryText: 'oklch(0.704 0.04 256.788)',    // --muted-foreground
                border: 'oklch(1 0 0 / 10%)',                  // --border
                formHighlight: 'oklch(0.551 0.027 264.364)',   // --ring
                danger: 'oklch(0.704 0.191 22.216)',           // --destructive
                actionPrimary: 'oklch(0.929 0.013 255.508)',   // --primary
                actionSecondary: 'oklch(0.279 0.041 260.031)', // --secondary
                formBackground: 'oklch(0.208 0.042 265.755)',  // --card
                offsetBackground: 'oklch(0.279 0.041 260.031)', // --muted
              },
              fontFamily: 'var(--font-geist-sans)',
              fontSizeBase: '14px',
              borderRadius: '0.625rem', // --radius
              spacingUnit: '4px',
            } : {
              // Light mode colors
              colors: {
                primary: 'oklch(0.208 0.042 265.755)',         // --primary
                background: 'oklch(1 0 0)',                    // --background
                text: 'oklch(0.129 0.042 264.695)',           // --foreground
                secondaryText: 'oklch(0.554 0.046 257.417)',  // --muted-foreground
                border: 'oklch(0.929 0.013 255.508)',         // --border
                formHighlight: 'oklch(0.704 0.04 256.788)',   // --ring
                danger: 'oklch(0.577 0.245 27.325)',          // --destructive
                actionPrimary: 'oklch(0.208 0.042 265.755)',  // --primary
                actionSecondary: 'oklch(0.968 0.007 247.896)', // --secondary
                formBackground: 'oklch(1 0 0)',               // --card
                offsetBackground: 'oklch(0.968 0.007 247.896)', // --muted
              },
              fontFamily: 'var(--font-geist-sans)',
              fontSizeBase: '14px',
              borderRadius: '0.625rem', // --radius
              spacingUnit: '4px',
            }),
          } as any,
        });

        setStripeConnectInstance(instance);
        console.log('[StripeConnect] Initialized successfully');
      } catch (error) {
        console.error('[StripeConnect] Initialization error:', error);
      }
    };

    initializeStripeConnect();
  }, [publishableKey, accountId, isDark, onLoaderStart]);

  // Re-initialize when theme changes to apply new appearance
  useEffect(() => {
    if (stripeConnectInstance) {
      console.log('[StripeConnect] Theme changed, re-initializing...');
      setStripeConnectInstance(null); // Trigger re-initialization
    }
  }, [isDark]);

  if (!stripeConnectInstance) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <span className="ml-3 text-sm text-muted-foreground">Loading Stripe Connect...</span>
      </div>
    );
  }

  return (
    <StripeConnectContext.Provider value={stripeConnectInstance}>
      {children}
    </StripeConnectContext.Provider>
  );
}

export default StripeConnectProvider;
