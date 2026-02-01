'use client';

import HeroSection from '@/components/landing/HeroSection';
import FeatureSection from '@/components/landing/FeatureSection';
import InstallAppSection from '@/components/landing/InstallAppSection';
import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-background transition-colors duration-500">
      <HeroSection />
      <FeatureSection />
      <InstallAppSection />
      <Footer />
    </div>
  );
}
