'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRightIcon, ChevronDownIcon } from 'lucide-react';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import { Reveal } from '@/components/ui/Reveal';

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

interface Faq {
  q: string;
  a: string;
}

interface Category {
  id: string;
  label: string;
  items: Faq[];
}

const CATEGORIES: Category[] = [
  {
    id: 'general',
    label: 'General',
    items: [
      {
        q: 'What is Codeverity?',
        a: 'Codeverity is an API for assessing student code. You send a submission and the assignment requirements, several language models assess it independently, a reassessment step reconciles their answers against your criteria, and you get back a score, confidence value and actionable feedback.',
      },
      {
        q: 'Who is it for?',
        a: 'Learning management systems, coding platforms, universities and bootcamps that want reliable automated feedback on programming assignments without building and maintaining their own model integrations.',
      },
      {
        q: 'Which programming languages can be assessed?',
        a: 'Any language the underlying models understand. Python, JavaScript, TypeScript, Java, C#, Go, Ruby and PHP are the most common. You pass the language with each submission so the models assess it in context.',
      },
      {
        q: 'How long does an assessment take?',
        a: 'Most assessments complete in 10 to 30 seconds. Assessments run asynchronously, so you either poll the assessment or receive a webhook when the reassessment layer finishes.',
      },
    ],
  },
  {
    id: 'models',
    label: 'Models & Accuracy',
    items: [
      {
        q: 'Which models are used?',
        a: 'Each submission is assessed independently by ChatGPT, Gemini and DeepSeek. Claude then acts as the reassessment layer, comparing their prescriptions against your evaluation criteria and selecting or refining the final feedback.',
      },
      {
        q: 'Why use several models instead of one?',
        a: 'A single model can be confidently wrong. Independent assessments surface disagreement, and the reassessment step resolves it. That is what lets us attach a confidence value to every result instead of returning the first answer we get.',
      },
      {
        q: 'What criteria is feedback judged against?',
        a: 'Correctness, relevance, actionability, specificity and pedagogical appropriateness. The reassessment layer scores each candidate prescription against these before the final result is produced.',
      },
      {
        q: 'Can I see how the final feedback was chosen?',
        a: 'Yes. Every assessment includes each model’s independent score and reasoning, the criteria checks, and the reassessment summary, so you can show your instructors exactly why a result was returned.',
      },
    ],
  },
  {
    id: 'integration',
    label: 'Integration',
    items: [
      {
        q: 'Do I need an SDK?',
        a: 'No. Codeverity is a JSON API over plain HTTP. Any language with an HTTP client can integrate it, and the docs include examples for cURL, Node.js, TypeScript, Python, Go, Ruby, PHP, Java and .NET.',
      },
      {
        q: 'How do I get results back?',
        a: 'Poll the assessment endpoint, or register a webhook and receive assessment.completed and assessment.failed events. Deliveries are signed and retried, and you can inspect every delivery in the dashboard.',
      },
      {
        q: 'How do API keys and environments work?',
        a: 'Keys are scoped to your organization and tagged as production or test. Create, rotate and revoke them from the dashboard. Requests are authenticated with a bearer token.',
      },
      {
        q: 'Is there a rate limit?',
        a: 'Yes. Each organization has a default request limit that scales with your plan. Rate limit headers are returned on every response, and usage is visible in the dashboard.',
      },
    ],
  },
  {
    id: 'privacy',
    label: 'Privacy & Access',
    items: [
      {
        q: 'What happens to submitted code?',
        a: 'Submissions are used only to produce the assessment you requested. They are stored so you can review results in the dashboard, and can be deleted through the API on request.',
      },
      {
        q: 'Is student code used to train models?',
        a: 'No. Codeverity does not use your submissions to train models, and requests to model providers are made under terms that exclude training.',
      },
      {
        q: 'Can I control who on my team has access?',
        a: 'Yes. Organizations support multiple members, and API keys can be created and revoked per environment. Security settings live in the dashboard.',
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

const EASE = [0.23, 1, 0.32, 1] as const;

export function FaqSection() {
  const [categoryId, setCategoryId] = useState(CATEGORIES[0].id);
  const [open, setOpen] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();
  const category = CATEGORIES.find((c) => c.id === categoryId) ?? CATEGORIES[0];

  function selectCategory(id: string) {
    setCategoryId(id);
    setOpen(null);
  }

  return (
    <section id="faq" className="border-b border-line-soft bg-base">
      <div className="mx-auto max-w-shell px-6 py-24">
        {/* Header */}
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-[13px] text-muted">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-faint" />
            FAQ
          </span>
          <div className="mt-8 grid gap-6 lg:grid-cols-12 lg:items-end">
            <h2 className="text-4xl font-medium leading-[1.12] tracking-[-0.03em] text-white sm:text-5xl lg:col-span-7">
              Answers to the questions
              <br />
              that come up most.
            </h2>
            <p className="text-[15px] leading-relaxed text-muted lg:col-span-4 lg:col-start-9 lg:text-[16px]">
              Learn how Codeverity works, which models are involved, how to integrate it, and what happens to the
              code your students submit.
            </p>
          </div>
        </Reveal>

        {/* Body */}
        <div className="mt-16 grid gap-8 lg:grid-cols-12">
          {/* Left rail */}
          <Reveal className="flex flex-col lg:col-span-4">
            <LayoutGroup id="faq-tabs">
              <div role="tablist" aria-label="FAQ categories" aria-orientation="vertical" className="flex flex-col gap-1">
                {CATEGORIES.map((c) => {
                  const isActive = c.id === categoryId;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => selectCategory(c.id)}
                      className={`relative rounded-xl px-5 py-3.5 text-center text-[15px] transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                        isActive ? 'text-white' : 'text-faint hover:text-muted'
                      }`}
                    >
                      {isActive ? (
                        <motion.span
                          layoutId="faq-tab-bg"
                          aria-hidden="true"
                          className="absolute inset-0 rounded-xl border border-line bg-surface-2"
                          transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 34 }}
                        />
                      ) : null}
                      <span className="relative">{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </LayoutGroup>

            <div className="mt-auto hidden pt-16 lg:block">
              <ContactCard />
            </div>
          </Reveal>

          {/* Accordion */}
          <Reveal delay={0.05} className="lg:col-span-8">
            <div className="rounded-2xl border border-line-soft bg-surface p-1.5">
              <AnimatePresence mode="wait" initial={false}>
                <motion.ul
                  key={category.id}
                  role="list"
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.22, ease: EASE }}
                  className="flex flex-col gap-1.5"
                >
                  {category.items.map((item, i) => {
                    const id = `${category.id}-${i}`;
                    const isOpen = open === id;
                    return (
                      <motion.li
                        key={id}
                        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: reduceMotion ? 0 : 0.05 + i * 0.05, ease: EASE }}
                        className="overflow-hidden rounded-xl border border-line-soft bg-surface-2"
                      >
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          aria-controls={`${id}-panel`}
                          onClick={() => setOpen(isOpen ? null : id)}
                          className="flex w-full items-center justify-between gap-6 px-6 py-7 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
                        >
                          <span className="text-[16px] text-white">{item.q}</span>
                          <motion.span
                            aria-hidden="true"
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            transition={{ duration: reduceMotion ? 0 : 0.28, ease: EASE }}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-muted"
                          >
                            <ChevronDownIcon className="h-4 w-4" />
                          </motion.span>
                        </button>
                        <AnimatePresence initial={false}>
                          {isOpen ? (
                            <motion.div
                              id={`${id}-panel`}
                              key="panel"
                              initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                              transition={{ duration: 0.32, ease: EASE }}
                              className="overflow-hidden"
                            >
                              <p className="max-w-2xl px-6 pb-7 text-[15px] leading-relaxed text-muted">{item.a}</p>
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      </motion.li>
                    );
                  })}
                </motion.ul>
              </AnimatePresence>
            </div>
          </Reveal>

          <div className="lg:hidden">
            <ContactCard />
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactCard() {
  return (
    <div className="rounded-2xl border border-line-soft bg-surface p-8">
      <p className="text-[22px] font-medium tracking-[-0.02em] text-white">Got questions?</p>
      <p className="mt-3 max-w-xs text-[15px] leading-relaxed text-muted">
        Can&apos;t find what you&apos;re looking for? Reach out and we&apos;ll get back to you fast.
      </p>
      <Link
        href="mailto:dev@codeverity.dev?subject=Codeverity%20question"
        className="mt-7 inline-flex items-center gap-2 text-[15px] text-muted transition-colors duration-150 ease-out hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        Contact us
        <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
      </Link>
    </div>
  );
}
