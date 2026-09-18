'use client';

import React, { useState } from 'react';
import { MethodBadge } from '@/components/ui/MethodBadge';
import { CopyButton } from '@/components/ui/CopyButton';
import { highlight } from '@/lib/utils/highlight';
import type { CodeSample, HttpMethod } from '@/types/docs';

interface EndpointCardProps {
  method: HttpMethod;
  path: string;
  description?: string;
  request: CodeSample[];
  response: string;
  status?: string;
}

export function EndpointCard({ method, path, description, request, response, status = '200 OK' }: EndpointCardProps) {
  const [active, setActive] = useState(0);
  const current = request[active];

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <MethodBadge method={method} />
          <code className="truncate font-mono text-[13px] text-white">{path}</code>
        </div>
        <CopyButton value={current.code} />
      </div>

      {description ? <p className="border-b border-line px-4 py-3 text-[13.5px] leading-relaxed text-muted">{description}</p> : null}

      <div className="grid lg:grid-cols-2">
        <div className="border-b border-line lg:border-b-0 lg:border-r">
          <div role="tablist" aria-label="Request examples" className="flex items-center border-b border-line pl-1">
            {request.map((sample, index) => (
              <button
                key={sample.label}
                type="button"
                role="tab"
                aria-selected={index === active}
                onClick={() => setActive(index)}
                className={`relative px-3 py-2.5 font-mono text-[12px] transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent ${
                  index === active ? 'text-white' : 'text-faint hover:text-muted'
                }`}
              >
                {sample.label}
                {index === active ? <span aria-hidden="true" className="absolute inset-x-2 -bottom-px h-px bg-accent" /> : null}
              </button>
            ))}
          </div>
          <pre className="overflow-x-auto px-4 py-4 font-mono text-[12.5px] leading-6 text-muted">
            <code>{highlight(current.code)}</code>
          </pre>
        </div>

        <div>
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-faint">Response</span>
            <span className="font-mono text-[11px] text-ok">{status}</span>
          </div>
          <pre className="overflow-x-auto px-4 py-4 font-mono text-[12.5px] leading-6 text-muted">
            <code>{highlight(response)}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
