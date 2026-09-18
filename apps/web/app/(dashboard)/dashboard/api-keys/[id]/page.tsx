'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeftIcon } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { apiKeys } from '@/lib/dashboard';

export default function ApiKeyDetailsPage() {
  const params = useParams<{ id: string }>();
  const apiKey = apiKeys.find((item) => item.id === params.id);

  if (!apiKey) {
    return (
      <EmptyState
        title="API key not found."
        description="This key may have been revoked or belongs to another organization."
        action={
          <Link
            href="/dashboard/api-keys"
            className="rounded-lg border border-line-strong px-3.5 py-2 text-[13px] text-white transition-colors duration-150 ease-out hover:border-white/60"
          >
            Back to API keys
          </Link>
        }
      />
    );
  }

  const facts = [
    { label: 'Status', value: <StatusBadge status="active" /> },
    { label: 'Environment', value: apiKey.environment === 'live' ? 'Production' : 'Test' },
    { label: 'Key', value: <span className="font-mono text-[12.5px] text-white">{apiKey.masked}</span> },
    { label: 'Created', value: apiKey.created },
    { label: 'Last used', value: apiKey.lastUsed },
  ];

  return (
    <>
      <PageHeader
        breadcrumb={
          <Link
            href="/dashboard/api-keys"
            className="inline-flex items-center gap-1.5 font-mono text-[11.5px] uppercase tracking-[0.14em] text-faint transition-colors duration-150 ease-out hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <ChevronLeftIcon aria-hidden="true" className="h-3.5 w-3.5" />
            API keys
          </Link>
        }
        title={`${apiKey.name} API key`}
        description={apiKey.description || 'Credentials used to authenticate requests from your platform.'}
      />

      <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {facts.map((fact) => (
          <div key={fact.label} className="rounded-xl border border-line bg-surface p-4">
            <dt className="text-[12.5px] text-faint">{fact.label}</dt>
            <dd className="mt-2 text-[13.5px] text-white">{fact.value}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-8">
        <h2 className="mb-3 text-[14.5px] font-medium text-white">Usage</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <StatCard label="Requests" value={apiKey.requests.toLocaleString()} detail="all time" />
          <StatCard label="Assessments" value={apiKey.assessments.toLocaleString()} detail="all time" />
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-[#EF4444]/30 bg-surface">
        <div className="border-b border-line px-5 py-3.5">
          <h2 className="text-[14.5px] font-medium text-white">Danger zone</h2>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
          <p className="max-w-xl text-[13px] leading-relaxed text-muted">
            Revoking this API key will immediately prevent requests authenticated with it.
          </p>
          <button
            type="button"
            className="rounded-lg border border-[#EF4444]/50 px-3 py-1.5 text-[13px] text-[#EF4444] transition-colors duration-150 ease-out hover:border-[#EF4444] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Revoke API key
          </button>
        </div>
      </section>
    </>
  );
}
