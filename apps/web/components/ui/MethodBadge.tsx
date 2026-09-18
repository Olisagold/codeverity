import React from 'react';
import type { HttpMethod } from '@/types/docs';

const tones: Record<HttpMethod, string> = {
  GET: 'border-accent/40 text-accent',
  POST: 'border-ok/40 text-ok',
  DELETE: 'border-amber/40 text-amber',
};

export function MethodBadge({ method }: { method: HttpMethod }) {
  return (
    <span className={`rounded border px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.1em] ${tones[method]}`}>
      {method}
    </span>
  );
}
