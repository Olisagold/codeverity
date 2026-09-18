'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PlusIcon } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { Modal } from '@/components/dashboard/Modal';
import { RowMenu } from '@/components/dashboard/RowMenu';
import { webhooks as seedWebhooks } from '@/lib/dashboard';
import type { WebhookEndpoint } from '@/types/dashboard';

const allEvents = ['assessment.completed', 'assessment.failed'];

export default function WebhooksPage() {
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>(seedWebhooks);
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [events, setEvents] = useState<string[]>(['assessment.completed']);
  const [error, setError] = useState('');

  function toggleEvent(event: string) {
    setEvents((current) => (current.includes(event) ? current.filter((item) => item !== event) : [...current, event]));
  }

  function handleCreate() {
    if (!/^https:\/\/.+/.test(url.trim())) {
      setError('Enter an HTTPS endpoint URL.');
      return;
    }
    setEndpoints((current) => [
      {
        id: `whk_${Math.random().toString(36).slice(2, 7)}`,
        url: url.trim(),
        active: true,
        events,
        lastDelivery: 'No deliveries yet',
        deliveries: [],
      },
      ...current,
    ]);
    setUrl('');
    setEvents(['assessment.completed']);
    setError('');
    setOpen(false);
  }

  return (
    <>
      <PageHeader
        title="Webhooks"
        description="Receive real-time notifications when assessment events occur."
        actions={
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[13px] font-medium text-black transition-colors duration-150 ease-out hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <PlusIcon aria-hidden="true" className="h-3.5 w-3.5" />
            Add endpoint
          </button>
        }
      />

      {endpoints.length === 0 ? (
        <EmptyState
          title="No webhook endpoints configured."
          description="Add an endpoint to receive assessment events automatically."
          action={
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-lg bg-white px-3.5 py-2 text-[13px] font-medium text-black transition-colors duration-150 ease-out hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Add endpoint
            </button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {endpoints.map((endpoint) => (
            <li key={endpoint.id}>
              <div className="rounded-xl border border-line bg-surface">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-3.5">
                  <div className="min-w-0">
                    <Link
                      href={`/dashboard/webhooks/${endpoint.id}`}
                      className="block truncate font-mono text-[13px] text-white underline-offset-4 transition-colors duration-150 ease-out hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      {endpoint.url}
                    </Link>
                    <div className="mt-1.5 flex items-center gap-3">
                      <StatusBadge status={endpoint.active ? 'active' : 'disabled'} />
                      <span className="font-mono text-[11.5px] text-faint">Last delivery {endpoint.lastDelivery}</span>
                    </div>
                  </div>
                  <RowMenu
                    items={[
                      { label: 'View details', onSelect: () => undefined },
                      { label: 'Disable', onSelect: () => undefined },
                      {
                        label: 'Delete',
                        danger: true,
                        onSelect: () => setEndpoints((current) => current.filter((item) => item.id !== endpoint.id)),
                      },
                    ]}
                  />
                </div>
                <div className="flex flex-wrap gap-2 px-5 py-3.5">
                  {endpoint.events.map((event) => (
                    <span key={event} className="rounded border border-line px-2 py-0.5 font-mono text-[11.5px] text-muted">
                      {event}
                    </span>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={open}
        title="Add webhook endpoint"
        onClose={() => setOpen(false)}
        footer={
          <>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-line px-3 py-1.5 text-[13px] text-muted transition-colors duration-150 ease-out hover:border-line-strong hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreate}
              className="rounded-lg bg-white px-3 py-1.5 text-[13px] font-medium text-black transition-colors duration-150 ease-out hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Create endpoint
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div>
            <label htmlFor="endpoint-url" className="text-[13px] font-medium text-white">
              Endpoint URL
            </label>
            <input
              id="endpoint-url"
              value={url}
              onChange={(event) => {
                setUrl(event.target.value);
                setError('');
              }}
              placeholder="https://your-platform.com/webhooks"
              aria-invalid={Boolean(error)}
              className={`mt-2 h-11 w-full rounded-lg border bg-base px-3 font-mono text-[12.5px] text-white placeholder:text-faint transition-colors duration-150 ease-out focus:outline-none focus:ring-1 ${
                error ? 'border-amber focus:border-amber focus:ring-amber' : 'border-line hover:border-line-strong focus:border-accent focus:ring-accent'
              }`}
            />
            {error ? <p className="mt-2 text-[12.5px] text-amber">{error}</p> : null}
          </div>

          <fieldset>
            <legend className="text-[13px] font-medium text-white">Events</legend>
            <div className="mt-2 space-y-2">
              {allEvents.map((event) => (
                <label key={event} className="flex items-center gap-2.5 font-mono text-[12.5px] text-muted">
                  <input
                    type="checkbox"
                    checked={events.includes(event)}
                    onChange={() => toggleEvent(event)}
                    className="h-3.5 w-3.5 rounded border-line-strong bg-base text-accent focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black"
                  />
                  {event}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </Modal>
    </>
  );
}
