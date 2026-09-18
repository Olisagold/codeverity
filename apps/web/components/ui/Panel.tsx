import React from 'react';

interface PanelProps {
  children: React.ReactNode;
  label?: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function Panel({ children, label, trailing, className = '', bodyClassName = '' }: PanelProps) {
  return (
    <div className={`overflow-hidden rounded-xl border border-line bg-surface ${className}`}>
      {label ? (
        <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-faint">
            {label}
          </div>
          {trailing ? <div className="flex shrink-0 items-center gap-2">{trailing}</div> : null}
        </div>
      ) : null}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}
