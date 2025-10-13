'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Package } from 'lucide-react';

export default function ProductsPage() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
        <p className="mt-1 text-gray-600">
          View and manage your purchased products
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No products yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start browsing our product catalog to get started
          </p>
          <a
            href="/products"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Products
          </a>
        </div>
      </div>
    </DashboardLayout>
  );
}
