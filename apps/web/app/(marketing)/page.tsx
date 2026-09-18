import { Hero } from '@/components/marketing/Hero';
import { TrustBar } from '@/components/marketing/TrustBar';
import { ProblemSection } from '@/components/marketing/ProblemSection';
import { HowItWorks } from '@/components/marketing/HowItWorks';
import { Features } from '@/components/marketing/Features';
import { Architecture } from '@/components/marketing/Architecture';
import { DeveloperSection } from '@/components/marketing/DeveloperSection';
import { ResultSection } from '@/components/marketing/ResultSection';
import { TransparencySection } from '@/components/marketing/TransparencySection';
import { ResearchSection } from '@/components/marketing/ResearchSection';
import { UseCases } from '@/components/marketing/UseCases';
import { Infrastructure } from '@/components/marketing/Infrastructure';
import { DocsCta } from '@/components/marketing/DocsCta';
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
      <TransparencySection />
      <ResearchSection />
      <UseCases />
      <Infrastructure />
      <DocsCta />
      <FinalCta />
    </>
  );
}
