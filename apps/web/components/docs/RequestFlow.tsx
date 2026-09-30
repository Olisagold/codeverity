import React from 'react';
import Image from 'next/image';
import { ArrowDownIcon, ArrowRightIcon, CheckIcon, MonitorIcon } from 'lucide-react';
import { ClaudeMark, DeepSeekMark, GeminiMark, OpenAIMark } from '@/components/ui/BrandMarks';

const MODELS = [
  { name: 'ChatGPT', Mark: OpenAIMark },
  { name: 'Gemini', Mark: GeminiMark },
  { name: 'DeepSeek', Mark: DeepSeekMark },
];

function Step({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">{label}</span>
      {children}
    </div>
  );
}

function Node({ icon, title, accent = false }: { icon: React.ReactNode; title: string; accent?: boolean }) {
  return (
    <div
      className={`flex min-h-[42px] w-full items-center gap-2 rounded-lg border px-2.5 py-2 ${
        accent ? 'border-line-strong bg-surface-2' : 'border-line bg-base'
      }`}
    >
      <span className="flex h-4 w-4 shrink-0 items-center justify-center">{icon}</span>
      <span className="text-[12.5px] leading-tight text-white">{title}</span>
    </div>
  );
}

function Arrow() {
  return (
    <span aria-hidden="true" className="flex shrink-0 items-center justify-center text-faint md:pt-6">
      <ArrowRightIcon className="hidden h-4 w-4 md:block" />
      <ArrowDownIcon className="h-4 w-4 md:hidden" />
    </span>
  );
}

/** How a request moves through Codeverity: submit, assess with three models, reassess with Claude, return. */
export function RequestFlow() {
  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-surface">
      <div
        role="img"
        aria-label="Your platform sends a submission to the Codeverity API. ChatGPT, Gemini and DeepSeek assess it independently. Claude reassesses their feedback. The final result is returned to your platform."
        className="flex flex-col items-stretch gap-3 px-4 py-6 sm:px-5 md:flex-row md:items-start md:gap-1.5"
      >
        <Step label="Submit">
          <Node icon={<MonitorIcon aria-hidden="true" className="h-4 w-4 text-muted" />} title="Your platform" />
        </Step>
        <Arrow />
        <Step label="API">
          <Node
            accent
            icon={<Image src="/icons/logo.png" alt="" width={24} height={14} className="h-3.5 w-auto" />}
            title="Codeverity"
          />
        </Step>
        <Arrow />
        <Step label="Assess">
          <div className="flex w-full flex-col gap-1.5">
            {MODELS.map(({ name, Mark }) => (
              <Node key={name} icon={<Mark aria-hidden="true" className="h-4 w-4 text-muted" />} title={name} />
            ))}
          </div>
        </Step>
        <Arrow />
        <Step label="Reassess">
          <Node accent icon={<ClaudeMark aria-hidden="true" className="h-4 w-4 text-[#D97757]" />} title="Claude" />
        </Step>
        <Arrow />
        <Step label="Result">
          <Node icon={<CheckIcon aria-hidden="true" className="h-4 w-4 text-ok" />} title="Final result" />
        </Step>
      </div>
      <figcaption className="border-t border-line px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-faint">
        Submit → assess → reassess → result
      </figcaption>
    </figure>
  );
}
