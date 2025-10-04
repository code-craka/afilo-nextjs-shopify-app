import Link from 'next/link';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import TrustBadgesGrid from '@/components/TrustBadgesGrid';
import FeatureHighlights from '@/components/FeatureHighlights';
import HomePageProductGrid from '@/components/HomePageProductGrid';
import LiveMetricsDashboard from '@/components/LiveMetricsDashboard';
import ClientLogoWall from '@/components/ClientLogoWall';
import HowItWorks from '@/components/HowItWorks';
import ROICalculator from '@/components/ROICalculator';
import IndustrySolutions from '@/components/IndustrySolutions';
import CustomerSuccessStories from '@/components/CustomerSuccessStories';
import PlatformArchitecture from '@/components/PlatformArchitecture';
import SecurityComplianceBanner from '@/components/SecurityComplianceBanner';
import TechnologyShowcase from '@/components/TechnologyShowcase';
import IntegrationShowcase from '@/components/IntegrationShowcase';
import PricingComparisonTable from '@/components/PricingComparisonTable';
import FAQSection from '@/components/FAQSection';
import PrimaryCTASection from '@/components/PrimaryCTASection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Premium Navigation */}
      <Navigation />

      {/* Animated Hero Section (Client Component) */}
      <HeroSection />

      {/* Trust Badges Grid - Immediate Credibility */}
      <TrustBadgesGrid />

      {/* Feature Highlights - Core Capabilities */}
      <FeatureHighlights />

      {/* Featured Products Section (Client Component) */}
      <HomePageProductGrid />

      {/* Live Enterprise Metrics - $50M+ Revenue Positioning */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <LiveMetricsDashboard />
        </div>
      </div>

      {/* Client Logo Wall - Fortune 500 Trust */}
      <ClientLogoWall />

      {/* How It Works - Enterprise Journey */}
      <HowItWorks />

      {/* ROI Calculator - Interactive Investment Analysis */}
      <ROICalculator />

      {/* Industry Solutions - Tailored for Your Sector */}
      <IndustrySolutions />

      {/* Customer Success Stories - Fortune 500 Case Studies */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <CustomerSuccessStories />
        </div>
      </div>

      {/* Platform Architecture - Military-Grade Infrastructure */}
      <PlatformArchitecture />

      {/* Security & Compliance Banner - SOC 2, ISO 27001, HIPAA */}
      <SecurityComplianceBanner />

      {/* Technology Excellence - Existing Tech Showcase */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <TechnologyShowcase />
        </div>
      </div>

      {/* Integration Showcase - 25+ Platform Integrations */}
      <IntegrationShowcase />

      {/* Pricing Comparison Table - Transparent Enterprise Pricing */}
      <PricingComparisonTable />

      {/* FAQ Section */}
      <FAQSection />

      {/* Primary CTA Section - Before Footer */}
      <PrimaryCTASection />

      {/* Enhanced Enterprise Footer with Legal Links */}
      <Footer />
    </div>
  );
}