import { Hero } from '@/components/marketing/Hero';
import { TrustBar } from '@/components/marketing/TrustBar';
import { ProblemSection } from '@/components/marketing/ProblemSection';
import { HowItWorks } from '@/components/marketing/HowItWorks';
import { Features } from '@/components/marketing/Features';
import { Architecture } from '@/components/marketing/Architecture';
import { DeveloperSection } from '@/components/marketing/DeveloperSection';
import { ResultSection } from '@/components/marketing/ResultSection';
import { FaqSection } from '@/components/marketing/FaqSection';
import { FinalCta } from '@/components/marketing/FinalCta';

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <ProblemSection />
      <HowItWorks />
      <Features />
      <Architecture />
      <ResultSection />
      <DeveloperSection />
      <FaqSection />
      <FinalCta />
    </>
  );
}
