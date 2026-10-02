'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DownloadIcon, SearchIcon } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { DataTable, type Column } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { ErrorState } from '@/components/dashboard/ErrorState';
import { useApi } from '@/hooks/useApi';
import { errorMessage } from '@/lib/api/client';
import { listAssessments } from '@/lib/api/dashboard';
import { formatDateTime } from '@/lib/format';
import type { AssessmentSummary } from '@/types/api';

const selectClasses =
  'h-8 rounded-lg border border-line bg-surface px-2.5 text-[12.5px] text-muted transition-colors duration-150 ease-out hover:border-line-strong focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent';

const columns: Column<AssessmentSummary>[] = [
  {
    key: 'id',
    header: 'Assessment ID',
    render: (row) => <span className="font-mono text-[12.5px] text-white">{row.id}</span>,
  },
  { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  { key: 'language', header: 'Language', render: (row) => <span className="capitalize">{row.language}</span> },
  {
    key: 'environment',
    header: 'Env',
    render: (row) => <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-faint">{row.environment}</span>,
  },
  {
    key: 'score',
    header: 'Score',
    render: (row) => (
      <span className="font-mono text-[12.5px] text-white">{row.score === null ? '—' : row.score.toFixed(1)}</span>
    ),
  },
  {
    key: 'confidence',
    header: 'Confidence',
    render: (row) => (
      <span className="font-mono text-[12.5px] text-muted">
        {row.confidence === null ? '—' : `${Math.round(row.confidence * 100)}%`}
      </span>
    ),
  },
  {
    key: 'created',
    header: 'Created',
    className: 'text-right',
    render: (row) => <span className="font-mono text-[12px] text-faint">{formatDateTime(row.created_at)}</span>,
  },
];

function exportCsv(rows: AssessmentSummary[]) {
  const header = ['id', 'status', 'environment', 'language', 'title', 'score', 'confidence', 'rubric_score', 'created_at'];
  const escape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const lines = rows.map((row) => header.map((key) => escape(row[key as keyof AssessmentSummary])).join(','));
  const blob = new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'assessments.csv';
  link.click();
  URL.revokeObjectURL(link.href);
}

export default function AssessmentsPage() {
  const [status, setStatus] = useState('all');
  const [language, setLanguage] = useState('all');
  const [environment, setEnvironment] = useState('all');
  const [range, setRange] = useState('30d');
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<AssessmentSummary[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState<string | null>(null);
  const router = useRouter();

  // Wait for typing to pause before searching.
  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(query.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const filters = { status, language, environment, range, q: search };
  const first = useApi(() => listAssessments(filters), [status, language, environment, range, search], 'Could not load assessments.');

  useEffect(() => {
    if (first.data) {
      setRows(first.data.data);
      setCursor(first.data.next_cursor);
    }
  }, [first.data]);

  async function loadMore() {
    if (!cursor) return;
    setLoadingMore(true);
    setMoreError(null);
    try {
      const page = await listAssessments({ ...filters, before: cursor });
      setRows((current) => [...current, ...page.data]);
      setCursor(page.next_cursor);
    } catch (error) {
      setMoreError(errorMessage(error, 'Could not load more assessments.'));
    } finally {
      setLoadingMore(false);
    }
  }

  const filtered = Boolean(search) || status !== 'all' || language !== 'all' || environment !== 'all';

  return (
    <>
      <PageHeader
        title="Assessments"
        description="View and inspect code assessments submitted through your API."
        actions={
          <button
            type="button"
            onClick={() => exportCsv(rows)}
            disabled={rows.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-[13px] text-muted transition-colors duration-150 ease-out hover:border-line-strong hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
          >
            <DownloadIcon aria-hidden="true" className="h-3.5 w-3.5" />
            Export
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label>
          <span className="sr-only">Status</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className={selectClasses}>
            <option value="all">All statuses</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
            <option value="queued">Queued</option>
            <option value="failed">Failed</option>
          </select>
        </label>

        <label>
          <span className="sr-only">Language</span>
          <select value={language} onChange={(event) => setLanguage(event.target.value)} className={`${selectClasses} capitalize`}>
            <option value="all">All languages</option>
            {(first.data?.languages ?? []).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="sr-only">Environment</span>
          <select value={environment} onChange={(event) => setEnvironment(event.target.value)} className={selectClasses}>
            <option value="all">Live and test</option>
            <option value="live">Live</option>
            <option value="test">Test</option>
          </select>
        </label>

        <label>
          <span className="sr-only">Date range</span>
          <select value={range} onChange={(event) => setRange(event.target.value)} className={selectClasses}>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </label>

        <div className="relative ml-auto">
          <SearchIcon aria-hidden="true" className="pointer-events-none absolute left-2.5 top-2 h-4 w-4 text-faint" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search assessment ID…"
            aria-label="Search assessment ID"
            className="h-8 w-56 rounded-lg border border-line bg-surface pl-8 pr-3 font-mono text-[12.5px] text-white placeholder:text-faint transition-colors duration-150 ease-out hover:border-line-strong focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      {first.error ? (
        <ErrorState title="Could not load assessments." description={first.error} />
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(row) => row.id}
          loading={first.loading && rows.length === 0}
          onRowClick={(row) => router.push(`/dashboard/assessments/${row.id}`)}
          caption="Assessments"
          empty={
            filtered ? (
              <EmptyState title="No assessments match these filters." description="Try a different status, language, or assessment ID." />
            ) : (
              <EmptyState
                title="No assessments yet."
                description="Once your application sends its first assessment, it will appear here."
                action={
                  <Link
                    href="/docs/quickstart"
                    className="rounded-lg bg-white px-3.5 py-2 text-[13px] font-medium text-black transition-colors duration-150 ease-out hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  >
                    Read the quickstart
                  </Link>
                }
              />
            )
          }
        />
      )}

      {cursor ? (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="rounded-lg border border-line px-3 py-1.5 text-[13px] text-muted transition-colors duration-150 ease-out hover:border-line-strong hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
          >
            {loadingMore ? 'Loading…' : 'Load more'}
          </button>
          {moreError ? <span className="text-[12.5px] text-amber">{moreError}</span> : null}
        </div>
      ) : null}
    </>
  );
}
