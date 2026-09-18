import React from 'react';
import { CopyButton } from '@/components/ui/CopyButton';
import { highlight } from '@/lib/utils/highlight';

interface CodeBlockProps {
  code: string;
  label?: string;
  className?: string;
  bare?: boolean;
}

export function CodeBlock({ code, label, className = '', bare = false }: CodeBlockProps) {
  if (bare) {
    return (
      <pre className={`overflow-x-auto px-4 py-4 font-mono text-[12.5px] leading-6 text-muted ${className}`}>
        <code>{highlight(code)}</code>
      </pre>
    );
  }

  return (
    <div className={`overflow-hidden rounded-xl border border-line bg-surface ${className}`}>
      <div className="flex items-center justify-between gap-4 border-b border-line px-3 py-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-faint">{label ?? 'Code'}</span>
        <CopyButton value={code} />
      </div>
      <pre className="overflow-x-auto px-4 py-4 font-mono text-[12.5px] leading-6 text-muted">
        <code>{highlight(code)}</code>
      </pre>
    </div>
  );
}
