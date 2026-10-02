'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BuildingIcon, ChevronsUpDownIcon, ExternalLinkIcon, LogOutIcon, SettingsIcon } from 'lucide-react';
import { useSession } from '@/hooks/useSession';
import { signOut } from '@/lib/api/dashboard';

interface NavItem {
  label: string;
  to?: string;
  href?: string;
  end?: boolean;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const sections: NavSection[] = [
  { items: [{ label: 'Overview', to: '/dashboard', end: true }] },
  {
    title: 'Develop',
    items: [
      { label: 'API Keys', to: '/dashboard/api-keys' },
      { label: 'Assessments', to: '/dashboard/assessments' },
      { label: 'Webhooks', to: '/dashboard/webhooks' },
    ],
  },
  {
    title: 'Monitor',
    items: [
      { label: 'Usage', to: '/dashboard/usage' },
      { label: 'Logs', to: '/dashboard/logs' },
    ],
  },
  {
    title: 'Resources',
    items: [
      { label: 'Documentation', href: '/docs/introduction' },
      { label: 'API Reference', href: '/docs/reference/endpoints' },
    ],
  },
  {
    title: 'Settings',
    items: [
      { label: 'General', to: '/dashboard/settings', end: true },
      { label: 'Organization', to: '/dashboard/settings/organization' },
      { label: 'Security', to: '/dashboard/settings/security' },
    ],
  },
];

const itemClasses =
  'block rounded-md px-2.5 py-1.5 text-[13.5px] transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent';

interface DashboardSidebarProps {
  onNavigate?: () => void;
}

export function DashboardSidebar({ onNavigate }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <nav aria-label="Dashboard" className="flex-1 space-y-6 py-6 pr-3">
        {sections.map((section, index) => (
          <div key={section.title ?? index}>
            {section.title ? (
              <p className="px-2.5 pb-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-faint">
                {section.title}
              </p>
            ) : null}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                if (item.to) {
                  const isActive = item.end ? pathname === item.to : pathname.startsWith(item.to);
                  return (
                    <li key={item.label}>
                      <Link
                        href={item.to}
                        onClick={onNavigate}
                        className={`${itemClasses} ${
                          isActive ? 'bg-surface-2 text-white' : 'text-muted hover:bg-surface hover:text-white'
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                }
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href ?? '/docs/introduction'}
                      onClick={onNavigate}
                      className={`${itemClasses} flex items-center justify-between text-muted hover:bg-surface hover:text-white`}
                    >
                      {item.label}
                      <ExternalLinkIcon aria-hidden="true" className="h-3 w-3 text-faint" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <AccountMenu onNavigate={onNavigate} />
    </div>
  );
}

const menuItem =
  'flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-muted transition-colors duration-150 ease-out hover:bg-surface-2 hover:text-white focus-visible:bg-surface-2 focus-visible:text-white focus-visible:outline-none';

/** Organization row at the foot of the sidebar. Opens upward with account actions. */
function AccountMenu({ onNavigate }: { onNavigate?: () => void }) {
  const session = useSession();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
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

  function close() {
    setOpen(false);
    onNavigate?.();
  }

  return (
    <div ref={ref} className="relative border-t border-line-soft py-3 pr-3">
      {open ? (
        <div
          role="menu"
          className="absolute bottom-full left-0 right-3 mb-1 overflow-hidden rounded-lg border border-line bg-surface shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
        >
          <div className="border-b border-line px-3 py-2.5">
            <p className="truncate text-[13px] text-white">{session?.user.name ?? ''}</p>
            <p className="truncate font-mono text-[11px] text-faint">{session?.user.email ?? ''}</p>
          </div>
          <div className="py-1">
            <Link role="menuitem" href="/dashboard/settings/organization" onClick={close} className={menuItem}>
              <BuildingIcon aria-hidden="true" className="h-3.5 w-3.5" />
              Organization
            </Link>
            <Link role="menuitem" href="/dashboard/settings" onClick={close} className={menuItem}>
              <SettingsIcon aria-hidden="true" className="h-3.5 w-3.5" />
              Settings
            </Link>
          </div>
          <div className="border-t border-line py-1">
            <button
              type="button"
              role="menuitem"
              disabled={signingOut}
              onClick={() => {
                setSigningOut(true);
                void signOut();
              }}
              className={`${menuItem} disabled:opacity-60`}
            >
              <LogOutIcon aria-hidden="true" className="h-3.5 w-3.5" />
              {signingOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={`flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left transition-colors duration-150 ease-out hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
          open ? 'bg-surface' : ''
        }`}
      >
        <span className="min-w-0">
          <span className="block truncate text-[13px] text-white">{session?.organization.name ?? '…'}</span>
          <span className="block truncate font-mono text-[11px] text-faint">{session?.organization.slug ?? ''}</span>
        </span>
        <ChevronsUpDownIcon aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-faint" />
      </button>
    </div>
  );
}
