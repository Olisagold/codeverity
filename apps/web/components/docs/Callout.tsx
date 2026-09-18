import React from 'react';
import { InfoIcon, TriangleAlertIcon } from 'lucide-react';

interface CalloutProps {
  tone: 'info' | 'warning';
  title?: string;
  children: React.ReactNode;
}

export function Callout({ tone, title, children }: CalloutProps) {
  const Icon = tone === 'warning' ? TriangleAlertIcon : InfoIcon;

  return (
    <div className={`flex gap-3 rounded-xl border bg-surface px-4 py-4 ${tone === 'warning' ? 'border-amber/40' : 'border-line'}`}>
      <Icon aria-hidden="true" className={`mt-0.5 h-4 w-4 shrink-0 ${tone === 'warning' ? 'text-amber' : 'text-accent'}`} />
      <div>
        {title ? <p className="text-[13.5px] font-medium text-white">{title}</p> : null}
        <div className={`text-[13.5px] leading-relaxed text-muted ${title ? 'mt-1' : ''}`}>{children}</div>
      </div>
    </div>
  );
}
