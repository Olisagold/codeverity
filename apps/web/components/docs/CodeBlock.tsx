import React from 'react';
import { CopyButton } from '@/components/ui/CopyButton';
import { CodePre } from '@/components/ui/CodePre';

interface CodeBlockProps {
  code: string;
  label?: string;
  className?: string;
  bare?: boolean;
  lineNumbers?: boolean;
}

export function CodeBlock({ code, label, className = '', bare = false, lineNumbers }: CodeBlockProps) {
  if (bare) {
    return <CodePre code={code} lineNumbers={lineNumbers} className={className} />;
  }

  return (
    <div className={`code-frame overflow-hidden rounded-xl border border-line ${className}`}>
      <div className="code-frame__header flex items-center justify-between gap-4 border-b border-line px-3 py-2">
        <div className="flex items-center gap-2.5">
          <span aria-hidden="true" className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#3f3f46]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#3f3f46]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#3f3f46]" />
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-faint">{label ?? 'Code'}</span>
        </div>
        <CopyButton value={code} />
      </div>
      <CodePre code={code} lineNumbers={lineNumbers} />
    </div>
  );
}
