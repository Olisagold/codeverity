'use client';

import React, { useEffect, useState } from 'react';
import { CheckIcon, Loader2Icon, PlayIcon, RotateCcwIcon } from 'lucide-react';

type Phase = 'idle' | 'queued' | 'assessing' | 'reassessing' | 'completed';

const phaseOrder: Phase[] = ['queued', 'assessing', 'reassessing', 'completed'];

const stages = [
  { phase: 'queued', label: 'Queued', detail: 'Assessment accepted' },
  { phase: 'assessing', label: 'Model assessments', detail: 'OpenAI · Gemini · Llama' },
  { phase: 'reassessing', label: 'Reassessment', detail: 'Scored against criteria' },
  { phase: 'completed', label: 'Final result', detail: 'Returned to your platform' },
] as const;

export function TryCodeverity() {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('def find_max(numbers):\n    return max(numbers)');
  const [assignment, setAssignment] = useState('Find the maximum value in a list of integers.');
  const [phase, setPhase] = useState<Phase>('idle');

  useEffect(() => {
    if (phase === 'idle' || phase === 'completed') return;
    const next = phaseOrder[phaseOrder.indexOf(phase) + 1];
    const timer = window.setTimeout(() => setPhase(next), 700);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const running = phase !== 'idle' && phase !== 'completed';
  const activeIndex = phase === 'idle' ? -1 : phaseOrder.indexOf(phase);

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-faint">Try Codeverity</span>
        <span className="font-mono text-[11px] text-faint">simulated response</span>
      </div>

      <div className="grid lg:grid-cols-2">
        <div className="space-y-4 border-b border-line p-4 lg:border-b-0 lg:border-r">
          <div>
            <label htmlFor="try-language" className="font-mono text-[11px] uppercase tracking-[0.12em] text-faint">
              Language
            </label>
            <select
              id="try-language"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="mt-2 h-10 w-full rounded-lg border border-line bg-base px-3 font-mono text-[12.5px] text-white transition-colors duration-150 ease-out hover:border-line-strong focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="python">python</option>
              <option value="javascript">javascript</option>
              <option value="java">java</option>
            </select>
          </div>

          <div>
            <label htmlFor="try-code" className="font-mono text-[11px] uppercase tracking-[0.12em] text-faint">
              Submission
            </label>
            <textarea
              id="try-code"
              rows={4}
              value={code}
              onChange={(event) => setCode(event.target.value)}
              spellCheck={false}
              className="mt-2 w-full resize-y rounded-lg border border-line bg-base p-3 font-mono text-[12.5px] leading-6 text-white transition-colors duration-150 ease-out hover:border-line-strong focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div>
            <label htmlFor="try-assignment" className="font-mono text-[11px] uppercase tracking-[0.12em] text-faint">
              Assignment requirements
            </label>
            <textarea
              id="try-assignment"
              rows={2}
              value={assignment}
              onChange={(event) => setAssignment(event.target.value)}
              className="mt-2 w-full resize-y rounded-lg border border-line bg-base p-3 text-[13px] leading-6 text-white transition-colors duration-150 ease-out hover:border-line-strong focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={running}
              onClick={() => setPhase('queued')}
              className="flex h-10 items-center gap-2 rounded-lg bg-white px-4 text-[13px] font-medium text-black transition-colors duration-150 ease-out hover:bg-muted disabled:cursor-not-allowed disabled:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              {running ? <Loader2Icon aria-hidden="true" className="h-3.5 w-3.5 animate-spin" /> : <PlayIcon aria-hidden="true" className="h-3.5 w-3.5" />}
              Run assessment
            </button>
            {phase === 'completed' ? (
              <button
                type="button"
                onClick={() => setPhase('idle')}
                className="flex h-10 items-center gap-2 rounded-lg border border-line-strong px-4 text-[13px] text-white transition-colors duration-150 ease-out hover:border-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <RotateCcwIcon aria-hidden="true" className="h-3.5 w-3.5" />
                Reset
              </button>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col">
          <ol className="divide-y divide-line">
            {stages.map((stage, index) => {
              const isActive = activeIndex === index && phase !== 'completed';
              const isDone = activeIndex > index || phase === 'completed';
              return (
                <li key={stage.phase} className="flex items-start gap-3 px-4 py-3">
                  <span
                    aria-hidden="true"
                    className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 ease-out ${
                      isDone ? 'border-ok/60' : isActive ? 'border-accent' : 'border-line-strong'
                    }`}
                  >
                    {isDone ? <CheckIcon className="h-2.5 w-2.5 text-ok" /> : <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-accent' : 'bg-line-strong'}`} />}
                  </span>
                  <span>
                    <span className={`block text-[13px] ${isDone || isActive ? 'text-white' : 'text-faint'}`}>{stage.label}</span>
                    <span className="mt-0.5 block font-mono text-[11px] text-faint">{stage.detail}</span>
                  </span>
                </li>
              );
            })}
          </ol>

          <div className="mt-auto border-t border-line bg-base px-4 py-4">
            {phase === 'completed' ? (
              <pre className="overflow-x-auto font-mono text-[12.5px] leading-6 text-muted">
                <code>{`{
  "status": "completed",
  "language": "${language}",
  "score": 9.2,
  "confidence": 0.92,
  "suggestions": [
    "Handle an empty input list explicitly."
  ]
}`}</code>
              </pre>
            ) : (
              <p className="font-mono text-[12px] text-faint">{running ? 'Waiting for model assessments…' : 'Run an assessment to see the final result.'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
