'use client';

import React, { useEffect, useState } from 'react';
import { ListIcon } from 'lucide-react';

interface TableOfContentsProps {
  items: { id: string; text: string }[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? '');

  useEffect(() => {
    if (items.length === 0) return;
    setActiveId(items[0].id);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    );

    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="On this page" className="sticky top-24">
      <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-faint">
        <ListIcon aria-hidden="true" className="h-3.5 w-3.5" />
        On this page
      </p>
      <ul className="mt-4 space-y-1 border-l border-line-soft">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={activeId === item.id ? 'true' : undefined}
              className={`-ml-px block border-l py-1 pl-3 text-[13px] transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                activeId === item.id ? 'border-accent text-white' : 'border-transparent text-faint hover:text-muted'
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
