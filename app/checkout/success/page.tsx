'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Download, Mail, ArrowRight, Package } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      setLoading(false);
      return;
    }

    // Fetch session details from Stripe
    fetch(`/api/stripe/session/${sessionId}`)
      .then(res => res.json())
      .then(data => {
        setSessionData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch session:', err);
        setLoading(false);
      });
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent"></div>
          <p className="mt-4 text-white">Loading your order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500/20 rounded-full mb-4">
            <CheckCircle className="w-16 h-16 text-green-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-300">
            Thank you for your purchase
          </p>
        </motion.div>

        {/* Order Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-6"
        >
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
            <Package className="w-6 h-6 text-purple-400" />
            Order Summary
          </h2>

          {sessionData ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-gray-300">
                <span>Order ID:</span>
                <span className="font-mono text-sm text-white">
                  {sessionData.id}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-300">
                <span>Payment Status:</span>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                  {sessionData.payment_status}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-300">
                <span>Total Amount:</span>
                <span className="text-2xl font-bold text-white">
                  ${(sessionData.amount_total / 100).toFixed(2)}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-300">
              Your order has been received and is being processed.
            </p>
          )}
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-6"
        >
          <h2 className="text-2xl font-semibold text-white mb-6">
            What&apos;s Next?
          </h2>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">
                  Check Your Email
                </h3>
                <p className="text-gray-300 text-sm">
                  We&apos;ve sent order confirmation and download instructions to your email address.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Download className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">
                  Access Your Products
                </h3>
                <p className="text-gray-300 text-sm">
                  Digital products are available for instant download from your dashboard.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button
            onClick={() => router.push('/dashboard')}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
          >
            Go to Dashboard
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => router.push('/products')}
            className="flex-1 bg-white/10 backdrop-blur-lg text-white px-6 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all border border-white/20"
          >
            Continue Shopping
          </button>
        </motion.div>

        {/* Support */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-gray-400 text-sm mt-8"
        >
          Need help? Contact our support team at{' '}
          <a href="mailto:support@afilo.io" className="text-purple-400 hover:underline">
            support@afilo.io
          </a>
        </motion.p>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent"></div>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
