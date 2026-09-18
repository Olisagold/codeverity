import React from 'react';
import { ArrowRightIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Reveal } from '@/components/ui/Reveal';
import { HeroApiDemo } from './HeroApiDemo';
import { HeroBackground } from './HeroBackground';

export function Hero() {
  return (
    <section id="top" className="relative isolate overflow-hidden border-b border-line-soft">
      <HeroBackground />
      <div className="relative mx-auto max-w-shell px-6 pb-20 pt-20 sm:pt-28">
        <Reveal className="mx-auto max-w-3xl text-center">
          <Eyebrow dot className="justify-center">
            AI code assessment API
          </Eyebrow>
          <h1 className="mt-6 text-4xl font-medium leading-[1.08] tracking-[-0.03em] text-white sm:text-5xl lg:text-6xl">
            Multi-model code assessment through one API.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-relaxed text-muted sm:text-base">
            Codeverity helps educational and coding platforms evaluate student code using multiple LLMs and an
            independent reassessment layer for more reliable, actionable feedback.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button to="/signup">
              Start building
              <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
            </Button>
            <Button to="/docs/quickstart" variant="secondary">
              Read the docs
            </Button>
          </div>
        </Reveal>

        <Reveal delay={0.08} className="mt-16">
          <HeroApiDemo />
        </Reveal>
      </div>
    </section>
  );
}
