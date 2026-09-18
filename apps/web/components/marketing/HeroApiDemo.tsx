'use client';

import React, { useEffect, useState } from 'react';
import { ArrowUpRightIcon, CheckIcon } from 'lucide-react';
import { Panel } from '@/components/ui/Panel';

const stages = [
  { label: 'Independent assessments', detail: 'OpenAI · Gemini · Llama' },
  { label: 'Reassessment engine', detail: 'Evaluated against criteria' },
  { label: 'Validated feedback', detail: 'Returned to your platform' },
];

export function HeroApiDemo() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setActive(stages.length - 1);
      return;
    }
    const timer = window.setInterval(() => {
      setActive((value) => (value + 1) % stages.length);
    }, 2200);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <Panel
        className="lg:col-span-3"
        label={
          <>
            <span className="text-white">POST</span>
            <span className="text-muted">/v1/assessments</span>
          </>
        }
        trailing={<ArrowUpRightIcon aria-hidden="true" className="h-3.5 w-3.5 text-faint" />}
      >
        <pre className="overflow-x-auto px-5 py-5 font-mono text-[12.5px] leading-6 text-muted">
          <code>
            {'{\n  '}
            <span className="text-white">&quot;language&quot;</span>
            {': '}
            <span className="text-accent">&quot;python&quot;</span>
            {',\n  '}
            <span className="text-white">&quot;assignment&quot;</span>
            {': {\n    '}
            <span className="text-white">&quot;title&quot;</span>
            {': '}
            <span className="text-accent">&quot;Find the maximum number&quot;</span>
            {',\n    '}
            <span className="text-white">&quot;requirements&quot;</span>
            {': '}
            <span className="text-accent">&quot;Return the largest value&quot;</span>
            {'\n  },\n  '}
            <span className="text-white">&quot;submission&quot;</span>
            {': {\n    '}
            <span className="text-white">&quot;code&quot;</span>
            {': '}
            <span className="text-accent">&quot;def find_max(numbers): ...&quot;</span>
            {'\n  }\n}'}
          </code>
        </pre>
      </Panel>

      <Panel className="lg:col-span-2" label="Assessment pipeline">
        <ol className="divide-y divide-line">
          {stages.map((stage, index) => {
            const isActive = index === active;
            const isDone = index < active;
            return (
              <li key={stage.label} className="flex items-start gap-3 px-5 py-4">
                <span
                  aria-hidden="true"
                  className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 ease-out ${
                    isActive ? 'border-accent bg-accent/15' : isDone ? 'border-ok/60' : 'border-line-strong'
                  }`}
                >
                  {isDone ? (
                    <CheckIcon className="h-2.5 w-2.5 text-ok" />
                  ) : (
                    <span
                      className={`h-1.5 w-1.5 rounded-full transition-colors duration-200 ease-out ${
                        isActive ? 'bg-accent' : 'bg-line-strong'
                      }`}
                    />
                  )}
                </span>
                <span className="min-w-0">
                  <span
                    className={`block text-[13px] transition-colors duration-200 ease-out ${
                      isActive ? 'text-white' : 'text-muted'
                    }`}
                  >
                    {stage.label}
                  </span>
                  <span className="mt-0.5 block font-mono text-[11px] text-faint">{stage.detail}</span>
                </span>
              </li>
            );
          })}
        </ol>
        <div className="border-t border-line bg-surface-2 px-5 py-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">Response</p>
          <pre className="mt-2 font-mono text-[12.5px] leading-6 text-muted">
            <code>
              {'{ '}
              <span className="text-white">&quot;status&quot;</span>
              {': '}
              <span className="text-ok">&quot;completed&quot;</span>
              {', '}
              <span className="text-white">&quot;score&quot;</span>
              {': '}
              <span className="text-violet">9.2</span>
              {' }'}
            </code>
          </pre>
        </div>
      </Panel>
    </div>
  );
}
