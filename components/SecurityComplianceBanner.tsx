'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Award, CheckCircle2, FileCheck, AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SecurityComplianceBanner() {
  const certifications = [
    {
      id: 'soc2',
      name: 'SOC 2 Type II',
      icon: Shield,
      description: 'Annual independent audit',
      color: 'from-red-500 to-pink-500',
      verified: true,
      year: '2024'
    },
    {
      id: 'iso27001',
      name: 'ISO 27001:2022',
      icon: Award,
      description: 'Information Security Management',
      color: 'from-blue-500 to-cyan-500',
      verified: true,
      year: '2024'
    },
    {
      id: 'hipaa',
      name: 'HIPAA Compliant',
      icon: FileCheck,
      description: 'Business Associate Agreements',
      color: 'from-green-500 to-emerald-500',
      verified: true,
      year: 'Active'
    },
    {
      id: 'pci',
      name: 'PCI DSS Level 1',
      icon: Lock,
      description: 'Via Stripe payment processing',
      color: 'from-purple-500 to-pink-500',
      verified: true,
      year: '2024'
    }
  ];

  const securityFeatures = [
    { name: 'AES-256 Encryption at Rest', icon: '🔐' },
    { name: 'TLS 1.3 in Transit', icon: '🛡️' },
    { name: '99.99% Uptime SLA', icon: '⚡' },
    { name: 'Multi-Factor Authentication', icon: '🔑' },
    { name: 'Role-Based Access Control', icon: '👥' },
    { name: 'Comprehensive Audit Logs', icon: '📋' },
    { name: 'Automated Backups (30-day)', icon: '💾' },
    { name: '24/7 Security Monitoring', icon: '👁️' },
    { name: 'Penetration Testing (Annual)', icon: '🎯' },
    { name: 'DDoS Protection', icon: '🚧' },
    { name: 'Data Breach Notification', icon: '🔔' },
    { name: 'GDPR Non-Applicable (No EU)', icon: '🚫' }
  ];

  const complianceBadges = [
    { name: 'CCPA', description: 'California Consumer Privacy Act' },
    { name: 'PIPEDA', description: 'Canada Privacy Act' },
    { name: 'UK GDPR', description: 'United Kingdom Data Protection' },
    { name: 'Privacy Act 1988', description: 'Australia Privacy Compliance' }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-white/20">
            <Shield className="w-4 h-4" />
            Security & Compliance
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Enterprise-Grade{' '}
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Security & Compliance
            </span>
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Military-grade security meets regulatory compliance. SOC 2, ISO 27001, HIPAA certified infrastructure trusted by Fortune 500 companies.
          </p>
        </motion.div>

        {/* Certifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {certifications.map((cert, index) => {
            const Icon = cert.icon;
            return (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6 hover:bg-white/15 transition-all"
              >
                {/* Icon */}
                <div className={`w-16 h-16 bg-gradient-to-br ${cert.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold text-white">{cert.name}</h3>
                  {cert.verified && (
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-blue-200 mb-3">{cert.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Certified {cert.year}</span>
                  <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs font-bold rounded-full border border-green-500/30">
                    VERIFIED
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Security Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 mb-16"
        >
          <h3 className="text-2xl font-bold text-white text-center mb-8">Comprehensive Security Controls</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {securityFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all"
              >
                <span className="text-2xl">{feature.icon}</span>
                <span className="text-sm text-white font-medium">{feature.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Compliance Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {complianceBadges.map((badge, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6 text-center hover:bg-white/15 transition-all"
            >
              <div className="text-2xl font-bold text-white mb-1">{badge.name}</div>
              <div className="text-xs text-blue-200">{badge.description}</div>
            </div>
          ))}
        </motion.div>

        {/* Critical Security Notice - EU Exclusion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="bg-red-900/30 backdrop-blur-xl rounded-2xl border-2 border-red-500/50 p-8 mb-16"
        >
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-8 h-8 text-red-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold text-white mb-3">Geographic Restrictions Notice</h3>
              <p className="text-red-100 mb-4">
                <strong>TechSci, Inc. (operating the Afilo platform) does NOT provide services to individuals or entities located
                in the European Union (EU) or European Economic Area (EEA).</strong>
              </p>
              <p className="text-sm text-red-200 mb-4">
                As we do not operate in or target EU/EEA markets, the General Data Protection Regulation (GDPR) does not apply
                to our services. We operate under US data protection laws (HIPAA, CCPA), Canadian PIPEDA, UK GDPR, and Australian
                Privacy Act 1988.
              </p>
              <Link
                href="/legal/privacy-policy#geographic-restrictions"
                className="inline-flex items-center gap-2 text-red-300 hover:text-red-200 font-semibold text-sm group"
              >
                <span>View Full Geographic Restrictions</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
              99.99%
            </div>
            <div className="text-sm text-blue-200">Uptime SLA</div>
            <div className="text-xs text-gray-400 mt-1">Enterprise guarantee</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              AES-256
            </div>
            <div className="text-sm text-blue-200">Encryption</div>
            <div className="text-xs text-gray-400 mt-1">Military-grade</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              24/7
            </div>
            <div className="text-sm text-blue-200">Security Monitoring</div>
            <div className="text-xs text-gray-400 mt-1">Always protected</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
              &lt; 72hr
            </div>
            <div className="text-sm text-blue-200">Breach Notification</div>
            <div className="text-xs text-gray-400 mt-1">Regulatory compliance</div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-6">
            Need Security Documentation for Your Compliance Team?
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/legal/data-processing"
              className="inline-flex items-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all group"
            >
              <FileCheck className="w-5 h-5" />
              <span>View Data Processing Agreement</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="mailto:compliance@techsci.io?subject=Security%20Documentation%20Request"
              className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-all border border-white/30"
            >
              <Shield className="w-5 h-5" />
              <span>Request SOC 2 Report</span>
            </a>
          </div>

          <p className="text-sm text-blue-200 mt-6">
            Security audits, penetration test results, and compliance documentation available upon request.
            Contact:{' '}
            <a href="mailto:security@techsci.io" className="text-blue-300 hover:text-blue-200 underline">
              security@techsci.io
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
