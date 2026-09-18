import React from 'react';
import { ArrowRightIcon } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { Button } from '@/components/ui/Button';

export function FinalCta() {
  return (
    <section id="cta" className="border-b border-line-soft">
      <div className="mx-auto max-w-shell px-6 py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-medium leading-tight tracking-[-0.02em] text-white sm:text-4xl">
            Give your platform a more reliable way to assess code.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
            Integrate multi-model code assessment through a single API.
          </p>
          <div className="mt-8 flex justify-center">
            <Button to="/signup">
              Start building
              <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
