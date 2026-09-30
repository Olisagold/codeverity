/**
 * Visual diagrams for the docs. They share a small set of primitives (Node,
 * StepLabel, FlowArrow) so every diagram reads as part of one system, and they
 * render without a surrounding card so they sit directly in the page.
 */
import React from 'react';
import Image from 'next/image';
import { ArrowDownIcon, ArrowRightIcon, CheckIcon, GitCompareIcon, ListChecksIcon, MonitorIcon, PenLineIcon, ShuffleIcon } from 'lucide-react';
import { ClaudeMark, DeepSeekMark, GeminiMark, OpenAIMark } from '@/components/ui/BrandMarks';

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

const MODELS = [
  { name: 'ChatGPT', Mark: OpenAIMark, score: '8.5' },
  { name: 'Gemini', Mark: GeminiMark, score: '9.0' },
  { name: 'DeepSeek', Mark: DeepSeekMark, score: '8.8' },
];

function CvLogo({ className = 'h-3.5 w-auto' }: { className?: string }) {
  return <Image src="/icons/logo.png" alt="" width={24} height={14} className={className} />;
}

function ClaudeIcon() {
  return <ClaudeMark aria-hidden="true" className="h-4 w-4 text-[#D97757]" />;
}

function ModelTrio({ size = 'h-4 w-4' }: { size?: string }) {
  return (
    <span className="flex items-center gap-1.5">
      {MODELS.map(({ name, Mark }) => (
        <Mark key={name} aria-hidden="true" className={`${size} text-muted`} />
      ))}
    </span>
  );
}

interface NodeProps {
  icon?: React.ReactNode;
  title: string;
  sub?: string;
  trailing?: React.ReactNode;
  tone?: 'default' | 'accent' | 'muted' | 'ok';
}

function Node({ icon, title, sub, trailing, tone = 'default' }: NodeProps) {
  const tones = {
    default: 'border-line bg-base',
    accent: 'border-line-strong bg-surface-2',
    muted: 'border-line-soft bg-transparent',
    ok: 'border-ok/40 bg-base',
  } as const;
  return (
    <div className={`flex min-h-[42px] w-full items-center gap-2.5 rounded-lg border px-2.5 py-2 ${tones[tone]}`}>
      {icon ? <span className="flex min-w-4 shrink-0 items-center justify-center">{icon}</span> : null}
      <span className="min-w-0 flex-1">
        <span className={`block text-[12.5px] leading-tight ${tone === 'muted' ? 'text-muted' : 'text-white'}`}>{title}</span>
        {sub ? <span className="mt-0.5 block text-[11.5px] leading-tight text-faint">{sub}</span> : null}
      </span>
      {trailing ? <span className="shrink-0 font-mono text-[12px] text-white">{trailing}</span> : null}
    </div>
  );
}

function StepLabel({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span className={`font-mono text-[10px] uppercase tracking-[0.14em] ${accent ? 'text-accent' : 'text-faint'}`}>
      {children}
    </span>
  );
}

function FlowArrow({ direction = 'responsive' }: { direction?: 'responsive' | 'down' }) {
  if (direction === 'down') {
    return <ArrowDownIcon aria-hidden="true" className="mx-auto h-4 w-4 shrink-0 text-faint" />;
  }
  return (
    <span aria-hidden="true" className="flex shrink-0 items-center justify-center text-faint md:pt-6">
      <ArrowRightIcon className="hidden h-4 w-4 md:block" />
      <ArrowDownIcon className="h-4 w-4 md:hidden" />
    </span>
  );
}

