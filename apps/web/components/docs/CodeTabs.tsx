'use client';

import React, { useState } from 'react';
import { CopyButton } from '@/components/ui/CopyButton';
import { highlight } from '@/lib/utils/highlight';
import type { CodeSample } from '@/types/docs';

interface CodeTabsProps {
  tabs: CodeSample[];
  className?: string;
}

export function CodeTabs({ tabs, className = '' }: CodeTabsProps) {
  const [active, setActive] = useState(0);
  const current = tabs[active];

  return (
    <div className={`overflow-hidden rounded-xl border border-line bg-surface ${className}`}>
      <div role="tablist" aria-label="Code examples" className="flex items-center justify-between border-b border-line pl-1 pr-2">
        <div className="flex items-center">
          {tabs.map((tab, index) => (
            <button
              key={tab.label}
              type="button"
              role="tab"
              aria-selected={index === active}
              onClick={() => setActive(index)}
              className={`relative px-3 py-2.5 font-mono text-[12px] transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent ${
                index === active ? 'text-white' : 'text-faint hover:text-muted'
              }`}
            >
              {tab.label}
              {index === active ? <span aria-hidden="true" className="absolute inset-x-2 -bottom-px h-px bg-accent" /> : null}
            </button>
          ))}
        </div>
        <CopyButton value={current.code} />
      </div>
      <pre className="overflow-x-auto px-4 py-4 font-mono text-[12.5px] leading-6 text-muted">
        <code>{highlight(current.code)}</code>
      </pre>
    </div>
  );
}
