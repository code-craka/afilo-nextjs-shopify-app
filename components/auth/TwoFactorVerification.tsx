'use client';

import { useState } from 'react';
import { useSignIn } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, ArrowLeft, LoaderCircle } from 'lucide-react';

interface TwoFactorVerificationProps {
  onBack: () => void;
}

export default function TwoFactorVerification({ onBack }: TwoFactorVerificationProps) {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [code, setCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get('redirect_url') || searchParams?.get('redirect') || '/dashboard';

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded || !signIn) return;

    const verificationCode = useBackupCode ? backupCode.trim() : code.trim();

    if (!verificationCode) {
      setError('Please enter a verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Attempt to complete the sign-in with 2FA
      const result = await signIn.attemptSecondFactor({
        strategy: 'totp',
        code: verificationCode,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.push(redirectUrl);
      } else {
        setError('Verification failed. Please try again.');
      }
    } catch (err: any) {
      console.error('2FA verification error:', err);
      const errorMessage = err.errors?.[0]?.message || 'Invalid verification code';

      // Handle specific error cases
      if (errorMessage.includes('invalid')) {
        setError('Invalid verification code. Please check your authenticator app and try again.');
      } else if (errorMessage.includes('expired')) {
        setError('Verification code has expired. Please try with a new code.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackupCodeVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded || !signIn) return;

    if (!backupCode.trim()) {
      setError('Please enter a backup code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Attempt to complete the sign-in with backup code
      const result = await signIn.attemptSecondFactor({
        strategy: 'backup_code',
        code: backupCode.trim(),
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.push(redirectUrl);
      } else {
        setError('Backup code verification failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Backup code verification error:', err);
      const errorMessage = err.errors?.[0]?.message || 'Invalid backup code';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoaderCircle className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Two-Factor Authentication
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {useBackupCode
                ? 'Enter one of your backup codes'
                : 'Enter the 6-digit code from your authenticator app'
              }
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-lg text-sm mb-6 border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          {!useBackupCode ? (
            <form onSubmit={handleVerification} className="space-y-6">
              <div>
                <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Verification Code
                </label>
                <input
                  id="verification-code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 text-center text-2xl font-mono tracking-widest"
                  maxLength={6}
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <LoaderCircle className="h-5 w-5 animate-spin mr-2" />
                    Verifying...
                  </span>
                ) : (
                  'Verify'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleBackupCodeVerification} className="space-y-6">
              <div>
                <label htmlFor="backup-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Backup Code
                </label>
                <input
                  id="backup-code"
                  type="text"
                  value={backupCode}
                  onChange={(e) => setBackupCode(e.target.value)}
                  placeholder="Enter backup code"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading || !backupCode.trim()}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <LoaderCircle className="h-5 w-5 animate-spin mr-2" />
                    Verifying...
                  </span>
                ) : (
                  'Verify Backup Code'
                )}
              </button>
            </form>
          )}

          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={() => {
                setUseBackupCode(!useBackupCode);
                setCode('');
                setBackupCode('');
                setError('');
              }}
              className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              {useBackupCode
                ? 'Use authenticator app instead'
                : 'Use backup code instead'
              }
            </button>

            <button
              type="button"
              onClick={onBack}
              className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}