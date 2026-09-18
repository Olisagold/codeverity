'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeftIcon } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { MethodBadge } from '@/components/ui/MethodBadge';
import { logs } from '@/lib/dashboard';

function statusColor(status: number) {
  if (status >= 500) return 'text-[#EF4444]';
  if (status >= 400) return 'text-amber';
  return 'text-ok';
}

export default function LogDetailsPage() {
  const params = useParams<{ id: string }>();
  const log = logs.find((item) => item.id === params.id);

  if (!log) {
    return (
      <EmptyState
        title="Log entry not found."
        description="This request may be outside the retained log window."
        action={
          <Link
            href="/dashboard/logs"
            className="rounded-lg border border-line-strong px-3.5 py-2 text-[13px] text-white transition-colors duration-150 ease-out hover:border-white/60"
          >
            Back to logs
          </Link>
        }
      />
    );
  }

  return (
    <>
      <PageHeader
        breadcrumb={
          <Link
            href="/dashboard/logs"
            className="inline-flex items-center gap-1.5 font-mono text-[11.5px] uppercase tracking-[0.14em] text-faint transition-colors duration-150 ease-out hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <ChevronLeftIcon aria-hidden="true" className="h-3.5 w-3.5" />
            Logs
          </Link>
        }
        title="Request"
        description={log.endpoint}
      />

      <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-line bg-surface px-4 py-3">
        <MethodBadge method={log.method} />
        <code className="font-mono text-[13px] text-white">{log.endpoint}</code>
        <span className={`font-mono text-[12.5px] ${statusColor(log.status)}`}>{log.status}</span>
      </div>

      <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-4">
        {[
          { label: 'Time', value: log.time },
          { label: 'Duration', value: log.duration },
          { label: 'API key', value: log.key },
          { label: 'Request ID', value: log.id },
        ].map((item) => (
          <div key={item.label}>
            <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">{item.label}</dt>
            <dd className="mt-1.5 font-mono text-[12.5px] text-white">{item.value}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}
