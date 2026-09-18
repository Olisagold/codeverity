'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';

const CALLOUTS = [
  { label: 'Score', value: '9.2 / 10', side: 'left', top: '18%' },
  { label: 'Confidence', value: '92%', side: 'right', top: '30%' },
  { label: 'Models agreed', value: '3 of 3', side: 'left', top: '46%' },
  { label: 'Criteria met', value: '5 / 5', side: 'right', top: '58%' },
] as const;

export function ResultSection() {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  // Scroll-driven entrance: the window starts slightly tilted back and low,
  // then settles flat as it travels up through the viewport.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 90%', 'start 25%'] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });
  const rotateX = useTransform(progress, [0, 1], reduceMotion ? [0, 0] : [10, 0]);
  const y = useTransform(progress, [0, 1], reduceMotion ? [0, 0] : [72, 0]);
  const scale = useTransform(progress, [0, 1], reduceMotion ? [1, 1] : [0.94, 1]);
  const opacity = useTransform(progress, [0, 0.35], [reduceMotion ? 1 : 0.4, 1]);

  return (
    <section id="result" className="border-b border-line-soft bg-surface">
      <div className="mx-auto max-w-shell px-6 py-24">
        <SectionHeading
          eyebrow="The result"
          title="Feedback your application can actually use."
          description="Every assessment returns a score, a confidence value, each model's independent take, and the reassessment that reconciles them."
          align="center"
        />

        <Reveal delay={0.05} className="mt-14">
          <div ref={ref} className="result-stage relative overflow-hidden rounded-2xl border border-line">
            {/* Background layers: flat tint, dotted grid, two horizontal bands. No glow. */}
            <div aria-hidden="true" className="result-stage__dots absolute inset-0" />
            <div aria-hidden="true" className="result-stage__band result-stage__band--a absolute inset-x-0" />
            <div aria-hidden="true" className="result-stage__band result-stage__band--b absolute inset-x-0" />

            <div className="relative px-4 pt-10 sm:px-10 sm:pt-14 lg:px-16 lg:pt-16" style={{ perspective: 1400 }}>
              <motion.div
                style={{ rotateX, y, scale, opacity, transformOrigin: '50% 100%' }}
                className="relative mx-auto max-w-4xl"
              >
                {/* Floating callouts */}
                {CALLOUTS.map((c, i) => (
                  <motion.div
                    key={c.label}
                    initial={reduceMotion ? false : { opacity: 0, x: c.side === 'left' ? -12 : 12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-15% 0px' }}
                    transition={{ duration: 0.4, delay: 0.25 + i * 0.12, ease: [0.23, 1, 0.32, 1] }}
                    className={`result-callout absolute z-10 hidden lg:block ${
                      c.side === 'left' ? '-left-14 xl:-left-24' : '-right-14 xl:-right-24'
                    }`}
                    style={{ top: c.top }}
                  >
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">{c.label}</p>
                    <p className="mt-1 text-[15px] font-medium tracking-[-0.01em] text-white">{c.value}</p>
                  </motion.div>
                ))}

                {/* Window */}
                <div className="overflow-hidden rounded-t-xl border border-b-0 border-line-strong bg-base">
                  <div className="relative flex h-9 items-center border-b border-line-soft bg-[#0e0e10] px-3">
                    <span aria-hidden="true" className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#3f3f46]" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#3f3f46]" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#3f3f46]" />
                    </span>
                    <span className="pointer-events-none absolute inset-x-0 truncate px-16 text-center font-mono text-[11px] text-faint">
                      app.codeverity.com/dashboard/assessments/asm_01JABC123
                    </span>
                  </div>
                  <Image
                    src="/images/result/assessment-full.webp"
                    alt="Completed assessment in the Codeverity dashboard: score 9.2 out of 10, 92% confidence, three model assessments and the reassessment summary"
                    width={1800}
                    height={1575}
                    sizes="(min-width: 1024px) 896px, 100vw"
                    className="block h-auto w-full"
                  />
                </div>
              </motion.div>
            </div>

            {/* Bottom fade so the screenshot exits cleanly into the frame edge */}
            <div aria-hidden="true" className="result-stage__fade pointer-events-none absolute inset-x-0 bottom-0 h-40" />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <ul className="mx-auto mt-10 grid max-w-3xl gap-x-8 gap-y-4 text-sm leading-relaxed text-muted sm:grid-cols-3">
            <li>
              <span className="text-white">Score and confidence</span> you can show students directly or gate on.
            </li>
            <li>
              <span className="text-white">Per-model reasoning</span> so you can see where the models agreed and where they did not.
            </li>
            <li>
              <span className="text-white">One reconciled prescription</span> chosen against your evaluation criteria.
            </li>
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
