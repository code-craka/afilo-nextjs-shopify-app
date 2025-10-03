'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Loader2 } from 'lucide-react';
import DevOnlyBadge from './DevOnlyBadge';

/**
 * Protected Test Page Wrapper
 * Ensures test pages are only accessible to authenticated users
 * Redirects unauthenticated users to sign-in page
 *
 * Usage:
 * <ProtectedTestPage>
 *   <YourTestPageContent />
 * </ProtectedTestPage>
 */
export default function ProtectedTestPage({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        // Redirect to sign-in if not authenticated
        router.push('/sign-in');
      } else {
        setIsChecking(false);
      }
    }
  }, [isSignedIn, isLoaded, router]);

  // Show loading state while checking authentication
  if (!isLoaded || isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-4"
          >
            <Loader2 className="w-12 h-12 text-blue-500" />
          </motion.div>
          <p className="text-white/80 text-lg">Verifying access...</p>
        </motion.div>
      </div>
    );
  }

  // Show protected content if authenticated
  if (isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
        <div className="container mx-auto px-4 py-8">
          {/* Development Only Badge */}
          <DevOnlyBadge />

          {/* Security Notice */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg backdrop-blur-sm"
          >
            <div className="flex items-center gap-2 text-blue-400 text-sm">
              <Shield className="w-4 h-4" />
              <span>Protected test page - Authentication required</span>
            </div>
          </motion.div>

          {/* Test Page Content */}
          {children}
        </div>
      </div>
    );
  }

  // This should never be reached due to redirect, but return null as fallback
  return null;
}
