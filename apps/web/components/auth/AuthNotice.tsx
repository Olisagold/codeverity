import React from 'react';
import { CheckCircle2Icon, AlertCircleIcon } from 'lucide-react';

interface AuthNoticeProps {
  tone: 'success' | 'error';
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

/** Centered status panel used by the auth pages after a form completes:
 *  an icon in a soft circle, a heading, and a short explanation. */
export function AuthNotice({ tone, title, children, action }: AuthNoticeProps) {
  const Icon = tone === 'success' ? CheckCircle2Icon : AlertCircleIcon;
  const iconColor = tone === 'success' ? 'text-ok' : 'text-amber';
  const ringColor = tone === 'success' ? 'bg-ok/10' : 'bg-amber/10';

  return (
    <div className="flex flex-col items-center text-center" role="status" aria-live="polite">
      <div className={`flex h-[110px] w-[110px] items-center justify-center rounded-full ${ringColor}`}>
        <Icon aria-hidden="true" className={`h-10 w-10 ${iconColor}`} strokeWidth={1.75} />
      </div>
      <h2 className="mt-8 text-[22px] font-medium tracking-[-0.01em] text-white">{title}</h2>
      <div className="mt-4 max-w-[400px] text-[15px] leading-[1.7] text-muted">{children}</div>
      {action ? <div className="mt-8 w-full">{action}</div> : null}
    </div>
  );
}
