'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { CopyButton } from '@/components/ui/CopyButton';


type Tone = 'muted' | 'white' | 'ok' | 'accent' | 'violet' | 'faint';

interface TerminalLine {
  text: string;
  tone?: Tone;
  prompt?: boolean;
}

interface Step {
  id: string;
  index: string;
  title: string;
  body: string;
  screenshot: string;
  screenshotAlt: string;
  windowTitle: string;
  terminalTitle: string;
  lines: TerminalLine[];
}

const STEPS: Step[] = [
  {
    id: 'submit',
    index: '01',
    title: 'Submit',
    body: 'Send student code, assignment requirements and language through one authenticated request.',
    screenshot: '/images/how-it-works/api-keys.webp',
    screenshotAlt: 'Codeverity dashboard showing API keys',
    windowTitle: 'Dashboard · API keys',
    terminalTitle: 'terminal',
    lines: [
      { text: 'curl -X POST api.codeverity.com/v1/assessments \\', prompt: true, tone: 'white' },
      { text: '  -H "Authorization: Bearer sk_live_••••••91K2" \\', tone: 'muted' },
      { text: '  -d @submission.json', tone: 'muted' },
      { text: '{ "id": "asm_01JABC123", "status": "processing" }', tone: 'ok' },
    ],
  },
  {
    id: 'assess',
    index: '02',
    title: 'Assess',
    body: 'Multiple LLMs independently analyse the submission and produce assessments and prescriptions.',
    screenshot: '/images/how-it-works/assessment.webp',
    screenshotAlt: 'Codeverity dashboard showing model assessments for a submission',
    windowTitle: 'Dashboard · Assessment',
    terminalTitle: 'codeverity · asm_01JABC123',
    lines: [
      { text: '● Model A · openai     8.5   1 issue identified', tone: 'muted' },
      { text: '● Model B · gemini     9.0   1 issue identified', tone: 'muted' },
      { text: '● Model C · llama      8.8   1 issue identified', tone: 'muted' },
      { text: '3 of 3 assessments complete · 11.2s', tone: 'faint' },
    ],
  },
  {
    id: 'reassess',
    index: '03',
    title: 'Reassess',
    body: 'A dedicated reassessment model compares every prescription against your evaluation criteria.',
    screenshot: '/images/how-it-works/logs.webp',
    screenshotAlt: 'Codeverity dashboard showing request logs',
    windowTitle: 'Dashboard · Logs',
    terminalTitle: 'codeverity · reassessment',
    lines: [
      { text: '✓ Correctness      agreed by 3 models', tone: 'ok' },
      { text: '✓ Efficiency       agreed by 3 models', tone: 'ok' },
      { text: '✓ Readability      agreed by 2 models', tone: 'ok' },
      { text: '✓ Pedagogy         refined prescription', tone: 'ok' },
      { text: 'consensus reached · confidence 0.92', tone: 'violet' },
    ],
  },
  {
    id: 'deliver',
    index: '04',
    title: 'Deliver',
    body: 'Refined feedback, suggested changes and confidence land in your platform via API or webhook.',
    screenshot: '/images/how-it-works/webhook.webp',
    screenshotAlt: 'Codeverity dashboard showing webhook deliveries',
    windowTitle: 'Dashboard · Webhooks',
    terminalTitle: 'webhook · assessment.completed',
    lines: [
      { text: 'POST your-platform.com/webhooks/codeverity', tone: 'white' },
      { text: '{', tone: 'muted' },
      { text: '  "event": "assessment.completed",', tone: 'muted' },
      { text: '  "score": 9.2, "confidence": 0.92', tone: 'muted' },
      { text: '}', tone: 'muted' },
      { text: '200 OK · delivered in 84ms', tone: 'ok' },
    ],
  },
];

const INSTALL = 'curl -X POST https://api.codeverity.com/v1/assessments';
const STEP_DURATION = 6500;

