import React from 'react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { SettingsTabs, SettingsCard } from '@/components/dashboard/SettingsTabs';

export default function SettingsSecurityPage() {
  return (
    <>
      <PageHeader title="Settings" description="Manage your organization and account preferences." />

      <SettingsTabs />

      <SettingsCard title="Security">
        <ul className="divide-y divide-line-soft">
          {[
            { label: 'Password', detail: 'Last changed 14 days ago', action: 'Change password' },
            { label: 'Two-factor authentication', detail: 'Not configured', action: 'Enable 2FA' },
            { label: 'Sessions', detail: '2 active sessions', action: 'Sign out all' },
          ].map((item) => (
            <li key={item.label} className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0">
              <div>
                <p className="text-[13.5px] text-white">{item.label}</p>
                <p className="mt-0.5 text-[12.5px] text-faint">{item.detail}</p>
              </div>
              <button
                type="button"
                className="rounded-lg border border-line px-3 py-1.5 text-[13px] text-muted transition-colors duration-150 ease-out hover:border-line-strong hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {item.action}
              </button>
            </li>
          ))}
        </ul>
      </SettingsCard>
    </>
  );
}
