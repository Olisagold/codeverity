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
import { QuickstartCard } from '@/components/dashboard/QuickstartCard';
import { assessments, seriesForRange } from '@/lib/dashboard';
import type { Assessment } from '@/types/dashboard';

const columns: Column<Assessment>[] = [
  {
    key: 'id',
    header: 'ID',
    render: (row) => <span className="font-mono text-[12.5px] text-white">{row.id}</span>,
  },
  { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  { key: 'language', header: 'Language', render: (row) => row.language },
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
    render: (row) => <span className="font-mono text-[12px] text-faint">{row.created}</span>,
  },
];

export default function DashboardOverviewPage() {
  const [range, setRange] = useState<Range>('7d');
  const [showQuickstart, setShowQuickstart] = useState(true);
  const router = useRouter();

  const points = seriesForRange(range);
  const recent = assessments.slice(0, 5);

  return (
    <>
      <PageHeader
        title="Overview"
        description="Monitor your Codeverity integration and assessment activity."
        actions={
          <label className="flex items-center gap-2">
            <span className="sr-only">Time range</span>
            <select
              defaultValue="24h"
              className="h-8 rounded-lg border border-line bg-surface px-2.5 text-[12.5px] text-muted transition-colors duration-150 ease-out hover:border-line-strong focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
          </label>
        }
      />

      {showQuickstart ? <QuickstartCard onDismiss={() => setShowQuickstart(false)} /> : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Assessments" value="1,284" trend={{ direction: 'up', value: '12.4%' }} />
        <StatCard label="Completed" value="1,241" detail="96.7%" />
        <StatCard label="Failed" value="43" detail="3.3%" />
        <StatCard label="Avg. processing" value="18.4s" detail="last 24h" />
      </div>

      <section className="mt-6 rounded-xl border border-line bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          <h2 className="text-[14.5px] font-medium text-white">Assessment activity</h2>
          <RangeToggle value={range} onChange={setRange} />
        </div>
        <div className="px-5 py-5">
          <ActivityChart points={points} metric="assessments" />
        </div>
      </section>

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
        <DataTable
          columns={columns}
          rows={recent}
          rowKey={(row) => row.id}
          onRowClick={(row) => router.push(`/dashboard/assessments/${row.id}`)}
          caption="Recent assessments"
        />
      </section>
    </>
  );
}
