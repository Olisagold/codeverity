import React from 'react';
import { CheckIcon } from 'lucide-react';

const stages = [
  { label: 'Independent assessments', detail: 'OpenAI · Gemini · Llama' },
  { label: 'Reassessment engine', detail: 'Evaluated against criteria' },
  { label: 'Validated feedback', detail: 'Returned to your platform' },
];

export function AuthAside() {
  return (
    <aside className="hidden h-full flex-col justify-between border-l border-line-soft bg-surface p-12 lg:flex">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
        Multi-model code assessment
      </p>

      <div className="max-w-md">
        <h2 className="text-2xl font-medium leading-snug tracking-[-0.02em] text-white">
          One API key. Every model. One validated result.
        </h2>

        <div className="mt-8 overflow-hidden rounded-xl border border-line bg-base">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-faint">
            <span className="text-white">POST</span>
            <span>/v1/assessments</span>
          </div>
          <ol className="divide-y divide-line">
            {stages.map((stage, index) => (
              <li key={stage.label} className="flex items-start gap-3 px-4 py-3.5">
                <span
                  aria-hidden="true"
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                    index === stages.length - 1 ? 'border-ok/60' : 'border-line-strong'
                  }`}
                >
                  {index === stages.length - 1 ? (
                    <CheckIcon className="h-2.5 w-2.5 text-ok" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  )}
                </span>
                <span>
                  <span className="block text-[13px] text-white">{stage.label}</span>
                  <span className="mt-0.5 block font-mono text-[11px] text-faint">{stage.detail}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <p className="max-w-sm text-[13px] leading-relaxed text-faint">
        Test keys are free while you integrate. No assessment volume is charged during development.
      </p>
    </aside>
  );
}
