'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckIcon, ChevronLeftIcon } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { ErrorState } from '@/components/dashboard/ErrorState';
import { CopyButton } from '@/components/ui/CopyButton';
import { CodePre } from '@/components/ui/CodePre';
import { assessments } from '@/lib/dashboard';

export default function AssessmentDetailsPage() {
  const params = useParams<{ id: string }>();
  const assessment = assessments.find((item) => item.id === params.id);

  if (!assessment) {
    return (
      <EmptyState
        title="Assessment not found."
        description="This assessment does not exist or belongs to another organization."
        action={
          <Link
            href="/dashboard/assessments"
            className="rounded-lg border border-line-strong px-3.5 py-2 text-[13px] text-white transition-colors duration-150 ease-out hover:border-white/60"
          >
            Back to assessments
          </Link>
        }
      />
    );
  }

  const isCompleted = assessment.status === 'completed';

  return (
    <>
      <PageHeader
        breadcrumb={
          <Link
            href="/dashboard/assessments"
            className="inline-flex items-center gap-1.5 font-mono text-[11.5px] uppercase tracking-[0.14em] text-faint transition-colors duration-150 ease-out hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <ChevronLeftIcon aria-hidden="true" className="h-3.5 w-3.5" />
            Assessments
          </Link>
        }
        title="Assessment"
        description={`${assessment.assignment.title} · ${assessment.language}`}
        actions={<CopyButton value={assessment.id} label="Copy ID" />}
      />

      <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-line bg-surface px-4 py-3">
        <code className="font-mono text-[13px] text-white">{assessment.id}</code>
        <StatusBadge status={assessment.status} />
        <span className="font-mono text-[12px] text-faint">Created {assessment.created}</span>
      </div>

      {assessment.status === 'failed' ? (
        <ErrorState
          code="ASSESSMENT_FAILED"
          title="This assessment could not be completed."
          description="One or more models did not return a usable assessment. Resubmit the code to try again; the submission was not charged."
          action={
            <button
              type="button"
              className="rounded-lg border border-line-strong px-3 py-1.5 text-[13px] text-white transition-colors duration-150 ease-out hover:border-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Resubmit assessment
            </button>
          }
        />
      ) : null}

      {isCompleted ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Score" value={`${assessment.score?.toFixed(1)} / 10`} />
          <StatCard label="Confidence" value={`${Math.round((assessment.confidence ?? 0) * 100)}%`} />
          <StatCard label="Processing" value={`${assessment.processingSeconds?.toFixed(1)}s`} />
        </div>
      ) : null}

      {assessment.status === 'processing' || assessment.status === 'queued' ? (
        <div className="rounded-xl border border-line bg-surface px-5 py-6">
          <StatusBadge status={assessment.status} />
          <p className="mt-3 max-w-xl text-[13.5px] leading-relaxed text-muted">
            The submission is being assessed by multiple models. The result becomes available once reassessment
            completes — your webhook endpoint will receive{' '}
            <code className="font-mono text-[12.5px] text-white">assessment.completed</code>.
          </p>
        </div>
      ) : null}

      <section className="mt-8 grid gap-3 lg:grid-cols-5">
        <div className="overflow-hidden rounded-xl border border-line bg-surface lg:col-span-3">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">Submission</h2>
            <span className="font-mono text-[11.5px] text-muted">{assessment.language}</span>
          </div>
          <CodePre code={assessment.code} />
        </div>

        <div className="overflow-hidden rounded-xl border border-line bg-surface lg:col-span-2">
          <div className="border-b border-line px-4 py-2.5">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">Assignment</h2>
          </div>
          <div className="px-4 py-4">
            <p className="text-[14px] text-white">{assessment.assignment.title}</p>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">{assessment.assignment.requirements}</p>
          </div>
        </div>
      </section>

      {isCompleted ? (
        <>
          <section className="mt-8">
            <h2 className="mb-3 text-[14.5px] font-medium text-white">Model assessments</h2>
            <div className="grid gap-3 lg:grid-cols-3">
              {assessment.models.map((model) => (
                <article key={model.name} className="rounded-xl border border-line bg-surface p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[13.5px] text-white">{model.name}</p>
                    <span className="font-mono text-[11.5px] text-faint">{model.model}</span>
                  </div>
                  <div className="mt-4 flex items-baseline gap-4">
                    <span className="font-mono text-[18px] text-white">{model.score.toFixed(1)}</span>
                    <span className="font-mono text-[11.5px] text-faint">
                      {model.issues} issue{model.issues === 1 ? '' : 's'} identified
                    </span>
                  </div>
                  <p className="mt-4 border-t border-line pt-3 text-[13px] leading-relaxed text-muted">
                    {model.prescription}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-8 overflow-hidden rounded-xl border border-line bg-surface">
            <div className="border-b border-line px-5 py-3.5">
              <h2 className="text-[14.5px] font-medium text-white">Reassessment</h2>
            </div>

            <div className="grid lg:grid-cols-2">
              <div className="border-b border-line px-5 py-5 lg:border-b-0 lg:border-r">
                <p className="font-mono text-[11.5px] text-faint">
                  {assessment.models.length} model assessments received
                </p>
                <ul className="mt-4 space-y-2.5">
                  {assessment.criteria.map((criterion) => (
                    <li key={criterion.label} className="flex items-center gap-2.5 text-[13px] text-muted">
                      <CheckIcon aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-ok" />
                      {criterion.label}
                    </li>
                  ))}
                </ul>
                <p className="mt-5 border-t border-line pt-4 font-mono text-[11.5px] text-faint">
                  Final prescription selected
                </p>
              </div>

              <div className="px-5 py-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">Summary</p>
                <p className="mt-3 text-[13.5px] leading-relaxed text-muted">{assessment.reassessmentSummary}</p>
              </div>
            </div>
          </section>

          <section className="mt-8 grid gap-3 lg:grid-cols-5">
            <div className="overflow-hidden rounded-xl border border-line bg-surface lg:col-span-3">
              <div className="flex items-center justify-between border-b border-line px-5 py-3">
                <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-ok">Final assessment</h2>
                <span className="font-mono text-[11.5px] text-faint">
                  Confidence {Math.round((assessment.confidence ?? 0) * 100)}%
                </span>
              </div>
              <div className="px-5 py-5">
                <p className="text-[32px] font-medium leading-none tracking-[-0.02em] text-white">
                  {assessment.score?.toFixed(1)}
                  <span className="ml-2 font-mono text-[13px] text-faint">/ 10</span>
                </p>
                <p className="mt-5 text-[14px] leading-relaxed text-muted">{assessment.finalSummary}</p>
                <div className="mt-5 border-t border-line pt-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">Recommendation</p>
                  <p className="mt-2 text-[14px] leading-relaxed text-white">{assessment.recommendation}</p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-line bg-surface lg:col-span-2">
              <div className="border-b border-line px-5 py-3">
                <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">Evaluation</h2>
              </div>
              <ul className="divide-y divide-line-soft">
                {assessment.criteria.map((criterion) => (
                  <li key={criterion.label} className="flex items-center gap-3 px-5 py-3">
                    <span className="flex-1 text-[13px] text-muted">{criterion.label}</span>
                    <span className="h-px w-16 bg-line-soft">
                      <span className="block h-px bg-accent" style={{ width: `${criterion.value * 10}%` }} />
                    </span>
                    <span className="w-8 text-right font-mono text-[12.5px] text-white">
                      {criterion.value.toFixed(1)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </>
      ) : null}
    </>
  );
}
