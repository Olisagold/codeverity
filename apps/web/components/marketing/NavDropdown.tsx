'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDownIcon } from 'lucide-react';
import type { NavGroup } from '@/lib/content';

interface NavDropdownProps {
  group: NavGroup;
}

export function NavDropdown({ group }: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-muted transition-colors duration-150 ease-out hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        {group.label}
        <ChevronDownIcon
          aria-hidden="true"
          className={`h-3.5 w-3.5 text-faint transition-transform duration-150 ease-out ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open ? (
        <div className="absolute left-0 top-full w-56 pt-2">
          <ul className="rounded-lg border border-line bg-surface py-1.5">
            {group.items.map((item) => {
              const classes =
                'block px-3 py-1.5 text-sm text-muted transition-colors duration-150 ease-out hover:bg-surface-2 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent';
              return (
                <li key={item.label}>
                  {item.href.startsWith('/') ? (
                    <Link href={item.href} onClick={() => setOpen(false)} className={classes}>
                      {item.label}
                    </Link>
                  ) : (
                    <a href={item.href} onClick={() => setOpen(false)} className={classes}>
                      {item.label}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
