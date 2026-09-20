'use client';

import React, { useState } from 'react';
import { CopyButton } from '@/components/ui/CopyButton';
import { CodePre } from '@/components/ui/CodePre';
import type { CodeSample } from '@/types/docs';

interface CodeTabsProps {
  tabs: CodeSample[];
  className?: string;
}

export function CodeTabs({ tabs, className = '' }: CodeTabsProps) {
  const [active, setActive] = useState(0);
  const current = tabs[active];

  return (
    <div className={`code-frame overflow-hidden border border-line ${className}`}>
      <div role="tablist" aria-label="Code examples" className="code-frame__header flex items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
          {tabs.map((tab, index) => (
            <button
              key={tab.label}
              type="button"
              role="tab"
              aria-selected={index === active}
              onClick={() => setActive(index)}
              className="code-tab whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {tab.label}
            </button>
          ))}
        </div>
        <CopyButton value={current.code} iconOnly />
      </div>
      <CodePre code={current.code} />
    </div>
  );
}
