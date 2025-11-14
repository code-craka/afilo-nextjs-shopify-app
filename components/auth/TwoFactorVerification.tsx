'use client';

import { useState, useEffect } from 'react';
import { useSignIn } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, ArrowLeft, LoaderCircle, Mail, Phone, Smartphone } from 'lucide-react';

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
  const [selectedFactor, setSelectedFactor] = useState<string | null>(null);
  const [supportedFactors, setSupportedFactors] = useState<any[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get('redirect_url') || searchParams?.get('redirect') || '/dashboard';

  // Get supported second factors when component mounts
  useEffect(() => {
    if (isLoaded && signIn && signIn.supportedSecondFactors) {
      setSupportedFactors(signIn.supportedSecondFactors);
      // Auto-select the first available factor
      if (signIn.supportedSecondFactors.length > 0) {
        setSelectedFactor(signIn.supportedSecondFactors[0].strategy);
      }
    }
  }, [isLoaded, signIn]);

  // Helper function to get factor description
  const getFactorDescription = (strategy: string | null) => {
    switch (strategy) {
      case 'email_code':
        return 'Enter the 6-digit code sent to your email';
      case 'phone_code':
        return 'Enter the 6-digit code sent to your phone';
      case 'email_link':
        return 'Check your email and click the verification link, or enter the code';
      case 'totp':
        return 'Enter the 6-digit code from your authenticator app';
      default:
        return 'Enter your verification code';
    }
  };

  // Helper function to get factor icon
  const getFactorIcon = (strategy: string) => {
    switch (strategy) {
      case 'email_code':
      case 'email_link':
        return <Mail className="h-5 w-5" />;
      case 'phone_code':
        return <Phone className="h-5 w-5" />;
      case 'totp':
        return <Smartphone className="h-5 w-5" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };

  // Handle sending verification code for email/phone
  const handleSendCode = async (strategy: string) => {
    if (!signIn) return;

    setLoading(true);
    setError('');

    try {
      await signIn.prepareSecondFactor({ strategy: strategy as any });
      setSelectedFactor(strategy);
    } catch (err: any) {
      console.error('Failed to send verification code:', err);
      setError(err.errors?.[0]?.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

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
      let strategy = useBackupCode ? 'backup_code' : (selectedFactor || 'totp');

      // Attempt to complete the sign-in with the selected factor
      const result = await signIn.attemptSecondFactor({
        strategy: strategy as any,
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
        setError('Invalid verification code. Please check and try again.');
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
                : getFactorDescription(selectedFactor)
              }
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-lg text-sm mb-6 border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          {/* Factor Selection */}
          {!useBackupCode && supportedFactors.length > 1 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Choose verification method:
              </label>
              <div className="grid gap-2">
                {supportedFactors.map((factor) => (
                  <button
                    key={factor.strategy}
                    type="button"
                    onClick={() => {
                      if (['email_code', 'phone_code', 'email_link'].includes(factor.strategy)) {
                        handleSendCode(factor.strategy);
                      } else {
                        setSelectedFactor(factor.strategy);
                      }
                    }}
                    disabled={loading}
                    className={`w-full flex items-center gap-3 p-3 border rounded-lg text-left transition ${
                      selectedFactor === factor.strategy
                        ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {getFactorIcon(factor.strategy)}
                    <div className="flex-1">
                      <div className="font-medium">
                        {factor.strategy === 'email_code' && 'Email verification code'}
                        {factor.strategy === 'phone_code' && 'SMS verification code'}
                        {factor.strategy === 'email_link' && 'Email verification link'}
                        {factor.strategy === 'totp' && 'Authenticator app'}
                        {factor.strategy === 'backup_code' && 'Backup code'}
                      </div>
                      <div className="text-sm opacity-75">
                        {factor.strategy === 'email_code' && 'Get a code via email'}
                        {factor.strategy === 'phone_code' && 'Get a code via SMS'}
                        {factor.strategy === 'email_link' && 'Click link in email or enter code'}
                        {factor.strategy === 'totp' && 'Use your authenticator app'}
                        {factor.strategy === 'backup_code' && 'Use a saved backup code'}
                      </div>
                    </div>
                    {selectedFactor === factor.strategy && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
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