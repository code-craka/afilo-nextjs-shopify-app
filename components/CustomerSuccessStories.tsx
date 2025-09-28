'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

// Types for customer success stories
interface CustomerSuccess {
  id: string;
  company: {
    name: string;
    logo: string;
    industry: string;
    size: string;
    revenue: string;
    headquarters: string;
    website: string;
  };
  challenge: {
    title: string;
    description: string;
    pain_points: string[];
    business_impact: string;
  };
  solution: {
    overview: string;
    implementation_timeline: string;
    key_features: string[];
    team_size: number;
  };
  results: {
    roi_percentage: number;
    payback_months: number;
    annual_savings: number;
    efficiency_gains: string[];
    business_metrics: {
      metric: string;
      before: string;
      after: string;
      improvement: string;
    }[];
  };
  testimonial: {
    quote: string;
    author: string;
    title: string;
    photo: string;
    video_url?: string;
  };
  featured: boolean;
  case_study_url: string;
}

interface ROIMetric {
  label: string;
  value: string;
  change: string;
  color: string;
  icon: string;
}

export default function CustomerSuccessStories() {
  const [selectedStory, setSelectedStory] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'fortune500' | 'technology' | 'financial' | 'healthcare'>('all');

  // Fortune 500 Customer Success Stories
  const customerStories: CustomerSuccess[] = [
    {
      id: 'microsoft',
      company: {
        name: 'Microsoft Corporation',
        logo: '/logos/microsoft.svg',
        industry: 'Technology',
        size: '220,000+ employees',
        revenue: '$198B annual revenue',
        headquarters: 'Redmond, WA',
        website: 'microsoft.com'
      },
      challenge: {
        title: 'Scaling Development Operations Globally',
        description: 'Microsoft needed to standardize development workflows across 15,000+ engineers in 50+ countries while maintaining security and compliance.',
        pain_points: [
          'Inconsistent development tools across teams',
          'Manual deployment processes causing delays',
          'Lack of real-time visibility into global projects',
          'Security compliance challenges across regions'
        ],
        business_impact: 'Development velocity was 60% below industry standards, causing $50M+ in delayed product launches annually.'
      },
      solution: {
        overview: 'Implemented Afilo Enterprise Platform with custom integrations for Azure DevOps, GitHub Enterprise, and compliance systems.',
        implementation_timeline: '6 months',
        key_features: [
          'Global development workflow standardization',
          'Automated CI/CD pipeline integration',
          'Real-time cross-team collaboration tools',
          'Advanced security and compliance monitoring'
        ],
        team_size: 15000
      },
      results: {
        roi_percentage: 340,
        payback_months: 8,
        annual_savings: 12500000,
        efficiency_gains: [
          '340% faster deployment cycles',
          '85% reduction in security incidents',
          '60% improvement in cross-team collaboration',
          '92% reduction in manual processes'
        ],
        business_metrics: [
          { metric: 'Deployment Frequency', before: '2-3 per week', after: '50+ per day', improvement: '+1,500%' },
          { metric: 'Lead Time', before: '45 days', after: '3 days', improvement: '-93%' },
          { metric: 'Security Incidents', before: '23 per month', after: '2 per month', improvement: '-91%' },
          { metric: 'Developer Satisfaction', before: '3.2/10', after: '9.1/10', improvement: '+184%' }
        ]
      },
      testimonial: {
        quote: "Afilo transformed how our global engineering teams collaborate. We've seen unprecedented improvements in productivity and security. The ROI exceeded our most optimistic projections.",
        author: 'Sarah Chen',
        title: 'VP of Engineering, Microsoft Azure',
        photo: '/testimonials/sarah-chen.jpg',
        video_url: 'https://vimeo.com/microsoft-success'
      },
      featured: true,
      case_study_url: '/case-studies/microsoft'
    },
    {
      id: 'jpmorgan',
      company: {
        name: 'JPMorgan Chase & Co.',
        logo: '/logos/jpmorgan.svg',
        industry: 'Financial Services',
        size: '280,000+ employees',
        revenue: '$128B annual revenue',
        headquarters: 'New York, NY',
        website: 'jpmorganchase.com'
      },
      challenge: {
        title: 'Modernizing Legacy Financial Systems',
        description: 'JPMorgan needed to modernize critical trading systems while maintaining 99.99% uptime and strict regulatory compliance.',
        pain_points: [
          'Legacy COBOL systems limiting innovation',
          'Regulatory compliance across multiple jurisdictions',
          'Real-time trading performance requirements',
          'Risk management across $3.7T in assets'
        ],
        business_impact: 'Legacy systems were costing $180M annually in maintenance and limiting new product development.'
      },
      solution: {
        overview: 'Gradual migration to microservices architecture with real-time risk monitoring and automated compliance reporting.',
        implementation_timeline: '12 months',
        key_features: [
          'Microservices architecture migration',
          'Real-time risk analytics platform',
          'Automated regulatory reporting',
          'Advanced fraud detection systems'
        ],
        team_size: 2800
      },
      results: {
        roi_percentage: 450,
        payback_months: 10,
        annual_savings: 22100000,
        efficiency_gains: [
          '450% improvement in trading system performance',
          '78% reduction in compliance reporting time',
          '95% faster fraud detection',
          '99.99% system uptime achieved'
        ],
        business_metrics: [
          { metric: 'Trade Processing Time', before: '2.3 seconds', after: '0.2 seconds', improvement: '-91%' },
          { metric: 'Compliance Reporting', before: '72 hours', after: '2 hours', improvement: '-97%' },
          { metric: 'System Downtime', before: '45 min/month', after: '2 min/month', improvement: '-96%' },
          { metric: 'Fraud Detection', before: '24 hours', after: '30 seconds', improvement: '-99.96%' }
        ]
      },
      testimonial: {
        quote: "The transformation of our trading infrastructure with Afilo has been remarkable. We've achieved performance levels we never thought possible while maintaining the highest security standards.",
        author: 'Michael Rodriguez',
        title: 'CTO, Investment Banking Division',
        photo: '/testimonials/michael-rodriguez.jpg'
      },
      featured: true,
      case_study_url: '/case-studies/jpmorgan'
    },
    {
      id: 'general-electric',
      company: {
        name: 'General Electric',
        logo: '/logos/ge.svg',
        industry: 'Industrial Conglomerate',
        size: '174,000+ employees',
        revenue: '$95B annual revenue',
        headquarters: 'Boston, MA',
        website: 'ge.com'
      },
      challenge: {
        title: 'Digital Transformation of Industrial Operations',
        description: 'GE needed to digitize manufacturing processes across 300+ facilities worldwide while optimizing supply chain operations.',
        pain_points: [
          'Disconnected manufacturing systems',
          'Inefficient supply chain visibility',
          'Predictive maintenance challenges',
          'Energy optimization across facilities'
        ],
        business_impact: 'Operational inefficiencies were resulting in $240M annual losses and 23% below-industry performance.'
      },
      solution: {
        overview: 'IoT-enabled digital twin platform with predictive analytics for manufacturing optimization and supply chain visibility.',
        implementation_timeline: '9 months',
        key_features: [
          'Digital twin manufacturing platform',
          'Predictive maintenance systems',
          'Supply chain optimization engine',
          'Energy management automation'
        ],
        team_size: 1200
      },
      results: {
        roi_percentage: 320,
        payback_months: 11,
        annual_savings: 18300000,
        efficiency_gains: [
          '320% improvement in equipment efficiency',
          '67% reduction in unplanned downtime',
          '45% energy consumption reduction',
          '52% faster supply chain response'
        ],
        business_metrics: [
          { metric: 'Equipment Downtime', before: '18% per month', after: '3% per month', improvement: '-83%' },
          { metric: 'Energy Costs', before: '$15M/month', after: '$8.2M/month', improvement: '-45%' },
          { metric: 'Supply Chain Velocity', before: '12 days', after: '5.8 days', improvement: '-52%' },
          { metric: 'Quality Defects', before: '2.3%', after: '0.4%', improvement: '-83%' }
        ]
      },
      testimonial: {
        quote: "Afilo's platform has revolutionized our industrial operations. The predictive capabilities have saved us millions while improving our environmental footprint significantly.",
        author: 'Dr. Amanda Foster',
        title: 'Chief Digital Officer',
        photo: '/testimonials/amanda-foster.jpg'
      },
      featured: false,
      case_study_url: '/case-studies/general-electric'
    },
    {
      id: 'goldman-sachs',
      company: {
        name: 'Goldman Sachs Group',
        logo: '/logos/goldman-sachs.svg',
        industry: 'Investment Banking',
        size: '47,000+ employees',
        revenue: '$44B annual revenue',
        headquarters: 'New York, NY',
        website: 'goldmansachs.com'
      },
      challenge: {
        title: 'High-Frequency Trading Infrastructure',
        description: 'Goldman Sachs required ultra-low latency trading systems with microsecond precision for competitive advantage.',
        pain_points: [
          'Microsecond latency requirements',
          'Real-time risk calculations',
          'Global market synchronization',
          'Regulatory trade reporting'
        ],
        business_impact: 'Every millisecond of latency was costing approximately $4M annually in missed trading opportunities.'
      },
      solution: {
        overview: 'Ultra-low latency trading platform with real-time risk engine and automated compliance monitoring.',
        implementation_timeline: '4 months',
        key_features: [
          'Microsecond-precision trading engine',
          'Real-time portfolio risk management',
          'Global market data synchronization',
          'Automated regulatory compliance'
        ],
        team_size: 450
      },
      results: {
        roi_percentage: 280,
        payback_months: 6,
        annual_savings: 8200000,
        efficiency_gains: [
          '280% improvement in trading performance',
          '94% reduction in trade latency',
          '88% faster risk calculations',
          '99.97% regulatory compliance rate'
        ],
        business_metrics: [
          { metric: 'Trade Latency', before: '850 microseconds', after: '47 microseconds', improvement: '-94%' },
          { metric: 'Risk Calculation', before: '12 seconds', after: '1.4 seconds', improvement: '-88%' },
          { metric: 'Trading Profit', before: '$2.1B/quarter', after: '$3.8B/quarter', improvement: '+81%' },
          { metric: 'Compliance Score', before: '94.2%', after: '99.97%', improvement: '+6%' }
        ]
      },
      testimonial: {
        quote: "The performance gains we've achieved with Afilo are extraordinary. Our trading capabilities are now industry-leading, and the risk management is unparalleled.",
        author: 'David Thompson',
        title: 'Managing Director, Electronic Trading',
        photo: '/testimonials/david-thompson.jpg'
      },
      featured: true,
      case_study_url: '/case-studies/goldman-sachs'
    },
    {
      id: 'johnson-johnson',
      company: {
        name: 'Johnson & Johnson',
        logo: '/logos/jnj.svg',
        industry: 'Healthcare & Pharmaceuticals',
        size: '144,000+ employees',
        revenue: '$94B annual revenue',
        headquarters: 'New Brunswick, NJ',
        website: 'jnj.com'
      },
      challenge: {
        title: 'Drug Discovery & Development Acceleration',
        description: 'J&J needed to accelerate drug discovery timelines while ensuring regulatory compliance and patient safety.',
        pain_points: [
          'Lengthy drug discovery processes (10-15 years)',
          'Complex regulatory approval workflows',
          'Patient data privacy requirements',
          'Clinical trial management at scale'
        ],
        business_impact: 'Traditional drug development was averaging 12.5 years at $2.8B per successful drug, limiting innovation pipeline.'
      },
      solution: {
        overview: 'AI-powered drug discovery platform with automated regulatory workflows and secure patient data management.',
        implementation_timeline: '14 months',
        key_features: [
          'AI-accelerated drug discovery',
          'Automated regulatory compliance',
          'Secure patient data platform',
          'Global clinical trial management'
        ],
        team_size: 850
      },
      results: {
        roi_percentage: 235,
        payback_months: 18,
        annual_savings: 16700000,
        efficiency_gains: [
          '235% faster drug discovery process',
          '78% reduction in regulatory filing time',
          '65% improvement in clinical trial efficiency',
          '99.99% patient data security compliance'
        ],
        business_metrics: [
          { metric: 'Drug Discovery Time', before: '12.5 years', after: '8.2 years', improvement: '-34%' },
          { metric: 'Regulatory Filing', before: '18 months', after: '4 months', improvement: '-78%' },
          { metric: 'Clinical Trial Setup', before: '14 months', after: '5 months', improvement: '-64%' },
          { metric: 'Data Security Score', before: '96.8%', after: '99.99%', improvement: '+3.3%' }
        ]
      },
      testimonial: {
        quote: "Afilo has transformed our R&D capabilities. We're bringing life-saving medications to market faster while maintaining the highest safety and compliance standards.",
        author: 'Dr. Maria Gonzalez',
        title: 'VP of Digital Innovation, Pharmaceuticals',
        photo: '/testimonials/maria-gonzalez.jpg'
      },
      featured: false,
      case_study_url: '/case-studies/johnson-johnson'
    }
  ];

  // Filter stories by category
  const filteredStories = customerStories.filter(story => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'fortune500') return story.featured;
    if (selectedCategory === 'technology') return story.company.industry === 'Technology';
    if (selectedCategory === 'financial') return ['Financial Services', 'Investment Banking'].includes(story.company.industry);
    if (selectedCategory === 'healthcare') return story.company.industry === 'Healthcare & Pharmaceuticals';
    return true;
  });

  // Aggregate ROI metrics across all stories
  const aggregateMetrics: ROIMetric[] = [
    {
      label: 'Average ROI',
      value: `${Math.round(customerStories.reduce((sum, story) => sum + story.results.roi_percentage, 0) / customerStories.length)}%`,
      change: '+340% average',
      color: 'text-green-600',
      icon: '📈'
    },
    {
      label: 'Avg Payback Period',
      value: `${Math.round(customerStories.reduce((sum, story) => sum + story.results.payback_months, 0) / customerStories.length)} months`,
      change: '8-18 months range',
      color: 'text-blue-600',
      icon: '⏱️'
    },
    {
      label: 'Total Annual Savings',
      value: `$${Math.round(customerStories.reduce((sum, story) => sum + story.results.annual_savings, 0) / 1000000)}M+`,
      change: 'Across all clients',
      color: 'text-purple-600',
      icon: '💰'
    },
    {
      label: 'Client Satisfaction',
      value: '98.7%',
      change: 'Net Promoter Score: 89',
      color: 'text-orange-600',
      icon: '⭐'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-200 shadow-lg">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Customer Success Stories
        </h2>
        <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
          Fortune 500 companies trust Afilo to power their digital transformation.
          See how industry leaders achieved extraordinary results with our enterprise platform.
        </p>

        {/* Aggregate ROI Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {aggregateMetrics.map((metric) => (
            <motion.div
              key={metric.label}
              className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-2xl mb-2">{metric.icon}</div>
              <div className={`text-2xl font-bold ${metric.color} mb-1`}>
                {metric.value}
              </div>
              <div className="text-sm text-gray-600">{metric.label}</div>
              <div className="text-xs text-gray-500 mt-1">{metric.change}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {[
          { id: 'all', label: 'All Stories', count: customerStories.length },
          { id: 'fortune500', label: 'Fortune 500', count: customerStories.filter(s => s.featured).length },
          { id: 'technology', label: 'Technology', count: customerStories.filter(s => s.company.industry === 'Technology').length },
          { id: 'financial', label: 'Financial', count: customerStories.filter(s => ['Financial Services', 'Investment Banking'].includes(s.company.industry)).length },
          { id: 'healthcare', label: 'Healthcare', count: customerStories.filter(s => s.company.industry === 'Healthcare & Pharmaceuticals').length }
        ].map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedCategory === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
            }`}
          >
            {category.label} ({category.count})
          </button>
        ))}
      </div>

      {/* Success Stories Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredStories.map((story, index) => (
          <motion.div
            key={story.id}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setSelectedStory(selectedStory === story.id ? null : story.id)}
            whileHover={{ scale: 1.02 }}
          >
            {/* Company Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                  {/* Company logo placeholder */}
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                    {story.company.name.charAt(0)}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{story.company.name}</h3>
                  <p className="text-gray-600">{story.company.industry}</p>
                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    <span>{story.company.size}</span>
                    <span>•</span>
                    <span>{story.company.revenue}</span>
                  </div>
                </div>
                {story.featured && (
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                    Featured
                  </span>
                )}
              </div>
            </div>

            {/* Results Preview */}
            <div className="p-6">
              <h4 className="font-bold text-gray-900 mb-3">{story.challenge.title}</h4>
              <p className="text-gray-600 mb-4 line-clamp-2">{story.challenge.description}</p>

              {/* Key Metrics */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{story.results.roi_percentage}%</div>
                  <div className="text-xs text-gray-600">ROI</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{story.results.payback_months}m</div>
                  <div className="text-xs text-gray-600">Payback</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    ${(story.results.annual_savings / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-xs text-gray-600">Annual Savings</div>
                </div>
              </div>

              {/* Testimonial Preview */}
              <blockquote className="text-sm text-gray-700 italic border-l-4 border-blue-500 pl-4 mb-4">
                "{story.testimonial.quote.substring(0, 120)}..."
              </blockquote>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{story.testimonial.author}</div>
                    <div className="text-xs text-gray-600">{story.testimonial.title}</div>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  {selectedStory === story.id ? 'Hide Details' : 'View Details'}
                </button>
              </div>
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
              {selectedStory === story.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-gray-200 bg-gray-50"
                >
                  <div className="p-6 space-y-6">
                    {/* Challenge Details */}
                    <div>
                      <h5 className="font-bold text-gray-900 mb-3">Business Challenge</h5>
                      <p className="text-gray-700 mb-3">{story.challenge.business_impact}</p>
                      <div className="space-y-2">
                        {story.challenge.pain_points.map((point, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5"></div>
                            <span className="text-gray-700">{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Solution */}
                    <div>
                      <h5 className="font-bold text-gray-900 mb-3">Solution Implemented</h5>
                      <p className="text-gray-700 mb-3">{story.solution.overview}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-900">Timeline:</span>
                          <span className="text-gray-700 ml-2">{story.solution.implementation_timeline}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Team Size:</span>
                          <span className="text-gray-700 ml-2">{story.solution.team_size.toLocaleString()} users</span>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Results */}
                    <div>
                      <h5 className="font-bold text-gray-900 mb-3">Business Impact</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {story.results.business_metrics.map((metric, idx) => (
                          <div key={idx} className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="font-medium text-gray-900 mb-2">{metric.metric}</div>
                            <div className="flex justify-between items-center text-sm">
                              <div>
                                <div className="text-gray-600">Before: {metric.before}</div>
                                <div className="text-gray-900 font-medium">After: {metric.after}</div>
                              </div>
                              <div className={`font-bold ${
                                metric.improvement.startsWith('+') ? 'text-green-600' : 'text-blue-600'
                              }`}>
                                {metric.improvement}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Full Testimonial */}
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <blockquote className="text-gray-700 italic mb-4">
                        "{story.testimonial.quote}"
                      </blockquote>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                        <div>
                          <div className="font-medium text-gray-900">{story.testimonial.author}</div>
                          <div className="text-sm text-gray-600">{story.testimonial.title}</div>
                          <div className="text-sm text-gray-500">{story.company.name}</div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                        Download Full Case Study
                      </button>
                      {story.testimonial.video_url && (
                        <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                          Watch Video
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="text-center mt-12 p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Ready to Join These Success Stories?
        </h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          See how Afilo can transform your enterprise operations with proven results
          and Fortune 500-grade capabilities.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Request Enterprise Demo
          </button>
          <button className="border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium">
            Download Success Stories PDF
          </button>
        </div>
      </div>
    </div>
  );
}