'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MenuIcon, XIcon } from 'lucide-react';
import { NavDropdown } from './NavDropdown';
import { Button } from '@/components/ui/Button';
import { navGroups } from '@/lib/content';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 8);
    }
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-base transition-colors duration-150 ease-out ${
        scrolled ? 'border-b border-line-soft' : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-14 max-w-shell items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <a
            href="#top"
            className="font-mono text-[13px] font-medium uppercase tracking-[0.2em] text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Codeverity
          </a>
          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {navGroups.map((group) => (
              <NavDropdown key={group.label} group={group} />
            ))}
            <Link
              href="/docs/introduction"
              className="rounded-md px-2 py-1.5 text-sm text-muted transition-colors duration-150 ease-out hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Docs
            </Link>
          </nav>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Button to="/login" variant="quiet" className="px-3">
            Sign in
          </Button>
          <Button to="/signup">Get started</Button>
        </div>

        <button
          type="button"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((value) => !value)}
          className="rounded-md p-2 text-muted transition-colors duration-150 ease-out hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:hidden"
        >
          {mobileOpen ? (
            <XIcon aria-hidden="true" className="h-5 w-5" />
          ) : (
            <MenuIcon aria-hidden="true" className="h-5 w-5" />
          )}
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-line-soft bg-base md:hidden">
          <nav aria-label="Mobile" className="mx-auto max-w-shell px-6 py-6">
            <ul className="space-y-6">
              {navGroups.map((group) => (
                <li key={group.label}>
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-faint">{group.label}</p>
                  <ul className="mt-2 space-y-1.5">
                    {group.items.map((item) => (
                      <li key={item.label}>
                        <a
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className="text-sm text-muted transition-colors duration-150 ease-out hover:text-white"
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-2">
              <Button to="/signup" onClick={() => setMobileOpen(false)}>
                Get started
              </Button>
              <Button to="/login" variant="secondary" onClick={() => setMobileOpen(false)}>
                Sign in
              </Button>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
