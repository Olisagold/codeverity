'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { ActivityChart } from '@/components/dashboard/ActivityChart';
import { RangeToggle, type Range } from '@/components/dashboard/RangeToggle';
import { ErrorState } from '@/components/dashboard/ErrorState';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { Skeleton } from '@/components/dashboard/Skeleton';
import { useApi } from '@/hooks/useApi';
import { getUsage } from '@/lib/api/dashboard';
import { formatNumber, percent } from '@/lib/format';
import { toSeries } from '@/lib/series';
import type { Environment } from '@/types/api';

export default function UsagePage() {
  const [range, setRange] = useState<Range>('30d');
  const [environment, setEnvironment] = useState<Environment | 'all'>('all');
  const { data: usage, error, loading } = useApi(() => getUsage(range, environment), [range, environment], 'Could not load usage.');
  const totals = usage?.totals;

  return (
    <>
      <PageHeader
        title="Usage"
        description="Monitor API requests and assessment activity."
        actions={
          <label>
            <span className="sr-only">Environment</span>
            <select
              value={environment}
              onChange={(event) => setEnvironment(event.target.value as Environment | 'all')}
              className="h-8 rounded-lg border border-line bg-surface px-2.5 text-[12.5px] text-muted transition-colors duration-150 ease-out hover:border-line-strong focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="all">Live and test</option>
              <option value="live">Live</option>
              <option value="test">Test</option>
            </select>
          </label>
        }
      />

      {error ? (
        <ErrorState title="Could not load usage." description={error} />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="API requests" value={totals ? formatNumber(totals.requests) : '—'} detail={`last ${range}`} />
            <StatCard label="Assessments" value={totals ? formatNumber(totals.assessments) : '—'} detail="this period" />
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
          </div>

          <section className="mt-6 rounded-xl border border-line bg-surface">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
              <h2 className="text-[14.5px] font-medium text-white">Requests</h2>
              <RangeToggle value={range} onChange={setRange} />
            </div>
            <div className="px-5 py-5">
              {usage ? <ActivityChart points={toSeries(usage)} metric="requests" /> : <Skeleton rows={4} />}
            </div>
          </section>

          <section className="mt-6 overflow-hidden rounded-xl border border-line bg-surface">
            <div className="border-b border-line px-5 py-3.5">
              <h2 className="text-[14.5px] font-medium text-white">Usage by API key</h2>
            </div>
            {loading && !usage ? (
              <div className="p-3">
                <Skeleton rows={3} />
              </div>
            ) : (usage?.by_key ?? []).length === 0 ? (
              <EmptyState title="No requests in this period." description="Usage per key appears once your keys make requests." />
            ) : (
              <ul className="divide-y divide-line-soft">
                {(usage?.by_key ?? []).map((row) => (
                  <li key={row.api_key?.id ?? 'deleted'} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                    <p className="text-[13.5px] text-white">{row.api_key?.name ?? 'Deleted keys'}</p>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="font-mono text-[13px] text-white">{formatNumber(row.requests)}</p>
                        <p className="font-mono text-[11px] text-faint">requests</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-[13px] text-white">{formatNumber(row.assessments)}</p>
                        <p className="font-mono text-[11px] text-faint">assessments</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </>
  );
}
