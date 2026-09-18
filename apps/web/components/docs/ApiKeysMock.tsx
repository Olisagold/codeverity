import React from 'react';

const keys = [
  { name: 'Production API', value: 'sk_live_••••••••••••••••', created: 'Sep 18, 2026', used: '2 minutes ago', live: true },
  { name: 'Local development', value: 'sk_test_••••••••••••••••', created: 'Sep 12, 2026', used: '3 days ago', live: false },
];

export function ApiKeysMock() {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-faint">API keys</span>
        <span className="rounded-md border border-line-strong px-2 py-1 text-[12px] text-white">Create API key</span>
      </div>
      <ul className="divide-y divide-line">
        {keys.map((key) => (
          <li key={key.name} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-[13.5px] text-white">
                {key.name}
                <span
                  className={`rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] ${
                    key.live ? 'border-ok/40 text-ok' : 'border-line-strong text-faint'
                  }`}
                >
                  {key.live ? 'live' : 'test'}
                </span>
              </p>
              <p className="mt-1 font-mono text-[12.5px] text-muted">{key.value}</p>
              <p className="mt-1 font-mono text-[11px] text-faint">
                Created {key.created} · Last used {key.used}
              </p>
            </div>
            <span className="rounded-md border border-line px-2.5 py-1 text-[12px] text-muted">Revoke</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
