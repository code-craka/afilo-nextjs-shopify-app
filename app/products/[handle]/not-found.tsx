import Link from 'next/link';
import { ArrowLeft, Search, Package } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Package className="h-16 w-16 text-gray-300 dark:text-gray-600" />
            <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1">
              <Search className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Product Not Found
        </h1>

        {/* Description */}
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          We couldn't find the product you're looking for. It may have been moved, renamed, or is no longer available.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Browse All Products
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium py-3 px-6 rounded-lg border border-gray-300 dark:border-gray-600 transition-colors"
          >
            Go to Homepage
          </Link>
        </div>

        {/* Help text */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
          Need help finding a specific product?{' '}
          <Link href="/contact" className="text-blue-600 hover:text-blue-500 font-medium">
            Contact our support team
          </Link>
        </p>
      </div>
    </div>
  );
}