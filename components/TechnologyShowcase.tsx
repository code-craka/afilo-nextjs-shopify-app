'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Types for technology showcase
interface TechStack {
  category: string;
  technologies: {
    name: string;
    logo: string;
    version: string;
    description: string;
    adoption: number;
    enterprise: boolean;
  }[];
}

interface SecurityCertification {
  id: string;
  name: string;
  logo: string;
  description: string;
  validUntil: string;
  level: 'gold' | 'platinum' | 'enterprise';
  scope: string[];
}

interface Award {
  id: string;
  title: string;
  organization: string;
  year: number;
  category: string;
  description: string;
  badge: string;
}

interface ArchitectureFeature {
  id: string;
  title: string;
  description: string;
  benefits: string[];
  icon: string;
  color: string;
}

export default function TechnologyShowcase() {
  const [selectedTab, setSelectedTab] = useState<'architecture' | 'security' | 'awards' | 'stack'>('architecture');

  // Enterprise Architecture Features
  const architectureFeatures: ArchitectureFeature[] = [
    {
      id: 'microservices',
      title: 'Cloud-Native Microservices',
      description: 'Distributed architecture with auto-scaling, fault tolerance, and zero-downtime deployments',
      benefits: [
        '99.97% uptime guarantee',
        'Auto-scaling to 10M+ requests/second',
        'Multi-region disaster recovery',
        'Zero-downtime deployments'
      ],
      icon: '🏗️',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'security',
      title: 'Enterprise Security Framework',
      description: 'Military-grade security with end-to-end encryption, zero-trust architecture',
      benefits: [
        'SOC 2 Type II certified',
        'GDPR & HIPAA compliant',
        'AES-256 encryption',
        'Zero-trust network access'
      ],
      icon: '🔐',
      color: 'from-red-500 to-pink-500'
    },
    {
      id: 'ai',
      title: 'AI-Powered Intelligence',
      description: 'Advanced machine learning for predictive analytics, automated optimization',
      benefits: [
        'Predictive scaling algorithms',
        'Intelligent threat detection',
        'Automated performance optimization',
        'Smart resource allocation'
      ],
      icon: '🤖',
      color: 'from-purple-500 to-indigo-500'
    },
    {
      id: 'monitoring',
      title: 'Real-Time Observability',
      description: 'Comprehensive monitoring, logging, and alerting across all systems',
      benefits: [
        '360° system visibility',
        'Predictive anomaly detection',
        'Real-time performance metrics',
        'Automated incident response'
      ],
      icon: '📊',
      color: 'from-green-500 to-teal-500'
    },
    {
      id: 'data',
      title: 'Enterprise Data Platform',
      description: 'Scalable data pipeline with real-time analytics and machine learning',
      benefits: [
        'Petabyte-scale data processing',
        'Real-time analytics engine',
        'Advanced ML/AI capabilities',
        'Data governance & compliance'
      ],
      icon: '🗄️',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'integration',
      title: 'Universal Integration Hub',
      description: 'Connect with 500+ enterprise systems through pre-built connectors',
      benefits: [
        '500+ pre-built connectors',
        'RESTful & GraphQL APIs',
        'Real-time data synchronization',
        'Enterprise message queuing'
      ],
      icon: '🔗',
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  // Security Certifications & Compliance
  const securityCertifications: SecurityCertification[] = [
    {
      id: 'soc2',
      name: 'SOC 2 Type II',
      logo: '/certifications/soc2.svg',
      description: 'Comprehensive security, availability, and confidentiality controls audit',
      validUntil: '2025-12-31',
      level: 'enterprise',
      scope: ['Security', 'Availability', 'Confidentiality', 'Processing Integrity']
    },
    {
      id: 'iso27001',
      name: 'ISO 27001:2022',
      logo: '/certifications/iso27001.svg',
      description: 'International standard for information security management systems',
      validUntil: '2026-06-30',
      level: 'enterprise',
      scope: ['Information Security Management', 'Risk Management', 'Business Continuity']
    },
    {
      id: 'gdpr',
      name: 'GDPR Compliant',
      logo: '/certifications/gdpr.svg',
      description: 'Full compliance with European Union General Data Protection Regulation',
      validUntil: 'Ongoing',
      level: 'gold',
      scope: ['Data Protection', 'Privacy Rights', 'Cross-border Data Transfer']
    },
    {
      id: 'hipaa',
      name: 'HIPAA Compliant',
      logo: '/certifications/hipaa.svg',
      description: 'Healthcare data protection compliance for medical institutions',
      validUntil: 'Ongoing',
      level: 'enterprise',
      scope: ['Healthcare Data', 'Patient Privacy', 'Medical Records']
    },
    {
      id: 'pci',
      name: 'PCI DSS Level 1',
      logo: '/certifications/pci.svg',
      description: 'Highest level of payment card industry data security standards',
      validUntil: '2025-08-15',
      level: 'platinum',
      scope: ['Payment Processing', 'Cardholder Data', 'Financial Transactions']
    },
    {
      id: 'fedramp',
      name: 'FedRAMP Authorized',
      logo: '/certifications/fedramp.svg',
      description: 'Federal government security assessment and authorization',
      validUntil: '2026-03-30',
      level: 'enterprise',
      scope: ['Government Systems', 'Federal Compliance', 'Public Sector']
    }
  ];

  // Industry Awards & Recognition
  const awards: Award[] = [
    {
      id: 'gartner-2024',
      title: 'Leader in Enterprise Development Platforms',
      organization: 'Gartner Magic Quadrant',
      year: 2024,
      category: 'Enterprise Software',
      description: 'Positioned as a Leader for completeness of vision and ability to execute',
      badge: '🏆'
    },
    {
      id: 'forrester-2024',
      title: 'Strong Performer in Low-Code Platforms',
      organization: 'Forrester Wave',
      year: 2024,
      category: 'Development Platforms',
      description: 'Recognized for enterprise-grade capabilities and developer experience',
      badge: '⭐'
    },
    {
      id: 'techcrunch-2023',
      title: 'Best Enterprise Software Innovation',
      organization: 'TechCrunch Disrupt',
      year: 2023,
      category: 'Innovation',
      description: 'Revolutionary approach to enterprise development workflow automation',
      badge: '🚀'
    },
    {
      id: 'idc-2024',
      title: 'Innovator in Digital Business Platforms',
      organization: 'IDC MarketScape',
      year: 2024,
      category: 'Digital Transformation',
      description: 'Leading capabilities in accelerating digital transformation initiatives',
      badge: '💡'
    },
    {
      id: 'deloitte-2023',
      title: 'Technology Fast 500',
      organization: 'Deloitte',
      year: 2023,
      category: 'Growth',
      description: 'Fastest-growing technology company with 1,247% revenue growth',
      badge: '📈'
    },
    {
      id: 'glassdoor-2024',
      title: 'Best Places to Work for Tech',
      organization: 'Glassdoor',
      year: 2024,
      category: 'Culture',
      description: '4.9/5 employee satisfaction rating and 98% CEO approval',
      badge: '👥'
    }
  ];

  // Technology Stack
  const techStack: TechStack[] = [
    {
      category: 'Frontend & Mobile',
      technologies: [
        { name: 'React 19', logo: '/tech/react.svg', version: '19.0', description: 'Modern UI framework', adoption: 95, enterprise: true },
        { name: 'Next.js 15', logo: '/tech/nextjs.svg', version: '15.0', description: 'Full-stack framework', adoption: 92, enterprise: true },
        { name: 'TypeScript', logo: '/tech/typescript.svg', version: '5.6', description: 'Type-safe development', adoption: 98, enterprise: true },
        { name: 'React Native', logo: '/tech/react.svg', version: '0.74', description: 'Mobile development', adoption: 87, enterprise: true }
      ]
    },
    {
      category: 'Backend & APIs',
      technologies: [
        { name: 'Node.js', logo: '/tech/nodejs.svg', version: '22.x', description: 'Server runtime', adoption: 94, enterprise: true },
        { name: 'GraphQL', logo: '/tech/graphql.svg', version: '16.x', description: 'API query language', adoption: 89, enterprise: true },
        { name: 'Kubernetes', logo: '/tech/kubernetes.svg', version: '1.29', description: 'Container orchestration', adoption: 96, enterprise: true },
        { name: 'Docker', logo: '/tech/docker.svg', version: '25.x', description: 'Containerization', adoption: 99, enterprise: true }
      ]
    },
    {
      category: 'Data & Analytics',
      technologies: [
        { name: 'PostgreSQL', logo: '/tech/postgresql.svg', version: '16.x', description: 'Primary database', adoption: 93, enterprise: true },
        { name: 'Redis', logo: '/tech/redis.svg', version: '7.x', description: 'Caching & sessions', adoption: 91, enterprise: true },
        { name: 'Apache Kafka', logo: '/tech/kafka.svg', version: '3.7', description: 'Event streaming', adoption: 88, enterprise: true },
        { name: 'Elasticsearch', logo: '/tech/elasticsearch.svg', version: '8.x', description: 'Search & analytics', adoption: 85, enterprise: true }
      ]
    },
    {
      category: 'Cloud & Infrastructure',
      technologies: [
        { name: 'AWS', logo: '/tech/aws.svg', version: 'Latest', description: 'Cloud infrastructure', adoption: 97, enterprise: true },
        { name: 'Terraform', logo: '/tech/terraform.svg', version: '1.7', description: 'Infrastructure as code', adoption: 94, enterprise: true },
        { name: 'Cloudflare', logo: '/tech/cloudflare.svg', version: 'Enterprise', description: 'CDN & security', adoption: 92, enterprise: true },
        { name: 'Datadog', logo: '/tech/datadog.svg', version: 'Enterprise', description: 'Monitoring & observability', adoption: 89, enterprise: true }
      ]
    }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-200 shadow-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Enterprise Technology Excellence
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Military-grade architecture, world-class security, and industry-leading technology stack
          trusted by Fortune 500 companies worldwide
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap justify-center gap-2 bg-gray-100 p-1 rounded-lg mb-8">
        {[
          { id: 'architecture', label: 'Architecture', icon: '🏗️' },
          { id: 'security', label: 'Security & Compliance', icon: '🔐' },
          { id: 'awards', label: 'Awards & Recognition', icon: '🏆' },
          { id: 'stack', label: 'Technology Stack', icon: '⚡' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as 'architecture' | 'security' | 'awards' | 'stack')}
            className={`flex items-center gap-2 px-4 py-3 rounded-md font-medium transition-all ${
              selectedTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Architecture Tab */}
        {selectedTab === 'architecture' && (
          <motion.div
            key="architecture"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {architectureFeatures.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-2xl mb-4`}>
                    {feature.icon}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 mb-4">{feature.description}</p>

                  <div className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Architecture Metrics */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                Enterprise Architecture Metrics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">99.97%</div>
                  <div className="text-sm text-gray-600">System Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">10M+</div>
                  <div className="text-sm text-gray-600">Requests/Second</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">&lt;100ms</div>
                  <div className="text-sm text-gray-600">API Response</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">50+</div>
                  <div className="text-sm text-gray-600">Global Regions</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Security Tab */}
        {selectedTab === 'security' && (
          <motion.div
            key="security"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                World-Class Security & Compliance
              </h3>
              <p className="text-gray-600">
                Trusted by government agencies and Fortune 500 companies for mission-critical applications
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {securityCertifications.map((cert, index) => (
                <motion.div
                  key={cert.id}
                  className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                      cert.level === 'enterprise' ? 'bg-purple-100' :
                      cert.level === 'platinum' ? 'bg-gray-100' : 'bg-yellow-100'
                    }`}>
                      {/* Placeholder for certification logo */}
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold ${
                        cert.level === 'enterprise' ? 'bg-purple-600' :
                        cert.level === 'platinum' ? 'bg-gray-600' : 'bg-yellow-600'
                      }`}>
                        {cert.name.split(' ')[0].charAt(0)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">{cert.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{cert.description}</p>
                      <div className="text-xs text-gray-500">
                        Valid until: {cert.validUntil}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-medium text-gray-900 text-sm">Coverage Areas:</h5>
                    <div className="flex flex-wrap gap-1">
                      {cert.scope.map((area) => (
                        <span key={area} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Security Stats */}
            <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-8 border border-red-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                Security Excellence Metrics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">0</div>
                  <div className="text-sm text-gray-600">Security Breaches</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-600">AES-256</div>
                  <div className="text-sm text-gray-600">Encryption Standard</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">24/7</div>
                  <div className="text-sm text-gray-600">Security Monitoring</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600">15+</div>
                  <div className="text-sm text-gray-600">Compliance Standards</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Awards Tab */}
        {selectedTab === 'awards' && (
          <motion.div
            key="awards"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Industry Recognition & Awards
              </h3>
              <p className="text-gray-600">
                Recognized by leading industry analysts and technology organizations
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {awards.map((award, index) => (
                <motion.div
                  key={award.id}
                  className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{award.badge}</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1">{award.title}</h4>
                      <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                        <span className="font-medium">{award.organization}</span>
                        <span>•</span>
                        <span>{award.year}</span>
                        <span>•</span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {award.category}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">{award.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Awards Summary */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-8 border border-yellow-200">
              <div className="text-center">
                <h4 className="text-xl font-bold text-gray-900 mb-4">
                  Recognition Highlights
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">15+</div>
                    <div className="text-sm text-gray-600">Industry Awards</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">3x</div>
                    <div className="text-sm text-gray-600">Gartner Leader</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">1,247%</div>
                    <div className="text-sm text-gray-600">Revenue Growth</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">4.9/5</div>
                    <div className="text-sm text-gray-600">Employee Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Technology Stack Tab */}
        {selectedTab === 'stack' && (
          <motion.div
            key="stack"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Enterprise-Grade Technology Stack
              </h3>
              <p className="text-gray-600">
                Modern, scalable, and proven technologies powering enterprise applications
              </p>
            </div>

            {techStack.map((category, categoryIndex) => (
              <motion.div
                key={category.category}
                className="bg-white rounded-xl p-6 border border-gray-200"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.2 }}
              >
                <h4 className="text-xl font-bold text-gray-900 mb-6">{category.category}</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {category.technologies.map((tech, techIndex) => (
                    <motion.div
                      key={tech.name}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-300"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: categoryIndex * 0.2 + techIndex * 0.1 }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          {/* Placeholder for tech logo */}
                          <div className="w-8 h-8 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-bold">
                            {tech.name.charAt(0)}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900">{tech.name}</h5>
                          <p className="text-xs text-gray-600">{tech.version}</p>
                        </div>
                        {tech.enterprise && (
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                            Enterprise
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-3">{tech.description}</p>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Adoption:</span>
                          <span className="font-medium">{tech.adoption}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"
                            initial={{ width: 0 }}
                            animate={{ width: `${tech.adoption}%` }}
                            transition={{ duration: 1, delay: categoryIndex * 0.2 + techIndex * 0.1 + 0.5 }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}

            {/* Tech Stack Summary */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8 border border-indigo-200">
              <div className="text-center">
                <h4 className="text-xl font-bold text-gray-900 mb-4">
                  Technology Excellence
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <div className="text-2xl font-bold text-indigo-600">50+</div>
                    <div className="text-sm text-gray-600">Technologies</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">95%</div>
                    <div className="text-sm text-gray-600">Enterprise Grade</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">24/7</div>
                    <div className="text-sm text-gray-600">Monitoring</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-cyan-600">Auto</div>
                    <div className="text-sm text-gray-600">Scaling</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}