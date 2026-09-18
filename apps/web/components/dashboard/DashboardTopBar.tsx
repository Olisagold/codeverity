'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MenuIcon, SearchIcon, XIcon } from 'lucide-react';
import { currentUser } from '@/lib/dashboard';

interface DashboardTopBarProps {
  mobileOpen: boolean;
  onToggleMobile: () => void;
}

export function DashboardTopBar({ mobileOpen, onToggleMobile }: DashboardTopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-line-soft bg-base">
      <div className="flex h-14 items-center gap-4 px-4 sm:px-6">
        <button
          type="button"
          aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={mobileOpen}
          onClick={onToggleMobile}
          className="rounded-md p-1.5 text-muted transition-colors duration-150 ease-out hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent lg:hidden"
        >
          {mobileOpen ? (
            <XIcon aria-hidden="true" className="h-5 w-5" />
          ) : (
            <MenuIcon aria-hidden="true" className="h-5 w-5" />
          )}
        </button>

        <Link
          href="/dashboard"
          className="font-mono text-[13px] font-medium uppercase tracking-[0.2em] text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          Codeverity
        </Link>

        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            className="hidden h-8 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-[12.5px] text-faint transition-colors duration-150 ease-out hover:border-line-strong hover:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:flex"
          >
            <SearchIcon aria-hidden="true" className="h-3.5 w-3.5" />
            Search
            <kbd className="rounded border border-line px-1 py-0.5 font-mono text-[10px]">⌘K</kbd>
          </button>

          <Link
            href="/docs/introduction"
            className="hidden text-[13px] text-muted transition-colors duration-150 ease-out hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:block"
          >
            Docs
          </Link>

          <div ref={menuRef} className="relative">
            <button
              type="button"
              aria-haspopup="true"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((value) => !value)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface font-mono text-[11px] text-white transition-colors duration-150 ease-out hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {currentUser.initials}
            </button>

            {menuOpen ? (
              <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-lg border border-line bg-surface">
                <div className="border-b border-line px-3 py-2.5">
                  <p className="text-[13px] text-white">{currentUser.name}</p>
                  <p className="font-mono text-[11px] text-faint">{currentUser.email}</p>
                </div>
                <ul className="py-1">
                  <li>
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setMenuOpen(false)}
                      className="block px-3 py-1.5 text-[13px] text-muted transition-colors duration-150 ease-out hover:bg-surface-2 hover:text-white"
                    >
                      Settings
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/docs/introduction"
                      onClick={() => setMenuOpen(false)}
                      className="block px-3 py-1.5 text-[13px] text-muted transition-colors duration-150 ease-out hover:bg-surface-2 hover:text-white"
                    >
                      Documentation
                    </Link>
                  </li>
                </ul>
                <div className="border-t border-line py-1">
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-1.5 text-[13px] text-muted transition-colors duration-150 ease-out hover:bg-surface-2 hover:text-white"
                  >
                    Sign out
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
