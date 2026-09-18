import React from 'react';
import { Reveal } from '@/components/ui/Reveal';
import { audiences } from '@/lib/content';

export function TrustBar() {
  return (
    <section aria-label="Positioning" className="border-b border-line-soft bg-surface">
      <div className="mx-auto max-w-shell px-6 py-12">
        <Reveal className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
            Built for the platforms that teach developers
          </p>
          <ul className="flex flex-wrap items-center gap-x-8 gap-y-3">
            {audiences.map((audience) => (
              <li key={audience} className="text-sm text-muted">
                {audience}
              </li>
            ))}
          </ul>
        </Reveal>
        <p className="mt-6 text-sm text-faint">
          Designed for integration into educational and developer platforms.
        </p>
      </div>
    </section>
  );
}
