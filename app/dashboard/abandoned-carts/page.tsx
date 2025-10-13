'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AbandonedCartWidget from '@/components/dashboard/AbandonedCartWidget';

export default function AbandonedCartsPage() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Abandoned Carts</h1>
        <p className="mt-1 text-gray-600">
          Recover items you left in your cart
        </p>
      </div>

      <AbandonedCartWidget />
    </DashboardLayout>
  );
}
