/**
 * User Privacy Settings Page
 * Cookie consent management and privacy controls
 *
 * @fileoverview User-facing privacy settings page with cookie consent management
 * @version 1.0
 * @compliance CCPA, PIPEDA, UK GDPR, Australia Privacy Act
 */

'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Shield,
  BarChart3,
  Megaphone,
  Palette,
  AlertCircle,
  CheckCircle,
  Download,
  Trash2,
  RefreshCw,
  ExternalLink,
  Info,
  Clock,
  Globe,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { COOKIE_CATEGORIES } from '@/lib/validations/cookie-consent';
import Link from 'next/link';

export default function PrivacySettingsPage() {
  const { user } = useUser();
  const {
    consent,
    status,
    updateConsent,
    revokeConsent,
    refreshStatus,
    isLoading,
    error,
    hasConsent,
    isConsentValid,
  } = useCookieConsent();

  const [preferences, setPreferences] = useState({
    essential_cookies: true,
    analytics_cookies: false,
    marketing_cookies: false,
    preferences_cookies: false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialize preferences from existing consent
  useEffect(() => {
    if (consent?.exists && consent?.preferences) {
      setPreferences(consent.preferences);
    }
  }, [consent]);

  const handlePreferenceChange = (key: keyof typeof preferences, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await updateConsent({
        analytics_cookies: preferences.analytics_cookies,
        marketing_cookies: preferences.marketing_cookies,
        preferences_cookies: preferences.preferences_cookies,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 5000);

    } catch (err) {
      console.error('Failed to save preferences:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevokeAllConsent = async () => {
    if (!confirm('Are you sure you want to revoke all non-essential cookies? This will disable analytics, marketing, and preference cookies.')) {
      return;
    }

    setIsSaving(true);

    try {
      await revokeConsent('User requested revocation from privacy settings');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 5000);

    } catch (err) {
      console.error('Failed to revoke consent:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      // This would typically call an API to generate the export
      alert('Data export functionality will be implemented. You will receive an email with your data.');
    } catch (err) {
      console.error('Failed to export data:', err);
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Privacy & Cookie Settings</h1>
        <p className="text-muted-foreground">
          Manage how we collect and use cookies on your device. Changes take effect immediately.
        </p>
      </div>

      {/* Success/Error Alerts */}
      {saveSuccess && (
        <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950/20">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Your privacy preferences have been saved successfully.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="mb-6 border-red-500 bg-red-50 dark:bg-red-950/20">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="cookies" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cookies">Cookie Preferences</TabsTrigger>
          <TabsTrigger value="status">Privacy Status</TabsTrigger>
          <TabsTrigger value="rights">Your Rights</TabsTrigger>
        </TabsList>

        {/* Cookie Preferences Tab */}
        <TabsContent value="cookies" className="space-y-6">
          {/* Current Status */}
          {consent?.exists && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Current Consent Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium">Consent Date</p>
                    <p className="text-sm text-muted-foreground">
                      {consent?.consent_timestamp ? new Date(consent.consent_timestamp).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Expires</p>
                    <p className="text-sm text-muted-foreground">
                      {consent?.expires_at ? new Date(consent.expires_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <div className="flex items-center gap-2">
                      {isConsentValid() ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-600">Active</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 text-orange-600" />
                          <span className="text-sm text-orange-600">Needs Update</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cookie Categories */}
          <div className="space-y-4">
            {Object.entries(COOKIE_CATEGORIES).map(([key, category]) => {
              const prefKey = category.id as keyof typeof preferences;
              const isEnabled = preferences[prefKey];

              return (
                <Card key={key} className={`transition-all ${isEnabled && !category.required ? 'ring-2 ring-primary/20' : ''}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {key === 'ESSENTIAL' && <Shield className="h-5 w-5 text-green-600" />}
                          {key === 'ANALYTICS' && <BarChart3 className="h-5 w-5 text-blue-600" />}
                          {key === 'MARKETING' && <Megaphone className="h-5 w-5 text-purple-600" />}
                          {key === 'PREFERENCES' && <Palette className="h-5 w-5 text-orange-600" />}

                          <CardTitle className="text-lg">{category.name}</CardTitle>
                          {category.required && (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                              Required
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="text-sm">
                          {category.description}
                        </CardDescription>
                      </div>

                      <Switch
                        checked={isEnabled}
                        onCheckedChange={(checked: boolean) =>
                          !category.required && handlePreferenceChange(prefKey, checked)
                        }
                        disabled={category.required || isLoading || isSaving}
                        className="flex-shrink-0"
                      />
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-1">What this includes:</p>
                        <ul className="text-sm text-muted-foreground list-disc ml-4 space-y-1">
                          {category.examples.map((example, idx) => (
                            <li key={idx}>{example}</li>
                          ))}
                        </ul>
                      </div>

                      {!category.required && (
                        <div className="text-xs text-muted-foreground">
                          <p>
                            <strong>Impact if disabled:</strong> {key === 'ANALYTICS' && 'We cannot track usage patterns to improve the platform.'}
                            {key === 'MARKETING' && 'You will not see personalized advertisements.'}
                            {key === 'PREFERENCES' && 'Your settings will not be saved between sessions.'}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleSavePreferences}
              disabled={isLoading || isSaving}
              className="flex-1"
              size="lg"
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Save Preferences
            </Button>

            <Button
              onClick={() => {
                setPreferences({
                  essential_cookies: true,
                  analytics_cookies: true,
                  marketing_cookies: true,
                  preferences_cookies: true,
                });
              }}
              variant="outline"
              size="lg"
            >
              Accept All
            </Button>

            <Button
              onClick={() => {
                setPreferences({
                  essential_cookies: true,
                  analytics_cookies: false,
                  marketing_cookies: false,
                  preferences_cookies: false,
                });
              }}
              variant="ghost"
              size="lg"
            >
              Reject All
            </Button>
          </div>

          {/* Danger Zone */}
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Permanently revoke all non-essential cookie consent. This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleRevokeAllConsent}
                variant="destructive"
                disabled={isLoading || isSaving}
              >
                Revoke All Non-Essential Cookies
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Status Tab */}
        <TabsContent value="status" className="space-y-6">
          {/* Compliance Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Regional Compliance
              </CardTitle>
              <CardDescription>
                Your privacy rights based on your location
              </CardDescription>
            </CardHeader>
            <CardContent>
              {status && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Detected Location</p>
                    <p className="text-sm text-muted-foreground">
                      {status.compliance.country_code} - {status.compliance.framework}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Consent Requirements</p>
                    <p className="text-sm text-muted-foreground">
                      {status.compliance.requires_explicit_consent ? 'Explicit consent required' : 'Opt-out model'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Policy Version</p>
                    <p className="text-sm text-muted-foreground">
                      {status.policy.current_version}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Consent Expiry</p>
                    <p className="text-sm text-muted-foreground">
                      {status.compliance.consent_expiry_months} months
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Your Data Summary
              </CardTitle>
              <CardDescription>
                Overview of data collection based on your consent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">Analytics Data</p>
                    <p className="text-sm text-muted-foreground">
                      {hasConsent('analytics_cookies') ? 'Currently being collected' : 'Not being collected'}
                    </p>
                  </div>
                  <Badge variant={hasConsent('analytics_cookies') ? 'default' : 'secondary'}>
                    {hasConsent('analytics_cookies') ? 'Active' : 'Disabled'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">Marketing Data</p>
                    <p className="text-sm text-muted-foreground">
                      {hasConsent('marketing_cookies') ? 'Currently being collected' : 'Not being collected'}
                    </p>
                  </div>
                  <Badge variant={hasConsent('marketing_cookies') ? 'default' : 'secondary'}>
                    {hasConsent('marketing_cookies') ? 'Active' : 'Disabled'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">Preference Data</p>
                    <p className="text-sm text-muted-foreground">
                      {hasConsent('preferences_cookies') ? 'Settings are saved' : 'Settings not saved'}
                    </p>
                  </div>
                  <Badge variant={hasConsent('preferences_cookies') ? 'default' : 'secondary'}>
                    {hasConsent('preferences_cookies') ? 'Active' : 'Disabled'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={refreshStatus}
              variant="outline"
              disabled={isLoading}
              className="w-full"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Status
            </Button>

            <Button
              onClick={handleExportData}
              variant="outline"
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Export My Data
            </Button>
          </div>
        </TabsContent>

        {/* Your Rights Tab */}
        <TabsContent value="rights" className="space-y-6">
          {/* Regional Rights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Privacy Rights</CardTitle>
                <CardDescription>
                  Based on your location and applicable privacy laws
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">California Residents (CCPA)</h4>
                  <ul className="text-sm text-muted-foreground list-disc ml-4 space-y-1">
                    <li>Opt-out of sale of personal information (we don't sell data)</li>
                    <li>Request deletion of personal information</li>
                    <li>Request disclosure of information we collect</li>
                    <li>Non-discrimination for exercising rights</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Canadian Residents (PIPEDA)</h4>
                  <ul className="text-sm text-muted-foreground list-disc ml-4 space-y-1">
                    <li>Withdraw consent for non-essential cookies</li>
                    <li>Access and correct your personal information</li>
                    <li>Request deletion of your data</li>
                    <li>File complaints with Privacy Commissioner</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">UK Residents (UK GDPR)</h4>
                  <ul className="text-sm text-muted-foreground list-disc ml-4 space-y-1">
                    <li>Consent management and withdrawal</li>
                    <li>Data portability and access requests</li>
                    <li>Right to object to processing</li>
                    <li>Request data deletion (right to be forgotten)</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Australian Residents</h4>
                  <ul className="text-sm text-muted-foreground list-disc ml-4 space-y-1">
                    <li>Access and correct your personal information</li>
                    <li>Request information about data handling</li>
                    <li>File complaints with OAIC</li>
                    <li>Reasonable data deletion requests</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Exercise Your Rights</CardTitle>
                <CardDescription>
                  How to contact us about your privacy rights
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Email:</strong>{' '}
                      <Link href="mailto:privacy@techsci.io" className="text-primary underline">
                        privacy@techsci.io
                      </Link>
                    </p>
                    <p>
                      <strong>Phone:</strong>{' '}
                      <Link href="tel:+13024153171" className="text-primary underline">
                        +1 302 415 3171
                      </Link>
                    </p>
                    <p>
                      <strong>Mail:</strong><br />
                      TechSci, Inc.<br />
                      1111B S Governors Ave STE 34002<br />
                      Dover, DE 19904, United States
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Response Timeline</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    We typically respond to privacy requests within:
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc ml-4 space-y-1">
                    <li>Cookie preference updates: Immediate</li>
                    <li>Data access requests: 30 days</li>
                    <li>Data deletion requests: 30 days</li>
                    <li>General inquiries: 5 business days</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Additional Resources</h4>
                  <div className="space-y-2">
                    <Link
                      href="/legal/privacy-policy"
                      className="text-sm text-primary underline inline-flex items-center gap-1"
                    >
                      Privacy Policy
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                    <br />
                    <Link
                      href="/legal/cookie-policy"
                      className="text-sm text-primary underline inline-flex items-center gap-1"
                    >
                      Complete Cookie Policy
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                    <br />
                    <Link
                      href="/legal/terms-of-service"
                      className="text-sm text-primary underline inline-flex items-center gap-1"
                    >
                      Terms of Service
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}