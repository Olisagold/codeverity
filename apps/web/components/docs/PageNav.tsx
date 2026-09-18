import React from 'react';
import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import type { DocPage } from '@/types/docs';

interface PageNavProps {
  previous?: DocPage;
  next?: DocPage;
}

export function PageNav({ previous, next }: PageNavProps) {
  if (!previous && !next) return null;

  return (
    <nav aria-label="Pagination" className="mt-16 grid gap-3 border-t border-line-soft pt-8 sm:grid-cols-2">
      {previous ? (
        <Link
          href={`/docs/${previous.slug}`}
          className="group rounded-xl border border-line bg-surface p-4 transition-colors duration-150 ease-out hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-faint">
            <ChevronLeftIcon aria-hidden="true" className="h-3.5 w-3.5" />
            Previous
          </span>
          <span className="mt-2 block text-[14px] text-white">{previous.title}</span>
        </Link>
      ) : (
        <span />
      )}

      {next ? (
        <Link
          href={`/docs/${next.slug}`}
          className="group rounded-xl border border-line bg-surface p-4 text-right transition-colors duration-150 ease-out hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          <span className="flex items-center justify-end gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-faint">
            Next
            <ChevronRightIcon aria-hidden="true" className="h-3.5 w-3.5" />
          </span>
          <span className="mt-2 block text-[14px] text-white">{next.title}</span>
        </Link>
      ) : null}
    </nav>
  );
}
