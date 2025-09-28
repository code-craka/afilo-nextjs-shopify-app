'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Types for quote building
interface QuoteRequirement {
  id: string;
  category: 'infrastructure' | 'integration' | 'customization' | 'support' | 'compliance';
  name: string;
  description: string;
  complexity: 'low' | 'medium' | 'high' | 'enterprise';
  estimatedHours: number;
  dependencies: string[];
  selected: boolean;
}

interface BusinessRequirement {
  industry: string;
  companySize: 'startup' | 'sme' | 'enterprise' | 'fortune500';
  userCount: number;
  regions: string[];
  complianceNeeds: string[];
  integrationNeeds: string[];
  deploymentPreference: 'cloud' | 'on-premise' | 'hybrid' | 'multi-cloud';
  timeline: 'immediate' | '3-months' | '6-months' | '12-months' | 'flexible';
}

interface ROIProjection {
  implementation: number;
  maintenance: number;
  savings: {
    annual: number;
    efficiency: number;
    costReduction: number;
  };
  paybackPeriod: number;
  roi3Year: number;
}

interface QuoteBuilderState {
  step: 'requirements' | 'customization' | 'pricing' | 'review';
  businessRequirements: Partial<BusinessRequirement>;
  selectedRequirements: QuoteRequirement[];
  customRequests: string;
  contactInfo: {
    name: string;
    email: string;
    company: string;
    title: string;
    phone: string;
  };
}

const ENTERPRISE_REQUIREMENTS: QuoteRequirement[] = [
  // Infrastructure
  {
    id: 'multi-region-deployment',
    category: 'infrastructure',
    name: 'Multi-Region Deployment',
    description: 'Deploy across multiple geographic regions for global availability',
    complexity: 'high',
    estimatedHours: 120,
    dependencies: [],
    selected: false
  },
  {
    id: 'auto-scaling',
    category: 'infrastructure',
    name: 'Auto-scaling Infrastructure',
    description: 'Automatic scaling based on demand with load balancing',
    complexity: 'medium',
    estimatedHours: 80,
    dependencies: ['multi-region-deployment'],
    selected: false
  },
  {
    id: 'disaster-recovery',
    category: 'infrastructure',
    name: 'Disaster Recovery & Backup',
    description: 'Comprehensive backup and disaster recovery solutions',
    complexity: 'high',
    estimatedHours: 100,
    dependencies: [],
    selected: false
  },

  // Integration
  {
    id: 'sso-integration',
    category: 'integration',
    name: 'Enterprise SSO Integration',
    description: 'Single Sign-On with Active Directory, OKTA, or SAML',
    complexity: 'medium',
    estimatedHours: 60,
    dependencies: [],
    selected: false
  },
  {
    id: 'api-integration',
    category: 'integration',
    name: 'Custom API Integrations',
    description: 'Integration with existing enterprise systems and databases',
    complexity: 'high',
    estimatedHours: 150,
    dependencies: [],
    selected: false
  },
  {
    id: 'crm-integration',
    category: 'integration',
    name: 'CRM Integration',
    description: 'Salesforce, HubSpot, or custom CRM integration',
    complexity: 'medium',
    estimatedHours: 80,
    dependencies: ['api-integration'],
    selected: false
  },

  // Customization
  {
    id: 'white-label',
    category: 'customization',
    name: 'White-label Solution',
    description: 'Complete rebranding with custom domain and styling',
    complexity: 'medium',
    estimatedHours: 100,
    dependencies: [],
    selected: false
  },
  {
    id: 'custom-workflows',
    category: 'customization',
    name: 'Custom Workflows',
    description: 'Tailored business processes and approval workflows',
    complexity: 'high',
    estimatedHours: 200,
    dependencies: [],
    selected: false
  },
  {
    id: 'advanced-analytics',
    category: 'customization',
    name: 'Advanced Analytics Dashboard',
    description: 'Custom analytics, reporting, and business intelligence',
    complexity: 'high',
    estimatedHours: 180,
    dependencies: [],
    selected: false
  },

  // Support
  {
    id: 'dedicated-support',
    category: 'support',
    name: 'Dedicated Support Team',
    description: '24/7 dedicated support with named engineers',
    complexity: 'enterprise',
    estimatedHours: 0, // Ongoing service
    dependencies: [],
    selected: false
  },
  {
    id: 'training-program',
    category: 'support',
    name: 'Training Program',
    description: 'Comprehensive training for administrators and end users',
    complexity: 'medium',
    estimatedHours: 40,
    dependencies: [],
    selected: false
  },

  // Compliance
  {
    id: 'soc2-compliance',
    category: 'compliance',
    name: 'SOC 2 Type II Compliance',
    description: 'Full SOC 2 compliance implementation and certification',
    complexity: 'enterprise',
    estimatedHours: 160,
    dependencies: [],
    selected: false
  },
  {
    id: 'gdpr-compliance',
    category: 'compliance',
    name: 'GDPR Compliance',
    description: 'European data protection regulation compliance',
    complexity: 'high',
    estimatedHours: 120,
    dependencies: [],
    selected: false
  },
  {
    id: 'hipaa-compliance',
    category: 'compliance',
    name: 'HIPAA Compliance',
    description: 'Healthcare data protection compliance',
    complexity: 'enterprise',
    estimatedHours: 200,
    dependencies: ['soc2-compliance'],
    selected: false
  }
];

