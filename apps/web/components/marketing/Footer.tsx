import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { footerColumns } from '@/lib/content';

export function Footer() {
  return (
    <footer className="bg-base">
      <div className="mx-auto max-w-shell px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Image src="/icons/logo.png" alt="Codeverity" width={44} height={24} className="h-6 w-auto" />
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-faint">
              Multi-model code assessment through one API.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-4 lg:col-span-8">
            {footerColumns.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-faint">{column.title}</p>
                <ul className="mt-3 space-y-2">
                  {column.items.map((item) => {
                    const classes =
                      'text-[13px] text-muted transition-colors duration-150 ease-out hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black';
                    return (
                      <li key={item.label}>
                        {item.href.startsWith('/') ? (
                          <Link href={item.href} className={classes}>
                            {item.label}
                          </Link>
                        ) : (
                          <a href={item.href} className={classes}>
                            {item.label}
                          </a>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-12 border-t border-line-soft pt-6">
          <p className="font-mono text-[11px] text-faint">© 2026 Codeverity</p>
        </div>
      </div>
    </footer>
  );
}
