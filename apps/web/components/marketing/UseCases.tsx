import React from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { useCases } from '@/lib/content';

export function UseCases() {
  return (
    <section id="use-cases" className="border-b border-line-soft">
      <div className="mx-auto max-w-shell px-6 py-24">
        <SectionHeading eyebrow="Use cases" title="Built for learning platforms." />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {useCases.map((useCase, index) => (
            <Reveal key={useCase.title} delay={index * 0.04} className="h-full">
              <article className="flex h-full flex-col rounded-xl border border-line bg-surface p-6 transition-colors duration-150 ease-out hover:border-line-strong">
                <span className="font-mono text-[11px] tracking-[0.16em] text-faint">{useCase.index}</span>
                <h3 className="mt-6 text-[15px] font-medium text-white">{useCase.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-faint">{useCase.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
