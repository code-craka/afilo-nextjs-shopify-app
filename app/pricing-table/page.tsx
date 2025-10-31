import StripePricingTable from '@/components/StripePricingTable';

export const metadata = {
  title: 'Pricing - All Products | Afilo',
  description: 'Browse all our digital products and choose the perfect plan for your needs',
};

export default function PricingTablePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <StripePricingTable />
    </div>
  );
}
