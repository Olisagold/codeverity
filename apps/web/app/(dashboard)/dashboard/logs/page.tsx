'use client';

import React, { useMemo, useState } from 'react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { DataTable, type Column } from '@/components/dashboard/DataTable';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { MethodBadge } from '@/components/ui/MethodBadge';
import { logs } from '@/lib/dashboard';
import type { LogEntry } from '@/types/dashboard';

const selectClasses =
  'h-8 rounded-lg border border-line bg-surface px-2.5 text-[12.5px] text-muted transition-colors duration-150 ease-out hover:border-line-strong focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent';

function statusColor(status: number) {
  if (status >= 500) return 'text-[#EF4444]';
  if (status >= 400) return 'text-amber';
  return 'text-ok';
}

export default function LogsPage() {
  const [method, setMethod] = useState('all');
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState<LogEntry | null>(null);

  const rows = useMemo(
    () =>
      logs.filter((log) => {
        const matchesMethod = method === 'all' || log.method === method;
        const matchesStatus = status === 'all' || (status === 'success' && log.status < 400) || (status === 'error' && log.status >= 400);
        return matchesMethod && matchesStatus;
      }),
    [method, status]
  );

  const columns: Column<LogEntry>[] = [
    {
      key: 'time',
      header: 'Time',
      render: (row) => <span className="font-mono text-[12.5px] text-faint">{row.time}</span>,
    },
    { key: 'method', header: 'Method', render: (row) => <MethodBadge method={row.method} /> },
    {
      key: 'endpoint',
      header: 'Endpoint',
      render: (row) => <span className="font-mono text-[12.5px] text-white">{row.endpoint}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <span className={`font-mono text-[12.5px] ${statusColor(row.status)}`}>{row.status}</span>,
    },
    { key: 'key', header: 'API key', render: (row) => <span className="text-[12.5px]">{row.key}</span> },
    {
      key: 'duration',
      header: 'Duration',
      className: 'text-right',
      render: (row) => <span className="font-mono text-[12px] text-faint">{row.duration}</span>,
    },
  ];

  return (
    <>
      <PageHeader title="API Logs" description="Inspect requests made to your Codeverity API." />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label>
          <span className="sr-only">Method</span>
          <select value={method} onChange={(event) => setMethod(event.target.value)} className={selectClasses}>
            <option value="all">All methods</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="DELETE">DELETE</option>
          </select>
        </label>
        <label>
          <span className="sr-only">Status</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className={selectClasses}>
            <option value="all">All statuses</option>
            <option value="success">2xx</option>
            <option value="error">4xx / 5xx</option>
          </select>
        </label>
        <label>
          <span className="sr-only">Date</span>
          <select defaultValue="24h" className={selectClasses}>
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
          </select>
        </label>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        onRowClick={(row) => setSelected(row)}
        caption="API logs"
        empty={<EmptyState title="No requests match these filters." description="Try a different method or status." />}
      />

      {selected ? (
        <section className="mt-6 overflow-hidden rounded-xl border border-line bg-surface">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <div className="flex items-center gap-3">
              <MethodBadge method={selected.method} />
              <code className="font-mono text-[12.5px] text-white">{selected.endpoint}</code>
              <span className={`font-mono text-[12px] ${statusColor(selected.status)}`}>{selected.status}</span>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="rounded-md px-2 py-1 text-[12.5px] text-faint transition-colors duration-150 ease-out hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Close
            </button>
          </div>
          <dl className="grid gap-x-8 gap-y-4 px-5 py-4 sm:grid-cols-4">
            {[
              { label: 'Time', value: selected.time },
              { label: 'Duration', value: selected.duration },
              { label: 'API key', value: selected.key },
              { label: 'Request ID', value: selected.id },
            ].map((item) => (
              <div key={item.label}>
                <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">{item.label}</dt>
                <dd className="mt-1.5 font-mono text-[12.5px] text-white">{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
    </>
  );
}
