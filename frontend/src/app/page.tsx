import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import UserCountBanner from '@/components/landing/UserCountBanner';
import Footer from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      <HeroSection />
      <FeaturesSection />
      <UserCountBanner />
      <Footer />
    </div>
  );
}
