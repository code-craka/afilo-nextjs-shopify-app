'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Shield,
  Zap,
  BarChart3,
  Brain,
  Plug,
  Headphones
} from 'lucide-react';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  link: string;
  gradient: string;
}

const features: Feature[] = [
  {
    id: 'security',
    title: 'Enterprise-Grade Security',
    description: 'SOC 2 Type II, ISO 27001, and FedRAMP authorized. Military-grade AES-256 encryption protects your data at rest and in transit with zero-trust architecture.',
    icon: Shield,
    link: '/enterprise#security',
    gradient: 'from-red-500 to-pink-500'
  },
  {
    id: 'infrastructure',
    title: 'Scalable Infrastructure',
    description: 'Auto-scaling cloud architecture handles 10M+ requests/second. 99.99% uptime SLA with multi-region disaster recovery and zero-downtime deployments.',
    icon: Zap,
    link: '/enterprise#infrastructure',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'analytics',
    title: 'Advanced Analytics',
    description: 'Real-time dashboards with custom reports and predictive insights. Comprehensive observability across all systems with automated anomaly detection.',
    icon: BarChart3,
    link: '/enterprise#analytics',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    id: 'ai',
    title: 'AI-Powered Automation',
    description: 'Intelligent workflows with predictive insights. Machine learning algorithms optimize performance, detect threats, and automate complex business processes.',
    icon: Brain,
    link: '/enterprise#ai',
    gradient: 'from-purple-500 to-indigo-500'
  },
  {
    id: 'integration',
    title: 'Seamless Integration',
    description: 'Connect with 500+ enterprise systems through pre-built connectors. RESTful & GraphQL APIs, webhooks, SSO, and real-time data synchronization.',
    icon: Plug,
    link: '/enterprise#integrations',
    gradient: 'from-orange-500 to-yellow-500'
  },
  {
    id: 'support',
    title: '24/7 Enterprise Support',
    description: 'Dedicated Customer Success Manager with priority response times. Expert technical support, quarterly business reviews, and hands-on implementation assistance.',
    icon: Headphones,
    link: '/enterprise#support',
    gradient: 'from-teal-500 to-cyan-500'
  }
];

export default function FeatureHighlights() {
  return (
    <section className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Enterprise Capabilities That Scale
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            World-class infrastructure, security, and intelligence trusted by Fortune 500 companies
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;

            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative"
              >
                {/* Glassmorphic Card */}
                <div className="relative backdrop-blur-xl bg-white/80 border border-gray-200/50 rounded-3xl p-8 h-full transition-all duration-500 hover:shadow-2xl hover:border-blue-200">
                  {/* Glow Effect on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl blur-xl`} />

                  {/* Content */}
                  <div className="relative z-10 space-y-6">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Learn More Link */}
                    <Link
                      href={feature.link}
                      className={`inline-flex items-center gap-2 text-sm font-semibold bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent group-hover:gap-3 transition-all`}
                    >
                      Learn More
                      <svg
                        className="w-4 h-4 text-gray-600 group-hover:text-blue-600 transition-colors"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>

                  {/* Corner Accent */}
                  <motion.div
                    className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-5 rounded-3xl`}
                    animate={{ rotate: [0, 90, 0] }}
                    transition={{ duration: 10, repeat: Infinity, delay: index * 0.5 }}
                  />
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
          className="text-center mt-16"
        >
          <Link
            href="/enterprise"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105"
          >
            Explore All Enterprise Features
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
