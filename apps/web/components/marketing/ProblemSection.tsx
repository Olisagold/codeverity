import React from 'react';
import { CheckIcon } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { problemColumns } from '@/lib/content';

export function ProblemSection() {
  return (
    <section id="problem" className="border-b border-line-soft">
      <div className="mx-auto max-w-shell px-6 py-24">
        <SectionHeading
          eyebrow="The problem"
          title="One submission. Multiple perspectives. One validated result."
          description="AI-generated programming feedback is only useful when it is correct. Codeverity treats reliability as the product, not a side effect of a single model call."
        />

        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {problemColumns.map((column, index) => (
            <Reveal key={column.title} delay={index * 0.05} className="h-full">
              <article
                className={`flex h-full flex-col rounded-xl border p-6 transition-colors duration-150 ease-out ${
                  column.emphasis
                    ? 'border-line bg-surface hover:border-line-strong'
                    : 'border-line-soft bg-base hover:border-line'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono text-[11px] uppercase tracking-[0.18em] ${
                      column.emphasis ? 'text-accent' : 'text-faint'
                    }`}
                  >
                    {column.label}
                  </span>
                  {column.emphasis ? (
                    <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ok">
                      <CheckIcon aria-hidden="true" className="h-3.5 w-3.5" />
                      Validated
                    </span>
                  ) : null}
                </div>
                <h3
                  className={`mt-6 text-lg font-medium tracking-[-0.01em] ${
                    column.emphasis ? 'text-white' : 'text-muted'
                  }`}
                >
                  {column.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-faint">{column.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
