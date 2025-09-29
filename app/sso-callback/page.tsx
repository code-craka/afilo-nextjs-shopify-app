'use client';

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';
import { LoaderCircle } from 'lucide-react';

export default function SSOCallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoaderCircle className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Completing authentication...</h2>
        <p className="text-gray-600 mt-2">You'll be redirected automatically</p>
      </div>
      <AuthenticateWithRedirectCallback />
    </div>
  );
}