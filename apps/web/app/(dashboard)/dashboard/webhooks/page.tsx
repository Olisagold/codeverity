'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlusIcon } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { ErrorState } from '@/components/dashboard/ErrorState';
import { Skeleton } from '@/components/dashboard/Skeleton';
import { Modal } from '@/components/dashboard/Modal';
import { RowMenu } from '@/components/dashboard/RowMenu';
import { SecretModal } from '@/components/dashboard/SecretModal';
import { useApi } from '@/hooks/useApi';
import { errorMessage } from '@/lib/api/client';
import { createWebhook, deleteWebhook, listWebhooks, sendTestEvent, updateWebhook } from '@/lib/api/dashboard';
import { formatRelative } from '@/lib/format';
import type { Environment, Webhook, WebhookEvent } from '@/types/api';

const allEvents: WebhookEvent[] = ['assessment.completed', 'assessment.failed'];

const primaryButton =
  'rounded-lg bg-white px-3 py-1.5 text-[13px] font-medium text-black transition-colors duration-150 ease-out hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-50';
const secondaryButton =
  'rounded-lg border border-line px-3 py-1.5 text-[13px] text-muted transition-colors duration-150 ease-out hover:border-line-strong hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent';

export default function WebhooksPage() {
  const { data: endpoints, setData: setEndpoints, error: loadError, loading } = useApi(
    listWebhooks,
    [],
    'Could not load webhooks.'
  );
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [environment, setEnvironment] = useState<Environment>('live');
  const [events, setEvents] = useState<WebhookEvent[]>([...allEvents]);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Webhook | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const router = useRouter();

  function replace(updated: Webhook) {
    setEndpoints((current) => (current ?? []).map((item) => (item.id === updated.id ? updated : item)));
  }

  function toggleEvent(event: WebhookEvent) {
    setEvents((current) => (current.includes(event) ? current.filter((item) => item !== event) : [...current, event]));
  }

  async function handleCreate() {
    if (!/^https?:\/\/.+/.test(url.trim())) {
      setFormError('Enter a full URL, such as https://your-platform.com/webhooks.');
      return;
    }
    if (events.length === 0) {
      setFormError('Choose at least one event.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const created = await createWebhook({ url: url.trim(), environment, events });
      const { secret: signingSecret, ...endpoint } = created;
      setEndpoints((current) => [endpoint, ...(current ?? [])]);
      setOpen(false);
      setUrl('');
      setEvents([...allEvents]);
      setSecret(signingSecret);
    } catch (error) {
      setFormError(errorMessage(error, 'Could not create the endpoint.'));
    } finally {
      setSaving(false);
    }
  }

  async function run(action: () => Promise<void>, failure: string) {
    setNotice(null);
    try {
      await action();
    } catch (error) {
      setNotice(errorMessage(error, failure));
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    await run(async () => {
      await deleteWebhook(target.id);
      setEndpoints((current) => (current ?? []).filter((item) => item.id !== target.id));
    }, 'Could not delete the endpoint.');
  }

  function openCreate() {
    setFormError('');
    setOpen(true);
  }

  return (
    <>
      <PageHeader
        title="Webhooks"
        description="Receive real-time notifications when assessment events occur."
        actions={
          <button type="button" onClick={openCreate} className={`inline-flex items-center gap-1.5 ${primaryButton}`}>
            <PlusIcon aria-hidden="true" className="h-3.5 w-3.5" />
            Add endpoint
          </button>
        }
      />

      {notice ? <p className="mb-4 text-[13px] text-amber">{notice}</p> : null}

      {loadError ? (
        <ErrorState title="Could not load webhooks." description={loadError} />
      ) : loading && !endpoints ? (
        <Skeleton rows={4} />
      ) : (endpoints ?? []).length === 0 ? (
        <EmptyState
          title="No webhook endpoints configured."
          description="Add an endpoint to receive assessment events automatically."
          action={
            <button type="button" onClick={openCreate} className={primaryButton}>
              Add endpoint
            </button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {(endpoints ?? []).map((endpoint) => (
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
                      <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-faint">{endpoint.environment}</span>
                      <span className="font-mono text-[11.5px] text-faint">
                        Last delivery {endpoint.last_delivery_at ? formatRelative(endpoint.last_delivery_at) : 'never'}
                      </span>
                    </div>
                  </div>
                  <RowMenu
                    items={[
                      { label: 'View details', onSelect: () => router.push(`/dashboard/webhooks/${endpoint.id}`) },
                      {
                        label: 'Send test event',
                        onSelect: () =>
                          run(async () => {
                            await sendTestEvent(endpoint.id);
                            setNotice('Test event queued. Check the endpoint for the delivery.');
                          }, 'Could not send a test event.'),
                      },
                      {
                        label: endpoint.active ? 'Disable' : 'Enable',
                        onSelect: () =>
                          run(
                            async () => replace(await updateWebhook(endpoint.id, { active: !endpoint.active })),
                            'Could not update the endpoint.'
                          ),
                      },
                      { label: 'Delete', danger: true, onSelect: () => setDeleteTarget(endpoint) },
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
            <button type="button" onClick={() => setOpen(false)} className={secondaryButton}>
              Cancel
            </button>
            <button type="button" onClick={handleCreate} disabled={saving} className={primaryButton}>
              {saving ? 'Creating…' : 'Create endpoint'}
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
                setFormError('');
              }}
              placeholder="https://your-platform.com/webhooks"
              aria-invalid={Boolean(formError)}
              className={`mt-2 h-11 w-full rounded-lg border bg-base px-3 font-mono text-[12.5px] text-white placeholder:text-faint transition-colors duration-150 ease-out focus:outline-none focus:ring-1 ${
                formError ? 'border-amber focus:border-amber focus:ring-amber' : 'border-line hover:border-line-strong focus:border-accent focus:ring-accent'
              }`}
            />
            {formError ? <p className="mt-2 text-[12.5px] text-amber">{formError}</p> : null}
          </div>

          <fieldset>
            <legend className="text-[13px] font-medium text-white">Environment</legend>
            <p className="mt-1 text-[12.5px] text-faint">Events from assessments made with keys in this environment.</p>
            <div className="mt-2 flex gap-4">
              {(['live', 'test'] as const).map((value) => (
                <label key={value} className="flex items-center gap-2 font-mono text-[12.5px] capitalize text-muted">
                  <input
                    type="radio"
                    name="environment"
                    checked={environment === value}
                    onChange={() => setEnvironment(value)}
                    className="h-3.5 w-3.5 border-line-strong bg-base text-accent focus:ring-2 focus:ring-accent"
                  />
                  {value}
                </label>
              ))}
            </div>
          </fieldset>

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

      <Modal
        open={deleteTarget !== null}
        title="Delete webhook endpoint"
        onClose={() => setDeleteTarget(null)}
        footer={
          <>
            <button type="button" onClick={() => setDeleteTarget(null)} className={secondaryButton}>
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="rounded-lg bg-[#EF4444] px-3 py-1.5 text-[13px] font-medium text-white transition-colors duration-150 ease-out hover:bg-[#DC2626] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Delete
            </button>
          </>
        }
      >
        <p className="text-[13.5px] leading-relaxed text-muted">
          Events will stop being sent to <code className="font-mono text-[12.5px] text-white">{deleteTarget?.url}</code>,
          and its delivery history will be removed.
        </p>
      </Modal>

      <SecretModal
        secret={secret}
        title="Endpoint created"
        description="Use this signing secret to verify that events come from Codeverity. Store it somewhere secure."
        onClose={() => setSecret(null)}
      />
    </>
  );
}
