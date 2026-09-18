import React from 'react';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';

export function Hero() {
  return (
    <section id="top" className="border-b border-line-soft">
      <div className="mx-auto max-w-shell px-6 pb-28 pt-24 sm:pb-36 sm:pt-32">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-sm text-faint">
            AI code assessment <span className="text-white">API</span>
          </p>
          <h1 className="mt-6 text-5xl font-semibold leading-[1.02] tracking-[-0.035em] text-white sm:text-6xl lg:text-7xl">
            One API.
            <br />
            Reliable code grading.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-muted sm:text-[17px]">
            Codeverity is the code assessment API built for learning platforms.
            <br className="hidden sm:block" /> Grade student code with multiple models from one place.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button to="/signup">Get started</Button>
            <Button href="mailto:dev@codeverity.dev?subject=Codeverity%20sales%20enquiry" variant="secondary">
              Contact sales
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
