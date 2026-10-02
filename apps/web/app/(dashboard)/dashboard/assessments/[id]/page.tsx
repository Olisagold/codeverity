'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeftIcon } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { ErrorState } from '@/components/dashboard/ErrorState';
import { Skeleton } from '@/components/dashboard/Skeleton';
import { CopyButton } from '@/components/ui/CopyButton';
import { CodePre } from '@/components/ui/CodePre';
import { useApi } from '@/hooks/useApi';
import { getAssessment } from '@/lib/api/dashboard';
import { formatDateTime, titleCase } from '@/lib/format';
import type { ModelResult } from '@/types/api';

const PROVIDERS: Record<string, string> = { openai: 'OpenAI', gemini: 'Gemini', deepseek: 'DeepSeek' };
const POLL_MS = 5000;

function average(scores: Record<string, number> | null) {
  const values = Object.values(scores ?? {});
  return values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : null;
}

function BackLink() {
  return (
    <Link
      href="/dashboard/assessments"
      className="inline-flex items-center gap-1.5 font-mono text-[11.5px] uppercase tracking-[0.14em] text-faint transition-colors duration-150 ease-out hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <ChevronLeftIcon aria-hidden="true" className="h-3.5 w-3.5" />
      Assessments
    </Link>
  );
}

function ScoreBars({ scores }: { scores: Record<string, number> }) {
  return (
    <ul className="divide-y divide-line-soft">
      {Object.entries(scores).map(([label, value]) => (
        <li key={label} className="flex items-center gap-3 px-5 py-3">
          <span className="flex-1 text-[13px] text-muted">{titleCase(label)}</span>
          <span className="h-px w-16 bg-line-soft">
            <span className="block h-px bg-accent" style={{ width: `${value * 10}%` }} />
          </span>
          <span className="w-8 text-right font-mono text-[12.5px] text-white">{value.toFixed(1)}</span>
        </li>
      ))}
    </ul>
  );
}

function ModelCard({ model }: { model: ModelResult }) {
  const score = average(model.criteria);
  const failed = model.status !== 'completed';
  return (
    <article className="rounded-xl border border-line bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[13.5px] text-white">{PROVIDERS[model.provider] ?? titleCase(model.provider)}</p>
        <span className="truncate font-mono text-[11.5px] text-faint">{model.model ?? '—'}</span>
      </div>
      {failed ? (
        <>
          <div className="mt-4">
            <StatusBadge status="failed" />
          </div>
          <p className="mt-3 border-t border-line pt-3 text-[13px] leading-relaxed text-muted">
            {model.error ?? 'No usable output.'} This model was skipped and the review used the others.
          </p>
        </>
      ) : (
        <>
          <div className="mt-4 flex items-baseline gap-4">
            <span className="font-mono text-[18px] text-white">{score === null ? '—' : score.toFixed(1)}</span>
            <span className="font-mono text-[11.5px] text-faint">
              {model.issues.length} issue{model.issues.length === 1 ? '' : 's'} identified
            </span>
          </div>
          <p className="mt-4 border-t border-line pt-3 text-[13px] leading-relaxed text-muted">{model.summary}</p>
        </>
      )}
      {model.latency_ms !== null ? (
        <p className="mt-3 font-mono text-[11px] text-faint">{(model.latency_ms / 1000).toFixed(1)}s</p>
      ) : null}
    </article>
  );
}

