'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeftIcon, RefreshCwIcon } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { ErrorState } from '@/components/dashboard/ErrorState';
import { Skeleton } from '@/components/dashboard/Skeleton';
import { DataTable, type Column } from '@/components/dashboard/DataTable';
import { SecretModal } from '@/components/dashboard/SecretModal';
import { Modal } from '@/components/dashboard/Modal';
import { CodePre } from '@/components/ui/CodePre';
import { useApi } from '@/hooks/useApi';
import { errorMessage } from '@/lib/api/client';
import { getWebhook, listDeliveries, rotateWebhookSecret, sendTestEvent, updateWebhook } from '@/lib/api/dashboard';
import { formatDateTime, formatRelative } from '@/lib/format';
import type { Delivery, WebhookEvent } from '@/types/api';

const allEvents: WebhookEvent[] = ['assessment.completed', 'assessment.failed'];

const deliveryTone: Record<Delivery['status'], 'success' | 'error' | 'neutral'> = {
  succeeded: 'success',
  failed: 'error',
  pending: 'neutral',
};

const buttonClasses =
  'rounded-lg border border-line px-3 py-1.5 text-[13px] text-muted transition-colors duration-150 ease-out hover:border-line-strong hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50';

function headersFor(delivery: Delivery) {
  return `Content-Type: application/json
User-Agent: Codeverity-Webhooks/1.0
Codeverity-Event: ${delivery.event_type}
Codeverity-Delivery: ${delivery.id}
Codeverity-Signature: t=<unix time>,v1=<HMAC-SHA256 of "<t>.<body>">`;
}

function responseFor(delivery: Delivery) {
  const lines = [
    `Status: ${delivery.status}`,
    `Attempts: ${delivery.attempts}`,
    `Last HTTP status: ${delivery.last_status_code ?? 'none'}`,
  ];
  if (delivery.last_error) lines.push(`Last error: ${delivery.last_error}`);
  if (delivery.delivered_at) lines.push(`Delivered: ${formatDateTime(delivery.delivered_at)}`);
  if (delivery.status === 'pending' && delivery.attempts > 0) lines.push('A retry is scheduled.');
  return lines.join('\n');
}

