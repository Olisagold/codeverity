'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { label: 'General', href: '/dashboard/settings' },
  { label: 'Organization', href: '/dashboard/settings/organization' },
  { label: 'Security', href: '/dashboard/settings/security' },
];

export function SettingsTabs() {
  const pathname = usePathname();

  return (
    <div className="mb-6 flex items-center gap-1 border-b border-line-soft">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.label}
            href={tab.href}
            className={`relative px-3 py-2 text-[13.5px] transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              isActive ? 'text-white' : 'text-faint hover:text-muted'
            }`}
          >
            {tab.label}
            {isActive ? <span aria-hidden="true" className="absolute inset-x-2 -bottom-px h-px bg-accent" /> : null}
          </Link>
        );
      })}
    </div>
  );
}

export function SettingsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="border-b border-line px-5 py-3.5">
        <h2 className="text-[14.5px] font-medium text-white">{title}</h2>
      </div>
      <div className="px-5 py-5">{children}</div>
    </section>
  );
}
