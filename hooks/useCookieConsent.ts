/**
 * Cookie Consent Management Hook
 * React hook for managing cookie consent state and API interactions
 *
 * @fileoverview Custom hook for cookie consent CRUD operations and state management
 * @version 1.0
 * @compliance CCPA, PIPEDA, UK GDPR, Australia Privacy Act
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  type CookiePreferences,
  type ConsentMethod,
  type ConsentSource,
  generateSessionId,
} from '@/lib/validations/cookie-consent';

// Types for hook
interface ConsentData {
  exists: boolean;
  id?: string;
  preferences?: CookiePreferences;
  consent_timestamp?: string;
  consent_version?: string;
  expires_at?: string;
  is_expired?: boolean;
  needs_reconsent?: boolean;
}

interface ConsentStatus {
  compliance: {
    country_code: string;
    framework: string;
    requires_explicit_consent: boolean;
    allows_implied_consent: boolean;
    consent_expiry_months: number;
  };
  policy: {
    current_version: string;
    requires_reconsent: boolean;
  };
  user: {
    is_authenticated: boolean;
    user_id: string | null;
    session_id: string | null;
  };
  consent_required: boolean;
  show_banner: boolean;
  consent: ConsentData;
}

interface SaveConsentInput {
  preferences: CookiePreferences;
  consent_method: ConsentMethod;
  session_id: string;
  consent_source?: ConsentSource;
  browser_language?: string;
  metadata?: Record<string, any>;
}

interface UseCookieConsentReturn {
  // State
  consent: ConsentData | null;
  status: ConsentStatus | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  saveConsent: (input: SaveConsentInput) => Promise<void>;
  updateConsent: (preferences: Omit<CookiePreferences, 'essential_cookies'>) => Promise<void>;
  revokeConsent: (reason?: string) => Promise<void>;
  refreshStatus: () => Promise<void>;

  // Utilities
  generateSessionId: () => string;
  getSessionId: () => string;
  hasConsent: (category?: keyof CookiePreferences) => boolean;
  isConsentValid: () => boolean;
}

// Session storage keys
const SESSION_ID_KEY = 'afilo_cookie_session_id';
const CONSENT_CACHE_KEY = 'afilo_cookie_consent';

export function useCookieConsent(): UseCookieConsentReturn {
  const { user, isLoaded: userLoaded } = useUser();

  // State
  const [consent, setConsent] = useState<ConsentData | null>(null);
  const [status, setStatus] = useState<ConsentStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get or create session ID
  const getSessionId = useCallback((): string => {
    if (typeof window === 'undefined') return generateSessionId();

    let sessionId = localStorage.getItem(SESSION_ID_KEY);
    if (!sessionId) {
      sessionId = generateSessionId();
      localStorage.setItem(SESSION_ID_KEY, sessionId);
    }
    return sessionId;
  }, []);

  // Load cached consent from localStorage
  const loadCachedConsent = useCallback((): ConsentData | null => {
    if (typeof window === 'undefined') return null;

    try {
      const cached = localStorage.getItem(CONSENT_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        // Check if cache is still valid (not expired)
        if (parsed.expires_at && new Date(parsed.expires_at) > new Date()) {
          return parsed;
        } else {
          // Remove expired cache
          localStorage.removeItem(CONSENT_CACHE_KEY);
        }
      }
    } catch (err) {
      console.error('Failed to load cached consent:', err);
      localStorage.removeItem(CONSENT_CACHE_KEY);
    }

    return null;
  }, []);

  // Cache consent to localStorage
  const cacheConsent = useCallback((consentData: ConsentData) => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(CONSENT_CACHE_KEY, JSON.stringify(consentData));
    } catch (err) {
      console.error('Failed to cache consent:', err);
    }
  }, []);

  // Fetch consent status from API
  const fetchConsentStatus = useCallback(async (): Promise<ConsentStatus | null> => {
    try {
      const sessionId = getSessionId();
      const response = await fetch(`/api/cookies/status?session_id=${encodeURIComponent(sessionId)}`);

      if (!response.ok) {
        throw new Error(`Status API error: ${response.status}`);
      }

      const statusData: ConsentStatus = await response.json();
      return statusData;

    } catch (err) {
      console.error('Failed to fetch consent status:', err);
      return null;
    }
  }, [getSessionId]);

  // Fetch consent data from API
  const fetchConsent = useCallback(async (): Promise<ConsentData | null> => {
    try {
      const sessionId = getSessionId();
      const queryParams = new URLSearchParams({
        session_id: sessionId,
        include_expired: 'false',
      });

      const response = await fetch(`/api/cookies/consent?${queryParams}`);

      if (!response.ok) {
        throw new Error(`Consent API error: ${response.status}`);
      }

      const data = await response.json();
      return data.consent;

    } catch (err) {
      console.error('Failed to fetch consent:', err);
      return null;
    }
  }, [getSessionId]);

  // Refresh both status and consent
  const refreshStatus = useCallback(async () => {
    if (!userLoaded) return;

    setIsLoading(true);
    setError(null);

    try {
      const [statusData, consentData] = await Promise.all([
        fetchConsentStatus(),
        fetchConsent(),
      ]);

      setStatus(statusData);

      if (consentData) {
        setConsent(consentData);
        cacheConsent(consentData);
      } else {
        setConsent(null);
        // Try to load from cache if API fails
        const cached = loadCachedConsent();
        if (cached) {
          setConsent(cached);
        }
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load consent data';
      setError(errorMessage);

      // Fallback to cached data on error
      const cached = loadCachedConsent();
      if (cached) {
        setConsent(cached);
      }

    } finally {
      setIsLoading(false);
    }
  }, [userLoaded, fetchConsentStatus, fetchConsent, cacheConsent, loadCachedConsent]);

  // Save consent preferences
  const saveConsent = useCallback(async (input: SaveConsentInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/cookies/consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save consent');
      }

      const data = await response.json();

      if (data.success && data.consent) {
        const newConsent: ConsentData = {
          exists: true,
          id: data.consent.id,
          preferences: data.consent.preferences,
          consent_timestamp: data.consent.metadata.consent_timestamp,
          expires_at: data.consent.metadata.expires_at,
          is_expired: false,
          needs_reconsent: false,
        };

        setConsent(newConsent);
        cacheConsent(newConsent);

        // Trigger analytics if analytics cookies are enabled
        if (data.consent.preferences.analytics_cookies) {
          // Initialize analytics
          if (typeof window !== 'undefined') {
            // Google Analytics consent update
            if ('gtag' in window) {
              (window as any).gtag('consent', 'update', {
                analytics_storage: 'granted',
              });
            }

            // Vercel Analytics consent
            if ('va' in window) {
              (window as any).va('consent', 'granted');
            }
          }
        }

        // Refresh status to get updated data
        await refreshStatus();
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save consent';
      setError(errorMessage);
      throw err; // Re-throw for component error handling

    } finally {
      setIsLoading(false);
    }
  }, [cacheConsent, refreshStatus]);

  // Update existing consent preferences
  const updateConsent = useCallback(async (preferences: Omit<CookiePreferences, 'essential_cookies'>) => {
    if (!consent?.exists) {
      throw new Error('No existing consent to update');
    }

    setIsLoading(true);
    setError(null);

    try {
      const fullPreferences: CookiePreferences = {
        essential_cookies: true, // Always true
        ...preferences,
      };

      const response = await fetch('/api/cookies/consent', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferences: fullPreferences,
          change_reason: 'User updated preferences',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update consent');
      }

      const data = await response.json();

      if (data.success && data.consent) {
        const updatedConsent: ConsentData = {
          ...consent,
          preferences: fullPreferences,
        };

        setConsent(updatedConsent);
        cacheConsent(updatedConsent);

        // Refresh status
        await refreshStatus();
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update consent';
      setError(errorMessage);
      throw err;

    } finally {
      setIsLoading(false);
    }
  }, [consent, cacheConsent, refreshStatus]);

  // Revoke non-essential consent
  const revokeConsent = useCallback(async (reason?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const sessionId = getSessionId();
      const response = await fetch('/api/cookies/consent/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          reason: reason || 'User requested revocation',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to revoke consent');
      }

      const data = await response.json();

      if (data.success) {
        const revokedConsent: ConsentData = {
          exists: true,
          preferences: data.current_preferences,
          is_expired: false,
          needs_reconsent: false,
        };

        setConsent(revokedConsent);
        cacheConsent(revokedConsent);

        // Disable analytics
        if (typeof window !== 'undefined') {
          if ('gtag' in window) {
            (window as any).gtag('consent', 'update', {
              analytics_storage: 'denied',
            });
          }
        }

        await refreshStatus();
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to revoke consent';
      setError(errorMessage);
      throw err;

    } finally {
      setIsLoading(false);
    }
  }, [getSessionId, cacheConsent, refreshStatus]);

  // Utility: Check if user has consented to a specific category
  const hasConsent = useCallback((category?: keyof CookiePreferences): boolean => {
    if (!consent?.exists || !consent?.preferences) return false;

    if (category) {
      return consent.preferences[category] === true;
    }

    // If no category specified, check if any non-essential category is enabled
    return consent.preferences.analytics_cookies ||
           consent.preferences.marketing_cookies ||
           consent.preferences.preferences_cookies;
  }, [consent]);

  // Utility: Check if consent is valid and not expired
  const isConsentValid = useCallback((): boolean => {
    if (!consent?.exists) return false;
    if (consent.is_expired || consent.needs_reconsent) return false;
    if (consent.expires_at && new Date(consent.expires_at) <= new Date()) return false;
    return true;
  }, [consent]);

  // Initialize on mount and when user changes
  useEffect(() => {
    if (userLoaded) {
      // Load cached consent immediately for better UX
      const cached = loadCachedConsent();
      if (cached) {
        setConsent(cached);
      }

      // Then fetch fresh data
      refreshStatus();
    }
  }, [userLoaded, refreshStatus, loadCachedConsent]);

  return {
    // State
    consent,
    status,
    isLoading,
    error,

    // Actions
    saveConsent,
    updateConsent,
    revokeConsent,
    refreshStatus,

    // Utilities
    generateSessionId,
    getSessionId,
    hasConsent,
    isConsentValid,
  };
}