export default function WebhookDetailsPage() {
  const params = useParams<{ id: string }>();
  const endpoint = useApi(() => getWebhook(params.id), [params.id], 'Could not load this endpoint.');
  const deliveries = useApi(() => listDeliveries(params.id), [params.id], 'Could not load deliveries.');
  const [selected, setSelected] = useState<Delivery | null>(null);
  const [tab, setTab] = useState<'request' | 'response' | 'headers'>('request');
  const [secret, setSecret] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editUrl, setEditUrl] = useState('');
  const [editEvents, setEditEvents] = useState<WebhookEvent[]>([]);
  const [editError, setEditError] = useState('');

  async function run(action: () => Promise<void>, failure: string) {
    setBusy(true);
    setNotice(null);
    try {
      await action();
    } catch (error) {
      setNotice(errorMessage(error, failure));
    } finally {
      setBusy(false);
    }
  }

  const back = (
    <Link
      href="/dashboard/webhooks"
      className="inline-flex items-center gap-1.5 font-mono text-[11.5px] uppercase tracking-[0.14em] text-faint transition-colors duration-150 ease-out hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <ChevronLeftIcon aria-hidden="true" className="h-3.5 w-3.5" />
      Webhooks
    </Link>
  );

  if (endpoint.loading && !endpoint.data) {
    return (
      <>
        <PageHeader breadcrumb={back} title="Webhook endpoint" />
        <Skeleton rows={5} />
      </>
    );
  }

  const webhook = endpoint.data;
  if (!webhook) {
    return (
      <EmptyState
        title="Webhook endpoint not found."
        description={endpoint.error === 'Webhook not found.' ? 'This endpoint may have been deleted.' : endpoint.error ?? ''}
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

  function openEdit() {
    if (!webhook) return;
    setEditUrl(webhook.url);
    setEditEvents(webhook.events);
    setEditError('');
    setEditing(true);
  }

  async function saveEdit() {
    if (!webhook) return;
    if (editEvents.length === 0) {
      setEditError('Choose at least one event.');
      return;
    }
    setBusy(true);
    setEditError('');
    try {
      endpoint.setData(await updateWebhook(webhook.id, { url: editUrl.trim(), events: editEvents }));
      setEditing(false);
    } catch (error) {
      setEditError(errorMessage(error, 'Could not save the endpoint.'));
    } finally {
      setBusy(false);
    }
  }

  const columns: Column<Delivery>[] = [
    {
      key: 'event',
      header: 'Event',
      render: (row) => <span className="font-mono text-[12.5px] text-white">{row.event_type}</span>,
    },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} tone={deliveryTone[row.status]} /> },
    {
      key: 'code',
      header: 'HTTP',
      render: (row) => (
        <span className={`font-mono text-[12.5px] ${row.last_status_code && row.last_status_code < 400 ? 'text-ok' : 'text-faint'}`}>
          {row.last_status_code ?? '—'}
        </span>
      ),
    },
    { key: 'attempts', header: 'Attempts', render: (row) => <span className="font-mono text-[12.5px]">{row.attempts}</span> },
    {
      key: 'time',
      header: 'Created',
      className: 'text-right',
      render: (row) => <span className="font-mono text-[12px] text-faint">{formatDateTime(row.created_at)}</span>,
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumb={back}
        title="Webhook endpoint"
        description={webhook.url}
        actions={
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={busy} className={buttonClasses} onClick={openEdit}>
              Edit
            </button>
            <button
              type="button"
              disabled={busy}
              className={buttonClasses}
              onClick={() =>
                run(async () => {
                  await sendTestEvent(webhook.id);
                  deliveries.reload();
                }, 'Could not send a test event.')
              }
            >
              Send test event
            </button>
            <button
              type="button"
              disabled={busy}
              className={buttonClasses}
              onClick={() =>
                run(async () => {
                  setSecret((await rotateWebhookSecret(webhook.id)).secret);
                }, 'Could not rotate the secret.')
              }
            >
              Rotate secret
            </button>
            <button
              type="button"
              disabled={busy}
              className={buttonClasses}
              onClick={() =>
                run(async () => {
                  endpoint.setData(await updateWebhook(webhook.id, { active: !webhook.active }));
                }, 'Could not update the endpoint.')
              }
            >
              {webhook.active ? 'Disable' : 'Enable'}
            </button>
          </div>
        }
      />

      {notice ? <p className="mb-4 text-[13px] text-amber">{notice}</p> : null}

      <div className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-line bg-surface px-5 py-3.5">
        <StatusBadge status={webhook.active ? 'active' : 'disabled'} />
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-faint">{webhook.environment}</span>
        <span className="font-mono text-[11.5px] text-faint">
          Last delivery {webhook.last_delivery_at ? formatRelative(webhook.last_delivery_at) : 'never'}
        </span>
        <div className="flex flex-wrap gap-2">
          {webhook.events.map((event) => (
            <span key={event} className="rounded border border-line px-2 py-0.5 font-mono text-[11.5px] text-muted">
              {event}
            </span>
          ))}
        </div>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[14.5px] font-medium text-white">Recent deliveries</h2>
          <button
            type="button"
            onClick={deliveries.reload}
            className="inline-flex items-center gap-1.5 text-[12.5px] text-faint transition-colors duration-150 ease-out hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <RefreshCwIcon aria-hidden="true" className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>
        {deliveries.error ? (
          <ErrorState title="Could not load deliveries." description={deliveries.error} />
        ) : (
          <DataTable
            columns={columns}
            rows={deliveries.data ?? []}
            rowKey={(row) => row.id}
            loading={deliveries.loading && !deliveries.data}
            onRowClick={(row) => {
              setSelected(row);
              setTab('request');
            }}
            caption="Recent deliveries"
            empty={
              <EmptyState
                title="No deliveries yet."
                description="Deliveries appear here once an assessment event is sent to this endpoint. Send a test event to try it."
              />
            }
          />
        )}
      </section>

      {selected ? (
        <section className="mt-6 overflow-hidden rounded-xl border border-line bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3">
            <div className="flex items-center gap-3">
              <code className="font-mono text-[12.5px] text-white">{selected.event_id}</code>
              <StatusBadge status={selected.status} tone={deliveryTone[selected.status]} />
              <span className="font-mono text-[11.5px] text-faint">{formatDateTime(selected.created_at)}</span>
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

          <CodePre
            code={
              tab === 'request'
                ? JSON.stringify(selected.payload, null, 2)
                : tab === 'response'
                  ? responseFor(selected)
                  : headersFor(selected)
            }
            className="!px-5 !py-4 !text-[12.5px] !leading-[1.75]"
          />
        </section>
      ) : null}

      <Modal
        open={editing}
        title="Edit webhook endpoint"
        onClose={() => setEditing(false)}
        footer={
          <>
            <button type="button" onClick={() => setEditing(false)} className={buttonClasses}>
              Cancel
            </button>
            <button
              type="button"
              onClick={saveEdit}
              disabled={busy}
              className="rounded-lg bg-white px-3 py-1.5 text-[13px] font-medium text-black transition-colors duration-150 ease-out hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
            >
              Save
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div>
            <label htmlFor="edit-url" className="text-[13px] font-medium text-white">
              Endpoint URL
            </label>
            <input
              id="edit-url"
              value={editUrl}
              onChange={(event) => setEditUrl(event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-line bg-base px-3 font-mono text-[12.5px] text-white transition-colors duration-150 ease-out hover:border-line-strong focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <fieldset>
            <legend className="text-[13px] font-medium text-white">Events</legend>
            <div className="mt-2 space-y-2">
              {allEvents.map((event) => (
                <label key={event} className="flex items-center gap-2.5 font-mono text-[12.5px] text-muted">
                  <input
                    type="checkbox"
                    checked={editEvents.includes(event)}
                    onChange={() =>
                      setEditEvents((current) =>
                        current.includes(event) ? current.filter((item) => item !== event) : [...current, event]
                      )
                    }
                    className="h-3.5 w-3.5 rounded border-line-strong bg-base text-accent focus:ring-2 focus:ring-accent"
                  />
                  {event}
                </label>
              ))}
            </div>
          </fieldset>
          {editError ? <p className="text-[12.5px] text-amber">{editError}</p> : null}
        </div>
      </Modal>

      <SecretModal
        secret={secret}
        title="Signing secret rotated"
        description="The old secret stopped working immediately. Update your endpoint to verify signatures with this one."
        onClose={() => setSecret(null)}
      />
    </>
  );
}
