import React from 'react';

interface DiagramProps {
  art: string;
  caption?: string;
}

export function Diagram({ art, caption }: DiagramProps) {
  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-surface">
      <pre className="overflow-x-auto px-5 py-5 font-mono text-[12px] leading-[1.7] text-muted">{art}</pre>
      {caption ? (
        <figcaption className="border-t border-line px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-faint">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
