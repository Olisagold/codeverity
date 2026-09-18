import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRightIcon } from 'lucide-react';
import { footerColumns } from '@/lib/content';
import { SocialMark } from '@/components/ui/SocialMarks';

const linkClasses =
  'group inline-flex items-center gap-2 text-[15px] text-muted transition-colors duration-150 ease-out hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black';

export function Footer() {
  return (
    <footer className="bg-base">
      <div className="mx-auto max-w-shell px-6 pb-16 pt-6">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link href="/" aria-label="Codeverity home" className="inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
              <Image src="/icons/logo.png" alt="Codeverity" width={52} height={30} className="h-7 w-auto" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4 lg:col-span-8">
            {footerColumns.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <p className="text-[15px] font-medium text-white">{column.title}</p>
                <ul className="mt-5 space-y-3.5">
                  {column.items.map((item) => {
                    const content = (
                      <>
                        {item.icon ? <SocialMark id={item.icon} className="h-4 w-4" /> : null}
                        {item.label}
                        {item.external && !item.icon ? (
                          <ArrowUpRightIcon aria-hidden="true" className="h-3.5 w-3.5 text-faint transition-colors group-hover:text-white" />
                        ) : null}
                      </>
                    );
                    return (
                      <li key={item.label}>
                        {item.external || !item.href.startsWith('/') ? (
                          <a
                            href={item.href}
                            className={linkClasses}
                            {...(item.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
                          >
                            {content}
                          </a>
                        ) : (
                          <Link href={item.href} className={linkClasses}>
                            {content}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <p className="mt-16 font-mono text-[11px] text-faint">© 2026 Codeverity</p>
      </div>
    </footer>
  );
}
