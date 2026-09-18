import React from 'react';
import { CheckIcon } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { evaluationCriteria } from '@/lib/content';

export function TransparencySection() {
  return (
    <section id="transparency" className="border-b border-line-soft">
      <div className="mx-auto max-w-shell px-6 py-24">
        <SectionHeading
          eyebrow="Transparency"
          title="See how the final feedback was produced."
          description="Codeverity doesn't simply return the first model's response. Independent assessments are compared against defined evaluation criteria before the final prescription is selected or refined."
        />

        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <div className="h-full rounded-xl border border-line bg-surface p-6 sm:p-8">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-line-soft bg-base p-5">
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-faint">Model A</p>
                  <p className="mt-3 font-mono text-[13px] leading-6 text-muted">
                    &quot;Initialize <span className="text-white">max_num</span> with 0&quot;
                  </p>
                </div>
                <div className="rounded-lg border border-line-soft bg-base p-5">
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-faint">Model B</p>
                  <p className="mt-3 font-mono text-[13px] leading-6 text-muted">
                    &quot;Initialize with <span className="text-white">first element</span>&quot;
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center py-3" aria-hidden="true">
                <span className="h-5 w-px bg-line" />
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">Disagreement</span>
                <span className="h-5 w-px bg-line" />
              </div>

              <div className="rounded-lg border border-line bg-surface-2 px-5 py-4 text-center">
                <p className="font-mono text-[12px] text-white">Reassessment</p>
                <p className="mt-1 font-mono text-[11px] text-faint">Prescriptions scored against criteria</p>
              </div>

              <div className="flex flex-col items-center py-3" aria-hidden="true">
                <span className="h-10 w-px bg-line" />
              </div>

              <div className="rounded-lg border border-line bg-base px-5 py-4">
                <p className="flex items-center justify-center gap-2 font-mono text-[12px] text-white">
                  <CheckIcon aria-hidden="true" className="h-3.5 w-3.5 text-ok" />
                  Final prescription
                </p>
                <p className="mt-2 text-center font-mono text-[12px] text-accent">
                  &quot;Initialize with first element · handle empty list&quot;
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="h-full rounded-xl border border-line bg-surface p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-faint">Evaluation criteria</p>
              <ul className="mt-6 space-y-3">
                {evaluationCriteria.map((criterion) => (
                  <li key={criterion} className="flex items-start gap-2.5 text-sm text-muted">
                    <CheckIcon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-ok" />
                    {criterion}
                  </li>
                ))}
              </ul>
              <p className="mt-6 border-t border-line pt-6 text-[13px] leading-relaxed text-faint">
                Each criterion is scored independently, so your platform can surface why a recommendation was
                selected.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
