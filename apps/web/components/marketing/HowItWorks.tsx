import React from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { evaluationCriteria } from '@/lib/content';

interface Step {
  index: string;
  title: string;
  body: string;
  visual: React.ReactNode;
}

const steps: Step[] = [
  {
    index: '01',
    title: 'Submit',
    body: 'Send student code, assignment requirements, language, and optional context through the API.',
    visual: (
      <p className="font-mono text-[13px]">
        <span className="text-white">POST</span> <span className="text-muted">/v1/assessments</span>
      </p>
    ),
  },
  {
    index: '02',
    title: 'Assess',
    body: 'Multiple LLMs independently analyze the submission and generate assessments and prescriptions.',
    visual: (
      <div className="flex flex-wrap gap-2">
        {['OpenAI', 'Gemini', 'Llama'].map((model) => (
          <span key={model} className="rounded-md border border-line px-2.5 py-1 font-mono text-[12px] text-muted">
            {model}
          </span>
        ))}
      </div>
    ),
  },
  {
    index: '03',
    title: 'Reassess',
    body: 'A dedicated reassessment model compares the generated prescriptions against defined evaluation criteria.',
    visual: (
      <ul className="flex flex-wrap gap-x-5 gap-y-2">
        {evaluationCriteria.slice(0, 4).concat(['Pedagogy']).map((criterion) => (
          <li key={criterion} className="font-mono text-[12px] text-faint">
            {criterion}
          </li>
        ))}
      </ul>
    ),
  },
  {
    index: '04',
    title: 'Deliver',
    body: 'Codeverity returns refined feedback, suggested changes, and confidence information through the API.',
    visual: (
      <pre className="font-mono text-[12.5px] leading-6 text-muted">
        <code>
          {'{\n  '}
          <span className="text-white">&quot;status&quot;</span>
          {': '}
          <span className="text-ok">&quot;completed&quot;</span>
          {',\n  '}
          <span className="text-white">&quot;score&quot;</span>
          {': '}
          <span className="text-violet">9.2</span>
          {',\n  '}
          <span className="text-white">&quot;confidence&quot;</span>
          {': '}
          <span className="text-violet">0.92</span>
          {'\n}'}
        </code>
      </pre>
    ),
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-line-soft bg-surface">
      <div className="mx-auto max-w-shell px-6 py-24">
        <SectionHeading eyebrow="How it works" title="From code submission to validated feedback." />

        <ol className="mt-14 border-t border-line-soft">
          {steps.map((step, index) => (
            <li key={step.index}>
              <Reveal delay={index * 0.04}>
                <div className="grid gap-6 border-b border-line-soft py-10 lg:grid-cols-12 lg:items-start lg:gap-10">
                  <div className="lg:col-span-1">
                    <span className="font-mono text-[12px] text-faint">{step.index}</span>
                  </div>
                  <div className="lg:col-span-5">
                    <h3 className="text-lg font-medium tracking-[-0.01em] text-white">{step.title}</h3>
                    <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">{step.body}</p>
                  </div>
                  <div className="lg:col-span-6">
                    <div className="rounded-lg border border-line bg-base px-5 py-4">{step.visual}</div>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
