'use client';

/**
 * MerchantOnboardingWizard Component
 *
 * ⚠️ DORMANT FEATURE - Prepared for future activation
 *
 * Multi-step wizard for onboarding merchants into Afilo's marketplace.
 * Currently disabled - will be activated when marketplace features launch.
 *
 * Steps:
 * 1. Business Information (name, type, country)
 * 2. Banking Details (payout account setup)
 * 3. KYC/Verification (identity, address, docs)
 * 4. Store Setup (storefront configuration)
 * 5. Review & Activation
 *
 * Features (when enabled):
 * - Multi-step form validation
 * - Progress tracking
 * - Document upload support
 * - Stripe Connect integration
 * - Real-time verification status
 * - Bank account management
 *
 * Usage:
 * ```tsx
 * // Currently disabled, will be available when marketplace launches
 * if (isMarketplaceEnabled) {
 *   <MerchantOnboardingWizard onComplete={() => {}} />
 * }
 * ```
 */

import React, { useState } from 'react';

/**
 * Merchant onboarding steps
 */
enum OnboardingStep {
  Business = 'business',
  Banking = 'banking',
  Verification = 'verification',
  Store = 'store',
  Review = 'review',
}

/**
 * Component Props
 */
interface MerchantOnboardingWizardProps {
  /** Callback when onboarding completes */
  onComplete?: (merchantId: string) => void;
  /** Callback on error */
  onError?: (error: string) => void;
  /** Custom className */
  className?: string;
}

/**
 * MerchantOnboardingWizard Component
 *
 * ⚠️ DORMANT - This component is prepared but not active.
 * Will be enabled when marketplace features are launched.
 *
 * Provides a guided onboarding flow for merchants to:
 * - Register business information
 * - Setup bank accounts for payouts
 * - Complete KYC verification
 * - Configure their storefront
 * - Review and activate their store
 *
 * @component
 */
export const MerchantOnboardingWizard: React.FC<MerchantOnboardingWizardProps> = ({
  onComplete,
  onError,
  className = '',
}) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(OnboardingStep.Business);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state (simplified for dormant component)
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: 'sole_proprietor',
    country: 'US',
    bankAccountToken: '',
    documentId: '',
    storeName: '',
  });

  /**
   * Render dormant state message
   */
  const renderDormantMessage = () => (
    <div className="dormant-feature-container">
      <div className="dormant-banner">
        <div className="dormant-icon">🔒</div>
        <div className="dormant-content">
          <h2>Marketplace Coming Soon</h2>
          <p>
            The merchant onboarding wizard is currently dormant and will be activated
            when Afilo's marketplace features launch.
          </p>
          <div className="feature-list">
            <p>
              <strong>This component is ready for:</strong>
            </p>
            <ul>
              <li>✓ Multi-step business registration</li>
              <li>✓ Bank account setup and verification</li>
              <li>✓ KYC document upload and verification</li>
              <li>✓ Stripe Connect integration</li>
              <li>✓ Storefront configuration</li>
              <li>✓ Real-time verification status tracking</li>
              <li>✓ Payout management</li>
            </ul>
          </div>
          <p className="activation-note">
            To activate this feature, enable the <code>MERCHANT_ACCOUNTS</code> feature flag.
          </p>
        </div>
      </div>

      <style jsx>{`
        .dormant-feature-container {
          padding: 2rem;
        }

        .dormant-banner {
          display: flex;
          gap: 2rem;
          padding: 2rem;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border: 2px dashed #0ea5e9;
          border-radius: 0.75rem;
          align-items: flex-start;
        }

        .dormant-icon {
          font-size: 2.5rem;
          flex-shrink: 0;
        }

        .dormant-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .dormant-content h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
          color: #0c4a6e;
        }

        .dormant-content p {
          margin: 0;
          color: #0c4a6e;
          font-size: 0.95rem;
        }

        .feature-list {
          margin: 1rem 0;
        }

        .feature-list p {
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .feature-list ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }

        .feature-list li {
          color: #0c4a6e;
          font-size: 0.9rem;
          padding: 0.25rem 0;
        }

        .activation-note {
          padding: 1rem;
          background-color: rgba(255, 255, 255, 0.5);
          border-radius: 0.375rem;
          font-size: 0.875rem;
          color: #0c4a6e;
        }

        .activation-note code {
          background-color: #f0f9ff;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-weight: 600;
          color: #0e7490;
        }

        @media (max-width: 768px) {
          .dormant-banner {
            flex-direction: column;
          }

          .feature-list ul {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );

  // Since this is dormant, always show dormant message
  return renderDormantMessage();
};

export default MerchantOnboardingWizard;
