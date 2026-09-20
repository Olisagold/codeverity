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
    <div className={`code-frame overflow-hidden border border-line ${className}`}>
      <div className="code-frame__header flex items-center justify-between gap-4 px-6">
        <span className="code-frame__label">{label ?? 'Code'}</span>
        <CopyButton value={code} iconOnly />
      </div>
      <CodePre code={code} lineNumbers={lineNumbers} />
    </div>
  );
}
