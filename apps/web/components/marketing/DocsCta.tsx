import React from 'react';
import { ArrowRightIcon } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { Button } from '@/components/ui/Button';

export function DocsCta() {
  return (
    <section aria-label="Documentation" className="border-b border-line-soft">
      <div className="mx-auto max-w-shell px-6 py-20">
        <Reveal>
          <div className="flex flex-col gap-6 rounded-xl border border-line bg-surface p-8 lg:flex-row lg:items-center lg:justify-between lg:p-10">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-faint">Ready to build?</p>
              <h2 className="mt-3 text-2xl font-medium tracking-[-0.02em] text-white">
                Start integrating Codeverity today.
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button to="/docs/introduction">
                Read the documentation
                <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
              </Button>
              <Button to="/signup" variant="secondary">
                Get your API key
                <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
