'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { LoaderCircle, User, CreditCard, Settings, LogOut, Shield, Mail, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';

interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  subscriptionTier: string;
  oauthSignup: boolean;
  createdAt: string;
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      // Simulate fetching user profile (you can implement actual API call)
      setTimeout(() => {
        setUserProfile({
          id: 1,
          email: user.emailAddresses[0]?.emailAddress || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          subscriptionTier: 'free',
          oauthSignup: user.externalAccounts.length > 0,
          createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
        });
        setLoading(false);
      }, 1000);
    }
  }, [isLoaded, user]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <LoaderCircle className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    router.push('/sign-in');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Afilo Enterprise Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.firstName?.[0] || user.emailAddresses[0]?.emailAddress[0] || 'U'}
                  </span>
                </div>
                <span className="text-gray-700 font-medium">
                  {user.firstName || 'User'}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center mb-6">
                <User className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    {userProfile?.firstName || 'Not provided'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    {userProfile?.lastName || 'Not provided'}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border flex items-center">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    {userProfile?.email}
                    {user.emailAddresses[0]?.verification?.status === 'verified' && (
                      <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Type
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    {userProfile?.oauthSignup ? 'Google OAuth' : 'Email/Password'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Member Since
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    {new Date(userProfile?.createdAt || '').toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border p-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Account created successfully</p>
                    <p className="text-xs text-gray-500">
                      {new Date(userProfile?.createdAt || '').toLocaleString()}
                    </p>
                  </div>
                </div>

                {userProfile?.oauthSignup && (
                  <div className="flex items-center p-4 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Connected Google account</p>
                      <p className="text-xs text-gray-500">OAuth authentication completed</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Signed in to dashboard</p>
                    <p className="text-xs text-gray-500">Just now</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subscription Status */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center mb-4">
                <CreditCard className="w-5 h-5 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Subscription</h3>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 mb-3">
                  Free Plan
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Upgrade to unlock premium features and enterprise tools.
                </p>
                <button
                  onClick={() => router.push('/enterprise')}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  View Plans
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/products')}
                  className="w-full flex items-center text-left p-3 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <Settings className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Browse Products</span>
                </button>

                <button
                  onClick={() => router.push('/enterprise')}
                  className="w-full flex items-center text-left p-3 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <CreditCard className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Enterprise Portal</span>
                </button>

                <button
                  onClick={() => window.open('mailto:support@afilo.io')}
                  className="w-full flex items-center text-left p-3 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <Mail className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Contact Support</span>
                </button>
              </div>
            </div>

            {/* Account Security */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center mb-4">
                <Shield className="w-5 h-5 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Security</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Email Verified</span>
                  <span className="text-sm font-medium text-green-600">
                    {user.emailAddresses[0]?.verification?.status === 'verified' ? '✓' : '✗'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Two-Factor Auth</span>
                  <span className="text-sm font-medium text-yellow-600">Setup Recommended</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">OAuth Connected</span>
                  <span className="text-sm font-medium text-green-600">
                    {userProfile?.oauthSignup ? '✓' : '✗'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}