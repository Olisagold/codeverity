import React from 'react';
import { TriangleAlertIcon } from 'lucide-react';

interface ErrorStateProps {
  code?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function ErrorState({ code, title, description, action }: ErrorStateProps) {
  return (
    <div className="rounded-xl border border-[#EF4444]/30 bg-surface px-5 py-6">
      <div className="flex items-start gap-3">
        <TriangleAlertIcon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#EF4444]" />
        <div>
          {code ? <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#EF4444]">{code}</p> : null}
          <p className="mt-1 text-[14px] text-white">{title}</p>
          <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-muted">{description}</p>
          {action ? <div className="mt-4">{action}</div> : null}
        </div>
      </div>
    </div>
  );
}
