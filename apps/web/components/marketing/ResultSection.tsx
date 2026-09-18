import React from 'react';
import { CheckCircle2Icon } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { scoreBreakdown } from '@/lib/content';

const suggestedCode = `def find_max(numbers):
    if not numbers:
        return None

    max_num = numbers[0]

    for n in numbers[1:]:
        if n > max_num:
            max_num = n

    return max_num`;

export function ResultSection() {
  return (
    <section id="result" className="border-b border-line-soft bg-surface">
      <div className="mx-auto max-w-shell px-6 py-24">
        <SectionHeading
          eyebrow="The result"
          title="Feedback your application can actually use."
          description="Every assessment returns a score breakdown, an explanation, a suggested implementation, and a confidence value."
        />

        <Reveal delay={0.05} className="mt-14">
          <div className="overflow-hidden rounded-xl border border-line bg-base">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-6 py-4">
              <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ok">
                <CheckCircle2Icon aria-hidden="true" className="h-3.5 w-3.5" />
                Assessment completed
              </p>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">asm_01J8QF··· · python</p>
            </div>

            <div className="grid lg:grid-cols-2">
              <div className="border-b border-line p-6 lg:border-b-0 lg:border-r">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-medium tracking-[-0.03em] text-white">9.2</span>
                  <span className="font-mono text-[13px] text-faint">/ 10</span>
                </div>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-faint">Score</p>

                <ul className="mt-8 space-y-3">
                  {scoreBreakdown.map((item) => (
                    <li key={item.label} className="flex items-center gap-4">
                      <span className="w-36 shrink-0 text-[13px] text-muted">{item.label}</span>
                      <span className="h-1 flex-1 overflow-hidden rounded-full bg-line-soft">
                        <span className="block h-full bg-accent" style={{ width: `${item.value * 10}%` }} />
                      </span>
                      <span className="w-10 shrink-0 text-right font-mono text-[12px] text-white">
                        {item.value.toFixed(1)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 border-t border-line pt-6">
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-faint">Feedback</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    Your implementation fails when the list contains only negative numbers, because{' '}
                    <span className="font-mono text-[13px] text-white">max_num</span> is initialized to 0. Initialize
                    it with the first element instead, and handle the empty-list case explicitly.
                  </p>
                </div>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center justify-between border-b border-line px-6 py-3">
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-faint">Suggested code</p>
                  <p className="font-mono text-[11px] text-faint">main.py</p>
                </div>
                <pre className="flex-1 overflow-x-auto px-6 py-5 font-mono text-[12.5px] leading-6 text-muted">
                  <code>{suggestedCode}</code>
                </pre>
                <div className="flex items-center justify-between border-t border-line px-6 py-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-faint">Confidence</p>
                  <p className="font-mono text-[13px] text-white">92%</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
