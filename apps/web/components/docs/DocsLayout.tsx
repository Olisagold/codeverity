import React from 'react';
import { DocsTopNav } from './DocsTopNav';
import { DocsSidebar } from './DocsSidebar';
import { TableOfContents } from './TableOfContents';

interface DocsLayoutProps {
  children: React.ReactNode;
  toc: { id: string; text: string }[];
}

export function DocsLayout({ children, toc }: DocsLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-base font-sans text-white">
      <DocsTopNav />

      <div className="mx-auto flex max-w-[1440px] px-4 sm:px-6">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto py-10 pr-6">
            <DocsSidebar />
          </div>
        </aside>

        <div className="min-w-0 flex-1 border-line-soft lg:border-l lg:pl-10">
          <div className="flex">
            <main className="min-w-0 flex-1 py-10 xl:pr-10">{children}</main>

            <div className="hidden w-56 shrink-0 py-10 xl:block">
              <TableOfContents items={toc} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
