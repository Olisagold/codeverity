'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DownloadIcon, SearchIcon } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { DataTable, type Column } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { assessments } from '@/lib/dashboard';
import type { Assessment } from '@/types/dashboard';

const selectClasses =
  'h-8 rounded-lg border border-line bg-surface px-2.5 text-[12.5px] text-muted transition-colors duration-150 ease-out hover:border-line-strong focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent';

export default function AssessmentsPage() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [language, setLanguage] = useState('all');
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 650);
    return () => window.clearTimeout(timer);
  }, []);

  const rows = useMemo(
    () =>
      assessments.filter((assessment) => {
        const matchesStatus = status === 'all' || assessment.status === status;
        const matchesLanguage = language === 'all' || assessment.language === language;
        const matchesQuery = assessment.id.toLowerCase().includes(query.trim().toLowerCase());
        return matchesStatus && matchesLanguage && matchesQuery;
      }),
    [status, language, query]
  );

  const columns: Column<Assessment>[] = [
    {
      key: 'id',
      header: 'Assessment ID',
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
      render: (row) => <span className="font-mono text-[12px] text-faint">{row.created}</span>,
    },
  ];

  return (
    <>
      <PageHeader
        title="Assessments"
        description="View and inspect code assessments submitted through your API."
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-[13px] text-muted transition-colors duration-150 ease-out hover:border-line-strong hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <DownloadIcon aria-hidden="true" className="h-3.5 w-3.5" />
            Export
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2">
          <span className="sr-only">Status</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className={selectClasses}>
            <option value="all">All statuses</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
            <option value="queued">Queued</option>
            <option value="failed">Failed</option>
          </select>
        </label>

        <label className="flex items-center gap-2">
          <span className="sr-only">Language</span>
          <select value={language} onChange={(event) => setLanguage(event.target.value)} className={selectClasses}>
            <option value="all">All languages</option>
            <option value="Python">Python</option>
            <option value="JavaScript">JavaScript</option>
            <option value="Java">Java</option>
          </select>
        </label>

        <label className="flex items-center gap-2">
          <span className="sr-only">Date range</span>
          <select defaultValue="30d" className={selectClasses}>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
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

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        loading={loading}
        onRowClick={(row) => router.push(`/dashboard/assessments/${row.id}`)}
        caption="Assessments"
        empty={
          query || status !== 'all' || language !== 'all' ? (
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
    </>
  );
}
