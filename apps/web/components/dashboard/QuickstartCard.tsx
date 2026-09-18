import React from 'react';
import Link from 'next/link';
import { ArrowRightIcon, CheckIcon, XIcon } from 'lucide-react';

interface QuickstartCardProps {
  onDismiss: () => void;
}

const steps = [
  { label: 'Create your organization', done: true },
  { label: 'Create an API key', done: false },
  { label: 'Make your first assessment', done: false },
  { label: 'Configure a webhook', done: false },
  { label: 'View your first result', done: false },
];

export function QuickstartCard({ onDismiss }: QuickstartCardProps) {
  const completed = steps.filter((step) => step.done).length;

  return (
    <section className="mb-6 rounded-xl border border-line bg-surface">
      <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-3.5">
        <div>
          <h2 className="text-[14.5px] font-medium text-white">Get started with Codeverity</h2>
          <p className="mt-1 font-mono text-[11.5px] text-faint">
            {completed} of {steps.length} steps complete
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss quickstart"
          className="rounded-md p-1.5 text-faint transition-colors duration-150 ease-out hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <XIcon aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-6 px-5 py-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <ol className="space-y-2.5">
          {steps.map((step) => (
            <li key={step.label} className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                  step.done ? 'border-ok/60' : 'border-line-strong'
                }`}
              >
                {step.done ? <CheckIcon className="h-2.5 w-2.5 text-ok" /> : null}
              </span>
              <span className={`text-[13.5px] ${step.done ? 'text-faint line-through' : 'text-muted'}`}>
                {step.label}
              </span>
            </li>
          ))}
        </ol>

        <div className="flex flex-col gap-2">
          <Link
            href="/dashboard/api-keys"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-3.5 py-2 text-[13px] font-medium text-black transition-colors duration-150 ease-out hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Create API key
            <ArrowRightIcon aria-hidden="true" className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/docs/quickstart"
            className="inline-flex items-center justify-center rounded-lg border border-line-strong px-3.5 py-2 text-[13px] text-white transition-colors duration-150 ease-out hover:border-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Read the quickstart
          </Link>
        </div>
      </div>
    </section>
  );
}
