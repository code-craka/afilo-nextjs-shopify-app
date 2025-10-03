'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import { SignInButton, SignUpButton, UserButton, useAuth } from '@clerk/nextjs';
import { useState, useEffect } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.8)']
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/enterprise', label: 'Enterprise' },
    { href: '/dashboard', label: 'Dashboard' },
  ];

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-lg'
          : 'bg-transparent'
      }`}
      style={{ backgroundColor: isScrolled ? undefined : backgroundColor }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05, rotateZ: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.664 1.319a.75.75 0 01.672 0 41.059 41.059 0 018.198 5.424.75.75 0 01-.254 1.285 31.372 31.372 0 00-7.86 3.83.75.75 0 01-.84 0 31.508 31.508 0 00-2.08-1.287V9.394c0-.244.116-.463.302-.592a35.504 35.504 0 013.305-2.033.75.75 0 00-.714-1.319 37 37 0 00-3.446 2.12A2.216 2.216 0 006 9.393v.38a31.293 31.293 0 00-4.28-1.746.75.75 0 01-.254-1.285 41.059 41.059 0 018.198-5.424z" clipRule="evenodd" />
                </svg>
              </div>
            </motion.div>
            <span className={`text-2xl font-black transition-colors ${
              isScrolled ? 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent' : 'text-white'
            }`}>
              Afilo
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href}>
                  <motion.div
                    className={`relative px-4 py-2 rounded-lg font-medium transition-colors ${
                      isScrolled
                        ? isActive
                          ? 'text-blue-600'
                          : 'text-gray-700 hover:text-blue-600'
                        : isActive
                        ? 'text-white'
                        : 'text-white/80 hover:text-white'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {link.label}
                    {isActive && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                        layoutId="activeNav"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {isLoaded && (
              <>
                {isSignedIn ? (
                  <div className="flex items-center space-x-3">
                    <UserButton
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          avatarBox: "w-10 h-10 ring-2 ring-blue-500/30 hover:ring-blue-500/50 transition-all",
                        },
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <SignInButton mode="modal">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
                          isScrolled
                            ? 'text-gray-700 hover:bg-gray-100'
                            : 'text-white hover:bg-white/10'
                        }`}
                      >
                        Sign In
                      </motion.button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(59, 130, 246, 0.5)" }}
                        whileTap={{ scale: 0.95 }}
                        className="relative px-6 py-2.5 rounded-xl font-bold text-white overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600" />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <span className="relative z-10 flex items-center gap-2">
                          Get Started
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </span>
                      </motion.button>
                    </SignUpButton>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}