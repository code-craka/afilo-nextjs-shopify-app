'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const stats = [
  { value: '$50M+', label: 'Enterprise Revenue' },
  { value: '500+', label: 'Fortune 500 Clients' },
  { value: '99.99%', label: 'Uptime SLA' },
  { value: '150+', label: 'Countries Served' }
];

export default function HeroSection() {
  return (
    <div className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-8">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.664 1.319a.75.75 0 01.672 0 41.059 41.059 0 018.198 5.424.75.75 0 01-.254 1.285 31.372 31.372 0 00-7.86 3.83.75.75 0 01-.84 0 31.508 31.508 0 00-2.08-1.287V9.394c0-.244.116-.463.302-.592a35.504 35.504 0 013.305-2.033.75.75 0 00-.714-1.319 37 37 0 00-3.446 2.12A2.216 2.216 0 006 9.393v.38a31.293 31.293 0 00-4.28-1.746.75.75 0 01-.254-1.285 41.059 41.059 0 018.198-5.424zM6 11.459a29.848 29.848 0 00-2.455-1.158 41.029 41.029 0 00-.39 3.114.75.75 0 00.419.74c.528.256 1.046.53 1.554.82-.21-.324-.455-.63-.739-.914a.75.75 0 111.06-1.06c.37.369.69.77.96 1.193a26.61 26.61 0 013.095 2.348.75.75 0 00.992 0 26.547 26.547 0 015.93-3.95.75.75 0 00.42-.739 41.029 41.029 0 00-.39-3.114 29.925 29.925 0 00-5.199 2.801 2.25 2.25 0 01-2.514 0c-.41-.275-.826-.541-1.25-.797a6.985 6.985 0 01-1.084-.63 16.724 16.724 0 01-.549-.415z" clipRule="evenodd" />
            </svg>
            Enterprise Software Solutions
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Afilo
            </span>
          </h1>

          <p className="mt-6 text-xl md:text-2xl text-gray-200 max-w-4xl mx-auto">
            Your premier destination for enterprise-grade AI solutions and cutting-edge technology.
            Discover software that transforms Fortune 500 companies worldwide.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/enterprise"
              className="bg-white text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              Enterprise Solutions
            </Link>
            <Link
              href="/products"
              className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
            >
              Browse Products
            </Link>
          </div>

          {/* Enterprise Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 + index * 0.1 }} // Adjust delay
                className="text-center"
              >
                <div className="text-2xl md:text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-200 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}