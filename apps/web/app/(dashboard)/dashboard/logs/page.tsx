'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { DataTable, type Column } from '@/components/dashboard/DataTable';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { ErrorState } from '@/components/dashboard/ErrorState';
import { MethodBadge } from '@/components/ui/MethodBadge';
import { useApi } from '@/hooks/useApi';
import { errorMessage } from '@/lib/api/client';
import { listLogs } from '@/lib/api/dashboard';
import { formatDateTime } from '@/lib/format';
import type { LogEntry } from '@/types/api';

const selectClasses =
  'h-8 rounded-lg border border-line bg-surface px-2.5 text-[12.5px] text-muted transition-colors duration-150 ease-out hover:border-line-strong focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent';

export function statusColor(status: number) {
  if (status >= 500) return 'text-[#EF4444]';
  if (status >= 400) return 'text-amber';
  return 'text-ok';
}

const columns: Column<LogEntry>[] = [
  {
    key: 'time',
    header: 'Time',
    render: (row) => <span className="font-mono text-[12.5px] text-faint">{formatDateTime(row.created_at)}</span>,
  },
  { key: 'method', header: 'Method', render: (row) => <MethodBadge method={row.method} /> },
  {
    key: 'endpoint',
    header: 'Endpoint',
    render: (row) => <span className="font-mono text-[12.5px] text-white">{row.path}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <span className={`font-mono text-[12.5px] ${statusColor(row.status)}`}>{row.status}</span>,
  },
  { key: 'key', header: 'API key', render: (row) => <span className="text-[12.5px]">{row.api_key?.name ?? 'Deleted key'}</span> },
  {
    key: 'duration',
    header: 'Duration',
    className: 'text-right',
    render: (row) => <span className="font-mono text-[12px] text-faint">{row.duration_ms}ms</span>,
  },
];

export default function LogsPage() {
  const [method, setMethod] = useState('all');
  const [status, setStatus] = useState('all');
  const [environment, setEnvironment] = useState('all');
  const [rows, setRows] = useState<LogEntry[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState<string | null>(null);
  const [selected, setSelected] = useState<LogEntry | null>(null);

  const filters = { method, status, environment };
  const first = useApi(() => listLogs(filters), [method, status, environment], 'Could not load logs.');

  useEffect(() => {
    if (first.data) {
      setRows(first.data.data);
      setCursor(first.data.next_cursor);
      setSelected(null);
    }
  }, [first.data]);

  async function loadMore() {
    if (!cursor) return;
    setLoadingMore(true);
    setMoreError(null);
    try {
      const page = await listLogs({ ...filters, before: cursor });
      setRows((current) => [...current, ...page.data]);
      setCursor(page.next_cursor);
    } catch (error) {
      setMoreError(errorMessage(error, 'Could not load more logs.'));
    } finally {
      setLoadingMore(false);
    }
  }

  const filtered = method !== 'all' || status !== 'all' || environment !== 'all';

  return (
    <>
      <PageHeader
        title="API Logs"
        description="Requests made to the Codeverity API with your keys. Kept for 30 days."
        actions={
          <button
            type="button"
            onClick={first.reload}
            className="rounded-lg border border-line px-3 py-1.5 text-[13px] text-muted transition-colors duration-150 ease-out hover:border-line-strong hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Refresh
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label>
          <span className="sr-only">Method</span>
          <select value={method} onChange={(event) => setMethod(event.target.value)} className={selectClasses}>
            <option value="all">All methods</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
          </select>
        </label>
        <label>
          <span className="sr-only">Status</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className={selectClasses}>
            <option value="all">All statuses</option>
            <option value="success">2xx / 3xx</option>
            <option value="error">4xx / 5xx</option>
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
      </div>

      {first.error ? (
        <ErrorState title="Could not load logs." description={first.error} />
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(row) => row.id}
          loading={first.loading && rows.length === 0}
          onRowClick={(row) => setSelected(row)}
          caption="API logs"
          empty={
            filtered ? (
              <EmptyState title="No requests match these filters." description="Try a different method, status, or environment." />
            ) : (
              <EmptyState title="No requests yet." description="Requests made with your API keys will appear here." />
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

      {selected ? (
        <section className="mt-6 overflow-hidden rounded-xl border border-line bg-surface">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <div className="flex items-center gap-3">
              <MethodBadge method={selected.method} />
              <code className="font-mono text-[12.5px] text-white">{selected.path}</code>
              <span className={`font-mono text-[12px] ${statusColor(selected.status)}`}>{selected.status}</span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/dashboard/logs/${selected.id}`}
                className="rounded-md px-2 py-1 text-[12.5px] text-faint transition-colors duration-150 ease-out hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Open
              </Link>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-md px-2 py-1 text-[12.5px] text-faint transition-colors duration-150 ease-out hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Close
              </button>
            </div>
          </div>
          <dl className="grid gap-x-8 gap-y-4 px-5 py-4 sm:grid-cols-4">
            {[
              { label: 'Time', value: formatDateTime(selected.created_at) },
              { label: 'Duration', value: `${selected.duration_ms}ms` },
              { label: 'API key', value: `${selected.api_key?.name ?? 'Deleted key'} (${selected.environment})` },
              { label: 'Request ID', value: selected.id },
            ].map((item) => (
              <div key={item.label}>
                <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">{item.label}</dt>
                <dd className="mt-1.5 break-all font-mono text-[12.5px] text-white">{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
    </>
  );
}
