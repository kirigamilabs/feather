import { Metadata } from 'next';
import HeroSection from './../components/HeroSection';
import FeaturesSection from './../components/FeaturesSection';
import { StatsSection } from './../components/StatsSection';
//import ThemeProvider from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'Kirigami - AI-Powered Crypto Management',
  description: 'Revolutionary decentralized platform integrating advanced AI capabilities for comprehensive crypto management, automation, and investment services.',
};

export default function Home() {
  return (
      <main className="min-h-screen">
        <HeroSection />
        <FeaturesSection />
        <StatsSection />
      </main>
  );
}