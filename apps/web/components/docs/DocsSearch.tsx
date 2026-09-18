'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SearchIcon, XIcon } from 'lucide-react';
import { docsPages } from '@/lib/docs';

export function DocsSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    const pages = term
      ? docsPages.filter(
          (page) =>
            page.title.toLowerCase().includes(term) ||
            page.description.toLowerCase().includes(term) ||
            page.section.toLowerCase().includes(term)
        )
      : docsPages;
    return pages.slice(0, 8);
  }, [query]);

  function go(slug: string) {
    setOpen(false);
    setQuery('');
    router.push(`/docs/${slug}`);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 w-full items-center gap-2 rounded-lg border border-line bg-surface px-3 text-[13px] text-faint transition-colors duration-150 ease-out hover:border-line-strong hover:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent lg:w-64"
      >
        <SearchIcon aria-hidden="true" className="h-3.5 w-3.5" />
        <span className="flex-1 text-left">Search documentation…</span>
        <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-faint">⌘K</kbd>
      </button>

      {open ? (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/80 px-4 pt-[12vh]">
          <div role="dialog" aria-modal="true" aria-label="Search documentation" className="w-full max-w-xl overflow-hidden rounded-xl border border-line bg-surface">
            <div className="flex items-center gap-3 border-b border-line px-4">
              <SearchIcon aria-hidden="true" className="h-4 w-4 text-faint" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search documentation…"
                className="h-12 flex-1 bg-transparent text-[14px] text-white placeholder:text-faint focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close search"
                className="rounded-md p-1.5 text-faint transition-colors duration-150 ease-out hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <XIcon aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>

            {results.length > 0 ? (
              <ul className="max-h-[50vh] overflow-y-auto py-2">
                {results.map((page) => (
                  <li key={page.slug}>
                    <button
                      type="button"
                      onClick={() => go(page.slug)}
                      className="flex w-full flex-col items-start gap-0.5 px-4 py-2.5 text-left transition-colors duration-150 ease-out hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
                    >
                      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-faint">{page.section}</span>
                      <span className="text-[14px] text-white">{page.title}</span>
                      <span className="line-clamp-1 text-[12.5px] text-faint">{page.description}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-8 text-center text-[13px] text-faint">No pages match &ldquo;{query}&rdquo;.</p>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
