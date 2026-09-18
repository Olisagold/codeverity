import React from 'react';

interface EyebrowProps {
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

export function Eyebrow({ children, dot = false, className = '' }: EyebrowProps) {
  return (
    <p className={`flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-faint ${className}`}>
      {dot ? <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" /> : null}
      {children}
    </p>
  );
}
