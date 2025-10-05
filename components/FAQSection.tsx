'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: 'security' | 'technical' | 'business' | 'compliance';
  link?: { text: string; href: string };
}

const faqs: FAQ[] = [
  {
    id: 'security-certifications',
    question: 'What security certifications does Afilo have?',
    answer: 'Afilo maintains SOC 2 Type II, ISO 27001:2022, HIPAA compliance, PCI DSS Level 1, and FedRAMP authorization. We undergo annual third-party audits and continuous security assessments. All data is encrypted at rest (AES-256) and in transit (TLS 1.3) with zero-trust network architecture.',
    category: 'security',
    link: { text: 'View Security Details', href: '/enterprise#security' }
  },
  {
    id: 'uptime-guarantee',
    question: 'How does Afilo ensure 99.99% uptime?',
    answer: 'Our multi-region cloud infrastructure with auto-scaling capabilities ensures continuous availability. We maintain redundant systems across 50+ global regions with automated failover, real-time monitoring, and 24/7 NOC (Network Operations Center). Our enterprise SLA includes service credits if we fall below 99.99% monthly uptime.',
    category: 'technical',
    link: { text: 'Read Enterprise SLA', href: '/legal/enterprise-sla' }
  },
  {
    id: 'integrations',
    question: 'Can I integrate Afilo with our existing tools?',
    answer: 'Yes! Afilo offers 500+ pre-built connectors for enterprise systems including Salesforce, SAP, Microsoft 365, Google Workspace, Slack, and more. We provide RESTful & GraphQL APIs, webhooks, SSO (SAML/OIDC), and real-time data synchronization. Our integration team can also build custom connectors for proprietary systems.',
    category: 'technical',
    link: { text: 'Browse Integrations', href: '/integrations' }
  },
  {
    id: 'enterprise-support',
    question: 'What kind of support do enterprise customers receive?',
    answer: 'Enterprise customers receive a dedicated Customer Success Manager (CSM), priority 24/7 technical support with 15-minute response times for critical issues, quarterly executive business reviews, hands-on implementation assistance, and access to our expert services team for custom development and training.',
    category: 'business',
    link: { text: 'Contact Enterprise Sales', href: '/enterprise' }
  },
  {
    id: 'free-trial',
    question: 'Is there a free trial for enterprise plans?',
    answer: 'We do not offer free trials. All plans require immediate payment with a 30-day money-back guarantee. For Enterprise Plus prospects, we offer personalized live demos and sandbox environments for API testing. This ensures you receive dedicated onboarding, priority support, and full feature access from day one.',
    category: 'business'
  },
  {
    id: 'implementation-time',
    question: 'How does the implementation process work?',
    answer: 'Our 5-step enterprise journey: (1) Discovery call (30 min), (2) Custom demo (1-2 hours), (3) Subscribe and start onboarding, (4) Implementation and integration (2-6 months), (5) Ongoing optimization. Full deployment includes phased rollout, data migration, system integration, and comprehensive training with a dedicated implementation team. 30-day money-back guarantee protects your investment.',
    category: 'business',
    link: { text: 'See Implementation Timeline', href: '#how-it-works' }
  },
  {
    id: 'data-retention',
    question: 'What is your data retention policy?',
    answer: 'Active account data is retained throughout your subscription. After cancellation, data is retained for 90 days for potential reactivation, then securely deleted per NIST 800-88 standards. Backup copies are retained for 12 months for disaster recovery. Legal holds may extend retention as required. You can export all data in JSON/CSV format anytime.',
    category: 'compliance',
    link: { text: 'Read Privacy Policy', href: '/legal/privacy-policy' }
  },
  {
    id: 'on-premise',
    question: 'Do you offer on-premise deployment?',
    answer: 'We maintain a cloud-only architecture to ensure optimal security, scalability, and continuous updates. However, for highly regulated industries or government agencies, we can discuss private cloud deployment options within your dedicated VPC (Virtual Private Cloud) on AWS or Azure with enhanced security controls.',
    category: 'technical'
  },
  {
    id: 'geographic-regions',
    question: 'What regions do you operate in?',
    answer: 'Afilo operates in the United States (primary market), Canada, United Kingdom (post-Brexit), Australia, New Zealand, Singapore, Japan, and other approved non-EU countries. We do NOT conduct business with or provide services to individuals or entities located in the European Union (EU) or European Economic Area (EEA).',
    category: 'compliance',
    link: { text: 'View Geographic Restrictions', href: '/legal/privacy-policy#geographic-restrictions' }
  },
  {
    id: 'customization',
    question: 'Can I customize the platform for my business?',
    answer: 'Absolutely! Enterprise customers can customize workflows, dashboards, reporting, branding, and user roles. Our Professional Services team offers custom development for unique requirements, API extensions, and white-label solutions. We also provide sandbox environments for testing custom configurations.',
    category: 'business'
  },
  {
    id: 'cancellation-policy',
    question: 'What is your cancellation policy?',
    answer: 'You can cancel your subscription anytime from your dashboard. Cancellation takes effect at the end of your current billing period with no prorated refunds for mid-cycle cancellations. We offer a 30-day money-back guarantee for new customers. Annual contracts may have different terms outlined in your enterprise agreement.',
    category: 'business',
    link: { text: 'Read Refund Policy', href: '/legal/refund-policy' }
  },
  {
    id: 'hipaa-compliance',
    question: 'How do you handle HIPAA compliance?',
    answer: 'For healthcare customers who are Covered Entities or Business Associates, we execute a Business Associate Agreement (BAA) and implement comprehensive safeguards per 45 CFR §§ 164.308, 164.310, and 164.312. All PHI is encrypted (AES-256), access-controlled with RBAC, audit-logged, and monitored 24/7. We notify breaches within 60 days per HIPAA Breach Notification Rule.',
    category: 'compliance',
    link: { text: 'Request BAA', href: 'mailto:hipaa@techsci.io' }
  }
];

