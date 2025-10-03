'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProtectedTestPage from '@/components/ProtectedTestPage';
import BusinessAutomationDashboard from '@/components/BusinessAutomationDashboard';
import { initAnalytics, trackEvent } from '@/lib/analytics';

function AutomationContent() {
  const [userRole, setUserRole] = useState<'admin' | 'sales' | 'customer_success' | 'marketing'>('admin');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize analytics and track page view
    initAnalytics({
      page: 'business_automation_dashboard',
      user_type: 'enterprise',
      feature: 'ai_automation'
    });

    trackEvent({
      action: 'automation_dashboard_accessed',
      category: 'business_automation',
      label: 'dashboard_view',
      custom_parameters: {
        user_role: userRole,
        timestamp: new Date().toISOString()
      }
    });

    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000);
  }, [userRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Initializing AI Systems</h2>
          <p className="text-gray-600">Loading business automation dashboard...</p>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-500">AI Recommendation Engine</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <span className="text-sm text-gray-500">Customer Success Automation</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              <span className="text-sm text-gray-500">Sales Intelligence</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 text-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl font-bold mb-4"
            >
              🤖 AI Business Automation Platform
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto"
            >
              Self-sustaining premium business platform powered by advanced AI automation,
              intelligent recommendations, and predictive analytics
            </motion.p>

            {/* Feature Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div className="text-3xl mb-3">🧠</div>
                <h3 className="font-semibold mb-2">AI Recommendation Engine</h3>
                <p className="text-sm text-blue-100">Intelligent product suggestions and enterprise needs assessment</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="font-semibold mb-2">Customer Success Automation</h3>
                <p className="text-sm text-blue-100">Automated onboarding, usage analysis, and churn prevention</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div className="text-3xl mb-3">📈</div>
                <h3 className="font-semibold mb-2">Sales Intelligence</h3>
                <p className="text-sm text-blue-100">Lead scoring, pipeline management, and conversion optimization</p>
              </div>
            </motion.div>

            {/* Role Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8"
            >
              <p className="text-blue-100 mb-4">Select your role to customize the dashboard:</p>
              <div className="flex justify-center gap-4">
                {[
                  { role: 'admin', label: 'Admin', icon: '👑' },
                  { role: 'sales', label: 'Sales', icon: '💼' },
                  { role: 'customer_success', label: 'Customer Success', icon: '🎯' },
                  { role: 'marketing', label: 'Marketing', icon: '📊' }
                ].map((item) => (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => setUserRole(item.role as typeof userRole)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      userRole === item.role
                        ? 'bg-white text-blue-900'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Dashboard Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <BusinessAutomationDashboard
          userId="demo_user"
          userRole={userRole}
        />
      </motion.div>

      {/* Feature Showcase */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="bg-white py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Complete Business Automation Systems
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transform your business with AI-powered automation that works 24/7 to grow revenue,
              retain customers, and optimize operations
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* AI Recommendation Engine */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">AI Recommendation Engine</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Intelligent product suggestions based on user behavior</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Enterprise needs assessment and solution mapping</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Custom solution recommendations with ROI analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Industry-specific pattern recognition</span>
                </li>
              </ul>
              <div className="mt-6 p-4 bg-blue-100 rounded-lg">
                <p className="text-sm font-medium text-blue-900">Performance Impact</p>
                <p className="text-2xl font-bold text-blue-600">87.5% accuracy</p>
                <p className="text-sm text-blue-700">$3.2M revenue generated</p>
              </div>
            </div>

            {/* Customer Success Automation */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Customer Success Automation</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Automated onboarding workflows</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Real-time usage pattern analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Proactive upselling opportunity detection</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>AI-powered churn prevention system</span>
                </li>
              </ul>
              <div className="mt-6 p-4 bg-green-100 rounded-lg">
                <p className="text-sm font-medium text-green-900">Retention Impact</p>
                <p className="text-2xl font-bold text-green-600">95.8% retention</p>
                <p className="text-sm text-green-700">$2.4M upsell pipeline</p>
              </div>
            </div>

            {/* Sales Intelligence */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Sales Intelligence</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>AI lead scoring and qualification</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Opportunity tracking and pipeline management</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Revenue forecasting and predictions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Conversion optimization algorithms</span>
                </li>
              </ul>
              <div className="mt-6 p-4 bg-purple-100 rounded-lg">
                <p className="text-sm font-medium text-purple-900">Pipeline Impact</p>
                <p className="text-2xl font-bold text-purple-600">$8.5M pipeline</p>
                <p className="text-sm text-purple-700">28.5% conversion rate</p>
              </div>
            </div>
          </div>

          {/* ROI Metrics */}
          <div className="mt-16 bg-gradient-to-r from-gray-900 to-blue-900 rounded-xl p-8 text-white">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Automation ROI Impact</h3>
              <p className="text-blue-100">Measurable business results from AI automation</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-400">340%</p>
                <p className="text-blue-100">Revenue Growth</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-400">75%</p>
                <p className="text-blue-100">Time Saved</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-400">95%</p>
                <p className="text-blue-100">Customer Retention</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-400">$12.5M</p>
                <p className="text-blue-100">Annual Revenue</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function AutomationPage() {
  return (
    <ProtectedTestPage>
      <AutomationContent />
    </ProtectedTestPage>
  );
}