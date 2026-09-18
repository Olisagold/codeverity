import React from 'react';
import { ArrowRightIcon } from 'lucide-react';

const statuses = [
  { label: 'queued', detail: 'Accepted and waiting' },
  { label: 'processing', detail: 'Models and reassessment running' },
  { label: 'completed', detail: 'Result available' },
];

export function StatusFlow() {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        {statuses.map((status, index) => (
          <React.Fragment key={status.label}>
            {index > 0 ? <ArrowRightIcon aria-hidden="true" className="hidden h-4 w-4 self-center text-faint sm:block" /> : null}
            <div className="flex-1 rounded-lg border border-line-soft bg-base px-4 py-3">
              <p className="font-mono text-[12.5px] text-white">{status.label}</p>
              <p className="mt-1 text-[12.5px] text-faint">{status.detail}</p>
            </div>
          </React.Fragment>
        ))}
      </div>
      <p className="mt-3 text-[12.5px] text-faint">
        An assessment that cannot be completed ends in <code className="font-mono text-[12px] text-amber">failed</code> instead of{' '}
        <code className="font-mono text-[12px] text-white">completed</code>.
      </p>
    </div>
  );
}