const categories = [
  { id: 'all', label: 'All Questions', color: 'text-gray-600' },
  { id: 'security', label: 'Security', color: 'text-red-600' },
  { id: 'technical', label: 'Technical', color: 'text-blue-600' },
  { id: 'business', label: 'Business', color: 'text-green-600' },
  { id: 'compliance', label: 'Compliance', color: 'text-purple-600' }
];

export default function FAQSection() {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

  const filteredFAQs = selectedCategory === 'all'
    ? faqs
    : faqs.filter(faq => faq.category === selectedCategory);

  return (
    <section className="bg-gradient-to-br from-gray-50 to-white py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about Afilo's enterprise platform
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-white border border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600'
              }`}
            >
              {category.label}
            </button>
          ))}
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {filteredFAQs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <AccordionItem
                  value={faq.id}
                  className="backdrop-blur-xl bg-white/90 border border-gray-200/50 rounded-2xl px-6 shadow-lg hover:shadow-xl transition-all duration-300 data-[state=open]:border-blue-600 data-[state=open]:shadow-2xl"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-6">
                    <div className="flex items-start gap-4 w-full pr-4">
                      {/* Category Badge */}
                      <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${
                        faq.category === 'security' ? 'bg-red-500' :
                        faq.category === 'technical' ? 'bg-blue-500' :
                        faq.category === 'business' ? 'bg-green-500' :
                        'bg-purple-500'
                      }`} />

                      {/* Question */}
                      <span className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {faq.question}
                      </span>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="pt-2 pb-6">
                    <div className="pl-6 space-y-4">
                      {/* Answer */}
                      <p className="text-gray-700 leading-relaxed">
                        {faq.answer}
                      </p>

                      {/* Link (if available) */}
                      {faq.link && (
                        <Link
                          href={faq.link.href}
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm group"
                        >
                          {faq.link.text}
                          <svg
                            className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </Link>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>

        {/* Still Have Questions CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="backdrop-blur-xl bg-gradient-to-br from-blue-50/80 to-purple-50/80 border border-blue-200/50 rounded-3xl p-10">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Still have questions?
            </h3>
            <p className="text-gray-600 mb-6">
              Our enterprise team is here to help. Get in touch for personalized answers.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/enterprise"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300"
              >
                Contact Sales
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </Link>

              <Link
                href="mailto:support@techsci.io"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-900 font-bold rounded-xl hover:border-blue-600 hover:text-blue-600 transition-all duration-300"
              >
                Email Support
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
