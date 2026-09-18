import React from 'react';
import { ArrowRightIcon } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { Button } from '@/components/ui/Button';
import { researchConfigurations, researchMetrics } from '@/lib/content';

export function ResearchSection() {
  return (
    <section id="research" className="border-b border-line-soft bg-surface">
      <div className="mx-auto max-w-shell px-6 py-24">
        <SectionHeading
          eyebrow="Research"
          title="Built on an evaluation-driven approach."
          description="Codeverity is designed around a research question: can independent multi-model assessment followed by reassessment improve the quality of AI-generated programming feedback?"
        />

        <Reveal delay={0.05} className="mt-14">
          <div className="rounded-xl border border-line bg-base p-6 sm:p-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-faint">Evaluation</p>
            <div className="mt-6 flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
              {researchConfigurations.map((config, index) => (
                <React.Fragment key={config.title}>
                  {index > 0 ? (
                    <span className="self-center font-mono text-[11px] uppercase tracking-[0.16em] text-faint">
                      vs
                    </span>
                  ) : null}
                  <div
                    className={`flex-1 rounded-lg border px-5 py-4 ${
                      index === researchConfigurations.length - 1 ? 'border-line bg-surface-2' : 'border-line-soft bg-surface'
                    }`}
                  >
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">{config.label}</p>
                    <p className="mt-2 text-[15px] font-medium text-white">{config.title}</p>
                    <p className="mt-2 text-[13px] leading-relaxed text-faint">{config.detail}</p>
                  </div>
                </React.Fragment>
              ))}
            </div>

            <div className="mt-8 border-t border-line pt-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-faint">Measured across</p>
              <ul className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                {researchMetrics.map((metric) => (
                  <li key={metric} className="font-mono text-[12.5px] text-muted">
                    {metric}
                  </li>
                ))}
              </ul>
            </div>

            <Button to="/docs/research/methodology" variant="secondary" className="mt-8">
              Explore the methodology
              <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
