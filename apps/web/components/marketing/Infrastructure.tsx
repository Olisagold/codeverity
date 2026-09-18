import React from 'react';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { infrastructure } from '@/lib/content';

export function Infrastructure() {
  return (
    <section id="infrastructure" className="border-b border-line-soft bg-surface">
      <div className="mx-auto max-w-shell px-6 py-24">
        <SectionHeading eyebrow="Infrastructure" title="Infrastructure developers expect." />

        <Reveal delay={0.05} className="mt-12">
          <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-5">
            {infrastructure.map((item) => (
              <div key={item.title} className="border-t border-line pt-4">
                <dt className="font-mono text-[12.5px] text-white">{item.title}</dt>
                <dd className="mt-2 text-[13px] leading-relaxed text-faint">{item.body}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
