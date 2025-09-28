'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { RecommendationResult } from '@/lib/ai-recommendation-engine';
import type { CustomerJourney, UpsellOpportunity, ChurnRiskAssessment } from '@/lib/customer-success-automation';
import type { Lead, Opportunity, PipelineMetrics } from '@/lib/sales-intelligence';

interface BusinessAutomationDashboardProps {
  userId?: string;
  userRole: 'admin' | 'sales' | 'customer_success' | 'marketing';
}

interface DashboardMetrics {
  revenue: {
    current: number;
    target: number;
    growth: number;
    forecast: number;
  };
  pipeline: {
    totalValue: number;
    weightedValue: number;
    deals: number;
    conversionRate: number;
  };
  customers: {
    total: number;
    active: number;
    atRisk: number;
    churnRate: number;
  };
  automation: {
    leadsScored: number;
    opportunitiesCreated: number;
    upsellsDetected: number;
    retentionActions: number;
  };
}

export default function BusinessAutomationDashboard({ userId, userRole }: BusinessAutomationDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'customer_success' | 'recommendations'>('overview');
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    revenue: { current: 12500000, target: 15000000, growth: 34.5, forecast: 16800000 },
    pipeline: { totalValue: 8500000, weightedValue: 4200000, deals: 156, conversionRate: 28.5 },
    customers: { total: 847, active: 783, atRisk: 42, churnRate: 4.2 },
    automation: { leadsScored: 2847, opportunitiesCreated: 156, upsellsDetected: 89, retentionActions: 23 }
  });

  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [topOpportunities, setTopOpportunities] = useState<Opportunity[]>([]);
  const [atRiskCustomers, setAtRiskCustomers] = useState<ChurnRiskAssessment[]>([]);
  const [upsellOpportunities, setUpsellOpportunities] = useState<UpsellOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [userId, userRole]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Simulate API calls to various automation systems
      await Promise.all([
        loadRecommendations(),
        loadSalesData(),
        loadCustomerSuccessData(),
        loadAutomationMetrics()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecommendations = async () => {
    // Mock AI recommendations
    const mockRecommendations: RecommendationResult[] = [
      {
        productId: 'enterprise-ai-platform',
        product: {
          id: 'enterprise-ai-platform',
          title: 'Enterprise AI Analytics Platform',
          handle: 'enterprise-ai-platform',
          description: 'Advanced AI-powered analytics for Fortune 500 companies',
          descriptionHtml: '<p>Advanced AI-powered analytics</p>',
          availableForSale: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          publishedAt: '2024-01-01T00:00:00Z',
          vendor: 'Afilo Technologies',
          productType: 'Enterprise Software',
          tags: ['ai', 'analytics', 'enterprise'],
          priceRange: { minVariantPrice: { amount: '2999.00', currencyCode: 'USD' }, maxVariantPrice: { amount: '9999.00', currencyCode: 'USD' } },
          variants: { edges: [] },
          images: { edges: [] },
          options: [],
          featuredImage: null,
          seo: { title: 'Enterprise AI Platform', description: 'AI analytics platform' }
        },
        score: 0.92,
        reasoning: ['Perfect match for enterprise clients', 'High ROI potential', 'Strong market demand'],
        confidence: 0.95,
        category: 'perfect_match',
        estimatedValue: 250000,
        priority: 'high'
      }
    ];
    setRecommendations(mockRecommendations);
  };

  const loadSalesData = async () => {
    // Mock sales opportunities
    const mockOpportunities: Opportunity[] = [
      {
        id: 'opp_1',
        leadId: 'lead_1',
        accountName: 'Fortune 500 Corp',
        stage: 'proposal',
        probability: 75,
        estimatedValue: 500000,
        expectedCloseDate: new Date('2024-12-15'),
        products: ['enterprise-ai-platform'],
        competitors: ['competitor-a'],
        salesRep: 'john_doe',
        activities: [],
        documents: [],
        stakeholders: [],
        nextSteps: ['Finalize technical requirements', 'Schedule C-level presentation'],
        riskFactors: ['Budget approval pending'],
        timeline: []
      }
    ];
    setTopOpportunities(mockOpportunities);
  };

  const loadCustomerSuccessData = async () => {
    // Mock at-risk customers
    const mockAtRisk: ChurnRiskAssessment[] = [
      {
        customerId: 'customer_1',
        riskScore: 78,
        riskLevel: 'high',
        primaryFactors: ['usage_decline', 'support_tickets'],
        warnings: [],
        recommendations: ['Schedule executive intervention call', 'Provide enhanced technical support'],
        interventions: [],
        timeline: '30-60 days'
      }
    ];
    setAtRiskCustomers(mockAtRisk);

    // Mock upsell opportunities
    const mockUpsells: UpsellOpportunity[] = [
      {
        customerId: 'customer_2',
        type: 'capacity_upgrade',
        confidence: 0.85,
        estimatedValue: 150000,
        timeline: '30-45 days',
        triggers: ['High user count', 'Approaching user limits'],
        reasoning: ['Currently using 95% of user capacity', 'Growth trend indicates need for additional users'],
        nextActions: ['Schedule capacity planning call', 'Prepare upgrade proposal'],
        priority: 'high'
      }
    ];
    setUpsellOpportunities(mockUpsells);
  };

  const loadAutomationMetrics = async () => {
    // Automation metrics are already in state
    // This would typically fetch real-time metrics
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'sales', name: 'Sales Intelligence', icon: '💼' },
    { id: 'customer_success', name: 'Customer Success', icon: '🎯' },
    { id: 'recommendations', name: 'AI Recommendations', icon: '🤖' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading automation dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Business Automation Dashboard</h1>
              <p className="text-gray-600 mt-1">AI-powered business intelligence and automation platform</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                🟢 All Systems Operational
              </div>
              <button
                type="button"
                onClick={loadDashboardData}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Annual Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">${(metrics.revenue.current / 1000000).toFixed(1)}M</p>
                    <p className="text-sm text-green-600">+{metrics.revenue.growth}% growth</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <span className="text-2xl">💰</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pipeline Value</p>
                    <p className="text-2xl font-bold text-gray-900">${(metrics.pipeline.totalValue / 1000000).toFixed(1)}M</p>
                    <p className="text-sm text-blue-600">{metrics.pipeline.deals} active deals</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <span className="text-2xl">📈</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Customers</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.customers.active}</p>
                    <p className="text-sm text-red-600">{metrics.customers.atRisk} at risk</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <span className="text-2xl">👥</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Automation Actions</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.automation.leadsScored + metrics.automation.opportunitiesCreated + metrics.automation.upsellsDetected + metrics.automation.retentionActions}</p>
                    <p className="text-sm text-green-600">Last 30 days</p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <span className="text-2xl">🤖</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Automation Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Automation Summary</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Leads Scored</span>
                    <span className="font-semibold">{metrics.automation.leadsScored}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Opportunities Created</span>
                    <span className="font-semibold">{metrics.automation.opportunitiesCreated}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Upsells Detected</span>
                    <span className="font-semibold">{metrics.automation.upsellsDetected}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Retention Actions</span>
                    <span className="font-semibold">{metrics.automation.retentionActions}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Highlights</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Conversion Rate</span>
                      <span className="font-semibold">{metrics.pipeline.conversionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${metrics.pipeline.conversionRate}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Customer Health</span>
                      <span className="font-semibold">{((metrics.customers.active / metrics.customers.total) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: `${(metrics.customers.active / metrics.customers.total) * 100}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Revenue Target</span>
                      <span className="font-semibold">{((metrics.revenue.current / metrics.revenue.target) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${(metrics.revenue.current / metrics.revenue.target) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Alerts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent AI Alerts & Actions</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                  <span className="text-red-600">🚨</span>
                  <div>
                    <p className="font-medium text-red-900">High churn risk detected for Fortune 500 Corp</p>
                    <p className="text-sm text-red-700">Automatic retention campaign triggered • 15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <span className="text-green-600">✅</span>
                  <div>
                    <p className="font-medium text-green-900">Upsell opportunity identified: TechCorp Inc</p>
                    <p className="text-sm text-green-700">$150K capacity upgrade potential • 1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-600">🎯</span>
                  <div>
                    <p className="font-medium text-blue-900">Hot lead scored: Global Manufacturing Solutions</p>
                    <p className="text-sm text-blue-700">Score: 95/100 • Auto-assigned to enterprise sales • 2 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'sales' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Sales Pipeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Sales Pipeline Intelligence</h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Pipeline Stages</h4>
                  <div className="space-y-4">
                    {[
                      { stage: 'Discovery', count: 45, value: 2800000, color: 'bg-blue-500' },
                      { stage: 'Qualification', count: 32, value: 2100000, color: 'bg-green-500' },
                      { stage: 'Proposal', count: 23, value: 1900000, color: 'bg-yellow-500' },
                      { stage: 'Negotiation', count: 12, value: 1200000, color: 'bg-purple-500' },
                      { stage: 'Closed Won', count: 8, value: 500000, color: 'bg-emerald-500' }
                    ].map((item) => (
                      <div key={item.stage} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                          <span className="font-medium text-gray-900">{item.stage}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{item.count} deals</p>
                          <p className="text-sm text-gray-600">${(item.value / 1000000).toFixed(1)}M</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Top Opportunities</h4>
                  <div className="space-y-3">
                    {topOpportunities.map((opp) => (
                      <div key={opp.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-900">{opp.accountName}</h5>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                            {opp.probability}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          ${opp.estimatedValue.toLocaleString()} • {opp.stage}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Close: {opp.expectedCloseDate.toLocaleDateString()}</span>
                          <span>Rep: {opp.salesRep}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Lead Scoring */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Lead Scoring</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-red-100 p-4 rounded-lg mb-3">
                    <span className="text-3xl">🔥</span>
                  </div>
                  <h4 className="font-semibold text-gray-900">Hot Leads</h4>
                  <p className="text-2xl font-bold text-red-600">47</p>
                  <p className="text-sm text-gray-600">Score: 80-100</p>
                </div>
                <div className="text-center">
                  <div className="bg-yellow-100 p-4 rounded-lg mb-3">
                    <span className="text-3xl">⚡</span>
                  </div>
                  <h4 className="font-semibold text-gray-900">Warm Leads</h4>
                  <p className="text-2xl font-bold text-yellow-600">156</p>
                  <p className="text-sm text-gray-600">Score: 60-79</p>
                </div>
                <div className="text-center">
                  <div className="bg-blue-100 p-4 rounded-lg mb-3">
                    <span className="text-3xl">❄️</span>
                  </div>
                  <h4 className="font-semibold text-gray-900">Cold Leads</h4>
                  <p className="text-2xl font-bold text-blue-600">394</p>
                  <p className="text-sm text-gray-600">Score: 0-59</p>
                </div>
              </div>
            </div>

            {/* Conversion Analytics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Optimization</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">Discovery → Qualification</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Current: 65%</span>
                    <span className="text-sm text-green-600">Target: 70%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="font-medium text-gray-900">Qualification → Proposal</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Current: 35%</span>
                    <span className="text-sm text-red-600">Target: 50%</span>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">⚠️ Bottleneck</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">Proposal → Negotiation</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Current: 60%</span>
                    <span className="text-sm text-green-600">Target: 65%</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'customer_success' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Customer Health Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Customer Health</h3>
                  <span className="text-2xl">❤️</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-green-600">Healthy</span>
                    <span className="font-semibold">741</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-yellow-600">At Risk</span>
                    <span className="font-semibold">42</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-red-600">Critical</span>
                    <span className="font-semibold">12</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Onboarding</h3>
                  <span className="text-2xl">🚀</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-600">In Progress</span>
                    <span className="font-semibold">23</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-green-600">Completed</span>
                    <span className="font-semibold">156</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-red-600">Blocked</span>
                    <span className="font-semibold">3</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Upsell Pipeline</h3>
                  <span className="text-2xl">📈</span>
                </div>
                <div className="space-y-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">$2.4M</p>
                    <p className="text-sm text-gray-600">Identified Opportunities</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-blue-600">89</p>
                    <p className="text-sm text-gray-600">Active Opportunities</p>
                  </div>
                </div>
              </div>
            </div>

            {/* At-Risk Customers */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">High-Risk Customers</h3>
              <div className="space-y-4">
                {atRiskCustomers.map((customer) => (
                  <div key={customer.customerId} className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Customer ID: {customer.customerId}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          customer.riskLevel === 'critical' ? 'bg-red-100 text-red-800' :
                          customer.riskLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {customer.riskLevel.toUpperCase()}
                        </span>
                        <span className="text-lg font-bold text-red-600">{customer.riskScore}/100</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Risk Factors:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {customer.primaryFactors.map((factor, index) => (
                            <li key={index}>• {factor.replace('_', ' ')}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Recommended Actions:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {customer.recommendations.slice(0, 2).map((rec, index) => (
                            <li key={index}>• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-600">
                      Estimated churn timeline: <span className="font-medium">{customer.timeline}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upsell Opportunities */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upsell Opportunities</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {upsellOpportunities.map((opportunity) => (
                  <div key={opportunity.customerId} className="p-4 border border-green-200 rounded-lg bg-green-50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Customer: {opportunity.customerId}</h4>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        {Math.round(opportunity.confidence * 100)}% Confidence
                      </span>
                    </div>
                    <div className="mb-3">
                      <p className="text-lg font-bold text-green-600">${opportunity.estimatedValue.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">{opportunity.type.replace('_', ' ')} • {opportunity.timeline}</p>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Triggers:</p>
                        <ul className="text-sm text-gray-600">
                          {opportunity.triggers.map((trigger, index) => (
                            <li key={index}>• {trigger}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Next Actions:</p>
                        <ul className="text-sm text-gray-600">
                          {opportunity.nextActions.slice(0, 2).map((action, index) => (
                            <li key={index}>• {action}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'recommendations' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* AI Recommendations */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">AI Product Recommendations</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {recommendations.map((rec) => (
                  <div key={rec.productId} className="p-6 border border-blue-200 rounded-lg bg-blue-50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">{rec.product.title}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          rec.category === 'perfect_match' ? 'bg-green-100 text-green-800' :
                          rec.category === 'high_potential' ? 'bg-blue-100 text-blue-800' :
                          rec.category === 'complementary' ? 'bg-purple-100 text-purple-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {rec.category.replace('_', ' ')}
                        </span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                          {Math.round(rec.score * 100)}/100
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4">{rec.product.description}</p>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Why recommended:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {rec.reasoning.map((reason, index) => (
                            <li key={index}>• {reason}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Estimated Value</p>
                          <p className="font-semibold text-green-600">${rec.estimatedValue.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Priority</p>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                            rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {rec.priority.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Confidence</p>
                          <p className="font-semibold text-blue-600">{Math.round(rec.confidence * 100)}%</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <button
                        type="button"
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Create Opportunity
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendation Performance */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendation Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-green-100 p-4 rounded-lg mb-3">
                    <span className="text-3xl">🎯</span>
                  </div>
                  <h4 className="font-semibold text-gray-900">Accuracy Rate</h4>
                  <p className="text-2xl font-bold text-green-600">87.5%</p>
                  <p className="text-sm text-gray-600">Last 30 days</p>
                </div>
                <div className="text-center">
                  <div className="bg-blue-100 p-4 rounded-lg mb-3">
                    <span className="text-3xl">💰</span>
                  </div>
                  <h4 className="font-semibold text-gray-900">Revenue Impact</h4>
                  <p className="text-2xl font-bold text-blue-600">$3.2M</p>
                  <p className="text-sm text-gray-600">Generated this quarter</p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 p-4 rounded-lg mb-3">
                    <span className="text-3xl">⚡</span>
                  </div>
                  <h4 className="font-semibold text-gray-900">Time Saved</h4>
                  <p className="text-2xl font-bold text-purple-600">1,240</p>
                  <p className="text-sm text-gray-600">Hours automated</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}