function Column({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
      <StepLabel>{label}</StepLabel>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Request flow (introduction, assessment concept)                     */
/* ------------------------------------------------------------------ */

export function RequestFlow() {
  return (
    <div
      role="img"
      aria-label="Your platform sends a submission to the Codeverity API. ChatGPT, Gemini and DeepSeek assess it independently. Claude reassesses their feedback. The final result is returned to your platform."
      className="flex flex-col items-stretch gap-3 py-2 md:flex-row md:items-start md:gap-1.5"
    >
      <Column label="Submit">
        <Node icon={<MonitorIcon aria-hidden="true" className="h-4 w-4 text-muted" />} title="Your platform" />
      </Column>
      <FlowArrow />
      <Column label="API">
        <Node tone="accent" icon={<CvLogo />} title="Codeverity" />
      </Column>
      <FlowArrow />
      <Column label="Assess">
        <div className="flex w-full flex-col gap-1.5">
          {MODELS.map(({ name, Mark }) => (
            <Node key={name} icon={<Mark aria-hidden="true" className="h-4 w-4 text-muted" />} title={name} />
          ))}
        </div>
      </Column>
      <FlowArrow />
      <Column label="Reassess">
        <Node tone="accent" icon={<ClaudeIcon />} title="Claude" />
      </Column>
      <FlowArrow />
      <Column label="Result">
        <Node icon={<CheckIcon aria-hidden="true" className="h-4 w-4 text-ok" />} title="Final result" />
      </Column>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Without vs with Codeverity (introduction)                           */
/* ------------------------------------------------------------------ */

const DIY_WORK = [
  { label: 'OpenAI integration', icon: <OpenAIMark aria-hidden="true" className="h-3.5 w-3.5" /> },
  { label: 'Gemini integration', icon: <GeminiMark aria-hidden="true" className="h-3.5 w-3.5" /> },
  { label: 'DeepSeek integration', icon: <DeepSeekMark aria-hidden="true" className="h-3.5 w-3.5" /> },
  { label: 'Result normalization', icon: <ShuffleIcon aria-hidden="true" className="h-3.5 w-3.5" /> },
  { label: 'Assessment comparison', icon: <GitCompareIcon aria-hidden="true" className="h-3.5 w-3.5" /> },
  { label: 'Feedback refinement', icon: <PenLineIcon aria-hidden="true" className="h-3.5 w-3.5" /> },
];

export function AbstractionCompare() {
  return (
    <div className="grid gap-8 py-2 md:grid-cols-2 md:gap-0">
      <div className="md:pr-8">
        <StepLabel>Without Codeverity</StepLabel>
        <div className="mt-3">
          <Node icon={<MonitorIcon aria-hidden="true" className="h-4 w-4 text-muted" />} title="Your platform" />
        </div>
        <ul className="ml-[18px] mt-1 border-l border-line pt-1">
          {DIY_WORK.map((item) => (
            <li key={item.label} className="relative flex items-center gap-2.5 py-1.5 pl-5 text-[12.5px] text-faint">
              <span aria-hidden="true" className="absolute left-0 top-1/2 h-px w-3.5 bg-line" />
              <span className="text-faint">{item.icon}</span>
              {item.label}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[12px] text-faint">Six things to build, run and keep in sync.</p>
      </div>

      <div className="border-line md:border-l md:pl-8">
        <StepLabel accent>With Codeverity</StepLabel>
        <div className="mt-3 flex flex-col gap-2">
          <Node icon={<MonitorIcon aria-hidden="true" className="h-4 w-4 text-muted" />} title="Your platform" />
          <FlowArrow direction="down" />
          <Node tone="accent" icon={<CvLogo />} title="Codeverity API" sub="One endpoint" trailing={<ModelTrio size="h-3.5 w-3.5" />} />
        </div>
        <p className="mt-3 text-[12px] text-faint">Models, comparison and refinement are handled behind one request.</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Reassessment: three answers converge on Claude                      */
/* ------------------------------------------------------------------ */

export function ReassessmentConverge() {
  return (
    <div
      role="img"
      aria-label="Three independent assessments, from ChatGPT scoring 8.5, Gemini scoring 9.0 and DeepSeek scoring 8.8, are compared by Claude against the evaluation criteria, producing one final result scoring 9.2."
      className="flex flex-col items-stretch gap-3 py-2 md:flex-row md:items-center md:gap-0"
    >
      <div className="flex flex-col gap-1.5 md:w-[200px] md:shrink-0">
        <StepLabel>Independent assessments</StepLabel>
        {MODELS.map(({ name, Mark, score }) => (
          <Node key={name} icon={<Mark aria-hidden="true" className="h-4 w-4 text-muted" />} title={name} trailing={score} />
        ))}
      </div>

      <svg aria-hidden="true" viewBox="0 0 56 150" className="hidden h-[150px] w-14 shrink-0 md:mt-[22px] md:block" fill="none">
        <path d="M0 21 C 28 21, 28 75, 56 75" className="stroke-line-strong" strokeWidth="1" />
        <path d="M0 75 H 56" className="stroke-line-strong" strokeWidth="1" />
        <path d="M0 129 C 28 129, 28 75, 56 75" className="stroke-line-strong" strokeWidth="1" />
      </svg>
      <span className="md:hidden">
        <FlowArrow direction="down" />
      </span>

      <div className="flex flex-1 flex-col gap-1.5 md:mt-[22px]">
        <Node tone="accent" icon={<ClaudeIcon />} title="Claude reassessment" sub="Checks each answer against the criteria" />
      </div>

      <span aria-hidden="true" className="flex shrink-0 justify-center px-2 text-faint md:mt-[22px]">
        <ArrowRightIcon className="hidden h-4 w-4 md:block" />
        <ArrowDownIcon className="h-4 w-4 md:hidden" />
      </span>

      <div className="md:mt-[22px] md:w-[170px] md:shrink-0">
        <Node tone="ok" icon={<CheckIcon aria-hidden="true" className="h-4 w-4 text-ok" />} title="Final result" trailing="9.2" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Research: three experiment configurations                           */
/* ------------------------------------------------------------------ */

export function ExperimentConfigs() {
  const configs = [
    {
      key: 'A',
      title: 'Single LLM',
      steps: [
        <Node key="m" icon={<OpenAIMark aria-hidden="true" className="h-4 w-4 text-muted" />} title="One model" />,
        <Node key="o" tone="muted" title="Feedback" />,
      ],
    },
    {
      key: 'B',
      title: 'Multiple LLMs',
      steps: [
        <Node key="m" icon={<ModelTrio />} title="Three models" />,
        <Node key="o" tone="muted" title="Independent feedback" sub="Three separate answers" />,
      ],
    },
    {
      key: 'C',
      title: 'Multiple LLMs + reassessment',
      accent: true,
      steps: [
        <Node key="m" icon={<ModelTrio />} title="Three models" />,
        <Node key="r" tone="accent" icon={<ClaudeIcon />} title="Reassessment" />,
        <Node key="o" tone="ok" icon={<CheckIcon aria-hidden="true" className="h-4 w-4 text-ok" />} title="Final feedback" />,
      ],
    },
  ];

  return (
    <div className="grid gap-8 py-2 md:grid-cols-3 md:gap-0">
      {configs.map((config, index) => (
        <div key={config.key} className={`flex flex-col ${index > 0 ? 'border-line md:border-l md:pl-6' : ''} ${index < 2 ? 'md:pr-6' : ''}`}>
          <StepLabel accent={config.accent}>Experiment {config.key}</StepLabel>
          <p className="mt-1.5 text-[13.5px] text-white">{config.title}</p>
          <div className="mt-4 flex flex-col gap-2">
            {config.steps.map((step, stepIndex) => (
              <React.Fragment key={stepIndex}>
                {stepIndex > 0 ? <FlowArrow direction="down" /> : null}
                {step}
              </React.Fragment>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* First assessment: integration timeline                              */
/* ------------------------------------------------------------------ */

const INTEGRATION_STEPS = [
  { title: 'Create an API key', code: 'sk_test_…', where: 'Dashboard' },
  { title: 'Submit the assignment and code', code: 'POST /v1/assessments', where: 'Your server' },
  { title: 'Receive an assessment ID', code: '202 · asm_01J…', where: 'Response' },
  { title: 'Wait for completion', code: 'webhook or poll', where: 'Async' },
  { title: 'Retrieve the result', code: 'GET /v1/assessments/{id}', where: 'Your server' },
  { title: 'Show the feedback to the student', code: 'score · feedback · suggestions', where: 'Your UI' },
];

export function IntegrationSteps() {
  return (
    <ol className="relative py-2">
      <span aria-hidden="true" className="absolute bottom-6 left-[13px] top-6 w-px bg-line" />
      {INTEGRATION_STEPS.map((step, index) => (
        <li key={step.title} className="relative flex items-start gap-4 py-2.5">
          <span className="relative z-10 flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-full border border-line-strong bg-base font-mono text-[11px] text-white">
            {index + 1}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1 pt-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <p className="text-[13.5px] text-white">{step.title}</p>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">{step.where}</span>
              <code className="rounded-md border border-line bg-base px-2 py-1 font-mono text-[11.5px] text-muted">{step.code}</code>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------------ */
/* Async lifecycle: request to completed                               */
/* ------------------------------------------------------------------ */

const LIFECYCLE = [
  { label: 'POST /v1/assessments', note: 'You send the submission', kind: 'request' },
  { label: '202 Accepted', note: 'Returned right away with an ID', kind: 'response' },
  { label: 'queued', note: 'Waiting for a worker', kind: 'status' },
  { label: 'processing', note: 'Models and reassessment running', kind: 'status' },
  { label: 'completed', note: 'Result is ready to fetch', kind: 'done' },
] as const;

export function AsyncLifecycle() {
  return (
    <div className="py-2">
      {/* Desktop: horizontal track */}
      <ol className="relative hidden grid-cols-5 md:grid">
        <span aria-hidden="true" className="absolute left-[10%] right-[10%] top-[7px] h-px bg-line-strong" />
        {LIFECYCLE.map((stop) => (
          <li key={stop.label} className="relative flex flex-col items-center px-1 text-center">
            <span
              aria-hidden="true"
              className={`relative z-10 h-[15px] w-[15px] rounded-full border ${
                stop.kind === 'done'
                  ? 'border-ok bg-ok'
                  : stop.kind === 'status'
                    ? 'border-line-strong bg-base'
                    : 'border-white bg-base'
              }`}
            />
            <code className={`mt-3 font-mono text-[11.5px] ${stop.kind === 'done' ? 'text-ok' : 'text-white'}`}>{stop.label}</code>
            <span className="mt-1 text-[11.5px] leading-snug text-faint">{stop.note}</span>
          </li>
        ))}
      </ol>

      {/* Mobile: vertical track */}
      <ol className="relative md:hidden">
        <span aria-hidden="true" className="absolute bottom-3 left-[7px] top-3 w-px bg-line-strong" />
        {LIFECYCLE.map((stop) => (
          <li key={stop.label} className="relative flex items-start gap-3 py-2">
            <span
              aria-hidden="true"
              className={`relative z-10 mt-0.5 h-[15px] w-[15px] shrink-0 rounded-full border ${
                stop.kind === 'done' ? 'border-ok bg-ok' : stop.kind === 'status' ? 'border-line-strong bg-base' : 'border-white bg-base'
              }`}
            />
            <div>
              <code className={`font-mono text-[12px] ${stop.kind === 'done' ? 'text-ok' : 'text-white'}`}>{stop.label}</code>
              <p className="mt-0.5 text-[12px] text-faint">{stop.note}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-4 flex items-center gap-2 text-[12px] text-faint">
        <ListChecksIcon aria-hidden="true" className="h-3.5 w-3.5" />
        An assessment that can&apos;t finish ends in <code className="font-mono text-amber">failed</code> instead.
      </p>
    </div>
  );
}
