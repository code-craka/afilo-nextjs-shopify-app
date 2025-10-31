'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Hospital,
  GraduationCap,
  Store,
  Landmark,
  CheckCircle2,
  TrendingUp,
  Shield,
  Zap,
  ArrowRight
} from 'lucide-react';

interface IndustrySolution {
  id: string;
  name: string;
  icon: React.ElementType;
  tagline: string;
  description: string;
  challenges: string[];
  solutions: {
    title: string;
    description: string;
    icon: React.ElementType;
  }[];
  results: {
    metric: string;
    value: string;
    description: string;
  }[];
  caseStudy: {
    company: string;
    industry: string;
    result: string;
  };
}

const industries: IndustrySolution[] = [
  {
    id: 'healthcare',
    name: 'Healthcare',
    icon: Hospital,
    tagline: 'HIPAA-Compliant Patient Management',
    description: 'Secure, compliant platform for healthcare providers managing sensitive patient data with enterprise-grade security and HIPAA Business Associate Agreements.',
    challenges: [
      'HIPAA compliance requirements for Protected Health Information (PHI)',
      'Complex multi-location patient data synchronization',
      'Integration with existing EHR/EMR systems',
      'Strict audit logging and breach notification requirements'
    ],
    solutions: [
      {
        title: 'HIPAA Compliance Built-In',
        description: 'Pre-configured BAA, AES-256 encryption, role-based access control, and comprehensive audit trails for all PHI access.',
        icon: Shield
      },
      {
        title: 'EHR/EMR Integration',
        description: 'Seamless integration with Epic, Cerner, Allscripts, and other major healthcare systems via HL7 and FHIR standards.',
        icon: Zap
      },
      {
        title: 'Real-Time Compliance Monitoring',
        description: 'Automated breach detection, 60-day HIPAA notification, security event logging, and SOC 2 Type II compliance reporting.',
        icon: TrendingUp
      }
    ],
    results: [
      { metric: '99.99%', value: 'Uptime SLA', description: 'Mission-critical reliability' },
      { metric: '60-Day', value: 'Breach Notification', description: 'HIPAA requirement met' },
      { metric: '100%', value: 'BAA Coverage', description: 'All PHI fully protected' }
    ],
    caseStudy: {
      company: 'Regional Health Network',
      industry: '47 Clinics, 12,000 Patients',
      result: '450% ROI in Year 1 - $2.1M saved through operational efficiency and compliance automation'
    }
  },
  {
    id: 'finance',
    name: 'Financial Services',
    icon: Landmark,
    tagline: 'SEC-Compliant Financial Operations',
    description: 'Bank-grade security for financial institutions managing transactions, compliance, and customer data with SOC 2 Type II and ISO 27001 certifications.',
    challenges: [
      'SEC, FINRA, and banking regulations compliance',
      'Real-time fraud detection and prevention',
      'Multi-factor authentication and identity verification',
      'Strict data retention and audit requirements'
    ],
    solutions: [
      {
        title: 'Financial Compliance Suite',
        description: 'Pre-built compliance workflows for SEC Rule 17a-4, FINRA 4511, and SOX requirements with automated audit trails.',
        icon: Shield
      },
      {
        title: 'Fraud Prevention AI',
        description: 'Machine learning models detect anomalous transactions, suspicious patterns, and potential fraud in real-time.',
        icon: Zap
      },
      {
        title: 'Encrypted Data Vault',
        description: 'AES-256 encryption, tokenization for PCI DSS compliance, and secure key management for sensitive financial data.',
        icon: TrendingUp
      }
    ],
    results: [
      { metric: '< 50ms', value: 'Transaction Speed', description: 'High-frequency trading ready' },
      { metric: '99.7%', value: 'Fraud Detection', description: 'AI-powered accuracy' },
      { metric: 'SOC 2', value: 'Type II Certified', description: 'Annual independent audit' }
    ],
    caseStudy: {
      company: 'Investment Management Firm',
      industry: '$8.5B AUM, 250 Employees',
      result: '340% ROI in 18 Months - $3.4M saved through compliance automation and fraud reduction'
    }
  },
  {
    id: 'education',
    name: 'Education',
    icon: GraduationCap,
    tagline: 'FERPA-Compliant Learning Management',
    description: 'Secure education platform for K-12 schools, universities, and training organizations managing student data and educational content.',
    challenges: [
      'FERPA compliance for student educational records',
      'Multi-tenant architecture for different schools/departments',
      'Integration with Learning Management Systems (Canvas, Blackboard)',
      'Accessibility requirements (WCAG 2.1 AA compliance)'
    ],
    solutions: [
      {
        title: 'FERPA Compliance Engine',
        description: 'Automated student data protection, parental consent workflows, and strict access controls per FERPA requirements.',
        icon: Shield
      },
      {
        title: 'LMS Integration Hub',
        description: 'Pre-built connectors for Canvas, Blackboard, Moodle, Schoology with LTI 1.3 and OneRoster standards.',
        icon: Zap
      },
      {
        title: 'Accessibility First',
        description: 'WCAG 2.1 AA compliant interface, screen reader support, keyboard navigation, and high-contrast modes.',
        icon: TrendingUp
      }
    ],
    results: [
      { metric: '50%', value: 'Student Discount', description: 'Affordable for institutions' },
      { metric: '100K+', value: 'Students Supported', description: 'Scalable infrastructure' },
      { metric: 'WCAG 2.1', value: 'AA Compliant', description: 'Accessibility certified' }
    ],
    caseStudy: {
      company: 'State University System',
      industry: '85,000 Students, 12 Campuses',
      result: '280% ROI in Year 2 - $1.8M saved through administrative efficiency and LMS consolidation'
    }
  },
  {
    id: 'retail',
    name: 'Retail & E-Commerce',
    icon: Store,
    tagline: 'Omnichannel Commerce Platform',
    description: 'Unified platform for retailers managing online stores, inventory, customer data, and point-of-sale systems across multiple channels.',
    challenges: [
      'Real-time inventory synchronization across channels',
      'PCI DSS compliance for payment processing',
      'Peak traffic handling (Black Friday, Cyber Monday)',
      'Integration with Stripe, Payment APIs, E-commerce platforms'
    ],
    solutions: [
      {
        title: 'Omnichannel Inventory',
        description: 'Real-time stock levels across online, in-store, and warehouse with automatic reorder points and supplier integration.',
        icon: Shield
      },
      {
        title: 'PCI DSS Level 1 Payments',
        description: 'Stripe integration with tokenization, 3D Secure 2.0, and ACH Direct Debit for secure payment processing.',
        icon: Zap
      },
      {
        title: 'Auto-Scaling Infrastructure',
        description: 'Handle 10,000+ concurrent users with Vercel edge network, CDN optimization, and sub-200ms global response times.',
        icon: TrendingUp
      }
    ],
    results: [
      { metric: '99.99%', value: 'Uptime During Peaks', description: 'Black Friday ready' },
      { metric: '< 200ms', value: 'Page Load Time', description: 'Global CDN delivery' },
      { metric: '35%', value: 'Conversion Increase', description: 'Faster checkout flow' }
    ],
    caseStudy: {
      company: 'Multi-Brand Retailer',
      industry: '$120M GMV, 500 Locations',
      result: '520% ROI in Year 1 - $4.2M saved through inventory optimization and reduced IT overhead'
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise SaaS',
    icon: Building2,
    tagline: 'Fortune 500 Business Operations',
    description: 'Enterprise-grade platform for large organizations managing complex workflows, multi-department collaboration, and global operations.',
    challenges: [
      'Multi-region data residency and sovereignty requirements',
      'Enterprise SSO (SAML, OIDC) and Active Directory integration',
      'Custom SLA requirements (99.99% uptime, 1-hour support)',
      'Advanced security (penetration testing, bug bounty programs)'
    ],
    solutions: [
      {
        title: 'Global Infrastructure',
        description: 'Multi-region deployment in US, Canada, UK, Australia with data residency controls and geo-replication.',
        icon: Shield
      },
      {
        title: 'Enterprise SSO & Directory',
        description: 'Pre-built integrations for Okta, Azure AD, OneLogin, Ping Identity with SAML 2.0 and OIDC support.',
        icon: Zap
      },
      {
        title: 'Dedicated Support',
        description: '1-hour SLA, dedicated customer success manager, quarterly business reviews, and custom onboarding programs.',
        icon: TrendingUp
      }
    ],
    results: [
      { metric: '1-Hour', value: 'Support SLA', description: '24/7 dedicated team' },
      { metric: '500+', value: 'Users Supported', description: 'Unlimited scale' },
      { metric: '99.99%', value: 'Uptime Guarantee', description: 'SLA credits available' }
    ],
    caseStudy: {
      company: 'Fortune 100 Technology Company',
      industry: '15,000 Employees, Global Operations',
      result: '680% ROI in 24 Months - $12.5M saved through process automation and vendor consolidation'
    }
  }
];

export default function IndustrySolutions() {
  const [activeIndustry, setActiveIndustry] = React.useState<string>('healthcare');
  const selectedIndustry = industries.find(ind => ind.id === activeIndustry) || industries[0];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Building2 className="w-4 h-4" />
            Industry Solutions
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Tailored for{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Your Industry
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Enterprise-grade solutions designed for the unique compliance, security, and operational needs of your sector
          </p>
        </motion.div>

        {/* Industry Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {industries.map((industry) => {
            const Icon = industry.icon;
            const isActive = activeIndustry === industry.id;

            return (
              <motion.button
                key={industry.id}
                onClick={() => setActiveIndustry(industry.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{industry.name}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Industry Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndustry}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {/* Industry Header */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 mb-8 border border-gray-200">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  {React.createElement(selectedIndustry.icon, { className: 'w-8 h-8 text-white' })}
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">{selectedIndustry.name}</h3>
                  <p className="text-lg text-blue-600 font-semibold mb-4">{selectedIndustry.tagline}</p>
                  <p className="text-gray-700 leading-relaxed">{selectedIndustry.description}</p>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column: Challenges & Solutions */}
              <div className="space-y-6">
                {/* Industry Challenges */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-4">Industry Challenges</h4>
                  <ul className="space-y-3">
                    {selectedIndustry.challenges.map((challenge, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-red-600 text-sm font-bold">{index + 1}</span>
                        </div>
                        <span className="text-gray-700">{challenge}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Afilo Solutions */}
                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-gray-900">Afilo Solutions</h4>
                  {selectedIndustry.solutions.map((solution, index) => {
                    const SolutionIcon = solution.icon;
                    return (
                      <div key={index} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <SolutionIcon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h5 className="text-lg font-bold text-gray-900 mb-2">{solution.title}</h5>
                            <p className="text-gray-700 text-sm">{solution.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Results & Case Study */}
              <div className="space-y-6">
                {/* Measurable Results */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-6">Measurable Results</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {selectedIndustry.results.map((result, index) => (
                      <div key={index} className="text-center">
                        <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
                          {result.metric}
                        </div>
                        <div className="text-sm font-semibold text-gray-900 mb-1">{result.value}</div>
                        <div className="text-xs text-gray-600">{result.description}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Case Study */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 border-2 border-green-500">
                  <div className="flex items-center gap-2 text-green-700 font-semibold mb-4">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Customer Success Story</span>
                  </div>
                  <h5 className="text-2xl font-bold text-gray-900 mb-2">{selectedIndustry.caseStudy.company}</h5>
                  <p className="text-sm text-gray-600 mb-4">{selectedIndustry.caseStudy.industry}</p>
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <p className="text-lg font-bold text-gray-900">{selectedIndustry.caseStudy.result}</p>
                  </div>
                </div>

                {/* CTA */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <a
                    href="/enterprise#quote"
                    className="group w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-5 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
                  >
                    <span>Schedule Industry Demo</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
