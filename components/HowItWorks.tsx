'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Calendar,
  Presentation,
  Rocket,
  Building2,
  TrendingUp
} from 'lucide-react';

interface ProcessStep {
  id: string;
  step: number;
  title: string;
  description: string;
  duration: string;
  icon: React.ComponentType<{ className?: string }>;
  details: string[];
  color: string;
}

const processSteps: ProcessStep[] = [
  {
    id: 'discovery',
    step: 1,
    title: 'Discovery Call',
    description: 'Schedule a 30-minute consultation with our enterprise team to understand your unique requirements',
    duration: '30 minutes',
    icon: Calendar,
    details: [
      'Assess current infrastructure and pain points',
      'Identify key stakeholders and decision makers',
      'Discuss compliance and security requirements',
      'Outline preliminary solution architecture'
    ],
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'demo',
    step: 2,
    title: 'Custom Demo',
    description: 'See the platform configured for your specific use case with real-world scenarios',
    duration: '1-2 hours',
    icon: Presentation,
    details: [
      'Tailored demonstration of relevant features',
      'Live walkthrough with your sample data',
      'Q&A session with technical architects',
      'ROI projection and cost-benefit analysis'
    ],
    color: 'from-purple-500 to-indigo-500'
  },
  {
    id: 'pilot',
    step: 3,
    title: 'Subscribe & Onboard',
    description: 'Subscribe and begin immediate onboarding with dedicated support (30-day money-back guarantee)',
    duration: 'Day 1',
    icon: Rocket,
    details: [
      'Immediate access to all platform features',
      'Dedicated onboarding and training sessions',
      'Hands-on implementation assistance',
      'Real-time support and guidance',
      '30-day money-back guarantee for risk-free evaluation'
    ],
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'deployment',
    step: 4,
    title: 'Full Deployment',
    description: 'Enterprise rollout with dedicated implementation team and comprehensive training',
    duration: '2-6 months',
    icon: Building2,
    details: [
      'Phased rollout across departments',
      'Data migration and system integration',
      'Custom configuration and workflows',
      'Comprehensive employee training program'
    ],
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'success',
    step: 5,
    title: 'Ongoing Success',
    description: '24/7 support, quarterly business reviews, and continuous optimization',
    duration: 'Continuous',
    icon: TrendingUp,
    details: [
      'Dedicated Customer Success Manager',
      'Quarterly executive business reviews',
      'Proactive performance monitoring',
      'Priority technical support and updates'
    ],
    color: 'from-pink-500 to-purple-500'
  }
];

export default function HowItWorks() {
  return (
    <section className="bg-gradient-to-br from-gray-50 to-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Your Enterprise Journey
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From discovery to deployment, we guide you every step of the way with white-glove service
          </p>
        </motion.div>

        {/* Desktop Timeline (Horizontal) */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200" />

            {/* Steps */}
            <div className="grid grid-cols-5 gap-4">
              {processSteps.map((step, index) => {
                const IconComponent = step.icon;

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.15 }}
                    className="relative"
                  >
                    {/* Step Number Circle */}
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`relative z-10 w-48 h-48 mx-auto mb-8 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-2xl`}
                    >
                      <div className="text-center">
                        <div className="text-white text-6xl font-bold mb-2">{step.step}</div>
                        <IconComponent className="w-12 h-12 text-white mx-auto" />
                      </div>

                      {/* Pulse Animation */}
                      <motion.div
                        className={`absolute inset-0 rounded-full bg-gradient-to-br ${step.color} opacity-30`}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.4 }}
                      />
                    </motion.div>

                    {/* Step Content Card */}
                    <motion.div
                      whileHover={{ y: -5, scale: 1.02 }}
                      className="backdrop-blur-xl bg-white/90 border border-gray-200/50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300"
                    >
                      <div className="space-y-4">
                        {/* Title & Duration */}
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {step.title}
                          </h3>
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-600">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {step.duration}
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {step.description}
                        </p>

                        {/* Details List */}
                        <ul className="space-y-2">
                          {step.details.map((detail, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                              <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 bg-gradient-to-br ${step.color} bg-clip-text text-transparent`} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="flex-1">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Timeline (Vertical) */}
        <div className="lg:hidden space-y-8">
          {processSteps.map((step, index) => {
            const IconComponent = step.icon;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                {/* Connection Line (Mobile) */}
                {index < processSteps.length - 1 && (
                  <div className="absolute left-12 top-28 bottom-0 w-1 bg-gradient-to-b from-blue-200 to-purple-200 -z-10" />
                )}

                <div className="flex gap-6">
                  {/* Step Circle */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={`flex-shrink-0 w-24 h-24 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-xl`}
                  >
                    <div className="text-center">
                      <div className="text-white text-3xl font-bold">{step.step}</div>
                      <IconComponent className="w-6 h-6 text-white mx-auto" />
                    </div>
                  </motion.div>

                  {/* Content Card */}
                  <div className="flex-1 backdrop-blur-xl bg-white/90 border border-gray-200/50 rounded-2xl p-6 shadow-lg">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          {step.title}
                        </h3>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-600">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {step.duration}
                        </div>
                      </div>

                      <p className="text-gray-600 leading-relaxed">
                        {step.description}
                      </p>

                      <ul className="space-y-2">
                        {step.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                            <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="flex-1">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-20"
        >
          <div className="backdrop-blur-xl bg-gradient-to-br from-blue-50/80 to-purple-50/80 border border-blue-200/50 rounded-3xl p-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Start Your Enterprise Journey?
            </h3>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join 500+ Fortune 500 companies already using Afilo. Schedule your discovery call today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/enterprise"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105"
              >
                Schedule Enterprise Demo
                <Calendar className="w-5 h-5" />
              </Link>

              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 backdrop-blur-xl bg-white/80 border-2 border-gray-300 text-gray-900 font-bold rounded-2xl hover:bg-white hover:border-blue-600 transition-all duration-300"
              >
                View Pricing
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                30-day pilot available
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Dedicated CSM
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
