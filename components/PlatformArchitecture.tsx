'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Server,
  Database,
  Cloud,
  Lock,
  Zap,
  Globe,
  Shield,
  CheckCircle2,
  ArrowRight,
  Layers,
  Activity
} from 'lucide-react';

interface TechSpec {
  category: string;
  icon: React.ElementType;
  color: string;
  items: {
    name: string;
    description: string;
  }[];
}

const techSpecs: TechSpec[] = [
  {
    category: 'Frontend',
    icon: Globe,
    color: 'from-blue-500 to-cyan-500',
    items: [
      { name: 'Next.js 15.5.4', description: 'React framework with App Router and Server Components' },
      { name: 'React 19.1.0', description: 'Latest React with concurrent features and transitions' },
      { name: 'TypeScript 5.6', description: 'Strict mode for type safety and developer productivity' },
      { name: 'Tailwind CSS v4', description: 'Zero-config utility-first CSS framework' }
    ]
  },
  {
    category: 'Backend',
    icon: Server,
    color: 'from-purple-500 to-pink-500',
    items: [
      { name: 'Next.js API Routes', description: 'Serverless functions with edge runtime support' },
      { name: 'Shopify Storefront API', description: 'GraphQL API for e-commerce functionality' },
      { name: 'Stripe API', description: 'Payment processing with subscriptions and webhooks' },
      { name: 'Clerk API', description: 'Authentication with OAuth and SSO support' }
    ]
  },
  {
    category: 'Database',
    icon: Database,
    color: 'from-green-500 to-emerald-500',
    items: [
      { name: 'Neon PostgreSQL', description: 'Serverless Postgres with auto-scaling and branching' },
      { name: 'Upstash Redis', description: 'Serverless Redis for rate limiting and caching' },
      { name: 'Vercel KV', description: 'Edge-compatible key-value storage' },
      { name: 'Prisma ORM', description: 'Type-safe database client with migrations' }
    ]
  },
  {
    category: 'Infrastructure',
    icon: Cloud,
    color: 'from-orange-500 to-red-500',
    items: [
      { name: 'Vercel Edge Network', description: 'Global CDN with 300+ edge locations' },
      { name: 'AWS Cloud Services', description: 'S3 storage, CloudFront, Lambda functions' },
      { name: 'Cloudflare', description: 'DDoS protection, WAF, and DNS management' },
      { name: 'Docker Containers', description: 'Containerized microservices for scalability' }
    ]
  },
  {
    category: 'Security',
    icon: Shield,
    color: 'from-red-500 to-pink-500',
    items: [
      { name: 'AES-256 Encryption', description: 'Military-grade encryption at rest and in transit' },
      { name: 'TLS 1.3', description: 'Latest transport layer security protocol' },
      { name: 'Rate Limiting', description: 'Distributed rate limiting with Upstash Redis' },
      { name: 'CORS Protection', description: 'Cross-origin resource sharing security' }
    ]
  },
  {
    category: 'Performance',
    icon: Zap,
    color: 'from-yellow-500 to-orange-500',
    items: [
      { name: 'Edge Caching', description: 'CDN caching with stale-while-revalidate' },
      { name: 'Image Optimization', description: 'Next.js Image with WebP/AVIF formats' },
      { name: 'Code Splitting', description: 'Automatic bundle splitting for faster loads' },
      { name: 'ISR & SSG', description: 'Incremental Static Regeneration for performance' }
    ]
  }
];