const TONE_CLASS: Record<Tone, string> = {
  muted: 'text-muted',
  white: 'text-white',
  ok: 'text-ok',
  accent: 'text-accent',
  violet: 'text-violet',
  faint: 'text-faint',
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function HowItWorks() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const step = STEPS[active];

  // Only auto-advance while the section is on screen.
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.3 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (paused || !inView || reduceMotion) return;
    const id = window.setTimeout(() => setActive((i) => (i + 1) % STEPS.length), STEP_DURATION);
    return () => window.clearTimeout(id);
  }, [active, paused, inView, reduceMotion]);

  const select = useCallback((index: number) => setActive(index), []);

  return (
    <section ref={sectionRef} id="how-it-works" className="border-b border-line-soft bg-surface">
      <div className="mx-auto max-w-shell px-6 py-24">
        <SectionHeading eyebrow="How it works" title="From code submission to validated feedback." />

        <div
          className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-12"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Left: steps */}
          <Reveal className="lg:col-span-4">
            <ol role="tablist" aria-label="How Codeverity works" className="flex flex-col">
              {STEPS.map((item, index) => {
                const isActive = index === active;
                return (
                  <li key={item.id} className="relative">
                    <button
                      type="button"
                      role="tab"
                      id={`hiw-tab-${item.id}`}
                      aria-selected={isActive}
                      aria-controls={`hiw-panel-${item.id}`}
                      onClick={() => select(index)}
                      onFocus={() => select(index)}
                      className="group flex w-full gap-4 py-4 text-left focus-visible:outline-none"
                    >
                      <span
                        className={`mt-0.5 font-mono text-[12px] transition-colors duration-150 ${
                          isActive ? 'text-white' : 'text-faint'
                        }`}
                      >
                        {item.index}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block text-[15px] font-medium tracking-[-0.01em] transition-colors duration-150 ${
                            isActive ? 'text-white' : 'text-muted group-hover:text-white'
                          }`}
                        >
                          {item.title}
                        </span>
                        <motion.span
                          initial={false}
                          animate={{ height: isActive ? 'auto' : 0, opacity: isActive ? 1 : 0 }}
                          transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.23, 1, 0.32, 1] }}
                          className="block overflow-hidden"
                        >
                          <span className="block pt-2 text-sm leading-relaxed text-muted">{item.body}</span>
                        </motion.span>
                      </span>
                    </button>
                    {/* Progress rail */}
                    <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-line-soft">
                      {isActive && (paused || reduceMotion) ? <span className="block h-full w-full bg-white" /> : null}
                      {isActive && !paused && !reduceMotion ? (
                        <motion.span
                          key={`${item.id}-${active}`}
                          className="block h-full bg-white"
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: STEP_DURATION / 1000, ease: 'linear' }}
                        />
                      ) : null}
                    </span>
                  </li>
                );
              })}
            </ol>

            <div className="mt-8 flex items-center justify-between gap-3 rounded-lg border border-line bg-base pl-4 pr-1.5">
              <code className="truncate py-3 font-mono text-[12.5px] text-muted">
                <span className="text-faint">$ </span>
                {INSTALL}
              </code>
              <CopyButton value={INSTALL} />
            </div>
          </Reveal>

          {/* Right: stage */}
          <Reveal delay={0.06} className="lg:col-span-8">
            <div
              id={`hiw-panel-${step.id}`}
              role="tabpanel"
              aria-labelledby={`hiw-tab-${step.id}`}
              className="hiw-stage relative aspect-[16/11] overflow-hidden rounded-2xl border border-line sm:aspect-[16/10]"
            >
              <AnimatePresence initial={false} mode="popLayout">
                {/* Back window: dashboard screenshot */}
                <motion.div
                  key={`${step.id}-window`}
                  className="absolute left-[5%] top-[7%] w-[78%] overflow-hidden rounded-xl border border-line-strong bg-base shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]"
                  initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.98 }}
                  transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
                >
                  <WindowChrome title={step.windowTitle} />
                  <Image
                    src={step.screenshot}
                    alt={step.screenshotAlt}
                    width={1800}
                    height={1035}
                    sizes="(min-width: 1024px) 60vw, 100vw"
                    className="block h-auto w-full"
                    priority={active === 0}
                  />
                </motion.div>

                {/* Front window: terminal */}
                <motion.div
                  key={`${step.id}-terminal`}
                  className="absolute bottom-[7%] right-[4%] w-[68%] overflow-hidden rounded-xl border border-line-strong bg-[#0a0a0b] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.95)] sm:w-[58%]"
                  initial={reduceMotion ? false : { opacity: 0, y: 32, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
                  transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1], delay: 0.08 }}
                >
                  <WindowChrome title={step.terminalTitle} mono />
                  <Terminal lines={step.lines} reduceMotion={!!reduceMotion} />
                </motion.div>
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

function WindowChrome({ title, mono = false }: { title: string; mono?: boolean }) {
  return (
    <div className="relative flex h-8 items-center border-b border-line-soft bg-[#0e0e10] px-3">
      <span aria-hidden="true" className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#3f3f46]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#3f3f46]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#3f3f46]" />
      </span>
      <span
        className={`pointer-events-none absolute inset-x-0 truncate px-16 text-center text-[11px] text-faint ${
          mono ? 'font-mono' : ''
        }`}
      >
        {title}
      </span>
    </div>
  );
}

function Terminal({ lines, reduceMotion }: { lines: TerminalLine[]; reduceMotion: boolean }) {
  return (
    <div className="overflow-hidden px-4 py-3.5 font-mono text-[10.5px] leading-[1.75] sm:text-[11.5px]">
      {lines.map((line, index) => (
        <motion.div
          key={`${index}-${line.text}`}
          className={`whitespace-pre ${TONE_CLASS[line.tone ?? 'muted']}`}
          initial={reduceMotion ? false : { opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, delay: reduceMotion ? 0 : 0.35 + index * 0.32 }}
        >
          {line.prompt ? <span className="text-faint">$ </span> : null}
          {line.text}
        </motion.div>
      ))}
      <motion.span
        aria-hidden="true"
        className="mt-0.5 inline-block h-[13px] w-[7px] bg-muted align-middle"
        animate={reduceMotion ? { opacity: 1 } : { opacity: [1, 0, 1] }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}
