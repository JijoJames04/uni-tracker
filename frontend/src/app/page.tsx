import { Metadata } from 'next';
import HeroSection from '@/components/landing/HeroSection';
import WhySection from '@/components/landing/WhySection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import SocialProofSection from '@/components/landing/SocialProofSection';
import UserCountBanner from '@/components/landing/UserCountBanner';
import Footer from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'UniTracker — Free German University Application Tracker for International Students',
  description:
    'The 100% free tracker for international students applying to German universities. Manage uni-assist and direct applications, track deadlines, upload documents, generate AI-powered SOP & LOR prompts, calculate blocked account requirements, and follow your APS & visa journey.',
  keywords: [
    'free german university tracker',
    'uni-assist application tracker',
    'study in germany international students',
    'german masters application',
    'daad scholarship application tracker',
    'blocked account germany calculator',
    'german student visa guide',
    'aps germany document checklist',
    'studienkolleg tracker',
    'sop generator germany',
    'lor generator masters germany',
    'german university deadline tracker',
    'indian students germany masters',
    'how to apply to german universities',
  ],
  openGraph: {
    title: 'UniTracker — Free German University Application Tracker',
    description:
      'Track all your German university applications, organize APS documents, calculate blocked account amounts, generate AI prompts for SOP & LOR — completely free for international students.',
    type: 'website',
    locale: 'en_US',
    siteName: 'UniTracker',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UniTracker — The Free Tracker for Studying in Germany',
    description:
      'Manage uni-assist limits, APS documents, blocked account setup, and application deadlines in one elegant, free platform built for international students.',
  },
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#060D1A] text-white overflow-x-hidden selection:bg-indigo-500/30">

      {/* Hero — above the fold */}
      <HeroSection />

      {/* Why UniTracker — mission and value */}
      <WhySection />

      {/* Features — all 12 tools */}
      <FeaturesSection />

      {/* Social proof — testimonials and stats */}
      <SocialProofSection />

      {/* Live user count if available */}
      <UserCountBanner />

      {/* Footer */}
      <Footer />

      {/* Schema.org JSON-LD Structured Data for Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'UniTracker',
            url: 'https://unitracker.app',
            operatingSystem: 'All',
            applicationCategory: 'EducationalApplication',
            description:
              'Free all-in-one platform for international students applying to German universities. Includes deadline tracking, document management, AI prompt generation, blocked account calculator, APS guide, and visa steps.',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'EUR',
              seller: { '@type': 'Organization', name: 'UniTracker' },
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '5',
              ratingCount: '87',
            },
          }),
        }}
      />
    </div>
  );
}
