'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeftIcon } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { DataTable, type Column } from '@/components/dashboard/DataTable';
import { highlight } from '@/lib/utils/highlight';
import { webhooks } from '@/lib/dashboard';
import type { WebhookDelivery } from '@/types/dashboard';

export default function WebhookDetailsPage() {
  const params = useParams<{ id: string }>();
  const endpoint = webhooks.find((item) => item.id === params.id);
  const [selected, setSelected] = useState<WebhookDelivery | null>(null);
  const [tab, setTab] = useState<'request' | 'response' | 'headers'>('request');

  if (!endpoint) {
    return (
      <EmptyState
        title="Webhook endpoint not found."
        description="This endpoint may have been deleted."
        action={
          <Link
            href="/dashboard/webhooks"
            className="rounded-lg border border-line-strong px-3.5 py-2 text-[13px] text-white transition-colors duration-150 ease-out hover:border-white/60"
          >
            Back to webhooks
          </Link>
        }
      />
    );
  }

  const columns: Column<WebhookDelivery>[] = [
    {
      key: 'event',
      header: 'Event',
      render: (row) => <span className="font-mono text-[12.5px] text-white">{row.event}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span className={`font-mono text-[12.5px] ${row.status < 400 ? 'text-ok' : 'text-[#EF4444]'}`}>{row.status}</span>
      ),
    },
    {
      key: 'time',
      header: 'Time',
      className: 'text-right',
      render: (row) => <span className="font-mono text-[12px] text-faint">{row.time}</span>,
    },
  ];

  const headers = `Content-Type: application/json
Codeverity-Signature: t=1758196800,v1=8f2c...
User-Agent: Codeverity/1.0`;

  return (
    <>
      <PageHeader
        breadcrumb={
          <Link
            href="/dashboard/webhooks"
            className="inline-flex items-center gap-1.5 font-mono text-[11.5px] uppercase tracking-[0.14em] text-faint transition-colors duration-150 ease-out hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <ChevronLeftIcon aria-hidden="true" className="h-3.5 w-3.5" />
            Webhooks
          </Link>
        }
        title="Webhook endpoint"
        description={endpoint.url}
      />

      <div className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-line bg-surface px-5 py-3.5">
        <StatusBadge status={endpoint.active ? 'active' : 'disabled'} />
        <span className="font-mono text-[11.5px] text-faint">Last delivery {endpoint.lastDelivery}</span>
        <div className="flex flex-wrap gap-2">
          {endpoint.events.map((event) => (
            <span key={event} className="rounded border border-line px-2 py-0.5 font-mono text-[11.5px] text-muted">
              {event}
            </span>
          ))}
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-[14.5px] font-medium text-white">Recent deliveries</h2>
        <DataTable
          columns={columns}
          rows={endpoint.deliveries}
          rowKey={(row) => row.id}
          onRowClick={(row) => {
            setSelected(row);
            setTab('request');
          }}
          caption="Recent deliveries"
          empty={<EmptyState title="No deliveries yet." description="Deliveries appear here once an assessment event is sent to this endpoint." />}
        />
      </section>

      {selected ? (
        <section className="mt-6 overflow-hidden rounded-xl border border-line bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3">
            <div className="flex items-center gap-3">
              <code className="font-mono text-[12.5px] text-white">{selected.id}</code>
              <span className={`font-mono text-[12px] ${selected.status < 400 ? 'text-ok' : 'text-[#EF4444]'}`}>
                {selected.status}
              </span>
              <span className="font-mono text-[11.5px] text-faint">{selected.time}</span>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="rounded-md px-2 py-1 text-[12.5px] text-faint transition-colors duration-150 ease-out hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Close
            </button>
          </div>

          <div role="tablist" aria-label="Delivery detail" className="flex items-center border-b border-line pl-2">
            {(['request', 'response', 'headers'] as const).map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={tab === item}
                onClick={() => setTab(item)}
                className={`relative px-3 py-2.5 font-mono text-[12px] capitalize transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent ${
                  tab === item ? 'text-white' : 'text-faint hover:text-muted'
                }`}
              >
                {item}
                {tab === item ? <span aria-hidden="true" className="absolute inset-x-2 -bottom-px h-px bg-accent" /> : null}
              </button>
            ))}
          </div>

          <pre className="overflow-x-auto px-5 py-4 font-mono text-[12.5px] leading-6 text-muted">
            <code>{highlight(tab === 'request' ? selected.request : tab === 'response' ? selected.response : headers)}</code>
          </pre>
        </section>
      ) : null}
    </>
  );
}
