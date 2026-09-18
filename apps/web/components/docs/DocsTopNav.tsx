'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GithubIcon, MenuIcon, XIcon } from 'lucide-react';
import { DocsSearch } from './DocsSearch';
import { DocsSidebar } from './DocsSidebar';

const primary = [
  { label: 'Docs', href: '/docs/introduction' },
  { label: 'Guides', href: '/docs/guides/first-assessment' },
  { label: 'API Reference', href: '/docs/reference/endpoints' },
  { label: 'Research', href: '/docs/research/methodology' },
];

export function DocsTopNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-line-soft bg-base">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-6 px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((value) => !value)}
            className="rounded-md p-1.5 text-muted transition-colors duration-150 ease-out hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent lg:hidden"
          >
            {mobileOpen ? <XIcon aria-hidden="true" className="h-5 w-5" /> : <MenuIcon aria-hidden="true" className="h-5 w-5" />}
          </button>

          <Link
            href="/"
            className="flex items-baseline gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <span className="font-mono text-[13px] font-medium uppercase tracking-[0.2em] text-white">Codeverity</span>
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-faint">Docs</span>
          </Link>
        </div>

        <nav aria-label="Documentation sections" className="hidden items-center gap-1 md:flex">
          {primary.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`rounded-md px-2.5 py-1.5 text-[13.5px] transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isActive ? 'text-white' : 'text-muted hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden sm:block">
            <DocsSearch />
          </div>
          <a
            href="#"
            aria-label="GitHub"
            className="hidden rounded-md p-1.5 text-faint transition-colors duration-150 ease-out hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:block"
          >
            <GithubIcon aria-hidden="true" className="h-4 w-4" />
          </a>
          <span className="hidden items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-faint lg:flex">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-ok" />
            Status
          </span>
          <Link
            href="/dashboard"
            className="rounded-md bg-white px-3 py-1.5 text-[13px] font-medium text-black transition-colors duration-150 ease-out hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Dashboard
          </Link>
        </div>
      </div>

      {mobileOpen ? (
        <div className="max-h-[70vh] overflow-y-auto border-t border-line-soft bg-base px-4 py-6 lg:hidden">
          <div className="mb-6 sm:hidden">
            <DocsSearch />
          </div>
          <DocsSidebar onNavigate={() => setMobileOpen(false)} />
        </div>
      ) : null}
    </header>
  );
}
