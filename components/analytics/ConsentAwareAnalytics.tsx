/**
 * Consent-Aware Analytics Component
 * Only loads and executes analytics when user has consented
 *
 * @fileoverview Analytics wrapper that respects cookie consent preferences
 * @version 1.0
 * @compliance CCPA, PIPEDA, UK GDPR, Australia Privacy Act
 */

'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { useCookieConsent } from '@/hooks/useCookieConsent';

interface ConsentAwareAnalyticsProps {
  gaMeasurementId?: string;
  enableVercelAnalytics?: boolean;
  enableCloudflareAnalytics?: boolean;
  cloudflareToken?: string;
}

export function ConsentAwareAnalytics({
  gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  enableVercelAnalytics = true,
  enableCloudflareAnalytics = true,
  cloudflareToken = '5871c7284ba4474ca46670b50b73502c',
}: ConsentAwareAnalyticsProps) {
  const { hasConsent, isConsentValid, consent } = useCookieConsent();
  const [analyticsLoaded, setAnalyticsLoaded] = useState(false);
  const [analyticsConsent, setAnalyticsConsent] = useState(false);

  // Track consent state
  useEffect(() => {
    const hasAnalyticsConsent = hasConsent('analytics_cookies') && isConsentValid();
    setAnalyticsConsent(hasAnalyticsConsent);

    // If consent is revoked, disable analytics
    if (!hasAnalyticsConsent && analyticsLoaded) {
      disableAnalytics();
    }
  }, [hasConsent, isConsentValid, consent, analyticsLoaded]);

  // Initialize analytics when consent is granted
  useEffect(() => {
    if (analyticsConsent && !analyticsLoaded) {
      initializeAnalytics();
      setAnalyticsLoaded(true);
    }
  }, [analyticsConsent, analyticsLoaded]);

  const initializeAnalytics = () => {
    if (typeof window === 'undefined') return;

    // Initialize Google Analytics with consent
    if (gaMeasurementId && 'gtag' in window) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'denied', // We don't use ads
        functionality_storage: 'granted',
        security_storage: 'granted',
      });

      // Send enhanced page view
      (window as any).gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        content_group1: 'Enterprise Platform',
        custom_parameter: 'consent_granted',
      });

      console.log('✅ Google Analytics enabled with user consent');
    }

    // Initialize Vercel Analytics
    if (enableVercelAnalytics && 'va' in window) {
      (window as any).va('consent', 'granted');
      console.log('✅ Vercel Analytics enabled with user consent');
    }

    // Initialize custom tracking
    initializeCustomTracking();
  };

  const disableAnalytics = () => {
    if (typeof window === 'undefined') return;

    // Disable Google Analytics
    if (gaMeasurementId && 'gtag' in window) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        functionality_storage: 'denied',
      });

      // Disable GA tracking
      (window as any)[`ga-disable-${gaMeasurementId}`] = true;

      console.log('🔒 Google Analytics disabled - consent revoked');
    }

    // Disable Vercel Analytics
    if (enableVercelAnalytics && 'va' in window) {
      (window as any).va('consent', 'denied');
      console.log('🔒 Vercel Analytics disabled - consent revoked');
    }

    // Clean up tracking
    cleanupTracking();
  };

  const initializeCustomTracking = () => {
    // Custom event tracking for enterprise features
    const trackEvent = (name: string, parameters?: Record<string, any>) => {
      if (!analyticsConsent) return;

      if ('gtag' in window && gaMeasurementId) {
        (window as any).gtag('event', name, {
          ...parameters,
          consent_status: 'granted',
          platform: 'afilo_enterprise',
        });
      }
    };

    // Expose global tracking function
    (window as any).trackEvent = trackEvent;

    // Track enterprise-specific events
    trackEvent('consent_analytics_enabled', {
      consent_method: consent?.exists ? 'existing' : 'new',
      user_type: 'enterprise',
    });

    // Track performance metrics
    if ('performance' in window && 'PerformanceObserver' in window) {
      try {
        // Core Web Vitals tracking
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              trackEvent('page_performance', {
                load_time: Math.round(navEntry.loadEventEnd - navEntry.loadEventStart),
                dom_content_loaded: Math.round(navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart),
                first_byte: Math.round(navEntry.responseStart - navEntry.requestStart),
              });
            }
          }
        });

        observer.observe({ entryTypes: ['navigation'] });
      } catch (err) {
        console.warn('Performance tracking not available:', err);
      }
    }
  };

  const cleanupTracking = () => {
    // Remove global tracking function
    if ('trackEvent' in window) {
      delete (window as any).trackEvent;
    }

    // Clear any stored analytics data
    try {
      localStorage.removeItem('ga_session_id');
      sessionStorage.removeItem('ga_session_id');
    } catch (err) {
      console.warn('Could not clear analytics storage:', err);
    }
  };

  // Google Analytics Scripts (only load if consent given)
  const GoogleAnalyticsScripts = () => {
    if (!analyticsConsent || !gaMeasurementId) return null;

    return (
      <>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
          strategy="afterInteractive"
          onLoad={() => {
            console.log('📊 Google Analytics script loaded');
          }}
        />
        <Script
          id="google-analytics-init"
          strategy="afterInteractive"
          onLoad={() => {
            console.log('📊 Google Analytics initialized');
          }}
        >
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}

            // Set initial consent state
            gtag('consent', 'default', {
              analytics_storage: 'granted',
              ad_storage: 'denied',
              functionality_storage: 'granted',
              security_storage: 'granted',
              wait_for_update: 500,
            });

            gtag('js', new Date());
            gtag('config', '${gaMeasurementId}', {
              page_path: window.location.pathname,
              send_page_view: false, // We'll send it manually after consent

              // Enhanced tracking for enterprise customers
              custom_map: {
                'dimension1': 'user_type',
                'dimension2': 'subscription_tier',
                'dimension3': 'company_size',
                'dimension4': 'consent_method'
              },

              // Privacy settings
              anonymize_ip: true,
              allow_google_signals: false, // Disabled for privacy
              allow_ad_personalization_signals: false,

              // Cookie settings
              cookie_flags: 'secure;samesite=strict',
              cookie_expires: 63072000, // 2 years in seconds
            });

            // Debug mode in development
            ${process.env.NODE_ENV === 'development' ? "gtag('config', '" + gaMeasurementId + "', { debug_mode: true });" : ''}
          `}
        </Script>
      </>
    );
  };

  // Cloudflare Analytics (only load if consent given and in production)
  const CloudflareAnalyticsScript = () => {
    if (!analyticsConsent || !enableCloudflareAnalytics || process.env.NODE_ENV !== 'production') {
      return null;
    }

    return (
      <Script
        defer
        src="https://static.cloudflareinsights.com/beacon.min.js"
        data-cf-beacon={`{"token": "${cloudflareToken}"}`}
        strategy="lazyOnload"
        onLoad={() => {
          console.log('📊 Cloudflare Analytics loaded');
        }}
      />
    );
  };

  // Vercel Analytics initialization
  useEffect(() => {
    if (analyticsConsent && enableVercelAnalytics) {
      // Vercel Analytics is typically loaded via @vercel/analytics
      // This is a placeholder for custom initialization if needed
      if (typeof window !== 'undefined' && 'va' in window) {
        (window as any).va('init');
        console.log('📊 Vercel Analytics initialized');
      }
    }
  }, [analyticsConsent, enableVercelAnalytics]);

  return (
    <>
      <GoogleAnalyticsScripts />
      <CloudflareAnalyticsScript />
    </>
  );
}

/**
 * Utility hook for tracking events with consent awareness
 */
export function useConsentAwareTracking() {
  const { hasConsent, isConsentValid } = useCookieConsent();

  const trackEvent = (
    eventName: string,
    parameters?: Record<string, any>,
    options?: {
      requiresConsent?: boolean;
      category?: string;
    }
  ) => {
    const { requiresConsent = true, category = 'general' } = options || {};

    // Check consent if required
    if (requiresConsent && (!hasConsent('analytics_cookies') || !isConsentValid())) {
      console.log(`🔒 Event "${eventName}" not tracked - no analytics consent`);
      return;
    }

    // Track with Google Analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', eventName, {
        event_category: category,
        ...parameters,
        consent_status: hasConsent('analytics_cookies') ? 'granted' : 'denied',
        platform: 'afilo_enterprise',
      });
    }

    // Track with custom analytics if available
    if (typeof window !== 'undefined' && 'trackEvent' in window) {
      (window as any).trackEvent(eventName, {
        category,
        ...parameters,
      });
    }

    console.log(`📊 Event tracked: ${eventName}`, { category, parameters });
  };

  const trackPageView = (
    path?: string,
    title?: string,
    parameters?: Record<string, any>
  ) => {
    trackEvent('page_view', {
      page_path: path || window.location.pathname,
      page_title: title || document.title,
      ...parameters,
    }, {
      category: 'navigation',
    });
  };

  const trackConversion = (
    value: number,
    currency: string = 'USD',
    transactionId?: string,
    parameters?: Record<string, any>
  ) => {
    trackEvent('purchase', {
      value,
      currency,
      transaction_id: transactionId,
      ...parameters,
    }, {
      category: 'ecommerce',
    });
  };

  const trackError = (
    error: Error | string,
    context?: string,
    parameters?: Record<string, any>
  ) => {
    const errorMessage = error instanceof Error ? error.message : error;

    trackEvent('exception', {
      description: errorMessage,
      fatal: false,
      context,
      ...parameters,
    }, {
      category: 'error',
      requiresConsent: false, // Error tracking is essential
    });
  };

  return {
    trackEvent,
    trackPageView,
    trackConversion,
    trackError,
    hasAnalyticsConsent: hasConsent('analytics_cookies') && isConsentValid(),
  };
}

export default ConsentAwareAnalytics;