interface EnterpriseQuoteBuilderProps {
  onSubmitQuote?: (quote: any) => void;
  className?: string;
}

export default function EnterpriseQuoteBuilder({
  onSubmitQuote,
  className = ''
}: EnterpriseQuoteBuilderProps) {
  const [state, setState] = useState<QuoteBuilderState>({
    step: 'requirements',
    businessRequirements: {},
    selectedRequirements: [],
    customRequests: '',
    contactInfo: {
      name: '',
      email: '',
      company: '',
      title: '',
      phone: ''
    }
  });

  // Calculate pricing based on requirements
  const calculatePricing = useCallback((): ROIProjection => {
    const basePrice = 50000; // Base enterprise implementation
    const hourlyRate = 250;

    const implementationCost = state.selectedRequirements.reduce(
      (total, req) => total + (req.estimatedHours * hourlyRate),
      basePrice
    );

    const complexityMultiplier = state.businessRequirements.companySize === 'fortune500' ? 1.5 :
                                 state.businessRequirements.companySize === 'enterprise' ? 1.3 : 1.1;

    const annualMaintenance = implementationCost * 0.2; // 20% of implementation

    // ROI calculations
    const userCount = state.businessRequirements.userCount || 100;
    const annualSavings = userCount * 2000; // $2000 per user annually
    const efficiencyGains = implementationCost * 0.15; // 15% efficiency improvement
    const costReduction = implementationCost * 0.1; // 10% cost reduction

    const totalImplementation = implementationCost * complexityMultiplier;
    const totalAnnualSavings = annualSavings + efficiencyGains + costReduction;
    const paybackPeriod = totalImplementation / totalAnnualSavings;
    const roi3Year = ((totalAnnualSavings * 3) - totalImplementation) / totalImplementation;

    return {
      implementation: totalImplementation,
      maintenance: annualMaintenance,
      savings: {
        annual: totalAnnualSavings,
        efficiency: efficiencyGains,
        costReduction: costReduction
      },
      paybackPeriod,
      roi3Year
    };
  }, [state.selectedRequirements, state.businessRequirements]);

  // Toggle requirement selection
  const toggleRequirement = (requirementId: string) => {
    setState(prev => {
      const requirement = ENTERPRISE_REQUIREMENTS.find(r => r.id === requirementId);
      if (!requirement) return prev;

      const isSelected = prev.selectedRequirements.some(r => r.id === requirementId);

      if (isSelected) {
        return {
          ...prev,
          selectedRequirements: prev.selectedRequirements.filter(r => r.id !== requirementId)
        };
      } else {
        return {
          ...prev,
          selectedRequirements: [...prev.selectedRequirements, { ...requirement, selected: true }]
        };
      }
    });
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get complexity color
  const getComplexityColor = (complexity: QuoteRequirement['complexity']): string => {
    switch (complexity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const pricing = calculatePricing();

  return (
    <div className={`max-w-6xl mx-auto ${className}`}>
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-gray-900">Enterprise Quote Builder</h2>
          <div className="text-sm text-gray-600">
            Step {['requirements', 'customization', 'pricing', 'review'].indexOf(state.step) + 1} of 4
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((['requirements', 'customization', 'pricing', 'review'].indexOf(state.step) + 1) / 4) * 100}%`
            }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Business Requirements */}
        {state.step === 'requirements' && (
          <motion.div
            key="requirements"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <BusinessRequirementsForm
              requirements={state.businessRequirements}
              onChange={(updates) => setState(prev => ({
                ...prev,
                businessRequirements: { ...prev.businessRequirements, ...updates }
              }))}
              onNext={() => setState(prev => ({ ...prev, step: 'customization' }))}
            />
          </motion.div>
        )}

        {/* Step 2: Customization Requirements */}
        {state.step === 'customization' && (
          <motion.div
            key="customization"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <CustomizationSelector
              requirements={ENTERPRISE_REQUIREMENTS}
              selectedRequirements={state.selectedRequirements}
              onToggleRequirement={toggleRequirement}
              customRequests={state.customRequests}
              onCustomRequestsChange={(value) => setState(prev => ({ ...prev, customRequests: value }))}
              getComplexityColor={getComplexityColor}
              onBack={() => setState(prev => ({ ...prev, step: 'requirements' }))}
              onNext={() => setState(prev => ({ ...prev, step: 'pricing' }))}
            />
          </motion.div>
        )}

        {/* Step 3: Pricing & ROI */}
        {state.step === 'pricing' && (
          <motion.div
            key="pricing"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <ROICalculator
              pricing={pricing}
              selectedRequirements={state.selectedRequirements}
              businessRequirements={state.businessRequirements}
              formatCurrency={formatCurrency}
              onBack={() => setState(prev => ({ ...prev, step: 'customization' }))}
              onNext={() => setState(prev => ({ ...prev, step: 'review' }))}
            />
          </motion.div>
        )}

        {/* Step 4: Review & Submit */}
        {state.step === 'review' && (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <QuoteReview
              state={state}
              pricing={pricing}
              formatCurrency={formatCurrency}
              onContactInfoChange={(contactInfo) => setState(prev => ({ ...prev, contactInfo }))}
              onBack={() => setState(prev => ({ ...prev, step: 'pricing' }))}
              onSubmit={() => onSubmitQuote?.({ ...state, pricing })}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Business Requirements Form Component
interface BusinessRequirementsFormProps {
  requirements: Partial<BusinessRequirement>;
  onChange: (updates: Partial<BusinessRequirement>) => void;
  onNext: () => void;
}

function BusinessRequirementsForm({ requirements, onChange, onNext }: BusinessRequirementsFormProps) {
  const isComplete = requirements.industry && requirements.companySize && requirements.userCount;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Business Requirements</h3>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Industry */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
          <select
            value={requirements.industry || ''}
            onChange={(e) => onChange({ industry: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Industry</option>
            <option value="technology">Technology</option>
            <option value="finance">Financial Services</option>
            <option value="healthcare">Healthcare</option>
            <option value="manufacturing">Manufacturing</option>
            <option value="retail">Retail</option>
            <option value="education">Education</option>
            <option value="government">Government</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Company Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
          <select
            value={requirements.companySize || ''}
            onChange={(e) => onChange({ companySize: e.target.value as BusinessRequirement['companySize'] })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Company Size</option>
            <option value="startup">Startup (1-50 employees)</option>
            <option value="sme">SME (51-500 employees)</option>
            <option value="enterprise">Enterprise (501-5000 employees)</option>
            <option value="fortune500">Fortune 500 (5000+ employees)</option>
          </select>
        </div>

        {/* User Count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Expected User Count</label>
          <input
            type="number"
            value={requirements.userCount || ''}
            onChange={(e) => onChange({ userCount: Number(e.target.value) })}
            placeholder="Number of users"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Deployment Preference */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Deployment Preference</label>
          <select
            value={requirements.deploymentPreference || ''}
            onChange={(e) => onChange({ deploymentPreference: e.target.value as BusinessRequirement['deploymentPreference'] })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Deployment</option>
            <option value="cloud">Cloud-hosted</option>
            <option value="on-premise">On-premise</option>
            <option value="hybrid">Hybrid</option>
            <option value="multi-cloud">Multi-cloud</option>
          </select>
        </div>

        {/* Timeline */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Implementation Timeline</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { value: 'immediate', label: 'Immediate' },
              { value: '3-months', label: '3 Months' },
              { value: '6-months', label: '6 Months' },
              { value: '12-months', label: '12 Months' },
              { value: 'flexible', label: 'Flexible' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => onChange({ timeline: option.value as BusinessRequirement['timeline'] })}
                className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                  requirements.timeline === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={onNext}
          disabled={!isComplete}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Continue to Customization
        </button>
      </div>
    </div>
  );
}

// Customization Selector Component
interface CustomizationSelectorProps {
  requirements: QuoteRequirement[];
  selectedRequirements: QuoteRequirement[];
  onToggleRequirement: (id: string) => void;
  customRequests: string;
  onCustomRequestsChange: (value: string) => void;
  getComplexityColor: (complexity: QuoteRequirement['complexity']) => string;
  onBack: () => void;
  onNext: () => void;
}

function CustomizationSelector({
  requirements,
  selectedRequirements,
  onToggleRequirement,
  customRequests,
  onCustomRequestsChange,
  getComplexityColor,
  onBack,
  onNext
}: CustomizationSelectorProps) {
  const categories = Array.from(new Set(requirements.map(r => r.category)));

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Enterprise Customizations</h3>
        <p className="text-gray-600 mb-8">
          Select the enterprise features and customizations your organization needs.
        </p>

        {categories.map((category) => (
          <div key={category} className="mb-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
              {category.replace('-', ' ')} Requirements
            </h4>

            <div className="grid md:grid-cols-2 gap-4">
              {requirements
                .filter(req => req.category === category)
                .map((requirement) => {
                  const isSelected = selectedRequirements.some(r => r.id === requirement.id);
                  const hasUnsatisfiedDependencies = requirement.dependencies.some(
                    dep => !selectedRequirements.some(r => r.id === dep)
                  );

                  return (
                    <div
                      key={requirement.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : hasUnsatisfiedDependencies
                          ? 'border-gray-200 bg-gray-50 opacity-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => !hasUnsatisfiedDependencies && onToggleRequirement(requirement.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h5 className="font-semibold text-gray-900">{requirement.name}</h5>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor(requirement.complexity)}`}>
                              {requirement.complexity.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{requirement.description}</p>
                          {requirement.estimatedHours > 0 && (
                            <p className="text-xs text-gray-500">
                              Estimated: {requirement.estimatedHours} hours
                            </p>
                          )}
                        </div>

                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>

                      {requirement.dependencies.length > 0 && (
                        <div className="text-xs text-gray-500">
                          Dependencies: {requirement.dependencies.join(', ')}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        ))}

        {/* Custom Requests */}
        <div className="mt-8">
          <label className="block text-lg font-semibold text-gray-900 mb-4">
            Additional Custom Requirements
          </label>
          <textarea
            value={customRequests}
            onChange={(e) => onCustomRequestsChange(e.target.value)}
            placeholder="Describe any specific custom requirements, integrations, or features your organization needs..."
            rows={6}
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back to Requirements
        </button>
        <button
          onClick={onNext}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          View Pricing & ROI
        </button>
      </div>
    </div>
  );
}

// ROI Calculator Component
interface ROICalculatorProps {
  pricing: ROIProjection;
  selectedRequirements: QuoteRequirement[];
  businessRequirements: Partial<BusinessRequirement>;
  formatCurrency: (amount: number) => string;
  onBack: () => void;
  onNext: () => void;
}

function ROICalculator({
  pricing,
  selectedRequirements,
  businessRequirements,
  formatCurrency,
  onBack,
  onNext
}: ROICalculatorProps) {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Investment & ROI Analysis</h3>

        {/* Investment Summary */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-blue-900 mb-2">Implementation Cost</h4>
            <p className="text-3xl font-bold text-blue-600">{formatCurrency(pricing.implementation)}</p>
            <p className="text-sm text-blue-700 mt-2">One-time investment</p>
          </div>

          <div className="bg-green-50 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-green-900 mb-2">Annual Savings</h4>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(pricing.savings.annual)}</p>
            <p className="text-sm text-green-700 mt-2">Recurring annual benefit</p>
          </div>

          <div className="bg-purple-50 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-purple-900 mb-2">Payback Period</h4>
            <p className="text-3xl font-bold text-purple-600">
              {pricing.paybackPeriod.toFixed(1)} years
            </p>
            <p className="text-sm text-purple-700 mt-2">Time to break even</p>
          </div>
        </div>

        {/* ROI Details */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">3-Year ROI Projection</h4>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h5 className="font-medium text-gray-900 mb-3">Investment Breakdown</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Implementation:</span>
                  <span className="font-medium">{formatCurrency(pricing.implementation)}</span>
                </div>
                <div className="flex justify-between">
                  <span>3-Year Maintenance:</span>
                  <span className="font-medium">{formatCurrency(pricing.maintenance * 3)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">Total Investment:</span>
                  <span className="font-semibold">{formatCurrency(pricing.implementation + (pricing.maintenance * 3))}</span>
                </div>
              </div>
            </div>

            <div>
              <h5 className="font-medium text-gray-900 mb-3">3-Year Returns</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Cost Savings:</span>
                  <span className="font-medium">{formatCurrency(pricing.savings.costReduction * 3)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Efficiency Gains:</span>
                  <span className="font-medium">{formatCurrency(pricing.savings.efficiency * 3)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Additional Savings:</span>
                  <span className="font-medium">{formatCurrency((pricing.savings.annual - pricing.savings.efficiency - pricing.savings.costReduction) * 3)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">Total Returns:</span>
                  <span className="font-semibold">{formatCurrency(pricing.savings.annual * 3)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-green-100 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-green-900">3-Year ROI:</span>
              <span className="text-2xl font-bold text-green-600">
                {(pricing.roi3Year * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Net Profit: {formatCurrency((pricing.savings.annual * 3) - pricing.implementation - (pricing.maintenance * 3))}
            </p>
          </div>
        </div>

        {/* Selected Requirements Summary */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Selected Requirements ({selectedRequirements.length})
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            {selectedRequirements.map((req) => (
              <div key={req.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">{req.name}</span>
                <span className="text-sm text-gray-600">
                  {req.estimatedHours > 0 ? `${req.estimatedHours}h` : 'Service'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back to Customization
        </button>
        <button
          onClick={onNext}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Review & Submit
        </button>
      </div>
    </div>
  );
}

// Quote Review Component
interface QuoteReviewProps {
  state: QuoteBuilderState;
  pricing: ROIProjection;
  formatCurrency: (amount: number) => string;
  onContactInfoChange: (contactInfo: QuoteBuilderState['contactInfo']) => void;
  onBack: () => void;
  onSubmit: () => void;
}

function QuoteReview({
  state,
  pricing,
  formatCurrency,
  onContactInfoChange,
  onBack,
  onSubmit
}: QuoteReviewProps) {
  const isContactInfoComplete = state.contactInfo.name && state.contactInfo.email && state.contactInfo.company;

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Quote Review & Contact Information</h3>

        {/* Contact Information Form */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Full Name *"
              value={state.contactInfo.name}
              onChange={(e) => onContactInfoChange({ ...state.contactInfo, name: e.target.value })}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="email"
              placeholder="Email Address *"
              value={state.contactInfo.email}
              onChange={(e) => onContactInfoChange({ ...state.contactInfo, email: e.target.value })}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Company Name *"
              value={state.contactInfo.company}
              onChange={(e) => onContactInfoChange({ ...state.contactInfo, company: e.target.value })}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Job Title"
              value={state.contactInfo.title}
              onChange={(e) => onContactInfoChange({ ...state.contactInfo, title: e.target.value })}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={state.contactInfo.phone}
              onChange={(e) => onContactInfoChange({ ...state.contactInfo, phone: e.target.value })}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent md:col-span-2"
            />
          </div>
        </div>

        {/* Quote Summary */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Enterprise Quote Summary</h4>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Business Requirements</h5>
              <div className="text-sm space-y-1">
                <p>Industry: {state.businessRequirements.industry}</p>
                <p>Company Size: {state.businessRequirements.companySize}</p>
                <p>Users: {state.businessRequirements.userCount?.toLocaleString()}</p>
                <p>Deployment: {state.businessRequirements.deploymentPreference}</p>
                <p>Timeline: {state.businessRequirements.timeline}</p>
              </div>
            </div>

            <div>
              <h5 className="font-medium text-gray-900 mb-2">Investment Summary</h5>
              <div className="text-sm space-y-1">
                <p>Implementation: {formatCurrency(pricing.implementation)}</p>
                <p>Annual Maintenance: {formatCurrency(pricing.maintenance)}</p>
                <p>3-Year ROI: {(pricing.roi3Year * 100).toFixed(0)}%</p>
                <p>Payback Period: {pricing.paybackPeriod.toFixed(1)} years</p>
                <p className="font-semibold text-green-600">
                  Annual Savings: {formatCurrency(pricing.savings.annual)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Selected Requirements: {state.selectedRequirements.length} custom features
            </p>
            {state.customRequests && (
              <p className="text-sm text-gray-600 mt-1">
                Additional custom requirements specified
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back to Pricing
        </button>
        <button
          onClick={onSubmit}
          disabled={!isContactInfoComplete}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Submit Enterprise Quote Request
        </button>
      </div>
    </div>
  );
}