'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { docsNav } from '@/lib/docs';

interface DocsSidebarProps {
  onNavigate?: () => void;
}

export function DocsSidebar({ onNavigate }: DocsSidebarProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Documentation" className="space-y-8 pb-16">
      {docsNav.map((group) => (
        <div key={group.title}>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-faint">{group.title}</p>
          <ul className="mt-3 space-y-0.5 border-l border-line-soft">
            {group.items.map((item) => {
              const href = `/docs/${item.slug}`;
              const isActive = pathname === href;
              return (
                <li key={item.slug}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    className={`-ml-px block border-l py-1.5 pl-3 text-[13.5px] transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent ${
                      isActive ? 'border-accent text-white' : 'border-transparent text-muted hover:border-line-strong hover:text-white'
                    }`}
                  >
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
