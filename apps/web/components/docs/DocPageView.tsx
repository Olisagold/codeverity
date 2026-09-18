'use client';

import React, { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { DocsLayout } from './DocsLayout';
import { BlockRenderer } from './BlockRenderer';
import { PageNav } from './PageNav';
import { getDocPage, getSiblings } from '@/lib/docs';

interface DocPageViewProps {
  slug: string;
}

export function DocPageView({ slug }: DocPageViewProps) {
  const page = getDocPage(slug);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [slug]);

  const toc = useMemo(
    () =>
      page
        ? page.blocks
            .filter((block): block is { type: 'heading'; id: string; text: string } => block.type === 'heading')
            .map((block) => ({ id: block.id, text: block.text }))
        : [],
    [page]
  );

  if (!page) {
    return (
      <DocsLayout toc={[]}>
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-faint">404</p>
        <h1 className="mt-4 text-[30px] font-medium tracking-[-0.02em] text-white">Page not found</h1>
        <p className="mt-3 text-[14.5px] text-muted">
          The documentation page <code className="font-mono text-[13px] text-white">/docs/{slug}</code> does not exist.
        </p>
        <Link
          href="/docs/introduction"
          className="mt-6 inline-block text-[14px] text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Back to the introduction
        </Link>
      </DocsLayout>
    );
  }

  const { previous, next } = getSiblings(slug);

  return (
    <DocsLayout toc={toc}>
      <article className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-faint">{page.section}</p>
        <h1 className="mt-3 text-[30px] font-medium leading-tight tracking-[-0.02em] text-white sm:text-[34px]">{page.title}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{page.description}</p>

        <div className="mt-10">
          <BlockRenderer blocks={page.blocks} />
        </div>

        <PageNav previous={previous} next={next} />
      </article>
    </DocsLayout>
  );
}
