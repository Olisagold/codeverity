'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { ActivityChart } from '@/components/dashboard/ActivityChart';
import { RangeToggle, type Range } from '@/components/dashboard/RangeToggle';
import { DataTable, type Column } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { ErrorState } from '@/components/dashboard/ErrorState';
import { Skeleton } from '@/components/dashboard/Skeleton';
import { QuickstartCard, quickstartSteps } from '@/components/dashboard/QuickstartCard';
import { useApi } from '@/hooks/useApi';
import { dismissQuickstart, getQuickstart, getUsage, listAssessments } from '@/lib/api/dashboard';
import { formatNumber, formatRelative, percent } from '@/lib/format';
import { toSeries } from '@/lib/series';
import type { AssessmentSummary } from '@/types/api';

const columns: Column<AssessmentSummary>[] = [
  {
    key: 'id',
    header: 'ID',
    render: (row) => <span className="font-mono text-[12.5px] text-white">{row.id}</span>,
  },
  { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  { key: 'language', header: 'Language', render: (row) => <span className="capitalize">{row.language}</span> },
  {
    key: 'score',
    header: 'Score',
    render: (row) => (
      <span className="font-mono text-[12.5px] text-white">{row.score === null ? '—' : row.score.toFixed(1)}</span>
    ),
  },
  {
    key: 'created',
    header: 'Created',
    className: 'text-right',
    render: (row) => <span className="font-mono text-[12px] text-faint">{formatRelative(row.created_at)}</span>,
  },
];

export default function DashboardOverviewPage() {
  const [range, setRange] = useState<Range>('7d');
  const router = useRouter();

  const usage = useApi(() => getUsage(range), [range], 'Could not load activity.');
  const recent = useApi(() => listAssessments({ limit: 5 }), [], 'Could not load recent assessments.');
  const quickstart = useApi(getQuickstart, [], 'Could not load quickstart.');
  const progress = quickstart.data;
  // Hidden once dismissed or finished. Errors just leave it hidden.
  const showQuickstart = progress && !progress.dismissed && quickstartSteps(progress).some((step) => !step.done);

  function hideQuickstart() {
    if (!progress) return;
    quickstart.setData({ ...progress, dismissed: true });
    // If saving fails the card just comes back on the next visit.
    dismissQuickstart().catch(() => undefined);
  }
  const totals = usage.data?.totals;

  return (
    <>
      <PageHeader
        title="Overview"
        description="Monitor your Codeverity integration and assessment activity."
        actions={<RangeToggle value={range} onChange={setRange} />}
      />

      {progress && showQuickstart ? <QuickstartCard progress={progress} onDismiss={hideQuickstart} /> : null}

      {usage.error ? (
        <ErrorState title="Could not load activity." description={usage.error} />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Assessments" value={totals ? formatNumber(totals.assessments) : '—'} detail={`last ${range}`} />
            <StatCard
              label="Completed"
              value={totals ? formatNumber(totals.completed) : '—'}
              detail={totals ? percent(totals.completed, totals.assessments) : undefined}
            />
            <StatCard
              label="Failed"
              value={totals ? formatNumber(totals.failed) : '—'}
              detail={totals ? percent(totals.failed, totals.assessments) : undefined}
            />
            <StatCard
              label="Avg. processing"
              value={totals?.avg_processing_seconds != null ? `${totals.avg_processing_seconds}s` : '—'}
              detail="completed only"
            />
          </div>

          <section className="mt-6 rounded-xl border border-line bg-surface">
            <div className="border-b border-line px-5 py-3.5">
              <h2 className="text-[14.5px] font-medium text-white">Assessment activity</h2>
            </div>
            <div className="px-5 py-5">
              {usage.data ? <ActivityChart points={toSeries(usage.data)} metric="assessments" /> : <Skeleton rows={4} />}
            </div>
          </section>
        </>
      )}

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[14.5px] font-medium text-white">Recent assessments</h2>
          <Link
            href="/dashboard/assessments"
            className="text-[13px] text-accent underline-offset-4 transition-colors duration-150 ease-out hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            View all
          </Link>
        </div>
        {recent.error ? (
          <ErrorState title="Could not load recent assessments." description={recent.error} />
        ) : (
          <DataTable
            columns={columns}
            rows={recent.data?.data ?? []}
            rowKey={(row) => row.id}
            loading={recent.loading}
            onRowClick={(row) => router.push(`/dashboard/assessments/${row.id}`)}
            caption="Recent assessments"
            empty={
              <EmptyState
                title="No assessments yet."
                description="Once your application sends its first assessment, it will appear here."
              />
            }
          />
        )}
      </section>
    </>
  );
}
