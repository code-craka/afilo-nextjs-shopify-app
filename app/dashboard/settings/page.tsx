'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useUser } from '@clerk/nextjs';
import { Settings, User, Bell, Shield, CreditCard } from 'lucide-react';
import { useState } from 'react';
import TwoFactorSettings from '@/components/auth/TwoFactorSettings';

export default function SettingsPage() {
  const { user } = useUser();
  const [show2FAModal, setShow2FAModal] = useState(false);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Manage your account preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Profile</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Name</label>
              <p className="mt-1 text-gray-900">{user?.firstName} {user?.lastName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-gray-900">{user?.emailAddresses[0]?.emailAddress}</p>
            </div>
            <a
              href="/dashboard/profile"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
            >
              Edit Profile →
            </a>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Notifications</h2>
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input type="checkbox" className="rounded" defaultChecked />
              <span className="text-sm text-gray-700">Email notifications for new products</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="rounded" defaultChecked />
              <span className="text-sm text-gray-700">Order updates and receipts</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="rounded" />
              <span className="text-sm text-gray-700">Marketing emails</span>
            </label>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Security</h2>
          </div>
          <div className="space-y-3">
            <button className="text-sm text-blue-600 hover:text-blue-700">
              Change Password →
            </button>
            <button
              onClick={() => setShow2FAModal(true)}
              className="block text-sm text-blue-600 hover:text-blue-700"
            >
              Two-Factor Authentication →
            </button>
          </div>
        </div>

        {/* Billing */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Billing & Payments</h2>
          </div>
          <a
            href="/billing"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Manage Payment Methods →
          </a>
        </div>
      </div>

      {/* 2FA Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Security Settings</h2>
              <button
                onClick={() => setShow2FAModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <TwoFactorSettings onClose={() => setShow2FAModal(false)} />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
