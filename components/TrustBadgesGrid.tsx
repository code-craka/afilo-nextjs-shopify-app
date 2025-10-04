'use client';

import { motion } from 'framer-motion';
import { Shield, Award, Lock, Cloud, CheckCircle2, Zap } from 'lucide-react';

interface TrustBadge {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  category: 'security' | 'compliance' | 'infrastructure' | 'industry';
  color: string;
}

const trustBadges: TrustBadge[] = [
  {
    id: 'soc2',
    icon: Shield,
    title: 'SOC 2 Type II',
    subtitle: 'Certified',
    category: 'security',
    color: 'from-red-500 to-pink-500'
  },
  {
    id: 'iso27001',
    icon: Lock,
    title: 'ISO 27001',
    subtitle: 'Compliant',
    category: 'security',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'hipaa',
    icon: CheckCircle2,
    title: 'HIPAA',
    subtitle: 'Ready',
    category: 'compliance',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'fedramp',
    icon: Award,
    title: 'FedRAMP',
    subtitle: 'Authorized',
    category: 'compliance',
    color: 'from-purple-500 to-indigo-500'
  },
  {
    id: 'pci',
    icon: Shield,
    title: 'PCI DSS Level 1',
    subtitle: 'Certified',
    category: 'security',
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'gdpr',
    icon: Lock,
    title: 'GDPR-Ready',
    subtitle: 'For Non-EU Clients',
    category: 'compliance',
    color: 'from-teal-500 to-cyan-500'
  },
  {
    id: 'aws',
    icon: Cloud,
    title: 'AWS Certified',
    subtitle: 'Infrastructure',
    category: 'infrastructure',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    id: 'uptime',
    icon: Zap,
    title: '99.99% SLA',
    subtitle: 'Uptime Guarantee',
    category: 'infrastructure',
    color: 'from-pink-500 to-rose-500'
  }
];

const categories = [
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'compliance', label: 'Compliance', icon: CheckCircle2 },
  { id: 'infrastructure', label: 'Infrastructure', icon: Cloud },
  { id: 'industry', label: 'Industry Recognition', icon: Award }
];

export default function TrustBadgesGrid() {
  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Enterprise-Grade Security You Can Trust
          </h3>
          <p className="text-lg text-gray-600">
            Certified, compliant, and battle-tested by Fortune 500 companies
          </p>
        </motion.div>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {trustBadges.map((badge, index) => {
            const IconComponent = badge.icon;

            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                whileHover={{ y: -5, scale: 1.03 }}
                className="relative group"
              >
                {/* Card */}
                <div className="backdrop-blur-xl bg-gray-50/80 border border-gray-200/50 rounded-2xl p-6 h-full flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl hover:border-blue-200">
                  {/* Glow Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${badge.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl blur-xl`} />

                  {/* Icon */}
                  <div className={`relative z-10 w-16 h-16 rounded-xl bg-gradient-to-br ${badge.color} flex items-center justify-center mb-4 shadow-lg transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>

                  {/* Title */}
                  <h4 className="relative z-10 text-lg font-bold text-gray-900 mb-1">
                    {badge.title}
                  </h4>

                  {/* Subtitle */}
                  <p className={`relative z-10 text-sm font-medium bg-gradient-to-r ${badge.color} bg-clip-text text-transparent`}>
                    {badge.subtitle}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Subtext */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-gray-600 text-sm mb-4">
            🔒 Military-grade AES-256 encryption • 🛡️ Zero-trust architecture • ⚡ 24/7 security monitoring
          </p>
          <p className="text-gray-500 text-xs">
            Audited annually by independent third-party security firms
          </p>
        </motion.div>
      </div>
    </section>
  );
}
