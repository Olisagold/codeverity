import React from 'react';

type Tone = 'success' | 'progress' | 'neutral' | 'error' | 'warning';

const tones: Record<Tone, { dot: string; text: string }> = {
  success: { dot: 'bg-ok', text: 'text-ok' },
  progress: { dot: 'bg-accent', text: 'text-accent' },
  neutral: { dot: 'bg-line-strong', text: 'text-faint' },
  error: { dot: 'bg-[#EF4444]', text: 'text-[#EF4444]' },
  warning: { dot: 'bg-amber', text: 'text-amber' },
};

const statusTones: Record<string, Tone> = {
  completed: 'success',
  active: 'success',
  processing: 'progress',
  queued: 'neutral',
  disabled: 'neutral',
  failed: 'error',
};

interface StatusBadgeProps {
  status: string;
  tone?: Tone;
}

export function StatusBadge({ status, tone }: StatusBadgeProps) {
  const resolved = tone ?? statusTones[status.toLowerCase()] ?? 'neutral';
  const style = tones[resolved];

  return (
    <span className={`inline-flex items-center gap-1.5 text-[12.5px] capitalize ${style.text}`}>
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
}