export default function AssessmentDetailsPage() {
  const params = useParams<{ id: string }>();
  const { data: assessment, error, loading, reload } = useApi(
    () => getAssessment(params.id),
    [params.id],
    'Could not load this assessment.'
  );

  const pending = assessment?.status === 'queued' || assessment?.status === 'processing';
  useEffect(() => {
    if (!pending) return;
    const timer = window.setTimeout(reload, POLL_MS);
    return () => window.clearTimeout(timer);
  }, [pending, assessment, reload]);

  if (loading && !assessment) {
    return (
      <>
        <PageHeader breadcrumb={<BackLink />} title="Assessment" />
        <Skeleton rows={6} />
      </>
    );
  }

  if (!assessment) {
    return (
      <EmptyState
        title={error === 'Assessment not found.' ? 'Assessment not found.' : 'Could not load this assessment.'}
        description={
          error === 'Assessment not found.'
            ? 'This assessment does not exist or belongs to another organization.'
            : error ?? ''
        }
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

  const completed = assessment.status === 'completed';
  const feedback = assessment.feedback;

  return (
    <>
      <PageHeader
        breadcrumb={<BackLink />}
        title="Assessment"
        description={`${assessment.title} · ${titleCase(assessment.language)}`}
        actions={<CopyButton value={assessment.id} label="Copy ID" />}
      />

      <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-line bg-surface px-4 py-3">
        <code className="font-mono text-[13px] text-white">{assessment.id}</code>
        <StatusBadge status={assessment.status} />
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-faint">{assessment.environment}</span>
        <span className="font-mono text-[12px] text-faint">Created {formatDateTime(assessment.created_at)}</span>
      </div>

      {assessment.status === 'failed' ? (
        <ErrorState
          code={assessment.error_code ?? 'ASSESSMENT_FAILED'}
          title="This assessment could not be completed."
          description={assessment.error_message ?? 'The assessment failed. Submit it again to retry.'}
        />
      ) : null}

      {pending ? (
        <div className="rounded-xl border border-line bg-surface px-5 py-6">
          <StatusBadge status={assessment.status} />
          <p className="mt-3 max-w-xl text-[13.5px] leading-relaxed text-muted">
            The submission is being assessed by multiple models, then reviewed. This page refreshes automatically, and
            your webhook endpoint will receive <code className="font-mono text-[12.5px] text-white">assessment.completed</code>.
          </p>
        </div>
      ) : null}

      {completed && feedback?.simulated ? (
        <p className="mb-4 rounded-lg border border-amber/40 px-4 py-2.5 text-[13px] text-amber">
          Simulated result. Test keys don&apos;t call the models, so these scores and feedback are placeholders.
        </p>
      ) : null}

      {completed ? (
        <div className={`grid gap-3 ${assessment.rubric_score !== null ? 'sm:grid-cols-4' : 'sm:grid-cols-3'}`}>
          <StatCard label="Score" value={`${assessment.score?.toFixed(1)} / 10`} detail="feedback quality" />
          {assessment.rubric_score !== null ? (
            <StatCard label="Rubric score" value={`${assessment.rubric_score.toFixed(1)} / 10`} detail="code, weighted" />
          ) : null}
          <StatCard label="Confidence" value={`${Math.round((assessment.confidence ?? 0) * 100)}%`} />
          <StatCard
            label="Processing"
            value={assessment.processing_seconds !== null ? `${assessment.processing_seconds.toFixed(1)}s` : '—'}
          />
        </div>
      ) : null}

      <section className="mt-8 grid gap-3 lg:grid-cols-5">
        <div className="overflow-hidden rounded-xl border border-line bg-surface lg:col-span-3">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">Submission</h2>
            <span className="font-mono text-[11.5px] text-muted">{assessment.language}</span>
          </div>
          <CodePre code={assessment.code} lineNumbers className="!px-4 !py-4 !text-[12.5px] !leading-[1.75]" />
        </div>

        <div className="overflow-hidden rounded-xl border border-line bg-surface lg:col-span-2">
          <div className="border-b border-line px-4 py-2.5">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">Assignment</h2>
          </div>
          <div className="px-4 py-4">
            <p className="text-[14px] text-white">{assessment.title}</p>
            <p className="mt-2 whitespace-pre-wrap text-[13px] leading-relaxed text-muted">
              {assessment.assignment_requirements}
            </p>
            {assessment.rubric ? (
              <div className="mt-4 border-t border-line pt-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
                  Rubric{assessment.rubric.learner_level ? ` · ${assessment.rubric.learner_level}` : ''}
                </p>
                <ul className="mt-2 space-y-1.5">
                  {assessment.rubric.criteria.map((criterion) => (
                    <li key={criterion.name} className="text-[12.5px] text-muted">
                      <span className="text-white">{criterion.name}</span> ({criterion.weight}%): {criterion.description}
                    </li>
                  ))}
                </ul>
                {assessment.rubric.notes ? (
                  <p className="mt-2 text-[12.5px] italic text-faint">{assessment.rubric.notes}</p>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {completed && assessment.models.length > 0 ? (
        <section className="mt-8">
          <h2 className="mb-3 text-[14.5px] font-medium text-white">Model assessments</h2>
          <div className="grid gap-3 lg:grid-cols-3">
            {assessment.models.map((model) => (
              <ModelCard key={model.provider} model={model} />
            ))}
          </div>
          {assessment.reviewer_model ? (
            <p className="mt-3 font-mono text-[11.5px] text-faint">
              Reviewed by {assessment.reviewer_model}. Model scores are the reviewer&apos;s rating of each model&apos;s
              feedback.
            </p>
          ) : null}
        </section>
      ) : null}

      {completed && assessment.rubric_scores ? (
        <section className="mt-8 overflow-hidden rounded-xl border border-line bg-surface">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <h2 className="text-[14.5px] font-medium text-white">Rubric</h2>
            <span className="font-mono text-[11.5px] text-faint">Grades the code itself</span>
          </div>
          <ul className="divide-y divide-line-soft">
            {assessment.rubric_scores.map((item) => (
              <li key={item.name} className="px-5 py-3.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[13.5px] text-white">
                    {item.name} <span className="font-mono text-[11.5px] text-faint">{item.weight}%</span>
                  </span>
                  <span className="font-mono text-[13px] text-white">{item.score.toFixed(1)}</span>
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">{item.comment}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {completed && feedback ? (
        <section className="mt-8 grid gap-3 lg:grid-cols-5">
          <div className="overflow-hidden rounded-xl border border-line bg-surface lg:col-span-3">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-ok">Final feedback</h2>
              <span className="font-mono text-[11.5px] text-faint">
                Confidence {Math.round((assessment.confidence ?? 0) * 100)}%
              </span>
            </div>
            <div className="px-5 py-5">
              <p className="text-[14px] leading-relaxed text-muted">{feedback.summary}</p>
              {feedback.issues.length > 0 ? (
                <div className="mt-5 border-t border-line pt-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">Issues</p>
                  <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[13.5px] leading-relaxed text-white">
                    {feedback.issues.map((issue) => (
                      <li key={issue}>{issue}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {feedback.suggestions.length > 0 ? (
                <div className="mt-5 border-t border-line pt-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">Suggestions</p>
                  <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[13.5px] leading-relaxed text-white">
                    {feedback.suggestions.map((suggestion) => (
                      <li key={suggestion}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>

          {assessment.criteria ? (
            <div className="overflow-hidden rounded-xl border border-line bg-surface lg:col-span-2">
              <div className="border-b border-line px-5 py-3">
                <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">Evaluation</h2>
              </div>
              <ScoreBars scores={assessment.criteria} />
            </div>
          ) : null}
        </section>
      ) : null}
    </>
  );
}
