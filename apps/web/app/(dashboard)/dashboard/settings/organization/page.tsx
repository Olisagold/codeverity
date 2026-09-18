import React from 'react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { SettingsTabs, SettingsCard } from '@/components/dashboard/SettingsTabs';
import { organization } from '@/lib/dashboard';

export default function SettingsOrganizationPage() {
  return (
    <>
      <PageHeader title="Settings" description="Manage your organization and account preferences." />

      <SettingsTabs />

      <div className="space-y-4">
        <SettingsCard title="Organization">
          <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-3">
            {[
              { label: 'Name', value: organization.name },
              { label: 'Created', value: organization.created },
              { label: 'Organization ID', value: organization.id },
            ].map((item) => (
              <div key={item.label}>
                <dt className="text-[12.5px] text-faint">{item.label}</dt>
                <dd className="mt-1.5 font-mono text-[12.5px] text-white">{item.value}</dd>
              </div>
            ))}
          </dl>
        </SettingsCard>

        <SettingsCard title="Members">
          <ul className="divide-y divide-line-soft">
            {organization.members.map((member) => (
              <li key={member.email} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-[13.5px] text-white">{member.name}</p>
                  <p className="font-mono text-[11.5px] text-faint">{member.email}</p>
                </div>
                <span className="rounded border border-line px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
                  {member.role}
                </span>
              </li>
            ))}
          </ul>
        </SettingsCard>
      </div>
    </>
  );
}
