'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';

/**
 * App Providers
 *
 * Wraps the app with necessary providers:
 * - TanStack Query for data fetching and caching
 */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is considered fresh for 1 minute
            staleTime: 60 * 1000,

            // Cache data for 5 minutes even if unused
            gcTime: 5 * 60 * 1000,

            // Retry failed requests
            retry: 3,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

            // Don't refetch on window focus by default (can override per query)
            refetchOnWindowFocus: false,

            // Don't refetch on mount if we have cached data
            refetchOnMount: false,

            // Refetch in background when data becomes stale
            refetchOnReconnect: true,
          },
          mutations: {
            // Retry mutations once on failure
            retry: 1
          }
        }
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Show dev tools in development only */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </QueryClientProvider>
  );
}
