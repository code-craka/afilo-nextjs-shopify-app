/**
 * Cookie Consent Banner Component
 * Non-blocking consent banner for CCPA/PIPEDA/UK GDPR compliance
 *
 * @fileoverview Main cookie consent banner with animations and granular controls
 * @version 1.0
 * @compliance CCPA, PIPEDA, UK GDPR, Australia Privacy Act
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import {
  Cookie,
  Settings,
  X,
  Shield,
  BarChart3,
  Megaphone,
  Palette,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { COOKIE_CATEGORIES } from '@/lib/validations/cookie-consent';
import Link from 'next/link';

interface CookieConsentBannerProps {
  className?: string;
  position?: 'top' | 'bottom';
  theme?: 'light' | 'dark' | 'auto';
  delayMs?: number;
}

export function CookieConsentBanner({
  className = '',
  position = 'bottom',
  theme = 'auto',
  delayMs = 1000,
}: CookieConsentBannerProps) {
  const { user } = useUser();
  const {
    consent,
    saveConsent,
    updateConsent,
    isLoading,
    error,
    generateSessionId
  } = useCookieConsent();

  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    essential_cookies: true as const,
    analytics_cookies: false,
    marketing_cookies: false,
    preferences_cookies: false,
  });

  // Show banner logic
  useEffect(() => {
    // Don't show if consent exists and is valid
    if (consent?.exists && !consent?.is_expired && !consent?.needs_reconsent) {
      return;
    }

    // Show banner after delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [consent, delayMs]);

  // Initialize preferences from existing consent
  useEffect(() => {
    if (consent?.exists && consent?.preferences) {
      setPreferences(consent.preferences);
    }
  }, [consent]);

  const handleAcceptAll = async () => {
    try {
      await saveConsent({
        preferences: {
          essential_cookies: true,
          analytics_cookies: true,
          marketing_cookies: true,
          preferences_cookies: true,
        },
        consent_method: 'explicit_accept',
        session_id: generateSessionId(),
      });
      setIsVisible(false);
    } catch (err) {
      console.error('Failed to save consent:', err);
    }
  };

  const handleRejectNonEssential = async () => {
    try {
      await saveConsent({
        preferences: {
          essential_cookies: true,
          analytics_cookies: false,
          marketing_cookies: false,
          preferences_cookies: false,
        },
        consent_method: 'explicit_reject',
        session_id: generateSessionId(),
      });
      setIsVisible(false);
    } catch (err) {
      console.error('Failed to save consent:', err);
    }
  };

  const handleSaveCustom = async () => {
    try {
      await saveConsent({
        preferences,
        consent_method: 'settings_update',
        session_id: generateSessionId(),
      });
      setIsVisible(false);
    } catch (err) {
      console.error('Failed to save consent:', err);
    }
  };

  const handlePreferenceChange = (key: keyof typeof preferences, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  if (!isVisible) return null;

  const positionClasses = position === 'top'
    ? 'top-0 left-0 right-0'
    : 'bottom-0 left-0 right-0';

  const animationVariants = {
    initial: position === 'top'
      ? { y: -100, opacity: 0 }
      : { y: 100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: position === 'top'
      ? { y: -100, opacity: 0 }
      : { y: 100, opacity: 0 },
  };

  return (
    <AnimatePresence>
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={animationVariants}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30
        }}
        className={`fixed ${positionClasses} z-50 p-4 pointer-events-none ${className}`}
      >
        <Card className="max-w-6xl mx-auto pointer-events-auto shadow-2xl border-2 border-primary/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 mt-1">
                <Cookie className="h-8 w-8 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold">
                    We Value Your Privacy
                  </h3>

                  <button
                    onClick={handleRejectNonEssential}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Reject non-essential cookies"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  We use cookies to enhance your experience, analyze site usage, and personalize content.
                  Essential cookies are required for platform functionality and cannot be disabled.
                </p>
              </div>
            </div>

            {/* Cookie Categories Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="flex items-center gap-2 text-xs">
                <Shield className="h-3 w-3 text-green-600" />
                <span className="text-muted-foreground">Essential (Required)</span>
                <Badge variant="secondary" className="text-xs">Always Active</Badge>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <BarChart3 className="h-3 w-3 text-blue-600" />
                <span className="text-muted-foreground">Analytics</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Megaphone className="h-3 w-3 text-purple-600" />
                <span className="text-muted-foreground">Marketing</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Palette className="h-3 w-3 text-orange-600" />
                <span className="text-muted-foreground">Preferences</span>
              </div>
            </div>

            {/* Expanded Settings */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-4 overflow-hidden"
                >
                  <Separator className="mb-4" />

                  <div className="space-y-4">
                    {Object.entries(COOKIE_CATEGORIES).map(([key, category]) => {
                      const prefKey = category.id as keyof typeof preferences;
                      const isEnabled = preferences[prefKey];

                      return (
                        <div key={key} className="flex items-start justify-between gap-4 p-3 rounded-lg border bg-muted/30">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {key === 'ESSENTIAL' && <Shield className="h-4 w-4 text-green-600" />}
                              {key === 'ANALYTICS' && <BarChart3 className="h-4 w-4 text-blue-600" />}
                              {key === 'MARKETING' && <Megaphone className="h-4 w-4 text-purple-600" />}
                              {key === 'PREFERENCES' && <Palette className="h-4 w-4 text-orange-600" />}

                              <h4 className="font-medium text-sm">{category.name}</h4>
                              {category.required && (
                                <Badge variant="secondary" className="text-xs">Required</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              {category.description}
                            </p>
                            <details className="text-xs text-muted-foreground">
                              <summary className="cursor-pointer hover:text-foreground">
                                Examples
                              </summary>
                              <ul className="mt-1 ml-4 list-disc">
                                {category.examples.map((example, idx) => (
                                  <li key={idx}>{example}</li>
                                ))}
                              </ul>
                            </details>
                          </div>

                          <Switch
                            checked={isEnabled}
                            onCheckedChange={(checked: boolean) =>
                              !category.required && handlePreferenceChange(prefKey, checked)
                            }
                            disabled={category.required || isLoading}
                            className="flex-shrink-0"
                          />
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Links */}
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-4">
              <Link href="/legal/privacy-policy" className="underline hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/legal/cookie-policy" className="underline hover:text-foreground transition-colors">
                Cookie Policy
              </Link>
              <Link href="/dashboard/settings/privacy" className="underline hover:text-foreground transition-colors">
                Privacy Settings
              </Link>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex gap-3 flex-1">
                <Button
                  onClick={handleAcceptAll}
                  disabled={isLoading}
                  className="flex-1 sm:flex-initial bg-primary hover:bg-primary/90"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Accept All
                </Button>

                <Button
                  onClick={handleRejectNonEssential}
                  variant="outline"
                  disabled={isLoading}
                  className="flex-1 sm:flex-initial"
                >
                  Reject Non-Essential
                </Button>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowSettings(!showSettings)}
                  variant="ghost"
                  className="flex-1 sm:flex-initial"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Customize
                  {showSettings ? (
                    <ChevronUp className="w-4 h-4 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-2" />
                  )}
                </Button>

                {showSettings && (
                  <Button
                    onClick={handleSaveCustom}
                    disabled={isLoading}
                    className="flex-1 sm:flex-initial"
                  >
                    Save Preferences
                  </Button>
                )}
              </div>
            </div>

            {/* Compliance Notice */}
            <div className="mt-4 text-xs text-muted-foreground text-center">
              <p>
                Your privacy choices are respected and stored securely.
                Consent expires after 12 months and can be changed anytime in
                <Link href="/dashboard/settings/privacy" className="underline ml-1 hover:text-foreground">
                  Privacy Settings
                </Link>.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

export default CookieConsentBanner;