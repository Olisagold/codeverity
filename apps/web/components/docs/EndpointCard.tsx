'use client';

import React, { useState } from 'react';
import { MethodBadge } from '@/components/ui/MethodBadge';
import { CopyButton } from '@/components/ui/CopyButton';
import { CodePre } from '@/components/ui/CodePre';
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
    <div className="flex flex-col gap-5">
      <div>
        <div className="flex min-w-0 flex-wrap items-center gap-2.5">
          <MethodBadge method={method} />
          <code className="truncate font-mono text-[14px] text-white">{path}</code>
        </div>
        {description ? <p className="mt-3 text-[14.5px] leading-relaxed text-muted">{description}</p> : null}
      </div>

      {/* Request */}
      <div className="code-frame overflow-hidden border border-line">
        <div role="tablist" aria-label="Request examples" className="code-frame__header flex items-center justify-between gap-4 px-6">
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
            {request.map((sample, index) => (
              <button
                key={sample.label}
                type="button"
                role="tab"
                aria-selected={index === active}
                onClick={() => setActive(index)}
                className="code-tab whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {sample.label}
              </button>
            ))}
          </div>
          <CopyButton value={current.code} iconOnly />
        </div>
        <CodePre code={current.code} />
      </div>

      {/* Response */}
      <div className="code-frame overflow-hidden border border-line">
        <div className="code-frame__header flex items-center justify-between gap-4 px-6">
          <div className="flex items-center gap-3">
            <span className="code-frame__label">Response</span>
            <span className="font-mono text-[12px] text-ok">{status}</span>
          </div>
          <CopyButton value={response} iconOnly />
        </div>
        <CodePre code={response} />
      </div>
    </div>
  );
}
