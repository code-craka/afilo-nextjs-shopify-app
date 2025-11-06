'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Shield, Smartphone, CheckCircle, AlertCircle, Copy, QrCode, Key } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface TwoFactorSettingsProps {
  onClose?: () => void;
}

export default function TwoFactorSettings({ onClose }: TwoFactorSettingsProps) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState<'overview' | 'setup' | 'verify' | 'backup'>('overview');
  const [qrCodeUri, setQrCodeUri] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackupCode, setCopiedBackupCode] = useState('');

  // Check if 2FA is already enabled
  const is2FAEnabled = user?.twoFactorEnabled || false;
  const totpEnabled = user?.totpEnabled || false;

  const copyToClipboard = async (text: string, type: 'secret' | 'backup') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'secret') {
        setCopiedSecret(true);
        setTimeout(() => setCopiedSecret(false), 2000);
      } else {
        setCopiedBackupCode(text);
        setTimeout(() => setCopiedBackupCode(''), 2000);
      }
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const handleEnable2FA = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      // Generate TOTP secret and QR code
      const totpResponse = await user.createTOTP();
      setSecret(totpResponse.secret!);
      setQrCodeUri(totpResponse.uri!);
      setStep('setup');
    } catch (err: any) {
      console.error('2FA setup error:', err);
      setError(err.errors?.[0]?.message || 'Failed to set up 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!user || !verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Verify the TOTP code
      const verification = await user.verifyTOTP({
        code: verificationCode
      });

      if (verification) {
        // Generate backup codes
        const backupCodesResponse = await user.createBackupCode();
        setBackupCodes(backupCodesResponse.codes);
        setStep('backup');
        setSuccess('Two-factor authentication has been enabled successfully!');
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err: any) {
      console.error('2FA verification error:', err);
      setError(err.errors?.[0]?.message || 'Failed to verify 2FA code');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!user) return;

    const confirmed = window.confirm(
      'Are you sure you want to disable two-factor authentication? This will make your account less secure.'
    );

    if (!confirmed) return;

    setLoading(true);
    setError('');

    try {
      await user.disableTOTP();
      setSuccess('Two-factor authentication has been disabled.');
      setStep('overview');
    } catch (err: any) {
      console.error('2FA disable error:', err);
      setError(err.errors?.[0]?.message || 'Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    if (!user) return;

    const confirmed = window.confirm(
      'Are you sure you want to regenerate backup codes? Your existing backup codes will be invalidated.'
    );

    if (!confirmed) return;

    setLoading(true);
    setError('');

    try {
      const backupCodesResponse = await user.createBackupCode();
      setBackupCodes(backupCodesResponse.codes);
      setSuccess('New backup codes have been generated.');
    } catch (err: any) {
      console.error('Backup codes regeneration error:', err);
      setError(err.errors?.[0]?.message || 'Failed to regenerate backup codes');
    } finally {
      setLoading(false);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className={`h-8 w-8 ${is2FAEnabled ? 'text-green-600' : 'text-gray-400'}`} />
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Two-Factor Authentication</h3>
          <p className="text-gray-600">
            {is2FAEnabled ? 'Your account is protected with 2FA' : 'Add an extra layer of security to your account'}
          </p>
        </div>
      </div>

      {is2FAEnabled ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-800">Two-Factor Authentication Enabled</span>
          </div>
          <p className="text-sm text-green-700 mb-4">
            Your account is protected with TOTP-based two-factor authentication.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleRegenerateBackupCodes}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
            >
              Regenerate Backup Codes
            </button>
            <button
              onClick={handleDisable2FA}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
            >
              Disable 2FA
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <span className="font-medium text-yellow-800">Two-Factor Authentication Disabled</span>
          </div>
          <p className="text-sm text-yellow-700 mb-4">
            Your account is not protected with 2FA. We strongly recommend enabling it for better security.
          </p>
          <button
            onClick={handleEnable2FA}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Setting up...' : 'Enable Two-Factor Authentication'}
          </button>
        </div>
      )}
    </div>
  );

  const renderSetup = () => (
    <div className="space-y-6">
      <div className="text-center">
        <QrCode className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Scan QR Code</h3>
        <p className="text-gray-600">
          Use your authenticator app to scan this QR code or enter the secret key manually.
        </p>
      </div>

      <div className="bg-white border-2 border-gray-200 rounded-lg p-6 text-center">
        {qrCodeUri && (
          <div className="flex justify-center mb-4">
            <QRCodeSVG value={qrCodeUri} size={200} />
          </div>
        )}

        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Can't scan? Enter this secret key manually:
          </p>
          <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
            <code className="flex-1 text-sm font-mono text-gray-800 break-all">{secret}</code>
            <button
              onClick={() => copyToClipboard(secret, 'secret')}
              className="p-2 text-gray-500 hover:text-gray-700"
              title="Copy secret key"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          {copiedSecret && (
            <p className="text-sm text-green-600">Secret key copied to clipboard!</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700">
          Enter the 6-digit code from your authenticator app:
        </label>
        <input
          id="verification-code"
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="123456"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-2xl font-mono tracking-widest"
          maxLength={6}
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setStep('overview')}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleVerify2FA}
          disabled={loading || verificationCode.length !== 6}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Verify & Enable'}
        </button>
      </div>
    </div>
  );

  const renderBackupCodes = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Key className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Save Your Backup Codes</h3>
        <p className="text-gray-600">
          Store these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <span className="font-medium text-yellow-800">Important</span>
        </div>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Each backup code can only be used once</li>
          <li>• Store them securely (password manager, printed copy, etc.)</li>
          <li>• Don't share these codes with anyone</li>
        </ul>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-2">
          {backupCodes.map((code, index) => (
            <div key={index} className="flex items-center gap-2 bg-white p-3 rounded border">
              <code className="flex-1 font-mono text-sm">{code}</code>
              <button
                onClick={() => copyToClipboard(code, 'backup')}
                className="p-1 text-gray-500 hover:text-gray-700"
                title="Copy code"
              >
                <Copy className="h-3 w-3" />
              </button>
              {copiedBackupCode === code && (
                <span className="text-xs text-green-600">✓</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => {
          setStep('overview');
          if (onClose) onClose();
        }}
        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        I've Saved My Backup Codes
      </button>
    </div>
  );

  return (
    <div className="max-w-md mx-auto">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {step === 'overview' && renderOverview()}
      {step === 'setup' && renderSetup()}
      {step === 'backup' && renderBackupCodes()}
    </div>
  );
}