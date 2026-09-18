import React from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';

function Node({
  title,
  caption,
  accent = false,
  className = '',
}: {
  title: string;
  caption?: string;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border px-5 py-4 text-center ${
        accent ? 'border-line bg-surface-2' : 'border-line-soft bg-surface'
      } ${className}`}
    >
      <p className="font-mono text-[12px] text-white">{title}</p>
      {caption ? <p className="mt-1 font-mono text-[11px] text-faint">{caption}</p> : null}
    </div>
  );
}

function Connector({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 py-3" aria-hidden="true">
      <span className="h-6 w-px bg-line" />
      {label ? <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">{label}</span> : null}
      <span className="h-6 w-px bg-line" />
    </div>
  );
}

export function Architecture() {
  return (
    <section id="architecture" className="border-b border-line-soft bg-surface">
      <div className="mx-auto max-w-shell px-6 py-24">
        <SectionHeading
          eyebrow="Architecture"
          title="Multiple models. Independent reasoning. One final assessment."
          align="center"
        />

        <Reveal delay={0.05} className="mt-14">
          <div className="mx-auto max-w-2xl rounded-xl border border-line bg-base p-8 sm:p-10">
            <Node title="Your Platform" caption="LMS · coding platform · university" />
            <Connector label="API" />
            <Node title="Codeverity API" accent />
            <Connector />
            <div className="grid grid-cols-3 gap-3">
              <Node title="LLM 1" />
              <Node title="LLM 2" />
              <Node title="LLM 3" />
            </div>
            <Connector />
            <Node title="Reassessment Engine" caption="Evaluation criteria applied" accent />
            <Connector />
            <div className="rounded-lg border border-line bg-surface-2 px-5 py-4 text-center">
              <p className="font-mono text-[12px] text-white">Validated Feedback</p>
              <p className="mt-1 font-mono text-[11px] text-accent">returned over HTTP</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
