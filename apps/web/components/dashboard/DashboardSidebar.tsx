'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronsUpDownIcon, ExternalLinkIcon } from 'lucide-react';
import { organization } from '@/lib/dashboard';

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

      <div className="border-t border-line-soft py-3 pr-3">
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left transition-colors duration-150 ease-out hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <span className="min-w-0">
            <span className="block truncate text-[13px] text-white">{organization.name}</span>
            <span className="block truncate font-mono text-[11px] text-faint">{organization.slug}</span>
          </span>
          <ChevronsUpDownIcon aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-faint" />
        </button>
      </div>
    </div>
  );
}
