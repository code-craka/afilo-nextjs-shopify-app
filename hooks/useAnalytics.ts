'use client';

import { useCallback } from 'react';
import { useUser } from '@clerk/nextjs';

interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

interface EcommerceItem {
  item_id: string;
  item_name: string;
  category: string;
  price: number;
  currency: string;
  quantity?: number;
}

/**
 * React hook for Google Analytics 4 tracking
 * Provides enterprise-focused event tracking with user context
 */
export const useAnalytics = () => {
  const { user } = useUser();

  // Check if GA is available
  const isGAAvailable = useCallback(() => {
    return typeof window !== 'undefined' && typeof window.gtag === 'function';
  }, []);

  // Track generic events
  const trackEvent = useCallback(({ action, category, label, value, custom_parameters }: AnalyticsEvent) => {
    if (!isGAAvailable()) return;

    try {
      window.gtag?.('event', action, {
        event_category: category,
        event_label: label,
        value: value,
        ...custom_parameters,
        // Add user context if available
        user_id: user?.id,
        user_type: user ? 'authenticated' : 'anonymous',
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }, [user, isGAAvailable]);

  // Track page views
  const trackPageView = useCallback((path: string, title?: string) => {
    if (!isGAAvailable()) return;

    try {
      window.gtag?.('event', 'page_view', {
        page_title: title || document.title,
        page_location: window.location.origin + path,
        content_group1: 'Enterprise Platform',
        user_id: user?.id,
      });
    } catch (error) {
      console.error('Page view tracking error:', error);
    }
  }, [user, isGAAvailable]);

  // Enterprise-specific events
  const trackBusinessAction = useCallback((action: string, details?: Record<string, any>) => {
    trackEvent({
      action,
      category: 'business_action',
      custom_parameters: {
        timestamp: new Date().toISOString(),
        ...details,
      },
    });
  }, [trackEvent]);

  // E-commerce tracking
  const trackPurchase = useCallback((transactionId: string, value: number, currency: string, items: EcommerceItem[]) => {
    if (!isGAAvailable()) return;

    try {
      window.gtag?.('event', 'purchase', {
        transaction_id: transactionId,
        value,
        currency,
        items: items.map(item => ({
          item_id: item.item_id,
          item_name: item.item_name,
          item_category: item.category,
          price: item.price,
          quantity: item.quantity || 1,
        })),
        user_id: user?.id,
      });
    } catch (error) {
      console.error('Purchase tracking error:', error);
    }
  }, [user, isGAAvailable]);

  const trackAddToCart = useCallback((item: EcommerceItem) => {
    if (!isGAAvailable()) return;

    try {
      window.gtag?.('event', 'add_to_cart', {
        currency: item.currency,
        value: item.price * (item.quantity || 1),
        items: [{
          item_id: item.item_id,
          item_name: item.item_name,
          item_category: item.category,
          price: item.price,
          quantity: item.quantity || 1,
        }],
        user_id: user?.id,
      });
    } catch (error) {
      console.error('Add to cart tracking error:', error);
    }
  }, [user, isGAAvailable]);

  // User engagement tracking
  const trackUserSignUp = useCallback((method: 'email' | 'google' | 'sso') => {
    trackEvent({
      action: 'sign_up',
      category: 'engagement',
      label: method,
    });
  }, [trackEvent]);

  const trackUserSignIn = useCallback((method: 'email' | 'google' | 'sso') => {
    trackEvent({
      action: 'login',
      category: 'engagement',
      label: method,
    });
  }, [trackEvent]);

  // Subscription tracking
  const trackSubscriptionStart = useCallback((planName: string, value: number, billingCycle: 'monthly' | 'annual') => {
    trackEvent({
      action: 'begin_checkout',
      category: 'subscription',
      label: `${planName}_${billingCycle}`,
      value,
      custom_parameters: {
        subscription_tier: planName,
        billing_cycle: billingCycle,
      },
    });
  }, [trackEvent]);

  const trackSubscriptionComplete = useCallback((subscriptionId: string, planName: string, value: number) => {
    trackEvent({
      action: 'subscription_complete',
      category: 'conversion',
      label: planName,
      value,
      custom_parameters: {
        subscription_id: subscriptionId,
        subscription_tier: planName,
      },
    });
  }, [trackEvent]);

  // Enterprise features
  const trackEnterpriseInquiry = useCallback((companySize: string, industry?: string) => {
    trackEvent({
      action: 'enterprise_inquiry',
      category: 'lead_generation',
      label: `${companySize}_${industry || 'unknown'}`,
      custom_parameters: {
        company_size: companySize,
        industry,
        form_type: 'enterprise_contact',
      },
    });
  }, [trackEvent]);

  const trackDemoRequest = useCallback((planInterest: string) => {
    trackEvent({
      action: 'demo_request',
      category: 'lead_generation',
      label: planInterest,
      custom_parameters: {
        lead_source: 'website',
        demo_type: 'product_demo',
      },
    });
  }, [trackEvent]);

  // Feature usage tracking
  const trackFeatureUsage = useCallback((featureName: string, context?: string) => {
    trackEvent({
      action: 'feature_use',
      category: 'engagement',
      label: featureName,
      custom_parameters: {
        feature_context: context,
        user_tier: user ? 'premium' : 'free',
      },
    });
  }, [trackEvent, user]);

  // Error tracking
  const trackError = useCallback((errorType: string, errorMessage: string, page?: string) => {
    trackEvent({
      action: 'exception',
      category: 'error',
      label: `${errorType}: ${errorMessage}`,
      custom_parameters: {
        error_type: errorType,
        error_message: errorMessage,
        page_path: page || window.location.pathname,
        fatal: false,
      },
    });
  }, [trackEvent]);

  // Performance tracking
  const trackPerformance = useCallback((metric: string, value: number, unit?: string) => {
    trackEvent({
      action: 'performance_metric',
      category: 'performance',
      label: `${metric}_${unit || 'ms'}`,
      value: Math.round(value),
      custom_parameters: {
        metric_name: metric,
        metric_value: value,
        metric_unit: unit || 'ms',
      },
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackBusinessAction,
    trackPurchase,
    trackAddToCart,
    trackUserSignUp,
    trackUserSignIn,
    trackSubscriptionStart,
    trackSubscriptionComplete,
    trackEnterpriseInquiry,
    trackDemoRequest,
    trackFeatureUsage,
    trackError,
    trackPerformance,
    isGAAvailable,
  };
};