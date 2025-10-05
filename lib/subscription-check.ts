/**
 * Subscription Authorization System
 *
 * Checks if user has active paid subscription before granting access
 * to premium features (dashboard, downloads, API keys, etc.)
 */

import { auth } from '@clerk/nextjs/server';

export interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  plan?: 'professional' | 'business' | 'enterprise' | 'enterprise_plus';
  status?: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete';
  currentPeriodEnd?: Date;
}

/**
 * Check if user has active paid subscription
 *
 * @returns Subscription status with plan details
 */
export async function checkSubscription(): Promise<SubscriptionStatus> {
  const { userId } = await auth();

  if (!userId) {
    return { hasActiveSubscription: false };
  }

  try {
    // Query user's subscription from database
    // TODO: Replace with actual database query
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/subscriptions/status`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Always fetch fresh subscription status
    });

    if (!response.ok) {
      return { hasActiveSubscription: false };
    }

    const data = await response.json();

    return {
      hasActiveSubscription: data.status === 'active' || data.status === 'trialing',
      plan: data.plan,
      status: data.status,
      currentPeriodEnd: data.currentPeriodEnd ? new Date(data.currentPeriodEnd) : undefined,
    };
  } catch (error) {
    console.error('Subscription check failed:', error);
    return { hasActiveSubscription: false };
  }
}

/**
 * Require active subscription or redirect to pricing page
 * Use in server components or API routes
 */
export async function requireSubscription(): Promise<SubscriptionStatus> {
  const subscription = await checkSubscription();

  if (!subscription.hasActiveSubscription) {
    throw new Error('SUBSCRIPTION_REQUIRED');
  }

  return subscription;
}

/**
 * Check if user has access to specific feature based on plan tier
 */
export function hasFeatureAccess(
  subscription: SubscriptionStatus,
  feature: 'team_management' | 'api_keys' | 'advanced_analytics' | 'white_label' | 'sso'
): boolean {
  if (!subscription.hasActiveSubscription) {
    return false;
  }

  const featureTiers: Record<string, string[]> = {
    team_management: ['professional', 'business', 'enterprise', 'enterprise_plus'],
    api_keys: ['professional', 'business', 'enterprise', 'enterprise_plus'],
    advanced_analytics: ['business', 'enterprise', 'enterprise_plus'],
    white_label: ['enterprise', 'enterprise_plus'],
    sso: ['enterprise_plus'],
  };

  const allowedPlans = featureTiers[feature] || [];
  return subscription.plan ? allowedPlans.includes(subscription.plan) : false;
}