export default function PlatformArchitecture() {
  return (
    <section className="py-24 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-white/20">
            <Layers className="w-4 h-4" />
            Platform Architecture
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Built on{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Military-Grade Infrastructure
            </span>
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Enterprise architecture designed for scale, security, and 99.99% uptime. Serverless, edge-optimized, and globally distributed.
          </p>
        </motion.div>

        {/* Architecture Diagram */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 lg:p-12">
            <h3 className="text-2xl font-bold text-center mb-12">System Architecture Overview</h3>

            {/* Architecture Flow */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Client Layer */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-6 text-center">
                  <Globe className="w-12 h-12 mx-auto mb-3" />
                  <h4 className="text-xl font-bold mb-2">Client Layer</h4>
                  <p className="text-sm text-blue-100">Global users accessing via web browsers</p>
                </div>

                <div className="space-y-2">
                  <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                    <p className="text-sm font-semibold">Next.js 15 Frontend</p>
                    <p className="text-xs text-gray-300">React 19, TypeScript, Tailwind</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                    <p className="text-sm font-semibold">Vercel Edge Network</p>
                    <p className="text-xs text-gray-300">300+ CDN locations worldwide</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                    <p className="text-sm font-semibold">Cloudflare DDoS</p>
                    <p className="text-xs text-gray-300">WAF + bot protection</p>
                  </div>
                </div>
              </div>

              {/* Application Layer */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-center">
                  <Server className="w-12 h-12 mx-auto mb-3" />
                  <h4 className="text-xl font-bold mb-2">Application Layer</h4>
                  <p className="text-sm text-purple-100">Serverless API and business logic</p>
                </div>

                <div className="space-y-2">
                  <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                    <p className="text-sm font-semibold">Next.js API Routes</p>
                    <p className="text-xs text-gray-300">Serverless functions on edge</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                    <p className="text-sm font-semibold">Stripe Webhooks</p>
                    <p className="text-xs text-gray-300">Payment event processing</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                    <p className="text-sm font-semibold">Clerk Auth</p>
                    <p className="text-xs text-gray-300">OAuth + SSO + MFA</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                    <p className="text-sm font-semibold">Rate Limiting</p>
                    <p className="text-xs text-gray-300">Upstash Redis distributed</p>
                  </div>
                </div>
              </div>

              {/* Data Layer */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-6 text-center">
                  <Database className="w-12 h-12 mx-auto mb-3" />
                  <h4 className="text-xl font-bold mb-2">Data Layer</h4>
                  <p className="text-sm text-green-100">Secure, scalable data storage</p>
                </div>

                <div className="space-y-2">
                  <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                    <p className="text-sm font-semibold">Neon PostgreSQL</p>
                    <p className="text-xs text-gray-300">Serverless Postgres with branching</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                    <p className="text-sm font-semibold">Upstash Redis</p>
                    <p className="text-xs text-gray-300">Caching + rate limiting</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                    <p className="text-sm font-semibold">AWS S3</p>
                    <p className="text-xs text-gray-300">Object storage + backups</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                    <p className="text-sm font-semibold">AES-256 Encryption</p>
                    <p className="text-xs text-gray-300">All data encrypted at rest</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Flow Arrows */}
            <div className="hidden lg:flex items-center justify-center gap-8 mt-8">
              <div className="flex items-center gap-2 text-sm">
                <ArrowRight className="w-5 h-5 text-blue-400" />
                <span className="text-gray-300">Request Flow</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <ArrowRight className="w-5 h-5 text-green-400 rotate-180" />
                <span className="text-gray-300">Response Flow</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tech Stack Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {techSpecs.map((spec, index) => {
            const Icon = spec.icon;
            return (
              <motion.div
                key={spec.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-all"
              >
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-12 h-12 bg-gradient-to-br ${spec.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">{spec.category}</h3>
                </div>

                {/* Tech Items */}
                <div className="space-y-3">
                  {spec.items.map((item, i) => (
                    <div key={i} className="group">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8"
        >
          <div className="flex items-center gap-3 mb-8">
            <Activity className="w-8 h-8 text-blue-400" />
            <h3 className="text-2xl font-bold">Performance Metrics</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                99.99%
              </div>
              <p className="text-sm text-gray-300">Uptime SLA</p>
              <p className="text-xs text-gray-500 mt-1">Enterprise guarantee</p>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                &lt; 200ms
              </div>
              <p className="text-sm text-gray-300">API Response</p>
              <p className="text-xs text-gray-500 mt-1">Global average</p>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                10K+
              </div>
              <p className="text-sm text-gray-300">Concurrent Users</p>
              <p className="text-xs text-gray-500 mt-1">Auto-scaling ready</p>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
                &lt; 2.5s
              </div>
              <p className="text-sm text-gray-300">LCP Score</p>
              <p className="text-xs text-gray-500 mt-1">Core Web Vitals</p>
            </div>
          </div>

          {/* Security Badges */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">SOC 2 Type II</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-400" />
                <span className="text-gray-300">ISO 27001:2022</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" />
                <span className="text-gray-300">HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-red-400" />
                <span className="text-gray-300">PCI DSS Level 1</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <a
            href="/enterprise#technology"
            className="inline-flex items-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all group"
          >
            <span>Explore Technical Documentation</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
