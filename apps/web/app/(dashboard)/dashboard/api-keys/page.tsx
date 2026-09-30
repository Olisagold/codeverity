'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2Icon, PlusIcon, TriangleAlertIcon } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { DataTable, type Column } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { RowMenu } from '@/components/dashboard/RowMenu';
import { Modal } from '@/components/dashboard/Modal';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { CopyButton } from '@/components/ui/CopyButton';
import { ApiKeyError, createApiKey, listApiKeys, revokeApiKey } from '@/lib/apiKeys';
import type { ApiKey } from '@/types/dashboard';

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<ApiKey | null>(null);
  const [revoking, setRevoking] = useState(false);
  const [revokeError, setRevokeError] = useState<string | null>(null);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [name, setName] = useState('Production');
  const [environment, setEnvironment] = useState<'test' | 'live'>('live');
  const [description, setDescription] = useState('');
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    listApiKeys()
      .then((data) => {
        if (!cancelled) setKeys(data);
      })
      .catch((error: unknown) => {
        if (!cancelled) setLoadError(error instanceof ApiKeyError ? error.message : 'Could not load API keys.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function openCreate() {
    setCreateError(null);
    setCreateOpen(true);
  }

  async function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) {
      setCreateError('Give the key a name.');
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {
      const { apiKey, secret } = await createApiKey({
        name: trimmed,
        environment,
        description: description.trim() || undefined,
      });
      setKeys((current) => [apiKey, ...current]);
      setCreateOpen(false);
      setCreatedKey(secret);
      setName('Production');
      setDescription('');
    } catch (error) {
      setCreateError(error instanceof ApiKeyError ? error.message : 'Could not create the API key.');
    } finally {
      setCreating(false);
    }
  }

  function askRevoke(key: ApiKey) {
    setRevokeError(null);
    setRevokeTarget(key);
  }

  async function confirmRevoke() {
    if (!revokeTarget) return;
    setRevoking(true);
    setRevokeError(null);
    try {
      await revokeApiKey(revokeTarget.id);
      setKeys((current) => current.filter((key) => key.id !== revokeTarget.id));
      setRevokeTarget(null);
    } catch (error) {
      setRevokeError(error instanceof ApiKeyError ? error.message : 'Could not revoke the API key.');
    } finally {
      setRevoking(false);
    }
  }

  const columns: Column<ApiKey>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (row) => (
        <div>
          <p className="text-[13px] text-white">{row.name}</p>
          {row.description ? <p className="mt-0.5 text-[12px] text-faint">{row.description}</p> : null}
        </div>
      ),
    },
    { key: 'key', header: 'Key', render: (row) => <span className="font-mono text-[12.5px]">{row.masked}</span> },
    {
      key: 'environment',
      header: 'Environment',
      render: (row) => (
        <span
          className={`rounded border px-1.5 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.1em] ${
            row.environment === 'live' ? 'border-ok/40 text-ok' : 'border-line-strong text-faint'
          }`}
        >
          {row.environment === 'live' ? 'production' : 'test'}
        </span>
      ),
    },
    { key: 'status', header: 'Status', render: () => <StatusBadge status="active" /> },
    {
      key: 'lastUsed',
      header: 'Last used',
      render: (row) => <span className="font-mono text-[12px] text-faint">{row.lastUsed}</span>,
    },
    {
      key: 'created',
      header: 'Created',
      render: (row) => <span className="font-mono text-[12px] text-faint">{row.created}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-10 text-right',
      render: (row) => (
        <RowMenu
          items={[
            { label: 'View details', onSelect: () => router.push(`/dashboard/api-keys/${row.id}`) },
            { label: 'Revoke', onSelect: () => askRevoke(row), danger: true },
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="API Keys"
        description="Manage the credentials used to authenticate requests to the Codeverity API."
        actions={
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[13px] font-medium text-black transition-colors duration-150 ease-out hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <PlusIcon aria-hidden="true" className="h-3.5 w-3.5" />
            Create API key
          </button>
        }
      />

      {loadError ? (
        <p role="alert" className="mb-4 rounded-lg border border-[#EF4444]/40 px-4 py-3 text-[13px] text-[#EF4444]">
          {loadError}
        </p>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-line bg-surface py-16 text-[13px] text-faint">
          <Loader2Icon aria-hidden="true" className="h-4 w-4 animate-spin" />
          Loading API keys
        </div>
      ) : (
      <DataTable
        columns={columns}
        rows={keys}
        rowKey={(row) => row.id}
        onRowClick={(row) => router.push(`/dashboard/api-keys/${row.id}`)}
        caption="API keys"
        empty={
          <EmptyState
            title="No API keys yet."
            description="Create an API key to start making requests to the Codeverity API."
            action={
              <button
                type="button"
                onClick={openCreate}
                className="rounded-lg bg-white px-3.5 py-2 text-[13px] font-medium text-black transition-colors duration-150 ease-out hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Create API key
              </button>
            }
          />
        }
      />
      )}

      <Modal
        open={createOpen}
        title="Create API key"
        onClose={() => setCreateOpen(false)}
        footer={
          <>
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="rounded-lg border border-line px-3 py-1.5 text-[13px] text-muted transition-colors duration-150 ease-out hover:border-line-strong hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[13px] font-medium text-black transition-colors duration-150 ease-out hover:bg-muted disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              {creating ? <Loader2Icon aria-hidden="true" className="h-3.5 w-3.5 animate-spin" /> : null}
              {creating ? 'Creating' : 'Create key'}
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div>
            <label htmlFor="key-name" className="text-[13px] font-medium text-white">
              Name
            </label>
            <input
              id="key-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={100}
              className="mt-2 h-11 w-full rounded-lg border border-line bg-base px-3 text-[13.5px] text-white placeholder:text-faint transition-colors duration-150 ease-out hover:border-line-strong focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <fieldset>
            <legend className="text-[13px] font-medium text-white">Environment</legend>
            <div className="mt-2 space-y-2">
              {(['test', 'live'] as const).map((value) => (
                <label key={value} className="flex items-center gap-2.5 text-[13.5px] text-muted">
                  <input
                    type="radio"
                    name="environment"
                    value={value}
                    checked={environment === value}
                    onChange={() => setEnvironment(value)}
                    className="h-3.5 w-3.5 border-line-strong bg-base text-accent focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black"
                  />
                  {value === 'test' ? 'Test' : 'Production'}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="key-description" className="text-[13px] font-medium text-white">
              Description <span className="text-faint">(optional)</span>
            </label>
            <input
              id="key-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Main production integration"
              maxLength={255}
              className="mt-2 h-11 w-full rounded-lg border border-line bg-base px-3 text-[13.5px] text-white placeholder:text-faint transition-colors duration-150 ease-out hover:border-line-strong focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {createError ? (
            <p role="alert" className="text-[13px] text-[#EF4444]">
              {createError}
            </p>
          ) : null}
        </div>
      </Modal>

      <Modal
        open={revokeTarget !== null}
        title="Revoke API key"
        onClose={() => (revoking ? undefined : setRevokeTarget(null))}
        footer={
          <>
            <button
              type="button"
              onClick={() => setRevokeTarget(null)}
              disabled={revoking}
              className="rounded-lg border border-line px-3 py-1.5 text-[13px] text-muted transition-colors duration-150 ease-out hover:border-line-strong hover:text-white disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmRevoke}
              disabled={revoking}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#EF4444] px-3 py-1.5 text-[13px] font-medium text-white transition-colors duration-150 ease-out hover:bg-[#DC2626] disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              {revoking ? <Loader2Icon aria-hidden="true" className="h-3.5 w-3.5 animate-spin" /> : null}
              {revoking ? 'Revoking' : 'Revoke key'}
            </button>
          </>
        }
      >
        <p className="text-[13.5px] leading-relaxed text-muted">
          Requests using <span className="font-mono text-[12.5px] text-white">{revokeTarget?.masked}</span> will stop
          working immediately. This can&apos;t be undone.
        </p>
        {revokeError ? (
          <p role="alert" className="mt-3 text-[13px] text-[#EF4444]">
            {revokeError}
          </p>
        ) : null}
      </Modal>

      <Modal
        open={createdKey !== null}
        title="API key created"
        onClose={() => setCreatedKey(null)}
        footer={
          <button
            type="button"
            onClick={() => setCreatedKey(null)}
            className="rounded-lg bg-white px-3 py-1.5 text-[13px] font-medium text-black transition-colors duration-150 ease-out hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Done
          </button>
        }
      >
        <p className="text-[13.5px] leading-relaxed text-muted">
          Your API key will only be shown once. Store it somewhere secure.
        </p>

        <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-line bg-base px-3 py-2.5">
          <code className="truncate font-mono text-[12.5px] text-white">{createdKey}</code>
          <CopyButton value={createdKey ?? ''} />
        </div>

        <p className="mt-4 flex items-start gap-2 text-[13px] text-amber">
          <TriangleAlertIcon aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          You won&apos;t be able to view this key again.
        </p>
      </Modal>
    </>
  );
}
